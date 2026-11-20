---
name: meetly-recurring-workflow
description: Set up or resume an opt-in scheduled Meetly lead or commitment workflow with scoped approval, durable checkpoints and retries.
metadata:
  version: "1"
---

# Run a recurring Meetly workflow

Discover the connected source and destination. Record the grant, Space, entity kinds, workflow owner, destination account and user-selected cadence in the orchestrator. Verify that its credential store, durable state and scheduling service are available. A host chat can perform a manual run. Only report an active schedule after inspecting the scheduler's job ID and next run time.

Dry-run one bounded page of changed records. For each eligible commitment or lead, resolve destination fields, duplicates, permitted evidence and expected source revision. Present the proposed field list, maximum batch size, destinations and approval policy. New destinations, sensitive exports and changes outside that policy require fresh approval. Keep ordinary runs read-only until approval is recorded. Never commit the consumption watermark during a dry run.

Prefer a server-provided incremental cursor with its documented lifetime. A page cursor scoped to an immutable snapshot cannot resume a change feed. If only snapshots exist, enumerate each authorized snapshot and compare stable IDs and revisions against durable state. Never infer a deletion from absence in a scoped export.

Serialize overlapping runs by workflow and scope. Persist each planned operation before writing, keyed by grant, Space, source kind/ID/revision, destination tenant and action. Record the destination receipt before requesting write-back. Advance the page watermark only after every row has a durable receipt, skip decision or durable retry entry. Reconcile ambiguous external creates by unique key. If identity remains ambiguous, hold for review. Suppress echoes by external mapping and last-applied version. Retry transient failures with bounded backoff honoring retry hints, route exhausted records to a review queue, and halt on consent revocation. Log IDs, outcomes, counts and cursor transitions without exporting transcript bodies. On cancellation disable the schedule and release its credential according to the orchestrator's lifecycle.
