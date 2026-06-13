import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const english = readFileSync(new URL('../README.en.md', import.meta.url), 'utf8');
const adrDir = new URL('../docs/adr/', import.meta.url);
const adrText = readdirSync(adrDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => readFileSync(new URL(file, adrDir), 'utf8'))
  .join('\n\n');

test('documentation treats Draw.io Export Fidelity as the product contract', () => {
  for (const doc of [skill, english]) {
    assert.match(doc, /Draw\.io Export Fidelity/);
    assert.match(doc, /product-critical/i);
    assert.match(doc, /browser-rendered HTML remains the entry-level/i);
    assert.match(doc, /not an arbitrary HTML\/CSS conversion/i);
  }
});

test('documentation defines the exportable diagram sheet boundary', () => {
  for (const doc of [skill, english]) {
    assert.match(doc, /exportable diagram sheet/i);
    assert.match(doc, /title, legend, caption, scope notes, and explanatory cards/i);
    assert.match(doc, /page chrome, toolbar, and unrelated footer metadata/i);
  }

  assert.doesNotMatch(english, /summary cards, footer, or toolbar/i);
});

test('skill documents annotation roles, ignore semantics, and visible label rules', () => {
  assert.match(skill, /data-drawio-role/);
  assert.match(skill, /data-drawio-ignore="true"/);
  assert.match(skill, /data-drawio-ignore-reason/);
  assert.match(skill, /Visible Diagram Label/);
  assert.match(skill, /data-drawio-label must not silently override visible SVG text/i);
});

test('ADR records the annotated SVG sheet decision for Draw.io fidelity', () => {
  assert.match(adrText, /annotated SVG sheet/i);
  assert.match(adrText, /full-page DOM conversion/i);
  assert.match(adrText, /draw\.io-first generation/i);
  assert.match(adrText, /one-image export/i);
  assert.match(adrText, /Browser Visual Fidelity/i);
});
