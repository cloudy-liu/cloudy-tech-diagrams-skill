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

function fakeNestedPrimitiveSvg() {
  return new FakeElement('svg', { viewBox: '0 0 320 220' }, [
    new FakeElement('title', {}, [], 'Nested primitives'),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'data-sources',
      x: '40',
      y: '30',
      width: '160',
      height: '130',
      rx: '14',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '2'
    }),
    new FakeElement('text', {
      x: '120',
      y: '58',
      fill: '#3D3C38',
      'font-size': '15',
      'font-weight': '600',
      'text-anchor': 'middle'
    }, [], 'Data Sources'),
    new FakeElement('rect', {
      x: '66',
      y: '78',
      width: '108',
      height: '24',
      rx: '12',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1'
    }),
    new FakeElement('text', {
      x: '120',
      y: '95',
      fill: '#5F5A54',
      'font-size': '11',
      'font-weight': '600',
      'text-anchor': 'middle'
    }, [], 'Linux ftrace')
  ]);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports nested component primitives as editable Draw.io cells`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeNestedPrimitiveSvg());

    assert.match(drawio, /id="data-sources"/);
    assert.match(drawio, /id="data-sources-inner-rect-0"/);
    assert.match(drawio, /id="data-sources-inner-text-0"/);
    assert.match(drawio, /id="data-sources-inner-text-1"/);
    assert.match(drawio, /value="Linux ftrace"/);
    assert.match(drawio, /x="66" y="78" width="108" height="24"/);
    assert.match(drawio, /fontColor=#5F5A54/);
    assert.match(drawio, /fontSize=11/);
    assert.match(drawio, /fontStyle=1/);
    assert.doesNotMatch(drawio, /Data Sources[\s\S]*Linux ftrace[\s\S]*<\/div>/);
  });
}
