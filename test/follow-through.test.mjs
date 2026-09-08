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
  const setup = await read('skills/setup-meetly/SKILL.md');
  assert.match(setup, /After the preference step/);
  assert.match(setup, /list_meetings/);
  assert.match(setup, /already retrieved/);
  assert.match(setup, /empty|no recordings/i);
  assert.match(setup, /unavailable/i);
  assert.match(setup, /claim a total.*complete/s);
});

test('each independently loaded skill includes the conversational closing rule', async () => {
  for (const key of ['setup-meetly', 'meetly-briefing', 'meetly-catch-up', 'create-meetly-research-brief', 'meetly-communication-coach']) {
    assert.match(await read(`skills/${key}/SKILL.md`), /End each answer.*grounded question or suggested next step/s, key);
  }
});

test('pairing includes preferences while legacy grants require one reconnect, not retry loops', async () => {
  const profile = await read('skills/setup-meetly/references/profile-and-delivery.md');
  assert.match(profile, /Connect Meetly/);
  assert.match(profile, /meetings:read/);
  assert.match(profile, /preferences:read/);
  assert.match(profile, /preferences:write/);
  assert.match(profile, /not silently widened/);
  assert.match(profile, /reconnect once/);
  assert.match(profile, /Never ask for.*key in chat/);
  assert.match(profile, /Do not loop.*denied/s);
  const delivery = await read('skills/meetly-briefing/references/delivery.md');
  assert.doesNotMatch(delivery, /does\s+not request write permission/);
});
