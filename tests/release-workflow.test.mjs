import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const releaseWorkflow = readFileSync('.github/workflows/release.yml', 'utf8');

test('release workflow publishes maintained release notes instead of generated PR lists', () => {
  assert.match(releaseWorkflow, /notes_path="\.github\/release-notes\/\$\{VERSION\}\.md"/);
  assert.match(releaseWorkflow, /Release notes file is required: \$notes_path/);
  assert.match(releaseWorkflow, /--notes-file "\$notes_path"/);
  assert.doesNotMatch(releaseWorkflow, /--generate-notes/);
});
