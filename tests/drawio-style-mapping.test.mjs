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

function fakeStyleMappingSvg() {
  return new FakeElement('svg', { viewBox: '0 0 520 260' }, [
    new FakeElement('title', {}, [], 'Style mapping'),
    new FakeElement('rect', {
      'data-drawio-type': 'boundary',
      'data-drawio-id': 'calibrated-boundary',
      'data-drawio-label': 'Boundary',
      x: '20',
      y: '24',
      width: '210',
      height: '128',
      rx: '24',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1.5',
      'stroke-dasharray': '8 6'
    }),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'calibrated-swatch',
      x: '270',
      y: '44',
      width: '92',
      height: '52',
      rx: '8',
      fill: '#F3E4DA',
      stroke: '#C88E6A',
      'stroke-width': '2',
      'stroke-dasharray': '6, 4'
    }),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'calibrated-edge',
      'data-drawio-label': 'handoff'
    }, [
      new FakeElement('path', {
        d: 'M 70 206 L 260 206 L 430 166',
        fill: 'none',
        stroke: '#BFA777',
        'stroke-width': '1.6',
        'stroke-dasharray': '5 5',
        'marker-start': 'url(#arrowhead)',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '260',
        y: '196',
        fill: '#A45D45',
        'font-size': '12',
        'font-weight': '700',
        'text-anchor': 'middle'
      }, [], 'handoff')
    ])
  ]);
}

test('skill documents calibrated Draw.io style approximations', () => {
  const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

  assert.match(skill, /dashPattern/);
  assert.match(skill, /stroke-dasharray/);
  assert.match(skill, /stroke-width/);
  assert.match(skill, /editable draw\.io-native approximation/);
});

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} calibrates dashed boundary, shape, and edge styles`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeStyleMappingSvg());

    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?fillColor=#F6F3EC/);
    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?strokeColor=#B8B3AA/);
    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?strokeWidth=1.5/);
    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?arcSize=24/);
    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?fixDash=1/);
    assert.match(drawio, /id="calibrated-boundary"[\s\S]*?dashPattern=5.33 4/);
    assert.doesNotMatch(drawio, /id="calibrated-boundary"[\s\S]*?dashPattern=8 6/);

    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?rounded=1/);
    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?fillColor=#F3E4DA/);
    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?strokeColor=#C88E6A/);
    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?strokeWidth=2/);
    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?fixDash=1/);
    assert.match(drawio, /id="calibrated-swatch"[\s\S]*?dashPattern=3 2/);

    assert.match(drawio, /id="calibrated-edge"[\s\S]*?strokeColor=#BFA777/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?strokeWidth=1.6/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?startArrow=open/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?startFill=0/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?endArrow=open/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?endFill=0/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?fontSize=12/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?fontColor=#A45D45/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?fontStyle=1/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?fixDash=1/);
    assert.match(drawio, /id="calibrated-edge"[\s\S]*?dashPattern=3.13 3.13/);
    assert.doesNotMatch(drawio, /id="calibrated-edge"[\s\S]*?dashPattern=5 5/);
  });
}
