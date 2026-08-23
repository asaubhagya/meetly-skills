---
name: using-meetly-context
description: Use when answering from private Meetly meetings, lectures, interviews, or voice notes, or when turning their transcripts into study maps, lecture notes, quizzes, or engineering requirements.
---

# Using Meetly Context

Meetly is a read-only evidence source. Retrieve the minimum necessary meeting
context, synthesize in the host, and preserve source attribution.

## First-run handling

- If Meetly is not set up, direct the user to
  [download Meetly](https://apps.apple.com/app/id6747639933), record or import a
  conversation, then enable **Connect AI** in Meetly Settings and complete
  OAuth.
- MCP retrieval requires Meetly Pro. An eligible annual subscription has a 7-day
  free trial; monthly has no trial. Do not imply that the free meeting allowance
  includes MCP.
- State that recordings and transcription can remain on-device; only meetings
  the user explicitly syncs are exposed to the connector.

## Tool routing

- Find sources: `search`, then `fetch` for complete citation-ready evidence.
- Browse: `list_meetings`, then `get_meeting` for one brief.
- Exact transcript detail: `get_transcript`; follow `nextCursor` only as far as
  the task requires.
- Commitments: `list_action_items`.
- Usage and setup: `get_meetly_usage_guide`.
- Interactive artifacts: fetch evidence, author the content yourself, call the
  matching `prepare_*` tool, then pass its returned object unchanged to the
  matching `render_*` tool.

Available artifact pairs are study map, lecture notes, quiz, product
requirements, and engineering specification. Do not invent parameters or pass
raw transcripts into prepare tools; follow each published input schema.

## Evidence rules

- Every artifact claim, quiz answer, and engineering requirement needs quoted
  evidence returned by Meetly.
- Preserve speaker labels exactly. If attribution is absent, write
  `Unknown speaker`; never infer a name or substitute a made-up numbered
  speaker.
- Distinguish source statements from your inference. Ask the user when competing
  meetings or ambiguous evidence would materially change the result.
- Do not claim Meetly generated the artifact. The host performs synthesis;
  Meetly retrieves, validates, cites, and renders.
- Do not expose private meeting text beyond what the user’s request needs.
