# Agent System — Architecture Decisions

## ADR-1: Stateless Agent + File-Based Persistence

**Status:** ACCEPTED 🟢

**Problem:** Should agent maintain memory across iterations or be stateless?

**Context:**
- Ralph is designed for unattended execution (no human in loop per iteration)
- Each agent is fresh instance (amp/claude spawned new each time)
- State must survive agent death/restart

**Decision:** Agents are **completely stateless**. All state persists via files:
- `prd.json` — current stories and progress
- `progress.txt` — log of past iterations
- `.git` — code history
- `CLAUDE.md` — reusable agent instructions

**Rationale:**
- **Simplicity:** Each agent starts fresh; no context leak between iterations
- **Reproducibility:** Given same files + codebase, agent behavior is deterministic
- **Fault tolerance:** If agent crashes, restart from last file state (no lost context)
- **Auditability:** Files are source of truth; git history is complete

**Consequences:**
- Agent must read same files repeatedly (redundant, but cheap)
- No persistent "memory" of failed attempts (log to progress.txt for next agent)
- Context not passed via environment; everything via files

**Alternative considered:** Database for state — rejected (adds infrastructure, reduces reproducibility)

---

## ADR-2: One Story Per Iteration

**Status:** ACCEPTED 🟢

**Problem:** Should agent implement 1 story or multiple per iteration?

**Context:**
- Agent context window is finite (typically 100k-200k tokens)
- Larger stories → more code → more context needed → risk of overflow
- Multiple stories → more testing needed → longer iteration time
- Feedback loop is slower with large iterations

**Decision:** Agent implements **exactly one story per iteration**.

**Rationale:**
- **Risk mitigation:** Smaller scope → less likely to overflow context or introduce bugs
- **Fast feedback:** User sees progress after each story (not waiting for 5)
- **Testing confidence:** Single story easier to test thoroughly
- **Parallelizability (future):** Each story could be assigned to different agent (future optimization)

**Consequences:**
- More iterations needed (may feel slow for large PRDs)
- Agent overhead per story (multiple spawns, repeated setup)
- But code quality and correctness improve

**Validation:** Confirmed in CLAUDE.md step 4: "Pick the highest priority user story where passes: false"

---

## ADR-3: Fresh Agent Per Iteration (No Persistent Process)

**Status:** ACCEPTED 🟢

**Problem:** Should agent be long-lived process or spawned fresh each iteration?

**Context:**
- Long-lived agent could accumulate context (faster)
- Fresh agent requires fresh init (slower, but cleaner)
- Ralph runs unattended; agent process may hang or crash

**Decision:** Spawn **fresh agent process per iteration**. No persistent background agents.

**Rationale:**
- **Fault isolation:** Crash in iteration N doesn't affect N+1
- **Clean state:** No accumulated memory/cache pollution
- **Simpler restart:** ralph.sh can be interrupted and resumed safely
- **Resource cleanup:** Each iteration frees memory/file handles properly

**Consequences:**
- Agent init overhead per iteration (~1-5 sec per spawn)
- But total runtime acceptable for typical PRDs (5-20 stories)
- Easier to monitor/debug (agent starts and stops cleanly)

---

## ADR-4: Synchronous Loop (Wait-for-Agent)

**Status:** ACCEPTED 🟢

**Problem:** Should ralph.sh wait for agent to finish or dispatch asynchronously?

**Context:**
- Synchronous: simpler to reason about, blocks until done
- Asynchronous: faster feedback, but requires job tracking

**Decision:** ralph.sh **waits synchronously** for agent completion. No background dispatch.

**Rationale:**
- **Predictability:** Script flow is obvious (start agent → wait → check result)
- **Error handling:** Easy to detect agent failure (exit code, timeout)
- **No infrastructure:** No job queue, no background process monitor
- **User control:** User can interrupt ralph.sh at any time (Ctrl+C)

**Consequences:**
- ralph.sh blocks until agent finishes (may be 1-10 minutes per story)
- User cannot parallelize stories (one per session)
- But simplicity outweighs parallelism for MVP

---

## ADR-5: Mandatory Completion Signal (`<promise>COMPLETE</promise>`)

**Status:** ACCEPTED 🟢

**Problem:** How does ralph.sh know when agent finished successfully?

**Context:**
- Agent output is large (code, logs, debugging)
- Need explicit, unambiguous "I am done" signal
- Must not confuse partial completion with success

**Decision:** Agent **must emit** `<promise>COMPLETE</promise>` XML tag to indicate success.

**Rationale:**
- **Unambiguous:** If signal absent → agent didn't finish
- **Robust:** Even if stdout is verbose, search for tag is reliable
- **Fail-safe:** Absence of signal → abort iteration, don't update prd.json
- **Documented:** Clear requirement in CLAUDE.md agent instructions

**Consequences:**
- Agent code must emit signal explicitly (cannot be automatic)
- If agent forgets signal, iteration marked failed (even if code is correct)
- But safety > convenience (prevents silent failures)

**Validation:** Currently in CLAUDE.md step 8: "If checks pass, commit ALL changes with message: ..."
(Implicit: only commit if agent says success)

