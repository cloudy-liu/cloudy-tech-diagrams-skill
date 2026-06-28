import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(
  new URL('../examples/runtime-mechanism.html', import.meta.url),
  'utf8'
);
const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const runtimeReference = readFileSync(
  new URL('../references/runtime-mechanism-mode.md', import.meta.url),
  'utf8'
);

test('runtime mechanism example demonstrates the causal roles', () => {
  assert.match(html, /Runtime Mechanism Mode/);
  assert.match(html, /data-drawio-role="trigger"/);
  assert.match(html, /data-drawio-role="participant"/);
  assert.match(html, /data-drawio-role="runtime-boundary"/);
  assert.match(html, /data-drawio-role="carrier"/);
  assert.match(html, /data-drawio-role="transformation"/);
  assert.match(html, /data-drawio-role="state-store"/);
  assert.match(html, /data-drawio-role="observable-output"/);
  assert.match(html, /data-drawio-role="causal-flow"/);
});

test('runtime mechanism example redraws the Perfetto heapprofd architecture mechanism', () => {
  assert.match(html, /Perfetto heapprofd Runtime Mechanism/);
  assert.match(html, /system_server/);
  assert.match(html, /surface_flinger/);
  assert.match(html, /mediaserver/);
  assert.match(html, /com\.google\.gms/);
  assert.match(html, /hprofd\.so/);
  assert.match(html, /Shared Mem/);
  assert.match(html, /Raw stacks buffer/);
  assert.match(html, /Unwind thread\(s\)/);
  assert.match(html, /libunwindstack/);
  assert.match(html, /mmaps cache/);
  assert.match(html, /ELF cache/);
  assert.match(html, /Bookkeeping/);
  assert.match(html, /libart\.so/);
  assert.match(html, /RuntimeStart/);
  assert.match(html, /ArtMethodInvoke/);
  assert.match(html, /perfetto trace/);
  assert.match(html, /heap dumps/);
  assert.doesNotMatch(html, /Risk Evaluation Runtime/);
  assert.doesNotMatch(html, /Policy Event/);
});

test('runtime mechanism mode stays generic while the example is Perfetto-specific', () => {
  const genericDocs = `${skill}\n${runtimeReference}`;

  assert.doesNotMatch(genericDocs, /hprofd\.so/);
  assert.doesNotMatch(genericDocs, /Raw stacks buffer/);
  assert.doesNotMatch(genericDocs, /libunwindstack/);
  assert.doesNotMatch(genericDocs, /Bookkeeping/);
  assert.doesNotMatch(genericDocs, /perfetto trace/);
});

test('runtime mechanism example avoids overlap-prone inline edge labels', () => {
  assert.doesNotMatch(html, />enables sampling<\/text>/);
  assert.doesNotMatch(html, />unwind \+ symbolize<\/text>/);
  assert.doesNotMatch(html, />frame refs<\/text>/);
});

test('runtime mechanism example uses a straight connector across the nested process boundary', () => {
  const match = html.match(
    /data-drawio-id="processes-to-shared-memory"[\s\S]*?<\/g>/
  );
  assert.ok(match, 'missing processes-to-shared-memory connector');
  assert.match(match[0], /<line x1="292" y1="296" x2="350" y2="296"/);
  assert.doesNotMatch(match[0], /<path[^>]+C /);
});

test('runtime mechanism sub-blocks do not use extra rounded overlay caps', () => {
  assert.doesNotMatch(
    html,
    /<rect x="188" y="(?:152|224|296|368)" width="92" height="54" rx="12"/
  );
  assert.match(
    html,
    /<rect x="188" y="152" width="92" height="54" fill="#E6D7B4" stroke="#BFA777"/
  );
  assert.doesNotMatch(
    html,
    /<rect x="256" y="152" width="24" height="54" rx="12" fill="#E6D7B4" stroke="#BFA777"/
  );
});

test('runtime mechanism bookkeeping table exports as explicit Draw.io primitives', () => {
  const expectedLabelIds = [
    'bookkeeping-title',
    'bookkeeping-pid-header',
    'bookkeeping-tid-header',
    'bookkeeping-addr-header',
    'bookkeeping-size-header',
    'bookkeeping-row1-pid',
    'bookkeeping-row1-tid',
    'bookkeeping-row1-addr',
    'bookkeeping-row1-size',
    'bookkeeping-row2-pid',
    'bookkeeping-row2-tid',
    'bookkeeping-row2-addr',
    'bookkeeping-row2-size'
  ];

  for (const id of expectedLabelIds) {
    assert.match(
      html,
      new RegExp(`data-drawio-type="label"[^>]+data-drawio-id="${id}"[^>]+data-drawio-width=`)
    );
  }

  const expectedLineIds = [
    'bookkeeping-title-rule',
    'bookkeeping-col-pid',
    'bookkeeping-col-tid',
    'bookkeeping-col-addr',
    'bookkeeping-header-rule',
    'bookkeeping-row1-rule'
  ];

  for (const id of expectedLineIds) {
    assert.match(
      html,
      new RegExp(`data-drawio-type="edge"[^>]+data-drawio-role="table-line"[^>]+data-drawio-id="${id}"`)
    );
  }
});

test('runtime mechanism example exports stacked worker layers as explicit Draw.io shapes', () => {
  const expectedLayerIds = [
    'unwind-thread-layer-back',
    'unwind-thread-layer-mid'
  ];

  for (const id of expectedLayerIds) {
    assert.match(
      html,
      new RegExp(`data-drawio-type="shape"[^>]+data-drawio-role="stack-layer"[^>]+data-drawio-id="${id}"`)
    );
  }

  assert.match(
    html,
    /data-drawio-type="component"[^>]+data-drawio-role="transformation"[^>]+data-drawio-id="unwind-threads"[\s\S]*?<rect x="502" y="268"/
  );
});

test('runtime mechanism example keeps Cloudy export behavior', () => {
  assert.match(html, /downloadDrawio\(this\)/);
  assert.match(html, /function buildDrawioFromSvg\(svg, options = \{\}\)/);
  assert.doesNotMatch(html, /data:image\/(?:svg\+xml|png)/);
  assert.match(html, /background: var\(--canvas\)/);
  assert.match(html, /#E8E6DD/);
});
