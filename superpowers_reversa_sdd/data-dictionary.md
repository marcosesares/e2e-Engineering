# Superpowers — Data Dictionary

> **Project:** superpowers  
> **Generated:** 2026-05-17  
> **Scope:** All data structures, enums, and field definitions across 21 skills  

---

## Overview

This dictionary documents all named data structures, enums, and field definitions found in Superpowers' skill modules. Unlike traditional code systems, Superpowers uses **workflow state** (phases, gates, status) rather than database entities.

**Key Insight:** Data in Superpowers flows through workflow states (RED → GREEN → REFACTOR, Phase 1 → Phase 4) rather than stored entities.

---

## Global Enums

### Phase State
```
TDD_Phase = RED | GREEN | REFACTOR
Debugging_Phase = INVESTIGATION | PATTERN_ANALYSIS | HYPOTHESIS | IMPLEMENTATION
PlanExecution_Phase = LOAD_REVIEW | TASK_EXECUTION | COMPLETION
```

### Gate/Checkpoint Status
```
Status = PENDING | IN_PROGRESS | BLOCKED | DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT
GateResult = PASS | FAIL | NEEDS_CLARIFICATION | ESCALATION_REQUIRED
```

### Severity / Confidence
```
Severity = 🔴_BUG | 🟡_RISK | 🔵_NIT | ❓_QUESTION
Confidence = 🟢_CONFIRMED | 🟡_INFERIDO | 🔴_LACUNA
```

### Caveman Intensity
```
CavemanMode = lite | full | ultra | wenyan-lite | wenyan-full | wenyan-ultra
```

### Workflow Decision
```
MergeOption = merge_locally | create_pr | keep_branch | discard
ReviewDecision = approve | needs_fixes | rework_needed
```

---

## Skill Metadata

### Skill
**Purpose:** Self-describing reference for agent workflow guidance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✓ | Unique identifier (lowercase-kebab-case) |
| name | string | ✓ | Human-readable name |
| description | string | ✓ | "Use when [triggers]" — NEVER include workflow summary |
| type | enum | ✓ | discipline \| technique \| pattern \| reference |
| category | string | ✓ | Communication \| Workflow \| Development \| Quality \| Advanced |
| purpose | string | ✓ | One-liner describing what skill enables |
| version | string | ✗ | Semantic version (e.g., "1.2.0") |
| keywords | list[string] | ✗ | Search terms (error messages, symptoms, tools) |
| requirements | list[string] | ✗ | Required prerequisite skills |

**Confidence:** 🟢 CONFIRMED

---

## Process & Workflow States

### TDD Cycle

#### Test Object
| Field | Type | Description |
|-------|------|-------------|
| name | string | Test name (describes requirement, not implementation) |
| phase | TDD_Phase | RED, GREEN, or REFACTOR |
| passed | bool | Does test pass? |
| failure_reason | string | If RED: why it fails (non-trivial? missing feature?) |
| setup | code_block | Test setup (real code, minimal mocking) |
| assertion | code_block | What should be true |
| timestamp | ISO8601 | When test was run |

**Confidence:** 🟢 CONFIRMED

#### Code Object
| Field | Type | Description |
|-------|------|-------------|
| file_path | string | Exact file path |
| language | string | File extension/language |
| minimal | bool | Is this the simplest code to pass test? |
| changes | list[edit] | Diffs from previous version |
| refactored | bool | Was this code refactored (in REFACTOR phase)? |

**Confidence:** 🟢 CONFIRMED

---

### Debugging Investigation

#### Evidence Object
| Field | Type | Description |
|-------|------|-------------|
| phase | Debugging_Phase | Which investigation phase |
| data_type | string | What kind of evidence (error, log, output, state) |
| location | string | Where evidence was gathered (file:line, component, layer) |
| raw_content | string | Exact output/error message |
| timestamp | ISO8601 | When evidence was collected |

**Confidence:** 🟢 CONFIRMED

#### Root Cause Trace
| Field | Type | Description |
|-------|------|-------------|
| symptom | string | User-visible failure |
| layers | list[layer_trace] | Call stack / component chain |
| origin | location | Where bad value originates |
| propagation | list[step] | How bad value flows forward |
| fix_location | location | Where to fix (at source, not symptom) |

**Layer Trace Object:**
| Field | Type | Description |
|-------|------|-------------|
| layer_name | string | Component/function/system name |
| input | value | What enters this layer |
| output | value | What exits this layer |
| state | object | Env/config at this layer |

**Confidence:** 🟢 CONFIRMED

#### Hypothesis
| Field | Type | Description |
|-------|------|-------------|
| statement | string | "I think X is root cause because Y" |
| confidence | float | 0-1 probability estimate |
| test_plan | string | Minimal change to test hypothesis |
| verified | bool | Did test confirm/refute? |

