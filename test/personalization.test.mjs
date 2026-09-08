import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Editorial guardrails, not proof of model behavior; scenarios live in benchmarks.
test('conversational skills stay thin while operational detail is disclosed separately', async () => {
  for (const key of ['meetly-briefing', 'meetly-catch-up']) {
    const body = (await read(`skills/${key}/SKILL.md`)).split('---\n').slice(2).join('---\n');
    assert.ok(body.trim().split(/\s+/).length <= 310, `${key} exceeds the thin prompt budget`);
  }
});

test('account preference saves are explicit and schedule execution stays in the host', async () => {
  const setup = await read('GUIDE.md');
  assert.match(setup, /update_user_preferences/);
  assert.match(setup, /confirm/i);
  assert.match(setup, /end.of.day/i);
  assert.doesNotMatch(setup, /Never create a Meetly server preference/);
  const guide = await read('GUIDE.md');
  assert.match(guide, /account\s+profile/i);
  assert.doesNotMatch(guide, /Preferences, schedules and documents belong to the host/);
  const reference = await read('skills/meetly-briefing/references/profile-and-delivery.md');
  assert.match(reference, /preference_access/);
  assert.match(reference, /never guess revision 0/);
});

test('daily edition has an executive page and detailed edition, not a total two-page cap', async () => {
  const briefing = await read('skills/meetly-briefing/SKILL.md');
  assert.match(briefing, /executive one-pager/);
  assert.match(briefing, /detailed, newspaper-like edition/);
  assert.match(briefing, /fact-checking and research/);
  assert.match(briefing, /speaker\s+observations/i);
  assert.doesNotMatch(briefing, /at most the single|compact one–two page equivalent/);
});
