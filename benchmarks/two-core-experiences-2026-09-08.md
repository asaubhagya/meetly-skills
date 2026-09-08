# Two core experiences: decision and behavioral audit

## Decision

Ship Conversation Summary (`meetly-catch-up`) and Daily Executive Brief
(`meetly-briefing`). Setup is shared GUIDE onboarding, not a third skill. Research,
drafts and supported speaker observations remain adaptable parts of those outputs.
This replaces five entrypoints and removes narrow meeting templates. The two
prompts stay below 310 words each; operational references load progressively.

The user's current request overrides account preferences, then Meetly defaults.
Deep coverage is recommended: the daily edition has a dense executive opening
followed by substantial conversation coverage, useful connections and selective
research. Full transcripts are separate unless requested as an appendix. The
model chooses the useful structure instead of completing a fixed form.

Setup borrows Wayfinder/GrillMe's clear destination, recommendations and short
interview, without adding an installation dependency or full planning workflow.
It starts with relevant actually available host context for review, skips known
answers, accepts defaults, and uses at most five short questions total.

Chat is default. Other formats and opt-in delivery adapt to real host tools.
Email requires opt-in and a confirmed self-recipient; standing authorization may
cover unchanged future sends under host policies. Saving delivery wishes does not
create a schedule, attachment or email. No complete memory import or invented
native deep links. Lasting feedback can be saved; one-off directions do not persist.

## Evidence and method

The catalog assertion was run before implementation: it failed against five
entries, then passed with exactly two. Plugin starter assertions similarly failed
on old copy, then passed after the metadata was aligned. These are deterministic
contract checks, not proof of model quality.

Fresh isolated agents read the actual instruction files and simulated synthetic
scenarios. They did not call a live Meetly account, schedule anything, send email,
or run inside ChatGPT. The primary agent read the actual responses. This is a
qualitative single-run check per scenario, not a statistically repeated evaluation.

### Before: onboarding baseline

Synthetic host context: Riya, product lead, English/Hindi, direct dense writing,
plus unrelated family health notes. No account profile; PDF available, scheduling
and email unavailable. User accepts recommendations.

The prior guidance produced mostly sound boundaries and omitted unrelated context,
but opened with the report description before the profile handover and suggested
chat plus PDF merely because PDF was available. It still avoided claiming a real
schedule. These limited observations motivated profile-first, chat-default wording;
we do not label the baseline wholly broken.

### After: quick onboarding and empty recordings

Same scenario. The revised response began: “Riya, here is the relevant context I
can already see: you're a product lead, you use English and Hindi, and you prefer
direct, dense writing.” It disclosed no saved profile and omitted unrelated notes.
It recommended Deep, direct writing, English with Hindi/bilingual on request,
chat by default and PDF only on request. It identified product focus as proposed.
It explicitly said scheduling/email were unavailable and requested one approval,
not five compulsory questions. After simulated successful save and zero recent
recordings, it reported on-demand use, no schedule and a consented first recording
and sync as the next step. It invited later preference feedback.

### After: current request overrides saved delivery and language

User requested today's executive brief in Hindi and no email. Saved preferences
were English, Deep, chat/PDF and standing email opt-in. Browsing and file tools
were unavailable. Only two synthetic transcript excerpts were provided; an old
summary falsely said a Friday release was approved.

The actual Hindi response honored the current request, sent nothing and claimed
no PDF. It disclosed excerpt-only coverage and no external verification. It quoted
“Perhaps ship Friday if tests pass.” and “We have not committed a date. I will run
tests tomorrow.” to distinguish a proposal from commitment. It preserved the
unknown speaker for “Export matters more than dashboards.” It did not infer the
frequency of “I lose an hour reconciling invoices.” Its cross-conversation product
interpretation was labeled editorial judgment, and it ended with concrete next
steps to confirm test results and clarify the buyer's workflow.

## Limits and release gates

These short synthetic scenarios do not establish full-day report quality, live
ChatGPT scheduled MCP access, real email delivery, or native deep-link behavior.
Validate real host capabilities per user setup. No unsupported destination deep
links were found in the inspected native app, so retain verified manual paths.

Publish the backward-compatible MCP before the two-skill stable release. Keep old
selection keys as non-catalog aliases; old setup selects GUIDE, research/coaching
select Conversation Summary. The stable website and ZIP must pin one SHA, and
plugin hydration must verify exact bytes. OpenAI submission remains separate.
