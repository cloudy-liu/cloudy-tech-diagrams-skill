import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const examples = [
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html',
  'examples/drawio-fidelity-torture.html'
];

for (const example of examples) {
  const html = readFileSync(new URL(`../${example}`, import.meta.url), 'utf8');

  test(`${example} includes built-in Draw.io export`, () => {
    assert.match(html, /downloadDrawio\(this\)/);
    assert.match(html, /function buildDrawioFromSvg\(svg, options = \{\}\)/);
    assert.match(html, /<mxGraphModel/);
  });

  test(`${example} marks editable diagram primitives with Draw.io annotations`, () => {
    assert.match(html, /data-drawio-type="component"/);
    assert.match(html, /data-drawio-type="boundary"/);
    assert.match(html, /data-drawio-type="edge"/);
  });

  test(`${example} does not use a whole-diagram image as the Draw.io export path`, () => {
    assert.doesNotMatch(html, /data:image\/(?:svg\+xml|png)/);
  });
}
