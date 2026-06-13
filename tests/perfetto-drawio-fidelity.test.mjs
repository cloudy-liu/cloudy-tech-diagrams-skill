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
      if (selector === 'circle' && node.tagName === 'circle') matches.push(node);
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

function fakeStandaloneSemanticSvg() {
  return new FakeElement('svg', { viewBox: '0 0 360 220' }, [
    new FakeElement('title', {}, [], 'Standalone semantic elements'),
    new FakeElement('rect', {
      'data-drawio-type': 'component',
      'data-drawio-id': 'container',
      x: '20',
      y: '50',
      width: '180',
      height: '100',
      rx: '12',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1.5'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'lane-heading',
      'data-drawio-width': '128',
      'data-drawio-height': '20',
      x: '110',
      y: '86',
      fill: '#5F5A54',
      'font-size': '14',
      'font-weight': '700',
      'text-anchor': 'middle'
    }, [], 'Lane heading'),
    new FakeElement('circle', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'header-icon',
      cx: '270',
      cy: '80',
      r: '18',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '2'
    }),
    new FakeElement('line', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'lane-divider',
      x1: '220',
      y1: '40',
      x2: '220',
      y2: '160',
      stroke: '#C9C3B8',
      'stroke-width': '1.2',
      'stroke-dasharray': '5 5'
    }),
    new FakeElement('line', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'arrow-connector',
      x1: '240',
      y1: '160',
      x2: '320',
      y2: '160',
      stroke: '#9A9991',
      'stroke-width': '1.6',
      'marker-end': 'url(#arrowhead)'
    })
  ]);
}

function fakeLegendSemanticSvg() {
  return new FakeElement('svg', { viewBox: '0 0 1180 760' }, [
    new FakeElement('title', {}, [], 'Legend semantic elements'),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'legend-heading',
      'data-drawio-width': '88',
      'data-drawio-height': '18',
      x: '54',
      y: '660',
      fill: '#3D3C38',
      'font-size': '13',
      'font-weight': '700'
    }, [], 'Legend'),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'legend-recording-swatch',
      x: '54',
      y: '678',
      width: '18',
      height: '11',
      rx: '3',
      fill: '#D8E8D8',
      stroke: '#76B985',
      'stroke-width': '1'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'legend-recording-label',
      'data-drawio-width': '132',
      'data-drawio-height': '16',
      x: '80',
      y: '687',
      fill: '#6F6C65',
      'font-size': '11'
    }, [], 'recording components'),
    new FakeElement('line', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'legend-trace-flow-line',
      x1: '794',
      y1: '683',
      x2: '830',
      y2: '683',
      stroke: '#9A9991',
      'stroke-width': '1.6',
      'marker-end': 'url(#arrow-primary)'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'legend-trace-flow-label',
      'data-drawio-width': '72',
      'data-drawio-height': '16',
      x: '840',
      y: '687',
      fill: '#6F6C65',
      'font-size': '11'
    }, [], 'trace flow'),
    new FakeElement('line', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'legend-artifact-handoff-line',
      x1: '930',
      y1: '683',
      x2: '966',
      y2: '683',
      stroke: '#BFA777',
      'stroke-width': '1.6',
      'stroke-dasharray': '5 5',
      'marker-end': 'url(#arrow-event)'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'legend-artifact-handoff-label',
      'data-drawio-width': '98',
      'data-drawio-height': '16',
      x: '976',
      y: '687',
      fill: '#6F6C65',
      'font-size': '11'
    }, [], 'artifact handoff'),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'legend-scope-callout',
      x: '54',
      y: '718',
      width: '1072',
      height: '28',
      rx: '12',
      fill: '#F6F3EC',
      stroke: '#C9C3B8',
      'stroke-width': '1'
    }),
    new FakeElement('text', {
      'data-drawio-type': 'label',
      'data-drawio-id': 'legend-scope-label',
      'data-drawio-width': '1030',
      'data-drawio-height': '18',
      x: '70',
      y: '737',
      fill: '#6F6C65',
      'font-size': '11',
      'font-weight': '500'
    }, [], 'Scope: this is a project architecture map.')
  ]);
}

function assertDrawioElement(html, id, type) {
  const pattern = new RegExp(
    `<[^>]+\\bdata-drawio-type="${type}"(?=[^>]*\\bdata-drawio-id="${id}")[^>]*>|` +
    `<[^>]+\\bdata-drawio-id="${id}"(?=[^>]*\\bdata-drawio-type="${type}")[^>]*>`,
    's'
  );
  assert.match(html, pattern);
}

test('Perfetto sample annotates tracing lane labels and separators for Draw.io export', () => {
  const html = readFileSync(new URL('../examples/perfetto-docs-architecture.html', import.meta.url), 'utf8');

  assertDrawioElement(html, 'system-tracing-label', 'label');
  assertDrawioElement(html, 'chrome-tracing-label', 'label');
  assertDrawioElement(html, 'in-app-tracing-label', 'label');
  assertDrawioElement(html, 'record-tracing-divider-system-chrome', 'edge');
  assertDrawioElement(html, 'record-tracing-divider-chrome-app', 'edge');
});

