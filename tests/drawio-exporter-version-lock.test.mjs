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

test('skill tells maintainers to refresh the full exporter block when updating diagrams', () => {
  const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

  assert.match(skill, /CLOUDY_DRAWIO_EXPORTER_VERSION/);
  assert.match(skill, /refresh the full exporter block/);
});
