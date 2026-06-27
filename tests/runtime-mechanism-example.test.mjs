import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(
  new URL('../examples/runtime-mechanism.html', import.meta.url),
  'utf8'
);

test('runtime mechanism example demonstrates the causal roles', () => {
  assert.match(html, /Runtime Mechanism Mode/);
  assert.match(html, /data-drawio-role="trigger"/);
  assert.match(html, /data-drawio-role="participant"/);
  assert.match(html, /data-drawio-role="runtime-boundary"/);
  assert.match(html, /data-drawio-role="carrier"/);
  assert.match(html, /data-drawio-role="transformation"/);
  assert.match(html, /data-drawio-role="state-store"/);
  assert.match(html, /data-drawio-role="observable-output"/);
  assert.match(html, /data-drawio-role="causal-flow"/);
});

test('runtime mechanism example keeps Cloudy export behavior', () => {
  assert.match(html, /downloadDrawio\(this\)/);
  assert.match(html, /function buildDrawioFromSvg\(svg, options = \{\}\)/);
  assert.doesNotMatch(html, /data:image\/(?:svg\+xml|png)/);
  assert.match(html, /background: var\(--canvas\)/);
  assert.match(html, /#E8E6DD/);
});