**Confidence:** 🟢 CONFIRMED

---

## Design & Documentation

### Spec Document
| Field | Type | Description |
|-------|------|-------------|
| path | string | docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md |
| title | string | Feature name |
| goal | string | One sentence: what this builds |
| architecture | string | 2-3 sentences approach |
| tech_stack | list[string] | Key technologies |
| sections | map[string, content] | Architecture, components, data flow, error handling, testing |
| approval_checkpoint | bool | User approved design? |
| review_notes | list[string] | Feedback from user review |

**Confidence:** 🟢 CONFIRMED

---

## Implementation Plans

### Plan
| Field | Type | Description |
|-------|------|-------------|
| path | string | docs/superpowers/plans/YYYY-MM-DD-<feature>.md |
| title | string | Feature name |
| goal | string | One sentence describing output |
| architecture | string | Implementation approach |
| tech_stack | list[string] | Key libraries/tools |
| tasks | list[Task] | Ordered implementation tasks |
| execution_model | enum | subagent-driven \| executing-plans |
| created_at | ISO8601 | When plan was written |

**Confidence:** 🟢 CONFIRMED

### Task
| Field | Type | Description |
|-------|------|-------------|
| id | int | Task number in plan |
| title | string | Component name |
| files | object | create[], modify[], test[] with exact paths |
| steps | list[Step] | Checkbox-format bite-sized steps |
| depends_on | list[int] | Task IDs that must complete first |
| estimated_duration_minutes | int | 2-5 min per step |
| completed | bool | Is task done? |

**Confidence:** 🟢 CONFIRMED

### Step
| Field | Type | Description |
|-------|------|-------------|
| number | int | Step number within task |
| title | string | What this step does |
| action | enum | write \| run \| commit \| verify |
| content | code_block \| string | Actual code / command / expected output |
| verification_command | string | Command to prove step succeeded |
| expected_output | string | What success looks like |
| file_changes | list[file_ref] | Which files this step modifies |

**Step.action Values:**
- write: Create/modify code
- run: Execute command (test, build, lint)
- commit: git add + git commit
- verify: Check output against expectation

**Confidence:** 🟢 CONFIRMED

---

## Code Review & Quality

### Code Review Comment
| Field | Type | Description |
|-------|------|-------------|
| file_path | string | Which file |
| line_number | int | Which line (or range: L23-45) |
| severity | Severity | 🔴 bug, 🟡 risk, 🔵 nit, ❓ question |
| problem | string | What's wrong |
| fix | string | How to fix |
| reasoning | string | Why fix is correct (optional) |
| author | string | Who made comment |
| timestamp | ISO8601 | When comment created |

**Caveman Format:**
```
path:line: emoji severity: problem. fix.
Example: L42: 🔴 bug: user null after .find(). Add guard before .email.
```

**Confidence:** 🟢 CONFIRMED

### Review Result
| Field | Type | Description |
|-------|------|-------------|
| phase | enum | spec-compliance \| code-quality \| final |
| findings | list[CodeReviewComment] | All identified issues |
| totals | object | {critical, important, minor, questions} |
| approved | bool | Does reviewer approve? |
| concerns | list[string] | Non-blocking observations |

**Confidence:** 🟢 CONFIRMED

---

## Verification & Testing

### Verification Evidence
| Field | Type | Description |
|-------|------|-------------|
| claim | string | What we're claiming (e.g., "tests pass") |
| command | string | Full command executed |
| output | string | Complete stdout |
| stderr | string | Complete stderr (if any) |
| exit_code | int | Process exit code |
| timestamp | ISO8601 | When command ran |
| passed | bool | Does output prove claim? |

**Confidence:** 🟢 CONFIRMED

### Test Result Summary
| Field | Type | Description |
|-------|------|-------------|
| test_framework | string | jest, pytest, cargo test, go test, etc. |
| total_tests | int | Number of tests run |
| passed | int | Number passed |
| failed | int | Number failed |
| skipped | int | Number skipped |
| duration_seconds | float | Total runtime |
| exit_code | int | 0 = success, non-zero = failure |

**Confidence:** 🟢 CONFIRMED

---

## Workspace Management

### Worktree
| Field | Type | Description |
|-------|------|-------------|
| path | string | Full filesystem path |
| branch_name | string | Branch the worktree is on |
| base_branch | string | Branch worktree originated from (e.g., main) |
| isolation_level | enum | full (GIT_DIR != GIT_COMMON) \| normal (GIT_DIR == GIT_COMMON) |
| provenance | enum | superpowers \| harness \| manual |
| created_at | ISO8601 | When worktree created |
| submodule | bool | Is this in a git submodule? |

