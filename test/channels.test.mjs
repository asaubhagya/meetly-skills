import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { build, highestStable, zip, CHANNELS_URL } from '../scripts/publish-channels.mjs';

// MEE-1347: this repo publishes channels.json and the stable ZIP itself (no agents.getmeetly.ai).
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const A = 'a'.repeat(40), B = 'b'.repeat(40);
const catalog = { schema: 'meetly-mcp-catalog/1', tools: [{ name: 'get_transcript', inputSchema: { type: 'object', properties: { meeting_id: { type: 'string' } } } }] };
function repo(skillText = { [A]: 'Call `get_transcript`.\n', [B]: 'Call `get_transcript`.\n' }) {
  const files = new Map();
  for (const sha of [A, B]) {
    const guide = Buffer.from('# Guide\n'), skill = Buffer.from(skillText[sha]), ref = Buffer.from([0, 255, 13, 10]);
    const entry = (src, bytes) => ({ src, sha256: digest(bytes), bytes: bytes.length });
    files.set(`${sha}:GUIDE.md`, guide);
    files.set(`${sha}:skills/catch-up/SKILL.md`, skill);
    files.set(`${sha}:skills/catch-up/assets/x.bin`, ref);
    files.set(`${sha}:manifest.json`, Buffer.from(JSON.stringify({ schema: 'meetly-skills/1', guide: entry('GUIDE.md', guide), skills: [{ key: 'catch-up', version: 1, description: 'Catch up.', files: [
      { path: 'SKILL.md', ...entry('skills/catch-up/SKILL.md', skill) }, { path: 'assets/x.bin', ...entry('skills/catch-up/assets/x.bin', ref) }] }] })));
  }
  return { files, read: (sha, src) => { const b = files.get(`${sha}:${src}`); if (!b) throw new Error('missing ' + src); return b; } };
}
const input = r => ({ read: r.read, latest: { ref: 'v3.2.10', sha: A }, beta: { ref: 'main', sha: B }, catalog });

/** Reads a stored/deflated ZIP written by zip() back into entries. */
function unzip(archive) {
  const out = {};
  for (let o = 0; archive.readUInt32LE(o) === 0x04034b50;) {
    const size = archive.readUInt32LE(o + 18), raw = archive.readUInt32LE(o + 22), nameLen = archive.readUInt16LE(o + 26);
    const name = archive.subarray(o + 30, o + 30 + nameLen).toString('utf8');
    const data = inflateRawSync(archive.subarray(o + 30 + nameLen, o + 30 + nameLen + size));
    assert.equal(data.length, raw);
    out[name] = data;
    o += 30 + nameLen + size;
  }
  return out;
}

test('highest stable tag is the highest vX.Y.Z, ignoring prereleases and other tags', () => {
  assert.equal(highestStable(['v3.2.9', 'v3.2.10', 'v3.10.0-rc.1', 'v4', 'junk']), 'v3.2.10');
  assert.throws(() => highestStable(['v1', 'main']), /No stable/);
});

test('channels.json pins both commits; the stable ZIP holds exactly the stable skill files, at an immutable path', () => {
  const { channels, files } = build(input(repo()));
  assert.equal(CHANNELS_URL, 'https://raw.githubusercontent.com/asaubhagya/meetly-skills/channels/channels.json');
  assert.deepEqual([...files.keys()], ['channels.json', `zips/${A}.zip`]);
  assert.deepEqual(JSON.parse(files.get('channels.json')), channels);
  assert.equal(channels.latest.manifestUrl, `https://raw.githubusercontent.com/asaubhagya/meetly-skills/${A}/manifest.json`);
  assert.equal(channels.beta.manifestUrl, `https://raw.githubusercontent.com/asaubhagya/meetly-skills/${B}/manifest.json`);
  assert.equal(channels.beta.skillsZip, undefined);
  const archive = files.get(`zips/${A}.zip`);
  assert.deepEqual(channels.latest.skillsZip, { url: `https://raw.githubusercontent.com/asaubhagya/meetly-skills/channels/zips/${A}.zip`, sha256: digest(archive), bytes: archive.length });
  const entries = unzip(archive);
  assert.deepEqual(Object.keys(entries), ['catch-up/SKILL.md', 'catch-up/assets/x.bin']);
  assert.deepEqual(entries['catch-up/assets/x.bin'], Buffer.from([0, 255, 13, 10]));
});

test('the ZIP is deterministic regardless of entry order', () => {
  const a = zip(new Map([['b', Buffer.from('2')], ['a', Buffer.from('1')]]));
  const b = zip(new Map([['a', Buffer.from('1')], ['b', Buffer.from('2')]]));
  assert.deepEqual(a, b);
  assert.equal(a.readUInt16LE(12), 33); // 1980-01-01
});

test('a changed or missing file blocks publishing', () => {
  const r = repo();
  r.files.set(`${A}:skills/catch-up/assets/x.bin`, Buffer.from([1, 2, 3, 4]));
  assert.throws(() => build(input(r)), /SHA-256 mismatch/);
  const m = repo();
  m.files.delete(`${B}:GUIDE.md`);
  assert.throws(() => build(input(m)), /missing GUIDE/);
});

test('stable skills must name live tools; beta may name a tool that is not live yet', () => {
  assert.throws(() => build(input(repo({ [A]: 'Call `preview`.\n', [B]: 'ok\n' }))), /Unknown tool preview in latest/);
  build(input(repo({ [A]: 'Call `get_transcript`.\n', [B]: 'Call `preview`.\n' })));
});
