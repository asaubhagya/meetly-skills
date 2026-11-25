import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

// MEE-1347 (owner, 25 Nov 2026: drop agents.getmeetly.ai): this repository publishes its own release channels.
// `channels.json` and the stable skills ZIP live on the `channels` branch and are read through raw.githubusercontent.com
// by the Meetly connector (meetly-mcp supabase/functions/mcp/setup.ts) and the plugin (meetly-plugin scripts/hydrate.mjs).
// Every manifest file is verified (bytes and SHA-256) and, for the stable release that ships in the ZIP, every tool it
// names must exist in the live connector catalog. Nothing is published when any check fails.
export const REPO = 'asaubhagya/meetly-skills';
export const BRANCH = 'channels';
export const RAW = `https://raw.githubusercontent.com/${REPO}`;
export const CHANNELS_URL = `${RAW}/${BRANCH}/channels.json`;
export const CATALOG = 'https://mcp.getmeetly.ai/mcp/.well-known/mcp/server-card.json';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const SHA = /^[a-f0-9]{40}$/;
const safePath = value => typeof value === 'string' && value.split('/').every(p => /^[A-Za-z0-9_.-]+$/.test(p) && p !== '.' && p !== '..');
const semver = name => /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(name);

export function highestStable(tags) {
  const candidates = tags.map(name => [name, semver(name)]).filter(([, m]) => m);
  assert(candidates.length, 'No stable vX.Y.Z tag found');
  candidates.sort(([, a], [, b]) => {
    for (let i = 1; i <= 3; i++) if (BigInt(a[i]) !== BigInt(b[i])) return BigInt(a[i]) > BigInt(b[i]) ? -1 : 1;
    return 0;
  });
  return candidates[0][0];
}

export function verifyFile(file, bytes) {
  assert(Number.isSafeInteger(file.bytes) && bytes.length === file.bytes, `Byte count mismatch: ${file.src}`);
  assert(/^[a-f0-9]{64}$/.test(file.sha256) && createHash('sha256').update(bytes).digest('hex') === file.sha256, `SHA-256 mismatch: ${file.src}`);
}