test('Perfetto sample annotates domain header icons and headings for Draw.io export', () => {
  const html = readFileSync(new URL('../examples/perfetto-docs-architecture.html', import.meta.url), 'utf8');

  assertDrawioElement(html, 'record-traces-icon-circle', 'shape');
  assertDrawioElement(html, 'record-traces-icon-body', 'shape');
  assertDrawioElement(html, 'record-traces-icon-top', 'shape');
  assertDrawioElement(html, 'record-traces-heading', 'label');
  assertDrawioElement(html, 'analyze-traces-icon-circle', 'shape');
  assertDrawioElement(html, 'analyze-traces-icon-bar-short', 'shape');
  assertDrawioElement(html, 'analyze-traces-icon-bar-mid', 'shape');
  assertDrawioElement(html, 'analyze-traces-icon-bar-tall', 'shape');
  assertDrawioElement(html, 'analyze-traces-heading', 'label');
  assertDrawioElement(html, 'visualize-traces-icon-circle', 'shape');
  assertDrawioElement(html, 'visualize-traces-icon-screen', 'shape');
  assertDrawioElement(html, 'visualize-traces-icon-base', 'edge');
  assertDrawioElement(html, 'visualize-traces-heading', 'label');
});

test('Perfetto sample annotates legend and scope callout for Draw.io export', () => {
  const html = readFileSync(new URL('../examples/perfetto-docs-architecture.html', import.meta.url), 'utf8');

  assertDrawioElement(html, 'legend-heading', 'label');
  assertDrawioElement(html, 'legend-recording-swatch', 'shape');
  assertDrawioElement(html, 'legend-recording-label', 'label');
  assertDrawioElement(html, 'legend-analysis-swatch', 'shape');
  assertDrawioElement(html, 'legend-analysis-label', 'label');
  assertDrawioElement(html, 'legend-visualization-swatch', 'shape');
  assertDrawioElement(html, 'legend-visualization-label', 'label');
  assertDrawioElement(html, 'legend-shared-library-swatch', 'shape');
  assertDrawioElement(html, 'legend-shared-library-label', 'label');
  assertDrawioElement(html, 'legend-trace-flow-line', 'edge');
  assertDrawioElement(html, 'legend-trace-flow-label', 'label');
  assertDrawioElement(html, 'legend-artifact-handoff-line', 'edge');
  assertDrawioElement(html, 'legend-artifact-handoff-label', 'label');
  assertDrawioElement(html, 'legend-scope-callout', 'shape');
  assertDrawioElement(html, 'legend-scope-label', 'label');
});

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports standalone semantic labels, shapes, and arrowless dividers`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeStandaloneSemanticSvg());

    assert.match(drawio, /id="lane-heading"/);
    assert.match(drawio, /value="Lane heading"/);
    assert.match(drawio, /fontColor=#5F5A54/);
    assert.match(drawio, /fontSize=14/);
    assert.match(drawio, /fontStyle=1/);
    assert.match(drawio, /x="46" y="72" width="128" height="20"/);
    assert.match(drawio, /id="header-icon"/);
    assert.match(drawio, /style="[^"]*ellipse/);
    assert.match(drawio, /x="252" y="62" width="36" height="36"/);
    assert.match(drawio, /id="lane-divider"/);
    assert.match(drawio, /dashed=1/);
    assert.match(drawio, /fixDash=1/);
    assert.match(drawio, /dashPattern=4.17 4.17/);
    assert.match(drawio, /endArrow=none/);
    assert.doesNotMatch(drawio, /id="lane-divider"(?:(?!<\/mxCell>)[\s\S])*endArrow=open/);
    assert.match(drawio, /id="arrow-connector"[\s\S]*?endArrow=open/);
    assert.doesNotMatch(drawio, /id="container-inner-text-/);
  });

  test(`${file} exports legend keys and scope callouts as Draw.io cells`, () => {
    const buildDrawioFromSvg = extractDrawioExporter(html);
    const drawio = buildDrawioFromSvg(fakeLegendSemanticSvg());

    assert.match(drawio, /id="legend-heading"/);
    assert.match(drawio, /value="Legend"/);
    assert.match(drawio, /id="legend-recording-swatch"/);
    assert.match(drawio, /fillColor=#D8E8D8/);
    assert.match(drawio, /id="legend-recording-label"/);
    assert.match(drawio, /value="recording components"/);
    assert.match(drawio, /id="legend-trace-flow-line"/);
    assert.match(drawio, /id="legend-trace-flow-line"[\s\S]*?endArrow=open/);
    assert.match(drawio, /id="legend-artifact-handoff-line"/);
    assert.match(drawio, /dashed=1/);
    assert.match(drawio, /fixDash=1/);
    assert.match(drawio, /dashPattern=3.13 3.13/);
    assert.match(drawio, /id="legend-artifact-handoff-line"[\s\S]*?endArrow=open/);
    assert.match(drawio, /id="legend-scope-callout"/);
    assert.match(drawio, /x="54" y="718" width="1072" height="28"/);
    assert.match(drawio, /id="legend-scope-label"/);
    assert.match(drawio, /Scope: this is a project architecture map\./);
  });
}
