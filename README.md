# Meetly skills

Canonical agent instructions for Meetly in the public
`asaubhagya/meetly-skills` repository.
Start with [GUIDE.md](GUIDE.md). Two core experiences and five explicitly requested
specialist skills work unchanged in packaged plugins and MCP inline workflows.
Shared editorial and document CSS sources live in `shared/`; `npm run build` copies
them into every skill so individual downloads are self-contained. Edit the shared
source, not its generated per-skill copies. Bump all affected skill versions.

The specialist set is PRD, engineering RFC/spec, customer interview insights,
sales analysis and legal client intake. The MCP guide indexes all of them and
returns selected bodies and complete reference files. Templates inform quality;
they do not force identical document sections or an extra onboarding interview.

## Develop

Requires Node.js 22 or newer. No dependencies or install step.

```sh
npm run validate
npm test
npm run build
npm run check
```

Commit the generated manifest with every distributed content change. Increment
a skill's positive integer `metadata.version` string when its instructions or attachments change;
the initial versioned catalog starts at 1. Package/release semver is separate.

The built-in validator intentionally accepts a small YAML subset: SKILL.md has
plain single-line `name` and `description` fields and a `metadata` mapping
containing a quoted `version` string, followed by a
nonempty Markdown body. Skill names match their directories and contain lowercase
letters, digits, and single hyphens (at most 64 characters). UI metadata uses
JSON-quoted strings, one Meetly MCP dependency, and an explicit boolean invocation
policy. Unsupported or duplicate fields fail closed; extend the parser/tests
together when adding metadata. Research is explicitly invoked; meeting insights
can draft useful follow-on work within the request. Sending remains separate.
Symlinks, unsafe paths, and nonregular files are rejected.

## Manifest contract

`manifest.json` is deterministic UTF-8 JSON with a trailing newline:

```json
{
  "schema": "meetly-skills/1",
  "skills": [{
    "key": "meetly-catch-up",
    "version": 1,
    "description": "...",
    "files": [{
      "path": "SKILL.md",
      "src": "skills/meetly-catch-up/SKILL.md",
      "sha256": "<64 lowercase hex characters>",
      "bytes": 123
    }]
  }],
  "guide": { "src": "GUIDE.md", "sha256": "<64 lowercase hex characters>", "bytes": 123 }
}
```

The example is schematic; use the generated file for actual checksums and sizes.
Every skill file is included, including `agents/openai.yaml` and relative
attachments. Entries and paths sort by code point. Hashes cover exact file bytes;
sizes are UTF-8 byte counts, not character counts. No Git SHA, ref, build time, or
channel appears in the manifest. Consumers bind it to a revision externally and
verify every file, preserving relative paths and invocation policy.

## Checks and release handoff

CI runs tests, validation, and manifest drift checks for pushes and pull requests.
After successful checks, trusted pushes to `main` (beta) and stable semver tags
(latest) notify downstream using the first configured route:

1. `MEETLY_AGENTS_DEPLOY_HOOK`: preferred project-scoped Vercel deploy-hook URL.
   CI POSTs to it without a Vercel management token. The hook selects the website
   project/branch; its build must resolve checked Meetly skills channels, pin the
   chosen revision, and verify the manifest. A hook does not transmit the triggering
   skills SHA or select a skills release by itself.
2. `MEETLY_DISTRIBUTION_TOKEN`: optional fallback only when no hook is configured.
   Dispatches `meetly-skills-updated` to `asaubhagya/get-meetly-ai`, with repository,
   immutable SHA, ref, and channel in the payload outside the manifest.

The owner provisions these repository secrets; local scripts do not create them.
Neither configured means a successful skip with a clear CI notice. Pull requests
run checks only and explicitly report that notification is disabled. A configured
route's failure fails notification without trying the other route, avoiding
duplicate builds after an ambiguous response. Hook URLs, tokens, response bodies,
and raw network errors are never logged. Acceptance is not deployment success.

The downstream consumer must compare semantic versions before moving latest,
so replaying an older tag cannot roll it back, and must verify hashes. The website
owns channel resolution, deployment, and Meetly setup tool integration. This
workflow triggers its configured build but does not publish GitHub releases.

### Stable plugin file promotion

The downstream trigger job is `notify`. After `checks` and `notify` succeed,
`promote-plugin` runs only for stable `vMAJOR.MINOR.PATCH` tag pushes. It peels the
tag to a commit, then polls `https://agents.getmeetly.ai/channels.json` for up to
ten minutes until `latest.sha` equals that commit. A build-hook acknowledgment
alone is insufficient. Poll errors and response bodies are not printed.

The owner must provision `MEETLY_PLUGIN_DEPLOY_KEY`, an SSH write deploy key scoped
ONLY to private `asaubhagya/meetly-plugin`, in this skills repository. Missing key
fails stable promotion clearly; PRs and beta pushes never run it. The plugin's
initial `main` must exist before the first stable skills tag.

The job checks out plugin `main` into `plugin/`, runs
`npm run hydrate -- --channel latest`, then `npm test` and `npm run check`. It
verifies the resulting lock SHA matches the triggering commit, checks that latest
has not moved again, and commits only `meetly/skills/`, `meetly/GUIDE.md`,
`meetly/skills.lock.json`, and (when bumped) `meetly/.codex-plugin/plugin.json`.
The plugin patch version increments only when generated files changed and the
previous lock SHA was non-null and differs. Initial hydration from a null lock
keeps the version; unchanged files create no commit. A normal fast-forward push
updates plugin `main`; concurrent changes fail safely without forcing a push.
Promotion jobs are serialized. A failed or superseded release may need a rerun
after the owner resolves the pointer/checkout condition.

This updates packaged plugin FILES automatically. It never submits to the OpenAI
portal, requests review, or approves a release. OpenAI submission and review are
separate owner-controlled steps. Scripts and tests do not invoke live promotion
during local validation; CI receives the scoped credential only in its job.

Release plan: audit public content → configure the project hook secret →
merge checked changes to main for beta → audit beta consumers → tag a reviewed
commit `v0.1.0` for latest. Subsequent stable releases use increasing semver tags.
No publication, remote changes, or secret creation occurs from local scripts.

## Behavioral benchmarks

[benchmarks/onboarding.json](benchmarks/onboarding.json) contains realistic
onboarding and briefing cases with tool outcomes and behavioral rubrics.
[benchmarks/README.md](benchmarks/README.md) explains execution and scoring.
Node tests validate fixture structure and packaging behavior; they are not model
evaluations and do not establish behavioral pass rates.

MIT; copyright Saubhagya Awaneesh.
