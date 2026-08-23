---
name: create-meetly-product-docs
description: Use when turning an authorized Meetly brainstorm, product review, customer interview, or engineering discussion into an evidence-grounded PRD, product brief, or engineering specification.
---

# Create Meetly Product Documents

Convert raw conversation into an implementation-ready document while keeping
decisions, uncertainty, and evidence distinct.

## Workflow

1. Use `search` then `fetch` to retrieve the relevant authorized meetings. Use
   `list_action_items` when commitments or ownership are part of the request.
2. Extract the problem, users, desired outcomes, constraints, decisions,
   rejected options, risks, owners, and unresolved questions. Preserve who said
   what; never turn a proposal into an approved decision.
3. For a product document, write context, problem, users, goals, non-goals,
   requirements, success measures, risks, and open questions.
4. For an engineering specification, write system context, behavioral
   requirements, data and interface changes, edge cases, security/privacy,
   rollout, observability, testing, and unresolved decisions.
5. Attach concise Meetly evidence to each material requirement. Mark host
   inference explicitly.
6. Call `prepare_prd` or `prepare_engineering_spec`, then pass the returned
   object unchanged to its matching `render_*` tool.

## Quality bar

- Write for the team that must make a decision or build the result, not as a
  chronological meeting summary.
- Requirements must be testable. Do not invent dates, owners, approvals, or
  technical constraints.
- Surface contradictions and missing decisions instead of silently resolving
  them.
- Keep private meeting text to the minimum evidence necessary for the task.
