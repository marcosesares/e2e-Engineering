# Superpowers — Code Analysis

> **Project:** superpowers  
> **Analysis Date:** 2026-05-17  
> **Doc Level:** Detalhado  
> **Language:** English  
> **Modules Analyzed:** 21 skills  

---

## Executive Summary

Superpowers é um framework zero-dependency de skills para agentes de IA, com foco em workflow pattern documentation. Modelos 21 skills em 5 categorias: **Communication** (caveman, caveman-*, cavecrew), **Workflow** (brainstorming, executing-plans, using-git-worktrees), **Development** (test-driven-development, systematic-debugging, subagent-driven-development), **Review** (receiving-code-review, requesting-code-review, verification-before-completion), **Advanced** (writing-plans, writing-skills, dispatching-parallel-agents).

**Key Principles:** (1) Discipline over shortcuts (TDD, verification, systematic debugging); (2) Skills as reusable process references; (3) Agent behavior shape through documentation; (4) Zero dependencies, git-based distribution.

**Data Model:** Skill = (metadata: name/description/triggers) + (process: phases/checks/red-flags) + (examples: code/scenarios). No traditional classes/types; logic exists in procedural workflows.

---

## Architecture Overview

### Skill Structure

```
skills/
├── Discipline Skills (enforce strict processes)
│   ├── test-driven-development/        [RED-GREEN-REFACTOR cycle, mandatory failing test]
│   ├── systematic-debugging/           [4-phase root cause investigation]
│   ├── verification-before-completion/ [evidence gate before claims]
│
├── Workflow Skills (guide multi-step processes)
│   ├── brainstorming/                  [9-step design → spec → plan pipeline]
│   ├── writing-plans/                  [implementation plan generation]
│   ├── executing-plans/                [plan execution with checkpoints]
│   ├── subagent-driven-development/    [task dispatch + 2-stage review loop]
│   ├── using-git-worktrees/            [isolated workspace creation]
│   ├── finishing-a-development-branch/ [merge/PR/discard decision tree]
│
├── Compression Skills (token efficiency)
│   ├── caveman/                        [6 intensity levels: lite/full/ultra/wenyan-*]
│   ├── caveman-commit/                 [terse commit format, Conventional Commits]
│   ├── caveman-review/                 [1-line PR feedback: location, problem, fix]
│   ├── caveman-compress/               [.md file lossless compression]
│   ├── caveman-help/                   [quick reference card, one-shot display]
│   ├── cavecrew/                       [subagent delegation decision matrix]
│   ├── caveman-stats/                  [token usage reporting, hook-injected]
│
├── Review Skills (feedback patterns)
│   ├── receiving-code-review/          [verification before implementation, push-back criteria]
│   ├── requesting-code-review/         [subagent dispatch with role templates]
│
├── Advanced Patterns
│   ├── dispatching-parallel-agents/    [independent task parallelization]
│   ├── writing-skills/                 [skill creation as TDD for documentation]
│
└── Foundational
    └── using-superpowers/              [skill invocation priority rules]
```

### Workflow Connections

```
brainstorming → design doc + spec
  ↓
writing-plans → implementation plan (bite-sized tasks)
  ↓
using-git-worktrees → isolated workspace
  ↓
[implementation path choice]
  ├─ subagent-driven-development (same session, fresh subagent/task + 2-stage review)
  └─ executing-plans (sequential execution with checkpoints)
  ↓
requesting-code-review (external quality gate) OR
verification-before-completion (inline proof)
  ↓
finishing-a-development-branch (merge/PR/discard options)
```

---

## Module Analysis

### 1. Brainstorming

**Purpose:** Design before implementation. Prevent unexamined assumptions.

**Flow (9 steps):**
1. Explore project context (files, docs, commits)
2. [Optional] Offer visual companion (browser-based mockups)
3. Ask clarifying questions (one at a time)
4. Propose 2-3 approaches with trade-offs
5. Present design sections (incremental approval)
6. Write design doc to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. Spec self-review (placeholder scan, consistency, scope, ambiguity)
8. User reviews written spec
9. Invoke writing-plans skill

**Gate:** HARD-GATE—no implementation until design approved.

**Key Rules:**
- Decompose projects > 1 subsystem upfront
- Explore patterns in codebase before proposing changes
- Scope for single implementation plan (not multiple independent projects)

**Data:** Title, spec document path, approval checkpoint, writing-plans trigger

🟢 **Confidence:** CONFIRMED — spec structure & workflow documented

---

### 2. Test-Driven Development (TDD)

**Core:** "No production code without failing test first."

**Cycle:** RED (write failing test) → VERIFY (watch fail) → GREEN (minimal code) → VERIFY (watch pass) → REFACTOR (clean)

**Red Phase:**
- One behavior per test
- Clear name (describes requirement, not implementation)
- Real code (minimal mocking)

**Verify Red:**
- Test fails ✓ (not passes, not errors)
- Failure message is expected ✓
- Fails because feature missing, not typo ✓

**Green Phase:**
- Simplest code to pass test
- No "while I'm here" improvements
- No refactoring yet

**Refactor:**
- After green only
- Remove duplication, improve names, extract helpers
- Keep tests green

