# Profile and delivery

`get_meetly_usage_guide` returns the account
profile, revision and read/write capabilities. No preference access is different
from an empty profile and does not block meeting retrieval. A null revision or
`native_migration_required` means saved personalization is unavailable; continue
with in-chat preferences instead of telling an already-approved user to enable AI
access again. Never request keys in chat or claim that repeating phone approval
repairs preference encryption. Current iCloud approval uses Apple authentication
and native approval, not a pasted connection key. Older meeting-only grants are
not silently widened; reconnect for missing preference scopes only when needed
for a user-requested save.
Do not loop on denied saves or repeat pairing after a successful reconnect.
Reload capabilities; if access is still missing, report the unresolved access
problem and continue authorized on-demand analysis with in-chat preferences.
The guide is read-only and does not grant new scopes. If a requested operation
needs missing access, follow the returned connection flow; do not send a dummy
write or invent guide parameters. After authorization, reload the actual revision;
never guess revision 0.

Save a minimal, user-confirmed profile: relevant work context, writing preferences,
preferred name, language, detail, interests, research, format and delivery wishes.
Store these as flexible notes in the supported profile fields, not invented API fields.
Host memory is only an
optional input. Do not copy a memory archive, raw transcripts, credentials, health
or other unrelated sensitive details, or third-party personal profiles. The user
can correct, replace or clear their profile. A clear replaces it with `{}`.

`update_user_preferences` replaces the profile, not a patch. Preserve unchanged
approved fields; show proposed imported/inferred notes and confirm intent. A clear
request such as “remember that I prefer Hindi briefs” already confirms that change;
do not ask for redundant approval. A one-off “shorter today” stays in this chat.
Send the latest
`expected_revision` and a unique `request_id`. Retry an uncertain identical write
with the same ID and payload. On conflict, reload and reconcile with the user;
never overwrite a newer profile silently. Claim a save only after success.

Offer end-of-day daily delivery; collect local time and an unambiguous timezone.
Inspect the current host's schedules and update the intended one rather than create
a duplicate. Use the host's actual scheduler only if it supports authenticated
Meetly execution. A reminder is not an automatic briefing. Keep notification
preferences separate from report content, and describe new-thread/email behavior
only when the host confirms it. Keep follow-ups in the current host; do not create an
external scheduler workaround.

Scheduled instructions load the current account profile and `meetly-briefing`,
cover the pending interval, and use its delivery/coverage reference. Host schedule
configuration controls cadence; the stored schedule field is a preference, not
proof of execution. Report save and schedule outcomes separately. A profile change
does not itself reschedule anything. Follow-up reminders require a clear request
and a confirmed host operation, not just a line in a meeting transcript.

Ask broadly whether they want anything else; adapt to the tools actually available.
Chat is the default. Create a requested PDF, HTML or other supported format with
host tools and return real files/links; disclose unavailable formats without
withholding the chat answer. Email requires the user's explicit opt-in and a
confirmed address for themselves. A standing recurring-delivery authorization can
cover future briefs to that address; check the actual host authorization and tool
policies rather than treating a saved note or connected email app as permission.
Do not ask again for an unchanged authorized action unless the host requires it.
If sending, file creation or scheduling fails, report the real result, keep the
useful draft, and offer a workable next step. Never claim that saving preferences
created a schedule, generated a PDF or sent an email.
