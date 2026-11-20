---
name: meetly-graph-onboarding
description: Remember a person or follow through on a commitment using the Meetly connection selected by the user.
metadata:
  version: "2"
---

# Start with one person or one promise

Use the selected connector. Inspect its advertised tools and call `get_meetly_usage_guide` with `includeGraphStatus: true` when supported. Read the share status, expiry, permitted entity types and enrichment capability. A failed request, expired share, empty result and missing connector each need a different next step. If the app must publish a selection, give the returned device instructions. Identify synthetic records when using a development fixture.

Use the stated goal or offer two choices: remember a person or follow through on a commitment. Ask for a Space only if the user has not selected one and the choice affects the answer. Keep the first useful result a read.

**Remember a person.** Search for the person in the selected Space. Resolve same-name matches using a verified ID or an explicit user selection. Read the person's reviewed context and typed relationships using separate views of `get_entity`. Follow linked conversations and commitments only as needed. Return a short memory with separate sourced facts, promises, unresolved details and links to the evidence. Keep an unidentified speaker's original label. Replay uses the Meetly source link when provided.

**Follow through.** Search for the commitment, read its original fields and verify the promise against a source passage. Report speaker, owner, due date and evidence with unknown values left open. Offer a destination action only when requested. The task workflow can preview a tracker change.

**Start with an empty address book.** With permission for the named external source, read one selected contact, thread or business card and preview its fields with provenance. Use the enrichment workflow to compare it against shared people. Distinguish an empty selection from an empty native library. Preserve an unmatched row for import review. Never claim a saved new native person unless the selected connector advertises creation and a subsequent read returns the record. Imported contact details do not establish speaker identity.

For an external handoff, use the CRM or task workflow and preview the exact destination fields. Load recurring-workflow guidance only when the user asks to automate. Finish with the person's memory, the sourced commitment, the verified destination receipt or the specific unresolved decision.
