# Dual-runtime adaptation: Claude Code + Codex CLI

**Status:** accepted

The e2e-engineering skill system is adapted to run on Codex CLI without forking content. Canonical workflow lives in a runtime-neutral `skills/` root; Claude Code and Codex each get thin entry-point wrappers. The core orchestration contract (manifest-driven fan-out, artifact-driven expert review, fail-closed forcing, sidecar evidence) is preserved across both runtimes.

## Context

The skill system was built for Claude Code primitives: `Agent`, `EnterWorktree`/`ExitWorktree`, `ToolSearch`, `.claude/skills/`, `.claude/agents/*.md`. Codex CLI has a different tool surface: manifest-driven sub-agent spawn (`spawn_agents_on_csv` or `spawn_agent`/`wait_agent`), internally-managed worktrees, `~/.codex/agents/*.toml`, `.agents/skills/`, and `AGENTS.md` for routing. The two runtimes are different enough that naïve porting would either duplicate all skill content or hard-couple the shared core to one runtime's primitives.

Two viable shapes existed: Codex-only migration (drop Claude Code) or dual-runtime with a shared core. Codex-only was rejected — Claude Code remains the primary runtime and the skill system's existing tests and validation are Claude Code–based. Abandoning it before Codex parity is proven would leave no working runtime during migration.

## Decisions

### 1. Dual-runtime skill tree

Three-zone layout:

```
skills/                          ← runtime-neutral, canonical
  e2e-engineering/
    pre-impl/  impl/  post-impl/  schemas/  constitution.md  adopt.md
    agents/                      ← canonical expert specs (*.md)
    agents.manifest.json         ← runtime metadata per role
    scripts/
      generate-agent-wrappers.ps1
  e2e-flight/
  grill-with-docs/

.claude/skills/                  ← Claude Code entry points only
  e2e-engineering/SKILL.md
  e2e-flight/SKILL.md

.agents/skills/                  ← Codex entry points only
  e2e-engineering/SKILL.md
  e2e-flight/SKILL.md

.claude/agents/*.md              ← generated
~/.codex/agents/*.toml           ← generated
```

Rule: a file with no runtime primitives lives in `skills/`; a file referencing `EnterWorktree`/`Agent`/`spawn_agent`/etc. lives in the runtime-specific entry point. Sub-skills, schemas, constitution, and expert specs are shared — only the two `SKILL.md` entry points per skill are runtime-coupled.

### 2. Manifest-driven fan-out (explicit orchestration)

Natural-language fan-out is not used for gated implementation slices. The orchestrator owns the DAG, computes the ready set, spawns one worker per slice with disjoint ownership, and requires each worker to return a structured **slice result manifest** (`storyId`, `status`, `attempts`, `changedFiles[]`, `red`, `green`, `e2eDocPath`, `blockedReason`, `notes[]`). Sole writer writes authoritative status to `prd.json`; full evidence persists to `manifests/<story-id>/slice-result.json`.

The Codex transport is `spawn_agents_on_csv` if available, otherwise `spawn_agent`/`wait_agent`. JSON/NDJSON manifest is preferred over CSV for nested fields (acceptanceCriteria, testCases, gate evidence). CSV is a transport detail — the manifest schema is the contract.

Natural-language fan-out weakens worktree isolation, result collection, sole-writer state updates, and bounce-ceiling enforcement. It may be used for low-risk exploratory work but is never the default for implementation slices.

### 3. Artifact-driven expert-review wave

Expert reviewers receive artifacts — not worktree paths. Input to each reviewer: PRD, constitution, relevant test-case docs, slice IDs, changed file list, diff/patch summary, test output evidence, applicable expert spec. Reviewers are read-only by contract; each returns a **review manifest** (`reviewerRole`, `sliceIds[]`, `findings[]` with severity/file/location/issue/rationale/suggestedFix/blocking). Fan-out is by expertise area, not necessarily one reviewer per implementation slice — catches cross-slice integration issues.

Worktree-path input was rejected because Codex manages worktree isolation internally; coupling reviewers to a specific worktree path creates a runtime dependency that can fail silently and makes the review contract harder to port.

Post-impl expert review is always independent fan-out. Pre-impl expert consultation is inline by default (orchestrator loads canonical spec files as advisory context while drafting the PRD), with optional manifest-driven advisor fan-out for high-risk PRDs (schema-heavy, security-sensitive, cross-service, complex UX/state machines, or user request).

### 4. Fail-closed forcing mechanism — static hint + live probe

Step 0 of Codex e2e-flight runs a two-step capability handshake before any slice work:

1. Static capability hint — use tool-discovery primitive if available in the runtime (not sufficient alone).
2. Live no-op probe — spawn a trivial worker, wait for `{"status":"ok","capability":"fanout-probe"}`, close the worker; short timeout.

