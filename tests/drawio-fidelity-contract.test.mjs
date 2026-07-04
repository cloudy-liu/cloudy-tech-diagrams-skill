import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

test('skill treats Draw.io Export Fidelity as the product contract', () => {
  assert.match(skill, /Draw\.io Export Fidelity/);
  assert.match(skill, /product-critical/i);
  assert.match(skill, /browser-rendered HTML remains the entry-level/i);
  assert.match(skill, /not an arbitrary HTML\/CSS conversion/i);
});

test('skill defines the exportable diagram sheet boundary', () => {
  assert.match(skill, /exportable diagram sheet/i);
  assert.match(skill, /HTML page header is mandatory/i);
  assert.match(skill, /visible (?:HTML )?`<h1>` and subtitle/i);
  assert.match(skill, /not duplicate (?:that|the) page title or subtitle/i);
  assert.match(skill, /sheet-owned title or caption/i);
  assert.match(skill, /Visible diagram legends and scope notes|diagram legend, scope note/i);
  assert.match(skill, /fixed template summary badges|fixed template summary badge/i);
  assert.match(skill, /page chrome, toolbar, and unrelated footer metadata|toolbar, footer, and page-support cards/i);
});

test('skill defines the default Draw.io report export boundary', () => {
  assert.match(skill, /default Draw\.io export|Draw\.io button downloads a `\.drawio` controlled report export/i);
  assert.match(skill, /controlled report export/i);
  assert.match(skill, /page header plus (?:the )?exportable SVG sheet/i);
  assert.match(skill, /visible HTML `<h1>` and subtitle/i);
  assert.match(skill, /excluding toolbar, footer, and page-support cards/i);
});

test('skill documents annotation roles, ignore semantics, and visible label rules', () => {
  assert.match(skill, /data-drawio-role/);
  assert.match(skill, /data-drawio-ignore="true"/);
  assert.match(skill, /data-drawio-ignore-reason/);
  assert.match(skill, /Visible Diagram Label/);
  assert.match(skill, /data-drawio-label must not silently override visible SVG text/i);
});

test('skill records the annotated SVG sheet decision for Draw.io fidelity', () => {
  assert.match(skill, /annotated SVG|exportable SVG sheet/i);
  assert.match(skill, /full-page DOM conversion|one-image export|whole-diagram raster/i);
  assert.match(skill, /Browser visual fidelity is primary/i);
});
