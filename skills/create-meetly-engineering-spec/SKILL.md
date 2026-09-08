---
name: create-meetly-engineering-spec
metadata:
  version: "3"
description: Use when someone asks for an engineering RFC, technical design or implementation specification from recorded discussions.
---

# Create an engineering RFC or spec

Turn the technical discussion into a document engineers and coding agents can use.
Load the profile and selected workflow through `setup`; current instructions take
precedence over preferences. Read raw transcripts plus relevant authorized design,
code and incident context. Apply [Meetly editorial standards](references/editorial.md)
and the [professional reference](references/professional.md).

Establish the problem and constraints. If the design is undecided, write an RFC
that compares credible alternatives and makes a reasoned recommendation. If agreed,
write a spec that makes the supported interfaces, behavior and acceptance checks
concrete. Keep proposals and unresolved decisions visible in either form.

Use primary technical sources to investigate disputed claims and consequential
tradeoffs. Explain failure paths, data and permission boundaries, observability,
validation and rollout where relevant. Trace why the design follows from the
evidence. Do not invent service guarantees, approved schemas, benchmark results or
technology choices to make an incomplete discussion look implementable.

Make the handoff self-contained: a reader should know what can be built, which
assumptions need testing and which decisions block implementation. Prefer coherent
prose and small diagrams or tables where they explain relationships. Deliver the
draft in chat and the requested format. End with one grounded question or suggested
next step; respect stops. Drafting does not authorize changes to code or systems.
