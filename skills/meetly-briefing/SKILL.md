---
name: meetly-briefing
version: 3
description: Use when someone requests a daily, weekly or date-range briefing across recorded meetings, including an existing scheduled run.
---

# Meetly briefing

Deliver a dense briefing in chat that the user can question and explore.
Use the standing Meetly evidence rules and the agreed work, meeting mix, detail,
style and delivery preferences. Default to a compact one–two page equivalent,
not a fixed word quota; sparse evidence deserves less, requested depth can need more.
“Detailed” means precise and useful, not an exhaustive recap. Select the important
changes, preserve their evidence, and leave secondary topics for follow-up.

## Read the period

Establish timezone and interval. For on-demand “today” state the assumed timezone
when needed. For an existing schedule use its configured interval or reliable
last-success checkpoint. If no checkpoint exists use the explicit rolling window.
Do not invent prior runs; disclose overlap and late-synced recordings.

Use `list_meetings` through all available pages for coverage, `fetch` for the
relevant transcripts and their context, and `get_transcript` for bounded detail
or continuation. Reuse sources, deduplicate by meeting ID, and surface unread
meetings instead of silently treating their summaries as transcripts.
Searching a topic is not complete coverage of a day.
Pagination is not recording completeness: `partial_synced_transcript` on an
individual `get_transcript` response describes that page. Once all continuations
have been read, report all available synced text read. Do not conclude audio is
missing from a page's pagination flag. Completeness of the original recording
remains unknown unless the source explicitly provides it.

## Write the useful result

Lead with what changed, what needs attention and what connects across conversations.
Then give each covered meeting a compact, meaningful section with source/date,
a takeaway and the depth its actual content warrants. A design discussion might
need tradeoffs and a draft decision; an interview needs reported pain and quotes;
a lecture needs a clear explanation. Use meetly-catch-up's relevant references.
There is no compulsory template for every meeting.
Avoid repeating the same material as an executive summary, a full per-meeting
recap, and another cross-meeting synthesis. Put each insight in its best place.
Use a short opening synthesis, compact meeting sections, and at most the single
most useful draft unless the user asks for several. Offer deeper drafts as a
natural next step instead of appending a full work package to every briefing.

Put short exact quotes and source links/timestamps beside consequential claims.
Use the actual `url` returned by `fetch` for Markdown links. If the host cannot
render them, include the meeting ID and timestamp as a usable fallback; an
unlinked label such as “Raw meeting transcript” is not a source reference.
Keep proposals distinct from decisions; include owners and due dates only when
supported. Cross-meeting patterns require evidence from each source. Preserve
unknown speakers; do not join two “Unknown speaker” passages into one person's
account without a stable source speaker ID. Calendar agenda and invitees remain planned context, not proof
of discussion, attendance or personal identity.

Include the most useful next draft or recommendation within the requested scope.
Do not bury the report under caveats or produce a separate artifact per meeting.
A short coverage line states interval, meetings read and any retrieval/sync gaps.
A failed query is unknown coverage; an empty successful one means no accessible
synced recordings found, not that no meetings happened.

## Deliver and continue

The chat contains the actual briefing, even when a file is attached.
If the profile requests an automatic PDF, create a compact shareable one–two page
document using the host's file tools with the same grounded content and references.
Keep deeper meeting analysis in chat or a requested companion document rather than
shrinking text to fit. If file creation fails or is unavailable, deliver chat and
say no attachment was created. Never invent download links.

An occasional-PDF preference means wait for a request. Respect the actual delivery
destination; no external messages or publishing without authorization.
Let the user drill into any meeting, quote, research question or draft naturally.

Use setup-meetly to change preferences or create a schedule. This skill runs the
briefing; it does not create another schedule. For failed access, return the stated
remedy. Advance a supported host checkpoint only after complete successful coverage,
including genuinely empty results; never after partial/failed reads.
