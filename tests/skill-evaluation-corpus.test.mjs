import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { validateSkillEvaluations } from '../tools/validate-skill-evals.mjs';

const corpusUrl = new URL('../evals/evals.json', import.meta.url);
const schemaUrl = new URL('../evals/schema.json', import.meta.url);

function loadCorpus() {
  assert.ok(existsSync(corpusUrl), 'evals/evals.json must exist');
  return JSON.parse(readFileSync(corpusUrl, 'utf8'));
}

function loadSchema() {
  assert.ok(existsSync(schemaUrl), 'evals/schema.json must exist');
  return JSON.parse(readFileSync(schemaUrl, 'utf8'));
}

function profileFor(corpus, evaluation) {
  const profile = corpus.objective_profiles[evaluation.objective_profile];
  assert.ok(profile, `${evaluation.name} references an unknown objective profile`);
  return profile;
}

function effectiveExpectations(corpus, evaluation) {
  return [...profileFor(corpus, evaluation).expectations, ...evaluation.expectations];
}

const requiredTechnicalCases = new Set([
  'simple-architecture',
  'event-heavy-flow',
  'dense-cross-boundary-deployment',
  'runtime-mechanism',
  'source-driven-authoring',
  'incomplete-input',
  'mixed-chinese-english-labels'
]);

const requiredNearMissCases = new Set([
  'near-miss-dashboard',
  'near-miss-landing-page',
  'near-miss-generic-deck',
  'near-miss-non-technical-illustration'
]);

const requiredObjectiveCategories = new Set([
  'artifact-structure',
  'export-controls',
  'semantic-annotations',
  'connector-semantics',
  'source-coverage',
  'unexecuted-check-reporting'
]);

test('evaluation corpus has stable schema and unique named cases', () => {
  const corpus = loadCorpus();
  const schema = loadSchema();

  assert.equal(corpus.skill_name, 'cloudy-tech-diagrams');
  assert.deepEqual(validateSkillEvaluations(corpus), []);
  assert.equal(corpus.version, 1);
  assert.equal(corpus.prompt_manifest.version, corpus.version);
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.ok(schema.required.includes('objective_profiles'));
  assert.ok(schema.required.includes('prompt_manifest'));
  assert.ok(schema.required.includes('evals'));
  assert.ok(schema.$defs.evaluation.required.includes('should_invoke_skill'));
  assert.ok(schema.$defs.evaluation.required.includes('objective_profile'));
  assert.ok(Array.isArray(corpus.evals));
  assert.equal(corpus.evals.length, 11);

  const ids = new Set();
  const names = new Set();
  const manifestNames = Object.keys(corpus.prompt_manifest.sha256).sort();
  for (const evaluation of corpus.evals) {
    assert.equal(typeof evaluation.id, 'number');
    assert.ok(!ids.has(evaluation.id), `duplicate eval id: ${evaluation.id}`);
    ids.add(evaluation.id);
    assert.equal(typeof evaluation.name, 'string');
    assert.ok(!names.has(evaluation.name), `duplicate eval name: ${evaluation.name}`);
    names.add(evaluation.name);
    assert.equal(typeof evaluation.prompt, 'string');
    assert.ok(evaluation.prompt.length >= 80);
    assert.equal(typeof evaluation.scope, 'string');
    assert.ok(['technical-diagram', 'out-of-scope'].includes(evaluation.scope));
    assert.equal(typeof evaluation.should_invoke_skill, 'boolean');
    assert.equal(typeof evaluation.objective_profile, 'string');
    assert.equal(typeof evaluation.diagram_family === 'string' || evaluation.diagram_family === null, true);
    if (evaluation.scope === 'technical-diagram') {
      assert.equal(evaluation.should_invoke_skill, true);
      assert.equal(typeof evaluation.diagram_family, 'string');
      assert.ok(evaluation.diagram_family.length > 0);
      assert.equal(evaluation.expected_route, undefined);
    } else {
      assert.equal(evaluation.should_invoke_skill, false);
      assert.equal(evaluation.diagram_family, null);
      assert.equal(typeof evaluation.expected_route, 'string');
    }
    assert.equal(typeof evaluation.expected_output, 'string');
    assert.ok(evaluation.expected_output.length >= 40);
    assert.ok(Array.isArray(evaluation.files));
    assert.ok(Array.isArray(evaluation.expectations));
    assert.ok(evaluation.expectations.length >= 1);
    assert.ok(evaluation.expectations.every((expectation) => typeof expectation === 'string'));
    assert.ok(Array.isArray(evaluation.human_review));
    assert.ok(evaluation.human_review.length >= 1);
    assert.ok(evaluation.human_review.every((item) => typeof item === 'string'));
  }

  assert.deepEqual(manifestNames, [...names].sort());
  for (const evaluation of corpus.evals) {
    const digest = createHash('sha256').update(evaluation.prompt, 'utf8').digest('hex');
    assert.equal(corpus.prompt_manifest.sha256[evaluation.name], digest, `${evaluation.name} prompt hash drifted`);
  }
});

