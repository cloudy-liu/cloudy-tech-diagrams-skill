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
      if (selector === 'rect' && node.tagName === 'rect') matches.push(node);
      if (selector === 'text' && node.tagName === 'text') matches.push(node);
      if (selector === 'line' && node.tagName === 'line') matches.push(node);
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

function fakeRoleAnnotatedSvg() {
  return new FakeElement('svg', { viewBox: '0 0 360 220' }, [
    new FakeElement('title', {}, [], 'Role annotated diagram'),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-role': 'card',
      'data-drawio-id': 'summary-card',
      x: '20',
      y: '30',
      width: '150',
      height: '72',
      rx: '12',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1.5'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-role': 'caption',
      'data-drawio-id': 'sheet-caption',
      'data-drawio-width': '160',
      'data-drawio-height': '18',
      x: '20',
      y: '130',
      fill: '#6F6C65',
      'font-size': '11'
    }, [], 'Diagram-owned caption'),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-role': 'legend-swatch',
      'data-drawio-id': 'legend-compute-swatch',
      x: '210',
      y: '52',
      width: '18',
      height: '11',
      rx: '3',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '1'
    }),
    new FakeElement('line', {
      'data-drawio-type': 'edge',
      'data-drawio-role': 'flow',
      'data-drawio-id': 'primary-flow',
      x1: '210',
      y1: '110',
      x2: '300',
      y2: '110',
      stroke: '#9A9991',
      'stroke-width': '1.6',
      'marker-end': 'url(#arrowhead)'
    })
  ]);
}

function fakeIgnoredSvg() {
  return new FakeElement('svg', { viewBox: '0 0 260 120' }, [
    new FakeElement('title', {}, [], 'Ignored annotations'),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'exported-node',
      x: '20',
      y: '20',
      width: '80',
      height: '40',
      rx: '8',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '2'
    }),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'decorative-grid',
      'data-drawio-ignore': 'true',
      'data-drawio-ignore-reason': 'decorative alignment guide',
      x: '130',
      y: '20',
      width: '80',
      height: '40',
      rx: '8',
      fill: 'none',
      stroke: '#C9C3B8',
      'stroke-width': '1'
    })
  ]);
}

test('base template demonstrates annotation roles and explicit ignore reason semantics', () => {
  const template = readFileSync(new URL('../assets/template.html', import.meta.url), 'utf8');

  assert.match(template, /data-drawio-role="region"/);
  assert.match(template, /data-drawio-role="legend-swatch"/);
  assert.match(template, /data-drawio-role="scope-note"/);
  assert.match(template, /data-drawio-ignore="true"[^>]+data-drawio-ignore-reason="/);
});

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} preserves Draw.io annotation roles in exported cells`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeRoleAnnotatedSvg());

    assert.match(drawio, /id="summary-card"[\s\S]*?cloudyRole=card/);
    assert.match(drawio, /id="sheet-caption"[\s\S]*?cloudyRole=caption/);
    assert.match(drawio, /id="legend-compute-swatch"[\s\S]*?cloudyRole=legend-swatch/);
    assert.match(drawio, /id="primary-flow"[\s\S]*?cloudyRole=flow/);
  });

  test(`${file} skips explicitly ignored Draw.io annotations`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeIgnoredSvg());

    assert.match(drawio, /id="exported-node"/);
    assert.doesNotMatch(drawio, /id="decorative-grid"/);
  });
}