**Enforcement:**
- "No exceptions without your human partner's permission"
- Iron law: code before test? Delete & restart
- Covers feature addition, bug fixes, refactoring, behavior changes

**Anti-rationalizations (table):** 12 common excuses + reality checks (e.g., "I'll test after" → "Tests passing immediately prove nothing")

**Red Flags:** Code before test, test passes immediately, can't explain why test failed, tests added later, "just this once", manual testing claim, "tests after achieve same", spirit-not-ritual argument, "keep as reference"

🟢 **Confidence:** CONFIRMED — cycle & enforcement detailed

---

### 3. Systematic Debugging

**Core:** "Find root cause before fixing. Symptom fixes are failure."

**4 Phases (sequential, must complete each):**

**Phase 1: Root Cause Investigation**
- Read error messages (stack traces, line numbers, codes)
- Reproduce consistently (exact steps, every time)
- Check recent changes (git diff, new deps, config)
- Gather evidence in multi-component systems (logs at each boundary)
- Trace data flow (backward from symptom to source)

**Phase 2: Pattern Analysis**
- Find working examples in same codebase
- Read reference implementation completely
- Identify differences (list every one, however small)
- Understand dependencies (components, config, assumptions)

**Phase 3: Hypothesis & Testing**
- Form single hypothesis: "X is root cause because Y"
- Test minimally (one variable)
- Verify before continuing (yes → Phase 4, no → new hypothesis)
- Never add multiple fixes at once

**Phase 4: Implementation**
- Create failing test case (simplest reproduction)
- Implement single fix (root cause only)
- Verify (test passes, no regressions)
- If fix #3+ fails → question architecture (not code)

**Architecture Escalation:**
- Pattern: each fix reveals new problem in different place
- Signal: not hypothesis failure, but architectural problem
- Action: discuss with human partner before Fix #4

**Diagnostic Instrumentation (multi-layer systems):**
```
For each component boundary:
  - Log data entering component
  - Log data exiting component
  - Verify env/config propagation
  - Check state at each layer
Run → Identify failing component → Investigate specifically
```

**Red Flags:** Quick fix promise, guessing, multiple changes, skipping test, assuming without verifying, adapting pattern differently, proposing fixes without investigation, "one more attempt" (≥3 failures)

**Anti-rationalizations (table):** "Issue simple", "Emergency", "Just try this first", "I'll write test after", "Multiple fixes save time", "Reference too long", "I see problem", "One more attempt"

🟢 **Confidence:** CONFIRMED — 4-phase process, architecture escalation

---

### 4. Caveman Mode (Communication)

**Purpose:** Token efficiency (~75% reduction) while maintaining technical accuracy.

**Intensity Levels:**
- **Lite:** Drop filler/hedging, keep articles + full sentences (professional tight)
- **Full:** Drop articles, filler, pleasantries, hedging (default, classic caveman)
- **Ultra:** Abbreviate prose, strip conjunctions, arrows for causality (X → Y)
- **Wenyan-Lite:** Semi-classical, structured grammar, classical register
- **Wenyan-Full:** 文言文, 80-90% character reduction
- **Wenyan-Ultra:** Extreme abbreviation + classical feel

**Rules (Full mode):**
- Drop: articles (a/an/the), filler (just/really/basically/simply), pleasantries (sure/certainly), hedging
- Keep: fragments, short synonyms, technical terms exact, code unchanged
- Pattern: `[thing] [action] [reason]. [next step].`

**Persistence:** Active every response until "stop caveman" / "normal mode". No revert drift.

**Auto-Clarity (drop caveman for):**
- Security warnings
- Irreversible action confirmations
- Multi-step sequences where fragment order risks misread
- User asks to clarify or repeats question
Resume caveman after clear part done.

**Boundaries:**
- Code/commits/PRs: write normal
- Response: caveman (compressed)

**Session examples:**
- Lite: "Your component re-renders because you create a new object reference. Wrap in `useMemo`."
- Full: "New object ref each render. Inline object prop = new ref = re-render. Wrap `useMemo`."
- Ultra: "Inline obj prop → new ref → re-render. `useMemo`."

🟡 **Confidence:** INFERIDO — examples document usage, but implementation via hooks/mode-tracker

---

### 5. Caveman Commit

**Purpose:** Terse commit messages (Conventional Commits) with emphasis on WHY.

**Subject Line:**
- Format: `<type>(<scope>): <imperative summary>`
- Types: feat, fix, refactor, perf, docs, test, chore, build, ci, style, revert
- Imperative: "add", "fix", "remove" (not added/adds)
- Length: ≤50 chars ideal, hard cap 72
- No trailing period

**Body (only if needed):**
- Skip if subject self-explanatory
- Add only for: non-obvious why, breaking changes, migration notes, linked issues
- Wrap at 72 chars
- Bullets: `-` not `*`
- References: `Closes #42`, `Refs #17`

**Never:**
- "This commit does X", "I", "we", "now", "currently"
- "As requested by..."
- "Generated with Claude Code"
- Emoji (unless project convention)
- File name restatement

**Examples:**
```
feat(api): add GET /users/:id/profile

Mobile client needs profile data without full payload
to reduce LTE bandwidth on cold-launch screens.

Closes #128
```

