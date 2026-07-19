import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const repoFile = (path) => new URL(`../${path}`, import.meta.url);

function readRequired(path) {
  assert.ok(existsSync(repoFile(path)), `${path} must exist`);
  return readFileSync(repoFile(path), 'utf8');
}

function section(document, startHeading, endHeading) {
  const start = document.indexOf(startHeading);
  assert.ok(start >= 0, `${startHeading} must exist`);
  const end = endHeading ? document.indexOf(endHeading, start + startHeading.length) : -1;
  return document.slice(start, end >= 0 ? end : document.length);
}

test('skill routes each authoring phase to an authoritative reference', () => {
  const skill = readRequired('SKILL.md');
  const visual = readRequired('references/style-references.md');
  const drawio = readRequired('references/drawio-authoring.md');
  const quality = readRequired('references/quality-gate.md');
  const runtime = readRequired('references/runtime-mechanism-mode.md');
  const stage4 = section(skill, '### 4. Implement from the Template', '### 5. Render and Repair');
  const stage5 = section(skill, '### 5. Render and Repair', '### 6. Verify Exports');
  const stage6 = section(skill, '### 6. Verify Exports', '## Diagram Types');
  const runtimeMode = section(skill, '## Runtime Mechanism Mode', '## Universal Contracts');

  assert.match(stage4, /before authoring the SVG[\s\S]*style-references\.md[\s\S]*owns[\s\S]*apply every visual rule/i);
  assert.match(stage4, /before annotating[\s\S]*drawio-authoring\.md[\s\S]*owns[\s\S]*apply that contract/i);
  assert.match(stage5, /before finalizing[\s\S]*quality-gate\.md[\s\S]*apply every universal rule[\s\S]*until the applicable gate passes/i);
  assert.match(stage6, /after the rendered sheet is stable[\s\S]*drawio-authoring\.md[\s\S]*confirm[\s\S]*Complete when/i);
  assert.match(runtimeMode, /before drawing a runtime mechanism[\s\S]*runtime-mechanism-mode\.md[\s\S]*owns[\s\S]*Complete when/i);

  assert.match(visual, /## Color Palette/);
  assert.match(visual, /## Typography/);
  assert.match(visual, /open chevron arrowheads/i);
  assert.match(visual, /Before annotating SVG content[\s\S]*drawio-authoring\.md#controlled-report-boundary[\s\S]*because[\s\S]*Complete this step only when/i);
  assert.match(drawio, /Draw\.io Semantic Annotations/);
  assert.match(drawio, /Visible Diagram Label/);
  assert.match(drawio, /## Export Verification/);
  assert.match(drawio, /Copy Image[\s\S]*Download PNG[\s\S]*Download PDF[\s\S]*Download Draw\.io/);
  assert.match(drawio, /coverage audit[\s\S]*controlled report boundary/i);
  assert.match(drawio, /export checks were not run/i);
  assert.match(quality, /Universal Diagram Expression Rules/);
  assert.match(quality, /Type-Specific Diagram Expression Rules/);
  assert.match(runtime, /## Causal Roles/);
});

test('main skill keeps the process visible and discloses detailed reference', () => {
  const skill = readRequired('SKILL.md');

  assert.match(skill, /## Authoring Process/);
  assert.doesNotMatch(skill, /### Color Palette/);
  assert.doesNotMatch(skill, /### Draw\.io Visual Regression Gate/);
  assert.doesNotMatch(skill, /### Adding New Diagram Expression Rules/);
  assert.doesNotMatch(skill, /Before drawing, extract the causal roles/);
});

test('Runtime reference owns causal grammar while Draw.io reference owns generic primitives', () => {
  const runtime = readRequired('references/runtime-mechanism-mode.md');
  const drawio = readRequired('references/drawio-authoring.md');

  assert.doesNotMatch(runtime, /For table-like state stores/i);
  assert.doesNotMatch(runtime, /For stacked worker or stacked participant visuals/i);
  assert.doesNotMatch(runtime, /For small repeated markers/i);
  assert.doesNotMatch(runtime, /For nested sub-regions/i);
  assert.match(drawio, /table-like state stores/i);
  assert.match(drawio, /stacked multiplicity visuals/i);
  assert.match(drawio, /square repeated markers/i);
  assert.match(drawio, /nested sub-regions/i);
  assert.match(
    runtime,
    /Before implementing[\s\S]*drawio-authoring\.md#component-granularity[\s\S]*because[\s\S]*Complete this step only when/i
  );
});

test('quality gate aggregates authoritative contracts without restating exact rules', () => {
  const quality = readRequired('references/quality-gate.md');

  assert.match(quality, /style-references\.md/);
  assert.match(quality, /drawio-authoring\.md/);
  assert.match(quality, /runtime-mechanism-mode\.md/);
  assert.doesNotMatch(quality, /#E8E6DD|#FAF9F5|#C9C3B8/);
  assert.doesNotMatch(quality, /8-18px|18px below|cubic Bezier|rx=0/);
});

test('positive target behavior leads hard guardrails', () => {
  const skill = readRequired('SKILL.md');
  const visual = readRequired('references/style-references.md');
  const drawio = readRequired('references/drawio-authoring.md');

  assert.match(skill, /Browser Visual Fidelity is primary\.[\s\S]*Preserve the warm editorial visual system[\s\S]*when export formats require approximation/i);
  assert.match(visual, /Use flat fills and thin strokes[\s\S]*omit decorative shadows/i);
  assert.match(drawio, /The primary export path stands on editable draw\.io-native objects\.[\s\S]*not part of the default contract/i);
});

test('maintenance procedures remain available outside runtime skill context', () => {
  const skill = readRequired('SKILL.md');
  const maintaining = readRequired('MAINTAINING.md');

  assert.match(maintaining, /CLOUDY_DRAWIO_EXPORTER_VERSION/);
  assert.match(maintaining, /Draw\.io Visual Regression Gate/);
  assert.match(maintaining, /Adding New Diagram Expression Rules/);
  assert.doesNotMatch(skill, /CLOUDY_DRAWIO_EXPORTER_VERSION/);
  assert.doesNotMatch(skill, /maxPixelMismatchRatio/);
});

test('release package includes every disclosed runtime reference', () => {
  const workflow = readRequired('.github/workflows/release.yml');

  assert.match(workflow, /cp -R references/);
});