test('corpus covers the approved technical branches and near-misses', () => {
  const corpus = loadCorpus();
  const names = new Set(corpus.evals.map((evaluation) => evaluation.name));
  const technical = corpus.evals.filter((evaluation) => evaluation.scope === 'technical-diagram');
  const nearMisses = corpus.evals.filter((evaluation) => evaluation.scope === 'out-of-scope');

  for (const name of requiredTechnicalCases) {
    assert.ok(names.has(name), `missing required evaluation: ${name}`);
  }
  for (const name of requiredNearMissCases) {
    assert.ok(names.has(name), `missing required near-miss evaluation: ${name}`);
  }
  assert.equal(technical.length, 7);
  assert.equal(nearMisses.length, 4);
  assert.ok(nearMisses.every((evaluation) => evaluation.should_invoke_skill === false));
  assert.ok(nearMisses.every((evaluation) => evaluation.objective_profile === 'routing-near-miss'));
  assert.ok(
    nearMisses.every((evaluation) => effectiveExpectations(corpus, evaluation).some((expectation) => /does not create .*technical/i.test(expectation)))
  );
  assert.ok(
    nearMisses.every((evaluation) => effectiveExpectations(corpus, evaluation).some((expectation) => /appropriate adjacent workflow|better served|workflow/i.test(expectation)))
  );
});

test('positive cases separate objective contract assertions from human visual review', () => {
  const corpus = loadCorpus();
  const technical = corpus.evals.filter((evaluation) => evaluation.scope === 'technical-diagram');

  for (const evaluation of technical) {
    const profile = profileFor(corpus, evaluation);
    const categories = new Set(profile.assertion_categories);
    const expectations = effectiveExpectations(corpus, evaluation);
    const expectedProfile = evaluation.name === 'incomplete-input'
      ? 'technical-diagram-optional-artifact'
      : 'technical-diagram-default';
    assert.equal(evaluation.objective_profile, expectedProfile);
    for (const category of requiredObjectiveCategories) {
      assert.ok(categories.has(category), `${evaluation.name} missing ${category}`);
    }
    assert.ok(
      expectations.some((expectation) => /\.html artifact|diagram\.html/i.test(expectation)),
      `${evaluation.name} must assert artifact structure`
    );
    assert.ok(
      expectations.some((expectation) => /Copy Image[\s\S]*Download PNG[\s\S]*Download PDF[\s\S]*Download Draw\.io/i.test(expectation)),
      `${evaluation.name} must assert all export controls`
    );
    assert.ok(
      expectations.some((expectation) => /source, target, and (?:relationship )?meaning/i.test(expectation)),
      `${evaluation.name} must assert connector semantics`
    );
    assert.ok(
      expectations.some((expectation) => /Draw\.io (?:semantic )?annotations|semantic annotations/i.test(expectation)),
      `${evaluation.name} must assert semantic annotations`
    );
    assert.ok(
      expectations.some((expectation) => /accounts for|source-grounded|supplied component|applicable .* role|unsupported architecture/i.test(expectation)),
      `${evaluation.name} must assert source coverage`
    );
    assert.ok(
      expectations.some((expectation) => /not run|could not run|unavailable/i.test(expectation)),
      `${evaluation.name} must assert unavailable-check reporting`
    );
    assert.deepEqual(
      new Set(profile.human_review_categories),
      new Set(['layout-quality', 'information-selection', 'visual-clarity'])
    );
    assert.equal(evaluation.human_review.length, 3);
    assert.match(evaluation.human_review.join('\n'), /Layout quality:/i);
    assert.match(evaluation.human_review.join('\n'), /Information selection:/i);
    assert.match(evaluation.human_review.join('\n'), /Visual clarity:/i);
    assert.doesNotMatch(
      expectations.join('\n'),
      /layout quality|information selection|visual clarity|aesthetic quality|beautiful|polished|scannable/i
    );
  }
});

test('corpus includes source grounding, incomplete input, runtime, and multilingual signals', () => {
  const corpus = loadCorpus();
  const byName = new Map(corpus.evals.map((evaluation) => [evaluation.name, evaluation]));

  const sourceDriven = byName.get('source-driven-authoring');
  assert.match(sourceDriven.prompt, /Do not invent/i);
  assert.ok(sourceDriven.expectations.some((expectation) => /without inventing/i.test(expectation)));

  const incomplete = byName.get('incomplete-input');
  assert.match(incomplete.prompt, /do not have more details|unresolved assumptions/i);
  assert.ok(incomplete.expectations.some((expectation) => /clarifying information|unsupported/i.test(expectation)));
  assert.equal(incomplete.objective_profile, 'technical-diagram-optional-artifact');
  assert.match(effectiveExpectations(corpus, incomplete).join('\n'), /clarification-only response may pass without creating diagram\.html/i);

  const runtime = byName.get('runtime-mechanism');
  assert.match(runtime.prompt, /Runtime Mechanism Mode/);
  assert.ok(runtime.expectations.some((expectation) => /trigger.*participant.*boundary.*carrier.*transformation.*state\/store.*observable-output/i.test(expectation)));

  const bilingual = byName.get('mixed-chinese-english-labels');
  assert.match(bilingual.prompt, /[\u4e00-\u9fff]/);
  assert.match(bilingual.prompt, /User Client|API Service|Database|Message Queue/);
});

test('positive corpus prompts are reusable across model tiers', () => {
  const corpus = loadCorpus();
  const technical = corpus.evals.filter((evaluation) => evaluation.scope === 'technical-diagram');

  for (const evaluation of technical) {
    assert.doesNotMatch(evaluation.prompt, /GPT|Claude|Gemini|model tier|strong model|weak model/i);
    assert.doesNotMatch(evaluation.prompt, /run \d+ times|iteration \d+/i);
  }
});
