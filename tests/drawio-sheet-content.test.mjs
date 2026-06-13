import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sheetFiles = [
  {
    file: 'assets/template.html',
    title: '[PROJECT NAME] technical flow',
    caption: 'Warm editorial technical diagram'
  },
  {
    file: 'examples/web-app.html',
    title: 'Web Application Architecture',
    caption: 'React + Node.js + PostgreSQL stack'
  },
  {
    file: 'examples/microservices.html',
    title: 'Microservices Architecture',
    caption: 'Kubernetes-orchestrated services'
  },
  {
    file: 'examples/perfetto-docs-architecture.html',
    title: 'Project stack map',
    caption: 'Modeled after the official homepage stack'
  }
];

function mainSvg(html) {
  const match = html.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, 'expected a main SVG diagram');
  return match[0];
}

for (const { file, title, caption } of sheetFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const svg = mainSvg(html);

  test(`${file} keeps diagram-owned title and caption inside the exportable SVG sheet`, () => {
    assert.match(svg, /data-drawio-type="label"[^>]+data-drawio-role="sheet-title"[^>]+data-drawio-id="sheet-title"/);
    assert.match(svg, /data-drawio-type="label"[^>]+data-drawio-role="caption"[^>]+data-drawio-id="sheet-caption"/);
    assert.match(svg, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(svg, new RegExp(caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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
