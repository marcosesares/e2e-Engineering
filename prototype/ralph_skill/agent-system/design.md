# Agent System — Design

## Interface

**Entry point:** `ralph.sh [OPTIONS]`

**Command syntax:**
```bash
ralph.sh [--tool amp|claude] [--max-iterations N] [--branch BRANCH]
```

**Options:**
- `--tool`: `amp` (default) or `claude`
- `--max-iterations`: Max loop count (default: 10)
- `--branch`: Feature branch (default: from prd.json.branchName)

**Exit signals:**
- Success: `echo "<promise>COMPLETE</promise>"` from agent
- Failure: Exit code 1 or missing completion signal
- Loop end: All stories completed or MAX_ITERATIONS reached

## Main Loop Flow

```
1. Validate environment (git, prd.json, project code)
2. Parse prd.json
3. LOOP (iteration 1 to MAX_ITERATIONS):
     a. Find story where passes: false AND priority highest
     b. If no story found: break (all done)
     c. Spawn agent with story context
     d. Wait for agent completion signal
     e. If success:
          - Run quality checks (typecheck, lint, test)
          - If checks pass:
               * Commit changes
               * Update prd.json: passes: true
               * Append progress.txt
          - Else:
               * Revert changes
               * Log failure
               * Continue to next iteration (or exit?)
     f. Else: Log failure
4. Report final status
5. Exit
```

## Context Passed to Agent

**Files available to agent:**

| File | Content | Writable by Agent |
|------|---------|------------------|
| `prd.json` | Current PRD + stories + progress | Yes (must update after complete) |
| `progress.txt` | Append-only log of past iterations | Yes (append only) |
| `CLAUDE.md` | Agent instructions | No |
| `project/` | Full codebase | Yes (implement feature) |
| `.git/` | Git history | No (agent commits via CLI) |

**Environment variables (inferred):**
```bash
RALPH_STORY_ID="US-001"
RALPH_BRANCH="ralph/feature-name"
RALPH_TOOL="amp" or "claude"
RALPH_ITERATION=1
RALPH_MAX_ITERATIONS=10
```

## Tool Invocation

### Amp (default)

```bash
amp [STORY_JSON] << 'EOF'
[CONTEXT]
EOF
```

**Input:** Story as JSON + context as stdin
**Output:** Agent response → parse for `<promise>COMPLETE</promise>`

### Claude Code

```bash
claude code [OPTIONS]
# Options depend on Claude Code CLI
```

**Input:** Story + context passed via arguments or stdin
**Output:** Agent response → parse for completion signal

## State Transitions

```
prd.json initial:
{
  "project": "ralph",
  "userStories": [
    { "id": "US-001", "passes": false, "priority": 1 },
    { "id": "US-002", "passes": false, "priority": 2 }
  ]
}

After iteration 1 (US-001 completes):
{
  "project": "ralph",
  "userStories": [
    { "id": "US-001", "passes": true, "priority": 1 },  ← UPDATED
    { "id": "US-002", "passes": false, "priority": 2 }
  ]
}

Iteration 2 picks US-002, and so on.
```

## Progress Logging

**Append to `progress.txt` after successful iteration:**

```
## [ISO 8601 Timestamp] — US-001: [Story Title]
- Implemented: [what was done]
- Files changed: [file1, file2, ...]
- **Learnings for future iterations:**
  - Pattern: [discovered reusable pattern]
  - Gotcha: [what to watch out for]
  - Context: [useful background]
---
```

## Quality Checks

**Executed after agent implementation, before commit:**

```bash
# Example for Node.js project:
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint or equivalent
npm run test         # Jest or equivalent
```

**All must pass; any failure aborts commit.**

## Git Integration

**Before loop starts:**
```bash
git checkout -b [branchName]  # Create feature branch
```

**After each successful iteration:**
```bash
git add -A
git commit -m "feat: [STORY_ID] - [Story Title]"
```

**On failure (quality check):**
```bash
git restore .  # Revert uncommitted changes
```

## Dependencies

- **Bash/Shell:** ralph.sh is bash script
- **Git:** Version control, branching, commits
- **Amp or Claude Code:** Agent execution
- **npm/project package manager:** Quality check commands
- **prd.json, progress.txt files:** Persistent state

## Design Decisions

| Decision | Rationale | Confidence |
|----------|-----------|-----------|
| Fresh agent per iteration | Prevents context drift; forces clear handoff via files | 🟢 |
| File-based state, not database | Git-friendly, auditable, no infrastructure | 🟢 |
| Synchronous loop (wait for agent) | Simpler to reason about; no background task management | 🟢 |
| Quality checks before commit | Prevents broken code on main branch | 🟢 |
| Mandatory completion signal | Explicit handoff; prevent ambiguous success | 🟢 |
| Single story per iteration | Reduces risk; faster feedback loop | 🟢 |

## Risks & Gaps

- 🔴 **Agent crash mid-implementation:** No recovery. Branch left in dirty state.
- 🔴 **Conflict on git push:** ralph.sh doesn't handle merge conflicts.
- 🟡 **Quality check incompleteness:** Some projects may have additional checks (security scan, performance test).
- 🟡 **Parallel execution:** Not supported; only sequential iterations.
- 🔴 **Cost awareness:** No tracking of agent invocations or token usage.
