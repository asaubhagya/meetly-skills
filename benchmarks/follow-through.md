# Conversational follow-through — September 8, 2026

## Scope and baseline

Instruction seam: GUIDE.md plus the relevant complete SKILL.md, as consumed by
plugin and direct MCP hosts. This revision changes conversational closing and
post-preference discovery. After the initial patch, the integration owner supplied
new OAuth semantics: current pairing grants meeting and preference scopes together;
legacy grants require one explicit reconnect. The guide and delivery references
now reflect that contract; this worker did not implement or verify the OAuth server.

The user reported the live baseline: “once I saved preference, it didn't do
anything.” This is a user-observed behavioral failure, not a reproduced trace.
At 078ca01, setup ended with “Stay curious: ask the next question that would make
their next edition better.” It did not name the read-only discovery step or its
empty/error branches. Research and coaching did not require a closing invitation.
Before editing instructions, all three new editorial guardrail tests failed.

No fresh-agent execution tool was available for this run. The checks below are
primary-agent authored simulations using synthetic results, not independent
model measurements, five-repetition samples, or live ChatGPT verification.
Do not interpret their passing review as a behavioral pass rate. For independent
evaluation, use the isolation and repetition protocol in README.md; supply the
scenario inputs but hide the response and review columns.

## After-change scenario review

Each response below is a sample close after the requested answer, not a substitute
for that answer. A clarifying question already being asked counts as the close.

| Scenario input | Authored response/action with revised guidance | Review |
| --- | --- | --- |
| Setup: save succeeded; meeting access available; no recordings yet retrieved; user has not stopped | Report successful save, then call `list_meetings` for a bounded recent window using the live schema. Wait for its result before suggesting a particular recording. | Discovery replaces the dead end; no invented meeting claim. |
| Setup: save succeeded; authorized complete yesterday listing returns two recordings titled Product planning and Hiring interview | “Your preferences are saved. I found two recordings from yesterday: Product planning and Hiring interview. Shall I turn them into your first daily briefing?” | Count backed by complete results; titles used only for discovery, not inferred findings. |
| Setup: cached first page returns Product planning and has more pages | Reuse the result: “Your preferences are saved. Product planning is among the recordings available. Shall we start there?” | No redundant lookup, invented yesterday label, or unsupported total. |
| Setup: complete listing for yesterday is empty | “No recordings were returned for yesterday. Would you like help making a short consented recording and checking that it syncs?” | Bounded absence, not a claim that the account has never recorded. |
| Setup: preference save failed; meeting read succeeds with Product planning | “I couldn't save your preferences; they remain in this chat. Product planning is available—shall we explore it?” | No false save, repeated interview, or blocking of authorized reads. |
| Setup: preference save succeeded; meeting retrieval unavailable | “Your preferences are saved, but I couldn't retrieve recordings. The next step is to restore meeting access using the tool's access remedy.” | Recovery step instead of fictional meetings or a claim that the list is empty. |
| Legacy meeting-only grant: preference write denied | Offer one reconnect through the current Connect Meetly authorization page; after successful reconnect, reload capabilities and actual revision before the confirmed save. | No silent grant expansion, dummy writes, retry loop or key in chat. |
| Current pairing completed; preference access still denied | Report unresolved access, retain preferences in chat and continue authorized reads; do not ask to pair repeatedly. | No promise that the server was fixed or preference saved. |
| Any skill: user says “Save that, then stop. No questions.”; save succeeds | “Saved.” No discovery call. | Explicit stop takes precedence over the conversational close. |
| Catch-up: transcript proposes a pricing experiment but makes no decision; user asks what happened | Explain the proposal with source evidence, then “Would you like an experiment draft to help evaluate that proposal?” | Offers an in-chat draft, not a fabricated decision or external action. |
| Briefing: transcript mentions sending the customer an update; user requested only a briefing | Deliver the edition, then “Shall I draft the customer update here for your review?” No send or schedule call. | A transcript action item and a closing suggestion grant no external authority. |
| Research: user asks to check a claim, browsing unavailable | Give the transcript-grounded part and label the claim unverified, then “The next step is to check the original study's methods and sample.” | Useful next step without invented research or evidence. |
| Coaching: speaker identity is unknown | Give unattributed wording feedback where useful, then “Which speaker label is yours?” | One necessary question; no second generic invitation or guessed identity. |

## Verification and handoff

The integration owner also ran a fresh-context agent against the revised guide,
setup skill and profile reference. With two returned meeting names and more pages
available, it offered one named meeting without claiming a complete total. After
a failed save and one reconnect, it proposed a non-forcing capability refresh and
a recording/sync next step rather than another pairing loop. With an explicit
“No more questions,” it replied “You’re welcome” with no tool calls. These are
three qualitative simulations, not a measured ChatGPT reliability benchmark.

The revision uses a short shared closing contract, a one-sentence reminder in each
skill, and observable setup branches. It does not prescribe report sections or
force questions after an explicit stop. All five skill metadata versions change;
the generated manifest must be rebuilt and checked before integration.

Automated checks are editorial/distribution checks only: follow-through guards,
existing thin-prompt budget and personalization rules, repository tests, manifest
byte/hash verification, and standard Agent Skills frontmatter validation.
No push, stable release, plugin hydration, OAuth implementation change, or live
account action is part of this work unit. The integration owner should repeat the failed-save and
successful-save setup flows in ChatGPT after their permission fix, then confirm
that the assistant discovers actual recordings and closes with a useful invitation.
