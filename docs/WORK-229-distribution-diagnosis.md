# WORK-229 Meetly distribution diagnosis — 2026-09-21

## Verified layers

- Installed curated cache: app-6a8ac73629e0819183058d1c50b4be06/2.0.0. Catch-up starts list/search/fetch, only bounded transcript passage, never requests live guide. This can explain observed no-guide tool traces; prompt alone does not prove all behavior.
- Canonical skills origin/main and latest stable v3.2.6: 5bf674dfcd6dfed55d8e6bf322aaab7ef0d69535. Public channels.json returned this exact SHA for latest and beta. Catch-up metadata version12 uses setup first and guide only as fallback.
- Canonical plugin local main: 8ff6218, version2.3.7, catch-up version6. This local checkout is stale; left untouched.
- Fetched plugin origin/main: c664d5f, merging3985f1b on September17. Version3.0.0 intentionally removes all bundled skills, static guide and hydration command. Current live guidance must come from MCP. This is source/package state, not evidence of OpenAI publication. GitHub release list and Actions run list returned no entries for plugin repo.

## Minimal prepared correction

Canonical catch-up now version13 and explicitly calls get_meetly_usage_guide first, reusing it within the conversation. Exposed setup is fallback only; missing guidance is reported. Manifest rebuilt. No cached or canonical checkout files edited. Skills build, validation,24 tests and manifest check passed. Prompt remains309 words under310 budget.

This change improves standalone skills consumers, but does not replace installed curated2.0.0. Current plugin3.0.0 has no skill to patch and should not silently regain one.

## Release pipeline incompatibility

Skills .github/workflows/checks.yml still runs stable-tag promote-plugin. scripts/promote-plugin.mjs reads meetly/skills.lock.json then npm run hydrate. Both are absent from plugin3.0.0. A new stable tag would therefore fail promotion after website notification even if website publication succeeds. Last skills runs succeeded before this architecture divergence. The prepared compatibility fix now recognizes MCP-only manifests, rejects leftover guidance, runs tests/checks, and exits without hydration or writes; the legacy bundle path is preserved. Do not tag until this fix is integrated and the stable release is reviewed. Beta main notification and immutable website release resolution remain separate from marketplace updates.

## Reproducible package evidence

Separate WORK-229-plugin-validation worktree at plugin origin/main: npm ci --ignore-scripts, npm test (5 passed), npm run validate, npm run pack all passed. Generated build/meetly-openai-plugin-v3.0.0.zip contains only the five allowlisted runtime files and maps the canonical existing app. Tests prove deterministic package structure, not host adoption. Reviewer submission data still describes seven tools and needs review against the newly expanded live catalog before an actual update submission.

## Delivery mechanism and boundary

Repository scripts generate an upload ZIP; they never submit, approve or replace an OpenAI listing. An authorized owner/editor must update the existing canonical app/plugin through its supported publishing/review surface and verify the installed version afterward. Portal state was not inspected in this bounded task; no new listing or submission attempted. Do not infer that reconnecting or restarting updates a published package.

Local Codex supports marketplace add/install commands, but installed curated cache is not a local development source. The supported local-development cachebuster/reinstall flow only applies when a configured local marketplace already references the source. No such Meetly source was confirmed; directory search returned no Meetly result. Do not edit cache files or rebind the canonical app to a new local listing as an alleged marketplace fix. The generated3.0.0 archive is ready for an explicitly selected local test/import route; it has not been installed. A new thread is needed after a real plugin update to test newly loaded instructions/tools.

## Recommended next action

Use the live MCP guide explicitly for present diagnostics. Review the existing3.0.0 canonical package and eight-tool reviewer metadata, integrate the tested promotion compatibility fix, then update the existing published plugin through the authorized owner release route. Retest a fresh host session and check actual guide invocation, transcript revision coverage and speaker provenance in server traces.

## Compatibility verification

25 tests passed including real isolated Git/npm promotion with no lock, hydration command or remote; HEAD/version remain unchanged. Stale bundled guidance and failing npm checks reject promotion. Validation and manifest checks passed. No stable tag, website release or marketplace submission performed.
