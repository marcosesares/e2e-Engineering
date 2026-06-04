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
| 7 | Expert-review wave | Manifest-first independent review — reviewers receive review-bundle metadata + canonical spec, pull scoped evidence themselves, not worktree paths; fan-out by expertise area, bounded batches if Codex agent slots are constrained |
| 8 | Expert agent definitions | Canonical specs in `skills/e2e-engineering/agents/*.md` + `agents.manifest.json`; Claude wrappers generated via `scripts/generate-agent-wrappers.ps1`; Codex uses prompt-injected `worker` agents |
| 9 | Forcing mechanism | Static capability hint + live no-op spawn probe + Codex worker-change probe; branch invisible stalls, checkout-mutating branch-visible workers use serial branch mode; inline slice-impl = hard STOP |
| 10 | State files | Evidence sidecars at `manifests/<story-id>/`; `prd.json` holds DAG + status + pointers only; cross-runtime |
| 11 | Skill registration | `AGENTS.md` tiny router for Codex; Claude Code uses SKILL.md description frontmatter (no AGENTS.md needed) |
| 12 | Pre-impl expert consult | Inline default; manifest-driven fan-out for high-risk PRDs (schema-heavy, security, cross-service, complex UX, or user request) |
| 13 | Distribution | Install full runtime tree: shared `skills/` + runtime entry points; `AGENTS.md` alone is never enough |
| 14 | Migration | 4 phases, incremental — each leaves ≥1 runtime working |

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
      generate-agent-wrappers.ps1    ← emits .claude/agents/ (Phase 3)
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
  frontend-reviewer.md
  test-reviewer.md

Codex reviewer roles                  ← standard worker agents with canonical specs injected

AGENTS.md                             ← Codex routing block (Phase 2)
```

Installed target layout:

```
Claude target:
  skills/
  .claude/skills/
  .claude/agents/

Codex/OpenCode target:
  skills/
  .agents/skills/
  AGENTS.md

Cursor target:
  skills/
  .agents/skills/
  AGENTS.md
  .cursor/rules/e2e-engineering.mdc
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
1. `.agents/skills/e2e-engineering/SKILL.md` — Codex variant: capability probe section added, fan-out via `spawn_agents_on_csv`/`spawn_agent`, expert consult inline default + manifest fan-out for high-risk using prompt-injected `worker` agents, `git merge` direct (no `ExitWorktree`), reviewer roles: `backend-architect`/`dba`/`frontend-reviewer`. Paths to shared sub-skills: `../../../skills/e2e-engineering/X`.
2. `.agents/skills/e2e-flight/SKILL.md` — Codex variant: Step 0 resolves `sharedSkillsRoot = skills/e2e-engineering` once, then static hint + no-op probe + worker-change probe (branch visible + checkout mode detection). Parallel mode requires orchestrator checkout unchanged; checkout-mutating branch-visible workers use serial branch mode. Fan-out writes ready-set manifest + `spawn_agents_on_csv` or `spawn_agent` workers, workers commit to `slice/<story-id>` branches visible to orchestrator, expert-review wave uses manifest-first review-bundle + canonical expert spec (NOT worktree path; no full raw diff/log in orchestrator), reviewers: `backend-architect`/`dba`/`frontend-reviewer`/`test-reviewer` as prompt roles on `worker`, bounded reviewer batches if agent slots are constrained, `git merge` direct by orchestrator. Slice result manifest + review manifest introduced. Red flags list extended with worktree-path coupling warning.
3. `skills/grill-with-docs/ADR-FORMAT.md` + `CONTEXT-FORMAT.md` — moved from `.claude/skills/grill-with-docs/` (deleted there). `.claude/skills/grill-with-docs/SKILL.md` updated (2 path refs). `.agents/skills/grill-with-docs/SKILL.md` created pointing to `../../../skills/grill-with-docs/`.
4. `AGENTS.md` — replaced standalone sequential flow (pre-Phase-2 provisional) with tiny routing block per ADR 0023 decision #9 (fail-closed, no sequential fallback).

Notes:
- Existing `AGENTS.md` had a full sequential flow (no fan-out) — overwritten per ADR 0023 decision #9 (fail-closed, not degraded).
- Canonical reviewer names used in all entry points: `backend-architect`, `dba`, `frontend-reviewer`, `test-reviewer`.
- Expert-review Codex worker prompt-injection dependency noted inline in both Codex SKILL.md files.

### Phase 3 — Expert agent adapters ✅ DONE

Tasks completed:
1. `skills/e2e-engineering/agents/` — 4 canonical specs (no runtime primitives):
   - `backend-architect.md`
   - `dba.md`
   - `frontend-reviewer.md`
   - `test-reviewer.md`
