# Meetly skills

Canonical agent instructions for Meetly, intended for the public
`asaubhagya/meetly-skills` repository after the publication audit.
Start with [GUIDE.md](GUIDE.md). All eight skill folders are usable unchanged by
packaged plugins and MCP inline workflows.

## Develop

Requires Node.js 22 or newer. No dependencies or install step.

```sh
npm run validate
npm test
npm run build
npm run check
```

Commit the generated manifest with every distributed content change. Increment
a skill's positive integer `version` when its instructions or attachments change;
the initial versioned catalog starts at 1. Package/release semver is separate.

The built-in validator intentionally accepts a small YAML subset: SKILL.md has
plain single-line `name`, `version`, and `description` fields, followed by a
nonempty Markdown body. Skill names match their directories and contain lowercase
letters, digits, and single hyphens (at most 64 characters). UI metadata uses
JSON-quoted strings, one Meetly MCP dependency, and an explicit boolean invocation
policy. Unsupported or duplicate fields fail closed; extend the parser/tests
together when adding metadata. Artifact skills must remain explicitly invoked.
Symlinks, unsafe paths, and nonregular files are rejected.

## Manifest contract

`manifest.json` is deterministic UTF-8 JSON with a trailing newline:

```json
{
  "schema": "meetly-skills/1",
  "skills": [{
    "key": "setup-meetly",
    "version": 1,
    "description": "...",
    "files": [{
      "path": "SKILL.md",
      "src": "skills/setup-meetly/SKILL.md",
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
(latest) may dispatch `meetly-skills-updated` to `asaubhagya/get-meetly-ai`.
The payload carries repository, immutable SHA, ref, and channel outside the
manifest. The downstream consumer must compare semantic versions before moving
latest, so replaying an older tag cannot roll it back, and must verify hashes.

The repository secret `MEETLY_DISTRIBUTION_TOKEN` must be provisioned by the owner
with permission to dispatch to that downstream repository. It is not created or
stored here. Missing secret skips dispatch with an explicit CI notice.
Pull requests never dispatch. The downstream repository owns web build/deploy,
channel resolution and the Meetly setup tool integration; this repo's workflow
does not publish releases or deploy a site.

Release plan: audit public content → publish repository → configure secret →
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
