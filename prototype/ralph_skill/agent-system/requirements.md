# Agent System — Requirements

## Overview

Ralph's autonomous agent orchestration framework that spawns fresh AI agent instances per iteration, drives feature implementation from PRDs, and manages state persistence via git, prd.json, and progress.txt. Core loop: pick unfinished story → implement → test → commit → update PRD → log learnings.

## Responsibilities

- Spawn fresh agent instances (Amp or Claude) with deterministic command-line invocation
- Feed agent context (prd.json, progress.txt, CLAUDE.md, project code) on each iteration
- Run quality gates (typecheck, lint, test) inside the **agent** before commit (ralph.sh does NOT execute them)
- Parse agent output for **completion sentinel** `<promise>COMPLETE</promise>` — no other parsing
- Append learnings to progress.txt (agent-owned)
- Manage branch state and git operations (agent-owned, per CLAUDE.md step 3)
- Support tool selection (amp or claude; amp default)
- Limit iterations to prevent runaway loops (MAX_ITERATIONS)
- **Fail-forward on agent crash:** non-zero exit ignored (`|| true` in ralph.sh L92, L95); next iteration re-reads `prd.json` and re-picks highest-priority unfinished story

**Out of scope for ralph.sh (delegated to agent per CLAUDE.md):**
- Writing `prd.json` (agent owns the `passes: true` mutation — see Q1 resolution in `questions.md`)
- Reverting failed changes (no auto-rollback; partial commits remain in branch history for human review)
- Validating branch name format (enforced upstream at PRD creation by `skills/prd/SKILL.md`)

## Business Rules

- Exactly ONE user story per agent iteration 🟢
- Story MUST be completed before agent exits (no partial work) 🟢
- Agent picks highest-priority story where `passes: false` 🟢
- Quality gates (typecheck, lint, test) are non-negotiable 🟢
- All changes committed to feature branch (not main) 🟢
- State persists via: git history + prd.json + progress.txt 🟢
- Agents are stateless; all context from files 🟢
- Tool choice affects command syntax; default is amp 🟢
- MAX_ITERATIONS enforced to prevent infinite loops 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| RF-01 | Parse prd.json and extract stories | Must | Read valid prd.json; identify all stories with passes: false |
| RF-02 | Pick highest-priority story | Must | Select story with lowest priority ID (US-001 before US-002) |
| RF-03 | Spawn agent with context | Must | Pass prd.json, progress.txt, CLAUDE.md, project code to agent; agent can access via file paths |
| RF-04 | Support Amp tool (default) | Must | Spawn Amp instance with story details; wait for completion signal |
| RF-05 | Support Claude Code tool | Should | Spawn Claude Code instance as alternative; same interface as Amp |
| RF-06 | Run quality checks | Must | Execute typecheck, lint, test commands; fail if any check fails |
| RF-07 | Detect completion sentinel | Must | `ralph.sh` greps stdout for `<promise>COMPLETE</promise>` (line 99). On match: exit 0 with success message. On absence: continue loop until MAX_ITERATIONS. **Agent output format beyond sentinel is NOT parsed.** |
| RF-08 | Agent owns prd.json mutation | Must | After story completes, the **agent** (not ralph.sh) writes `passes: true` to `prd.json`. `ralph.sh` only reads `branchName` (lines 44, 69). Source of truth: CLAUDE.md step 9. |
| RF-09 | Agent appends to progress.txt | Must | Agent logs story ID, files changed, learnings. `ralph.sh` only initializes the file when missing (lines 76-80). |
| RF-10 | Enforce MAX_ITERATIONS limit | Should | Stop loop after N iterations; default 10 (ralph.sh L9). Exit 1 with "did not complete" message. |
| RF-11 | Handle tool selection | Should | Accept `--tool amp` or `--tool claude` CLI flag; reject unknown tools (lines 32-35). |
| RF-12 | Fail-forward on agent crash | Must | Agent non-zero exit is swallowed (`|| true`, lines 92, 95). Loop continues; partial commits remain in branch for human review. **No auto-revert.** |
| RF-13 | Display progress in terminal | Could | `tee /dev/stderr` already streams full agent output to operator (lines 92, 95). Iteration banner printed each loop. |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----|---|
| Reliability | Agent-side quality gates + CI redundancy. Agent runs typecheck/lint/test locally; CI re-runs them as enforced gate (see `ci-cd/` specs). Defense in depth. | CLAUDE.md "Quality Requirements" section; `.github/workflows/deploy.yml` (target state, see Q3). | 🟢 |
| Recovery | Fail-forward model: agent crash → loop continues → next iteration re-picks highest-priority unfinished story. No auto-revert. | `ralph.sh` L92, L95: `OUTPUT=... \|\| true` swallows non-zero exits. Loop has no rollback branch. | 🟢 |
| Determinism | Same PRD + tool + codebase = reproducible **within agent non-determinism**. Fresh spawn per iteration with identical file context. | Agents are stateless; all context from disk. | 🟢 |
| Auditability | All decisions logged to `progress.txt` + `git log` + `prd.json` history. `ralph.sh` `tee /dev/stderr` for operator visibility. | File-based state; git preserves all mutations. | 🟢 |
| Performance | Agent spawn overhead ~1-5 seconds (tool startup time). Per-iteration timeout: **not enforced** — future enhancement. | Depends on Amp/Claude init time; ralph.sh does not bound iteration runtime. | 🟡 |
| Scalability | Supports PRDs with 1-20 stories (MVP); beyond 20 requires story decomposition. | MAX_ITERATIONS default 10 (ralph.sh L9); user-overridable via CLI arg. | 🟡 |

