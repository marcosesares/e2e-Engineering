# Ralph — Domain & Business Rules

**Generated:** 2026-05-20  
**Project:** Ralph  
**Confidence Level:** Mixed (🟢 confirmed code behavior, 🟡 inferred from patterns, 🔴 gaps requiring validation)

---

## Domain Overview

Ralph is a **framework for autonomous AI agent loops** that automate software development from Product Requirements Documents (PRDs). The domain is meta: Ralph orchestrates AI agents (Amp or Claude) to implement user stories iteratively.

**Core Players:**
- **User:** Writes PRD and manages the loop via `ralph.sh`
- **AI Agent:** Fresh instance each iteration, implements one story, reports completion
- **State Persister:** git, `prd.json`, `progress.txt` keep agents synchronized across stateless iterations
- **Quality Gate:** Typecheck, lint, test must pass before commit

---

## Glossary

| Term | Definition |
|------|-----------|
| **PRD** | Product Requirements Document (Markdown or JSON) defining what to build |
| **prd.json** | Structured PRD with user stories, each with `id`, `title`, `acceptanceCriteria`, `passes: boolean` |
| **User Story** | Atomic unit of work with acceptance criteria; `passes: false` means "implement next" |
| **Iteration** | One fresh AI agent instance that picks a story, implements it, commits if tests pass |
| **ralph.sh** | Main loop script that spawns fresh agent instances up to `MAX_ITERATIONS` |
| **Tool** | AI backend: `amp` (default) or `claude` (Claude Code) |
| **Branch** | Feature branch from PRD.branchName; each branch may have separate run archive |
| **AGENTS.md** | Consolidated patterns discovered by iterations — preserved for future runs |
| **progress.txt** | Append-only log of what each iteration implemented and learned |
| **Artifact Persistence** | git history, prd.json, progress.txt — agent state is stateless; everything else comes from files |

---

## Core Business Rules

### Rule 1: Single Story Per Iteration 🟢
**Statement:** Each agent iteration picks exactly one user story where `passes: false` (highest priority first) and implements **only that story**.

**Evidence:** CLAUDE.md step 4: "Pick the **highest priority** user story where `passes: false`"  
**Rationale:** Large changes risk test failures and context overflow. Small, focused stories complete faster.  
**Validation:** ralph.sh iteration loop; prd.json checked before spawn.

---

### Rule 2: Commit Only If Quality Checks Pass 🟢
**Statement:** Agent MUST run typecheck, lint, test. If ANY fail, abort — do NOT commit.

**Evidence:** CLAUDE.md step 6: "Run quality checks (e.g., typecheck, lint, test - use whatever your project requires)"  
**Rationale:** Broken code on main blocks all future iterations.  
**Validation:** Enforced by agent instructions; ralph.sh looks for `<promise>COMPLETE</promise>` as exit signal.

---

### Rule 3: Stateless Agent, File-Based Persistence 🟢
**Statement:** Each agent is a **fresh process** with no memory. State persists only via:
- git history (past commits)
- `prd.json` (current story list + which are done)
- `progress.txt` (learnings + patterns from past iterations)

**Evidence:**
- ralph.sh spawns new Amp/Claude instance per loop
- CLAUDE.md points agent to "prd.json", "progress.txt", "CLAUDE.md"
- No database, no server state

**Rationale:** Isolation prevents context drift; files are audit trail.

---

### Rule 4: Tools: Amp or Claude, Default Amp 🟢
**Statement:** ralph.sh accepts `--tool amp` or `--tool claude`. Default is `amp` for backwards compatibility.

**Evidence:** ralph.sh lines 8–34 (argument parsing + validation)  
**Why:** Dual-tool support lets users choose backend. Amp was original; Claude Code added later (commit 8698c3e).  
**Constraint:** Tool choice validated; invalid values rejected.

---

### Rule 5: Branch Isolation & Run Archival 🟢
**Statement:** If `prd.json.branchName` changes between runs, ralph.sh archives the previous run's prd.json + progress.txt.

**Evidence:** ralph.sh lines 42–65 (archive logic)  
**Format:** `archive/YYYY-MM-DD-{branch-name}/`  
**Rationale:** Track multiple parallel efforts; prevent overwrite.

---

### Rule 6: Loop Termination: `<promise>COMPLETE</promise>` Signal 🟢
**Statement:** Agent outputs `<promise>COMPLETE</promise>` when ALL stories have `passes: true`. ralph.sh detects this and exits (success).

**Evidence:** ralph.sh lines 99–104  
**Fallback:** If loop reaches `MAX_ITERATIONS` without COMPLETE, exit with error.

---

### Rule 7: Pattern Consolidation Is Mandatory 🟡
**Statement:** Each iteration MUST update AGENTS.md + CLAUDE.md with patterns discovered. Patterns go into a `## Codebase Patterns` section in progress.txt.

**Evidence:**
- CLAUDE.md: "Update CLAUDE.md files if you discover reusable patterns"
- progress.txt format shows "Learnings for future iterations" section
- Notes in App.tsx (line 75): "Also updates AGENTS.md with patterns discovered"

**Rationale:** 🟡 INFERRED from comments and instructions, not fully enforced by code. Future iterations depend on this.

---

### Rule 8: Acceptance Criteria Must Be Testable 🟡
**Statement:** Each user story's `acceptanceCriteria` array should be verifiable via quality checks (tests, typecheck, lint).

**Evidence:** CLAUDE.md step 6; example in App.tsx note-1: "Typecheck passes", "migration runs"  
**Rationale:** Untestable criteria → agent can't verify completion.  
**Gap:** 🔴 LACUNA — prd.json schema doesn't enforce this; depends on user discipline.

---