Any failure at either step: `<e2e-stall reason="fanout-unavailable" />` + EXIT. Inline slice-impl remains a hard STOP. The skill trigger declares sub-agent usage explicitly so runtimes requiring user authorization can prompt before Step 0 runs.

A static-only check proves configuration, not runtime. The live probe is the gate.

### 5. Evidence sidecars (cross-runtime schema evolution)

`prd.json` remains the compact DAG/state document. Gate evidence moves to sidecars:

```
.e2e-engineering/
  prd.json          ← DAG, status, manifest pointers
  progress.txt
  queue.json
  manifests/
    <story-id>/
      slice-result.json
      review-result.json
      verification-result.json
```

`prd.json` carries lightweight pointers (`resultManifestPath`, `reviewManifestPath`) and authoritative status. Sole writer reconciles sidecar status at fan-in and writes authoritative story status to `prd.json` — sidecar status is never authoritative. This applies to both runtimes; it is a schema improvement, not a Codex fork.

### 6. Generated expert agent wrappers

Canonical expert definitions live in `skills/e2e-engineering/agents/*.md` — pure review rubric, no runtime primitives. `agents.manifest.json` holds runtime metadata per role (model, sandbox_mode, mcp_servers). `generate-agent-wrappers.ps1` emits self-contained runtime wrappers:

- `.claude/agents/<role>.md` — Claude Code format
- `~/.codex/agents/<role>.toml` — Codex TOML; `developer_instructions` inlines the canonical spec rather than path-referencing (path references can fail silently in Codex)

Generated files are checked into source. Never edited by hand — regenerate from canonical source.

### 7. AGENTS.md tiny router

`AGENTS.md` routes Codex trigger phrases to skills. It is a router only — no workflow content. Example:

```
When the user says "e2e-engineering", "e2e-eng", "ship it", "implement feature <name>",
"build this end to end", or "run the full flow", use the e2e-engineering skill.

When the user says "e2e-flight" or requests parallel slice execution, use the e2e-flight skill.
e2e-flight requires parallel sub-agent capability; if fan-out is unavailable, it exits with
<e2e-stall reason="fanout-unavailable" /> rather than implementing slices inline.
```

Routing block generated from SKILL.md `description` frontmatter to prevent trigger-phrase drift. Claude Code does not need AGENTS.md — the harness auto-reads SKILL.md `description` for trigger matching.

### 8. Four-phase incremental migration

Layout and adapter changes are kept in separate phases. Each phase leaves at least one runtime working and is independently reviewable.

1. **Extract shared core** — move runtime-neutral content from `.claude/skills/e2e-engineering/` to `skills/e2e-engineering/`; update Claude Code SKILL.md entry points to thin wrappers; verify Claude Code green.
2. **Add Codex runtime** — add `.agents/skills/` entry-point SKILL.md files and AGENTS.md routing block.
3. **Add expert agent adapters** — add canonical specs, `agents.manifest.json`, generation script; emit runtime wrappers.
4. **Add evidence sidecars** — add `manifests/<story-id>/` directory and update `prd.json` schema with manifest pointers.

## Considered Options

- **Codex-only migration** — rejected: Claude Code is the validated primary runtime; abandoning it before Codex parity would leave no working runtime during migration and discard all existing validation.
- **Natural-language fan-out as primary Codex path** — rejected: weakens sole-writer guarantee, bounce-ceiling enforcement, and gate evidence collection. The workflow depends on auditability — PRD state, slice status, RED/GREEN evidence, blocked reasons.
- **Worktree-path-driven expert reviewers** — rejected: Codex manages worktrees internally; worktree path exposure is implementation-dependent and creates a runtime coupling that can fail silently.
- **Hand-maintained dual agent definition files** — rejected: `.claude/agents/*.md` and `~/.codex/agents/*.toml` maintained separately will drift. Generated from a single canonical source is the only maintainable option.
- **Big-bang migration** — rejected: path breakage, wrapper drift, and state-schema regressions all land at once; incremental phases isolate failure modes.

## Consequences

- Sub-skills, schemas, constitution, and expert specs become runtime-agnostic — any future runtime target only needs new entry-point SKILL.md files, not content duplication.
- The forcing mechanism (Step 0 live probe) is load-bearing in Codex as it is in Claude Code — if the probe is skipped or weakened, silent fallback to inline slice-impl will cause the same token blowup as the ADR 0022 incident.
- Evidence sidecars improve auditability across both runtimes but add a new artifact type to the state schema; consumers of `prd.json` must not assume gate evidence is inline.
- Generated agent wrapper files must be regenerated whenever canonical specs change — a CI check or pre-commit hook on `skills/e2e-engineering/agents/` is advisable.
