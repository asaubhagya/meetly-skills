import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('guide provides setup-first prompts for the two core and five specialist workflows', async () => {
  const guide = await readFile(new URL('../GUIDE.md', import.meta.url), 'utf8');
  const section = guide.split('## Prompts people can try\n')[1]?.split('\n## ')[0];
  assert.ok(section, 'discoverable prompt reference is missing');
  const prompts = [...section.matchAll(/^- “([^”]+)”/gm)].map(match => match[1]);
  assert.deepEqual(prompts, [
    'Set up Meetly',
    'Give me my daily executive brief',
    'Summarize my latest conversation',
    'Create a PRD from this product discussion',
    'Draft an engineering RFC from this technical discussion',
    'Find the customer insights in this interview',
    'Analyze this sales call and draft the follow-up',
    'Prepare a legal intake brief from this conversation',
  ]);
});
