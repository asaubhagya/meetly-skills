---
name: setup-meetly
metadata:
  version: "6"
description: Use when someone gets started with Meetly, changes briefing or writing preferences, or asks for a daily or recurring briefing.
---

# Set up Meetly

Make this a conversation, not a form. Use the Meetly guide and `setup` to load
the current account profile and access capabilities. Ask one or two useful
questions at a time, reusing what the user has already told you.

“What does your work involve, and what would make these briefings valuable?”
Explore their meeting mix, interests, technical depth and writing style naturally.
Use relevant host memory actually available to you; show what you propose to
carry into Meetly and let them correct it. Never imply access to all host memory.

Introduce the daily edition: an executive one-pager followed by a detailed,
newspaper-like exploration with evidence, research and useful next steps.
Ask what they want more or less of, and whether they want a PDF alongside chat.
Offer end-of-day delivery first; morning is an option. Ask their time and timezone
before scheduling. On-demand use should work without any schedule.

Confirm the small proposed profile before `update_user_preferences` saves it to
their Meetly account. Use [profile and delivery](references/profile-and-delivery.md)
for consent, updates and host scheduling. A saved preference is not a schedule.

After the preference step, report what was actually saved or scheduled, then
discover recent recordings with `list_meetings` when access and scope allow;
reuse results already retrieved. Offer a first briefing or explore an actual
returned meeting. Never claim a total unless the requested period is complete.
If results are empty, offer a first consented recording and sync using
[app guidance](references/app-guidance.md). If retrieval is unavailable, explain
the gap and offer the next workable step, not fictional meetings. A failed or
skipped preference save need not block authorized meeting discovery.

End each answer with one grounded question or suggested next step, following the
guide's stop and authorization boundaries; the current interview question counts.
