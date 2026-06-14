import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const configPath = join(repoRoot, 'visual-regression/drawio-gate.config.json');
const toolPath = join(repoRoot, 'tools/drawio-visual-regression.mjs');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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
  assert.ok(existsSync(configPath), 'expected visual-regression/drawio-gate.config.json');
  const config = readJson(configPath);

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
  assert.deepEqual(sampleIds, ['drawio-fidelity-torture', 'perfetto-docs-architecture']);
  for (const sample of config.samples) {
    assert.ok(existsSync(join(repoRoot, sample.html)), `${sample.html} should exist`);
    assert.equal(sample.selector, '#report-container');
    assert.deepEqual(sample.excludeSelectors, ['.toolbar', '.cards', '.footer']);
    assert.match(sample.artifacts.htmlPng, /^dist\/drawio-visual\//);
    assert.match(sample.artifacts.drawioPng, /^dist\/drawio-visual\//);
  }
});

test('documentation defines the Draw.io visual regression gate and non-flaky CI policy', () => {
  const docs = [
    readFileSync(join(repoRoot, 'SKILL.md'), 'utf8'),
    readFileSync(join(repoRoot, 'README.en.md'), 'utf8')
  ];

  for (const doc of docs) {
    assert.match(doc, /Draw\.io Visual Regression Gate/);
    assert.match(doc, /Playwright Chromium/);
    assert.match(doc, /diagrams\.net Desktop CLI/);
    assert.match(doc, /maxPixelMismatchRatio/);
    assert.match(doc, /DRAWIO_VISUAL_GATE=1/);
    assert.match(doc, /release validation/i);
    assert.match(doc, /CI flaky|flaky CI/i);
  }
});

test('visual regression tool validates configured acceptance samples without requiring screenshots in CI', async () => {
  const { loadGateConfig, validateGateConfig } = await loadTool();
  const config = loadGateConfig(configPath);
  const result = validateGateConfig(config, { repoRoot, requireArtifacts: false });

  assert.equal(result.ok, true);
  assert.deepEqual(result.sampleIds, ['drawio-fidelity-torture', 'perfetto-docs-architecture']);
  assert.deepEqual(result.missingArtifacts, []);
  assert.equal(result.releaseGateEnv, 'DRAWIO_VISUAL_GATE=1');
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
