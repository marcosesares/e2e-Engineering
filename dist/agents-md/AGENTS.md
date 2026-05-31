# e2e-engineering — engineering flow (portable)

Self-contained engineering flow for any agent that reads `AGENTS.md` (Codex, OpenCode, Cursor). Drives a Task from idea to passing E2E. Portable variant of the Claude Code `e2e-engineering` skill — **slices run SEQUENTIALLY here** (no parallel subagent fan-out; that needs Claude Code worktrees). Same phases, same hard gates (gates 4 & 5 stubbed pending E2E automation — ADR 0022), same state files. No context monitoring / checkpoint (ADR 0022).

When the user says "e2e-engineering", "e2e-eng", "ship-it", "ship it", "implement feature <name>", "write e2e for <feature>", "build this end to end", or "run the full flow", follow this document.

## State files (under `.e2e-engineering/`)
- `prd.json` — structured task state (schema below). You are the sole writer.
- `progress.txt` — append-only learnings log within a task; reset on a new task.
- `codebase-map.md` — brownfield only, scoped to this change.
- `test-cases/*.md` — one per behavior, authored upfront.
- `constitution.md` — coding + testing standards (below). Re-read before each slice.

Write every artifact to its final location directly — never to a temp/base spot and copy later (that leaves dirty duplicates).

## prd.json schema
```json
{ "project": "", "description": "", "taskType": "greenfield|feature|bugfix|refactor",
  "baseBranch": "", "stories": [
    { "id": "", "title": "", "description": "", "acceptanceCriteria": [],
      "priority": 0, "sliceType": "tracer|schema|logic|api|ui",
      "depends_on": [], "status": "todo|done|blocked",
      "branch": "", "testCases": [], "notes": "" } ] }
```
COMPLETE = every story `status: "done"`.

---

## Phase 1 — Pre-implementation  (idea → approved PRD)

1. **map-codebase FIRST** (brownfield only — editing existing code) → write `codebase-map.md`, 5 sections: blast-radius modules · seams (where tests attach) · local impact · existing language · refactor candidates **[NOT THIS TASK — walled, never actioned in this task]**. Runs before grilling so your questions are informed by what already exists. Greenfield skips this.
2. **Grill the idea (doc-aware).** First read what exists — `codebase-map.md` (brownfield), any project glossary / architecture notes — so you never ask what the code already answers. Then ask ONE question at a time; wait for each answer. Walk the design tree. Recommend an answer per question. Reconcile terminology AS YOU GO: when a term clashes with the code's or glossary's existing term, surface it and pin ONE canonical term. Decide which remaining conditional steps fire:
   - research? → YES if external API / unfamiliar lib.
   - prototype? → YES if UX/state-machine uncertainty (throwaway).
3. **research** (if needed) → write `research.md` (may rot; version-pin facts).
4. **prototype** (if needed) → throwaway spike; ui (visual) or logic (state machine). Keep the understanding, discard the code.
5. **Write the PRD** → `prd.json`. Make it architecture-aware — respect the project's ownership/naming rules (which seams to extend, which components to reuse) so the spec is right before gate 1. Refactor-shaped stories allowed (behavior-preservation + structural goal). Capture testing-decisions per story (feature vs regression shape) → these become test-case `.md` files.

**HARD GATE 1 — PRD approved.** Present the PRD. Require explicit human consent before any code. Do not proceed on silence.

---

## Phase 2 — Implementation  (PRD → working code + green tests)

