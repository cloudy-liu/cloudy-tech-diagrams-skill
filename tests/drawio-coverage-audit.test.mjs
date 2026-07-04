import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const htmlFiles = [
  'assets/template.html',
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html',
  'examples/runtime-mechanism.html',
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
    if (selector === '[data-drawio-type]') {
      let node = this.parentElement;
      while (node) {
        if (node.dataset?.drawioType) return node;
        node = node.parentElement;
      }
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      if (selector === 'title' && node.tagName === 'title') matches.push(node);
      if (selector === 'rect' && node.tagName === 'rect') matches.push(node);
      if (selector === 'text' && node.tagName === 'text') matches.push(node);
      if (selector === 'circle' && node.tagName === 'circle') matches.push(node);
      if (selector === 'ellipse' && node.tagName === 'ellipse') matches.push(node);
      if (selector === 'line' && node.tagName === 'line') matches.push(node);
      if (selector === 'path' && node.tagName === 'path') matches.push(node);
      if (selector === 'polyline' && node.tagName === 'polyline') matches.push(node);
      if (selector === 'polygon' && node.tagName === 'polygon') matches.push(node);
      if (selector === '[data-drawio-type]' && node.dataset.drawioType) matches.push(node);
      for (const child of node.children) visit(child);
    };
    visit(this);
    return matches;
  }
}

function extractDrawioExporter(html) {
  const start = html.indexOf('    function xmlEscape');
  const end = html.indexOf('    function downloadTextFile');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const source = html.slice(start, end);
  return new Function(`${source}; return { buildDrawioFromSvg, auditDrawioCoverage };`)();
}

function exportedNode() {
  return new FakeElement('rect', {
    'data-drawio-type': 'component',
    'data-drawio-id': 'exported-node',
    x: '20',
    y: '20',
    width: '90',
    height: '44',
    rx: '10',
    fill: '#D8E8D8',
    stroke: '#76B985',
    'stroke-width': '2'
  });
}

function fakeCoverageGapSvg() {
  return new FakeElement('svg', { viewBox: '0 0 260 140' }, [
    new FakeElement('title', {}, [], 'Coverage gap'),
    exportedNode(),
    new FakeElement('text', {
      x: '150',
      y: '44',
      fill: '#3D3C38',
      'font-size': '13',
      'font-weight': '600'
    }, [], 'Unexported caption')
  ]);
}

function fakeIgnoredWithoutReasonSvg() {
  return new FakeElement('svg', { viewBox: '0 0 260 140' }, [
    new FakeElement('title', {}, [], 'Missing ignore reason'),
    exportedNode(),
    new FakeElement('rect', {
      'data-drawio-ignore': 'true',
      x: '144',
      y: '20',
      width: '82',
      height: '44',
      rx: '10',
      fill: '#FAF9F5',
      stroke: '#C9C3B8',
      'stroke-width': '1'
    })
  ]);
}

function fakeIgnoredWithReasonSvg() {
  return new FakeElement('svg', { viewBox: '0 0 260 140' }, [
    new FakeElement('title', {}, [], 'Ignored with reason'),
    exportedNode(),
    new FakeElement('rect', {
      'data-drawio-ignore': 'true',
      'data-drawio-ignore-reason': 'paper background is represented by the draw.io page',
      x: '0',
      y: '0',
      width: '260',
      height: '140',
      rx: '12',
      fill: '#FAF9F5'
    })
  ]);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} rejects meaningful visible SVG elements missing Draw.io coverage`, () => {
    const { buildDrawioFromSvg, auditDrawioCoverage } = extractDrawioExporter(html);

    const warnings = auditDrawioCoverage(fakeCoverageGapSvg());
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Unexported caption/);

    assert.throws(
      () => buildDrawioFromSvg(fakeCoverageGapSvg()),
      /Draw\.io coverage audit failed[\s\S]*Unexported caption/
    );
  });

  test(`${file} warns in runtime coverage mode while still returning Draw.io XML`, () => {
    const { buildDrawioFromSvg } = extractDrawioExporter(html);
    const warnings = [];

    const drawio = buildDrawioFromSvg(fakeCoverageGapSvg(), {
      strictCoverage: false,
      onCoverageWarning: (items) => warnings.push(...items)
    });

    assert.match(drawio, /<mxfile/);
    assert.match(drawio, /id="exported-node"/);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Unexported caption/);
  });

  test(`${file} requires explicit reasons for ignored visible SVG elements`, () => {
    const { buildDrawioFromSvg, auditDrawioCoverage } = extractDrawioExporter(html);

    const warnings = auditDrawioCoverage(fakeIgnoredWithoutReasonSvg());
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /data-drawio-ignore-reason/);

    assert.throws(
      () => buildDrawioFromSvg(fakeIgnoredWithoutReasonSvg()),
      /data-drawio-ignore-reason/
    );
  });

  test(`${file} accepts ignored visible SVG elements with explicit reasons`, () => {
    const { buildDrawioFromSvg, auditDrawioCoverage } = extractDrawioExporter(html);

    assert.deepEqual(auditDrawioCoverage(fakeIgnoredWithReasonSvg()), []);
    assert.match(buildDrawioFromSvg(fakeIgnoredWithReasonSvg()), /id="exported-node"/);
  });
}
