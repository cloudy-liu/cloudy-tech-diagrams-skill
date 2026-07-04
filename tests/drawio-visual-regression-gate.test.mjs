import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const toolPath = join(repoRoot, 'tools/drawio-visual-regression.mjs');

function gateConfigFixture() {
  return {
    version: 1,
    renderers: {
      html: {
        engine: 'playwright-chromium',
        selector: '#report-container',
        excludeSelectors: ['.toolbar', '.cards', '.footer'],
        viewport: {
          width: 1200,
          height: 900
        },
        deviceScaleFactor: 1,
        colorScheme: 'light'
      },
      drawio: {
        engine: 'diagrams-net-desktop-cli',
        command: 'draw.io --export --format png --output <drawioPng> <drawioFile>'
      }
    },
    thresholds: {
      maxPixelMismatchRatio: 0.015,
      perChannelTolerance: 3,
      maxAverageChannelDelta: 2
    },
    ci: {
      defaultMode: 'config-validation-only',
      releaseGateEnv: 'DRAWIO_VISUAL_GATE=1'
    },
    samples: [
      {
        id: 'drawio-fidelity-torture',
        html: 'examples/drawio-fidelity-torture.html',
        selector: '#report-container',
        excludeSelectors: ['.toolbar', '.cards', '.footer'],
        artifacts: {
          drawioFile: 'dist/drawio-visual/drawio-fidelity-torture.drawio',
          htmlPng: 'dist/drawio-visual/drawio-fidelity-torture.html.png',
          drawioPng: 'dist/drawio-visual/drawio-fidelity-torture.drawio.png'
        }
      },
      {
        id: 'perfetto-docs-architecture',
        html: 'examples/perfetto-docs-architecture.html',
        selector: '#report-container',
        excludeSelectors: ['.toolbar', '.cards', '.footer'],
        artifacts: {
          drawioFile: 'dist/drawio-visual/perfetto-docs-architecture.drawio',
          htmlPng: 'dist/drawio-visual/perfetto-docs-architecture.html.png',
          drawioPng: 'dist/drawio-visual/perfetto-docs-architecture.drawio.png'
        }
      },
      {
        id: 'runtime-mechanism',
        html: 'examples/runtime-mechanism.html',
        selector: '#report-container',
        excludeSelectors: ['.toolbar', '.cards', '.footer'],
        artifacts: {
          drawioFile: 'dist/drawio-visual/runtime-mechanism.drawio',
          htmlPng: 'dist/drawio-visual/runtime-mechanism.html.png',
          drawioPng: 'dist/drawio-visual/runtime-mechanism.drawio.png'
        }
      }
    ],
    knownLimitations: [
      'font rendering can differ slightly across operating systems and Chromium builds',
      'draw.io arrowhead and dash rendering are editable-native approximations of SVG markers and stroke-dasharray',
      'the gate compares the controlled report export and intentionally excludes toolbar UI, footer metadata, and page-support cards',
      'the release gate should be run on pinned renderer versions before release, not as an unconditional PR check'
    ]
  };
}

function writeGateConfigFixture() {
  const workDir = mkdtempSync(join(tmpdir(), 'drawio-visual-config-'));
  const configPath = join(workDir, 'drawio-gate.config.json');
  writeFileSync(configPath, JSON.stringify(gateConfigFixture(), null, 2));
  return { workDir, configPath };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width, height, rgbaPixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    Buffer.from(rgbaPixels.slice(y * stride, (y + 1) * stride)).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND')
  ]);
}

async function loadTool() {
  try {
    return await import(`${new URL('../tools/drawio-visual-regression.mjs', import.meta.url).href}?t=${Date.now()}`);
  } catch (error) {
    assert.fail(`expected Draw.io visual regression tool to load: ${error.message}`);
  }
}

