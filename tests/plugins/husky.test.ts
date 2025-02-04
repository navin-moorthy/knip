import assert from 'node:assert/strict';
import test from 'node:test';
import { main } from '../../src/index.js';
import * as husky from '../../src/plugins/husky/index.js';
import { resolve, join } from '../../src/util/path.js';
import baseArguments from '../helpers/baseArguments.js';
import baseCounters from '../helpers/baseCounters.js';
import { getManifest } from '../helpers/index.js';

const cwd = resolve('tests/fixtures/plugins/husky');
const manifest = getManifest(cwd);
const workspaceConfig = { ignoreBinaries: ['knip'] };

test('Find dependencies in husky configuration (plugin)', async () => {
  const configFilePath = join(cwd, '.husky/pre-commit');
  const dependencies = await husky.findDependencies(configFilePath, { manifest, workspaceConfig });
  assert.deepEqual(dependencies, ['lint-staged', 'commitlint']);
});

test('Find dependencies in husky configuration (main)', async () => {
  const { issues, counters } = await main({
    ...baseArguments,
    cwd,
  });

  assert(issues.unlisted['.husky/pre-commit']['commitlint']);
  assert(issues.unlisted['.husky/pre-push']['jest']);
  assert(issues.unlisted['.husky/pre-push']['pretty-quick']);
  assert(issues.unlisted['.husky/pre-rebase']['eslint']);

  assert.deepEqual(counters, {
    ...baseCounters,
    unlisted: 4,
    processed: 0,
    total: 0,
  });
});
