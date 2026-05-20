# Agent System — Tasks

## Prerequisites

- [ ] Bash 4+ installed
- [ ] Git configured with user.name and user.email
- [ ] Amp or Claude Code CLI installed and authenticated
- [ ] npm/Node.js in project (for quality checks)
- [ ] prd.json exists in project root
- [ ] CLAUDE.md exists with agent instructions

## Tasks

- [ ] **T-01: Validate environment**
  - Origin: ralph.sh implicit startup
  - Check: git available, prd.json readable, CLAUDE.md present, project code accessible
  - Criterion: Script exits with error if any check fails; prints helpful message
  - Confidence: 🟢

- [ ] **T-02: Parse command-line arguments**
  - Origin: ralph.sh lines 8-34
  - Parse `--tool [amp|claude]`, `--max-iterations [N]`, `--branch [BRANCH]`
  - Criterion: Arguments parsed correctly; invalid values rejected; defaults applied
  - Confidence: 🟢

- [ ] **T-03: Read prd.json and validate structure**
  - Origin: ralph.sh implicit (needed before loop)
  - Load JSON; check for required fields (project, branchName, userStories[])
  - Criterion: JSON parsed; all stories have id, title, passes boolean
  - Confidence: 🟢

- [ ] **T-04: Create feature branch**
  - Origin: ralph.sh loop setup
  - Run `git checkout -b [branchName]` from prd.json
  - Criterion: Branch created; git status shows new branch
  - Confidence: 🟢

- [ ] **T-05: Main loop: iterate until done or MAX_ITERATIONS**
  - Origin: ralph.sh loop structure
  - Loop counter from 1 to MAX_ITERATIONS; each iteration picks one story
  - Criterion: Loop executes expected number of times; counter incremented
  - Confidence: 🟢

- [ ] **T-06: Find next unfinished story**
  - Origin: ralph.sh loop logic (CLAUDE.md step 4)
  - Query prd.json for story where passes: false; pick highest priority (lowest ID)
  - Criterion: Returns US-001 if present and not done; None if all done
  - Confidence: 🟢

- [ ] **T-07: Spawn Amp agent (default)**
  - Origin: ralph.sh tool invocation
  - Construct Amp command with story JSON + context; spawn subprocess; wait for output
  - Criterion: Agent spawns; output captured; completion signal detected or timeout
  - Confidence: 🟡

- [ ] **T-08: Spawn Claude Code agent (optional)**
  - Origin: ralph.sh with --tool claude
  - Construct Claude Code command; invoke via CLI; capture output
  - Criterion: Agent spawns; output captured; completion signal detected
  - Confidence: 🟡

- [ ] **T-09: Parse agent output for completion signal**
  - Origin: ralph.sh exit logic
  - Regex search for `<promise>COMPLETE</promise>` in agent output
  - Criterion: Signal found → success; not found → failure
  - Confidence: 🟢

- [ ] **T-10: Run quality checks (typecheck, lint, test)**
  - Origin: CLAUDE.md step 6
  - Execute `npm run typecheck`, `npm run lint`, `npm run test` (or project-specific commands)
  - Criterion: All checks pass → continue; any fail → abort iteration
  - Confidence: 🟡

- [ ] **T-11: Commit changes on success**
  - Origin: CLAUDE.md step 8
  - Run `git add -A` + `git commit -m "feat: [STORY_ID] - [STORY_TITLE]"`
  - Criterion: Commit created; git log shows new commit
  - Confidence: 🟢

- [ ] **T-12: Revert changes on failure**
  - Origin: ralph.sh failure handling
  - Run `git restore .` if quality checks fail; undo uncommitted changes
  - Criterion: Changes reverted; git status clean; no dangling modifications
  - Confidence: 🟢

- [ ] **T-13: Update prd.json: set passes: true for completed story**
  - Origin: CLAUDE.md step 9 (implicit agent action, or ralph.sh does it)
  - Modify prd.json story object; set passes: true; write atomically
  - Criterion: prd.json updated; passes changed from false to true; valid JSON
  - Confidence: 🟢

- [ ] **T-14: Append to progress.txt**
  - Origin: CLAUDE.md step 10
  - Open progress.txt; append story summary + learnings; close file
  - Criterion: File appended (not overwritten); readable format; timestamp present
  - Confidence: 🟢

- [ ] **T-15: Display iteration progress**
  - Origin: ralph.sh UX
  - Print to stdout: current story, iteration N/MAX, story count done/total
  - Criterion: Progress visible during execution; helps user follow along
  - Confidence: 🟡

- [ ] **T-16: Handle loop exit conditions**
  - Origin: ralph.sh loop control
  - Break loop if: (a) no stories with passes: false found, OR (b) iteration count >= MAX_ITERATIONS
  - Criterion: Loop exits correctly in both cases; final message printed
  - Confidence: 🟢

## Test Tasks

- [ ] **TT-01: Execute single iteration with mock story**
  - Run ralph.sh with minimal prd.json (1 story)
  - Expected: Agent spawned, story marked passes: true, progress logged
  - Confidence: 🟡

- [ ] **TT-02: Execute multiple iterations**
  - Run ralph.sh with prd.json (3 stories)
  - Expected: Loop runs 3 times, all stories completed, prd.json updated
  - Confidence: 🟡

- [ ] **TT-03: Agent failure (quality check fails)**
  - Configure fake quality check that fails
  - Run ralph.sh; agent implements, quality check fails
  - Expected: prd.json NOT updated, story remains passes: false, no commit
  - Confidence: 🟡

- [ ] **TT-04: Tool selection (--tool claude)**
  - Run `ralph.sh --tool claude`
  - Expected: Claude Code agent spawned instead of Amp
  - Confidence: 🟡

- [ ] **TT-05: Iteration limit (--max-iterations 2)**
  - Run `ralph.sh --max-iterations 2` with 5-story prd.json
  - Expected: Loop runs exactly 2 times, stops, message "Completed 2/5"
  - Confidence: 🟢

## Tasks Order

1. **T-01 → T-06:** Setup (environment, args, prd parsing) — sequential
2. **T-07 → T-09:** Agent execution — sequential (depends on T-05 loop)
3. **T-10 → T-16:** Completion handling — sequential (depends on T-09 success)
4. **TT-01 → TT-05:** Integration tests — after implementation

**Suggested sequence:** T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15 → T-16

## Open Gaps (🔴)

- **Agent crash recovery:** No cleanup on agent subprocess crash.
- **Merge conflict handling:** No strategy if feature branch diverges from main.
- **Dry-run mode:** No way to preview what agent would do without committing.
- **Manual story skip:** No mechanism to skip a story without implementing.
- **Rollback previous iteration:** No way to undo a completed story and re-implement.
