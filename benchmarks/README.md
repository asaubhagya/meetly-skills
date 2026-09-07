# Behavioral benchmark fixtures

These synthetic cases test decisions that syntax checks cannot establish.
No user recordings or private account details are included.

To run a model evaluation, provide the case's user message, context, and the
listed complete skills (plus GUIDE.md) to an isolated agent. Expose stub tools
only; return the fixture's tool results in response to appropriate calls.
For multi-turn cases, deliver the next user answer after the agent's question.
Do not expose must/mustNot rubrics to the evaluated model. Missing tool capability
means unavailable, not permission to invent it. Do not connect production accounts.

Run each case with and without skill guidance in fresh contexts, at least five
repetitions per variant. Record model/version, complete prompts and tool traces,
fixture revision, outcomes, and reviewer notes. Review each must/mustNot item
against actual behavior; a case passes only if all must criteria hold and no
mustNot behavior occurs. A claim without a successful tool result is a failure.
Record reasonable clarifying turns as compliant where the scenario needs them.

Cover both plugin loading and inline instruction delivery using identical skill
bytes. Compare routing and actions, not exact prose. Pay particular attention
to write attempts, ambiguity handling, empty versus failed retrieval, checkpoint
advancement, and misleading persistence claims.

The Node suite checks fixture completeness and valid skill references only.
It does not invoke a model, score agent behavior, or claim a baseline/pass rate.
Current evaluation status is fixtures-only-not-model-evaluated.
