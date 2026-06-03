---
name: e2e-flight
description: >-
  Headless implementation worker for the e2e-engineering flow. Implements exactly ONE Task from the queue then exits — no external loop, no context monitoring. Within the spawn it IS the orchestrator: fans out each slice to a sub-agent in its own worktree (impl wave), runs an expert-review wave before merge, then self-reviews and parks human-QA. Headless counterpart to the interactive front door /e2e-engineering. Use when the user says "e2e-flight", "/e2e-flight", "flight", "drain the queue", "run the flight loop", or "implement the selected tasks".
---

# e2e-flight — one-Task implementation worker (Codex runtime)

Sibling to [/e2e-engineering](../e2e-engineering/SKILL.md). Headless implementation. Read CONTEXT.md for any term. Governed by ADR 0022 and the e2e-flight process spec in the source repository.

**One Task per invocation, then exit.** No loop, no respawn, no context monitoring. Re-invoke `/e2e-flight` for next Task. Task finishes in one spawn or stays resumable via `queue.json`/`prd.json` status.

**Token rule.** Blowup cause: fan-out not firing → 126 inline calls → 227-turn O(N²) chain. Fix: fan-out FORCED (Step 0), inline slice-impl = hard STOP (Step 3). Sub-agents hold heavy tool calls, return manifests — keeps orchestrator context small without checkpoint.

---

## Step 0 — bootstrap + forcing mechanism (FIRST, always)

1. **Capability probe (fail-closed).** Static requirement: `spawn_agent` / `spawn_agents_on_csv`. Live probe: attempt no-op spawn (trivial exit instruction); fails → `<e2e-stall reason="fanout-unavailable" />` + EXIT. Branch-visibility probe: spawn disposable worker, instruct it to create + commit a probe branch, verify branch/commit visible from orchestrator, then delete the probe branch; fails → `<e2e-stall reason="worker-changes-unavailable" />` + EXIT. NEVER fall back to inline slice work or full text-patch transfer for normal slices.
2. No driver, no lock, no context monitoring. No handoff docs, no checkpoint, no respawn.
3. Orchestrator output = caveman-ultra, essential only (token discipline).

---

## Step 1 — pick ONE Task

Read `.e2e-engineering/queue.json` (offset/limit — only what you need).

- User named Task → take it.
- Else pick: `status:todo` AND every `dependsOn` in {done, pending-qa}, highest priority first. Flip to `in-progress`.
- No pickable Task → `<e2e-complete />` + EXIT.

Task root: `.e2e-engineering/tasks/<id>/`.

---

## Step 2 — reconcile + read state

Read (offset/limit, only needed sections): `tasks/<id>/prd.json` (slice DAG) + `tasks/<id>/progress.txt`.

- **2.1 — structure missing/invalid** (no prd.json, no DAG, no test-cases): do NOT improvise. Tell user to plan via `/e2e-engineering`, EXIT.
- **2.2 — prior in-progress/stall mess** (slices in-flight with no active spawn): propose reconciliation, EXIT — never blindly resume dirty state.
- **Clean reconcile**: slice in-flight with no active spawn → reset to `todo`. Proceed.

**Docker env cache (brownfield/docker projects).** Read `docker-compose.yml` (+ `docker-compose.override.yml` if present) ONCE. Extract required env/config files: `env_file` entries + volume-mounted config paths. Cache this list — included in every sub-agent spawn manifest in Step 3. Do NOT re-read per slice.

**Codebase-map read (brownfield only).** If `tasks/<id>/codebase-map.md` exists, read §1–§3 ONCE here (use §Index at top of file for offset/limit). Hold in orchestrator context. Do NOT re-read in Steps 3 or 4.

---

## Step 3 — per-slice loop (flight IS the orchestrator)

Sole writer: only orchestrator writes `prd.json` + `progress.txt` + evidence sidecars (`manifests/<story-id>/`). Sub-agents return slice result manifests ([schema](../../../skills/e2e-engineering/schemas/slice-result.json.md)); never touch shared state.

