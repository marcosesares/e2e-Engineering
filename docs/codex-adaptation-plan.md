# Codex Adaptation Plan

**ADR:** `docs/adr/0023-dual-runtime-codex-adaptation.md`
**CONTEXT.md updated:** yes — all new terms pinned during grilling session.

---

## Decisions locked (ADR 0023)

| # | Decision | Answer |
|---|----------|--------|
| 1 | Scope | Entire skill system (e2e-engineering + e2e-flight + all sub-skills) |
| 2 | Target | Codex CLI |
| 3 | Portability | Dual-runtime — shared core + thin runtime entry points |
| 4 | Split boundary | SKILL.md level (entry points are runtime-coupled; sub-skills are not) |
| 5 | Shared content location | Neutral `skills/` root (repo root, not `.claude/` or `.agents/`) |
| 6 | Fan-out model | Explicit manifest-driven orchestration — `spawn_agents_on_csv` or `spawn_agent`/`wait_agent`; manifest schema is the contract, CSV is transport detail |
| 7 | Expert-review wave | Artifact-driven independent fan-out — reviewers receive PRD + constitution + diff + test evidence, not worktree paths; fan-out by expertise area |
| 8 | Expert agent definitions | Canonical specs in `skills/e2e-engineering/agents/*.md` + `agents.manifest.json`; generated runtime wrappers via `scripts/generate-agent-wrappers.ps1` |
| 9 | Forcing mechanism | Static capability hint + live no-op spawn probe, fail-closed; inline slice-impl = hard STOP |
| 10 | State files | Evidence sidecars at `manifests/<story-id>/`; `prd.json` holds DAG + status + pointers only; cross-runtime |
| 11 | Skill registration | `AGENTS.md` tiny router for Codex; Claude Code uses SKILL.md description frontmatter (no AGENTS.md needed) |
| 12 | Pre-impl expert consult | Inline default; manifest-driven fan-out for high-risk PRDs (schema-heavy, security, cross-service, complex UX, or user request) |
| 13 | Migration | 4 phases, incremental — each leaves ≥1 runtime working |

---

## Target directory layout

```
skills/                               ← runtime-neutral shared content
  e2e-engineering/
    pre-impl/  impl/  post-impl/  schemas/
    constitution.md  adopt.md
    agents/                           ← canonical expert specs (Phase 3)
      backend-architect.md
      dba.md
      frontend-reviewer.md
      test-reviewer.md
    agents.manifest.json              ← runtime metadata per role (Phase 3)
    scripts/
      generate-agent-wrappers.ps1    ← emits .claude/agents/ + ~/.codex/agents/ (Phase 3)
  grill-with-docs/
    SKILL.md  ADR-FORMAT.md  CONTEXT-FORMAT.md  (Phase 2)

.claude/skills/                       ← Claude Code entry points only
  e2e-engineering/SKILL.md           ← DONE (Phase 1)
  e2e-flight/SKILL.md                ← DONE (Phase 1)
  grill-with-docs/
    SKILL.md  ADR-FORMAT.md  CONTEXT-FORMAT.md  ← unchanged until Phase 2

.agents/skills/                       ← Codex entry points (Phase 2)
  e2e-engineering/SKILL.md
  e2e-flight/SKILL.md
  grill-with-docs/SKILL.md

.claude/agents/                       ← currently hand-authored; Phase 3 = generated
  backend-architect.md
  dba.md
  ui-designer.md
  senior-qa.md

~/.codex/agents/                      ← generated (Phase 3)
  backend-architect.toml
  dba.toml
  frontend-reviewer.toml
  test-reviewer.toml

AGENTS.md                             ← Codex routing block (Phase 2)
```

---

## Phase status

### Phase 1 — Extract shared core ✅ DONE

- All 21 shared sub-skills moved from `.claude/skills/e2e-engineering/` to `skills/e2e-engineering/`
- `.claude/skills/e2e-engineering/SKILL.md` — all `./X` paths updated to `../../../skills/e2e-engineering/X` (21 paths, verified)
- `.claude/skills/e2e-flight/SKILL.md` — all `../e2e-engineering/X` sub-skill paths updated to `../../../skills/e2e-engineering/X` (5 paths, verified)
- Claude Code still finds all sub-skills via updated paths; only SKILL.md remains in `.claude/skills/e2e-engineering/`

### Phase 2 — Add Codex runtime ✅ DONE

