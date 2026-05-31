# e2e-flight per-spawn process — final design (grill output)

**Status:** Accepted — implemented in `.claude/skills/e2e-flight/SKILL.md`. Decision record: [ADR 0022](../../docs/adr/0022-flight-one-task-per-spawn-no-loop-no-checkpoint.md).
**Date:** 2026-05-31
**Source:** grill-with-docs session against the flight token report. Loop redesign (`prototype/e2e-loop/`) is PARKED — not this design.

## Goal

Kill the token blowup (one Task = 227 turns / 22.3M cache-read) without an external loop or context monitoring. The fix: **flight does one Task per spawn and exits; fan-out is forced so the orchestrator chain stays small.**

## Glossary (pinned this session)

- **TASK** — one `/e2e-flight` spawn unit; one `queue.json` entry; one `tasks/<id>/`.
- **SLICE / sub-task** — one fan-out sub-agent unit; one `prd.json stories[]` entry; one DAG node.
- **Fan-out** — orchestrator dispatches a sub-agent to do a slice (impl wave) or review it (expert wave).
- **Expert agent** — role-prompted reviewer sub-agent (UI designer / backend architect / DBA / senior QA).
- **Forcing mechanism** — bootstrap `ToolSearch`-loads `Agent`+`EnterWorktree`; orchestrator doing slice-impl inline = hard STOP. The thing that guarantees fan-out fires.

## `/e2e-flight` — one task, then exit

```
0. BOOTSTRAP + FORCING MECHANISM
   - ToolSearch-load Agent + EnterWorktree. Unavailable → <stall reason="fanout-unavailable"/> + EXIT.
   - No ralph loop. No context monitoring (no 65%, no gate reset, no handoff/respawn).
   - Orchestrator output = caveman-ultra, essential only.

1. PICK ONE TASK from queue.json
   - dependsOn all done + status todo + highest priority. User may name a task.

2. RECONCILE + READ (offset/limit, read only needed sections)
   - queue.json + tasks/<id>/prd.json (DAG) + tasks/<id>/progress.txt
   2.1 expected structure missing/invalid → "plan it via /e2e-engineering" → EXIT
   2.2 prior task in-progress/stall → "analyze + reconcile first" → EXIT

3. PER-SLICE LOOP  (e2e-flight = orchestrator; inline slice-impl = HARD STOP)
   compute ready set (depends_on all done + status todo)
   FAN-OUT impl sub-agents → parallel worktrees (only disjoint file sets in parallel)
        each runs tdd: gap-check → RED → GREEN → refactor          [GATE 2 hard]
        3-strike → systematic-debugging once → else mark slice blocked  [GATE 3 hard]
   3.2 EXPERT-REVIEW WAVE (in worktree, BEFORE merge; pick experts by sliceType):
        schema/db → DBA + backend architect
        api/logic → backend architect (+ senior QA)
        ui        → UI designer + frontend
        every slice → senior QA (AC coverage)
        review vs PRD + constitution + ARCHITECTURE slice → findings Critical/Important/Minor
        Critical|Important → bounce to impl sub-agent (cap 3 round-trips); Minor → note
   3.3 lint + compile (orchestrator COMMANDS, not agents) → reconcile in branch
   MERGE slice branch → task branch        ← commit happens HERE, per slice
   mark slice status:done in prd.json + append sub-agent summary to progress.txt (the fan-out ledger)
   repeat until DAG drained; unresolved slice → blocked, keep draining the rest

4. e2e QA PHASE (task-level)
   4.1 AUTHOR e2e TC docs (steps + validations + automation backlog)
   4.2 automate e2e TCs              — TODO placeholder   [GATE 4 stubbed, not deleted]
   4.3 green → refactor              — TODO placeholder   [GATE 5 stubbed, not deleted]

5. SELF-REVIEW whole task (acceptanceCriteria + constitution)
   5.1 pass → mark TASK done in queue.json + finalize progress.txt
   5.2 fail → SCOPED git restore (uncommitted leftovers ONLY — never wipe merged slices)
              + mark TASK blocked with the unmet finding + update queue.json

6. HUMAN-QA — write checklist file ONLY: tasks/<id>/qa-signoff.md
   (manual cases, ACs to eyeball, pending amendments). Do NOT run human-qa.
   /e2e-engineering owns the human review + replanning.

7. EXIT with plain human-facing status: done | blocked | stall   (no respawn signals)
```

## Verification stack (interim, until E2E automation lands)

gate 2 (TDD red) · gate 3 (debug escalation) · expert review (C/I bounce, cap 3) · lint + compile · self-review (AC + constitution) · human-QA checklist. Gates 4 (full E2E suite) + 5 (live verification) are explicit `STUBBED — pending automation` placeholders.

## Token hygiene rules

- **caveman-ultra** for every prose artifact the skill writes (`progress.txt`, `qa-signoff.md`, test-case `.md`). NOT JSON (`prd.json`/`queue.json` stay schema-bound).
- **offset/limit reads** everywhere — read only the needed sections, never re-read whole files.
- **`progress.txt` = single append-only record.** Each entry begins with a status header `[HH:MM] T<id>·slice<sid>·<phase/gate>·<state>`; tail it for current state. `flight-status.md` is dropped.
- **Forcing mechanism** keeps the orchestrator chain small — the structural token fix, replacing checkpoints.

## `/e2e-engineering` deltas (companion)

1. **Planning uses expert agents** (UI designer / backend architect / DBA) so the PRD is architecture-aware (standards + ownership rules) before gate 1.
2. Create the task folder + PRD (unchanged shape).
3. **Owns human-QA**: human reviews an implemented task, files follow-up tasks from feedback, plans them via the main flow. Flight only writes the checklist file.

## Boundaries / open items

- Expert agents are defined Claude Code agent types with role prompts (`.claude/agents/`), not ad-hoc prompt roles.
- "Self-review" (step 5) is the orchestrator's own pass over the assembled task; expert review (step 3.2) is the per-slice fresh-eyes pass. Both kept — different altitude.
- No runaway brake survives outside fan-out + inline-STOP. If that proves insufficient in dogfooding, revisit (an external brake would mean reintroducing a thin driver).
