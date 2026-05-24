# e2e-engineering — engineering flow (portable)

Self-contained engineering flow for any agent that reads `AGENTS.md` (Codex, OpenCode, Cursor). Drives a Task from idea to passing E2E. Portable variant of the Claude Code `e2e-engineering` skill — **slices run SEQUENTIALLY here** (no parallel subagent fan-out; that needs Claude Code worktrees). Same phases, same five hard gates, same state files.

When the user says "e2e-engineering", "e2e-eng", "ship-it", "ship it", "implement feature <name>", "write e2e for <feature>", "build this end to end", or "run the full flow", follow this document.

## State files (under `.e2e-engineering/`)
- `prd.json` — structured task state (schema below). You are the sole writer.
- `progress.txt` — append-only learnings log within a task; reset on a new task.
- `codebase-map.md` — brownfield only, scoped to this change.
- `test-cases/*.md` — one per behavior, authored upfront.
- `constitution.md` — coding + testing standards (below). Re-read before each slice.

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

1. **Grill the idea.** Ask ONE question at a time; wait for each answer. Walk the design tree. Recommend an answer per question. If the codebase answers a question, read it instead of asking. Decide which conditional steps fire:
   - map-codebase? → YES if editing existing code (brownfield).
   - research? → YES if external API / unfamiliar lib.
   - prototype? → YES if UX/state-machine uncertainty (throwaway).
2. **map-codebase** (brownfield only) → write `codebase-map.md`, 5 sections: blast-radius modules · seams (where tests attach) · local impact · existing language · refactor candidates **[NOT THIS TASK — walled, never actioned in this task]**.
3. **research** (if needed) → write `research.md` (may rot; version-pin facts).
4. **prototype** (if needed) → throwaway spike; ui (visual) or logic (state machine). Keep the understanding, discard the code.
5. **Write the PRD** → `prd.json`. Refactor-shaped stories allowed (behavior-preservation + structural goal). Capture testing-decisions per story (feature vs regression shape) → these become test-case `.md` files.

**HARD GATE 1 — PRD approved.** Present the PRD. Require explicit human consent before any code. Do not proceed on silence.

---

## Phase 2 — Implementation  (PRD → working code + green tests)

1. **Reconcile language** (once): compare PRD terms + (brownfield) code terms against any project glossary; resolve conflicts before slicing.
2. **Slice + DAG.** Split PRD into vertical slices ordered tracer → schema → logic → api → ui. Encode the ordering as `depends_on` edges. Author test-case `.md` files upfront from testing-decisions; attach `testCases[]` per story. Set every story `status: todo`.

### Sequential slice loop
Repeat until COMPLETE:
1. **Pick the next ready story** — `depends_on` all `done` AND own `status: todo`. Lowest `priority` first. (Single-thread: one at a time, in dependency order. Independent branches still run, just not concurrently.)
2. **Re-read `constitution.md`.** Then for the story:
   - **Gap-check first** — criteria clear? testCases present? deps real? Gap → ask ONE question, do not guess.
   - **RED** — write a failing test for the acceptance behavior. Confirm it fails for the right reason. **HARD GATE 2: no production code before a failing test.**
   - **GREEN** — minimum code to pass.
   - **REFACTOR** — clean up, tests green, stay in scope.
   - **Automate the feature E2E** for this story's feature-shape test-cases.
   - **HARD GATE 3 — debug escalation:** if a fix fails 3 times, STOP blind retries. Do ONE systematic-debugging pass (reproduce → isolate → root-cause → fix). Still red → mark story `blocked`, log in `progress.txt`, move to the next ready story. Escalate to human only on stall (no ready work, or all remaining depend on a blocked story).
3. **Close the slice** — commit/merge to baseBranch, set `status: done`, append a `## Story Log` line + stage durable learnings under `## Pending Amendments` in `progress.txt`.
4. **Checkpoint** if context is getting large: ensure prd.json + progress.txt current, write a handoff note, and resume cleanly next session (read handoff → prd.json → progress.txt → continue).

### After COMPLETE
5. **Regression E2E pass** — now the whole feature exists: automate the regression-shape (cross-slice) test-cases. Run the FULL suite.
   **HARD GATE 4 — E2E suite green** before leaving implementation.
6. **Verify before done** — re-run the FULL suite + actually launch and exercise the app (browser for UI) + tick every PRD acceptance criterion.
   **HARD GATE 5 — verification-before-completion.** If you can't exercise it, say so; don't claim success on tests alone.

---

## Phase 3 — Post-implementation

1. **Fresh-context review** of the WHOLE diff against PRD + constitution. Look for cross-slice issues (duplicated logic, inconsistent abstractions, seam leaks). Rank findings by severity. Blockers → back to the loop.
2. **Human QA** — walk the Manual test-cases (those without an E2E). In the same sitting, the human approves/drops the `## Pending Amendments` → promote survivors into `constitution.md` (bump version). Task done; `progress.txt` resets on the next task.

---

## The five hard gates (never rationalize past these)
1. PRD approved → implementation.
2. Failing test before production code.
3. Debug escalation: 3 strikes → one systematic-debugging pass → else `blocked`; human only on stall.
4. Full E2E suite green → post-implementation.
5. Verification-before-completion (full suite + live exercise + every acceptance criterion).

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
- **Sequential, not parallel** — one slice at a time in dependency order. No worktree fan-out / subagent dispatch.
- **No automatic 65% context hook** — checkpoint by judgment (state files + handoff note).
- Everything else — phases, gates, DAG, TDD, state files, constitution — is identical.
For full-fidelity parallel execution, install the Claude Code skill: `npx e2e-engineering init --target claude`.