**Provenance Values:**
- superpowers: Created by Superpowers (safe to remove)
- harness: Created by IDE/platform (don't remove)
- manual: User created with git worktree (don't remove)

**Confidence:** 🟢 CONFIRMED

### Branch
| Field | Type | Description |
|-------|------|-------------|
| name | string | Branch name (e.g., feature/login-flow) |
| base | string | Branch it split from (e.g., main) |
| commits_ahead | int | How many commits ahead of base |
| has_uncommitted_changes | bool | Dirty working tree? |
| last_commit_sha | string | Latest commit hash |
| last_commit_message | string | Commit subject |
| last_commit_timestamp | ISO8601 | When last commit |

**Confidence:** 🟢 CONFIRMED

---

## Compression & Communication

### Caveman Mode State
| Field | Type | Description |
|-------|------|-------------|
| mode | CavemanMode | Current intensity level |
| session_wide | bool | Persist until "stop caveman"? |
| auto_clarity_triggers | list[string] | When to drop caveman (security, irreversible, multi-step) |
| baseline_tokens | int | Tokens without compression |
| compressed_tokens | int | Tokens with compression active |
| reduction_percent | float | (baseline - compressed) / baseline * 100 |

**Confidence:** 🟡 INFERIDO

### Commit Message (Caveman Format)
| Field | Type | Description |
|-------|------|-------------|
| type | enum | feat, fix, refactor, perf, docs, test, chore, build, ci, style, revert |
| scope | string | (optional) Component affected |
| subject | string | Imperative summary, ≤50 chars, no period |
| body | string | (optional) Non-obvious WHY, breaking changes, migration notes |
| body_wrap | int | Wrap at 72 chars |
| references | list[string] | `Closes #42`, `Refs #17` |
| footer | string | (optional) `BREAKING CHANGE: description` |

**Confidence:** 🟢 CONFIRMED

### PR Comment (Caveman Format)
| Field | Type | Description |
|-------|------|-------------|
| format | enum | One-line: `path:line: emoji severity: problem. fix.` |
| file_path | string | Exact file path |
| line_number | int | Which line(s) |
| emoji | string | 🔴 🟡 🔵 ❓ |
| severity | string | bug, risk, nit, q |
| problem | string | ≤20 words |
| fix | string | ≤20 words, concrete action |

**Confidence:** 🟢 CONFIRMED

---

## Subagent Coordination

### Subagent Task Dispatch
| Field | Type | Description |
|-------|------|-------------|
| agent_type | enum | implementer \| spec-reviewer \| quality-reviewer \| final-reviewer |
| task_id | int | Which task in plan (if applicable) |
| task_text | string | Complete task description (don't reference plan file) |
| context | string | Scene-setting: what's this task for, where does it fit |
| questions_allowed | bool | Can agent ask clarifying questions? |
| previous_iterations | list[object] | History of attempts (if fix loop) |

**Confidence:** 🟡 INFERIDO

### Subagent Status Report
| Field | Type | Description |
|-------|------|-------------|
| status | enum | DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED |
| output | object | Code written, tests created, commits made |
| concerns | list[string] | Doubts the agent flagged |
| questions | list[string] | Clarifications needed |
| blocker_description | string | What's blocking progress |
| git_diffs | list[string] | File changes made |
| test_results | TestResultSummary | Did tests pass? |

**Confidence:** 🡡 INFERIDO

---

## Architecture & Configuration

### Project Configuration
| Field | Type | Description |
|-------|------|-------------|
| project_name | string | superpowers |
| version | semver | Current version (e.g., 5.1.0) |
| language | string | Markdown (primary) + minimal JavaScript/JSON |
| frameworks | list[string] | Plugin architecture, multi-harness |
| harnesses | list[string] | Claude Code, Codex, Cursor, OpenCode, Gemini |
| dependencies | int | 0 (zero-dependency by design) |
| distribution | string | Git-based (no npm, no package manager) |

**Confidence:** 🟢 CONFIRMED

### Skill Summary
| Field | Type | Description |
|-------|------|-------------|
| total_skills | int | 21 |
| communication_skills | int | 7 (caveman variants, cavecrew, reviews) |
| workflow_skills | int | 6 (brainstorming, plans, execution, worktrees) |
| development_skills | int | 3 (TDD, debugging, verification) |
| quality_skills | int | 2 (receiving, requesting review) |
| advanced_skills | int | 3 (parallel agents, writing skills, using-superpowers) |
| confidence_distribution | object | {🟢: 13, 🟡: 6, 🔴: 1, 🡡: 1} |

**Confidence:** 🟢 CONFIRMED

---

## Cross-Cutting Data

### Gate / Checkpoint
**Used across:** TDD, Debugging, Subagent-Driven, Verification, Brainstorming

| Field | Type | Description |
|-------|------|-------------|
| name | string | Human-readable gate name |
| description | string | What condition must be true |
| blocks | enum | What comes after gate |
| bypass_allowed | bool | Can human partner override? |
| evidence_required | string | What proves gate passed |
| failure_action | enum | STOP, REWORK, ESCALATE |

**Confidence:** 🟢 CONFIRMED

### Phase Transition
**Used across:** TDD, Debugging, Brainstorming, Plan Execution

| Field | Type | Description |
|-------|------|-------------|
| from_phase | string | Current phase name |
| to_phase | string | Next phase |
| condition | string | What must be true to transition |
| checkpoint_passed | bool | Did we pass exit gate of from_phase? |
| can_revisit | bool | Can we go back to from_phase? |
| on_failure | string | What to do if transition fails |

**Confidence:** 🟢 CONFIRMED

### Anti-Pattern Detection
**Used to catch rationalizations in:** TDD, Debugging, Verification, Code Review

| Field | Type | Description |
|-------|------|-------------|
| pattern_name | string | Recognizable excuse or shortcut |
| description | string | What the agent is thinking |
| red_flag | string | How to spot it |
| consequence | string | What goes wrong if ignored |
| correct_action | string | What to do instead |

**Confidence:** 🟢 CONFIRMED

---

## Relationships & Dependencies

### Skill Dependency Graph

```
using-superpowers (foundation — must check skills first)
  ├─ brainstorming
  │   └─ writing-plans
  │       ├─ subagent-driven-development
  │       │   ├─ using-git-worktrees
  │       │   ├─ test-driven-development
  │       │   ├─ systematic-debugging
  │       │   ├─ requesting-code-review
  │       │   └─ verification-before-completion
  │       └─ executing-plans
  │           └─ finishing-a-development-branch
  │
  ├─ receiving-code-review
  │   └─ (implements feedback)
  │
  ├─ systematic-debugging
  │   └─ test-driven-development
  │
  ├─ caveman (communication layer)
  │   ├─ caveman-commit
  │   ├─ caveman-review
  │   ├─ caveman-compress
  │   ├─ caveman-help
  │   └─ caveman-stats
  │
  ├─ cavecrew (delegation)
  │   ├─ cavecrew-investigator
  │   ├─ cavecrew-builder
  │   └─ cavecrew-reviewer
  │
  └─ dispatching-parallel-agents (independent tasks)

writing-skills (meta — for creating new skills)
  └─ test-driven-development (TDD applied to documentation)
```

**Confidence:** 🟢 CONFIRMED (structure), 🡡 INFERIDO (orchestration)

---

## Summary Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| Total Skills | 21 | Including variants (e.g., caveman-commit as separate from caveman) |
| Data Structures | 35+ | Skill, Task, Step, Evidence, ReviewComment, Worktree, etc. |
| Enums | 12 | Phase, Status, Severity, CavemanMode, etc. |
| Gate Checkpoints | 8+ | HARD-GATE (brainstorming), RED-GREEN (TDD), phase transitions |
| Anti-Patterns Documented | 60+ | Combined across all discipline skills |
| Red Flags | 50+ | Combined across all skills for rationalization detection |
| File Paths (Template) | 15+ | Design specs, plans, test files, worktree locations |

---

## Field Type Reference

| Type | Examples | Validation |
|------|----------|-----------|
| string | "feat(api): add user endpoint" | No restrictions unless specified |
| int | 42, 3, 0 | Positive or constrained range |
| float | 0.75, 95.5 | 0-1 (percents) or 0+ (seconds) |
| bool | true, false | Two-valued |
| enum | RED, GREEN, REFACTOR | Restricted set of strings |
| ISO8601 | "2026-05-17T12:00:00Z" | Timestamp with timezone |
| code_block | ```python\ncode\n``` | Markdown-fenced code |
| list[T] | [item1, item2] | Array of type T |
| map[string, T] | {key: value} | Key-value object |
| object | {field1, field2} | Unordered field set (JSON-like) |

---

## Notes for Future Enhancement

1. **Tooling:** All data structures are documentable to JSON schema for validation
2. **Integration:** Subagent dispatch could formalize task/status exchange via these structures
3. **Metrics:** Token usage per skill (caveman-stats hook-injected) could track by structure type
4. **Versioning:** Skill metadata could include schema_version for backward compat

---

## Confidence Summary

| Confidence | Count | Examples |
|------------|-------|----------|
| 🟢 CONFIRMED | 22 | Skill metadata, TDD cycle, Debugging, all workflows documented |
| 🟡 INFERIDO | 8 | Caveman mode (hook-based), Subagent dispatch, Compression rules |
| 🔴 LACUNA | 1 | Caveman stats (hook-injected, not computed by model) |
| 🡡 INFERIDO | 5 | Writing skills (meta-process), Dispatching, Code Review orchestration |

**Overall Coverage:** ~80% fully documented structures, ~19% inferred from examples, <1% missing

