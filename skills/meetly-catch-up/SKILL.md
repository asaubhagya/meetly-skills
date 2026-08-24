---
name: meetly-catch-up
description: Summarize or answer from authorized Meetly meetings, especially when the user asks what happened, what was discussed, or what to do next without naming a specific artifact.
---

# Meetly Catch-up

Retrieve only the meeting context needed for the request, preserve attribution,
and turn it into a useful next step.

1. Use `list_meetings` for recent or date-based requests. Use `search` when the
   user names a subject, participant, or phrase. Read a selected source with
   `fetch`; use `get_transcript` only for a bounded exact passage.
2. Classify the primary meeting type: planning/decision, product discovery,
   engineering, learning, research/interview, customer conversation, or general
   notes.
3. Lead with a compact summary of purpose, key points, decisions, commitments,
   and unresolved questions. Do not turn a suggestion into a decision or infer
   an owner, deadline, or speaker.
4. Preserve synced speaker labels. Use `Unknown speaker` when attribution is
   absent. Distinguish transcript evidence from your inference.
5. Recommend one best next artifact based on the meeting type and explain why in
   one sentence. Mention at most two alternatives:
   - product or engineering discussion: `$create-meetly-product-spec`
   - lecture or study session: `$create-meetly-learning-kit`
   - interview or open claims: `$create-meetly-research-brief`
   - relationships, systems, or dependencies: `$create-meetly-interactive-map`
   - planning, decisions, or customer calls: `$create-meetly-follow-up`
6. End with one easy action, such as “Create the product spec?” If the user
   agrees, use the named skill without repeating retrieval or asking for facts
   already in the source.

Meetly is read-only. Do not expose more private transcript text than the request
needs. If no meetings are synced, direct the user to Meetly Settings → Connect
AI; MCP access requires Meetly Pro.