2. `skills/e2e-engineering/agents.manifest.json` — per-role: `claude_name`, `description`, `tools`, `model`, `sandbox_mode`, `mcp_servers`
3. `skills/e2e-engineering/scripts/generate-agent-wrappers.ps1` — reads canonical specs + manifest, emits self-contained Claude wrappers
4. Script run → emitted `.claude/agents/*.md` for all 4 roles
5. Verified generated `.claude/agents/` files functionally equivalent to prior hand-authored ones. Codex uses the same canonical specs by prompt injection into standard `worker` agents.
6. `.claude/skills/e2e-flight/SKILL.md` — agent refs updated to canonical names
7. Old hand-authored `.claude/agents/ui-designer.md` + `senior-qa.md` removed from the generated source tree; installer warns about these orphans and deletes them only with `--force`

Rename decision: canonical names (`frontend-reviewer`, `test-reviewer`) used everywhere. Old names deleted, not shimmed.

### Phase 4 — Evidence sidecars ✅ DONE

Tasks completed:
1. `skills/e2e-engineering/schemas/prd.json.md` — added `resultManifestPath` + `reviewManifestPath` per story; added Evidence sidecar layout section; added invariants for status authority + pointer fields.
2. `skills/e2e-engineering/schemas/slice-result.json.md` — evidence-pointer-first: `{ sliceId, status, summary, testsPassed, branch, evidencePaths[], findings[] }`. Status-not-authoritative invariant.
3. `skills/e2e-engineering/schemas/review-bundle.json.md` — new: manifest-first reviewer input sidecar; branch refs, file list, diff stat, test summaries, evidence paths.
4. `skills/e2e-engineering/schemas/review-result.json.md` — new: envelope `{ sliceId, reviews: [{ reviewerId, findings[] }] }`. Individual reviewer return shape documented inline.
5. `skills/e2e-engineering/schemas/verification-result.json.md` — new: GATE 5 schema, status:stubbed until automation lands.
6. `.claude/skills/e2e-flight/SKILL.md` + `.agents/skills/e2e-flight/SKILL.md` — sole-writer line updated; sub-agent return type updated to slice result manifest with schema link; reviewer return type updated; Step 3.6 Record → "Record + persist sidecars" with sidecar write + prd.json pointer update + status authority note.
7. `.claude/skills/e2e-engineering/SKILL.md` + `.agents/skills/e2e-engineering/SKILL.md` — state layout updated (added `manifests/<story-id>/`); schema list updated (4 new schemas); sole-writer rule updated; implementation loop fan-in step updated with sidecar persist + pointer write + status authority note.

---

## Key constraints to remember

- **Sole writer** — only orchestrator writes `prd.json` + `progress.txt`. Workers return manifests; never touch shared state.
- **Forcing mechanism is load-bearing** — if Step 0 probe is skipped or weakened in Codex SKILL.md, silent fallback to inline slice-impl causes the 22.3M-token blowup (ADR 0022 incident root cause).
- **Codex branch-visible integration is the token-cheap path** — workers commit to `slice/<story-id>` and return manifests; orchestrator diffs/tests/merges locally. If branch visibility fails, stall instead of text-patch fallback. If checkout isolation fails but branch visibility passes, use serial branch mode.
- **Expert review = artifact-driven, not worktree-path** — Codex worktree isolation is internal; path coupling fails silently.
- **Review bundles are manifest-first** — orchestrator writes cheap metadata/pointers; reviewers pull scoped hunks/logs. Do not move diff/log summarization into orchestrator context.
- **Worker results are evidence-pointer-first** — final worker chat returns compact manifest + evidence paths, never raw logs/diffs or long narrative.
- **Reviewer slots are bounded** — close completed/errored agents promptly; if reviewer spawn hits a slot limit, retry after cleanup, then batch reviewers. Never skip `test-reviewer`.
- **Expert adapters** — never hand-edit `.claude/agents/` after Phase 3; always regenerate from canonical specs. Codex reviewer prompts must inject those same canonical specs into standard `worker` agents.
- **AGENTS.md is a router, not a spec** — keep it under 20 lines; no workflow content.
- **Distribution installs the full runtime tree** — shared `skills/` must ship with `.claude/skills/` or `.agents/skills/`; AGENTS.md-only Codex installs are invalid.
- **Resolve shared root once** — e2e-flight verifies `skills/e2e-engineering` at bootstrap and reuses it. Missing shared tree stalls `shared-skills-missing`; no repeated `.agents/...` fallback probes.
- **Evidence sidecars cross-runtime** — Phase 4 applies to both Claude Code and Codex; it is a schema evolution, not a Codex-only fork.