```
feat(api)!: rename /v1/orders to /v1/checkout

BREAKING CHANGE: clients must migrate before 2026-06-01
```

**Auto-Clarity:** Always body for breaking changes, security fixes, data migrations, reverts.

🟢 **Confidence:** CONFIRMED — Conventional Commits, WHY emphasis

---

### 6. Caveman Review

**Purpose:** One-line PR comments: `L<line>: <problem>. <fix>.`

**Format:** `path:line: <emoji> <severity>: <problem>. <fix>.`

**Severities:**
- 🔴 bug: broken behavior, incident
- 🟡 risk: works but fragile (race, null check, swallowed error)
- 🔵 nit: style, naming, micro-optim
- ❓ q: genuine question, not suggestion

**Drop:**
- "I noticed...", "It seems...", "You might consider..."
- "This is just a suggestion but..."
- "Great work!", "Looks good overall but..."
- Restating what line does
- Hedging (perhaps, maybe, I think)

**Keep:**
- Exact line numbers
- Exact symbol/function names in backticks
- Concrete fix (not "refactor this")
- WHY if fix isn't obvious

**Examples:**
```
L42: 🔴 bug: user can be null after .find(). Add guard before .email.
```

```
L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.
```

```
L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).
```

🟢 **Confidence:** CONFIRMED — one-line format, severity markers

---

### 7. Cavecrew

**Purpose:** Decision matrix for subagent delegation with compressed output (~60% token reduction).

**Subagent Types:**
- **cavecrew-investigator:** Locate code ("where is X", "what calls Y", "list uses of Z")
  - Output: `path:line — symbol — note`
- **cavecrew-builder:** Surgical edit ≤2 files, scope obvious
  - Output: `path:line-range — change ≤10 words. verified: X`
- **cavecrew-reviewer:** Diff/branch/file review for bugs
  - Output: `path:line: emoji severity: problem. fix.`

**Decision Matrix:**
| Task | Use |
|------|-----|
| "Where is X defined" | cavecrew-investigator |
| Same + suggestions | Explore (vanilla) |
| ≤2 file edit, obvious scope | cavecrew-builder |
| 3+ files / cross-cutting | Main thread or code-architect |
| Review diff for bugs | cavecrew-reviewer |
| Deep review + rationale | Code Reviewer (vanilla) |

**Chaining Patterns:**
- Locate → fix → verify (most common: investigator → builder → reviewer)
- Parallel scout (2-3 investigators, different angles)
- Single-shot (skip investigator if site already known)

**Warnings:**
- Don't use builder without knowing file (investigator first)
- Don't chain investigator → builder for 5+ file refactor
- Don't ask reviewer for "general feedback" (findings only)
- Don't expect prose (structured, terse)

🟢 **Confidence:** CONFIRMED — decision matrix, output contracts

---

### 8. Writing Plans

**Purpose:** Bite-sized implementation tasks (2-5 min each), assuming zero codebase context.

**Structure (per task):**
- Files: Create/Modify/Test (exact paths)
- Steps: Checkbox list, TDD cycle
- Code: Complete, not templates
- Commands: Exact with expected output
- Commits: Per step

