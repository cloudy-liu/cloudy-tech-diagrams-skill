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
