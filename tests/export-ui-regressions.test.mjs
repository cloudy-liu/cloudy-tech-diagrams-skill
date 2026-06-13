import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const htmlFiles = [
  'assets/template.html',
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html',
  'examples/drawio-fidelity-torture.html'
];

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} keeps export in the title-line utility position`, () => {
    assert.match(html, /<h1>[\s\S]*?<\/h1>\s*<div class="toolbar">/);
    assert.match(html, /\.toolbar\s*{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*4px;[\s\S]*?right:\s*0;/);
    assert.match(html, /\.toolbar-actions\s*{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*0;[\s\S]*?left:\s*calc\(100% \+ 8px\);/);
    assert.doesNotMatch(html, /<div class="title-row">/);
    assert.doesNotMatch(html, /\.toolbar\s*{[\s\S]*?position:\s*static;/);
  });

  test(`${file} labels copy and download actions distinctly`, () => {
    assert.match(html, /<button[^>]*onclick="copyAsImage\(this\)"[^>]*aria-label="Copy diagram as image to clipboard"[^>]*>Copy Image<\/button>/);
    assert.match(html, /<button[^>]*onclick="downloadPNG\(this\)"[^>]*>Download PNG<\/button>/);
  });

  test(`${file} closes the export menu from outside click or Escape`, () => {
    assert.match(html, /function toggleExportMenu\(btn\)/);
    assert.match(html, /function closeExportMenus\(/);
    assert.match(html, /document\.addEventListener\('click'/);
    assert.match(html, /document\.addEventListener\('keydown'/);
    assert.match(html, /event\.key === 'Escape'/);
  });

  test(`${file} keeps the sidecar menu inside narrow viewports`, () => {
    assert.match(html, /\.toolbar\.toolbar-flip\s+\.toolbar-actions/);
    assert.match(html, /function positionExportMenu\(menu\)/);
    assert.match(html, /getBoundingClientRect\(\)\.right > window\.innerWidth - 8/);
    assert.match(html, /classList\.add\('toolbar-flip'\)/);
    assert.match(html, /classList\.remove\('expanded', 'toolbar-flip'\)/);
    assert.match(html, /padding-right:\s*84px;/);
    assert.match(html, /text-align:\s*left;/);
    assert.match(html, /position:\s*fixed;/);
    assert.match(html, /bottom:\s*18px;/);
  });

  test(`${file} exports SVG curve paths as curved Draw.io edges`, () => {
    assert.match(html, /function shapeUsesCurveCommand\(shape\)/);
    assert.match(html, /curved \? 'curved=1' : ''/);
  });
}
