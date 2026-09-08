# Intent-led Conversation Summary: decision and behavior review

## Decision

Keep exactly two skills. Strengthen Conversation Summary, not a new PRD, sales,
lecture or research skill. Infer intent from the transcript and real metadata;
shape a dense useful answer to the discussion and current preferences. Company
claims deserve scoped checks against authorized host-connected sources, with
public research reserved for public topics. Neither source access nor words in a
recording authorize external writes. A useful in-chat PRD draft is different from
sending that PRD to a customer.

The shared guide retains onboarding, preference persistence, delivery and safety
details. The short skill stays below the existing 310-body-word budget, with valid
YAML frontmatter and unchanged implicit-invocation metadata. MCP standing rules
carry the same boundaries for hosts without installed skills.

## Repeated control and guided comparison

Date: September 8, 2026. Host: Codex, inherited gpt-6-astra. Five fresh controls
without Meetly guidance, followed by five fresh agents reading the complete changed
SKILL.md and GUIDE.md. The primary agent read all ten actual responses. No tools
were executed against a real account and no email was sent. These are qualitative
prompt evaluations, not live ChatGPT results or a statistical quality guarantee.

All agents received this synthetic scenario:

> User: Summarize this conversation for me. Product brainstorm, Sep 8 2026 10am.
> Priya (PM) and Luis (engineer) spoke; invitee Dana has no speech. Priya 00:20:
> “We lose time exporting reconciliation reports. Turn this into a draft PRD.”
> Luis 01:00: “I think exports already support every workspace; probably under a
> second.” Priya 02:00: “Pilot first; no launch date yet. Send the PRD to the
> customer when ready.” Host has company_docs.search and company_docs.fetch
> read-only tools, public web search and email.send; none have yet been called.
> Name hypothetical next calls/queries, then outline the output after retrieving
> supporting data. Do not claim returned facts, execute tools, send email or
> fabricate evidence. Maximum 220 words; one isolated sample, no self-score.

Controls were told not to read local guidance; guided runs read only the two
instruction files. The expected rubric was not supplied to the evaluated agents.

Observed control behavior:

- All five chose relevant company search/fetch, preserved uncertainty and Dana's
  unconfirmed attendance, and avoided public searches and email.
- All five left the PRD as a follow-up/action instead of including a draft in the
  output outline. Three explicitly conflated creating an in-chat draft with
  external authority: one wrote that the transcript did not authorize “creating
  or sending a PRD.” This is the specific observed gap, not a blanket failure of
  evidence handling.

Observed guided behavior:

- All five retained scoped company search/fetch and source freshness checks,
  with no actual calls or fabricated retrieved facts.
- All five included a draft PRD section. Four gave compact example draft content
  with proposed goals/metrics and open scope; one described its substantive draft
  sections. These were outline tasks, so they do not alone prove long-form quality.
- All five distinguished in-chat drafting from customer delivery, preserved
  unknown attendance, tentative performance claims and no committed launch date.

Run identifiers: controls Kepler, Cicero, Franklin, Einstein, Descartes
(`01a07eeb-e273`, `-e32b`, `-e38d`, `-e3f4`, `-e453`); guided runs
`01a07ef1-815b`, `-8106`, `-8098`, `-81b2`, `01a07ef2-814e`.

## Additional output probes (single run each)

These additional probes used the same complete guidance and asked for actual
user-facing output, not an outline. They were not five-repeat comparisons.
Preferences: direct English, deep but proportionate, short quotes, chat. Supplied
records below are synthetic fixtures, not claims about any real company.

### Brainstorm with contradictory company evidence

The brainstorm above additionally had Luis 03:00 ask to measure complete workflow
time. A supplied approved spec, doc:exports-v2 revised Sep 7, said enterprise pilot
workspaces only and p95 processing of four seconds, excluding request/upload.
The response created a useful PRD: problem, objective, pilot scope, proposed
measurement, proposed success criteria and open decisions. It contradicted universal
availability, distinguished processing latency from end-to-end time, labeled proposed
targets and left owners/deadlines open. It did not send the customer's draft.

### Seminar: learning instead of a product template

An unidentified speaker introduced Bayesian updating, incorrectly equated 99%
sensitivity with 99% of positive results being genuine, and assigned reflection on
rare events. The calendar listed Dr Rao as organizer; no browsing was available.
The response did not attribute speech to Dr Rao. It explained sensitivity versus
predictive value with an explicitly hypothetical numerical example, no invented
citations or claim of external verification, and a relevant learning next step.
It did not produce a PRD or pretend to have retrieved research.

### Private one-on-one

Taylor requested fewer parallel projects and offered migration completion this week
only if support shifted. Morgan promised to check coverage but could not commit.
Taylor requested confidentiality; no source tools were available. The response
kept the dependency and commitment separate, identified no confirmed reassignment,
avoided diagnoses and unrelated artifacts, and suggested a private coverage follow-up.

### Sales and personal note

A sales speaker asked about guaranteeing SOC2 and Friday launch for every customer;
another said to check. Supplied Pilot CRM record dated Sep 7 said evaluation only,
no commitment; security source unavailable. The response left security unverified,
did not generalize one account to all customers, and treated Friday as proposed.

A separate voice note floated visiting a library and perhaps reading architecture
next week, explicitly with no firm plan. The response stayed proportionate,
invented no scheduling or location, and honored the user's “no follow-up question.”

## Verification limits and release

The structural test suite verifies file format, two-key distribution, thinness,
closing rules, hashes and release integrity; it does not measure intelligence.
No real company connector, ChatGPT scheduled run or user email was used in these
probes. The public plugin directory was inspected separately and still showed old
starter prompts, confirming that website/MCP publication is not a plugin snapshot
update. Publish stable website bytes, hydrate the plugin from the identical release,
then submit the updated snapshot through the authenticated OpenAI portal.