**Example Task:**
```markdown
### Task 2: Retry Logic

**Files:**
- Create: `src/retry.ts`
- Test: `tests/retry.test.ts`

- [ ] **Step 1: Write failing test**
```typescript
test('retries failed ops 3x', async () => { ... })
```

- [ ] **Step 2: Run test to verify RED**
Expected: FAIL "function not defined"

- [ ] **Step 3: Write minimal code**
```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) { ... }
}
```

- [ ] **Step 4: Run test to verify GREEN**
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git commit -m "feat: add retry logic"
```
```

**Grip-Sized Granularity:** Each step is ONE action (2-5 min), not multi-step.

**No Placeholders:** Every step has actual content (code, commands, expected output). No "TBD", "add error handling", "similar to Task N".

**Self-Review Checklist:**
1. Spec coverage: each requirement → which task?
2. Placeholder scan: any "TBD", "TODO", vague descriptions?
3. Type consistency: function/property names match across tasks?

**Execution Handoff:**
- Subagent-Driven (recommended): fresh subagent/task + 2-stage review
- Executing-Plans (inline): batch with checkpoints

🟢 **Confidence:** CONFIRMED — bite-sized, no placeholders, TDD structure

---

### 9. Subagent-Driven Development

**Core:** Fresh subagent per task + 2-stage review (spec compliance → code quality).

**Per-Task Cycle:**
1. Dispatch implementer (implementer-prompt.md)
   - Implementer asks questions? → Answer, re-dispatch
   - Otherwise → implement, test, commit, self-review
2. Dispatch spec reviewer (spec-reviewer-prompt.md)
   - Confirms code matches spec?
   - No → implementer fixes → re-review until ✅
3. Dispatch code quality reviewer (code-quality-reviewer-prompt.md)
   - Approves quality?
   - No → implementer fixes → re-review until ✅
4. Mark task complete

**Implementer Status Handling:**
- DONE → spec review
- DONE_WITH_CONCERNS → read concerns, address if correctness issue
- NEEDS_CONTEXT → provide missing info, re-dispatch same
- BLOCKED → assess: context problem (more info), task too large (break up), plan wrong (escalate)

**After All Tasks:**
- Dispatch final code-reviewer (entire implementation)
- Use finishing-a-development-branch skill

**Model Selection (cost efficiency):**
- Mechanical tasks (1-2 files, clear spec) → cheap, fast
- Integration tasks (multi-file, coordination) → standard
- Architecture/design → most capable

**Red Flags:**
- Don't start main/master without consent
- Don't skip reviews (spec OR quality)
- Don't proceed with unfixed issues
- Don't parallel dispatch implementation subagents
- Don't ask subagent to read plan (provide full text)

🟢 **Confidence:** CONFIRMED — 2-stage review, implementer status handling

---

### 10. Executing Plans

**Purpose:** Execute bite-sized plan tasks sequentially with checkpoints.

**Process:**
1. Load & review plan (raise concerns before starting)
2. Execute tasks (follow steps exactly, run verifications)
3. Complete development (use finishing-a-development-branch skill)

**When to Stop:**
- Blocker (missing dependency, test fails, unclear instruction)
- Plan has critical gaps
- You don't understand instruction
- Verification fails repeatedly

**Red Flags:**
- Don't start main/master without consent
- Return to review if plan fundamentally changes
- Don't skip verifications
- Don't force through blockers

**Integration:**
- REQUIRED: using-git-worktrees (isolated workspace)
- REQUIRED: finishing-a-development-branch (post-implementation)

🟢 **Confidence:** CONFIRMED — task execution, checkpoint workflow

---

### 11. Systematic Debugging (covered earlier)

---

### 12. Verification Before Completion

**Core:** "Evidence before claims, always."

**Gate Function (before ANY completion claim):**
1. IDENTIFY: What command proves this claim?
2. RUN: Execute FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm claim?
5. ONLY THEN: Make claim WITH evidence

**Common Failures:**
| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check |
| Build succeeds | Build output: exit 0 | Linter passing |
| Bug fixed | Test original symptom: passes | Code changed |
| Regression test works | RED-GREEN verification | Test passes once |
| Agent completed | VCS diff shows changes | Agent report |
| Requirements met | Line-by-line checklist | Tests passing |

**Red Flags:**
- "Should", "probably", "seems to"
- Satisfaction before verification
- About to commit/push/PR without verification
- Trusting agent reports
- Partial verification
- "Just this once"
- Tiredness as excuse
- ANY wording implying success without verification

🟢 **Confidence:** CONFIRMED — gate function, evidence requirements

---

### 13. Using Git Worktrees

**Purpose:** Isolated workspace via native tools or git fallback.

**Step 0: Detect Existing Isolation**
```bash
GIT_DIR == GIT_COMMON → normal repo (create worktree or ask)
GIT_DIR != GIT_COMMON → already in worktree (skip creation)
```

Guard: Check for submodules (git rev-parse --show-superproject-working-tree)

**Step 1a: Native Worktree Tools (preferred)**
- Use platform's worktree tool (EnterWorktree, WorktreeCreate, /worktree flag)
- Handles directory placement, branch creation, cleanup automatically
- Skip 1b if available

**Step 1b: Git Worktree Fallback (only if no native tool)**
- Directory priority: explicit instruction > .worktrees/ > worktrees/ > ~/.config/superpowers/worktrees/ > default .worktrees/
- Verify directory is ignored (project-local only): `git check-ignore -q .worktrees`
- Create: `git worktree add "$path" -b "$BRANCH_NAME"`
- Sandbox fallback: if permission denied, work in place

**Step 3: Project Setup**
```bash
if [ -f package.json ]; then npm install; fi
if [ -f Cargo.toml ]; then cargo build; fi
```

**Step 4: Verify Clean Baseline**
- Run tests, report failures
- Ask: proceed or investigate

🟢 **Confidence:** CONFIRMED — isolation detection, fallback flow

---

### 14. Finishing a Development Branch

**Purpose:** Merge/PR/keep/discard decision tree with cleanup.

**Step 1: Verify Tests**
- Run test suite
- Failures? STOP, don't proceed

**Step 2: Detect Environment**
```bash
GIT_DIR == GIT_COMMON → normal repo (4 options)
GIT_DIR != GIT_COMMON, named branch → 4 options
GIT_DIR != GIT_COMMON, detached HEAD → 3 options (no merge)
```

**Step 3: Determine Base Branch**
- git merge-base HEAD main/master
- Ask: "Is this correct?"

**Step 4: Present Exactly These Options**

Normal repo:
```
1. Merge back to <base-branch> locally
2. Push and create PR
3. Keep branch as-is
4. Discard this work
```

Detached HEAD:
```
1. Push as new branch and create PR
2. Keep as-is
3. Discard this work
```

**Step 5: Execute Choice**
- Option 1 (Merge): merge, verify tests, cleanup, delete branch
- Option 2 (PR): push -u, gh pr create, keep worktree
- Option 3 (Keep): preserve worktree
- Option 4 (Discard): confirm typed "discard", cleanup, force-delete

**Step 6: Cleanup Workspace**
- Only for Options 1 & 4
- Check worktree provenance (created by Superpowers? under .worktrees/, worktrees/, ~/.config/?)
- If yes: `git worktree remove`
- If no: don't remove (harness-managed)

**Red Flags:**
- Never proceed with failing tests
- Never merge without testing result
- Never delete without confirmation
- Never force-push without request
- Never remove worktree before merge succeeds
- Never run `git worktree remove` from inside worktree
- Never clean up harness-managed worktrees

🟢 **Confidence:** CONFIRMED — environment detection, option execution, cleanup provenance

---

### 15. Receiving Code Review

**Core:** "Technical evaluation, not emotional performance."

**Response Pattern:**
1. READ: Complete feedback
2. UNDERSTAND: Restate requirement (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each

**Forbidden Responses:**
- "You're absolutely right!"
- "Great point!"
- "Let me implement that now" (before verification)

**Instead:**
- Restate technical requirement
- Ask clarifying questions
- Push back with technical reasoning if wrong
- Just start working (actions > words)

**Handling Unclear Feedback:**
- STOP if any item unclear
- Don't implement anything yet
- Ask for clarification on all unclear items before proceeding

**Source-Specific:**
- From human partner: trusted, still ask if scope unclear, no performative agreement
- From external reviewers: verify technically correct, check for regressions, understand context, doesn't break things, reviewer has full context
- Conflicts with human partner's prior decisions? Stop & discuss first

**YAGNI Check:**
```
IF reviewer suggests "implementing properly":
  grep codebase for actual usage
  IF unused: "Remove it (YAGNI)?"
  IF used: Implement properly
