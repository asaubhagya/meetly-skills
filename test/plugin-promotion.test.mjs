import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { latestMatches, waitForLatest, channelsUrl } from '../scripts/wait-for-latest.mjs';
import { nextPluginVersion } from '../scripts/promote-plugin.mjs';

const sha = 'a'.repeat(40), old = 'b'.repeat(40);
const response = value => ({ ok: true, json: async () => value });

test('latest poll requires the channels schema and exact triggering commit', async () => {
  assert.equal(await latestMatches(sha, async () => response({ schema: 'meetly-channels/1', latest: { sha } })), true);
  assert.equal(await latestMatches(sha, async () => response({ schema: 'meetly-channels/1', latest: { sha: old } })), false);
  assert.equal(await latestMatches(sha, async () => response({ latest: { sha } })), false);
  assert.equal(await latestMatches(sha, async () => { throw new Error('private response'); }), false);
});

test('propagation retries until latest matches without logging response bodies', async () => {
  let time = 0, calls = 0;
  const logs = [];
  await waitForLatest(sha, {
    now: () => time, sleep: async ms => { time += ms; }, log: msg => logs.push(msg),
    fetch: async (url, options) => {
      assert.equal(url, channelsUrl);
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers['Cache-Control'], 'no-cache');
      return response({ schema: 'meetly-channels/1', latest: { sha: ++calls === 3 ? sha : old }, private: 'DO-NOT-LOG' });
    }
  });
  assert.equal(calls, 3);
  assert.equal(time, 30_000);
  assert.doesNotMatch(logs.join('\n'), /DO-NOT-LOG/);
});

test('default propagation wait stops after ten minutes and rejects unpeeled refs', async () => {
  let time = 0, calls = 0;
  await assert.rejects(waitForLatest(sha, {
    now: () => time, sleep: async ms => { time += ms; }, log: () => {},
    fetch: async () => { calls++; return { ok: false }; }
  }), /bounded wait/);
  assert.equal(time, 600_000);
  assert.equal(calls, 40);
  await assert.rejects(waitForLatest('v0.1.0'), /peeled Git commit/);
});

test('plugin patch bumps only for a previously pinned, different skills commit', () => {
  assert.equal(nextPluginVersion('2.1.0', null, sha), '2.1.0');
  assert.equal(nextPluginVersion('2.1.0', sha, sha), '2.1.0');
  assert.equal(nextPluginVersion('2.1.9', old, sha), '2.1.10');
  assert.throws(() => nextPluginVersion('2.1.0-beta.1', old, sha), /stable semver/);
  assert.throws(() => nextPluginVersion('2.1.0', undefined, sha), /lock SHA/);
});

test('workflow wiring retains stable-only dependencies, scoped checkout and no force push (static check)', async () => {
  const workflow = await readFile(new URL('../.github/workflows/checks.yml', import.meta.url), 'utf8');
  const job = workflow.split('  promote-plugin:\n')[1];
  assert.ok(job);
  assert.match(job, /needs: \[checks, notify\]/);
  assert.match(job, /needs\.notify\.outputs\.stable == 'true'/);
  assert.match(job, /ssh-key: \$\{\{ secrets\.MEETLY_PLUGIN_DEPLOY_KEY \}\}/);
  assert.match(job, /repository: asaubhagya\/meetly-plugin\n          ref: main\n          path: plugin/);
  assert.ok(job.indexOf('wait-for-latest.mjs') < job.indexOf('repository: asaubhagya/meetly-plugin'));
  const script = await readFile(new URL('../scripts/promote-plugin.mjs', import.meta.url), 'utf8');
  assert.match(script, /\['push', 'origin', 'HEAD:main'\]/);
  assert.doesNotMatch(script, /--force|--force-with-lease/);
});
