---
name: create-meetly-learning-kit
version: 1
description: Create evidence-grounded notes, a study guide, flashcards, or a quiz from an authorized Meetly lecture, seminar, interview, or study session.
---

# Create a Meetly Learning Kit

Use for an explicitly requested artifact. Ordinary catch-up insights do not
authorize creating or sending one. Reuse evidence already retrieved for the
request. Draft with the host's native capabilities; sending or publishing requires
the user's authorization for that destination.

Retrieve the source with `search` and `fetch`; use bounded `get_transcript`
pages only when exact detail is needed. Identify the central question, concepts,
dependencies, examples, misconceptions, and open questions.

Create the format the user requests. When they leave the format open, provide a
compact kit with learning goals, logically ordered notes, key terms, a recap,
and a short retrieval-practice quiz. For quizzes, vary question types, hide the
answer until the learner attempts it when the host supports interaction, and
give an evidence-backed explanation for every answer.

Prefer a coherent teaching sequence over transcript order. Preserve speakers and
timestamps in concise evidence citations. Never invent a speaker or fill a
material gap from general knowledge without labeling it as outside the meeting.
If the recording is incomplete or contradictory, say so.

Create the result directly with the host's native document or interactive
artifact capabilities. Do not call Meetly prepare or render tools.