```

**Push Back Criteria:**
- Breaks existing functionality
- Reviewer lacks context
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist
- Conflicts with architectural decisions

**Acknowledging Correct Feedback:**
- ✅ "Fixed. [Brief description]"
- ✅ "Good catch - [specific issue]. Fixed in [location]."
- ✅ [Just fix & show in code]
- ❌ "You're absolutely right!"
- ❌ "Great point!"
- ❌ Thanks (any gratitude)

🟢 **Confidence:** CONFIRMED — push-back criteria, YAGNI check

---

### 16. Requesting Code Review

**Purpose:** Dispatch subagent reviewer before merge.

**When:**
- MANDATORY: After each task in subagent-driven development
- MANDATORY: After major feature
- MANDATORY: Before merge to main
- Optional: When stuck, before refactoring, after complex bug fix

**Process:**
1. Get git SHAs (BASE_SHA, HEAD_SHA)
2. Dispatch code reviewer subagent (template)
3. Fix Critical issues immediately
4. Fix Important issues before proceeding
5. Note Minor issues for later

**Integration:**
- Subagent-Driven Development: review after EACH task
- Executing Plans: review at checkpoints
- Ad-Hoc: review before merge

🟢 **Confidence:** CONFIRMED — reviewer dispatch, action criteria

---

### 17. Dispatching Parallel Agents

**Purpose:** Independent task parallelization (3+ test files, multiple subsystems).

**Decision Matrix:**
```
Multiple failures? 
  → Are they independent?
      → YES: Can they work in parallel? → YES: Parallel dispatch
             (NO: Sequential agents)
      → NO: Single agent investigates all
```

**Use When:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem understandable without others
- No shared state between investigations

**Don't Use When:**
- Failures related (fix one might fix others)
- Need full system state understanding
- Agents would interfere (shared files, shared resources)

**Pattern:**
1. Identify independent domains
2. Create focused agent task per domain
3. Dispatch in parallel
4. Review & integrate results

**Agent Prompt Structure:**
- Focused (one problem domain)
- Self-contained (all context needed)
- Specific output (what should agent return?)

🟡 **Confidence:** INFERIDO — matrix documented, but depends on agent orchestration

---

### 18. Writing Skills (Skill Creation Framework)

**Core:** "Writing skills IS TDD applied to process documentation."

**When to Create:**
- Technique wasn't intuitively obvious
- You'd reference again across projects
- Pattern applies broadly (not project-specific)
- Others would benefit

**Don't Create For:**
- One-off solutions
- Standard practices (already documented)
- Project-specific conventions (CLAUDE.md)
- Mechanical constraints (automate, don't document)

**Skill Types:**
- Technique: Concrete method with steps (condition-based-waiting)
- Pattern: Way of thinking (flatten-with-flags)
- Reference: API docs, syntax, tool docs

**SKILL.md Structure:**
```yaml
---
name: Skill-Name-With-Hyphens
description: Use when [specific triggering conditions, NOT workflow summary]
---

# Skill Name

## Overview
What is this? Core principle in 1-2 sentences.

## When to Use
[Decision flowchart IF non-obvious]
Bullet list with SYMPTOMS
When NOT to use

## Core Pattern / Implementation
[Code examples, techniques, reference]

