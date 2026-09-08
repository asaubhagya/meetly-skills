# Specialist workflow and document evaluation

## Decision

Keep Conversation Summary and Daily Executive Brief as the core experiences. Add
five explicit specialist references: PRD, engineering RFC/spec, customer interview
insights, sales analysis and legal client intake. There are no additional generation
tools: setup and the discoverable usage-guide tool supply instructions and sources;
the host generates the document. The user must test before final OpenAI submission.

Use one authored editorial and print-CSS source, mechanically copied into each
skill to preserve standalone downloads and plugin portability. The website remains
canonical; MCP verifies selected file bytes and returns complete references.

## Evaluation method and limits

`specialists.json` contains five synthetic timestamped conversations, simulated
company records, preferences, reviewed primary-source notes and case-specific
acceptance checks. There is no customer data. The two core evaluations reuse these
fixtures: a product conversation summary and a daily brief across four business
conversations. The legal matter is excluded from that daily scope.

The initial installed CLI could not run gpt-6-astra; the evaluator uses pinned
Codex CLI 0.153.4 through npx without upgrading the user's global installation.
The model is gpt-6-astra with high reasoning, subscription authentication, ephemeral
read-only execution, supplied input only and no external actions. Baseline runs use
the same fixture and output request without the new skill/guide. Guided runs add
the canonical guide, selected skill and editorial/professional references. Generated
Markdown remains in ignored `output/evaluation/`. The PDF renderer changes layout,
not the substantive findings, and appends source inputs for inspection.

One baseline was generated and read for each specialist. Guided examples were read
and revised through instruction changes where needed. This is a small qualitative
evaluation, not a statistically validated superiority claim or an end-to-end
ChatGPT/Claude test. Company tool responses and researched notes were supplied; the
evaluation models did not actually search connected company systems or browse.

## Findings that changed the instructions

- The baseline PRD incorrectly labeled conversation ID P1 as priority P1. Explicit
  evidence/metadata guidance corrected this in the guided document.
- Baseline and early guided documents included method citations that added little
  to the argument. The shared reference now places methodology in optional method
  notes; the legal reference explicitly omits unrelated product/research citations.
- Early guided documents narrated that no PDF had been generated. The harness now
  explains that export happens after generation, keeping runtime commentary out of
  the document. This is a test-harness correction, not a fictitious export claim.
- Some generated sections used bold paragraph leads as their only headings. The
  editorial reference requests real Markdown headings and selective inline bold.
- PDF inspection showed that the first daily executive opening exceeded one page.
  The skill now requires one readable page, moving detail into the articles. The
  sample request supplies a 350-400 word opening budget for this particular export.
- The owner requested low margins, bold emphasis and clickable inline references.
  The template uses 14 mm margins, 10.7 pt body type, restrained branding and inline
  source links to the transcript appendix plus external research URLs.
- The owner emphasized mobile readability. A separate narrow phone PDF uses
  12.5 pt body text and reflows tables into labeled blocks. The A4 edition retains
  one executive page; the mobile edition preserves readable type over page count.

## Evidence checks

PRD: no invented efficiency target or pilot date; source permissions and ownership
uncertainty retained. RFC: rejects exactly-once delivery from outbox alone, preserves
broker/retention questions and includes crash/retry tests. Customer discovery:
preserves one-person scope, leading-question limits and the difference between
prototype interest and purchase authority. Sales: surfaces CRM/date/certification
conflicts and labels the email unsent. Legal: attributes recollections, preserves
disputed payment amounts and unknown jurisdiction, and invents no filing deadline.

The daily brief connects meaning, access and delivery reliability across the four
supplied conversations; coverage is explicitly limited to those inputs. Source
transcripts, public research and proposed product decisions remain distinguishable.

## Reproduction

Run `node scripts/evaluate-specialists.mjs baseline <case-id>` or `guided <case-id>`.
Omit case IDs to run the five specialist cases and two core cases sequentially.
Render with the Python PDF runtime using `scripts/render-samples.py`; validate text,
link destinations and one-page executive layout with `scripts/check-sample-pdfs.py`.
Visually inspect rendered pages as well: text checks alone do not establish layout
quality. Final source publication and package checks are recorded on Context WORK-147.
