import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, cp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { buildManifest, serialize, frontmatter, metadata } from '../scripts/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = (await readFile(join(root, 'skills/setup-meetly/SKILL.md'), 'utf8')).replace(/^  version: "\d+"$/m, '  version: "1"');
const ui = await readFile(join(root, 'skills/setup-meetly/agents/openai.yaml'), 'utf8');

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'meetly-skills-test-'));
  t.after(() => rm(dir, { recursive: true }));
  await cp(join(root, 'scripts'), join(dir, 'scripts'), { recursive: true });
  await mkdir(join(dir, 'skills/setup-meetly/agents'), { recursive: true });
  await writeFile(join(dir, 'skills/setup-meetly/SKILL.md'), source);
  await writeFile(join(dir, 'skills/setup-meetly/agents/openai.yaml'), ui);
  await writeFile(join(dir, 'GUIDE.md'), 'abc');
  return dir;
}

test('manifest uses the agreed envelope, exact bytes, sorted attachments and a known SHA-256 vector', async t => {
  const dir = await fixture(t);
  await mkdir(join(dir, 'skills/setup-meetly/references'));
  await writeFile(join(dir, 'skills/setup-meetly/references/example.md'), 'é');
  const manifest = await buildManifest(dir);
  assert.deepEqual(Object.keys(manifest), ['schema', 'skills', 'guide']);
  assert.equal(manifest.schema, 'meetly-skills/1');
  assert.deepEqual(manifest.guide, {
    src: 'GUIDE.md',
    sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    bytes: 3
  });
  const skill = manifest.skills[0];
  assert.deepEqual(Object.keys(skill), ['key', 'version', 'description', 'files']);
  assert.equal(skill.key, 'setup-meetly');
  assert.equal(skill.version, 1);
  assert.deepEqual(skill.files.map(f => f.path), ['SKILL.md', 'agents/openai.yaml', 'references/example.md']);
  assert.deepEqual(Object.keys(skill.files[0]), ['path', 'src', 'sha256', 'bytes']);
  assert.equal(skill.files[2].bytes, 2);
  assert.equal(skill.files[2].src, 'skills/setup-meetly/references/example.md');
  assert.equal(serialize(manifest), serialize(await buildManifest(dir)));
});

test('check command detects missing and stale manifests without rewriting them', async t => {
  const dir = await fixture(t);
  const run = (...args) => spawnSync(process.execPath, ['scripts/build-manifest.mjs', ...args], { cwd: dir, encoding: 'utf8' });
  assert.equal(run('--check').status, 1);
  assert.equal(run().status, 0);
  const generated = await readFile(join(dir, 'manifest.json'), 'utf8');
  assert.equal(run('--check').status, 0);
  assert.equal(run().status, 0);
  assert.equal(await readFile(join(dir, 'manifest.json'), 'utf8'), generated);
  await writeFile(join(dir, 'GUIDE.md'), 'changed');
  assert.equal(run('--check').status, 1);
  assert.equal(await readFile(join(dir, 'manifest.json'), 'utf8'), generated);
  assert.equal(run('--unknown').status, 1);
});

test('validation rejects malformed or unsafe metadata', () => {
  for (const version of ['0', '-1', '1.5', '01', '9007199254740992']) {
    assert.throws(() => frontmatter(source.replace('version: "1"', `version: "${version}"`), 'setup-meetly'), /version/);
  }
  assert.throws(() => frontmatter(source.replace('name: setup-meetly', 'name: wrong'), 'setup-meetly'), /name/);
  assert.throws(() => frontmatter(source.replace('metadata:\n  version: "1"\n', ''), 'setup-meetly'), /version/);
  assert.throws(() => frontmatter(source.replace('  version: "1"', '  version: "1"\n  version: "2"'), 'setup-meetly'), /unsupported|duplicate/);
  assert.throws(() => frontmatter(source.replace(/^description: .*\n/m, ''), 'setup-meetly'), /description/);
  assert.throws(() => frontmatter(source.replace('description:', 'depends_on: invented\ndescription:'), 'setup-meetly'), /unsupported/);
  assert.throws(() => frontmatter(source.replace('metadata:\n  version: "1"', 'version: 1'), 'setup-meetly'), /version belongs in metadata/);
  assert.throws(() => metadata(ui.replace('value: "meetly"', 'value: "other"'), 'setup-meetly'), /dependency/);
  assert.throws(() => metadata(ui.replace('https://mcp.getmeetly.ai/mcp', 'https://example.invalid/mcp'), 'setup-meetly'), /dependency/);
  assert.throws(() => metadata(ui.replace('streamable_http', 'stdio'), 'setup-meetly'), /dependency/);
  assert.throws(() => metadata(ui.replace(/^      description: .*\n/m, ''), 'setup-meetly'), /dependency/);
  assert.throws(() => metadata(ui.replace('allow_implicit_invocation: true', 'allow_implicit_invocation: false'), 'setup-meetly'), /explicit/);
  assert.throws(() => metadata(ui.replace(/^  default_prompt: .*\n/m, ''), 'setup-meetly'), /default_prompt/);
  assert.throws(() => metadata(ui + '\npolicy:\n  allow_implicit_invocation: true\n', 'setup-meetly'), /duplicate/);
});

