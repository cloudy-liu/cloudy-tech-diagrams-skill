import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const english = readFileSync(new URL('../README.en.md', import.meta.url), 'utf8');
const chinese = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('English README documents Draw.io as a default built-in export option', () => {
  assert.match(english, /Copy Image \/ Download PNG \/ Download PDF \/ Download Draw\.io/);
  assert.match(english, /download drawio/i);
});

test('English README keeps the Montserrat font tip for Draw.io users', () => {
  assert.match(english, /Draw\.io files do not embed fonts/i);
  assert.match(english, /Install Montserrat/i);
  assert.match(english, /falls back|font fallback/i);
});

test('English README does not expose the export fidelity contract details', () => {
  assert.doesNotMatch(english, /Draw\.io Export Fidelity/);
  assert.doesNotMatch(english, /controlled report export/i);
  assert.doesNotMatch(english, /DRAWIO_VISUAL_GATE/);
  assert.doesNotMatch(english, /maxPixelMismatchRatio/);
});

test('Chinese README documents Draw.io as a default built-in export option', () => {
  assert.match(chinese, /Copy Image \/ Download PNG \/ Download PDF \/ Download Draw\.io/);
  assert.match(chinese, /download drawio/i);
});

test('Chinese README keeps the Montserrat font tip for Draw.io users', () => {
  assert.match(chinese, /Draw\.io 文件不会嵌入字体/);
  assert.match(chinese, /安装 Montserrat/);
  assert.match(chinese, /字体 fallback/);
});

test('Chinese README does not expose the export fidelity contract details', () => {
  assert.doesNotMatch(chinese, /Draw\.io Export Fidelity/);
  assert.doesNotMatch(chinese, /controlled report export/);
  assert.doesNotMatch(chinese, /DRAWIO_VISUAL_GATE/);
  assert.doesNotMatch(chinese, /maxPixelMismatchRatio/);
});
