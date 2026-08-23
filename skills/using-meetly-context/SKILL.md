---
name: using-meetly-context
description: Use when answering from private Meetly meetings, lectures, interviews, or voice notes, or when turning their transcripts into study maps, lecture notes, quizzes, or engineering requirements.
---

# Using Meetly Context

Meetly is a read-only evidence source. Retrieve the minimum necessary meeting
context, synthesize in the host, and preserve source attribution.

## Default conversation flow

When the user invokes Meetly without a specific task, make the first experience
useful instead of showing a tool menu:

1. Identify the most recent authorized conversation with `list_meetings`, then
   retrieve its summary and enough speaker-tagged evidence with `fetch` to
   understand it. Do not retrieve the full transcript unless the evidence is
   insufficient.
2. Classify its primary intent: learning, product discovery, engineering,
   research/interview, decision review, planning, or general notes.
3. Lead with a compact **What happened** summary. Include the purpose, key
   ideas or decisions, open questions, and commitments when present. Preserve
   uncertainty and speaker attribution.
4. Recommend the single artifact that would create the most value from this
   conversation. Name the outcome, not the tool—for example **interactive study
   map**, **lecture notes and quiz**, **research brief**, **product brief**, or
   **engineering specification**. Mention at most two useful alternatives.
5. End with one easy action such as: “Create the interactive study map?” If the
   user agrees, create it immediately with the relevant skill and artifact
   tools; do not repeat setup or ask for details already present in the source.

A natural first response is: “I found your recent _[conversation]_ from
_[date]_. It looks like a _[type]_. Here is the quick take … The most useful
next artifact would be _[artifact]_ because _[reason]_. Want me to create it?”

If the user asks a specific question or requests a specific artifact, answer or
create it directly instead of forcing this discovery flow.

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
