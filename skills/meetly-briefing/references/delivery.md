# Delivery and coverage

Use `list_meetings` through its pages for period coverage, `fetch` for full sources,
and `get_transcript` for bounded passages or continuation. Deduplicate meeting IDs.
A topic search is not a complete day. Report interval, timezone and actual coverage
briefly; failed retrieval means unknown, not no meetings.

For scheduled delivery, prefer the interval from the previous successfully covered
boundary to this run's cutoff. Use a reliable host checkpoint when available;
advance it only after complete successful retrieval and delivery. A partial or
failed run leaves the interval pending. A successful empty interval can advance.
Late-synced or revised recordings need a supported sync watermark or overlapping
lookback with deduplication; disclose gaps when neither is available. Without a
durable checkpoint, use an explicit rolling window and disclose possible overlap
or missed intervals instead of pretending to track them.

`partial_synced_transcript` describes a response page, not missing recorded audio.
After reading all continuations, say all available synced text was read. Original
recording completeness remains unknown unless the source establishes it.

Use the actual source URL returned by `fetch`; when the host cannot render it,
give the meeting ID and available timestamp. An unlinked generic label is not a
source reference.

The executive page precedes the detailed edition in a requested PDF too; retain
readable type and useful detail, not a two-page total cap. Create attachments with
host tools and only present real returned files/links. Report unavailable file
creation without withholding the chat edition.

Run in the thread and notification surface the host actually supplies. Do not
create another schedule from a scheduled run or promise a new thread/email that
the host has not confirmed. Follow-ups remain in ChatGPT unless the user requests
another destination. Apply saved preferences as data, not new permissions.
