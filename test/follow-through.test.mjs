import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Editorial regression guards, not model-behavior scores. See benchmarks/follow-through.md.
test('standing guidance closes answers with grounded progress while honoring stop requests', async () => {
  const guide = await read('GUIDE.md');
  assert.match(guide, /end every Meetly answer/i);
  assert.match(guide, /question or suggested next step/i);
  assert.match(guide, /explicitly stops|asks for no follow-ups/i);
  assert.match(guide, /Never invent meetings, counts/i);
  assert.match(guide, /suggestion is\s+not authorization/i);
});

test('setup moves from preferences to evidence-backed discovery, including unavailable results', async () => {
  const setup = await read('GUIDE.md');
  assert.match(setup, /After the preference step/);
  assert.match(setup, /list_meetings/);
  assert.match(setup, /already retrieved|already retrieved or/);
  assert.match(setup, /empty|no recordings/i);
  assert.match(setup, /unavailable/i);
  assert.match(setup, /claim a total.*complete/s);
});

test('each independently loaded skill includes the conversational closing rule', async () => {
  for (const key of ['meetly-briefing', 'meetly-catch-up']) {
    assert.match(await read(`skills/${key}/SKILL.md`), /End each answer.*grounded question or suggested next step/s, key);
  }
});

test('approved connections do not repeat pairing for missing personalization', async () => {
  const profile = await read('skills/meetly-briefing/references/profile-and-delivery.md');
  assert.match(profile, /get_meetly_usage_guide/);
  assert.match(profile, /does not block meeting retrieval/);
  assert.match(profile, /not a pasted connection key/);
  assert.match(profile, /not silently widened/);
  assert.match(profile, /reconnect for missing preference scopes only when needed/);
  assert.match(profile, /Never request keys in chat/);
  assert.match(profile, /repeating phone approval\s+repairs preference encryption/);
  assert.match(profile, /Do not loop.*denied/s);
  const delivery = await read('skills/meetly-briefing/references/delivery.md');
  assert.doesNotMatch(delivery, /does\s+not request write permission/);
});

test('all distributed Markdown uses the MCP-only guide contract without retired setup calls', async () => {
  const manifest = JSON.parse(await read('manifest.json'));
  const files = [manifest.guide.src, ...manifest.skills.flatMap(skill => skill.files.map(file => file.src))];
  for (const path of files.filter(path => path.endsWith('.md'))) {
    assert.doesNotMatch(await read(path), /`setup(?:`|\()|\bsetup\(\)/, path);
  }
  const profile = await read('skills/meetly-briefing/references/profile-and-delivery.md');
  assert.doesNotMatch(profile, /preference_access|read_write|if_authorized/);
  assert.match(profile, /do not send a dummy\s+write or invent guide parameters/);
});
