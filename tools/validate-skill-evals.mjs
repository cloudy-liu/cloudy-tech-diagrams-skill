import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_KEYS = new Set(['skill_name', 'version', 'objective_profiles', 'prompt_manifest', 'evals']);
const PROFILE_KEYS = new Set(['assertion_categories', 'expectations', 'human_review_categories']);
const EVALUATION_KEYS = new Set([
  'id',
  'name',
  'scope',
  'should_invoke_skill',
  'diagram_family',
  'expected_route',
  'prompt',
  'expected_output',
  'files',
  'objective_profile',
  'expectations',
  'human_review'
]);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkExactKeys(value, allowed, path, errors) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${path}.${key}: unexpected property`);
  }
}

function checkStringArray(value, path, errors, { minItems = 1, unique = false } = {}) {
  if (!Array.isArray(value) || value.length < minItems || !value.every((item) => typeof item === 'string' && item.length > 0)) {
    errors.push(`${path}: expected a non-empty string array`);
    return;
  }
  if (unique && new Set(value).size !== value.length) errors.push(`${path}: values must be unique`);
}

function checkInteger(value, path, errors) {
  if (!Number.isInteger(value) || value < 1) errors.push(`${path}: expected a positive integer`);
}

export function validateSkillEvaluations(corpus) {
  const errors = [];

  if (!isObject(corpus)) return ['root: expected an object'];
  checkExactKeys(corpus, ROOT_KEYS, 'root', errors);
  if (corpus.skill_name !== 'cloudy-tech-diagrams') errors.push('skill_name: unexpected value');
  checkInteger(corpus.version, 'version', errors);

  if (!isObject(corpus.objective_profiles) || Object.keys(corpus.objective_profiles).length === 0) {
    errors.push('objective_profiles: expected a non-empty object');
  } else {
    for (const [name, profile] of Object.entries(corpus.objective_profiles)) {
      const path = `objective_profiles.${name}`;
      if (!isObject(profile)) {
        errors.push(`${path}: expected an object`);
        continue;
      }
      checkExactKeys(profile, PROFILE_KEYS, path, errors);
      checkStringArray(profile.assertion_categories, `${path}.assertion_categories`, errors, { unique: true });
      checkStringArray(profile.expectations, `${path}.expectations`, errors);
      checkStringArray(profile.human_review_categories, `${path}.human_review_categories`, errors, { unique: true });
    }
  }

  const manifest = corpus.prompt_manifest;
  if (!isObject(manifest)) {
    errors.push('prompt_manifest: expected an object');
  } else {
    checkExactKeys(manifest, new Set(['version', 'sha256']), 'prompt_manifest', errors);
    checkInteger(manifest.version, 'prompt_manifest.version', errors);
    if (!isObject(manifest.sha256) || Object.keys(manifest.sha256).length === 0) {
      errors.push('prompt_manifest.sha256: expected a non-empty object');
    } else {
      for (const [name, hash] of Object.entries(manifest.sha256)) {
        if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) {
          errors.push(`prompt_manifest.sha256.${name}: expected a SHA-256 hex digest`);
        }
      }
    }
  }

  if (!Array.isArray(corpus.evals) || corpus.evals.length === 0) {
    errors.push('evals: expected a non-empty array');
    return errors;
  }

  const ids = new Set();
  const names = new Set();
  for (const evaluation of corpus.evals) {
    const path = `evals.${evaluation?.name ?? '<unnamed>'}`;
    if (!isObject(evaluation)) {
      errors.push(`${path}: expected an object`);
      continue;
    }
    checkExactKeys(evaluation, EVALUATION_KEYS, path, errors);
    for (const key of ['id', 'name', 'scope', 'should_invoke_skill', 'diagram_family', 'prompt', 'expected_output', 'files', 'objective_profile', 'expectations', 'human_review']) {
      if (!(key in evaluation)) errors.push(`${path}: missing ${key}`);
    }
    checkInteger(evaluation.id, `${path}.id`, errors);
    if (ids.has(evaluation.id)) errors.push(`${path}.id: duplicate value`);
    ids.add(evaluation.id);
    if (typeof evaluation.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(evaluation.name)) errors.push(`${path}.name: invalid slug`);
    if (names.has(evaluation.name)) errors.push(`${path}.name: duplicate value`);
    names.add(evaluation.name);
    if (!['technical-diagram', 'out-of-scope'].includes(evaluation.scope)) errors.push(`${path}.scope: invalid value`);
    if (typeof evaluation.should_invoke_skill !== 'boolean') errors.push(`${path}.should_invoke_skill: expected boolean`);
    if (!(typeof evaluation.diagram_family === 'string' || evaluation.diagram_family === null)) errors.push(`${path}.diagram_family: expected string or null`);
    if (typeof evaluation.prompt !== 'string' || evaluation.prompt.length < 80) errors.push(`${path}.prompt: too short`);
    if (typeof evaluation.expected_output !== 'string' || evaluation.expected_output.length < 40) errors.push(`${path}.expected_output: too short`);
    if (!Array.isArray(evaluation.files) || !evaluation.files.every((file) => typeof file === 'string')) errors.push(`${path}.files: expected string array`);
    if (typeof evaluation.objective_profile !== 'string' || evaluation.objective_profile.length === 0) errors.push(`${path}.objective_profile: expected non-empty string`);
    if (typeof evaluation.objective_profile === 'string' && !corpus.objective_profiles?.[evaluation.objective_profile]) errors.push(`${path}.objective_profile: unknown profile`);
    if (!Array.isArray(evaluation.expectations) || evaluation.expectations.length < 1 || !evaluation.expectations.every((item) => typeof item === 'string' && item.length > 0)) errors.push(`${path}.expectations: expected non-empty string array`);
    if (!Array.isArray(evaluation.human_review) || evaluation.human_review.length < 1 || !evaluation.human_review.every((item) => typeof item === 'string' && item.length > 0)) errors.push(`${path}.human_review: expected non-empty string array`);
    if (evaluation.scope === 'technical-diagram') {
      if (evaluation.should_invoke_skill !== true || typeof evaluation.diagram_family !== 'string' || evaluation.diagram_family.length === 0) errors.push(`${path}: technical routing must invoke skill with a non-empty family`);
      if ('expected_route' in evaluation) errors.push(`${path}.expected_route: technical cases must omit route`);
    }
    if (evaluation.scope === 'out-of-scope') {
      if (evaluation.should_invoke_skill !== false || evaluation.diagram_family !== null || typeof evaluation.expected_route !== 'string' || evaluation.expected_route.length === 0) errors.push(`${path}: out-of-scope routing is incomplete`);
    }
  }

  return errors;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const corpusPath = process.argv[2] ?? 'evals/evals.json';
  const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
  const errors = validateSkillEvaluations(corpus);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  }
}