test('visual regression gate config selects a stable release rendering path', () => {
  const config = gateConfigFixture();

  assert.equal(config.version, 1);
  assert.equal(config.renderers.html.engine, 'playwright-chromium');
  assert.equal(config.renderers.html.selector, '#report-container');
  assert.deepEqual(config.renderers.html.excludeSelectors, ['.toolbar', '.cards', '.footer']);
  assert.equal(config.renderers.html.viewport.width, 1200);
  assert.equal(config.renderers.html.viewport.height, 900);
  assert.equal(config.renderers.html.deviceScaleFactor, 1);
  assert.equal(config.renderers.drawio.engine, 'diagrams-net-desktop-cli');
  assert.match(config.renderers.drawio.command, /--export/);
  assert.match(config.renderers.drawio.command, /--format png/);

  assert.equal(config.thresholds.maxPixelMismatchRatio, 0.015);
  assert.equal(config.thresholds.perChannelTolerance, 3);
  assert.equal(config.thresholds.maxAverageChannelDelta, 2);
  assert.equal(config.ci.defaultMode, 'config-validation-only');
  assert.match(config.ci.releaseGateEnv, /DRAWIO_VISUAL_GATE=1/);
  assert.ok(config.knownLimitations.some((item) => /font rendering/i.test(item)));

  const sampleIds = config.samples.map((sample) => sample.id);
  assert.deepEqual(sampleIds, ['drawio-fidelity-torture', 'perfetto-docs-architecture', 'runtime-mechanism']);
  for (const sample of config.samples) {
    assert.ok(existsSync(join(repoRoot, sample.html)), `${sample.html} should exist`);
    assert.equal(sample.selector, '#report-container');
    assert.deepEqual(sample.excludeSelectors, ['.toolbar', '.cards', '.footer']);
    assert.match(sample.artifacts.htmlPng, /^dist\/drawio-visual\//);
    assert.match(sample.artifacts.drawioPng, /^dist\/drawio-visual\//);
  }
});

test('skill defines the Draw.io visual regression gate and non-flaky CI policy', () => {
  const doc = readFileSync(join(repoRoot, 'SKILL.md'), 'utf8');

  assert.match(doc, /Draw\.io Visual Regression Gate/);
  assert.match(doc, /Playwright Chromium/);
  assert.match(doc, /diagrams\.net Desktop CLI/);
  assert.match(doc, /maxPixelMismatchRatio/);
  assert.match(doc, /DRAWIO_VISUAL_GATE=1/);
  assert.match(doc, /release validation/i);
  assert.match(doc, /CI flaky|flaky CI/i);
});

test('visual regression tool validates configured acceptance samples without requiring screenshots in CI', async () => {
  const { loadGateConfig, validateGateConfig } = await loadTool();
  const { workDir, configPath } = writeGateConfigFixture();
  try {
    const config = loadGateConfig(configPath);
    const result = validateGateConfig(config, { repoRoot, requireArtifacts: false });

    assert.equal(result.ok, true);
    assert.deepEqual(result.sampleIds, ['drawio-fidelity-torture', 'perfetto-docs-architecture', 'runtime-mechanism']);
    assert.deepEqual(result.missingArtifacts, []);
    assert.equal(result.releaseGateEnv, 'DRAWIO_VISUAL_GATE=1');
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});

test('visual regression tool compares HTML and Draw.io PNG screenshots with thresholds', async () => {
  const { comparePngBuffers } = await loadTool();
  const baseline = encodePng(2, 1, [
    0, 0, 0, 255,
    255, 255, 255, 255
  ]);
  const withinTolerance = encodePng(2, 1, [
    0, 0, 0, 255,
    253, 253, 253, 255
  ]);
  const visibleRegression = encodePng(2, 1, [
    0, 0, 0, 255,
    200, 200, 200, 255
  ]);

  const passing = comparePngBuffers(baseline, withinTolerance, {
    maxPixelMismatchRatio: 0.015,
    perChannelTolerance: 3,
    maxAverageChannelDelta: 2
  });
  assert.equal(passing.passed, true);
  assert.equal(passing.mismatchedPixels, 0);

  const failing = comparePngBuffers(baseline, visibleRegression, {
    maxPixelMismatchRatio: 0.015,
    perChannelTolerance: 3,
    maxAverageChannelDelta: 2
  });
  assert.equal(failing.passed, false);
  assert.equal(failing.mismatchedPixels, 1);
  assert.equal(failing.totalPixels, 2);
  assert.equal(failing.mismatchRatio, 0.5);
  assert.ok(failing.maxChannelDelta >= 55);
});

test('visual regression CLI can compare screenshot artifact files', () => {
  const workDir = mkdtempSync(join(tmpdir(), 'drawio-visual-gate-'));
  try {
    const htmlPng = join(workDir, 'html.png');
    const drawioPng = join(workDir, 'drawio.png');
    writeFileSync(htmlPng, encodePng(1, 1, [30, 40, 50, 255]));
    writeFileSync(drawioPng, encodePng(1, 1, [31, 41, 51, 255]));

    const result = spawnSync(process.execPath, [
      toolPath,
      'compare',
      '--html-png',
      htmlPng,
      '--drawio-png',
      drawioPng,
      '--max-pixel-mismatch-ratio',
      '0.015',
      '--per-channel-tolerance',
      '3',
      '--max-average-channel-delta',
      '2'
    ], { cwd: repoRoot, encoding: 'utf8' });

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.passed, true);
    assert.equal(output.mismatchedPixels, 0);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});