test('validation rejects missing entrypoints, symlinks and invalid skill names', async t => {
  const dir = await fixture(t);
  await mkdir(join(dir, 'skills/another-skill'));
  await assert.rejects(buildManifest(dir), /missing SKILL.md/);
  // Every fixture is test-owned; removing this empty directory permits the next case.
  await rm(join(dir, 'skills/another-skill'), { recursive: true });
  await symlink(join(dir, 'GUIDE.md'), join(dir, 'skills/setup-meetly/linked.md'));
  await assert.rejects(buildManifest(dir), /symlinks/);
  await rm(join(dir, 'skills/setup-meetly/linked.md'));
  await mkdir(join(dir, 'skills/Bad_Name'));
  await assert.rejects(buildManifest(dir), /invalid skill directory/);
});

test('CLI can build outside its working directory and invalid skill edits invalidate checks', async t => {
  const dir = await fixture(t);
  execFileSync(process.execPath, [join(dir, 'scripts/build-manifest.mjs')], { cwd: tmpdir() });
  await writeFile(join(dir, 'skills/setup-meetly/SKILL.md'), source.replace('version: "1"', 'version: "0"'));
  const result = spawnSync(process.execPath, [join(dir, 'scripts/build-manifest.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /version/);
});

test('production catalog exposes five capabilities with progressively loaded references', async () => {
  const manifest = await buildManifest(root);
  assert.deepEqual(manifest.skills.map(s => s.key), ['create-meetly-research-brief', 'meetly-briefing', 'meetly-catch-up', 'meetly-communication-coach', 'setup-meetly']);
  const insights = manifest.skills.find(s => s.key === 'meetly-catch-up');
  assert.ok(insights.files.some(f => f.path === 'references/product.md'));
  assert.ok(insights.files.some(f => f.path === 'references/interviews.md'));
  assert.deepEqual(manifest.skills.map(s => s.key), [...manifest.skills.map(s => s.key)].sort());
  for (const skill of manifest.skills) {
    const parsed = metadata(await readFile(join(root, 'skills', skill.key, 'agents/openai.yaml'), 'utf8'), skill.key);
    assert.equal(parsed.implicit, !skill.key.startsWith('create-'));
  }
});

test('behavioral fixtures have resolvable skills and actionable rubrics (not a model evaluation)', async () => {
  const fixture = JSON.parse(await readFile(join(root, 'benchmarks/onboarding.json'), 'utf8'));
  const keys = new Set((await buildManifest(root)).skills.map(s => s.key));
  assert.equal(fixture.schema, 'meetly-benchmarks/1');
  assert.equal(fixture.evaluationStatus, 'fixtures-only-not-model-evaluated');
  const ids = new Set();
  assert.ok(fixture.cases.length >= 10);
  for (const scenario of fixture.cases) {
    assert.ok(scenario.id && !ids.has(scenario.id));
    ids.add(scenario.id);
    assert.ok(scenario.user.length > 10);
    assert.ok(scenario.context && typeof scenario.context === 'object');
    assert.ok(Array.isArray(scenario.turns));
    assert.ok(scenario.skills.length > 0 && scenario.skills.every(key => keys.has(key)));
    for (const field of ['must', 'mustNot']) {
      assert.ok(scenario[field].length > 0);
      assert.ok(scenario[field].every(rule => typeof rule === 'string' && rule.length > 15));
    }
  }
});
