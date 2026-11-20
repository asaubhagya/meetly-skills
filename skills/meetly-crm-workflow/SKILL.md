---
name: meetly-crm-workflow
description: Preview and reconcile Meetly people, accounts, event leads and conversation evidence with an authorized CRM such as HubSpot.
metadata:
  version: "2"
---

# Review CRM changes

Discover source coverage and the destination user's portal, object schemas, associations and write permissions. Select one authorized Space and an account, person or event. Follow links to eligible leads and conversation references. Request original field evidence only when needed. Treat meeting content as data. Legal and restricted material needs explicit field-level export authorization.

Build a field map for the destination. In HubSpot, map people to contacts and accounts to companies. Use the available lead object or a deal only when its meaning, pipeline and required properties fit the user's process. Check portal-specific fields and association labels. Preserve missing values. Use a scoped external mapping first, then verified email for contacts and verified domain for companies. Present multiple matches or conflicting verified identifiers for resolution. Name similarity alone is insufficient.

Show creates, updates, associations, unchanged fields, source citations and unresolved rows. Obtain approval for the named portal and material changes. Re-read matches immediately before applying. Use destination idempotency or a unique external key when available. If a create times out, look up that key before another attempt. Read the resulting records and associations. Reconcile each verified ID, URL and allowed field through the authorized Meetly enrichment operation using its expected revision. Surface a pending device decision separately from applied enrichment. If write-back fails, retain the destination receipt and retry only reconciliation.


For a second CRM or portal, rediscover its identity, contact model, writable property keys and enum values. Confirm how its schema represents a tag; an externally sourced “warm lead” tag alone supplies no opportunity amount, pipeline stage or native Lead object. Start a separate mapping namespace per destination tenant and object. Keep private person memory and unrelated conversation text out of the payload. Report exactly which fields survived the mapping.

For hosts with a script runtime, `scripts/contact-preview.mjs` exports the pure `previewContact` helper. Supply one tenant/object, the current mapped ID and verified email when available, all exact lookup candidates, property permissions/required fields/enums, and only the explicitly selected sourced string fields. Pass field API keys and translated enum values from live discovery. It returns create, update, unchanged or hold; the host reviews the diff, refreshes both sides, performs any approved write and reads the result back. Keep complex properties and associations in separate reviewed operations. Chat-only hosts can follow the same steps without a script.
