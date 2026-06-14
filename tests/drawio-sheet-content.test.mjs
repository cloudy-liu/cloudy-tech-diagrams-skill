import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const defaultPageHeaderFiles = [
  {
    file: 'assets/template.html',
    title: '[PROJECT NAME] Technical Diagram',
    subtitle: 'A focused technical diagram showing system boundaries, runtime flow, and operational context.'
  },
  {
    file: 'examples/web-app.html',
    title: 'Web Application Architecture',
    subtitle: 'React + Node.js + PostgreSQL stack with a small cache layer'
  },
  {
    file: 'examples/microservices.html',
    title: 'Microservices Architecture',
    subtitle: 'Kubernetes-orchestrated services behind one gateway with per-service data stores'
  },
  {
    file: 'examples/perfetto-docs-architecture.html',
    title: 'Perfetto Project Architecture',
    subtitle: "A homepage-style stack view of Perfetto's recording, analysis, and visualization capabilities, with a compact trace artifact flow across the three domains."
  }
];

const sheetTitleAcceptanceFiles = [
  {
    file: 'examples/drawio-fidelity-torture.html',
    title: 'Draw.io Fidelity Torture Sheet',
    caption: 'Editable export acceptance sample'
  }
];

function mainSvg(html) {
  const match = html.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, 'expected a main SVG diagram');
  return match[0];
}

for (const { file, title, subtitle } of defaultPageHeaderFiles) {
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

  test(`${file} leaves page chrome outside the exportable SVG sheet`, () => {
    assert.doesNotMatch(svg, /Download Draw\.io/);
    assert.doesNotMatch(svg, /Copy Image/);
    assert.doesNotMatch(svg, /class="footer"/);
    assert.doesNotMatch(svg, /Generated with/);
  });
}

for (const { file, title, caption } of sheetTitleAcceptanceFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const svg = mainSvg(html);

  test(`${file} can keep optional sheet-owned title and caption inside the SVG sheet`, () => {
    assert.match(svg, /data-drawio-type="label"[^>]+data-drawio-role="sheet-title"[^>]+data-drawio-id="sheet-title"/);
    assert.match(svg, /data-drawio-type="label"[^>]+data-drawio-role="caption"[^>]+data-drawio-id="sheet-caption"/);
    assert.match(svg, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(svg, new RegExp(caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
}
