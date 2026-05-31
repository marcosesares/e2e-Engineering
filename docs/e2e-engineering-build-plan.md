# e2e-engineering — Build Plan (handoff for fresh session)

> **Historical build record — amended by [ADR 0022](adr/0022-flight-one-task-per-spawn-no-loop-no-checkpoint.md) (2026-05-31).** The skill/sub-skill layout, schemas, and provenance below are still broadly accurate. REMOVED since: the in-session loop, the 65% checkpoint, the `cross/` files (`context-checkpoint.md`, `phase-transition.md`), and gate-boundary resets. Implementation now runs in [/e2e-flight](../.claude/skills/e2e-flight/SKILL.md) — one Task per spawn, no loop, no context monitoring; fan-out to slice + expert sub-agents is the only iteration. Gates 4 & 5 are STUBBED (pending E2E automation). For current truth read CONTEXT.md + ADR 0022.

Design FROZEN. This doc = what to build. Read order before building:
1. `CONTEXT.md` (glossary, ~30 terms)
2. `docs/adr/0001`–`0012` (every fork + why)
3. auto-memory `project_e2e_engineering.md` (decisions + provenance + schemas)

## Goal
Build the e2e-engineering skill: master orchestrator + sub-skills composing best-of 7 prototypes. Idea→e2e. Greenfield + brownfield + adopt.

## File layout to create
```
.claude/skills/e2e-engineering/
  SKILL.md                 # orchestrator: phase+taskType detect, mode route, 5 gates (4/5 stubbed)
  constitution.md          # karpathy coding + qa testing principles (injected into every slice subagent)
  pre-impl/
    grill-me.md            # Karpathy brainstorm loop; gates research/prototype/map-codebase
    map-codebase.md        # brownfield, conditional; codebase-map.md 5 sections; candidates WALLED
    research.md            # conditional; research.md (rots)
    prototype.md           # conditional; ui-branch + logic-branch
    to-prd.md              # full PRD; refactor-shaped stories allowed; testing-decisions -> test-cases
  impl/
    grill-with-docs.md     # ONCE at entry (language reconcile)
    to-issues.md           # vertical slices + depends_on DAG; attach testCases[]; born ready-for-agent
    triage.md              # 5-state; external work + refactor candidates only
    tdd.md                 # SLICE SUBAGENT: gap-check -> red-green-refactor -> automate FEATURE e2e; return summary only
    systematic-debugging.md# 4-phase; 3-strike re-dispatch
    e2e-loop.md            # FINAL pass: automate REGRESSION (cross-slice) e2e
    verification.md        # gate5; wire /run + /verify + PRD criteria checklist
  post-impl/
    review.md              # fresh-context full-diff cross-slice audit
    human-qa.md            # Manual test-cases script + approve pending amendments (single chokepoint)
  # cross/ REMOVED (ADR 0022): no 65% checkpoint, no phase-transition reset
  schemas/                 # OR document inline in SKILL.md
    prd.json.md            # schema below
    progress.txt.md        # schema below
    codebase-map.md        # 5-section template
```

## Schemas (held out of CONTEXT.md = glossary-only)

prd.json:
```
{ project, description,
  taskType: greenfield|feature|bugfix|refactor,
  baseBranch,
  stories: [{ id, title, description, acceptanceCriteria[],
    priority, sliceType: tracer|schema|logic|api|ui,
    depends_on: [ids], status: todo|done|blocked,
    branch, testCases: [ids], notes }] }
```
COMPLETE = all status==done.

progress.txt (caveman:ultra, sole-writer=orchestrator, resets per task):
```
## Story Log        # per fan-in: id | summary | files | learnings
## Pending Amendments  # staged for constitution; cleared at human-QA gate
## Blocked          # id | why | last 4-phase diagnosis
```

codebase-map.md (brownfield, sprint-lifetime, rots):
```
## Blast-radius modules
## Seams            # where tests attach
## Local impact
## Existing language # -> grill-with-docs reconcile
## Refactor candidates  [NOT THIS TASK]  # walled: triage->new task, NOT in slice-subagent ctx
```

## 5 HARD gates (need human consent)
1 PRD approved -> impl · 2 TDD red before green · 3 debug escalate (3 strikes -> systematic-debugging -> blocked -> stall->human) · 4 E2E suite green **[STUBBED — ADR 0022]** · 5 verify-before-completion **[STUBBED — ADR 0022]**
SOFT (override+log): coverage/lint/style.

## Per-Task drain (flight IS the orchestrator, ADR 0022 — no loop, no checkpoint)
ready set (deps satisfied & status:todo) -> FAN-OUT to worktree subagents (+constitution) -> each: gap-check, TDD, feature-e2e, return SUMMARY -> FAN-IN (orchestrator sole writer): per-slice expert-review, merge, status:done, append progress.txt -> repeat until DAG drained -> e2e-loop (regression authoring; gate 4 stubbed) -> self-review -> defer human-QA. One Task per `/e2e-flight` spawn, then exit; re-invoke for the next.

## Entry modes
- phase-adaptive: greenfield/feature/bugfix/refactor (refactor = FULL flow, ADR 0012)
- `adopt`: legacy onboarding — auto-DRAFT docs (human review) + repo-wide refactor backlog; code NEVER auto-refactored (ADR 0011)

## Build order
1. constitution.md + schemas (foundational)
2. SKILL.md orchestrator (phase/taskType detect, mode route, loop, gates, checkpoint)
3. sub-skills by phase (pre -> impl -> post -> cross)
4. adopt mode
5. caveman:ultra for all internal files; user conversation caveman:full

## Provenance (best-of-each)
mattpocock: grill/prd/issues/triage/tdd/review/handoff · karpathy: constitution coding · ralph: prd.json/progress.txt/checkpoint/COMPLETE->status:done · superpowers: gates/subagent-dispatch/debugging/worktrees/verify/review · qa: principles + .md test-cases + disposition · spec_kit: constitution + DAG fan-out · playwright: e2e reference.
REJECTED: ralph.sh, inline executing-plans, ADO/Jira/subtree, presets/catalog, full C4/ERD/matrices.
```