Repeat until DAG drained (every slice `done` or `blocked`):

1. **Compute ready set** — slices whose `depends_on` are all `done` AND own `status: todo`.
2. **Fan-out impl wave** — write ready-set manifest JSON (slice ids + injection payload), then dispatch via `spawn_agents_on_csv` (or `spawn_agent`/`wait_agent`). Codex branch-visible integration is required: each worker creates and commits to `slice/<story-id>` and returns that branch name in its slice result manifest. Parallel ONLY across disjoint file sets (same-file slices serialized by `depends_on` in to-issues). Each sub-agent injection: [constitution](../../../skills/e2e-engineering/constitution.md) + slice (acceptanceCriteria, sliceType, `integration` decision) + testCases + (brownfield) SCOPED slice of `ARCHITECTURE.md` (use §Index for offset/limit on relevant sections).

   **Worktree env/config bootstrap** (included in spawn manifest). Pass cached docker env file list (from Step 2) in each sub-agent's spawn payload. Sub-agent copies into its worktree on start. Do NOT stage/commit these files — untracked only. Required file missing from main tree → sub-agent surfaces it as blocker in slice result manifest; does not silently skip.

   Sub-agents run [tdd](../../../skills/e2e-engineering/impl/tdd.md). Each returns a **slice result manifest** ([schema](../../../skills/e2e-engineering/schemas/slice-result.json.md)): `{ sliceId, status, summary, testsPassed, branch, findings[] }`. Chat carries manifest/evidence summaries only; code changes stay in git.

   - **GATE 2 (hard)** — failing test before production code (inside tdd).
   - **GATE 3 (hard)** — 3 failed fixes → re-dispatch ONCE with [systematic-debugging](../../../skills/e2e-engineering/impl/systematic-debugging.md); still red → mark slice `blocked`, keep draining.
   - **DO NOT do slice-impl inline.** Orchestrator writing slice production code = hard red-flag STOP.

3. **Expert-review wave (artifact-driven, BEFORE merge).** Slice green → orchestrator builds **review bundle** (artifact package: diff + PRD story + [constitution](../../../skills/e2e-engineering/constitution.md) + test evidence + ARCHITECTURE slice). Dispatch reviewer agents **in parallel** via `spawn_agents_on_csv` / `spawn_agent`. In Codex, use standard `worker` agents and inject the matching canonical expert spec from `skills/e2e-engineering/agents/<role>.md` into each reviewer prompt:
   - schema/db → `dba` + `backend-architect`
   - api/logic → `backend-architect` + `test-reviewer`
   - ui → `frontend-reviewer` + `backend-architect` (frontend lens)
   - every slice → `test-reviewer` (AC coverage)

   Reviewer roles above are prompt roles, not Codex `agent_type` names. Reviewers receive review bundle + canonical expert spec only — NOT worktree path (Codex worktree isolation is internal; path coupling fails silently). Each returns **reviewer result** ([schema](../../../skills/e2e-engineering/schemas/review-result.json.md)): `{ reviewerId, sliceId, findings[] }`.

   Reviewers read-only, independent — always parallel, never serial. Findings: **Critical / Important / Minor**. Critical/Important → bounce to impl sub-agent, re-review after fix. **Bounce cap = 3 round-trips** → still failing → mark slice `blocked`, keep draining. Minor → note, don't block.

4. **lint + compile** — orchestrator commands (not agents). Run project lint + build/typecheck; reconcile failures before merge.
5. **Merge** slice branch → Task branch via `git merge slice/<story-id>`. Resolve conflicts (never discard work). Branch missing or not ahead of Task branch → bounce/stall, do not ask worker to paste full patches.
6. **Record + persist sidecars** (sole writer):
   - Write `tasks/<id>/manifests/<story-id>/slice-result.json` ([schema](../../../skills/e2e-engineering/schemas/slice-result.json.md)) from sub-agent's returned manifest.
   - Write `tasks/<id>/manifests/<story-id>/review-result.json` ([schema](../../../skills/e2e-engineering/schemas/review-result.json.md)) from combined reviewer results (all parallel reviewers for this slice).
   - Update prd.json story: `resultManifestPath`, `reviewManifestPath` (paths relative to Task root), `status: done`.
   - Append sub-agent summary to `progress.txt` (caveman-ultra, status-headed line).
   - **Status authority:** orchestrator reconciles sidecar `status` at fan-in; prd.json is sole source of truth. Never copy sidecar status blindly.

