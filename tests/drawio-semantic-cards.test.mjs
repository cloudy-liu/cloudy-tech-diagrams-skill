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

function fakeSemanticCardSvg() {
  return new FakeElement('svg', { viewBox: '0 0 340 220' }, [
    new FakeElement('title', {}, [], 'Semantic card'),
    new FakeElement('g', {
      'data-drawio-type': 'component',
      'data-drawio-role': 'card',
      'data-drawio-id': 'release-risk-card'
    }, [
      new FakeElement('rect', {
        x: '40',
        y: '40',
        width: '220',
        height: '116',
        rx: '14',
        fill: '#F6F3EC',
        stroke: '#C9C3B8',
        'stroke-width': '1.2'
      }),
      new FakeElement('rect', {
        x: '56',
        y: '58',
        width: '64',
        height: '20',
        rx: '10',
        fill: '#F0DED7',
        stroke: '#D87858',
        'stroke-width': '1'
      }),
      new FakeElement('text', {
        x: '88',
        y: '72',
        fill: '#8B6B55',
        'font-size': '10',
        'font-weight': '700',
        'text-anchor': 'middle'
      }, [], 'HOT PATH'),
      new FakeElement('text', {
        x: '56',
        y: '100',
        fill: '#3D3C38',
        'font-size': '14',
        'font-weight': '700'
      }, [], 'Release risk'),
      new FakeElement('text', {
        x: '56',
        y: '122',
        fill: '#6F6C65',
        'font-size': '12',
        'font-weight': '500'
      }, [], 'Gate rollout on trace health.')
    ])
  ]);
}

function mainSvg(html) {
  const match = html.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, 'expected a main SVG diagram');
  return match[0];
}

function assertSvgHasSemanticCard(svg) {
  assert.match(svg, /data-drawio-type="component"[^>]+data-drawio-role="card"/);
  assert.match(svg, /data-drawio-role="card-pill"/);
  assert.match(svg, /data-drawio-role="card-metric"|data-drawio-role="card-detail"/);
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports semantic card primitives as children of a movable parent cell`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeSemanticCardSvg());

    assert.match(drawio, /id="release-risk-card"[\s\S]*?cloudyRole=card/);
    assert.match(drawio, /id="release-risk-card"[\s\S]*?container=1/);
    assert.match(drawio, /id="release-risk-card-inner-rect-0"[\s\S]*?parent="release-risk-card"/);
    assert.match(drawio, /id="release-risk-card-inner-text-0"[\s\S]*?parent="release-risk-card"/);
    assert.match(drawio, /id="release-risk-card-inner-text-1"[\s\S]*?parent="release-risk-card"/);
    assert.match(drawio, /id="release-risk-card-inner-rect-0"[\s\S]*?x="16" y="18" width="64" height="20"/);
    assert.match(drawio, /id="release-risk-card-inner-text-0"[\s\S]*?value="HOT PATH"/);
    assert.match(drawio, /id="release-risk-card-inner-text-1"[\s\S]*?value="Release risk"/);
    assert.match(drawio, /id="release-risk-card-inner-text-1"[\s\S]*?x="16" y="46" width="188" height="19"/);
  });

  test(`${file} keeps at least one explanatory card inside the exportable SVG sheet`, () => {
    assertSvgHasSemanticCard(mainSvg(html));
  });
}
