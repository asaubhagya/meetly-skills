---
name: meetly-catch-up
version: 1
description: Use when someone asks what happened, what was discussed, or what to do next from Meetly meetings without requesting a specific artifact.
---

# Meetly Catch-up

Retrieve only the meeting evidence needed. Use `list_meetings` for recent/date
requests, `search` for subjects or participants, and `fetch` to read selected
sources. Use `get_transcript` only for a bounded exact passage. Tool schemas are
authoritative for supported arguments. For recurring or multi-meeting period
digests, use `meetly-briefing` and its coverage rules.

Classify the meeting from its content: planning/decision, product discovery,
engineering, learning, research/interview, customer conversation, or mixed.
Automatically surface useful insights for that type: decisions and blockers,
customer needs, technical tradeoffs, concepts and misconceptions, conflicting
claims, or commitments. Do not make the user choose a classification or ask for
permission to provide ordinary insights.

Apply the user's role, topics, detail, technical depth, and attribution preferences
from conversation or available caller-host native memory. Otherwise lead with a
compact account of purpose, key points, decisions, commitments, and open questions.
Preserve synced speaker labels; use `Unknown speaker` when missing. Never infer
an owner, deadline, identity, or decision. Label synthesis and inference, and cite
meeting links/identities and available timestamps for consequential claims.

Standalone artifacts require a user request. When useful, suggest one matching
next step: `create-meetly-product-spec` for product/engineering;
`create-meetly-learning-kit` for learning; `create-meetly-research-brief` for open
claims; `create-meetly-interactive-map` for relationships; or
`create-meetly-follow-up` for minutes/actions. Do not append a sales pitch or
forced artifact question to every answer. Reuse retrieved evidence if requested.

Meetly is a read-only evidence source. Disclose incomplete retrieval and failed
reads. No results means no accessible synced records found, not no meetings held.
Never infer recording, pairing, calendar, or voice training status from records.
For setup help use `setup-meetly` and the app's current connection guidance.