---

## Step 4 — e2e QA phase (task-level, after DAG drained)

1. **Author e2e TC docs** — write regression/cross-slice e2e test-cases: Steps, validations, automation backlog. `tasks/<id>/test-cases/` (caveman-ultra).
2. **Automate e2e TCs** — **TODO placeholder.** [GATE 4 — full E2E suite green — STUBBED, pending automation. Not deleted.]
3. **green → refactor** — **TODO placeholder.** [GATE 5 — live verification — STUBBED, pending automation. Not deleted.]

---

## Step 5 — self-review (whole task)

Review assembled Task against acceptanceCriteria + [constitution](../../../skills/e2e-engineering/constitution.md).

- **5.1 pass** → mark Task `pending-qa` in `queue.json` + finalize `progress.txt`. Do NOT set `done` — `done` requires human approval at QA gate (ADR 0018).
- **5.2 fail** → scoped `git restore` UNCOMMITTED leftovers ONLY (never wipe already-merged slices) + mark Task `blocked` in `queue.json` with unmet finding. Committed slices stay; finding rides to human-QA.

---

## Step 6 — defer human-QA

Write `tasks/<id>/qa-signoff.md` ([schema](../../../skills/e2e-engineering/schemas/qa-signoff.md), caveman-ultra): manual test cases to walk, auto-verified ACs to eyeball, staged pending amendments. Do NOT run [human-qa](../../../skills/e2e-engineering/post-impl/human-qa.md) — needs human. `/e2e-engineering` owns human review + replanning.

---

## Step 7 — exit

Emit exactly one plain status as last line: `<e2e-complete />` (no more pickable Task), `<e2e-task-done id="<id>" />` (Task done/blocked, more remain), `<e2e-stall reason="..." />` (needs human). No respawn.

---

## Token hygiene (every spawn)
- caveman-ultra: all prose artifacts (`progress.txt`, `qa-signoff.md`, test-case `.md`). JSON (`prd.json`/`queue.json`) stays schema-bound.
- **Skill files** (SKILL.md, schemas/*.md, sub-skill .md files): maintained in caveman-ultra. Apply when creating or updating any skill doc.
- offset/limit on all reads — only sections needed; never re-read whole file.
- `progress.txt` = single append-only record; status-headed entries; tail for current state.
- docker config + codebase-map: read ONCE in Step 2, never re-read in Steps 3/4.

## Red flags (stop)
- Slice-impl inline instead of sub-agent dispatch (blowup cause — Step 0 forces fan-out; inline = STOP).
- Fallback to inline when `spawn_agent`/`spawn_agents_on_csv` unavailable (stall + exit).
- Fallback to text patches when worker branch commits are unavailable (stall `worker-changes-unavailable`).
- Re-introducing loop / checkpoint / handoff / 65% monitoring (ADR 0022 — gone).
- Running [human-qa](../../../skills/e2e-engineering/post-impl/human-qa.md) headless (write qa-signoff.md instead).
- `git restore` wiping already-merged slices (uncommitted only).
- Marking Task `done` instead of `pending-qa` after self-review passes (Step 5.1 — ADR 0018).
- Marking Task `done` when self-review failed (mark `blocked`).
- Re-reading docker config or codebase-map per-slice (read ONCE in Step 2).
- Staging/committing env/config files in worktree branch (untracked only).
- Touching another Task's `tasks/<id>/` state.
- Passing worktree path to reviewer agents — pass review bundle (artifact package) instead.
