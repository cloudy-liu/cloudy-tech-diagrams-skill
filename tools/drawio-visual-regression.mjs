#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const DEFAULT_CONFIG = 'visual-regression/drawio-gate.config.json';
const DEFAULT_THRESHOLDS = {
  maxPixelMismatchRatio: 0.015,
  perChannelTolerance: 3,
  maxAverageChannelDelta: 2
};

function readUInt32(buffer, offset) {
  if (offset + 4 > buffer.length) throw new Error('unexpected end of PNG data');
  return buffer.readUInt32BE(offset);
}

function paethPredictor(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}

function channelCountForColorType(colorType) {
  if (colorType === 0) return 1;
  if (colorType === 2) return 3;
  if (colorType === 6) return 4;
  throw new Error(`unsupported PNG color type ${colorType}; expected grayscale, RGB, or RGBA`);
}

function unfilterScanlines(inflated, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const expectedLength = (stride + 1) * height;
  if (inflated.length < expectedLength) {
    throw new Error(`PNG data is truncated: expected at least ${expectedLength} bytes, got ${inflated.length}`);
  }

  const output = Buffer.alloc(stride * height);
  let inputOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const filtered = inflated.subarray(inputOffset, inputOffset + stride);
    inputOffset += stride;
    const row = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = previous[x] || 0;
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      let predictor = 0;

      if (filter === 0) predictor = 0;
      else if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) predictor = paethPredictor(left, up, upperLeft);
      else throw new Error(`unsupported PNG filter ${filter}`);

      row[x] = (filtered[x] + predictor) & 0xff;
    }

    row.copy(output, y * stride);
    previous = row;
  }

  return output;
}

function rgbaFromScanlines(scanlines, width, height, colorType, bytesPerPixel) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  const stride = width * bytesPerPixel;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = y * stride + x * bytesPerPixel;
      const target = (y * width + x) * 4;

      if (colorType === 0) {
        const value = scanlines[source];
        rgba[target] = value;
        rgba[target + 1] = value;
        rgba[target + 2] = value;
        rgba[target + 3] = 255;
      } else if (colorType === 2) {
        rgba[target] = scanlines[source];
        rgba[target + 1] = scanlines[source + 1];
        rgba[target + 2] = scanlines[source + 2];
        rgba[target + 3] = 255;
      } else if (colorType === 6) {
        rgba[target] = scanlines[source];
        rgba[target + 1] = scanlines[source + 1];
        rgba[target + 2] = scanlines[source + 2];
        rgba[target + 3] = scanlines[source + 3];
      }
    }
  }

  return rgba;
}

