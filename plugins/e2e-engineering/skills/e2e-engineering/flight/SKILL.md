---
name: e2e-flight
description: Headless, driver-run worker that drains the e2e-engineering Task queue unattended. Spawned by an external driver (afk.ps1 / afk.sh) one process per Task-step; saves progress, resets context between steps, advances Task-to-Task on its own, and parks human-QA for a batched sign-off. NOT the human front door — humans type /e2e-engineering, which invokes this at gate-1 approve. Use when the user says "e2e-flight", "/e2e-flight", "flight", "drain the queue", "run the flight loop", or "implement the selected tasks".
---

# e2e-flight — headless Task-drain worker

Sibling to [/e2e-engineering](../SKILL.md). It is interactive + human; this is headless + driver-run. Drains the [Task queue](../schemas/queue.json.md) (`.e2e-engineering/queue.json`) one Task at a time. Read CONTEXT.md for any term. See ADR 0015 (external loop), 0016 (the split), 0017 (queue), 0018 (QA deferral).

**Runs ONE Task-step per process, then exits.** The external driver (the [AFK wrapper](../../../../scripts/afk.ps1)) owns the loop — this skill never loops itself.

---

## Step 0 — E2E_DRIVER guard (FIRST, always)

Read env var `E2E_DRIVER`.

- **UNSET → bootstrap mode.** A bare invocation (a human typed `/e2e-flight`, or `/e2e-engineering` called it at gate-1 approve). The driver isn't running yet.
  1. Ensure the driver exists at `.e2e-engineering/`: if `.e2e-engineering/afk.ps1` (Windows) / `afk.sh` (POSIX) is absent, copy it from the shipped bundle. Resolve the bundle location in order: installed-plugin root (`<plugin>/afk.ps1`, alongside the skill), else source repo `scripts/afk.ps1`. Both are the same script.
  2. Pick by platform: `$IsWindows` → `afk.ps1`, else `afk.sh`.
  3. Launch (blocking, same window): `pwsh -File '.e2e-engineering/afk.ps1'` (or `bash .e2e-engineering/afk.sh`).
  4. Tell the user: "Flight driver running — draining N selected Tasks. Watch progress in `.e2e-engineering/` or the terminal output. This may take a while; the driver will alert you when it’s done."
  5. **Exit.** Do NOT do Task work in this session (no driver env = not a worker).

- **SET (=1) → worker mode.** The driver spawned this. Proceed to bootstrap + one Task-step below.

This guard is also the nesting guard: worker sessions never re-spawn a driver.

---

## Worker bootstrap (E2E_DRIVER=1)

Two-layer fresh-session read — Task-level THEN within-Task (extends [phase-transition](../cross/phase-transition.md)):

1. Read `.e2e-engineering/queue.json`.
2. **Which Task?**
   - A Task has `status:in-progress` → **resume it** (single-in-progress invariant guarantees exactly one). Its dir is `.e2e-engineering/tasks/<id>/`.
   - None in-progress → **pick next**: `selected:true` AND `status:todo` AND every `dependsOn` in {done, pending-qa}, lowest `priority` first. Flip it to `in-progress` in queue.json. This is its first step (no handoff yet).
   - No pickable Task AND none in-progress → all selected work is pending-qa/done/blocked → emit `<e2e-complete stories="N" />` (N = count of selected Tasks) and exit.
   - Selected Tasks remain but ALL are blocked or depend on blocked → emit `<e2e-stall reason="all-selected-blocked" />` and exit.
3. **Within-Task bootstrap** (the existing sequence, rooted at `tasks/<id>/`): handoff-*.md → prd.json → progress.txt. Then continue the e2e-engineering flow for THIS Task.

All per-Task state is under `tasks/<id>/`: `prd.json`, `progress.txt`, `handoff-*.md`, `qa-signoff.md`, `test-cases/`. Sole-writer rule still holds per Task.

---

## One Task-step

Run the e2e-engineering implementation + post-impl-automatable flow for the current Task, scoped to `tasks/<id>/`. The arc per Task:

1. **Impl** — grill-with-docs (once) → to-issues → the in-session slice loop (fan-out/fan-in, gates 2/3). Identical to [/e2e-engineering](../SKILL.md) Implementation phase.
2. **GATE 4** — [e2e-loop](../impl/e2e-loop.md): regression suite, full suite green.
3. **GATE 5 (automatable half)** — [verification](../impl/verification.md): full suite re-run + live exercise via `/run` + `/verify` + auto-tick PRD acceptance criteria. The HUMAN half (manual walk, visual judgment, sign-off) is DEFERRED.
4. **review** — [review](../post-impl/review.md): fresh-context full-diff cross-slice audit.
5. **Defer human-QA** — write `tasks/<id>/qa-signoff.md` ([schema](../schemas/qa-signoff.md)): Manual test cases, auto-verified ACs, staged pending amendments. Set queue `status: pending-qa`. Do NOT run [human-qa](../post-impl/human-qa.md) (needs a human).
6. Emit `<e2e-task-done id="<id>" next="<next-selected-id-or-none>" />` and exit.

### Context resets (within a Task)
Honor the unconditional gate resets (gates 4, 5) and the 65% net exactly as /e2e-engineering does — but instead of "end session" the driver respawns. At each reset/checkpoint: write `tasks/<id>/handoff-*.md` + flush prd.json + progress.txt, then emit `<e2e-checkpoint handoff="..." reason="threshold|gate-N" />` and exit. The driver respawns → worker bootstrap finds this Task still `in-progress` → resumes. (Gate 1 reset does not apply — flight never runs pre-impl.)

---

## Signals (this skill emits → driver acts)

| Signal | When | Driver |
|---|---|---|
| `<e2e-checkpoint handoff="..." reason="threshold\|gate-N" />` | 65% or gate 4/5 reset, Task unfinished | respawn → resume same Task |
| `<e2e-task-done id="..." next="..." />` | Task → pending-qa, more selected remain | respawn → next Task |
| `<e2e-stall reason="..." />` | no ready work / all selected blocked / needs human | stop, alert human |
| `<e2e-complete stories="N" />` | no selected Task todo/in-progress | stop, success |

Emit exactly ONE terminal signal per process, as the last output line.

---

## Red flags (stop)
- Doing Task work with `E2E_DRIVER` unset (you're a bootstrap invocation — launch the driver and exit).
- Running [human-qa](../post-impl/human-qa.md) headless (it needs a human — defer to qa-signoff.md).
- Looping over multiple Tasks in one process (one Task-step per process; the driver loops).
- Marking a Task `done` (only the QA sign-off session does that; flight stops at `pending-qa`).
- Re-spawning a driver from a worker session (the guard forbids it; nesting).
- Touching another Task's `tasks/<id>/` state (only the current in-progress Task).
