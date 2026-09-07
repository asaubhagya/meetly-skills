# Profile and delivery

`setup` returns the account profile, revision and read/write capabilities.
No access is different from an empty profile. Use the live schema and the stated
reconnection remedy; existing meeting-only connections may need consent to the
preference scopes. On-demand analysis can continue with in-chat preferences.

Save a minimal, user-confirmed profile: relevant work context, writing preferences,
detail, interests, research, format and delivery wishes. Host memory is only an
optional input. Do not copy a memory archive, raw transcripts, credentials, health
or other unrelated sensitive details, or third-party personal profiles. The user
can correct, replace or clear their profile. A clear replaces it with `{}`.

`update_user_preferences` replaces the profile, not a patch. Preserve unchanged
approved fields; show the proposed changes and confirm intent. Send the latest
`expected_revision` and a unique `request_id`. Retry an uncertain identical write
with the same ID and payload. On conflict, reload and reconcile with the user;
never overwrite a newer profile silently. Claim a save only after success.

Offer end-of-day daily delivery; collect local time and an unambiguous timezone.
Inspect existing ChatGPT schedules and update the intended one rather than create
a duplicate. Use the host's actual scheduler only if it supports authenticated
Meetly execution. A reminder is not an automatic briefing. Keep notification
preferences separate from report content, and describe new-thread/email behavior
only when the host confirms it. Keep follow-ups in ChatGPT; do not create an
external scheduler workaround.

Scheduled instructions load the current account profile and `meetly-briefing`,
cover the pending interval, and use its delivery/coverage reference. Host schedule
configuration controls cadence; the stored schedule field is a preference, not
proof of execution. Report save and schedule outcomes separately. A profile change
does not itself reschedule anything. Follow-up reminders require a clear request
and a confirmed host operation, not just a line in a meeting transcript.
