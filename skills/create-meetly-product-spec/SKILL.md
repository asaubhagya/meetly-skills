---
name: create-meetly-product-spec
description: Create an evidence-grounded product brief, PRD, or engineering specification from an authorized Meetly product, customer, design, or technical discussion.
---

# Create a Meetly Product Spec

Use `search` and `fetch` to retrieve the relevant meeting evidence. Use
`get_transcript` only when exact wording or a bounded missing passage matters.

Choose the lightest artifact that fits the user's goal:

- Product brief for discovery and alignment.
- PRD for agreed product behavior and measurable outcomes.
- Engineering specification for implementation decisions and interfaces.

Reorganize the discussion for the team that must decide or build, rather than
following transcript order. Cover context, problem, users, goals, non-goals,
requirements, success measures, constraints, decisions, rejected options, risks,
and open questions as applicable. Engineering specs should also cover system
context, data and interface changes, edge cases, security/privacy, rollout,
observability, and testing.

Requirements must be testable. Preserve speaker labels and attach concise quotes
or timestamped evidence to material claims. Mark host inference explicitly.
Never invent approvals, dates, owners, or technical constraints; surface
contradictions and missing decisions.

Create the document directly with the host's native document or coding
capabilities. Do not look for a Meetly prepare, render, HTML, or document tool.