### Rule 9: Git-Driven Code Review & History 🟡
**Statement:** Each commit includes commit message `feat: [Story ID] - [Story Title]` (or similar). Ralph trusts git history as audit trail.

**Evidence:** CLAUDE.md step 8: commit message format specified  
**Rationale:** Future iterations + humans can trace why each change was made.  
**Gap:** 🟡 INFERRED — Ralph doesn't enforce commit message format in code; depends on agent discipline.

---

## State Machine: Ralph Execution Lifecycle

### States

```
SETUP
  ├─ User writes PRD (Markdown or prd.json)
  ├─ If Markdown: convert to prd.json (using /prd-to-json skill)
  └─ User runs: ./ralph.sh [--tool amp|claude] [MAX_ITERATIONS]

INITIALIZATION
  ├─ Load prd.json
  ├─ Check if branch changed (archive if yes)
  └─ Initialize progress.txt if missing

LOOP PHASE (i = 1 to MAX_ITERATIONS)
  ├─ Spawn fresh agent (Amp or Claude Code) with:
  │  ├─ CLAUDE.md / prompt.md instructions
  │  ├─ prd.json (for story list)
  │  └─ progress.txt (for past learnings)
  │
  ├─ Agent: Pick story where passes: false
  │
  ├─ Agent: Implement story
  │   ├─ Write code
  │   ├─ Run tests/typecheck/lint
  │   └─ Branch:
  │      ├─ If checks fail → abort (no commit)
  │      └─ If checks pass → commit + update prd.json → log to progress.txt
  │
  ├─ Check OUTPUT for completion signal
  │   ├─ If <promise>COMPLETE</promise> → EXIT SUCCESS
  │   └─ If no signal → continue to next iteration
  │
  └─ sleep 2s → repeat (i+1)

EXIT
  ├─ Success: <promise>COMPLETE</promise> detected + all stories pass: true
  ├─ Timeout: MAX_ITERATIONS reached without COMPLETE → error
  └─ Archive location: archive/{timestamp}-{branch}/
```

### Transitions

| From | Event | To | Condition |
|------|-------|----|-----------| 
| SETUP | User runs ralph.sh | INITIALIZATION | Tool validated, prd.json found |
| INITIALIZATION | Branch changed | INITIALIZATION | Prev run archived |
| LOOP | Story picked | LOOP | passes: false exists |
| LOOP | Implement + tests pass | LOOP | Commit + update prd.json |
| LOOP | <promise>COMPLETE</promise> detected | EXIT SUCCESS | All stories pass: true |
| LOOP | MAX_ITERATIONS reached | EXIT ERROR | No COMPLETE signal |

---

## Permissions & Roles

Ralph is **not RBAC-heavy** — it's a tool, not a multi-tenant system. However, implicit roles exist:

| Role | Permissions | Scope |
|------|------------|-------|
| **User** | Write PRD, run ralph.sh, observe progress | Can trigger loops, manage branches |
| **AI Agent** | Read prd.json, write code, commit, update prd.json | Only via ralph.sh invocation |
| **Developer** | Update CLAUDE.md, AGENTS.md, prd.json schema | Define loop behavior |

**No API keys, database auth, or ACLs needed** — Ralph relies on git auth for commits.

---

## Known Gaps & Constraints 🔴

1. **No prd.json schema validation** — Garbage in, garbage out. Users must follow format.
2. **No maxContextSize enforcement** — Agent could run out of context mid-story.
3. **No inter-story dependencies** — Stories are assumed independent. Ordering is "highest priority first", but no explicit dependency graph.
4. **No rollback mechanism** — If a commit breaks the next iteration, no automatic revert.
5. **Pattern consolidation not enforced** — Agents are instructed to update AGENTS.md but ralph.sh doesn't verify.
6. **No test framework detection** — "Run tests" is generic; ralph.sh doesn't auto-detect pytest, jest, etc.
7. **Archive location is local only** — No remote backup of archived runs.

---

## Integration Points

### External Systems
- **Git:** Version control; used for commits, history, auth
- **GitHub Pages:** Deployment target for flowchart visualization (via GitHub Actions)
- **Amp / Claude Code:** AI backends that run as subprocesses

### Data Stores
- **prd.json:** In-repo JSON file with story list
- **progress.txt:** In-repo append-only log
- **Git history:** Commit messages + diffs
- **archive/:** Local directory tree for previous runs

---

## Examples

### Example 1: Typical Loop Iteration
```
Iteration 3: User story US-002 — "Add export to CSV"
  ✓ Picked as passes: false
  ✓ Implements CSV export in action.ts
  ✓ Adds tests (Jest)
  ✓ All tests pass
  ✓ Commit: "feat: US-002 - Add export to CSV"
  ✓ Updates prd.json: US-002.passes = true
  ✓ Logs to progress.txt: files changed, learnings, gotchas
  ✓ Returns to ralph.sh
  Loop continues (more stories remain)
```

### Example 2: Branch Change → Archive
```
Run 1: prd.json.branchName = "ralph/feature-x"
  ✓ Completes
  
Run 2: User manually changes prd.json.branchName = "ralph/feature-y"
  ✓ ralph.sh detects change
  ✓ Archives: archive/2026-05-20-feature-x/{prd.json, progress.txt}
  ✓ Resets progress.txt for new branch
  ✓ Starts fresh loop on feature-y
```

---

## Validation Checklist

- [ ] All user stories have `id`, `title`, `acceptanceCriteria` (array), `passes` (boolean)
- [ ] PRD references CLAUDE.md or prompt.md (agent instructions)
- [ ] ralph.sh is executable and readable
- [ ] At least one story has `passes: false` before running
- [ ] Project has a quality check command (typecheck, test, lint)
- [ ] Git is configured (commits need author)
- [ ] progress.txt is writable by agent process