## Acceptance Criteria

```gherkin
Scenario: Execute single iteration
  Given prd.json with 3 stories (US-001 passes: false, US-002 passes: true, US-003 passes: false)
  When ralph.sh executes
  Then agent spawned with US-001 context
  And agent implements story
  And quality checks pass
  And prd.json updated: US-001 passes: true
  And progress.txt appended with learnings

Scenario: Agent failure (quality check fails inside agent)
  Given agent modifies code that breaks typecheck
  When the agent runs its quality checks (per CLAUDE.md)
  Then the agent does NOT commit
  And the agent does NOT update prd.json (passes remains false)
  And the agent exits without emitting <promise>COMPLETE</promise>
  And ralph.sh continues to next iteration (fail-forward)
  And next iteration re-picks the same story (still passes: false)

Scenario: Agent crash mid-iteration
  Given agent process dies (timeout, OOM, network)
  When ralph.sh receives non-zero exit
  Then exit code is swallowed by `|| true` (lines 92, 95)
  And ralph.sh logs "Iteration N complete. Continuing..."
  And next iteration spawns fresh agent
  And any partial commits made before crash REMAIN in branch (for human review)
  And no auto-revert is performed

Scenario: CI catches agent oversight
  Given agent commits code that fails lint but agent did not run lint
  When CI workflow runs on push
  Then npm run lint fails in CI (per ci-cd/ specs)
  And main branch deployment is blocked
  And operator is notified via GitHub Actions UI

Scenario: Tool selection
  Given `ralph.sh --tool claude`
  When script executes
  Then Claude Code agent spawned (not Amp)
  And story completed via Claude

Scenario: Loop termination
  Given prd.json with 5 stories, MAX_ITERATIONS = 3
  When ralph.sh completes 3 iterations (3 stories done)
  Then script exits normally
  And message: "Completed 3/5 stories. Run again to continue"

Scenario: Final completion
  Given all stories in prd.json have passes: true
  When ralph.sh checks prd.json
  Then no story selected
  And message: "All stories complete! 🎉"
  And script exits with success
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|---|---|---|
| Spawn agent + pick story | Must | Core loop; without this, framework doesn't work |
| Quality gates | Must | Prevents broken code; critical for unattended execution |
| Update prd.json on success | Must | State persistence; next iteration knows what's done |
| Tool selection (Amp/Claude) | Should | Amp is default; Claude support is nice-to-have but not blocking |
| Progress logging | Should | Important for debugging; not blocking if missing |
| Iteration limit | Should | Prevents runaway; useful for safety but not strictly necessary |

## Code Traceability

| File | Function / Script | Coverage |
|-----|-----------------|----------|
| `ralph.sh` | Main loop | 🟢 |
| `ralph.sh` | Argument parsing (--tool) | 🟢 |
| `CLAUDE.md` | Agent context and instructions | 🟢 |
| `prd.json` | Story state | 🟢 |
| `progress.txt` | Iteration log | 🟢 |
| `.git` | History persistence | 🟢 |

## Resolved Gaps (was 🔴, now 🟢 after user validation 2026-05-19)

- ✅ **Agent failure recovery:** Resolved — fail-forward (Q4). No rollback; loop continues; next iteration re-picks story. See RF-12 and acceptance scenarios.
- ✅ **prd.json update responsibility:** Resolved — agent owns it (Q1). ralph.sh only reads `branchName`. See RF-08.
- ✅ **Agent output format:** Resolved — minimal sentinel `<promise>COMPLETE</promise>` (Q7). All other state lives in commits + `progress.txt`. See RF-07.
- ✅ **CI quality gates:** Resolved — CI runs lint + test as enforced redundancy (Q3). See `ci-cd/requirements.md` RF-11/RF-12.

## Outstanding Gaps (🟡 — non-blocking, future enhancements)

- **Parallel execution:** Can multiple agents run concurrently? Currently sequential only (one per iteration).
- **Conflict resolution:** If two users push to same branch, how does ralph.sh handle merge conflicts?
- **Per-iteration timeout:** No bound on agent runtime. A hung agent blocks the loop until human intervention.
- **Cost tracking:** No tracking of agent usage (tokens, API calls, cost).