## Common Mistakes
[What goes wrong + fixes]
```

**Claude Search Optimization (CSO):**
- Description = When to Use (NOT what skill does)
- NEVER summarize workflow in description (Claude may follow description instead of reading skill)
- Concrete triggers, symptoms, situations
- Keywords: error messages, symptoms, tools

**File Organization:**
- Self-contained: everything in SKILL.md
- With tool: SKILL.md + supporting files
- Heavy reference: SKILL.md + 100+ line reference files

**Testing (TDD for Documentation):**
- RED: Run scenarios WITHOUT skill, document baseline
- GREEN: Write skill addressing failures, verify compliance
- REFACTOR: Close loopholes, re-test until bulletproof

**Red Flags (Skill Creation):**
- Narrative examples ("In session X, we found...")
- Multi-language dilution
- Code in flowcharts
- Generic labels (helper1, step2)
- No testing before deployment

🟡 **Confidence:** INFERIDO — structure documented, but creation methodology specialized

---

### 19. Using Superpowers (Skill Invocation)

**Core:** "If even 1% chance skill applies, invoke it."

**Priority:**
1. User's explicit instructions (highest)
2. Superpowers skills
3. Default system prompt (lowest)

**Invocation Rule:**
- Check BEFORE clarifying questions
- Check BEFORE exploring codebase
- Check BEFORE any action
- Even 1% chance? Invoke Skill tool

**Platform Adaptation:**
- Claude Code: Use Skill tool
- Copilot CLI: skill tool
- Gemini CLI: activate_skill tool

**Skill Priority (when multiple apply):**
1. Process skills (brainstorming, debugging) — determine HOW
2. Implementation skills — guide execution

🟢 **Confidence:** CONFIRMED — priority rules, invocation gates

---

### 20. Caveman Help & Stats

**caveman-help:** Quick reference card (one-shot, not persistent mode)
- Modes table
- Skills table
- Deactivate command
- Configuration

**caveman-stats:** Token usage reporting (hook-injected, not computed by model)

🔴 **Confidence:** LACUNA — stats implementation hook-dependent

---

### 21. Caveman Compress

**Purpose:** Lossless compression of .md files to caveman format (~46% token savings).

**Process:**
1. Detect file type (CLI)
2. Call Claude to compress
3. Validate output
4. If errors: cherry-pick fix, retry (max 2)
5. On failure: report, leave original untouched

**Compression Rules:**
- Remove: articles, filler, pleasantries, hedging
- Preserve EXACTLY: code blocks, inline code, URLs, file paths, commands, technical terms, proper nouns, dates, versions, env vars
- Compress: use short synonyms, fragments OK, merge redundant bullets

**Boundaries:**
- ONLY .md, .txt, .typ, .typst, .tex, extensionless
- NEVER modify .py, .js, .ts, .json, .yaml, .toml, .env, .lock, .css, .html, .xml, .sql, .sh

🟡 **Confidence:** INFERIDO — compression rules documented, but Python CLI implementation not reviewed

---

## Data Dictionary (Structured by Theme)

### Workflow State

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| phase | enum | RED/GREEN/REFACTOR cycle phase | TDD, Writing Skills |
| status | enum | DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED | Subagent-Driven |
| checkpoint | string | Named milestone (e.g., "spec compliance pass") | Subagent-Driven |
| evidence | object | Verification output (command, exit code, counts) | Verification |

### Design & Documentation

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| design_doc_path | string | `docs/superpowers/specs/YYYY-MM-DD-*.md` | Brainstorming |
| plan_path | string | `docs/superpowers/plans/YYYY-MM-DD-*.md` | Writing Plans |
| spec_requirements | list[string] | Spec sections covered by plan tasks | Writing Plans |
| approval_checkpoint | bool | Design approved by human? | Brainstorming |

### Implementation

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| file_paths | list[string] | Files created/modified (exact paths) | Writing Plans |
| task_steps | list[object] | Bite-sized steps (2-5 min each, TDD cycle) | Writing Plans |
| git_shas | object | {BASE_SHA, HEAD_SHA} for review dispatch | Requesting Review |
| test_command | string | Full command to verify tests | Verification |

### Quality Gates

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| has_failing_test | bool | Test fails before implementation? | TDD |
| root_cause_identified | bool | Phase 1 of debugging complete? | Systematic Debugging |
| spec_compliance_pass | bool | Code matches spec exactly? | Subagent-Driven |
| code_quality_pass | bool | No architectural/style issues? | Subagent-Driven |
| verification_evidence | object | {command, output, exit_code, count} | Verification |

### Workspace Management

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| workspace_path | string | Full path to isolated worktree | Using Git Worktrees |
| branch_name | string | Feature branch name | Using Git Worktrees |
| isolation_detected | bool | GIT_DIR != GIT_COMMON? | Using Git Worktrees |
| worktree_provenance | enum | Superpowers / Harness-created / Manual | Finishing Branch |

### Compression

| Field | Type | Description | Module |
|-------|------|-------------|--------|
| intensity_level | enum | lite/full/ultra/wenyan-lite/full/ultra | Caveman |
| session_token_usage | object | {baseline, compressed, saved_percent} | Caveman Stats |
| code_blocks | list[string] | Regions to preserve EXACTLY (never compress) | Caveman Compress |

---

## Control Flow & Algorithms

### TDD Cycle (Pseudocode)

```
function TDD_Cycle(requirement):
  loop:
    # RED: Write failing test
    test ← write_minimal_test(requirement)
    run_test(test)
    if test_passes():
      # Wrong — test should fail
      report("Test passes before implementation")
      exit(ERROR)
    
    # GREEN: Write minimal code
    code ← write_minimal_code_to_pass(test)
    run_test(test)
    if NOT test_passes():
      # Wrong — test should pass now
      report("Test still fails after implementation")
      exit(ERROR)
    
    # REFACTOR: Clean (only after green)
    code ← remove_duplication(code)
    code ← improve_names(code)
    run_test(test)
    if NOT test_passes():
      report("Refactor broke test")
      exit(ERROR)
    
    requirement ← next_requirement()
    if no more requirements:
      break
  return SUCCESS
