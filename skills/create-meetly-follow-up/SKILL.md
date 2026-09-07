---
name: create-meetly-follow-up
version: 1
description: Create grounded meeting minutes, a decision log, action plan, status update, or follow-up message from an authorized Meetly planning, review, customer, or team meeting.
---

# Create a Meetly Follow-up

Use for an explicitly requested artifact. Ordinary catch-up insights do not
authorize creating or sending one. Reuse evidence already retrieved for the
request. Draft with the host's native capabilities; sending or publishing requires
the user's authorization for that destination.

Find the meeting with `list_meetings` or `search`, then read it with `fetch`.
Use `get_transcript` only for bounded exact wording.

Choose the requested deliverable, or the lightest one that moves the work
forward. Separate decisions, proposals, action items, risks, and unanswered
questions. An action item needs an explicit task; include owner and deadline
only when the source supplies them. Formal minutes must not invent motions,
votes, attendance, or approvals.

For a follow-up email or status update, write for the intended audience and
include only necessary private detail. For a decision log, record the decision,
rationale, alternatives, dissent, and follow-up verification. For an action
plan, organize by outcome rather than transcript order.

Preserve speaker labels and include concise evidence for consequential claims.
Mark uncertain or inferred items for confirmation. Create the artifact with the
host's native writing capabilities; Meetly remains a read-only evidence source.
