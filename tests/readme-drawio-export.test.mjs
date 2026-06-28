import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const english = readFileSync(new URL('../README.en.md', import.meta.url), 'utf8');
const chinese = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('English README documents Draw.io as a default built-in export option', () => {
  assert.match(english, /Copy Image \/ Download PNG \/ Download PDF \/ Download Draw\.io/);
  assert.match(english, /controlled report export/i);
  assert.match(english, /page header plus (?:the )?exportable SVG sheet/i);
  assert.match(english, /editable visual equivalence/i);
});

test('English README documents the Montserrat dependency for Draw.io font fidelity', () => {
  assert.match(english, /Montserrat/);
  assert.match(english, /Draw\.io files do not embed fonts/i);
  assert.match(english, /install Montserrat/i);
  assert.match(english, /font fallback/i);
});

test('Chinese README documents Draw.io as a default built-in export option', () => {
  assert.match(chinese, /Copy Image \/ Download PNG \/ Download PDF \/ Download Draw\.io/);
  assert.match(chinese, /controlled report export/);
  assert.match(chinese, /exportable diagram sheet/);
  assert.match(chinese, /page header plus exportable SVG sheet/);
});

test('Chinese README documents the Montserrat dependency for Draw.io font fidelity', () => {
  assert.match(chinese, /Montserrat/);
  assert.match(chinese, /Draw\.io 文件不会嵌入字体/);
  assert.match(chinese, /安装 Montserrat/);
  assert.match(chinese, /字体 fallback/);
});
