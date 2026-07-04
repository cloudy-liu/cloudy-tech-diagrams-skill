import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');

test('authoring rules reject right-angle elbows for normal connector flows', () => {
  assert.match(skill, /right-angle|orthogonal|elbow/i);
  assert.match(skill, /cubic B[eé]zier|curved SVG path/i);
  assert.match(skill, /straight single-segment|single-segment straight/i);
  assert.match(skill, /domain-specific grid|explicitly required/i);
});

test('template guidance keeps non-trivial connector examples curved', () => {
  assert.match(template, /curved SVG path|cubic B[eé]zier|avoid right-angle/i);
  assert.doesNotMatch(template, /M 20 30 L 120 30 L 120 90/);
});

test('skill defines scope note spacing and light border contract', () => {
  assert.match(skill, /scope note/i);
  assert.match(skill, /legend/i);
  assert.match(skill, /18px/);
  assert.match(skill, /8-18px|8 to 18px/);
  assert.match(skill, /#C9C3B8/);
  assert.match(skill, /stroke-width.*1px|1px.*stroke-width/);
});

test('skill defines Runtime Mechanism Mode as runtime causality, not a theme', () => {
  assert.match(skill, /Runtime Mechanism Mode/);
  assert.match(skill, /how a mechanism happens at runtime/i);
  assert.match(skill, /not a visual style|not a theme/i);
  assert.match(skill, /Trigger/);
  assert.match(skill, /Participants/);
  assert.match(skill, /Boundaries/);
  assert.match(skill, /Carriers/);
  assert.match(skill, /Transformations/);
  assert.match(skill, /State \/ Stores/);
  assert.match(skill, /Observable Outputs/);
  assert.match(skill, /Architecture View[\s\S]*what parts exist/i);
  assert.match(skill, /Sequence Diagram[\s\S]*time-ordered messages/i);
  assert.match(skill, /Data Flow[\s\S]*where data moves/i);
});
