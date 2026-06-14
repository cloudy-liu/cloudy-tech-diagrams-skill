import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const english = readFileSync(new URL('../README.en.md', import.meta.url), 'utf8');
const chinese = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
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
    assert.match(doc, /HTML page header is mandatory/i);
    assert.match(doc, /visible `<h1>` and subtitle/i);
    assert.match(doc, /not duplicate (?:that|the) page title or subtitle/i);
    assert.match(doc, /sheet-owned title or caption/i);
    assert.match(doc, /Visible diagram legends and scope notes|diagram legend, scope note/i);
    assert.match(doc, /fixed template summary badges|fixed template summary badge/i);
    assert.match(doc, /page chrome, toolbar, and unrelated footer metadata/i);
  }

  assert.match(chinese, /Draw\.io Export Fidelity/);
  assert.match(chinese, /HTML-first/);
  assert.match(chinese, /SVG sheet/);
  assert.match(chinese, /scope note/);
  assert.match(chinese, /summary badge/);
  assert.match(chinese, /page chrome|页面 chrome/);
  assert.doesNotMatch(english, /summary cards, footer, or toolbar/i);
  assert.doesNotMatch(chinese, /summary cards.*footer.*toolbar/i);
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
