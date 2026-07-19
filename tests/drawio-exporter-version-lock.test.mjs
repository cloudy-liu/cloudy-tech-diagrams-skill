import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const htmlFiles = [
  'assets/template.html',
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html',
  'examples/drawio-fidelity-torture.html'
];

class FakeElement {
  constructor(tagName, attrs = {}, children = [], text = '') {
    this.tagName = tagName;
    this.attrs = attrs;
    this.children = children;
    this.textContent = text;
    this.dataset = Object.fromEntries(
      Object.entries(attrs)
        .filter(([name]) => name.startsWith('data-'))
        .map(([name, value]) => [
          name
            .slice(5)
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
          value
        ])
    );
    this.ownerSVGElement = tagName === 'svg' ? this : null;
    for (const child of children) {
      child.parentElement = this;
      child.ownerSVGElement = tagName === 'svg' ? this : this.ownerSVGElement;
    }
  }

  getAttribute(name) {
    return this.attrs[name] ?? null;
  }

  hasAttribute(name) {
    return Object.hasOwn(this.attrs, name);
  }

  closest(selector) {
    if (selector === 'svg') return this.ownerSVGElement;
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      if (selector === 'title' && node.tagName === 'title') matches.push(node);
      if (selector === '[data-drawio-type]' && node.dataset.drawioType) matches.push(node);
      for (const child of node.children) visit(child);
    };
    visit(this);
    return matches;
  }
}

function exporterSource(html) {
  const start = html.indexOf('    function xmlEscape');
  const end = html.indexOf('    function downloadTextFile');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return html.slice(start, end).replace(/\r\n/g, '\n');
}

function exporterVersion(source) {
  const match = source.match(/const CLOUDY_DRAWIO_EXPORTER_VERSION = '([^']+)'/);
  assert.ok(match, 'missing CLOUDY_DRAWIO_EXPORTER_VERSION');
  return match[1];
}

function exporterHash(source) {
  return createHash('sha256').update(source).digest('hex');
}

function extractExporter(source) {
  return new Function(`${source}; return { buildDrawioFromSvg, CLOUDY_DRAWIO_EXPORTER_VERSION };`)();
}

function fakeSvg() {
  return new FakeElement('svg', { viewBox: '0 0 160 90' }, [
    new FakeElement('title', {}, [], 'Versioned export')
  ]);
}

function fakeCroppedSvg() {
  return new FakeElement('svg', { viewBox: '10 70 1000 550' }, [
    new FakeElement('title', {}, [], 'Cropped export'),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-role': 'scope-note',
      'data-drawio-id': 'cropped-scope-callout',
      x: '225',
      y: '572',
      width: '610',
      height: '28',
      rx: '12',
      fill: '#F6F3EC',
      stroke: '#C9C3B8',
      'stroke-width': '1'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-role': 'scope-note',
      'data-drawio-id': 'cropped-scope-label',
      'data-drawio-width': '560',
      'data-drawio-height': '18',
      x: '245',
      y: '591',
      fill: '#6F6C65',
      'font-size': '11',
      'font-weight': '500'
    }, [], 'Scope: cropped sheet export.')
  ]);
}

test('template exposes the current Draw.io exporter version marker', () => {
  const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');
  const source = exporterSource(template);

  assert.match(exporterVersion(source), /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
});

test('acceptance sample exporters carry the same version as the template', () => {
  const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');
  const templateVersion = exporterVersion(exporterSource(template));

  for (const file of htmlFiles.slice(1)) {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.equal(exporterVersion(exporterSource(html)), templateVersion, `${file} has a stale exporter version`);
  }
});

test('acceptance sample exporter blocks match the template exporter block', () => {
  const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');
  const templateHash = exporterHash(exporterSource(template));

  for (const file of htmlFiles.slice(1)) {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.equal(exporterHash(exporterSource(html)), templateHash, `${file} has a stale exporter block`);
  }
});

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} writes the Draw.io exporter version into exported mxfile metadata`, () => {
    const { buildDrawioFromSvg, CLOUDY_DRAWIO_EXPORTER_VERSION } = extractExporter(exporterSource(html));
    const drawio = buildDrawioFromSvg(fakeSvg());

    assert.match(drawio, new RegExp(`cloudyDrawioExporterVersion="${CLOUDY_DRAWIO_EXPORTER_VERSION}"`));
  });
}

test('Draw.io exporter offsets native cells by the SVG viewBox origin', () => {
  const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');
  const { buildDrawioFromSvg } = extractExporter(exporterSource(template));
  const drawio = buildDrawioFromSvg(fakeCroppedSvg());

  assert.match(drawio, /pageWidth="1000"/);
  assert.match(drawio, /pageHeight="550"/);
  assert.match(drawio, /id="cropped-scope-callout"[\s\S]*?<mxGeometry x="215" y="502" width="610" height="28"/);
  assert.match(drawio, /id="cropped-scope-label"[\s\S]*?<mxGeometry x="235" y="510" width="560" height="18"/);
});

test('maintenance guide tells maintainers to refresh the full exporter block', () => {
  const maintaining = readFileSync(new URL('../MAINTAINING.md', import.meta.url), 'utf8');

  assert.match(maintaining, /CLOUDY_DRAWIO_EXPORTER_VERSION/);
  assert.match(maintaining, /refresh the full exporter block/);
});
