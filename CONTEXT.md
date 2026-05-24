# ship-it

## Language

**ship-it**: Master orchestrator skill. Detects current phase, sequences sub-skills, loops until all exit conditions met.
_Avoid_: "engineering flow", "dev loop", "full pipeline"

**Task**: Atomic unit of business intent that owns its own `prd.json` + `progress.txt`. New task = reset both files. Within a task, progress.txt is append-only.
_Avoid_: "project", "feature" (ambiguous scope)

**Phase**: One of three meta-stages a task moves through — Pre-implementation, Implementation, Post-implementation. Each phase has its own loop and exit condition.
_Avoid_: "step", "stage" (used loosely elsewhere)

**Pre-implementation**: Phase covering Idea → Research → Prototype → PRD. Exit condition: user approval.

**Implementation**: Phase covering Planning → Execution (vertical slices). Exit condition: TDD green + all stories `passes: true` + E2E passing.

**Post-implementation**: Phase covering code review + human QA. Entry condition: implementation loop already exited with E2E green.

**Goal**: Atomic unit of work inside a loop iteration. One goal = one agent run.
_Avoid_: "task" (reserved for business-level unit), "story" (implementation-phase specific)

**Loop**: Phase-specific iteration mechanism. Each phase has exactly one loop type — Karpathy brainstorm loop (pre-impl), vertical slice TDD loop (impl), review loop (post-impl).

**Checkpoint**: Snapshot saved when context reaches 65%. Three files: handoff doc (narrative), `prd.json` (structured state), `progress.txt` (append-only learnings). Written in caveman:ultra.

**Phase transition**: Ralph-pattern mechanism for starting a fresh session at phase boundary. Saves checkpoint, clears context. Fresh session read order: handoff doc → `prd.json` → `progress.txt` → invoke suggested skill.

**Fresh session bootstrap**: Sequence a restarted session must follow before any work — read handoff doc first (self-contained primer: domain language, current state, next action, artifacts, suggested skill), then `prd.json`, then `progress.txt`, then invoke the suggested skill.
_Avoid_: reading `CONTEXT.md` first (handoff doc already contains domain language summary; full glossary pulled on-demand via path reference)

**E2E gate**: Condition requiring E2E tests passing before implementation loop exits. Tests generated in project's language stack (not assumed TypeScript).

**grill-me**: Pre-implementation brainstorm sub-skill. Stateless, one question at a time, no external doc dependencies. Loops until user approves.
_Avoid_: confusing with "grill-with-docs" (grill-with-docs requires existing docs; grill-me does not)

**Vertical slice**: Implementation unit ordered by: tracer bullet → schema → business logic → API → UI. One slice per loop iteration.

## Relationships

- **ship-it** detects entry **Phase** and sequences sub-skills
- **Task** owns one `prd.json` and one `progress.txt`; resets both on new task
- **Phase** contains exactly one **Loop**
- **Loop** iterates over **Goals**; exits when exit condition met
- **Checkpoint** saves at 65% context within any **Phase**
- **Phase transition** saves **Checkpoint** then starts fresh session
- **E2E gate** is exit condition for **Implementation** loop (not just post-impl)
- **grill-me** drives **Pre-implementation** loop; output = caveman:ultra notes handed to **to-prd**
- **to-prd** converts grill-me notes into formal PRD; owns its own interview step (no double-interview)
- **grill-with-docs** drives **Implementation** loop start (CONTEXT.md + ADRs already exist at this point)
- **Fresh session bootstrap** sequence applies to both phase transitions AND mid-phase context restarts

## Flagged ambiguities

- "task" vs "goal" — task = business unit (owns files), goal = loop-level work unit. Never swap.
- "E2E" scope — E2E tests are both implementation loop exit gate AND post-impl verification artifact. Not post-impl only.
- "progress.txt append-only" — true within a task; reset when new task begins.
