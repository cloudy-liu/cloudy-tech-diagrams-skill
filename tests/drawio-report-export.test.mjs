import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const htmlFiles = [
  'assets/template.html',
  'examples/web-app.html',
  'examples/microservices.html',
  'examples/perfetto-docs-architecture.html',
  'examples/runtime-mechanism.html',
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
      if (selector === '[data-drawio-type]' && node.dataset.drawioType) matches.push(node);
      for (const child of node.children) visit(child);
    };
    visit(this);
    return matches;
  }
}

class FakeDocument {
  constructor({ title, subtitle, svg }) {
    this.title = title;
    this.headerTitle = { textContent: title };
    this.subtitle = subtitle ? { textContent: subtitle } : null;
    this.svg = svg;
    this.toolbar = { textContent: 'Download Draw.io Copy Image' };
    this.footer = { textContent: 'Generated with Cloudy Tech Diagrams Skill' };
    this.pageSupportCard = { textContent: 'ASYNC SLO EDIT' };
  }

  querySelector(selector) {
    if (selector === '.header h1') return this.headerTitle;
    if (selector === '.subtitle') return this.subtitle;
    if (selector === '.diagram-container svg') return this.svg;
    if (selector === '.toolbar') return this.toolbar;
    if (selector === '.footer') return this.footer;
    if (selector === '.summary-card') return this.pageSupportCard;
    return null;
  }
}

function extractDrawioExporter(html) {
  const start = html.indexOf('    function xmlEscape');
  const end = html.indexOf('    function downloadTextFile');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const source = html.slice(start, end);
  return new Function(`${source}; return { buildDrawioReportFromDocument };`)().buildDrawioReportFromDocument;
}

function fakeSvgSheet() {
  return new FakeElement('svg', { viewBox: '0 68 1180 692' }, [
    new FakeElement('title', {}, [], 'SVG sheet title'),
    new FakeElement('rect', {
      'data-drawio-type': 'shape',
      'data-drawio-id': 'sheet-anchor',
      x: '54',
      y: '90',
      width: '240',
      height: '120',
      rx: '14',
      fill: '#F6F3EC',
      stroke: '#B8B3AA',
      'stroke-width': '1.5'
    })
  ]);
}

function fakeReportDocument() {
  return new FakeDocument({
    title: 'Perfetto Project Architecture',
    subtitle: 'A compact trace artifact flow across three domains.',
    svg: fakeSvgSheet()
  });
}

function drawioCell(drawio, id) {
  const match = drawio.match(new RegExp(`<mxCell id="${id}"[\\s\\S]*?</mxCell>`));
  assert.ok(match, `missing Draw.io cell ${id}`);
  return match[0];
}

for (const file of htmlFiles) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

  test(`${file} default Draw.io download uses the controlled report export`, () => {
    assert.match(html, /function buildDrawioReportFromDocument\(root = document, options = \{\}\)/);
    assert.match(html, /buildDrawioReportFromDocument\(document,\s*\{/);
  });

  test(`${file} exports the visible HTML page header above the SVG sheet`, () => {
    const buildDrawioReportFromDocument = extractDrawioExporter(html);

    const drawio = buildDrawioReportFromDocument(fakeReportDocument());
    const title = drawioCell(drawio, 'report-title');
    const subtitle = drawioCell(drawio, 'report-subtitle');
    const sheetAnchor = drawioCell(drawio, 'sheet-anchor');

    assert.match(drawio, /pageWidth="1180"/);
    assert.match(drawio, /pageHeight="796"/);
    assert.match(title, /value="Perfetto Project Architecture"/);
    assert.match(title, /fontSize=42/);
    assert.match(title, /fontStyle=1/);
    assert.match(title, /fontColor=#141413/);
    assert.match(title, /align=center/);
    assert.match(title, /x="0" y="0" width="1180" height="52"/);
    assert.match(subtitle, /value="A compact trace artifact flow across three domains\."/);
    assert.match(subtitle, /fontSize=15/);
    assert.match(subtitle, /fontColor=#6F6C65/);
    assert.match(subtitle, /align=center/);
    assert.match(subtitle, /x="80" y="58" width="1020" height="24"/);
    assert.match(sheetAnchor, /x="54" y="126" width="240" height="120"/);
  });

  test(`${file} report export excludes toolbar footer and page-support cards`, () => {
    const buildDrawioReportFromDocument = extractDrawioExporter(html);

    const drawio = buildDrawioReportFromDocument(fakeReportDocument());

    assert.doesNotMatch(drawio, /Download Draw\.io/);
    assert.doesNotMatch(drawio, /Copy Image/);
    assert.doesNotMatch(drawio, /Generated with Cloudy Tech Diagrams Skill/);
    assert.doesNotMatch(drawio, /ASYNC SLO EDIT/);
  });
}
