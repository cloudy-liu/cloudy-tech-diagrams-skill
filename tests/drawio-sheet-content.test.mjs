import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const defaultPageHeaderFiles = [
  {
    file: 'assets/template.html',
    title: '[PROJECT NAME] Technical Diagram',
    subtitle: 'A focused technical diagram showing system boundaries, runtime flow, and operational context.',
    anchorId: 'cloud-region'
  },
  {
    file: 'examples/web-app.html',
    title: 'Web Application Architecture',
    subtitle: 'React + Node.js + PostgreSQL stack with a small cache layer',
    anchorId: 'application-boundary'
  },
  {
    file: 'examples/microservices.html',
    title: 'Microservices Architecture',
    subtitle: 'Kubernetes-orchestrated services behind one gateway with per-service data stores',
    anchorId: 'platform-boundary'
  },
  {
    file: 'examples/perfetto-docs-architecture.html',
    title: 'Perfetto Project Architecture',
    subtitle: "A homepage-style stack view of Perfetto's recording, analysis, and visualization capabilities, with a compact trace artifact flow across the three domains.",
    anchorId: 'record-traces-boundary'
  },
  {
    file: 'examples/drawio-fidelity-torture.html',
    title: 'Draw.io Fidelity Torture Sheet',
    subtitle: 'Acceptance sample for high-fidelity editable export while preserving the browser-rendered HTML diagram.',
    anchorId: 'cloud-region'
  }
];

function mainSvg(html) {
  const match = html.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, 'expected a main SVG diagram');
  return match[0];
}

function attrValue(markup, name) {
  const match = markup.match(new RegExp(`${name}="([^"]+)"`));
  assert.ok(match, `expected ${name} attribute`);
  return match[1];
}

function numericAttr(markup, name) {
  return Number(attrValue(markup, name));
}

function viewBox(svg) {
  const values = attrValue(svg.match(/<svg[^>]+>/)[0], 'viewBox').split(/\s+/).map(Number);
  assert.equal(values.length, 4, 'expected four viewBox values');
  return { x: values[0], y: values[1], width: values[2], height: values[3] };
}

function rectForDrawioId(svg, id) {
  const direct = svg.match(new RegExp(`<rect[^>]+data-drawio-id="${id}"[^>]*>`));
  if (direct) return direct[0];

  const grouped = svg.match(new RegExp(`<g[^>]+data-drawio-id="${id}"[^>]*>[\\s\\S]*?<rect[^>]+>`));
  assert.ok(grouped, `expected rect for ${id}`);
  return grouped[0].match(/<rect[^>]+>/)[0];
}

const scopeCalloutFiles = [
  ...defaultPageHeaderFiles
];

for (const { file, title, subtitle, anchorId } of defaultPageHeaderFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const svg = mainSvg(html);

  test(`${file} keeps page title and subtitle in the HTML header`, () => {
    assert.match(html, new RegExp(`<h1>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
    assert.match(html, new RegExp(`<p class="subtitle">${subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</p>`));
  });

  test(`${file} does not duplicate page title or subtitle inside the default SVG sheet`, () => {
    assert.doesNotMatch(svg, /data-drawio-role="sheet-title"/);
    assert.doesNotMatch(svg, /data-drawio-id="sheet-title"/);
    assert.doesNotMatch(svg, /data-drawio-role="caption"/);
    assert.doesNotMatch(svg, /data-drawio-id="sheet-caption"/);
    assert.doesNotMatch(svg, new RegExp(`<text[^>]*>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</text>`));
    assert.doesNotMatch(svg, new RegExp(`<text[^>]*>${subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</text>`));
  });

  test(`${file} keeps legend and scope note inside the exportable SVG sheet`, () => {
    assert.match(svg, /data-drawio-role="legend"/);
    assert.match(svg, /data-drawio-role="legend-swatch"/);
    assert.match(svg, /data-drawio-role="legend-label"/);
    assert.match(svg, /data-drawio-role="scope-note"/);
  });

  test(`${file} crops the default SVG sheet to the diagram content rhythm`, () => {
    const box = viewBox(svg);
    const anchorTop = numericAttr(rectForDrawioId(svg, anchorId), 'y');

    assert.ok(box.y > 0, 'default SVG sheet should crop removed header gutter');
    assert.ok(anchorTop - box.y <= 32, 'first diagram content should sit near the sheet top');
    assert.ok(box.y + box.height >= 620 || file.includes('perfetto'), 'cropped viewBox should not cut the standard 620px sheet bottom');
  });

  test(`${file} leaves page chrome outside the exportable SVG sheet`, () => {
    assert.doesNotMatch(svg, /Download Draw\.io/);
    assert.doesNotMatch(svg, /Copy Image/);
    assert.doesNotMatch(svg, /class="footer"/);
    assert.doesNotMatch(svg, /Generated with/);
  });
}

for (const { file } of scopeCalloutFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const svg = mainSvg(html);

  test(`${file} renders scope notes as callouts instead of loose footer text`, () => {
    assert.match(svg, /<rect[^>]+data-drawio-type="shape"[^>]+data-drawio-role="scope-note"[^>]+rx="12"[^>]+fill="#F6F3EC"[^>]+stroke="#C9C3B8"/);
    assert.match(svg, /<text[^>]+data-drawio-type="label"[^>]+data-drawio-role="scope-note"[^>]+font-weight="500"/);
  });
}