/** Tool names a skill calls must exist in the live catalog. Plain schema field names and enum values are allowed. */
export function validateToolReferences(text, names, label, identifiers = new Set()) {
  for (const match of text.matchAll(/\btool:([A-Za-z0-9_-]+)|`([a-z][a-z0-9_]*)(\([^`]*\))?`|\b([a-z][a-z0-9_]+)\(\)/g)) {
    const name = match[1] || match[2] || match[4];
    const explicit = match[1] || match[3] || match[4] || /\b(?:call|invoke|run)\s*$/i.test(text.slice(0, match.index));
    if (!explicit && identifiers.has(name)) continue;
    if (explicit || /^(get|list|search|fetch|setup|start|read|create|update|delete|set|send|remember|schedule|save|request|resolve|install)(_|$)/.test(name)) {
      assert(names.has(name), `Unknown tool ${name} in ${label}`);
    }
  }
}

export function catalogNames(catalog) {
  assert(catalog?.schema === 'meetly-mcp-catalog/1' && Array.isArray(catalog.tools) && catalog.tools.length, 'Invalid Meetly catalog');
  const names = new Set(catalog.tools.map(t => t.name));
  const identifiers = new Set();
  const walk = schema => {
    if (!schema || typeof schema !== 'object') return;
    for (const key of Object.keys(schema.properties || {})) identifiers.add(key);
    for (const value of schema.enum || []) if (typeof value === 'string') identifiers.add(value);
    for (const value of Object.values(schema)) if (value && typeof value === 'object') walk(value);
  };
  for (const tool of catalog.tools) { walk(tool.inputSchema); walk(tool.outputSchema); }
  return { names, identifiers };
}

/** A deterministic ZIP: sorted entries, DOS time 1980-01-01 00:00, raw deflate, no extra fields. */
export function zip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, data] of [...entries].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    const nameBytes = Buffer.from(name, 'utf8');
    const deflated = deflateRawSync(data, { level: 9 });
    const crc = crc32(data) >>> 0;
    const header = (signature, central) => {
      const b = Buffer.alloc(central ? 46 : 30);
      let o = 0;
      const u32 = v => { b.writeUInt32LE(v >>> 0, o); o += 4; };
      const u16 = v => { b.writeUInt16LE(v, o); o += 2; };
      u32(signature);
      if (central) u16(20);
      u16(20); u16(0x0800); u16(8); u16(0); u16(33); u32(crc); u32(deflated.length); u32(data.length); u16(nameBytes.length); u16(0);
      if (central) { u16(0); u16(0); u16(0); u32(0); u32(offset); }
      return b;
    };
    const local = Buffer.concat([header(0x04034b50, false), nameBytes, deflated]);
    centrals.push(Buffer.concat([header(0x02014b50, true), nameBytes]));
    locals.push(local);
    offset += local.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(centrals.length, 8); end.writeUInt16LE(centrals.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

/** Verifies a release and returns its files. `read(sha, src)` returns the committed bytes. */
export function release(read, sha, label, catalog) {
  assert(SHA.test(sha), `Invalid ${label} SHA`);
  const manifest = JSON.parse(read(sha, 'manifest.json').toString('utf8'));
  assert(manifest.schema === 'meetly-skills/1' && Array.isArray(manifest.skills) && manifest.skills.length && manifest.guide?.src === 'GUIDE.md', `Invalid ${label} manifest`);
  const checked = file => {
    assert(safePath(file.src), `Unsafe source path: ${file.src}`);
    const bytes = read(sha, file.src);
    verifyFile(file, bytes);
    if (catalog && file.src.endsWith('.md')) validateToolReferences(bytes.toString('utf8'), catalog.names, `${label}/${file.src}`, catalog.identifiers);
    return bytes;
  };
  checked(manifest.guide);
  const keys = new Set();
  const files = new Map();
  for (const skill of manifest.skills) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.key) && !keys.has(skill.key), `Invalid/duplicate skill: ${skill.key}`);
    keys.add(skill.key);
    assert(Number.isSafeInteger(skill.version) && skill.version > 0, `Invalid version: ${skill.key}`);
    assert(typeof skill.description === 'string' && Array.isArray(skill.files) && skill.files.some(f => f.path === 'SKILL.md'), `Invalid skill: ${skill.key}`);
    for (const file of skill.files) {
      assert(safePath(file.path) && file.src === `skills/${skill.key}/${file.path}`, `Invalid skill file: ${file.src}`);
      files.set(`${skill.key}/${file.path}`, checked(file));
    }
  }
  return files;
}

/** channels.json and the stable ZIP (at zips/<sha>.zip, immutable per release) for these two commits. */
export function build({ read, latest, beta, catalog }) {
  const names = catalogNames(catalog);
  const stableFiles = release(read, latest.sha, 'latest', names);
  release(read, beta.sha, 'beta', null); // beta is verified but not shipped in the ZIP; its tools may not be live yet
  const archive = zip(stableFiles);
  const zipPath = `zips/${latest.sha}.zip`;
  const channels = {
    schema: 'meetly-channels/1',
    latest: {
      ref: latest.ref, sha: latest.sha, manifestUrl: `${RAW}/${latest.sha}/manifest.json`,
      skillsZip: { url: `${RAW}/${BRANCH}/${zipPath}`, sha256: createHash('sha256').update(archive).digest('hex'), bytes: archive.length },
    },
    beta: { ref: 'main', sha: beta.sha, manifestUrl: `${RAW}/${beta.sha}/manifest.json` },
  };
  return { channels, files: new Map([['channels.json', Buffer.from(JSON.stringify(channels, null, 2) + '\n')], [zipPath, archive]]) };
}

const git = (cwd, args, options = {}) => execFileSync('git', args, { cwd, maxBuffer: 64 << 20, ...options });

/** Resolve the highest stable tag and origin/main, build, and (with publish) commit to the channels branch and push. */
export async function run({ cwd = process.cwd(), publish = false, fetchImpl = fetch, log = console.log } = {}) {
  git(cwd, ['fetch', '--quiet', '--tags', 'origin', 'main']);
  const ref = highestStable(git(cwd, ['tag', '--list', 'v*'], { encoding: 'utf8' }).split('\n').filter(Boolean));
  const latest = { ref, sha: git(cwd, ['rev-parse', `${ref}^{commit}`], { encoding: 'utf8' }).trim() };
  const beta = { ref: 'main', sha: git(cwd, ['rev-parse', 'origin/main^{commit}'], { encoding: 'utf8' }).trim() };
  const response = await fetchImpl(CATALOG, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
  assert(response.ok, `Catalog request failed (${response.status})`);
  const read = (sha, src) => git(cwd, ['show', `${sha}:${src}`]);
  const { channels, files } = build({ read, latest, beta, catalog: await response.json() });
  log(`latest ${latest.ref}@${latest.sha} · beta ${beta.sha} · zip ${channels.latest.skillsZip.sha256} (${channels.latest.skillsZip.bytes} bytes)`);
  if (!publish) return channels;
  const dir = mkdtempSync(path.join(tmpdir(), 'meetly-channels-'));
  try {
    const exists = git(cwd, ['ls-remote', '--heads', 'origin', BRANCH], { encoding: 'utf8' }).trim() !== '';
    if (exists) {
      git(cwd, ['fetch', '--quiet', 'origin', BRANCH]);
      git(cwd, ['worktree', 'add', '--quiet', '--detach', dir, 'FETCH_HEAD']);
    } else {
      git(cwd, ['worktree', 'add', '--quiet', '--detach', dir]);
      git(dir, ['checkout', '--quiet', '--orphan', 'channels-publish']);
      git(dir, ['rm', '-rf', '--quiet', '.']);
    }
    for (const name of readdirSync(dir)) if (name !== '.git') rmSync(path.join(dir, name), { recursive: true, force: true });
    for (const [name, bytes] of files) { mkdirSync(path.dirname(path.join(dir, name)), { recursive: true }); writeFileSync(path.join(dir, name), bytes); }
    writeFileSync(path.join(dir, 'README.md'), `# meetly-skills release channels\n\nGenerated by \`scripts/publish-channels.mjs\` on \`main\`. Do not edit. Read by the Meetly connector and plugin at ${CHANNELS_URL}.\n`);
    git(dir, ['add', '-A']);
    if (git(dir, ['status', '--porcelain'], { encoding: 'utf8' }).trim() === '') { log('Channels unchanged; nothing to publish.'); return channels; }
    git(dir, ['-c', 'user.name=meetly-skills channels', '-c', 'user.email=channels@users.noreply.github.com', 'commit', '--quiet', '-m', `channels: latest ${latest.ref}@${latest.sha.slice(0, 7)}, beta ${beta.sha.slice(0, 7)}`]);
    git(dir, ['push', '--quiet', 'origin', `HEAD:refs/heads/${BRANCH}`]);
    log(`Published ${CHANNELS_URL}`);
    return channels;
  } finally {
    try { git(cwd, ['worktree', 'remove', '--force', dir]); } catch { rmSync(dir, { recursive: true, force: true }); }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run({ publish: process.argv.includes('--publish') }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