```

### Systematic Debugging (Pseudocode)

```
function Debug(symptom):
  # Phase 1: Root Cause Investigation
  evidence ← gather_diagnostics()
  flow_trace ← trace_backward_from(symptom)
  root_cause ← identify_source(flow_trace)
  
  # Phase 2: Pattern Analysis
  working_examples ← find_similar_working_code()
  differences ← compare(working_examples, broken_code)
  
  # Phase 3: Hypothesis & Test
  hypothesis ← form_single_hypothesis(root_cause, differences)
  test_result ← minimal_test(hypothesis)
  if NOT test_result.confirms_hypothesis():
    hypothesis ← next_hypothesis(test_result)
    goto Phase3  # Retry same phase
  
  # Phase 4: Implementation
  test_case ← create_regression_test(symptom)
  fix ← implement_root_cause_fix()
  verify_fix(fix, test_case)
  if fix_count >= 3 AND NOT all_fixed():
    report("Architectural problem, not hypothesis failure")
    escalate_to_human_partner()
  
  return SUCCESS
```

### Subagent-Driven Development (Pseudocode)

```
function SubagentDrivenDevelopment(plan):
  todo_list ← create_todos_from(plan)
  
  for task in plan.tasks:
    # Dispatch & Answer Questions
    implementer ← dispatch_implementer(task)
    while implementer.needs_context():
      context ← provide_context(implementer)
      implementer ← dispatch_implementer(task, context)
    
    # Spec Compliance Review
    spec_reviewer ← dispatch_spec_reviewer(implementer.output)
    while NOT spec_reviewer.approved():
      implementer.fix_spec_gaps()
      spec_reviewer ← dispatch_spec_reviewer(implementer.output)
    
    # Code Quality Review
    quality_reviewer ← dispatch_quality_reviewer(implementer.output)
    while NOT quality_reviewer.approved():
      implementer.fix_quality_issues()
      quality_reviewer ← dispatch_quality_reviewer(implementer.output)
    
    mark_task_complete(task)
  
  # Final Review
  final_reviewer ← dispatch_final_reviewer(all_output)
  verify(final_reviewer.approved())
  
  return SUCCESS
```

---

## Integration Patterns

### Workflow 1: Feature Implementation (Optimal)

```
brainstorming
  → design approved ✓
  → writing-plans
    → execute subagent-driven-development (same session)
      ├─ using-git-worktrees (Step 0-4)
      ├─ Per-task: dispatch implementer + 2-stage review
      └─ requesting-code-review (final) + verification-before-completion
  → finishing-a-development-branch
    → merge OR push PR
```

### Workflow 2: Bug Debugging & Fix

```
systematic-debugging (4 phases)
  ├─ Phase 1: Root cause investigation
  ├─ Phase 2: Pattern analysis
  ├─ Phase 3: Hypothesis & test (minimal)
  ├─ Phase 4: Implementation (TDD)
  │   ├─ test-driven-development (RED-GREEN-REFACTOR)
  │   └─ verification-before-completion (evidence gate)
  └─ [If 3+ fixes failed: architectural escalation]
```

### Workflow 3: Code Review Reception & Implementation

```
receiving-code-review
  → understand + verify + evaluate
  → YAGNI check (is feature used?)
  → implement items (order: blocking → simple → complex)
  → test each
  → verification-before-completion (prove fixes work)
