# Publish and Client Install How-To

This guide is the maintainer runbook for publishing e2e-engineering and the client-side guide for installing it into a project.

Distribution has two public surfaces:

- **npm package**: public install path for Codex, Cursor, OpenCode, and Claude Code.
- **Claude marketplace repo**: discoverable Claude Code plugin install path.

There is currently no public Codex marketplace equivalent in the project. Codex clients should install through `npx e2e-engineering@latest init --target codex`.

## 1. Maintainer prerequisites

Install Node.js 18 or newer and make sure you can publish to npm:

```bash
node --version
npm --version
npm login
```

For Claude marketplace publishing, create or reuse a standalone public GitHub repo such as:

```text
marcosesares/e2e-engineering-marketplace
```

The marketplace repo must receive the generated contents of `dist/marketplace/` at its root. Do not point Claude Code at this source repository unless the generated marketplace files are at the repo root.

## 2. Prepare a release

Start from the source repo:

```bash
git status
npm install
npm run build
npm run validate
```

`npm run build` regenerates `dist/`. `npm run validate` checks skill links, stale role names, generated dist freshness, and JSON manifests.

Preview the full publish flow without publishing, pushing, committing, or tagging:

```bash
pwsh -NoProfile -File scripts/publish.ps1 -DryRun
```

## 3. Publish npm and marketplace

The full publish script bumps the version, stamps all package/plugin manifests, builds, validates, commits, tags, publishes npm, and pushes the Claude marketplace mirror:

```powershell
pwsh -NoProfile -File scripts/publish.ps1
```

Override the SemVer bump when needed:

```powershell
pwsh -NoProfile -File scripts/publish.ps1 -Bump patch
pwsh -NoProfile -File scripts/publish.ps1 -Bump minor
pwsh -NoProfile -File scripts/publish.ps1 -Bump major
```

`prepublishOnly` runs build and validation again before npm publishes. `publish:marketplace` also rebuilds and validates before syncing the standalone marketplace repo.

Verify npm sees the new version:

```bash
npm view e2e-engineering version
npx e2e-engineering@latest init --dry-run
```

## 4. Publish surfaces manually

If you do not want to use `scripts/publish.ps1`, publish npm and the marketplace mirror manually:

```bash
npm run build
npm run validate
npm publish --access public
```

Then publish the generated marketplace tree to the standalone marketplace repo:

```bash
npm run publish:marketplace -- --remote <git-url> --push --force
```

Example:

```bash
npm run publish:marketplace -- --remote https://github.com/marcosesares/e2e-engineering-marketplace.git --push --force
```

The marketplace mirror is generated and force-pushed. Keep human edits in the source repo, not in the generated marketplace repo.

Verify from Claude Code:

```text
/plugin marketplace add <owner>/<repo>
/plugin install e2e-engineering@e2e-engineering
```

## 5. Client install through npm

Run these commands inside the client project.

Auto-detect the local runtime:

```bash
npx e2e-engineering@latest init
```

Install explicitly by runtime:

```bash
npx e2e-engineering@latest init --target codex
npx e2e-engineering@latest init --target claude
npx e2e-engineering@latest init --target cursor
npx e2e-engineering@latest init --target opencode
npx e2e-engineering@latest init --target all
```

Preview first:

```bash
npx e2e-engineering@latest init --target codex --dry-run
```

Install into another path:

```bash
npx e2e-engineering@latest init --target codex --dest path/to/client-repo
```

Upgrade an existing install:

```bash
npx e2e-engineering@latest init --target codex --force
```

Without `--force`, the installer preserves existing files and warns about known deprecated renamed files. With `--force`, it overwrites managed files and deletes known deprecated renamed files such as old Claude agent role filenames.

## 6. What clients should see

Codex / OpenCode installs:

```text
AGENTS.md
.agents/skills/e2e-engineering/SKILL.md
.agents/skills/e2e-flight/SKILL.md
.agents/skills/grill-with-docs/SKILL.md
skills/e2e-engineering/
skills/e2e-flight/
```

Claude Code installs:

```text
.claude/skills/e2e-engineering/SKILL.md
.claude/skills/e2e-flight/SKILL.md
.claude/skills/grill-with-docs/SKILL.md
.claude/agents/frontend-reviewer.md
.claude/agents/backend-architect.md
.claude/agents/dba.md
.claude/agents/test-reviewer.md
skills/e2e-engineering/
skills/e2e-flight/
```

Cursor installs the Codex tree plus:

```text
.cursor/rules/e2e-engineering.mdc
```

## 7. Client smoke test

After installing, open the target agent in the client repo and trigger the skill:

```text
e2e-engineering
```

Useful trigger phrases:

```text
ship-it
implement feature <name>
build this end to end
run the full flow
grill-with-docs
```

For Codex, `AGENTS.md` is only the router. A valid install must also include `.agents/skills/` and the shared `skills/` tree.

## 8. Troubleshooting

If `AGENTS.md` already exists, the installer writes `AGENTS.e2e-engineering.md` unless `--force` is used. Merge or reference that router in the client project's existing `AGENTS.md`.

If Claude Code cannot find the marketplace plugin, confirm the standalone marketplace repo has `.claude-plugin/marketplace.json` at the repository root.

If Codex cannot execute e2e-flight, confirm the runtime supports worker fan-out and branch-visible worker changes. The skill should stall rather than doing inline slice work when that capability is missing.
