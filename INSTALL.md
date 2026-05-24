# Installing e2e-engineering

e2e-engineering ships in two fidelities from one source:

- **Claude Code** — full skill: parallel worktree subagents, 65% context checkpoints, five hard gates, phase-adaptive entry.
- **Portable** (Codex / OpenCode / Cursor) — same phases, gates, DAG, TDD loop and state files, but slices run **sequentially** (those agents have no parallel worktree fan-out).

Canonical source of truth: `.claude/skills/e2e-engineering/`. The `dist/` tree is generated/maintained from it (`npm run build`).

## Quick install — npx

```bash
# auto-detect the agent in the current project and install the right variant
npx e2e-engineering init

# or pick explicitly
npx e2e-engineering init --target claude     # full skill → .claude/skills/e2e-engineering/
npx e2e-engineering init --target cursor     # .cursor/rules/e2e-engineering.mdc + AGENTS.md
npx e2e-engineering init --target codex      # AGENTS.md
npx e2e-engineering init --target opencode   # AGENTS.md
npx e2e-engineering init --target all        # everything

# flags
--dest <dir>   target project (default: cwd)
--force        overwrite existing files
--dry-run      show what would be written
```

Auto-detect: `.claude/` → claude · `.cursor/` → cursor · else → codex (AGENTS.md).
If an `AGENTS.md` already exists, the installer writes `AGENTS.e2e-engineering.md` instead (reference it, or re-run with `--force`).

## Manual install

**Claude Code (per-project):**
```powershell
Copy-Item -Recurse "<pkg>/dist/marketplace/plugins/e2e-engineering/skills/e2e-engineering" "<repo>/.claude/skills/e2e-engineering"
```
**Claude Code (global, all projects):**
```powershell
Copy-Item -Recurse "<pkg>/dist/marketplace/plugins/e2e-engineering/skills/e2e-engineering" "$env:USERPROFILE/.claude/skills/e2e-engineering"
```
Restart Claude Code → type `/e2e-engineering`.

**Codex / OpenCode:** copy `dist/agents-md/AGENTS.md` to the repo root.
**Cursor:** copy `dist/cursor/.cursor/rules/e2e-engineering.mdc` + `dist/agents-md/AGENTS.md` to the repo root.

## Claude marketplace (discoverable install)

`dist/marketplace/` is a standalone Claude Code marketplace repo: `.claude-plugin/marketplace.json` at its root, the plugin under `plugins/e2e-engineering/` (`.claude-plugin/plugin.json` + `skills/`). Publish the **contents of `dist/marketplace/`** to the root of a GitHub repo, then:

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
npm run build          # sync canonical skill → dist/marketplace/plugins/e2e-engineering/skills
npm publish            # prepublishOnly re-runs build
```

## Fidelity matrix

| Capability | Claude Code | Codex / OpenCode / Cursor |
|---|---|---|
| Phases, 5 hard gates, DAG, TDD loop | yes | yes |
| State files (`prd.json`, `progress.txt`, test-cases) | yes | yes |
| Constitution rails | yes | yes |
| Parallel slice execution (worktree fan-out) | yes | **no — sequential** |
| Subagent dispatch / lean orchestrator context | yes | no |
| 65% context auto-checkpoint | yes (hook) | manual judgment |
| `/run` + `/verify` harness wiring (gate 5) | yes | manual exercise |
| adopt mode | yes | partial (docs draft only) |
