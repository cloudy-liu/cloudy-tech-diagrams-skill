import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(
  new URL('../examples/runtime-mechanism.html', import.meta.url),
  'utf8'
);

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
      if (selector === 'path' && node.tagName === 'path') matches.push(node);
      if (selector === '[data-drawio-type]' && node.dataset.drawioType) matches.push(node);
      for (const child of node.children) visit(child);
    };
    visit(this);
    return matches;
  }
}

function extractDrawioExporter(sourceHtml) {
  const start = sourceHtml.indexOf('    function xmlEscape');
  const end = sourceHtml.indexOf('    function downloadTextFile');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const source = sourceHtml.slice(start, end);
  return new Function(`${source}; return { buildDrawioFromSvg };`)().buildDrawioFromSvg;
}

function fakeRuntimeMechanismSvg() {
  return new FakeElement('svg', { viewBox: '0 0 460 220' }, [
    new FakeElement('title', {}, [], 'Runtime mechanism export'),
    new FakeElement('g', {
      'data-drawio-type': 'boundary',
      'data-drawio-role': 'runtime-boundary',
      'data-drawio-id': 'runtime'
    }, [
      new FakeElement('rect', {
        x: '120',
        y: '24',
        width: '220',
        height: '156',
        rx: '18',
        fill: '#F6F3EC',
        stroke: '#B8B3AA',
        'stroke-width': '1.5',
        'stroke-dasharray': '8 6'
      }),
      new FakeElement('text', {
        x: '140',
        y: '50',
        fill: '#6F6C65',
        'font-size': '13',
        'font-weight': '600'
      }, [], 'Runtime Boundary')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'component',
      'data-drawio-role': 'trigger',
      'data-drawio-id': 'trigger'
    }, [
      new FakeElement('rect', {
        x: '20',
        y: '76',
        width: '84',
        height: '52',
        rx: '12',
        fill: '#EDEAE3',
        stroke: '#9A9991',
        'stroke-width': '2'
      }),
      new FakeElement('text', {
        x: '62',
        y: '107',
        fill: '#3D3C38',
        'font-size': '14',
        'font-weight': '600',
        'text-anchor': 'middle'
      }, [], 'Trigger')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'component',
      'data-drawio-role': 'state-store',
      'data-drawio-id': 'state-store'
    }, [
      new FakeElement('rect', {
        x: '168',
        y: '76',
        width: '102',
        height: '52',
        rx: '12',
        fill: '#E4EEF4',
        stroke: '#6A9BCC',
        'stroke-width': '2'
      }),
      new FakeElement('text', {
        x: '219',
        y: '107',
        fill: '#3D3C38',
        'font-size': '14',
        'font-weight': '600',
        'text-anchor': 'middle'
      }, [], 'State Store')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'component',
      'data-drawio-role': 'observable-output',
      'data-drawio-id': 'observable-output'
    }, [
      new FakeElement('rect', {
        x: '356',
        y: '76',
        width: '84',
        height: '52',
        rx: '12',
        fill: '#FAF9F5',
        stroke: '#B8B3AA',
        'stroke-width': '2',
        'stroke-dasharray': '7 5'
      }),
      new FakeElement('text', {
        x: '398',
        y: '107',
        fill: '#3D3C38',
        'font-size': '14',
        'font-weight': '600',
        'text-anchor': 'middle'
      }, [], 'Output')
    ]),
    new FakeElement('g', {
      'data-drawio-type': 'edge',
      'data-drawio-role': 'causal-flow',
      'data-drawio-id': 'trigger-to-store',
      'data-drawio-source': 'trigger',
      'data-drawio-target': 'state-store',
      'data-drawio-label': 'updates'
    }, [
      new FakeElement('path', {
        d: 'M 104 102 C 128 102 144 102 168 102',
        fill: 'none',
        stroke: '#9A9991',
        'stroke-width': '1.6',
        'marker-end': 'url(#arrowhead)'
      }),
      new FakeElement('text', {
        x: '136',
        y: '88',
        fill: '#6F6C65',
        'font-size': '11',
        'font-weight': '500',
        'text-anchor': 'middle'
      }, [], 'updates')
    ])
  ]);
}

function drawioCell(drawio, id) {
  const match = drawio.match(new RegExp(`<mxCell id="${id}"[\\s\\S]*?</mxCell>`));
  assert.ok(match, `missing Draw.io cell ${id}`);
  return match[0];
}

test('runtime mechanism roles export as editable Draw.io cells', () => {
  const buildDrawioFromSvg = extractDrawioExporter(html);
  const drawio = buildDrawioFromSvg(fakeRuntimeMechanismSvg());

  assert.match(drawio, /<mxfile/);
  assert.doesNotMatch(drawio, /data:image\/(?:svg\+xml|png)/);
  assert.match(drawioCell(drawio, 'runtime'), /cloudyRole=runtime-boundary/);
  assert.match(drawioCell(drawio, 'trigger'), /cloudyRole=trigger/);
  assert.match(drawioCell(drawio, 'state-store'), /cloudyRole=state-store/);
  assert.match(drawioCell(drawio, 'observable-output'), /cloudyRole=observable-output/);
  assert.match(drawioCell(drawio, 'trigger-to-store'), /cloudyRole=causal-flow/);
  assert.match(drawioCell(drawio, 'trigger-to-store'), /data-drawio-source="trigger"/);
  assert.match(drawioCell(drawio, 'trigger-to-store'), /data-drawio-target="state-store"/);
  assert.match(drawio, /Runtime Boundary/);
  assert.match(drawio, /value="updates"/);
});

test('runtime mechanism example annotates causal connectors for later editing', () => {
  const causalEdges = html.match(/data-drawio-role="causal-flow"/g) || [];
  assert.ok(causalEdges.length >= 6);
  assert.doesNotMatch(
    html,
    /data-drawio-role="causal-flow"(?![^>]*data-drawio-source=)/
  );
  assert.doesNotMatch(
    html,
    /data-drawio-role="causal-flow"(?![^>]*data-drawio-target=)/
  );
});
