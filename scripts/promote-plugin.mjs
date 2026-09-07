import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { latestMatches } from './wait-for-latest.mjs';

export function nextPluginVersion(version, previousSha, nextSha) {
  if (!/^[a-f0-9]{40}$/.test(nextSha ?? '') || (previousSha !== null && !/^[a-f0-9]{40}$/.test(previousSha ?? ''))) {
    throw new Error('Invalid plugin lock SHA.');
  }
  if (previousSha === null || previousSha === nextSha) return version;
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if (!match || !Number.isSafeInteger(Number(match[3]) + 1)) throw new Error('Plugin version must be stable semver to bump its patch.');
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

// Commands capture stdout/stderr: never print private checkout responses or keys.
// The only writes allowed into the commit are the generated bundle and version.
export async function promotePlugin(plugin, sha) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Expected a peeled Git commit SHA.');
  const run = (command, args) => {
    try { return execFileSync(command, args, { cwd: plugin, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
    catch { throw new Error(`${command} step failed; plugin promotion stopped. Command output is withheld.`); }
  };
  if (run('git', ['status', '--porcelain'])) throw new Error('Plugin checkout must be clean before hydration.');
  if (run('git', ['branch', '--show-current']) !== 'main') throw new Error('Plugin checkout must be on main.');
  const lockPath = join(plugin, 'meetly/skills.lock.json');
  const previous = JSON.parse(await readFile(lockPath, 'utf8'));
  run('npm', ['run', 'hydrate', '--', '--channel', 'latest']);
  const current = JSON.parse(await readFile(lockPath, 'utf8'));
  if (current.sha !== sha || current.channel !== 'latest') throw new Error('Hydration selected a different release; refusing to promote.');
  const generated = ['meetly/skills', 'meetly/GUIDE.md', 'meetly/skills.lock.json'];
  run('git', ['add', '--', ...generated]);
  const changed = run('git', ['diff', '--cached', '--name-only']);
  if (changed) {
    const descriptorPath = join(plugin, 'meetly/.codex-plugin/plugin.json');
    const descriptor = JSON.parse(await readFile(descriptorPath, 'utf8'));
    const version = nextPluginVersion(descriptor.version, previous.sha, current.sha);
    if (version !== descriptor.version) {
      descriptor.version = version;
      await writeFile(descriptorPath, JSON.stringify(descriptor, null, 2) + '\n');
      run('git', ['add', '--', 'meetly/.codex-plugin/plugin.json']);
    }
  }
  run('npm', ['test']);
  run('npm', ['run', 'check']);
  console.log('Plugin hydration, tests, and bundle checks passed.');
  if (!changed) { console.log('Generated plugin bundle is unchanged; no commit or version bump.'); return; }
  const allowed = path => path.startsWith('meetly/skills/') || ['meetly/GUIDE.md', 'meetly/skills.lock.json', 'meetly/.codex-plugin/plugin.json'].includes(path);
  if (!run('git', ['diff', '--cached', '--name-only']).split('\n').every(allowed) || run('git', ['diff', '--name-only']) || run('git', ['ls-files', '--others', '--exclude-standard'])) {
    throw new Error('Unexpected plugin changes after hydration/checks; refusing to commit.');
  }
  // Protect against channel movement between the propagation wait and hydration.
  if (!await latestMatches(sha)) throw new Error('Website latest changed or is unavailable; refusing to push a stale bundle.');
  run('git', ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-m', `chore: hydrate stable Meetly skills ${sha.slice(0, 12)}`]);
  // Ordinary fast-forward push: a concurrent main update fails safely, never force.
  run('git', ['push', 'origin', 'HEAD:main']);
  console.log('Generated plugin bundle committed and pushed to main. OpenAI submission/review remains separate.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await promotePlugin(resolve(process.argv[2] ?? 'plugin'), process.env.EXPECTED_SKILLS_SHA); }
  catch { console.error('Plugin promotion failed; check checkout, release pointers, hydration/tests, and deploy-key permissions. No raw responses are logged.'); process.exitCode = 1; }
}