```

---

## Quality Metrics

### Discipline Enforcement (Red Flags per Skill)

| Skill | Red Flag Count | Rationalization Count |
|-------|----------------|----------------------|
| TDD | 13 flags | 12 excuses |
| Systematic Debugging | 11 flags | 8 excuses |
| Verification | 6 flags | 8 excuses |
| Writing Skills | 5 flags | 8 excuses |
| Code Review Reception | 3 flags | - |

### Complexity (Lines of Documentation)

| Skill | Lines | Type | Complexity |
|-------|-------|------|------------|
| brainstorming | ~165 | workflow | medium |
| test-driven-development | ~372 | discipline | high |
| systematic-debugging | ~297 | discipline | high |
| caveman (modes) | ~140 | compression | low |
| subagent-driven-development | ~280 | workflow | very high |
| writing-plans | ~153 | workflow | medium |
| writing-skills | ~656 | meta-process | very high |

---

## Key Data Structures

### Skill Metadata
```json
{
  "name": "skill-name",
  "description": "Use when [trigger]",
  "type": "discipline | technique | pattern | reference",
  "requirements": ["skill-name"],
  "phases": [{"name": "phase", "gates": [], "checks": []}],
  "red_flags": ["flag1", "flag2"],
  "rationalizations": [{"excuse": "X", "reality": "Y"}]
}
```

### Plan Task
```json
{
  "id": 1,
  "title": "Component Name",
  "files": {
    "create": ["path/to/file.ts"],
    "modify": ["path/to/existing.ts:123-145"],
    "test": ["tests/path/to/test.ts"]
  },
  "steps": [
    {
      "title": "Write failing test",
      "action": "write",
      "content": "code block",
      "verification": "run test command"
    }
  ],
  "dependencies": []
}
```

### Verification Evidence
```json
{
  "command": "npm test",
  "output": "34/34 passed",
  "exit_code": 0,
  "failures": 0,
  "timestamp": "ISO8601"
}
```

---

## Common Implementation Pitfalls

### 1. TDD Anti-Patterns
- ❌ Code before test (delete & restart)
- ❌ Test passes immediately (testing existing behavior)
- ❌ Multiple changes at once (can't isolate what worked)
- ❌ "I'll test after" (tests passing immediately prove nothing)

### 2. Debugging Anti-Patterns
- ❌ Quick symptom fix (masks root cause)
- ❌ Guessing without investigation (3+ fix attempts → architectural problem)
- ❌ Skipping Phase 1 (try fix without understanding)
- ❌ Trace-free data flow (where does bad value come from?)

### 3. Subagent Anti-Patterns
- ❌ Parallel implementation dispatch (conflicts)
- ❌ Subagent reads plan file (provide full text instead)
- ❌ Skip spec compliance review (code quality is not spec match)
- ❌ Skip review loops (reviewer found issues = implementer fixes = review again)

### 4. Code Review Anti-Patterns
- ❌ Performative agreement ("You're absolutely right!")
- ❌ Blind implementation (verify before implementing)
- ❌ Partial understanding (clarify all items first)
- ❌ YAGNI ignorance (is feature actually used?)

### 5. Workspace Anti-Patterns
- ❌ Nested worktrees (Step 0 detection prevents this)
- ❌ Using git worktree when native tool exists (fight harness)
- ❌ Skipping worktree ignore verification (contents tracked)
- ❌ Running `git worktree remove` from inside worktree (fails silently)

---

## Confidence Assessment

| Module | Confidence | Notes |
|--------|-----------|-------|
| brainstorming | 🟢 CONFIRMED | 9-step flow, hard gate, spec structure |
| TDD | 🟢 CONFIRMED | Cycle, rules, enforcement complete |
| Systematic Debugging | 🟢 CONFIRMED | 4 phases, architecture escalation, evidence |
| caveman (modes) | 🟡 INFERIDO | Examples show usage, but hook implementation not reviewed |
| caveman-commit | 🟢 CONFIRMED | Conventional Commits, WHY emphasis |
| caveman-review | 🟢 CONFIRMED | One-line format, severity markers |
| cavecrew | 🟢 CONFIRMED | Decision matrix, output contracts |
| writing-plans | 🟢 CONFIRMED | Bite-sized structure, no placeholders, TDD cycles |
| subagent-driven-dev | 🟢 CONFIRMED | 2-stage review, implementer status handling, model selection |
| executing-plans | 🟢 CONFIRMED | Sequential task execution, checkpoint workflow |
| verification | 🟢 CONFIRMED | Gate function, evidence requirements |
| using-git-worktrees | 🟢 CONFIRMED | Isolation detection, fallback, cleanup provenance |
| finishing-branch | 🟢 CONFIRMED | Environment detection, 4/3 options, cleanup logic |
| receiving-review | 🟢 CONFIRMED | Push-back criteria, YAGNI check, source-specific handling |
| requesting-review | 🟢 CONFIRMED | Reviewer dispatch, action criteria |
| dispatching-parallel | 🡡 INFERIDO | Matrix documented, orchestration orchestration-dependent |
| writing-skills | 🡡 INFERIDO | Structure documented, creation methodology specialized |
| using-superpowers | 🟢 CONFIRMED | Priority rules, invocation gates |
| caveman-help | 🟢 CONFIRMED | Reference card structure |
| caveman-stats | 🔴 LACUNA | Hook-injected, model doesn't compute |
| caveman-compress | 🡡 INFERIDO | Compression rules documented, Python CLI not reviewed |

---

## Summary

**21 AI agent workflow skills** organized in **5 categories**:
1. **Communication (7):** Compression & feedback tone (caveman, cavecrew, reviews)
2. **Workflow (6):** Multi-step processes (brainstorming → plans → execution → finish)
3. **Development (3):** Core disciplines (TDD, debugging, verification)
4. **Quality (2):** Code review patterns (receiving, requesting)
5. **Advanced (3):** Parallelization, skill creation, superpowers invocation

**Key architectures:**
- TDD cycle (RED-GREEN-REFACTOR)
- 4-phase debugging (investigation → analysis → hypothesis → implementation)
- 2-stage subagent review (spec compliance + code quality)
- Workspace isolation with provenance detection
- Evidence-first verification gate

**Data model:** Skills as JSON-serializable workflow metadata + structured code examples. No traditional DB; git-based distribution.

**Quality focus:** Red-flag lists, rationalization tables, enforcement gates throughout. Discipline skills explicitly counter psychological loopholes.