1. **Slice + DAG.** (Language was already reconciled during the doc-aware grill — don't re-grill.) Split PRD into vertical slices ordered tracer → schema → logic → api → ui. Encode the ordering as `depends_on` edges. Author test-case `.md` files upfront from testing-decisions; attach `testCases[]` per story. Set every story `status: todo`.

### Sequential slice loop
Repeat until COMPLETE:
1. **Pick the next ready story** — `depends_on` all `done` AND own `status: todo`. Lowest `priority` first. (Single-thread: one at a time, in dependency order. Independent branches still run, just not concurrently.)
2. **Re-read `constitution.md`.** Then for the story:
   - **Gap-check first** — criteria clear? testCases present? deps real? Gap → ask ONE question, do not guess.
   - **RED** — write a failing test for the acceptance behavior. Confirm it fails for the right reason. **HARD GATE 2: no production code before a failing test.**
   - **GREEN** — minimum code to pass.
   - **REFACTOR** — clean up, tests green, stay in scope.
   - **Author the feature E2E test-case doc** for this story (steps + validations). Automating it is stubbed (see gate 4).
   - **HARD GATE 3 — debug escalation:** if a fix fails 3 times, STOP blind retries. Do ONE systematic-debugging pass (reproduce → isolate → root-cause → fix). Still red → mark story `blocked`, log in `progress.txt`, move to the next ready story. Escalate to human only on stall (no ready work, or all remaining depend on a blocked story).
3. **Close the slice** — commit to baseBranch, set `status: done`, append a `## Story Log` line + stage durable learnings under `## Pending Amendments` in `progress.txt`.

No checkpoint, no handoff, no context monitoring (ADR 0022). A fresh session resumes by reading state: `prd.json` (which slices done/todo/blocked) → `progress.txt` (tail for current state) → continue.

### After COMPLETE
4. **Regression E2E docs** — now the whole feature exists: author the regression-shape (cross-slice) test-case docs.
   **GATE 4 — full E2E suite green — STUBBED, pending automation (ADR 0022, not deleted).** Authoring the docs is the live step; running an automated suite is a TODO. Interim verification = self-review + human-QA checklist.
5. **Verify before done** — tick every PRD acceptance criterion against the code.
   **GATE 5 — verification-before-completion — STUBBED, pending automation.** The full-suite re-run + live app exercise are a TODO while automation is stubbed. Interim: self-review against acceptance criteria + human-QA checklist. If you can't exercise it, say so; don't claim success on tests alone.

---

## Phase 3 — Post-implementation

1. **Fresh-context review** of the WHOLE diff against PRD + constitution. Look for cross-slice issues (duplicated logic, inconsistent abstractions, seam leaks). Rank findings by severity. Blockers → back to the loop.
2. **Human QA** — walk the Manual test-cases (those without an E2E). In the same sitting, the human approves/drops the `## Pending Amendments` → promote survivors into `constitution.md` (bump version). Task done; `progress.txt` resets on the next task.

---

## The hard gates (never rationalize past these)
1. PRD approved → implementation.
2. Failing test before production code.
3. Debug escalation: 3 strikes → one systematic-debugging pass → else `blocked`; human only on stall.
4. Full E2E suite green → post-implementation. **[STUBBED — pending E2E automation (ADR 0022); author the TC docs now, run the suite when automation lands.]**
5. Verification-before-completion (full suite + live exercise + every acceptance criterion). **[STUBBED — pending automation; interim = self-review against acceptance criteria + human-QA checklist.]**

Soft gates (coverage/lint/style): overridable WITH a logged reason; silent skip not allowed.

---

## constitution.md (coding + testing standards — re-read before each slice)

**Coding (karpathy):**
1. Think before coding — unclear assumptions → ask; multiple interpretations → present all; simpler approach → push back.
2. Simplicity first (new code) — fewest lines that satisfy the goal; no speculative abstraction.
3. Surgical changes (editing) — touch only lines tracing to the request; match existing style; remove only orphans your own change created; no "while I'm here".
4. Goal-driven — turn the task into a verifiable goal; verify each step; done = verified, not "written".

**Testing (qa):**
1. Real-interface interaction — drive via UI clicks / real HTTP, not internal state.
2. Diagnosable failures — no silent catch; assert observable behavior.
3. No hardcoded sleeps — wait on conditions.
4. Scope discipline — test + fix stay in the story's scope; surface stray issues as refactor candidates.
5. Readability over defensive coding in test code.
6. Assert behavior, not implementation — survives a behavior-preserving refactor.

---

## What's different from the Claude Code version
- **Sequential, not parallel** — one slice at a time in dependency order. No worktree fan-out / subagent dispatch / expert-review agents (those need Claude Code).
- **No context monitoring / checkpoint** — a session resumes by reading state files (ADR 0022); there is no 65% hook and no handoff doc.
- **Gates 4 & 5 stubbed** — pending E2E automation, project-wide (ADR 0022). Everything else — phases, gates 1–3, DAG, TDD, state files, constitution — is identical.
For full-fidelity parallel execution + the expert-review wave, install the Claude Code skill (`/e2e-flight`, one Task per spawn — ADR 0022): `npx e2e-engineering init --target claude`.
