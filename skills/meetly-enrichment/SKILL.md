---
name: meetly-enrichment
description: Review sourced facts and external references for a Meetly entity and submit an authorized revision-aware enrichment.
metadata:
  version: "2"
---

# Enrich a Meetly record

Resolve the entity by stable ID within the user's chosen Space and grant. Read its current revision and original context, including any existing evidence or mapping for the proposed fact. Check discovery for permitted write operations and entity kinds. Keep a local preview when the connector grants read-only access.

For each fact or mapping, show the old and proposed value, source ID or URL, evidence date, author or connector, confidence where available, and whether it is externally verified, user-confirmed or inferred. Preserve disagreements as sourced alternatives. Never use a generated summary as the original source. Restrict outbound information to explicitly approved fields. Get approval for the exact additions or corrections.

Submit through the advertised schema with expected revision and a stable retry key scoped to the source entity, destination account and operation. Use the same key and payload after timeout. On conflict, fetch the current record and show the revised diff before applying. Retain the returned receipt and observe its status. A staged request is complete only when the native owner applies it and the updated revision can be read back. Report declined, expired and pending requests separately.


For contact onboarding, ask which external account and rows to use. Read the smallest selected set. Search shared people in the chosen Space and compare verified identifiers. Keep same-name collisions, missing source references and contradictory fields in the preview. Turn each accepted field into an attributed note only if a supported evidence URI exists. An inaccessible local photo or address-book row supplies no shareable URL by itself. Do not upload it to manufacture one. For unmatched people show a separate import list with the proposed name, identifiers and source. If the installed connector only stages notes on existing entities, retain that list in the preview for native import support. Treat optional tags such as “warm lead” as scoped labels with their source, date and uncertainty. Avoid inferring a voice match or sales stage from imported contact data.
