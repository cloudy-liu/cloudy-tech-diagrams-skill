import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const samplePath = '../examples/drawio-fidelity-torture.html';

function sampleHtml() {
  return readFileSync(new URL(samplePath, import.meta.url), 'utf8');
}

function mainSvg(html) {
  const match = html.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, 'expected a main SVG diagram');
  return match[0];
}

test('Draw.io fidelity torture sample exists as a browser-first HTML diagram', () => {
  const html = sampleHtml();

  assert.match(html, /<title>Draw\.io Fidelity Torture Sheet<\/title>/);
  assert.match(html, /<h1>Draw\.io Fidelity Torture Sheet<\/h1>/);
  assert.match(html, /downloadDrawio\(this\)/);
  assert.doesNotMatch(html, /data:image\/(?:svg\+xml|png)/);
});

test('Draw.io fidelity torture sample keeps diagram-owned sheet content in SVG', () => {
  const svg = mainSvg(sampleHtml());

  assert.match(svg, /data-drawio-role="sheet-title"/);
  assert.match(svg, /data-drawio-role="caption"/);
  assert.match(svg, /data-drawio-role="legend"/);
  assert.match(svg, /data-drawio-role="legend-swatch"/);
  assert.match(svg, /data-drawio-role="legend-label"/);
  assert.match(svg, /data-drawio-role="scope-note"/);
  assert.match(svg, /data-drawio-role="card"/);
});

test('Draw.io fidelity torture sample exercises high-risk editable export cases', () => {
  const svg = mainSvg(sampleHtml());

  assert.match(svg, /data-drawio-id="torture-observability-card"/);
  assert.match(svg, /data-drawio-role="card-pill"/);
  assert.match(svg, /data-drawio-role="card-metric"/);
  assert.match(svg, /data-drawio-id="torture-curved-rest"/);
  assert.match(svg, /data-drawio-id="torture-dashed-events"/);
  assert.match(svg, /data-drawio-id="torture-semantic-handoff"/);
  assert.match(svg, /data-drawio-source="api-gateway"/);
  assert.match(svg, /data-drawio-target="api-service"/);
  assert.match(svg, /stroke-dasharray="5 5"/);
  assert.match(svg, /marker-end="url\(#arrowhead\)"/);
  assert.match(svg, /fill="#527AA0"/);
  assert.match(svg, /fill="#A45D45"/);
  assert.match(svg, / d="M [^"]+ C [^"]+"/);
});
