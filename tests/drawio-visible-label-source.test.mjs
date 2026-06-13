import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const htmlFiles = [
  'assets/template.html',
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html'
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

function fakeVisibleLabelSourceSvg() {
  return new FakeElement('svg', { viewBox: '0 0 420 220' }, [
    new FakeElement('title', {}, [], 'Visible label source'),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'visible-caption',
      'data-drawio-label': 'Internal caption note',
      'data-drawio-width': '160',
      'data-drawio-height': '20',
      x: '24',
      y: '36',
      fill: '#527AA0',
      'font-size': '14',
      'font-weight': '700'
    }, [], 'Visible Caption'),
    new FakeElement('g', {
      'data-drawio-type': 'boundary',
      'data-drawio-id': 'visible-boundary',
      'data-drawio-label': 'Internal boundary note'
    }, [
      new FakeElement('rect', {
        x: '20',
        y: '64',
        width: '180',
        height: '92',
        rx: '14',
        fill: '#F6F3EC',
        stroke: '#B8B3AA',
        'stroke-width': '1.5'
      }),
      new FakeElement('text', {
        x: '40',
        y: '92',
        fill: '#6F6C65',
        'font-size': '13',
        'font-weight': '600'
      }, [], 'Visible Boundary')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'visible-edge',
      'data-drawio-label': 'Internal flow note'
    }, [
      new FakeElement('line', {
        x1: '230',
        y1: '112',
        x2: '360',
        y2: '112',
        stroke: '#9A9991',
        'stroke-width': '1.6',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '295',
        y: '96',
        fill: '#A45D45',
        'font-size': '13',
        'font-weight': '700',
        'text-anchor': 'middle'
      }, [], 'Visible Flow')
    ])
  ]);
}

function fakeMatchingVisibleLabelSvg() {
  return new FakeElement('svg', { viewBox: '0 0 240 140' }, [
    new FakeElement('title', {}, [], 'Matching visible label'),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'matching-edge',
      'data-drawio-label': 'Visible Flow'
    }, [
      new FakeElement('line', {
        x1: '30',
        y1: '70',
        x2: '200',
        y2: '70',
        stroke: '#76B985',
        'stroke-width': '2',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '115',
        y: '54',
        fill: '#527AA0',
        'font-size': '12',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], 'Visible Flow')
    ])
  ]);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports visible SVG label text before data-drawio-label fallback`, () => {
    const { buildDrawioFromSvg } = extractDrawioExporter(html);

    const drawio = buildDrawioFromSvg(fakeVisibleLabelSourceSvg(), { strictCoverage: false });

    assert.match(drawio, /id="visible-caption"[\s\S]*?value="Visible Caption"/);
    assert.match(drawio, /id="visible-boundary"[\s\S]*?Visible Boundary/);
    assert.match(drawio, /id="visible-edge"[\s\S]*?value="Visible Flow"/);
    assert.doesNotMatch(drawio, /Internal caption note/);
    assert.doesNotMatch(drawio, /Internal boundary note/);
    assert.doesNotMatch(drawio, /Internal flow note/);
  });

  test(`${file} fails strict audit when data-drawio-label differs from visible text`, () => {
    const { buildDrawioFromSvg, auditDrawioCoverage } = extractDrawioExporter(html);

    const warnings = auditDrawioCoverage(fakeVisibleLabelSourceSvg());

    assert.ok(warnings.some((warning) => /visible-caption[\s\S]*Internal caption note[\s\S]*Visible Caption/.test(warning)));
    assert.ok(warnings.some((warning) => /visible-boundary[\s\S]*Internal boundary note[\s\S]*Visible Boundary/.test(warning)));
    assert.ok(warnings.some((warning) => /visible-edge[\s\S]*Internal flow note[\s\S]*Visible Flow/.test(warning)));
    assert.throws(
      () => buildDrawioFromSvg(fakeVisibleLabelSourceSvg()),
      /Draw\.io coverage audit failed[\s\S]*data-drawio-label[\s\S]*Visible Flow/
    );
  });

  test(`${file} derives edge label style from visible SVG text`, () => {
    const { buildDrawioFromSvg } = extractDrawioExporter(html);

    const drawio = buildDrawioFromSvg(fakeMatchingVisibleLabelSvg());

    assert.match(drawio, /id="matching-edge"[\s\S]*?value="Visible Flow"/);
    assert.match(drawio, /id="matching-edge"[\s\S]*?fontSize=12/);
    assert.match(drawio, /id="matching-edge"[\s\S]*?fontColor=#527AA0/);
    assert.match(drawio, /id="matching-edge"[\s\S]*?fontStyle=0/);
  });
}
