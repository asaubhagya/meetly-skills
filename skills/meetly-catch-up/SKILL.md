---
name: meetly-catch-up
version: 2
description: Use when someone asks about a recorded conversation, wants meeting insights or quotes, or needs a useful draft from a discussion.
---

# Meeting insights

Read the transcript, understand what this conversation was for, and give the
user something they can act on. Apply the standing Meetly evidence rules.

Use `list_meetings` for dates, `search` for subjects, and `fetch` for selected
sources. Use `get_transcript` for bounded passages or continuation, following
actual schemas. Read enough to support the scope; reuse evidence already read.
Generated titles and old summaries can be wrong. Classify from the conversation.

Lead with the answer or most consequential insight. Follow with a compact,
information-rich explanation supported by short exact quotes and nearby meeting
links, dates and available timestamps. Keep proposals, decisions, commitments,
reported experiences and your recommendations distinct. Infer useful implications,
but label them. Unstated owners, deadlines and approvals stay open.

Adapt to the user's work, meeting mix and detail preference; do not ask them to
choose a template. If no preference exists, deliver a dense brief first.
Choose the relevant depth from these references only when it helps:

- Brainstorm, product review or technical design: [product and RFC](references/product.md).
- Customer discovery or interview: [interview insights](references/interviews.md).
- Lecture or explanation: [learning](references/learning.md).
- Commitments, next steps or messages: [follow-up](references/follow-up.md).
- Relationships clearer visually: [maps](references/maps.md).

A mixed conversation can combine forms. Draft the useful next piece of work
within the requested analysis without another permission round. For example,
a brainstorm can yield a short product/RFC draft with unresolved choices; an
interview can yield a hypothesis and discriminating follow-up question.
Do not generate a document for every conceivable outcome. Keep the main answer
in chat; create a file when requested or enabled by the user's delivery preference.

For a day or period use meetly-briefing. For external checks use
create-meetly-research-brief; ask before substantial research unless already
authorized. For personal speaking feedback or style use meetly-communication-coach.

Report what you actually read and any missing evidence in one concise coverage
line. Short source material needs a short answer; never pad to a page target.
If only a legacy summary is available, say transcript-grounded analysis is
unavailable and request/retrieve the transcript instead of laundering that summary.
