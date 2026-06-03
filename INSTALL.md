# Installing e2e-engineering

e2e-engineering ships runtime-specific entry points from one shared source:

- **Claude Code** — `.claude/skills/` entry points + generated `.claude/agents/`.
- **Codex-style** (Codex / OpenCode / Cursor) — `.agents/skills/` entry points routed by `AGENTS.md`.

Canonical source of truth: `skills/` (shared core), `.claude/skills/` (Claude entry points), `.agents/skills/` (Codex entry points), and `AGENTS.md` (Codex router). The `dist/` tree is generated from them (`npm run build`).

For the end-to-end maintainer publish and client-side install checklist, see [docs/publish-and-client-install-howto.md](docs/publish-and-client-install-howto.md).

## Quick install — npx

```bash
# auto-detect the agent in the current project and install the right variant
npx e2e-engineering init

# or pick explicitly
npx e2e-engineering init --target claude     # skills/ + .claude/skills/ + .claude/agents/
npx e2e-engineering init --target cursor     # skills/ + .agents/skills/ + AGENTS.md + .cursor/rules/
npx e2e-engineering init --target codex      # skills/ + .agents/skills/ + AGENTS.md
npx e2e-engineering init --target opencode   # skills/ + .agents/skills/ + AGENTS.md
npx e2e-engineering init --target all        # everything

# flags
--dest <dir>   target project (default: cwd)
--force        overwrite existing files
               and delete known deprecated renamed files
--dry-run      show what would be written
```

Auto-detect: `.claude/` → claude · `.cursor/` → cursor · else → codex.
If an `AGENTS.md` already exists, the installer writes `AGENTS.e2e-engineering.md` instead (reference it, or re-run with `--force`).
Known deprecated files are only removed with `--force`; otherwise the installer warns and leaves them in place.

## Manual install

**Claude Code (per-project):**
```powershell
Copy-Item -Recurse "<pkg>/dist/shared/skills" "<repo>/skills"
Copy-Item -Recurse "<pkg>/dist/claude/skills/*" "<repo>/.claude/skills/"
Copy-Item -Recurse "<pkg>/dist/claude/agents" "<repo>/.claude/agents"
```
**Claude Code (global, all projects):**
```powershell
Copy-Item -Recurse "<pkg>/dist/shared/skills" "<repo>/skills"
Copy-Item -Recurse "<pkg>/dist/claude/skills/*" "$env:USERPROFILE/.claude/skills/"
Copy-Item -Recurse "<pkg>/dist/claude/agents" "$env:USERPROFILE/.claude/agents"
```
Restart Claude Code → type `/e2e-engineering`.

**Codex / OpenCode:** copy `dist/shared/skills` to `skills/`, `dist/codex/.agents/skills` to `.agents/skills/`, and `dist/agents-md/AGENTS.md` to the repo root.
**Cursor:** same as Codex, plus copy `dist/cursor/.cursor/rules/e2e-engineering.mdc`.

## Claude marketplace (discoverable install)

`dist/marketplace/` is a standalone Claude Code marketplace repo: `.claude-plugin/marketplace.json` at its root, the plugin under `plugins/e2e-engineering/` (`.claude-plugin/plugin.json` + `skills/` entry points + `shared/skills/`). Publish the **contents of `dist/marketplace/`** to the root of a GitHub repo, then:

```
/plugin marketplace add <owner>/<repo>
/plugin install e2e-engineering@e2e-engineering
```

Automate the sync/publish (copies `dist/marketplace/` into a standalone repo, commits, pushes):
```bash
npm run publish:marketplace -- --remote <git-url> --push   # explicit remote
npm run publish:marketplace -- --push                      # uses gh if installed
npm run publish:marketplace                                # sync + commit only, prints next steps
```

## Publishing the npm package

```bash
npm run build          # sync shared + runtime skill trees into dist/
npm run validate       # check links, role names, and generated dist freshness
npm publish            # prepublishOnly re-runs build
```

For the full build/validate/publish flow, use:

```powershell
pwsh -NoProfile -File scripts/publish.ps1 -DryRun
pwsh -NoProfile -File scripts/publish.ps1
```

## Fidelity matrix

| Capability | Claude Code | Codex | Cursor / OpenCode |
|---|---|---|---|
| Phases, 5 hard gates, DAG, TDD loop | yes | yes | yes |
| State files (`prd.json`, `progress.txt`, test-cases) | yes | yes | yes |
| Constitution rails | yes | yes | yes |
| Parallel slice execution | yes (`Agent` + `EnterWorktree`) | yes if spawn + branch probes pass | runtime-dependent |
| Subagent dispatch / lean orchestrator context | yes | yes if spawn probe passes | runtime-dependent |
| Gate 4/5 automation | stubbed pending automation | stubbed pending automation | stubbed pending automation |
| adopt mode | yes | yes | yes |
