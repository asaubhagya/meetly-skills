import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(new URL('../skills/meetly-recurring-workflow/scripts/journal.py', import.meta.url));
const plan = { grant: 'a', space: 'team', type: 'commitment', id: 'c', revision: '1',
  destination: 'tracker', tenant: 'qa', action: 'create', diff: { before: null, title: 'Check the keyboard shortcut' } };

test('approval is payload-bound and a crash between send and receipt never authorizes a second create', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meetly-journal-'));
  async function run(cmd, additions = {}) {
    return await new Promise((resolve, reject) => {
      const child = spawn('python3', [runner, join(dir, 'journal.sqlite'), cmd]);
      let output = '';
      child.stdout.on('data', bytes => output += bytes);
      child.on('error', reject);
      child.on('close', code => resolve(code === 0 ? JSON.parse(output) : null));
      child.stdin.end(JSON.stringify({...plan, ...additions}));
    });
  }
  try {
    const { fingerprint } = await run('preview');
    assert.equal(await run('claim'), null);
    assert.equal(await run('approve', {approvedFingerprint: 'wrong'}), null);
    await run('approve', {approvedFingerprint: fingerprint});
    const changed = {diff: {before: null, title: 'New title'}};
    assert.equal((await run('preview', changed)).state, 'preview');
    assert.equal(await run('claim', changed), null);
    await run('preview');
    await run('approve', {approvedFingerprint: fingerprint});
    const claims = await Promise.all([run('claim'),run('claim')]);
    assert.equal(claims.filter(Boolean).length, 1);
    assert.equal(await run('retry'), null);
    assert.equal((await run('status')).state, 'sending');
    assert.equal((await run('receipt', {externalId: 'issue-abc'})).state, 'reconcile');
    assert.equal(await run('claim'), null);
    assert.equal(await run('complete', {externalId: 'wrong'}), null);
    assert.equal((await run('complete', {externalId: 'issue-abc'})).state, 'complete');
    assert.equal((await run('preview')).state, 'complete');
    assert.equal((await run('preview', {tenant: 'another'})).state, 'preview');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('new source revision cannot duplicate an uncertain or verified issue; a second portal is independent', async () => {
  const { execFileSync } = await import('node:child_process');
  const dir = await mkdtemp(join(tmpdir(), 'meetly-revision-'));
  function call(command, body) {
    return JSON.parse(execFileSync('python3', [runner, join(dir, 'state.db'), command], {
      input: JSON.stringify(body), stdio: ['pipe', 'pipe', 'pipe'],
    }));
  }
  function review(row) {
    const { fingerprint } = call('preview', row);
    call('approve', { ...row, approvedFingerprint: fingerprint });
  }
  const revised = { ...plan, revision: '2' };
  try {
    review(plan);
    review(revised);
    call('claim', plan);
    assert.throws(() => call('claim', revised), /Earlier revision owns/);
    call('retry', { ...plan, verifiedNoEffect: true });
    call('claim', revised);
    call('receipt', { ...revised, externalId: 'fixture-123' });
    call('complete', { ...revised, externalId: 'fixture-123' });
    const newer = { ...plan, revision: '3' };
    review(newer);
    assert.throws(() => call('claim', newer), /Earlier revision owns/);
    const otherPortal = { ...newer, tenant: 'second-qa' };
    review(otherPortal);
    assert.equal(call('claim', otherPortal).state, 'sending');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
