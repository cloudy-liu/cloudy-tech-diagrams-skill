import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const reference = readFileSync(
  new URL('../references/runtime-mechanism-mode.md', import.meta.url),
  'utf8'
);

test('skill points Runtime Mechanism Mode authors to the reference guide', () => {
  assert.match(skill, /references\/runtime-mechanism-mode\.md/);
});

test('runtime mechanism reference defines reusable expression grammar', () => {
  assert.match(reference, /runtime causality/i);
  assert.match(reference, /Trigger/);
  assert.match(reference, /Participants/);
  assert.match(reference, /Boundaries/);
  assert.match(reference, /Carriers/);
  assert.match(reference, /Transformations/);
  assert.match(reference, /State \/ Stores/);
  assert.match(reference, /Observable Outputs/);
  assert.match(reference, /trigger-to-output causal chain/i);
  assert.match(reference, /boundary-centered mechanism view/i);
  assert.match(reference, /coordinator.*worker.*state.*output/i);
  assert.match(reference, /producer.*carrier.*transformation.*output/i);
  assert.match(reference, /data-drawio-role="runtime-boundary"/);
  assert.match(reference, /not tied to shared memory, threads, buffers, or caches/i);
});

test('runtime mechanism guidance preserves editable table-like state stores', () => {
  const combined = `${skill}\n${reference}`;

  assert.match(combined, /table-like state stores/i);
  assert.match(combined, /standalone `data-drawio-type="label"`/i);
  assert.match(combined, /standalone `data-drawio-type="edge"`/i);
  assert.match(combined, /cell.*divider.*editable/i);
});

test('runtime mechanism guidance avoids connector labels in crowded paths', () => {
  const combined = `${skill}\n${reference}`;

  assert.match(combined, /crowded connector paths/i);
  assert.match(combined, /move the label to a callout/i);
  assert.match(combined, /omit the visible label/i);
});

test('runtime mechanism guidance preserves stacked worker or participant layers', () => {
  const combined = `${skill}\n${reference}`;

  assert.match(combined, /stacked worker/i);
  assert.match(combined, /stacked participant/i);
  assert.match(combined, /standalone `data-drawio-type="shape"`/i);
  assert.match(combined, /front layer.*semantic component/i);
});

test('runtime mechanism guidance preserves square repeated markers', () => {
  const combined = `${skill}\n${reference}`;

  assert.match(combined, /repeated marker/i);
  assert.match(combined, /rect/i);
  assert.match(combined, /rx=0/i);
  assert.match(combined, /square/i);
});

test('runtime mechanism guidance keeps nested sub-regions as single primitives', () => {
  const combined = `${skill}\n${reference}`;

  assert.match(combined, /nested sub-regions/i);
  assert.match(combined, /single primitive/i);
  assert.match(combined, /overlay caps/i);
});
