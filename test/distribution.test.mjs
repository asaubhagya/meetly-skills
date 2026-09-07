import test from 'node:test';
import assert from 'node:assert/strict';
import { notifyDistribution } from '../scripts/notify-distribution.mjs';

const base = { GITHUB_EVENT_NAME: 'push', SOURCE_REPOSITORY: 'asaubhagya/meetly-skills', SOURCE_REF: 'refs/heads/main', SOURCE_SHA: 'a'.repeat(40) };
const hook = 'https://api.vercel.com/v1/integrations/deploy/prj_test/private-hook';
function harness(response = { ok: true, status: 200 }) {
  const calls = [], logs = [];
  return { calls, logs, fetch: async (...args) => { calls.push(args); return response; }, log: message => logs.push(message) };
}

test('hook takes precedence without transmitting or logging token', async () => {
  const h = harness();
  assert.equal(await notifyDistribution({ ...base, MEETLY_AGENTS_DEPLOY_HOOK: hook, MEETLY_DISTRIBUTION_TOKEN: 'private-token' }, h), 'hook');
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0][0], hook);
  assert.equal(h.calls[0][1].method, 'POST');
  assert.equal(h.calls[0][1].redirect, 'error');
  assert.equal(h.calls[0][1].headers, undefined);
  assert.equal(h.calls[0][1].body, undefined);
  assert.doesNotMatch(h.logs.join('\n'), /private-hook|private-token/);
  assert.match(h.logs.join('\n'), /completion is not verified/);
});

test('token-only dispatch preserves immutable revision and channel for main and tags', async () => {
  for (const [ref, channel] of [['refs/heads/main', 'beta'], ['refs/tags/v0.1.0', 'latest']]) {
    const h = harness({ ok: true, status: 204 });
    assert.equal(await notifyDistribution({ ...base, SOURCE_REF: ref, MEETLY_DISTRIBUTION_TOKEN: 'test-token' }, h), 'dispatch');
    assert.equal(h.calls[0][0], 'https://api.github.com/repos/asaubhagya/get-meetly-ai/dispatches');
    assert.deepEqual(JSON.parse(h.calls[0][1].body), {
      event_type: 'meetly-skills-updated',
      client_payload: { repository: base.SOURCE_REPOSITORY, sha: base.SOURCE_SHA, ref, channel }
    });
    assert.doesNotMatch(h.logs.join('\n'), /test-token/);
  }
});

test('no secret, PRs, forks, branches and prerelease tags skip successfully with status', async () => {
  for (const env of [base,
    { ...base, GITHUB_EVENT_NAME: 'pull_request', MEETLY_AGENTS_DEPLOY_HOOK: hook },
    { ...base, SOURCE_REPOSITORY: 'someone/fork', MEETLY_AGENTS_DEPLOY_HOOK: hook },
    { ...base, SOURCE_REF: 'refs/heads/work', MEETLY_AGENTS_DEPLOY_HOOK: hook },
    { ...base, SOURCE_REF: 'refs/tags/v1.0.0-beta.1', MEETLY_AGENTS_DEPLOY_HOOK: hook },
    { ...base, SOURCE_REF: 'refs/tags/v01.0.0', MEETLY_AGENTS_DEPLOY_HOOK: hook }
  ]) {
    const h = harness();
    assert.equal(await notifyDistribution(env, h), 'skipped');
    assert.equal(h.calls.length, 0);
    assert.match(h.logs[0], /notice/);
  }
});

test('hook failures do not fall back or leak URLs, token or raw errors', async () => {
  const env = { ...base, MEETLY_AGENTS_DEPLOY_HOOK: hook, MEETLY_DISTRIBUTION_TOKEN: 'private-token' };
  const h = harness({ ok: false, status: 503 });
  await assert.rejects(notifyDistribution(env, h), /HTTP 503.*no fallback/);
  assert.equal(h.calls.length, 1);
  let calls = 0;
  await assert.rejects(notifyDistribution(env, { log: h.log, fetch: async () => { calls++; throw new Error(hook + ' private-token'); } }), error => {
    assert.doesNotMatch(error.message, /private-hook|private-token/);
    assert.match(error.message, /No fallback/);
    return true;
  });
  assert.equal(calls, 1);
  const invalid = harness();
  await assert.rejects(notifyDistribution({ ...env, MEETLY_AGENTS_DEPLOY_HOOK: 'https://example.invalid/private-hook' }, invalid), /request failed/);
  assert.equal(invalid.calls.length, 0);
});
