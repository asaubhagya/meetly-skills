# MEE-1239 graph workflows

Work index: [MEE-1239](https://linear.app/meetly/issue/MEE-1239). Source and review: [PR #6](https://github.com/asaubhagya/meetly-skills/pull/6).

## Goal and design

Five independently distributed skills guide authorized graph onboarding, CRM reconciliation, project/task reconciliation, sourced enrichment, and recurring workflows. The existing seven skills remain available. Skills describe host behavior; they do not grant graph access, publish native data, call destinations by themselves, or create a scheduler.

`meetly-graph-onboarding` discovers actual grant and destination capabilities before selecting a first bounded workflow. `meetly-crm-workflow` maps people/accounts to supported CRM objects and requires duplicate resolution and a concrete preview. `meetly-task-workflow` maps projects/commitments to the user's chosen tracker while preserving source evidence and unresolved owners/dates. `meetly-enrichment` proposes revision-aware sourced context and reports pending native review separately from applied data. Legal exports require specific field authorization.

`meetly-recurring-workflow/scripts/journal.py` stores hashes, operation state, attempts and a verified external ID in a private local SQLite database. Identity includes source grant/Space/entity/revision and destination tenant/action. `BEGIN IMMEDIATE` serializes claims; an approved field fingerprint binds each operation to the reviewed diff. An interrupted send remains uncertain until a read-back resolves it. Destination success proceeds to Meetly reconciliation without a second create. Confirmed no-effect failures honor retry hints and reach a review hold after three attempts.

An orchestrator still owns credentials, schedules, scan watermarks, source/destination freshness checks, and connector calls. It must check persisted mappings across source revisions: a new revision is not permission to create the destination record again. The journal is not a destination uniqueness service or proof that a scheduled job runs.

## Acceptance and verification

- Validate all 12 complete skill directories and exact manifest file hashes; shared references must have no drift.
- Preserve the existing catalog and distribution regression tests.
- Reject unapproved claims and changed approved diffs; allow only one concurrent claim.
- Hold an ambiguous send; persist a destination receipt and complete only with its matching ID.
- Honor retry delay and exhaust three verified no-effect attempts into review.
- Release the selected immutable SHA through the existing beta/stable channel mechanism, then verify the deployed usage guide returns all five bodies and matching versions.
- Run approved record/destination workflows in both ChatGPT and Claude and prove repeat-run destination IDs remain unchanged. Verify native approval independently.

The [Mac mini verification record](../testing/runs/MEE-1239/2026-11-21-catalog.md) records completed local checks and the remaining live gates. No schedule, destination write, release tag, channel advance, or marketplace publication is established by the local tests.

## Change history

21 November 2026: reconciled the existing five-workflow implementation and journal at `223bd3859c8ae0b5d8bb4209254764adf3c5f67c` with Mac mini verification and release boundaries. No skill body or version changed in this documentation pass.

## Synthetic development trial

Present two starting jobs, remembering a person and following through on a commitment. On an empty selection, allow an authorized external contact preview. Source-backed notes attach only to existing shared people. Preserve unmatched contacts for a proposed native import capability. For recurring creates, track the stable source-to-destination binding independently of revision, serializing the first send across overlapping revisions. Rehearse sales, project delivery and legal intake. Prove the same source can be deliberately mapped to two distinct portals while a revision change in one portal cannot create twice. Any missed reply or previous unverified journal entry requires destination lookup.

For a repeatable CRM exercise, add a provider-neutral contact preview to the CRM skill. It receives already-authorized normalized fields, verified email matches or a saved mapping, and the destination's writable schema. It returns a diff, skipped properties and any identity/required-field holds. Exercise HubSpot-style, second-portal and alternative CRM schemas through disposable destination servers and verify the real journal across retries and revisions.
