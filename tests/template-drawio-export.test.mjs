import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');

test('base template keeps existing export actions and adds Draw.io export', () => {
  assert.match(template, /copyAsImage\(this\)/);
  assert.match(template, /downloadPNG\(this\)/);
  assert.match(template, /downloadPDF\(this\)/);
  assert.match(template, /downloadDrawio\(this\)/);
});

test('base template marks the main SVG with Draw.io semantic annotations', () => {
  assert.match(template, /data-drawio-type="component"/);
  assert.match(template, /data-drawio-type="boundary"/);
  assert.match(template, /data-drawio-type="edge"/);
});

test('base template can build a draw.io mxGraphModel export', () => {
  assert.match(template, /function buildDrawioFromSvg\(svg, options = \{\}\)/);
  assert.match(template, /<mxGraphModel/);
  assert.match(template, /<mxCell/);
});

test('base template does not use a whole-diagram image as the Draw.io export path', () => {
  assert.doesNotMatch(template, /data:image\/(?:svg\+xml|png)/);
});
