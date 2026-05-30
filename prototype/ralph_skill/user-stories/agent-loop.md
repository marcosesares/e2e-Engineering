# User Story: Autonomous Agent Loop

## Overview

Enable users to automate feature implementation by orchestrating fresh AI agent instances (Amp or Claude) that iteratively pick, implement, test, and commit user stories from a PRD (Product Requirements Document).

## Actor

- **Primary:** Software developer managing multiple feature requests
- **Secondary:** Product manager coordinating feature rollout

## Context

User has:
1. Written a PRD in markdown or JSON (via `/prd` skill or manual creation)
2. Stored PRD in `prd.json` with user stories and acceptance criteria
3. Access to a git repository with a clean working directory
4. Amp or Claude Code installed and authenticated

User wants to:
- Automate repetitive task of picking story → code → test → commit
- Enable unattended execution (run overnight, come back to finished work)
- Maintain audit trail (git history, progress.txt)
- Understand what agent implemented and why

## Business Value

| Benefit | Impact |
|---------|--------|
| **Time savings:** 1 developer-hour → agent finishes while developer sleeps | High |
| **Consistency:** Agent follows same CLAUDE.md instructions every iteration | High |
| **Audit trail:** Git commits + progress.txt document all decisions | Medium |
| **Flexibility:** Support Amp and Claude backends; easy to add more tools | Medium |

## Acceptance Criteria

```gherkin
Scenario: Execute single agent iteration
  Given a valid prd.json with 3 user stories (all with passes: false)
  And developer has run `ralph.sh` on main branch
  When loop completes 1 iteration
  Then:
    - Agent spawned with story context (CLAUDE.md, progress.txt, project code)
    - Agent implements user story (code changes in working directory)
    - Agent runs quality checks: typecheck, lint, test
    - All checks pass
    - Agent outputs "<promise>COMPLETE</promise>" signal
    - ralph.sh detects signal and commits changes: "feat: US-001 - [title]"
    - prd.json updated: first story's passes set to true
    - progress.txt appended with: story ID, files changed, learnings
    - Working directory clean, branch reflects commit

Scenario: Multiple iterations (loop)
  Given prd.json with 5 stories
  When developer runs `ralph.sh --max-iterations 5`
  Then:
    - Loop executes 5 times
    - Iteration 1: US-001 completed (passes: true)
    - Iteration 2: US-002 completed (passes: true)
    - ... (iterations 3-5 similar)
    - All commits in feature branch
    - progress.txt contains all 5 entries
    - Final message: "Completed 5/5 stories! 🎉"

Scenario: Quality check failure
  Given agent implements story with broken code
  When quality checks run (typecheck, lint, test)
  Then:
    - At least one check fails (e.g., TypeScript compilation error)
    - ralph.sh detects failure
    - Changes NOT committed
    - prd.json NOT updated (passes still false)
    - progress.txt NOT appended
    - Loop continues to next iteration OR exits (configurable)

Scenario: Tool selection
  Given user prefers Claude Code over default Amp
  When developer runs `ralph.sh --tool claude`
  Then:
    - Claude Code agent spawned instead of Amp
    - Same iteration logic (implement → test → commit → update prd.json)
    - Result identical to Amp execution

Scenario: User review of completed work
  Given loop completed 3 stories
  And user navigates to feature branch in git
  When user runs `git log --oneline`
  Then:
    - 3 new commits visible: "feat: US-001 - ...", "feat: US-002 - ...", "feat: US-003 - ..."
    - `git show US-001-commit` shows agent's code implementation
    - progress.txt available in git history (auditable learnings)
    - User can review, edit, or request changes before merge to main

Scenario: Partial completion (MAX_ITERATIONS)
  Given prd.json with 10 stories
  When developer runs `ralph.sh --max-iterations 3`
  Then:
    - Loop runs exactly 3 times (stories US-001, US-002, US-003 completed)
    - After iteration 3: "Completed 3/10 stories. Run again to continue."
    - User can re-run ralph.sh to complete remaining 7 stories
    - No conflicts or state corruption between runs
```

## Key Flows

### Flow 1: First-Time Setup
```
1. Developer runs `ralph.sh` for first time
2. Script validates: git, prd.json, project code, CLAUDE.md present
3. Creates feature branch (from prd.json.branchName)
4. Enters loop iteration 1
```

### Flow 2: Successful Story Completion
```
1. Script identifies story where passes: false (highest priority)
2. Spawns agent with story context
3. Agent implements code (modifies files)
4. Agent runs: typecheck, lint, test (all pass)
5. Agent emits: "<promise>COMPLETE</promise>"
6. Script detects signal
7. Commits: git commit -m "feat: US-001 - [title]"
8. Updates: prd.json → passes: true
9. Appends: progress.txt with learnings
10. Loop continues to next story
```

### Flow 3: Story Failure (Quality Check)
```
1. Agent implements code
2. Typecheck/lint/test fails
3. Script reverts changes: git restore .
4. Does NOT commit
5. Does NOT update prd.json
6. Continues to next story (or exits, configurable)
```

## Non-Functional Requirements

| Requirement | Target | Confidence |
|---|---|---|
| Loop execution time | 1-10 min per story (agent startup + implementation) | 🟡 |
| State consistency | prd.json + git history always in sync | 🟢 |
| Auditability | Every decision logged (git commit, progress.txt) | 🟢 |
| Determinism | Same PRD + codebase = reproducible results | 🟢 |
| Safety | No commits unless quality checks pass | 🟢 |

## Success Metrics

1. **Automation ratio:** Stories completed by agent / total stories (target: 100%)
2. **Quality gate pass rate:** % of iterations that pass all checks (target: 95%+)
3. **User satisfaction:** Agent-written code is usable/mergeable without major edits
4. **Time savings:** Time to complete feature via agent < time via manual developer

## Implementation Priority (MoSCoW)

- **Must:** Pick story → implement → test → commit → update prd.json
- **Must:** Quality gates (typecheck, lint, test) before commit
- **Must:** File-based state persistence (prd.json, progress.txt)
- **Should:** Tool selection (Amp default, Claude optional)
- **Should:** MAX_ITERATIONS limit and resumption
- **Could:** Dry-run mode (preview without committing)
- **Won't:** Parallel agent execution (sequential only)

## Assumptions

- User has valid prd.json (use `/prd` skill to generate)
- Project has quality check commands (npm run typecheck, lint, test)
- Agent (Amp/Claude) is installed and authenticated
- Git is configured with user.name and user.email
- Feature branch can be created without conflicts

## Known Limitations

- **Agent crash recovery:** No automatic cleanup if agent process dies mid-execution
- **Conflict resolution:** No automatic merge if feature branch diverges from main
- **Manual story skip:** Cannot skip story without implementing
- **Rollback:** No automated rollback of completed iteration (manual git revert required)

## Future Enhancements

- Parallel execution: Run multiple agents concurrently (different stories)
- Dry-run mode: Preview agent output without committing
- Agent pair programming: Human-in-loop review between iterations
- Cost tracking: Monitor token usage and API costs per agent
- Intelligent retry: Auto-retry failed iteration with hints from first attempt