Tasks completed:
1. `.agents/skills/e2e-engineering/SKILL.md` — Codex variant: capability probe section added, fan-out via `spawn_agents_on_csv`/`spawn_agent`, expert consult inline default + manifest fan-out for high-risk, `git merge` direct (no `ExitWorktree`), agent names: `backend-architect`/`dba`/`frontend-reviewer`. Paths to shared sub-skills: `../../../skills/e2e-engineering/X`.
2. `.agents/skills/e2e-flight/SKILL.md` — Codex variant: Step 0 = static hint + no-op probe (fail-closed), fan-out writes ready-set manifest + `spawn_agents_on_csv`, expert-review wave artifact-driven (review bundle, NOT worktree path), reviewers: `backend-architect`/`dba`/`frontend-reviewer`/`test-reviewer`, `git merge` direct. Slice result manifest + review manifest introduced. Red flags list extended with worktree-path coupling warning.
3. `skills/grill-with-docs/ADR-FORMAT.md` + `CONTEXT-FORMAT.md` — moved from `.claude/skills/grill-with-docs/` (deleted there). `.claude/skills/grill-with-docs/SKILL.md` updated (2 path refs). `.agents/skills/grill-with-docs/SKILL.md` created pointing to `../../../skills/grill-with-docs/`.
4. `AGENTS.md` — replaced standalone sequential flow (pre-Phase-2 provisional) with tiny routing block per ADR 0023 decision #9 (fail-closed, no sequential fallback).

Notes:
- Existing `AGENTS.md` had a full sequential flow (no fan-out) — overwritten per ADR 0023 decision #9 (fail-closed, not degraded).
- Agent name `ui-designer` → `frontend-reviewer`, `senior-qa` → `test-reviewer` in Codex entry points (canonical Phase-3 names; Claude Code agents keep old names until Phase 3 regenerates them).
- Expert-review agent Phase 3 dependency noted inline in both Codex SKILL.md files.

### Phase 3 — Expert agent adapters ✅ DONE

Tasks completed:
1. `skills/e2e-engineering/agents/` — 4 canonical specs (no runtime primitives):
   - `backend-architect.md`
   - `dba.md`
   - `frontend-reviewer.md` (renamed from `ui-designer`)
   - `test-reviewer.md` (renamed from `senior-qa`)
2. `skills/e2e-engineering/agents.manifest.json` — per-role: `claude_name`, `codex_name`, `description`, `tools`, `model`, `sandbox_mode`, `mcp_servers`
3. `skills/e2e-engineering/scripts/generate-agent-wrappers.ps1` — reads canonical specs + manifest, emits self-contained wrappers (inlines instructions, does not path-reference)
4. Script run → emitted `.claude/agents/*.md` + `~/.codex/agents/*.toml` for all 4 roles
5. Verified generated `.claude/agents/` files functionally equivalent to prior hand-authored ones
6. `.claude/skills/e2e-flight/SKILL.md` — agent refs updated: `ui-designer` → `frontend-reviewer`, `senior-qa` → `test-reviewer`
7. Old hand-authored `.claude/agents/ui-designer.md` + `senior-qa.md` deleted

Rename decision: canonical names (`frontend-reviewer`, `test-reviewer`) used everywhere. Old names deleted, not shimmed.

### Phase 4 — Evidence sidecars ✅ DONE

Tasks completed:
1. `skills/e2e-engineering/schemas/prd.json.md` — added `resultManifestPath` + `reviewManifestPath` per story; added Evidence sidecar layout section; added invariants for status authority + pointer fields.
2. `skills/e2e-engineering/schemas/slice-result.json.md` — new: `{ sliceId, status, summary, testsPassed, branch, findings[] }`. Status-not-authoritative invariant.
3. `skills/e2e-engineering/schemas/review-result.json.md` — new: envelope `{ sliceId, reviews: [{ reviewerId, findings[] }] }`. Individual reviewer return shape documented inline.
4. `skills/e2e-engineering/schemas/verification-result.json.md` — new: GATE 5 schema, status:stubbed until automation lands.
5. `.claude/skills/e2e-flight/SKILL.md` + `.agents/skills/e2e-flight/SKILL.md` — sole-writer line updated; sub-agent return type updated to slice result manifest with schema link; reviewer return type updated; Step 3.6 Record → "Record + persist sidecars" with sidecar write + prd.json pointer update + status authority note.
6. `.claude/skills/e2e-engineering/SKILL.md` + `.agents/skills/e2e-engineering/SKILL.md` — state layout updated (added `manifests/<story-id>/`); schema list updated (3 new schemas); sole-writer rule updated; implementation loop fan-in step updated with sidecar persist + pointer write + status authority note.

---

## Key constraints to remember

- **Sole writer** — only orchestrator writes `prd.json` + `progress.txt`. Workers return manifests; never touch shared state.
- **Forcing mechanism is load-bearing** — if Step 0 probe is skipped or weakened in Codex SKILL.md, silent fallback to inline slice-impl causes the 22.3M-token blowup (ADR 0022 incident root cause).
- **Expert review = artifact-driven, not worktree-path** — Codex worktree isolation is internal; path coupling fails silently.
- **Generated agent wrappers** — never hand-edit `.claude/agents/` or `~/.codex/agents/` after Phase 3; always regenerate from canonical specs.
- **AGENTS.md is a router, not a spec** — keep it under 20 lines; no workflow content.
- **Evidence sidecars cross-runtime** — Phase 4 applies to both Claude Code and Codex; it is a schema evolution, not a Codex-only fork.
