# Meetly skill-format audit — 2026-09-08

Scope: all five canonical SKILL.md entrypoints, their agents/openai.yaml files and references, the live v2.0.1 Markdown endpoints and ZIP, and the locally hydrated plugin bundle. Standard: https://agentskills.io/specification and Codex skill-creator validator.

## Findings

All five skills contain YAML frontmatter. Live raw Markdown, stable ZIP entries and plugin skill bytes match for every skill. The HTML renderer hides frontmatter, explaining its apparent absence. All five nevertheless failed standard validation because version was an unsupported top-level field; the project validator incorrectly required that field.

## Correction

Moved version to metadata.version as a quoted string in all five revised sources. Names match directories; descriptions are nonempty discovery triggers; bodies remain short outcome-oriented prompts, not rigid templates. All five agents/openai.yaml files have quoted UI strings, matching skill invocation prompts and valid Meetly MCP dependency metadata. Existing explicit-only research policy preserved. Reference documents and GUIDE.md are supporting documents, not standalone skill entrypoints, and do not require skill frontmatter.

Updated catalog validation and malformed-input tests while preserving the numeric manifest version contract. Plugin consumer accepts both historical immutable releases and the corrected shape so stable promotion can proceed; new source rejects legacy top-level version. Website correction in progress exposes escaped frontmatter on skill detail pages without modifying downloadable source bytes.

## Verification

Before: standard quick_validate rejected 5/5 for unexpected version. After: 5/5 standard validations pass; 19 source tests pass; manifest drift check and git diff check pass. Plugin: 13 tests and existing bundle validation pass. These are format/distribution checks, not claims of model behavioral performance or live deployment of the revised skills.

## Release status and handoff

New source edits are not yet published. Live latest remains v2.0.1 and contains the legacy version shape. Do not independently edit hydrated plugin skill copies: publish the reviewed canonical release and hydrate exact website bytes. MCP preference deployment is separately blocked on an independently found wrong-key concurrency race (worker correcting with an interleaving test). OpenAI submission remains behind the owner's final audit. Broader task remains issue #112; do not mark it complete on this format audit alone.

