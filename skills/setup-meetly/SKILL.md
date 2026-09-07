---
name: setup-meetly
version: 1
description: Use when someone wants to get started with Meetly, personalize meeting digests, or set up or change recurring catch-ups.
---

# Set up Meetly

Have a short conversation, asking one or two related questions at a time. Reuse
answers already given and any available caller-host native memory. Start with
what the person uses meetings for and wants help keeping track of.

## App readiness

Ask whether they have recorded in Meetly, connected/paired their AI host, linked
their calendar, and completed voice training. These are user-reported states:
MCP cannot inspect recording readiness, pairing, calendar connection, or voice
training. Retrieved meetings prove only that those records are accessible.
Never infer app status from an empty list, speaker labels, or a successful call.

For anything unfinished, guide them to the relevant flow in the Meetly app:
make a short recording; open Settings → Connect AI for connection guidance;
follow the app's calendar connection or voice training guidance. Use current
in-app labels and help if available; do not invent screens, settings, or success.
Calendar and voice training are optional for this conversation. An access error
needs its stated remedy, not a claim that setup succeeded. Continue tailoring
preferences while the user handles app steps.

## Shape the digest

Learn their role/audience, digest detail (brief, balanced, or thorough), topics
to prioritize or skip, technical depth, and speaker attribution preference.
Offer a compact proposed profile for confirmation instead of a long form.
Defaults when accepted: balanced detail, plain language, decisions and actions
first, speaker names for consequential commitments when supported by evidence.
Speaker preferences change presentation, never source identity or certainty.

Persist preferences ONLY through the caller host's native memory, when available
and permitted. Look for an existing Meetly preference first; update that entry
instead of adding a duplicate. Never use Meetly/server preference writes, an
external memory service, or a file fallback. If native memory is unavailable,
unreadable, disallowed, or a write fails, apply the profile in this conversation
and say it was not saved. Claim persistence only after a successful tool result.
If existing memory cannot be inspected, do not create a potentially duplicate
entry; keep preferences in-session until the host/user resolves this.

## Optional recurring briefing

Offer a recurring briefing if useful; do not create one without the user's
request. Obtain time, timezone, and cadence (including weekdays for weekly or
weekday schedules). Confirm ambiguous zones and daylight-saving expectations.
Inspect the caller host's native scheduling tool documentation/capabilities to
confirm that scheduled execution can access authenticated Meetly tools. A timer
or reminder alone is insufficient; interactive access does not prove scheduled
access. If unsupported or unknown, explain and offer an on-demand briefing.

Inspect existing native schedules before creating anything. Update a matching
Meetly briefing, preserving unrelated fields; if several plausibly match, ask
which to change. If schedules cannot be inspected, avoid creating a duplicate.
Use ONLY the caller host's native scheduler, never a Meetly server write,
external scheduler, shell cron, or invented tool.

The scheduled prompt should invoke `meetly-briefing`, include the agreed profile,
time window/timezone and cadence, and require coverage/error disclosure on every
run. Include the profile because scheduled execution may lack conversation
memory. A schedule is not a separate preference store. Use a supported native
checkpoint for the last successful covered interval when available; otherwise
use an explicit rolling interval and disclose possible overlap.

## Finish

Recap the agreed profile, app steps still user-reported or pending, whether
memory was actually saved, and whether a schedule was actually created/updated
(with time, timezone, cadence, and identifier if returned). Distinguish a draft
or failed tool result from completion. Offer or provide a first catch-up from
accessible meetings without fabricating calendar events or voice status.
