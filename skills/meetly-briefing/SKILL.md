---
name: meetly-briefing
version: 1
description: Use when someone requests a daily, weekly, recurring, or date-range briefing across Meetly meetings, including scheduled catch-up runs.
---

# Meetly Briefing

Produce a useful digest of recorded meeting evidence for an explicit interval.
Use the agreed profile from the scheduled prompt, conversation, or available
caller-host native memory. Otherwise use balanced detail and plain language.
Do not write preferences or create schedules here; use `setup-meetly` when the
user asks to configure them.

1. Establish the interval and timezone. For a scheduled run, use the specified
   window or last successful coverage checkpoint through now. Without a reliable
   checkpoint, use the configured rolling window and disclose possible overlap.
   Do not invent a previous run or silently skip a missed interval. For an
   on-demand request with an ambiguous boundary, clarify or state the assumption.
2. Use `list_meetings` for the interval; follow available pagination to establish
   coverage. Use `search` for topic-specific follow-up and `fetch` for relevant
   evidence. Tool schemas determine supported filters; filter returned timestamps
   locally if needed. Use bounded `get_transcript` only for missing exact detail.
   Deduplicate by source identity, not similar titles. Late sync can add older
   meetings; disclose this limitation when relying on meeting dates alone.
3. Classify each meeting from content (planning, product, engineering, learning,
   research/interview, customer, or mixed). Automatically extract useful insights:
   changed decisions, explicit commitments, blockers, recurring concerns, and
   connections supported across sources. Adapt technical depth and attribution.
   Separate proposals from decisions and inferred themes from participant claims.
4. Lead with what matters for the person's role and topics. Cite meeting identity,
   date and available links/timestamps for consequential claims. Preserve synced
   speaker labels; use `Unknown speaker` for missing attribution. Include owners
   and deadlines only when sourced. Do not claim a task is completed or overdue
   without sufficient dated evidence. Do not generate a standalone artifact
   unless requested; one relevant suggestion is enough when useful.
5. Always report coverage: requested interval/timezone, meetings actually read,
   and any unavailable records, truncated pages, failed fetches, or partial sync.
   A successful empty query means “No accessible synced meetings found for this
   interval,” not “You had no meetings.” A failed query means coverage is unknown,
   not empty. Never fabricate calendar events, app recording/pairing readiness,
   calendar connection, or voice training status.

If access fails, deliver a concise failure briefing with the tool's stated next
action. Do not silently suppress the run. If some reads fail, summarize available
evidence and identify the gap. Advance a native coverage checkpoint only after
complete successful coverage; do not advance it after partial/failed retrieval.
An empty but successful complete query may advance it with the sync caveat.
Do not store checkpoints on the Meetly server. Minimize private transcript text
and respect the scheduler's actual delivery destination.
