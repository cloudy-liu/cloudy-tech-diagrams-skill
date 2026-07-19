import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contract = readFileSync(
  new URL('../references/drawio-authoring.md', import.meta.url),
  'utf8'
);

test('Draw.io authoring reference treats export fidelity as the product contract', () => {
  assert.match(contract, /Draw\.io Export Fidelity/);
  assert.match(contract, /product-critical/i);
  assert.match(contract, /browser-rendered HTML remains the entry-level/i);
  assert.match(contract, /rather than arbitrary HTML\/CSS conversion/i);
});

test('Draw.io authoring reference defines the exportable diagram sheet boundary', () => {
  assert.match(contract, /exportable SVG sheet/i);
  assert.match(contract, /visible page-level `<h1>` and subtitle/i);
  assert.match(contract, /free of duplicate page title or subtitle text/i);
  assert.match(contract, /sheet-owned title or caption/i);
  assert.match(contract, /Meaningful legends, scope notes/i);
  assert.match(contract, /diagram-specific explanatory cards/i);
  assert.match(contract, /Page chrome, the toolbar, unrelated footer metadata/i);
});

test('Draw.io authoring reference defines the default report export boundary', () => {
  assert.match(contract, /Draw\.io Editable Export by default/i);
  assert.match(contract, /controlled report export/i);
  assert.match(contract, /page header plus the exportable SVG sheet/i);
  assert.match(contract, /page-level `<h1>` and subtitle/i);
  assert.match(contract, /excluding the toolbar, footer, and page-support cards/i);
});

test('Draw.io authoring reference documents annotation and visible label rules', () => {
  assert.match(contract, /data-drawio-role/);
  assert.match(contract, /data-drawio-ignore="true"/);
  assert.match(contract, /data-drawio-ignore-reason/);
  assert.match(contract, /Visible Diagram Label/);
  assert.match(contract, /data-drawio-label` must not silently override visible SVG wording/i);
});

test('Draw.io authoring reference records the annotated SVG sheet decision', () => {
  assert.match(contract, /annotated SVG|exportable SVG sheet/i);
  assert.match(contract, /full-page DOM conversion|one-image export|whole-diagram raster/i);
  assert.match(contract, /Browser Visual Fidelity is primary/i);
});
