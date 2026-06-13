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
      if (selector === 'path' && node.tagName === 'path') matches.push(node);
      if (selector === 'text' && node.tagName === 'text') matches.push(node);
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
  return new Function(`${source}; return { buildDrawioFromSvg };`)().buildDrawioFromSvg;
}

function fakeCurvedEdgeSvg() {
  return new FakeElement('svg', { viewBox: '0 0 320 180' }, [
    new FakeElement('title', {}, [], 'Sampled curve'),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'sampled-curve',
      'data-drawio-role': 'flow',
      'data-drawio-label': 'sampled'
    }, [
      new FakeElement('path', {
        d: 'M 100 100 C 130 40, 210 40, 240 100',
        fill: 'none',
        stroke: '#527AA0',
        'stroke-width': '1.6',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '170',
        y: '58',
        fill: '#527AA0',
        'font-size': '12',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], 'sampled')
    ])
  ]);
}

function fakeLinearPathSvg() {
  return new FakeElement('svg', { viewBox: '0 0 220 140' }, [
    new FakeElement('title', {}, [], 'Linear path'),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'linear-elbow',
      'data-drawio-label': 'linear'
    }, [
      new FakeElement('path', {
        d: 'M 20 30 L 120 30 L 120 90',
        fill: 'none',
        stroke: '#BFA777',
        'stroke-width': '1.8',
        'stroke-dasharray': '5 5',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '92',
        y: '24',
        fill: '#A45D45',
        'font-size': '11',
        'font-weight': '600'
      }, [], 'linear')
    ])
  ]);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} samples cubic Bezier paths instead of exporting control points as waypoints`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeCurvedEdgeSvg());

    assert.match(drawio, /id="sampled-curve"/);
    assert.match(drawio, /strokeColor=#527AA0/);
    assert.match(drawio, /endArrow=open/);
    assert.match(drawio, /value="sampled"/);
    assert.match(drawio, /fontColor=#527AA0/);
    assert.match(drawio, /<mxPoint x="100" y="100" as="sourcePoint"\/>/);
    assert.match(drawio, /<mxPoint x="240" y="100" as="targetPoint"\/>/);
    assert.match(drawio, /<mxPoint x="170" y="55"\/>/);
    assert.doesNotMatch(drawio, /<mxPoint x="130" y="40"\/>/);
    assert.doesNotMatch(drawio, /<mxPoint x="210" y="40"\/>/);
  });

  test(`${file} preserves linear path visual points`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeLinearPathSvg());

    assert.match(drawio, /id="linear-elbow"/);
    assert.match(drawio, /strokeColor=#BFA777/);
    assert.match(drawio, /dashed=1/);
    assert.match(drawio, /fixDash=1/);
    assert.match(drawio, /dashPattern=2.78 2.78/);
    assert.match(drawio, /endArrow=open/);
    assert.match(drawio, /value="linear"/);
    assert.match(drawio, /fontColor=#A45D45/);
    assert.match(drawio, /<mxPoint x="20" y="30" as="sourcePoint"\/>/);
    assert.match(drawio, /<mxPoint x="120" y="30"\/>/);
    assert.match(drawio, /<mxPoint x="120" y="90" as="targetPoint"\/>/);
  });
}
