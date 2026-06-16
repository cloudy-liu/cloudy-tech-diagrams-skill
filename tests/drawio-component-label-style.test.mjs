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

function drawioCell(drawio, id) {
  const match = drawio.match(new RegExp(`<mxCell id="${id}"[\\s\\S]*?</mxCell>`));
  assert.ok(match, `missing Draw.io cell ${id}`);
  return match[0];
}

function fakeComponentLabelSvg() {
  return new FakeElement('svg', { viewBox: '0 0 360 180' }, [
    new FakeElement('title', {}, [], 'Component label style'),
    new FakeElement('g', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'styled-component'
    }, [
      new FakeElement('rect', {
        x: '40',
        y: '40',
        width: '180',
        height: '88',
        rx: '18',
        fill: '#FFFFFF',
        stroke: '#C9D7EA',
        'stroke-width': '1.5'
      }),
      new FakeElement('text', {
        x: '130',
        y: '76',
        fill: '#3D3C38',
        'font-size': '15',
        'font-weight': '700',
        'text-anchor': 'middle'
      }, [], 'API Gateway'),
      new FakeElement('text', {
        x: '130',
        y: '99',
        'font-size': '12',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], 'FastAPI :8000')
    ])
  ]);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports component text primitives with title styling and darker fallback sublabel color`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeComponentLabelSvg(), { strictCoverage: false });
    const box = drawioCell(drawio, 'styled-component');
    const title = drawioCell(drawio, 'styled-component-inner-text-0');
    const sublabel = drawioCell(drawio, 'styled-component-inner-text-1');

    assert.match(box, /value=""/);
    assert.match(title, /value="API Gateway"/);
    assert.match(title, /html=1/);
    assert.match(title, /fontSize=15/);
    assert.match(title, /fontColor=#3D3C38/);
    assert.match(title, /fontStyle=1/);
    assert.match(sublabel, /value="FastAPI :8000"/);
    assert.match(sublabel, /fontSize=12/);
    assert.match(sublabel, /fontColor=#5F5A54/);
    assert.match(sublabel, /fontStyle=0/);
    assert.doesNotMatch(sublabel, /fontColor=#6F6C65/);
  });
}
