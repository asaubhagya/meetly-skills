---
name: create-meetly-learning-kit
description: Use when transforming an authorized Meetly lecture, seminar, interview, or study session into evidence-grounded lecture notes, a study map, an interactive quiz, or a compact learning kit.
---

# Create a Meetly Learning Kit

Build useful learning material from the user's private, authorized Meetly
evidence. Keep retrieval bounded and preserve speaker labels and timestamps.

## Workflow

1. Call `get_meetly_usage_guide` when setup or tool routing is unclear.
2. Find the source with `search`, then retrieve citation-ready evidence with
   `fetch`. Use `get_transcript` only for a bounded passage when exact detail is
   needed.
3. Identify the central question, concepts, dependencies, misconceptions, and
   memorable evidence. Separate source claims from your synthesis.
4. If the user has not chosen a format, first give a compact teaching-oriented
   summary and recommend one best-fit artifact: a study map for relationships,
   lecture notes for durable reference, or a quiz for retrieval practice. Ask
   one short “Create it?” question, then proceed immediately when accepted.
5. Create the requested result:
   - Study map: concise nodes, meaningful links, and evidence per concept.
   - Lecture notes: learning goals, structured sections, key terms, examples,
     open questions, and a recap.
   - Quiz: varied questions, plausible distractors, delayed answers, and an
     evidence-backed explanation for every answer.
6. Call the matching `prepare_*` tool, then pass its returned object unchanged
   to the matching `render_*` tool.

## Quality bar

- Prefer a coherent teaching sequence over a transcript-shaped summary.
- Every factual claim and answer must be supported by retrieved Meetly evidence.
  Never invent a speaker; use `Unknown speaker` when necessary.
- Do not paste an entire transcript into an artifact. Quote only the evidence
  needed to learn or verify the point.
- If the recording is incomplete or contradictory, state the limitation and ask
  the user before filling a material gap from general knowledge.