export function decodePng(buffer) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('input is not a PNG file');
  }

  let offset = PNG_SIGNATURE.length;
  let header = null;
  const imageData = [];

  while (offset < buffer.length) {
    const length = readUInt32(buffer, offset);
    offset += 4;
    const type = buffer.subarray(offset, offset + 4).toString('ascii');
    offset += 4;
    const data = buffer.subarray(offset, offset + length);
    offset += length;
    offset += 4;

    if (type === 'IHDR') {
      header = {
        width: readUInt32(data, 0),
        height: readUInt32(data, 4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12]
      };
    } else if (type === 'IDAT') {
      imageData.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!header) throw new Error('PNG is missing IHDR');
  if (header.bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${header.bitDepth}; expected 8`);
  if (header.compression !== 0 || header.filter !== 0) throw new Error('unsupported PNG compression or filter method');
  if (header.interlace !== 0) throw new Error('interlaced PNG files are not supported');
  if (!imageData.length) throw new Error('PNG is missing IDAT image data');

  const bytesPerPixel = channelCountForColorType(header.colorType);
  const inflated = inflateSync(Buffer.concat(imageData));
  const scanlines = unfilterScanlines(inflated, header.width, header.height, bytesPerPixel);
  const data = rgbaFromScanlines(scanlines, header.width, header.height, header.colorType, bytesPerPixel);

  return {
    width: header.width,
    height: header.height,
    data
  };
}

export function compareImageData(expected, actual, options = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...options };
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return {
      passed: false,
      reason: 'dimension-mismatch',
      expected: { width: expected.width, height: expected.height },
      actual: { width: actual.width, height: actual.height },
      totalPixels: Math.max(expected.width * expected.height, actual.width * actual.height),
      mismatchedPixels: null,
      mismatchRatio: 1,
      maxChannelDelta: null,
      averageChannelDelta: null,
      thresholds
    };
  }

  const totalPixels = expected.width * expected.height;
  let mismatchedPixels = 0;
  let maxChannelDelta = 0;
  let totalChannelDelta = 0;

  for (let index = 0; index < expected.data.length; index += 4) {
    const deltas = [
      Math.abs(expected.data[index] - actual.data[index]),
      Math.abs(expected.data[index + 1] - actual.data[index + 1]),
      Math.abs(expected.data[index + 2] - actual.data[index + 2]),
      Math.abs(expected.data[index + 3] - actual.data[index + 3])
    ];
    const pixelMax = Math.max(...deltas);
    maxChannelDelta = Math.max(maxChannelDelta, pixelMax);
    totalChannelDelta += deltas.reduce((sum, delta) => sum + delta, 0);
    if (pixelMax > thresholds.perChannelTolerance) mismatchedPixels += 1;
  }

  const mismatchRatio = totalPixels === 0 ? 0 : mismatchedPixels / totalPixels;
  const averageChannelDelta = totalPixels === 0 ? 0 : totalChannelDelta / (totalPixels * 4);
  const passed =
    mismatchRatio <= thresholds.maxPixelMismatchRatio &&
    averageChannelDelta <= thresholds.maxAverageChannelDelta;

  return {
    passed,
    reason: passed ? 'within-threshold' : 'visual-diff-exceeds-threshold',
    totalPixels,
    mismatchedPixels,
    mismatchRatio,
    maxChannelDelta,
    averageChannelDelta,
    thresholds
  };
}

export function comparePngBuffers(htmlPng, drawioPng, options = {}) {
  return compareImageData(decodePng(htmlPng), decodePng(drawioPng), options);
}

export function comparePngFiles(htmlPngPath, drawioPngPath, options = {}) {
  return comparePngBuffers(readFileSync(htmlPngPath), readFileSync(drawioPngPath), options);
}

export function loadGateConfig(configPath = DEFAULT_CONFIG) {
  return JSON.parse(readFileSync(resolve(configPath), 'utf8'));
}

function pathExists(repoRoot, relativePath) {
  return relativePath && existsSync(resolve(repoRoot, relativePath));
}

export function validateGateConfig(config, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const requireArtifacts = options.requireArtifacts === true;
  const errors = [];
  const missingArtifacts = [];
  const samples = Array.isArray(config?.samples) ? config.samples : [];

  if (config?.version !== 1) errors.push('config.version must be 1');
  if (config?.renderers?.html?.engine !== 'playwright-chromium') {
    errors.push('renderers.html.engine must be playwright-chromium');
  }
  if (config?.renderers?.drawio?.engine !== 'diagrams-net-desktop-cli') {
    errors.push('renderers.drawio.engine must be diagrams-net-desktop-cli');
  }
  if (!Number.isFinite(config?.thresholds?.maxPixelMismatchRatio)) {
    errors.push('thresholds.maxPixelMismatchRatio must be numeric');
  }
  if (!samples.length) errors.push('at least one representative sample is required');

  for (const sample of samples) {
    if (!sample.id) errors.push('sample.id is required');
    if (!pathExists(repoRoot, sample.html)) errors.push(`${sample.id || 'sample'} html does not exist: ${sample.html}`);
    if (!sample.selector) errors.push(`${sample.id || 'sample'} selector is required`);

    if (requireArtifacts) {
      for (const artifactName of ['htmlPng', 'drawioPng']) {
        const artifactPath = sample.artifacts?.[artifactName];
        if (!pathExists(repoRoot, artifactPath)) {
          missingArtifacts.push({
            sample: sample.id,
            artifact: artifactName,
            path: artifactPath
          });
        }
      }
    }
  }

  return {
    ok: errors.length === 0 && missingArtifacts.length === 0,
    errors,
    missingArtifacts,
    sampleIds: samples.map((sample) => sample.id),
    releaseGateEnv: config?.ci?.releaseGateEnv,
    defaultMode: config?.ci?.defaultMode
  };
}

export function compareConfiguredArtifacts(config, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const validation = validateGateConfig(config, { repoRoot, requireArtifacts: true });
  if (!validation.ok) {
    return {
      passed: false,
      validation,
      results: []
    };
  }

  const thresholds = { ...DEFAULT_THRESHOLDS, ...config.thresholds };
  const results = config.samples.map((sample) => {
    const result = comparePngFiles(
      resolve(repoRoot, sample.artifacts.htmlPng),
      resolve(repoRoot, sample.artifacts.drawioPng),
      thresholds
    );
    return {
      sample: sample.id,
      htmlPng: sample.artifacts.htmlPng,
      drawioPng: sample.artifacts.drawioPng,
      ...result
    };
  });

  return {
    passed: results.every((result) => result.passed),
    validation,
    results
  };
}

function parseArgs(argv) {
  const [command = 'help', ...tokens] = argv.slice(2);
  const options = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = tokens[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }

  return { command, options };
}

function numberOption(options, name, fallback) {
  const value = options[name];
  if (value === undefined) return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new Error(`--${name} must be numeric`);
  return numeric;
}

function configPathOption(options) {
  return options.config || DEFAULT_CONFIG;
}

function thresholdOptions(options, configThresholds = {}) {
  return {
    ...DEFAULT_THRESHOLDS,
    ...configThresholds,
    maxPixelMismatchRatio: numberOption(
      options,
      'max-pixel-mismatch-ratio',
      configThresholds.maxPixelMismatchRatio ?? DEFAULT_THRESHOLDS.maxPixelMismatchRatio
    ),
    perChannelTolerance: numberOption(
      options,
      'per-channel-tolerance',
      configThresholds.perChannelTolerance ?? DEFAULT_THRESHOLDS.perChannelTolerance
    ),
    maxAverageChannelDelta: numberOption(
      options,
      'max-average-channel-delta',
      configThresholds.maxAverageChannelDelta ?? DEFAULT_THRESHOLDS.maxAverageChannelDelta
    )
  };
}

function printUsage() {
  console.log(`Usage:
  node tools/drawio-visual-regression.mjs validate [--config visual-regression/drawio-gate.config.json] [--require-artifacts]
  node tools/drawio-visual-regression.mjs compare --html-png path --drawio-png path [--max-pixel-mismatch-ratio 0.015]
  node tools/drawio-visual-regression.mjs gate [--config visual-regression/drawio-gate.config.json]
`);
}

function runCli() {
  const { command, options } = parseArgs(process.argv);

  try {
    if (command === 'validate') {
      const config = loadGateConfig(configPathOption(options));
      const requireArtifacts = options['require-artifacts'] === true || process.env.DRAWIO_VISUAL_GATE === '1';
      const result = validateGateConfig(config, { repoRoot: process.cwd(), requireArtifacts });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.ok ? 0 : 1;
      return;
    }

    if (command === 'compare') {
      if (!options['html-png']) throw new Error('--html-png is required');
      if (!options['drawio-png']) throw new Error('--drawio-png is required');
      const thresholds = thresholdOptions(options);
      const result = comparePngFiles(options['html-png'], options['drawio-png'], thresholds);
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.passed ? 0 : 1;
      return;
    }

    if (command === 'gate') {
      const config = loadGateConfig(configPathOption(options));
      const thresholds = thresholdOptions(options, config.thresholds);
      const result = compareConfiguredArtifacts({ ...config, thresholds }, { repoRoot: process.cwd() });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.passed ? 0 : 1;
      return;
    }

    printUsage();
    process.exitCode = command === 'help' ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
