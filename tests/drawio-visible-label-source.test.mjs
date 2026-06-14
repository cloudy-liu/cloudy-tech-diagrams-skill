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

function fakePerfettoEdgeLabelSvg() {
  return new FakeElement('svg', { viewBox: '0 68 1180 692' }, [
    new FakeElement('title', {}, [], 'Perfetto edge labels'),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'trace-file-to-importers',
      'data-drawio-label': 'trace artifact'
    }, [
      new FakeElement('path', {
        d: 'M 568 571 C 626 568, 662 520, 704 357',
        fill: 'none',
        stroke: '#BFA777',
        'stroke-width': '1.6',
        'stroke-dasharray': '5 5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'marker-end': 'url(#arrow-event)'
      }),
      new FakeElement('text', {
        x: '646',
        y: '446',
        fill: '#6F6C65',
        'font-size': '11',
        'font-weight': '500'
      }, [], 'trace artifact')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-id': 'processor-to-ui',
      'data-drawio-label': 'render'
    }, [
      new FakeElement('path', {
        d: 'M 872 212 C 900 212, 920 212, 954 212',
        fill: 'none',
        stroke: '#8585DD',
        'stroke-width': '1.6',
        'stroke-linecap': 'round',
        'marker-end': 'url(#arrow-ui)'
      }),
      new FakeElement('text', {
        x: '914',
        y: '198',
        fill: '#6F6C65',
        'font-size': '11',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], 'render')
    ])
  ]);
}

function drawioCell(drawio, id) {
  const match = drawio.match(new RegExp(`<mxCell id="${id}"[\\s\\S]*?</mxCell>`));
  assert.ok(match, `missing Draw.io cell ${id}`);
  return match[0];
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} exports visible SVG label text before data-drawio-label fallback`, () => {
    const { buildDrawioFromSvg } = extractDrawioExporter(html);

    const drawio = buildDrawioFromSvg(fakeVisibleLabelSourceSvg(), { strictCoverage: false });

    assert.match(drawio, /id="visible-caption"[\s\S]*?value="Visible Caption"/);
    assert.match(drawio, /id="visible-boundary"[\s\S]*?Visible Boundary/);
    assert.match(drawioCell(drawio, 'visible-edge'), /value=""/);
    assert.match(drawioCell(drawio, 'visible-edge-label'), /data-drawio-edge-label-for="visible-edge"/);
    assert.match(drawioCell(drawio, 'visible-edge-label'), /value="Visible Flow"/);
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

    const edge = drawioCell(drawio, 'matching-edge');
    const label = drawioCell(drawio, 'matching-edge-label');

    assert.match(edge, /value=""/);
    assert.match(label, /data-drawio-edge-label-for="matching-edge"/);
    assert.match(label, /value="Visible Flow"/);
    assert.match(label, /fontSize=12/);
    assert.match(label, /fontColor=#527AA0/);
    assert.match(label, /fontStyle=0/);
    assert.match(label, /align=center/);
  });

  test(`${file} exports Perfetto edge labels as positioned native text cells`, () => {
    const { buildDrawioFromSvg } = extractDrawioExporter(html);

    const drawio = buildDrawioFromSvg(fakePerfettoEdgeLabelSvg());
    const traceEdge = drawioCell(drawio, 'trace-file-to-importers');
    const traceLabel = drawioCell(drawio, 'trace-file-to-importers-label');
    const renderEdge = drawioCell(drawio, 'processor-to-ui');
    const renderLabel = drawioCell(drawio, 'processor-to-ui-label');

    assert.match(traceEdge, /value=""/);
    assert.match(renderEdge, /value=""/);
    assert.match(traceLabel, /data-drawio-edge-label-for="trace-file-to-importers"/);
    assert.match(traceLabel, /value="trace artifact"/);
    assert.match(traceLabel, /fontColor=#6F6C65/);
    assert.match(traceLabel, /fontSize=11/);
    assert.match(traceLabel, /fontStyle=0/);
    assert.match(traceLabel, /align=left/);
    assert.match(traceLabel, /x="646" y="367" width="95.48" height="15.95"/);
    assert.match(renderLabel, /data-drawio-edge-label-for="processor-to-ui"/);
    assert.match(renderLabel, /value="render"/);
    assert.match(renderLabel, /fontColor=#6F6C65/);
    assert.match(renderLabel, /fontSize=11/);
    assert.match(renderLabel, /fontStyle=0/);
    assert.match(renderLabel, /align=center/);
    assert.match(renderLabel, /x="893.54" y="119" width="40.92" height="15.95"/);
  });
}
