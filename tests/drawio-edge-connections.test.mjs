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

function fakeEdgeConnectionSvg({ connect = false } = {}) {
  const edgeAttrs = {
    'data-drawio-type': 'edge',
    'data-drawio-id': connect ? 'connected-handoff' : 'semantic-handoff',
    'data-drawio-source': 'source-card',
    'data-drawio-target': 'target-card',
    'data-drawio-label': connect ? 'connected' : 'semantic'
  };

  if (connect) edgeAttrs['data-drawio-connect'] = 'true';

  return new FakeElement('svg', { viewBox: '0 0 420 180' }, [
    new FakeElement('title', {}, [], 'Edge connection semantics'),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'source-card',
      x: '30',
      y: '44',
      width: '110',
      height: '56',
      rx: '10',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1.5'
    }),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'target-card',
      x: '280',
      y: '44',
      width: '110',
      height: '56',
      rx: '10',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '1.5'
    }),
    new FakeElement('g', edgeAttrs, [
      new FakeElement('path', {
        d: 'M 140 72 L 210 72 L 280 72',
        fill: 'none',
        stroke: '#527AA0',
        'stroke-width': '1.6',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '210',
        y: '64',
        fill: '#527AA0',
        'font-size': '12',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], connect ? 'connected' : 'semantic')
    ])
  ]);
}

test('skill documents stable Draw.io edge source and target annotations', () => {
  const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

  assert.match(skill, /data-drawio-source/);
  assert.match(skill, /data-drawio-target/);
  assert.match(skill, /data-drawio-connect/);
  assert.match(skill, /fixed visual geometry/);
});

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} keeps annotated edge terminals as metadata without changing fixed geometry`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeEdgeConnectionSvg());

    assert.match(drawio, /id="semantic-handoff"/);
    assert.match(drawio, /data-drawio-source="source-card"/);
    assert.match(drawio, /data-drawio-target="target-card"/);
    assert.doesNotMatch(drawio, /id="semantic-handoff"[^>]*\ssource="source-card"/);
    assert.doesNotMatch(drawio, /id="semantic-handoff"[^>]*\starget="target-card"/);
    assert.match(drawio, /edgeStyle=none/);
    assert.match(drawio, /endArrow=open/);
    assert.match(drawio, /<mxPoint x="140" y="72" as="sourcePoint"\/>/);
    assert.match(drawio, /<mxPoint x="210" y="72"\/>/);
    assert.match(drawio, /<mxPoint x="280" y="72" as="targetPoint"\/>/);
  });

  test(`${file} only writes real Draw.io source and target terminals when explicitly enabled`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeEdgeConnectionSvg({ connect: true }));

    assert.match(drawio, /id="connected-handoff"[^>]*\ssource="source-card"/);
    assert.match(drawio, /id="connected-handoff"[^>]*\starget="target-card"/);
    assert.match(drawio, /data-drawio-source="source-card"/);
    assert.match(drawio, /data-drawio-target="target-card"/);
    assert.match(drawio, /<mxPoint x="140" y="72" as="sourcePoint"\/>/);
    assert.match(drawio, /<mxPoint x="210" y="72"\/>/);
    assert.match(drawio, /<mxPoint x="280" y="72" as="targetPoint"\/>/);
  });
}
