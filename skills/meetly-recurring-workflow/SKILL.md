---
name: meetly-recurring-workflow
description: Set up or resume an opt-in scheduled Meetly lead or commitment workflow with scoped approval, durable checkpoints and retries.
metadata:
  version: "2"
---

# Run a recurring Meetly workflow

Discover the connected source and destination. Record the grant, Space, entity kinds, workflow owner, destination account and user-selected cadence in the orchestrator. Verify that its credential store, durable state and scheduling service are available. A host chat can perform a manual run. Only report an active schedule after inspecting the scheduler's job ID and next run time.

Dry-run one bounded page of changed records. For each eligible commitment or lead, resolve destination fields, duplicates, permitted evidence and expected source revision. Present the proposed field list, maximum batch size, destinations and approval policy. New destinations, sensitive exports and changes outside that policy require fresh approval. Keep ordinary runs read-only until approval is recorded. Never commit the consumption watermark during a dry run.

Prefer a server-provided incremental cursor with its documented lifetime. A page cursor scoped to an immutable snapshot cannot resume a change feed. If only snapshots exist, enumerate each authorized snapshot and compare stable IDs and revisions against durable state. Never infer a deletion from absence in a scoped export.

Serialize overlapping runs by workflow and scope. Persist each planned operation before writing, keyed by grant, Space, source kind/ID/revision, destination tenant and action. Record the destination receipt before requesting write-back. Advance the page watermark only after every row has a durable receipt, skip decision or durable retry entry. Reconcile ambiguous external creates by unique key. If identity remains ambiguous, hold for review. Suppress echoes by external mapping and last-applied version. Retry transient failures with bounded backoff honoring retry hints, route exhausted records to a review queue, and halt on consent revocation. Log IDs, outcomes, counts and cursor transitions without exporting transcript bodies. On cancellation disable the schedule and release its credential according to the orchestrator's lifecycle.

## Durable operation receipts

A host with persistent storage can run `python3 scripts/journal.py DATABASE COMMAND` once per operation with one JSON object on stdin. Use a private directory owned by the workflow account. Supply `grant`, `space`, `type`, `id`, `revision`, `destination`, `tenant`, `action` and `diff`. Include the destination record identity, observed version and exact old/new field values in the diff. Keep the same reviewed diff for receipt and completion. The database stores hashes, state, attempts and the verified destination ID.

1. During the dry run, call `preview` and show the actual diff to the user. After approval, pass its fingerprint as `approvedFingerprint` to `approve`.
2. Before sending, recheck both grants and the current field diff. Call `claim` with this fresh input. Only the worker that successfully claimed may write. Use the returned key as the destination idempotency key when supported. A `sending` state on restart requires a read-back investigation.
3. After destination read-back, call `receipt` with `externalId`. Resume a `reconcile` row directly at Meetly write-back. Use an idempotent proposal and report pending native review. Call `complete` with the same external ID only after the agreed reconciliation condition is satisfied.
4. For a confirmed no-effect attempt, call `retry` with `verifiedNoEffect: true` and any `retryAfterSeconds`. Three unsuccessful attempts move the entry to `review`. Inspect via `status`. Leave ambiguous writes in `sending` until verified. A newly proposed diff invalidates the prior unsent approval.

Scan each new authorized snapshot from its beginning. The journal skips completed revisions and holds uncertain operations across scheduler restarts. Store scan pagination separately if the source provides an incremental feed. Obtain scheduling and credential consent in the host before activating a recurring job.