---

## ADR-6: Quality Checks Before Commit (Non-Negotiable)

**Status:** ACCEPTED 🟢

**Problem:** Should quality checks (typecheck, lint, test) be required or optional?

**Context:**
- Agent-written code may have subtle bugs
- Quality gates catch most errors early
- Some projects may skip certain checks

**Decision:** Quality checks are **mandatory**. All must pass before commit. No exceptions.

**Rationale:**
- **Code integrity:** Prevents broken code on main branch
- **Future-proof:** If tests pass now, future iterations won't be blocked by earlier iteration bugs
- **Automation success:** Unattended execution requires high confidence in code quality

**Consequences:**
- Agent must implement code that passes ALL checks
- If any check fails → iteration aborts, no commit, prd.json unchanged
- Slower iteration if checks are slow (but necessary)

**Validation:** CLAUDE.md step 6: "Run quality checks ... Do NOT commit broken code"

---

## ADR-7: Tool Abstraction (Amp Default, Claude Supported)

**Status:** ACCEPTED 🟢

**Problem:** Should ralph.sh lock into one agent tool or support multiple?

**Context:**
- Amp was original Ralph agent tool
- Claude Code support added later (commit 8698c3e)
- Both tools have different CLIs and capabilities

**Decision:** ralph.sh supports **both Amp (default) and Claude Code**. User selects via `--tool` flag.

**Command syntax:**
```bash
ralph.sh                          # Default: Amp
ralph.sh --tool amp              # Explicit: Amp
ralph.sh --tool claude           # Explicit: Claude Code
```

**Rationale:**
- **Flexibility:** User chooses based on availability/preference
- **Backwards compatible:** Default (Amp) preserves existing behavior
- **Future-proof:** Easy to add additional tools later

**Consequences:**
- ralph.sh must handle different CLI formats for each tool
- Testing requires both tools installed
- Documentation must cover both paths

**Implementation gap:** Exact Claude Code invocation syntax needs clarification (🟡 ADR mentions --tool but ralph.sh implementation may not fully support it yet)

---

## ADR-8: Feature Branch (Not Main)

**Status:** ACCEPTED 🟢

**Problem:** Should agent commit directly to main or to a feature branch?

**Context:**
- Main branch should stay stable/production-ready
- Feature branch allows preview/review before merging
- Ralph runs unattended; human review may be deferred

**Decision:** Agent commits to **feature branch** (from prd.json.branchName). Not main.

**Example:**
```bash
git checkout -b ralph/dark-mode    # Before first iteration
# ... iterations commit to ralph/dark-mode ...
# ... manual PR + merge when done ...
```

**Rationale:**
- **Safety:** Unattended changes don't hit main immediately
- **Reversible:** Feature branch can be reviewed/abandoned
- **CI/CD friendly:** Branch can trigger separate pipeline (test, review, deploy)
- **Multi-user:** Allows human to review and edit agent's work before merge

**Consequences:**
- Manual merge step needed (human approval)
- Requires git knowledge (branch management)
- But safety > automation (prevents accidental prod changes)

---

## ADR-9: Append-Only Progress Logging

**Status:** ACCEPTED 🟢

**Problem:** How to persist learnings from each iteration?

**Context:**
- Each agent learns patterns, gotchas, context
- Next agent should read and reuse this knowledge
- Must not lose historical information

**Decision:** `progress.txt` is **append-only**. Each iteration appends new entry. Never overwrite.

**Format (each iteration):**
```
## [ISO 8601 Timestamp] — [STORY_ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context

---
```

**Rationale:**
- **Auditable:** Complete history preserved
- **Searchable:** Grep for past learnings
- **Non-destructive:** No data loss from old iterations
- **CLAUDE.md integration:** Step 3 reads progress.txt for context

**Consequences:**
- progress.txt grows indefinitely (but size negligible: ~1KB per iteration)
- Requires manual curation (remove irrelevant learnings if desired)
- No automated "I learned this, delete old version" dedup

---

## ADR-10: MAX_ITERATIONS Limit (Prevent Runaway Loops)

**Status:** ACCEPTED 🟡

**Problem:** What prevents infinite loop if PRD is malformed or agent loops endlessly?

**Context:**
- ralph.sh loop could theoretically run forever
- User may set unrealistic story counts
- Need safety mechanism

**Decision:** Implement **MAX_ITERATIONS limit** (default: 10). Loop stops when limit reached.

**CLI flag:**
```bash
ralph.sh --max-iterations 20          # Override default
```

**Behavior on limit:**
```
... 10 iterations completed, 3 stories remaining ...
Loop limit reached. Completed 10/13 stories. Run again to continue.
```

**Rationale:**
- **Safety:** Prevents accidental runaway CPU/cost
- **Feedback:** User sees progress and can resume
- **Configurable:** Can increase for large PRDs

**Consequences:**
- User must run ralph.sh multiple times for large PRDs (friction)
- Need to decide: is limit per session or total? (Currently per session)
- Default 10 may be too low for some PRDs (user adjusts)

**Gap:** No automatic continuation mechanism (user must re-run ralph.sh manually)

