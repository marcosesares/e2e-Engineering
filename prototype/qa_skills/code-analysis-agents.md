# Code Analysis — Agents Module

**Analysis Date:** 2026-05-21  
**Module:** Agents (qa-investigate, qa-implement)  
**Doc Level:** Detalhado  

---

## Executive Summary

Agents module defines two specialized autonomous Claude Code agents that extend the QA workflow orchestration framework. Both are Sonnet-model agents, designed to handle the investigation and implementation phases of QA automation work.

**Architecture:**
- **qa-investigate** — Read-only codebase investigator; locates files, traces logic, identifies root causes
- **qa-implement** — Code writer; executes approved plans and fixes following project conventions

Both agents integrate with the Skills module workflows (`work-on`, `fix-qa-bug`, `implement-story`) by receiving structured input files and producing investigation/implementation artifacts.

**Confidence:**
- 🟢 CONFIRMADO — Agent definitions, process steps, tool permissions
- 🟡 INFERIDO — Error handling strategies, edge cases in plan interpretation
- 🔴 LACUNA — Actual agent performance metrics, handling of large codebases

---

## 1. Fluxo de Controle — Agent Lifecycle

### 1.1 Agent Invocation Pattern

**Calling Skill:** Any workflow skill (fix-qa-bug, implement-story, plan-change, etc.)  
**Entry Point:** Agent( { name, model, tools, skills } )

```
Workflow Skill
  ├─→ Prepare inputs:
  │   ├─ Jira brief file (from fetch-jira-item)
  │   ├─ Investigation file (if bug fix or story)
  │   ├─ Plan file (if story or change)
  │   └─ Output file path (where agent writes result)
  │
  ├─→ Invoke qa-investigate Agent
  │   ├─ Input: task, jira_brief_path, output_file_path
  │   ├─ Model: Sonnet
  │   ├─ Tools: Read, Glob, Grep, Bash
  │   ├─ Skills: principles (loaded via frontmatter)
  │   └─ Output: investigation.md file
  │
  ├─→ Invoke qa-implement Agent (after user approves investigation)
  │   ├─ Input: plan_or_fix_path, investigation_file_path, jira_brief_path
  │   ├─ Model: Sonnet
  │   ├─ Tools: Read, Write, Edit, Glob, Grep, Bash
  │   ├─ Skills: principles
  │   └─ Output: summary of changes made
  │
  └─→ Workflow Skill: Process agent results + route next step
```

**Confidence:** 🟢 CONFIRMADO (agent definitions §2, invocation pattern clear)

---

### 1.2 QA Investigation Agent — Detailed Flow

**Agent:** `qa-investigate`  
**Purpose:** Analyze codebase to understand bug root causes or story context

```
qa-investigate
  │
  ├─→ Step 1: Load project context
  │   ├─ Read .claude/skills/repo-context/SKILL.md
  │   └─ Understand: test location conventions, helper patterns, config structure
  │
  ├─→ Step 2: Read Jira brief
  │   └─ Path: $USERPROFILE/.claude/workflows/{issue-key}/jira-fetch-brief.md
  │   └─ Extract: issue type, summary, description, attachments
  │
  ├─→ Step 3: Locate relevant files
  │   ├─ Use repo-context naming conventions
  │   ├─ Find test file(s)
  │   ├─ Find supporting files: page objects, helpers, config, element maps
  │   └─ Tools: Glob (for patterns), Grep (for symbols), Read (full context)
  │
  ├─→ Step 4: Read and trace flow
  │   ├─ Read test code end-to-end
  │   ├─ Follow execution path through utilities
  │   ├─ Document step-by-step expectations
  │   └─ Trace dependencies: what each function/class depends on
  │
  ├─→ Step 5: Identify the issue
  │   │
  │   ├─ **For bugs:**
  │   │  ├─ Where in flow failure occurs
  │   │  ├─ Expected vs. actual behavior
  │   │  └─ Root cause category:
  │   │     ├─ Stale reference (outdated selector, API path)
  │   │     ├─ Timing (race condition, implicit wait issue)
  │   │     ├─ Logic error (test assertion wrong, setup incomplete)
  │   │     ├─ State issue (shared state pollution, test isolation)
  │   │     ├─ Product bug (not a test bug)
  │   │     └─ Other
  │   │
  │   └─ **For stories:**
  │      ├─ Existing related tests/patterns
  │      ├─ Available utilities and abstractions
  │      └─ Gaps to fill
  │
  ├─→ Step 6: Check recent history
  │   ├─ git log --oneline -20 (project activity)
  │   ├─ git log --oneline -- {files} (file-specific changes)
  │   └─ Correlate: recent commits vs. issue
  │
  ├─→ Step 7: Write investigation brief
  │   ├─ Output: {$USERPROFILE}/.claude/workflows/{issue-key}/investigation.md
  │   ├─ Sections:
  │   │  ├─ Work Item (summary from Jira brief)
  │   │  ├─ Relevant Files (table of paths + purpose)
  │   │  ├─ Findings (detailed analysis)
  │   │  ├─ Root Cause Category (bugs only)
  │   │  ├─ Patterns Observed (conventions found)
  │   │  ├─ Recent History (relevant commits)
  │   │  ├─ Recommendations (next steps)
  │   │  └─ Gaps (what you couldn't find)
  │   │
  │   └─ Write tool: ONLY used for investigation.md, not other project files
  │
  └─→ Step 8: Return routing summary
      ├─ Task: {summary}
      ├─ Files found: {count} relevant files
      ├─ Root cause: {category} (bugs) or Key finding: {summary} (stories)
      └─ Brief written to: {output file path}
```

**Key Constraints:**
- **Read-only** — no edits to project files
- **Write only for investigation.md** — output file only
- **No assumptions** — discover facts from actual codebase
- **Read complete files** — not just grep snippets for context

**Confidence:** 🟢 CONFIRMADO (qa-investigate.md §2–8)

---

### 1.3 QA Implementation Agent — Detailed Flow

**Agent:** `qa-implement`  
**Purpose:** Execute code changes following approved plans and project conventions

```
qa-implement
  │
  ├─→ Step 1: Read inputs
  │   ├─ Plan or fix approach
  │   │  ├─ Path: $USERPROFILE/.claude/workflows/{issue-key}/plan.md
  │   │  └─ OR: fix description from workflow
  │   ├─ Investigation brief
  │   │  └─ Path: $USERPROFILE/.claude/workflows/{issue-key}/investigation.md
  │   ├─ Jira brief (optional)
  │   │  └─ Path: $USERPROFILE/.claude/workflows/{issue-key}/jira-fetch-brief.md
  │   └─ Also read: .claude/skills/repo-context/SKILL.md
  │
  ├─→ Step 2: Implement changes
  │   │
  │   ├─ **For bug fixes:**
  │   │  ├─ Address root cause from investigation
  │   │  ├─ Keep change minimal
  │   │  ├─ If product bug (not test bug): flag, don't workaround
  │   │  └─ Verify fix resolves issue without side effects
  │   │
  │   └─ **For story implementations:**
  │      ├─ Follow approved plan step-by-step
  │      ├─ Create/modify files in plan order
  │      ├─ If conflict found: pause and flag, don't deviate silently
  │      └─ Each change:
  │         ├─ 1. Read target file first (or pattern example from brief)
  │         ├─ 2. Make change following conventions
  │         └─ 3. Move to next step
  │
  │   Tools used per step:
  │   ├─ Read: Load files to understand structure
  │   ├─ Glob: Find related files by pattern
  │   ├─ Grep: Locate symbols, imports, usages
  │   ├─ Edit: Modify existing file
  │   ├─ Write: Create new file
  │   └─ Bash: Run tests, build, git commands (if needed)
  │
  ├─→ Step 3: Return summary
  │   ├─ Changes made:
  │   │  ├─ File path: what changed
  │   │  ├─ ...
  │   │  └─ ...
  │   ├─ Files created: {count}
  │   ├─ Files modified: {count}
  │   └─ Issues noticed (not fixed): {list or None}
  │
  └─→ If blocked:
      └─ Explain clearly so orchestrator can address
```

**Guiding Principles (loaded via principles skill):**

1. **Minimal scope** — change only what's needed; note but don't fix unrelated issues
2. **Follow existing patterns** — match project style, structure, conventions
3. **Maintainability first** — straightforward, readable code (team has mixed technical depth)
4. **Preserve test intent** — fix bugs correctly without changing what's tested; ensure stories test acceptance criteria
5. **Runtime awareness** — avoid unnecessary waits, redundant checks, heavyweight patterns

**Confidence:** 🟢 CONFIRMADO (qa-implement.md §1–3)

---

## 2. Algoritmos & Lógica de Negócio

### 2.1 File Location Algorithm (qa-investigate)

**Input:** Task description, Jira brief, repo-context conventions  
**Output:** List of relevant files (test, page objects, helpers, config)

**Algorithm:**

```
Given: repo-context with directory structure + naming conventions

1. Parse task to understand what's being investigated
   ├─ Bug: Extract failing test name / test file reference
   └─ Story: Extract feature/module name

2. Apply repo-context patterns
   ├─ If test name given: translate to file path using conventions
   ├─ Use Glob to find matching test files
   ├─ Example: "test_cost_calculation" → "tests/features/cost/test_calculation.cs"

3. For each test file found:
   a) Read file completely
   b) Extract dependencies:
      ├─ Page objects referenced
      ├─ Helper classes/utilities
      ├─ Configuration loaded
      ├─ Element locators / maps
      └─ Base test classes
   
   c) Locate supporting files:
      ├─ Page object: repo-context pattern (e.g., tests/pages/CostPage.cs)
      ├─ Helpers: repo-context pattern (e.g., tests/helpers/StepHelpers.cs)
      ├─ Config: repo-context pattern (e.g., config/test-config.json)
      └─ Element maps: repo-context pattern (e.g., locators/cost-locators.yml)

4. Recursively include supporting files' dependencies
   ├─ If page object uses helper, include helper
   ├─ Stop at framework classes (don't include NUnit, Playwright, etc.)
   └─ Limit depth to prevent infinite loops

5. Return: Map { file_path → purpose }
```

**Confidence:** 🟡 INFERIDO (process §3 describes "Locate relevant files", algorithm inferred from step description)

---

### 2.2 Root Cause Classification (qa-investigate)

**Input:** Test failure analysis from Step 5  
**Output:** Root cause category + evidence

**Categories & Detection:**

| Category | Signals | Evidence |
|---|---|---|
| **Stale reference** | Selector not found, API path 404, element ID changed | grep for old selector in code; check git log for recent UI/API changes |
| **Timing** | Test passes sometimes, fails under load, wait timeouts | Check for hardcoded sleeps, implicit waits, race conditions in code |
| **Logic error** | Assertion fails, setup incomplete, wrong expected value | Read test assertion logic; compare actual test steps to documented acceptance criteria |
| **State issue** | Test passes alone, fails in suite; shared state pollution | Check for test isolation: shared fixtures, database state, file system artifacts |
| **Product bug** | Test correct but product behaves unexpectedly | Verify test matches requirements; check if product bug already reported |
| **Other** | None of above | Document findings for investigation |

**Detection Algorithm:**

```
1. Review test failure details
   ├─ Error message
   ├─ Stack trace (if available)
   └─ Expected vs. actual

2. Read test code
   ├─ Check selectors/locators match current UI
   ├─ Check setup/teardown for completeness
   ├─ Review assertions for correctness
   └─ Look for hardcoded sleeps or timing issues

3. Check git history
   ├─ Recent changes to: test, page objects, locators, product
   ├─ If product changed: might be product bug
   ├─ If test changed recently: might have introduced issue

4. Classify
   ├─ If selector/path changed: Stale reference
   ├─ If timing-related: Timing
   ├─ If logic mismatch: Logic error
   ├─ If state pollution: State issue
   ├─ If product bug: Product bug
   └─ Else: Other

5. Document root cause + evidence
   └─ Point to specific code lines for fix
```

**Confidence:** 🟡 INFERIDO (categories listed in Step 5 output template, detection logic inferred)

---

### 2.3 Plan Interpretation Algorithm (qa-implement)

**Input:** plan.md file with step-by-step instructions  
**Output:** Ordered list of changes to make

**Algorithm:**

```
1. Read plan.md
   ├─ Parse structure (usually: What changes, Order, Patterns, Test coverage)
   ├─ Extract ordered steps
   └─ Identify decision points

2. For each step:
   a) Determine type:
      ├─ Create file: needs content, location
      ├─ Modify file: needs target, what to change
      ├─ Refactor: needs scope, pattern to apply
      └─ Configure: needs setting, value
   
   b) Read context:
      ├─ Example file from investigation brief (pattern to follow)
      ├─ Existing file in project (if modifying)
      └─ Related files (for understanding conventions)
   
   c) Execute change:
      ├─ Use Write for new files
      ├─ Use Edit for modifications
      ├─ Use Glob to find all affected files (if pattern-based change)
      └─ Use Bash for structural changes (e.g., move, rename)
   
   d) Verify:
      ├─ If test code: check it compiles / syntax valid
      ├─ If config: check it parses (JSON, YAML, etc.)
      └─ If refactor: check call sites still valid

3. If conflict found:
   ├─ Step mentions something not found in codebase
   ├─ Plan assumption doesn't match reality
   ├─ Two steps conflict
   └─ Action: Pause and explain conflict; don't deviate silently

4. Return summary:
   ├─ Files created: [list]
   ├─ Files modified: [list]
   ├─ Issues noticed: [list or None]
   └─ Blockers: [if any, explain clearly]
```

**Conflict Handling — Key Rule:**  
"If you encounter something during implementation that conflicts with the plan, pause and flag it rather than silently deviating"

**Confidence:** 🟢 CONFIRMADO (Step 2 process description, conflict handling in qa-implement.md §2)

---

## 3. Estruturas de Dados

### 3.1 Agent Frontmatter Metadata

**Format:** YAML frontmatter in agent definition files  
**Purpose:** Register agent name, capabilities, dependencies

**Structure:**

```yaml
---
name: qa-investigate
description: >
  Investigate the codebase to understand a problem or area of code. 
  Reads repo-context for project-specific guidance, locates relevant source files, 
  and traces logic. Launched by workflow skills.
tools: Read, Glob, Grep, Bash
model: sonnet
skills:
  - principles
---
```

**Fields:**
- `name` — Agent ID (qa-investigate, qa-implement)
- `description` — Purpose + use cases
- `tools` — List of tools agent has access to (comma-separated)
- `model` — Claude model (sonnet for both agents)
- `skills` — Skills loaded via frontmatter (principles loaded for both)

**Confidence:** 🟢 CONFIRMADO (observed in both agent files)

---

### 3.2 Investigation Brief Structure

**File Location:** `$USERPROFILE/.claude/workflows/{issue-key}/investigation.md`  
**Generated by:** qa-investigate agent (Step 7)  
**Consumed by:** qa-implement agent (as input), workflow skill (for decision)

**Markdown Structure:**

```markdown
# Investigation Brief: {task summary}

## Work Item

{issue key and summary from the Jira brief}

## Relevant Files

| File | Purpose |
|------|---------|
| path/to/test.cs | The failing test / test to modify |
| path/to/page.cs | Page object used by the test |
| path/to/helper.cs | Shared test utility |
| ... | ... |

## Findings

{What you discovered — for bugs: detailed root cause analysis. For stories: existing patterns, available utilities, what's needed.}

## Root Cause Category (bugs only)

{One of: stale reference | timing | logic error | state issue | product bug | other}

## Patterns Observed

{Conventions, base classes, naming patterns, test organization patterns found in codebase}

## Recent History

{Relevant recent commits that may relate to the issue}

## Recommendations

{Specific guidance for the next step — what to fix, what to build on, what to watch out for}

## Gaps

{Anything you looked for but couldn't find; limitations of this investigation}
```

**Example (Bug):**

```markdown
# Investigation Brief: Cost calculation incorrect for scenario type A

## Work Item

QA-5678: Cost calculation returns wrong result for scenario type A

## Relevant Files

| File | Purpose |
|------|---------|
| tests/features/cost/TestScenarioCalculation.cs | Test case checking cost calculation for Type A scenario |
| tests/pages/CostPage.cs | Page object for Cost Library UI |
| tests/helpers/StepHelpers.cs | Common setup/teardown for cost tests |
| tests/locators/cost-locators.yml | Element locators for Cost Library |

## Findings

The test creates a Type A scenario with cost input 1000, expects result 1200 (20% markup). 
Actual result: 1000 (no markup applied).

Traced execution:
1. Test calls CostPage.EnterScenario("Type A", 1000)
2. CostPage reads scenario type selector from cost-locators.yml (ID: scenario-type-select)
3. Selector works correctly; Type A is selected
4. Test calls CostPage.ClickCalculate()
5. ClickCalculate finds button and clicks (UI works)
6. Test reads result from cost-result field (ID: final-cost-display)
7. **Issue found:** locators.yml has OLD ID "cost-result-old" instead of new ID "final-cost-display"

The product UI was updated 5 days ago (commit abc123) to rename the result field ID.
The locators file was not updated.

## Root Cause Category

**Stale reference** — element locator ID out of sync with product

## Patterns Observed

- Test files: CamelCase naming, suffix convention `Test*`
- Page objects: One per feature (CostPage for cost features)
- Locators: YAML file, structure { selector_name: id_or_xpath }
- Helpers: Shared setup (database seeding, user login)

## Recent History

```
abc123 (5 days ago) - Update Cost Library UI result field ID
def456 (2 days ago) - Add test for scenario adjustment
ghi789 (today) - Bug report: cost calculation broken
```

## Recommendations

Update cost-locators.yml:
- Change `cost-result-old` → `final-cost-display`

Also audit other locators in that file for similar staleness.

## Gaps

- Didn't check if other features also have stale locators (scope limited to cost calculation)
- Didn't verify if product has other breaking UI changes
```

**Confidence:** 🟢 CONFIRMADO (structure defined in qa-investigate.md §7)

---

### 3.3 Implementation Plan Structure

**File Location:** `$USERPROFILE/.claude/workflows/{issue-key}/plan.md`  
**Generated by:** plan-change skill (or externally)  
**Consumed by:** qa-implement agent

**Markdown Structure (per plan-change SKILL.md):**

```markdown
# Implementation Plan: {brief description}

## What Changes

- File A: {purpose of change}
- File B: {purpose of change}
- File C: {new file; purpose}

## Order of Operations

1. {Step 1 — modify File A}
2. {Step 2 — create File B}
3. {Step 3 — modify File C}
4. {etc.}

## Patterns to Follow

From investigation / repo-context:
- Page objects extend `BasePage`
- Test methods have naming pattern `Test*`
- Helpers use `static` utility methods
- Locators in YAML; selector names follow `{feature}_{element}` pattern

## Test Coverage

- Existing test: `TestXyz` covers happy path
- New test needed: `TestXyz_EdgeCase` for edge case
- Run: `dotnet test tests/features/cost/*.cs` to verify

## Risks or Open Questions

- Refactoring may affect other tests (audit needed post-fix)
- Database state handling (ensure cleanup in teardown)
```

**Confidence:** 🟡 INFERIDO (structure inferred from plan-change SKILL.md)

---

### 3.4 Agent Tool Permissions

**Agent:** qa-investigate  
**Tools Allowed:**
- `Read` — read-only file access
- `Glob` — find files by pattern
- `Grep` — search file contents
- `Bash` — run shell commands (git log, etc.)

**Constraint:** Write tool NOT allowed (except for output file)

**Agent:** qa-implement  
**Tools Allowed:**
- `Read` — read files
- `Write` — create new files
- `Edit` — modify existing files
- `Glob` — find files
- `Grep` — search contents
- `Bash` — run commands (test, build, git)

**Constraint:** Can modify project files (not read-only)

**Confidence:** 🟢 CONFIRMADO (tools listed in agent definitions)

---

## 4. Metadados & Configurações

### 4.1 Agent Model Selection

**Model:** Sonnet (both agents)  
**Rationale:**  
- Balanced for code understanding + generation
- Lower cost than Opus
- Sufficient for QA automation scope (not large system design)
- Fast enough for interactive workflows

**Confidence:** 🟢 CONFIRMADO (both agent definitions specify model: sonnet)

---

### 4.2 Skill Dependencies

**Both Agents Load:**
- `principles` — QA automation principles (7 core principles)

**Principles Enforced:**
1. This is test code, not a product
2. Clarity over defensiveness
3. Maintainability first
4. Test runtime matters
5. Exercise the real interface
6. Scope discipline
7. Diagnosable failures over silent recovery

**Application:**
- qa-investigate uses principles to guide what to look for (e.g., "favor diagnosable failures" → check error messages are clear)
- qa-implement uses principles to guide code changes (e.g., "maintainability first" → write readable code, don't over-engineer)

**Confidence:** 🟢 CONFIRMADO (skill dependencies in agent frontmatter, principles from principles/SKILL.md)

---

### 4.3 Workflow Integration

**Calling Pattern:**

```
Work-on (routing skill)
  ├─→ fix-qa-bug or implement-story (based on issue type)
  │  │
  │  ├─→ Step 1: Invoke qa-investigate
  │  │   ├─ Pass: task, jira_brief_path, output_file_path
  │  │   └─ Receive: investigation.md written
  │  │
  │  ├─→ Step 2: User reviews investigation
  │  │   └─ Decision: proceed with fix or ask questions?
  │  │
  │  ├─→ Step 3: Plan change (if story) or approve fix (if bug)
  │  │   └─ Output: plan.md or fix description
  │  │
  │  ├─→ Step 4: Invoke qa-implement
  │  │   ├─ Pass: plan_path, investigation_path, jira_brief_path
  │  │   └─ Receive: summary of changes made
  │  │
  │  └─→ Step 5: User reviews changes
  │      ├─ Decision: commit or request revisions?
  │      └─ If approved: invoke commit-change skill
  │
  └─→ Return: Change committed and linked to work item
```

**Data Flow:**

```
fetch-jira-item
  ├─→ jira-fetch-brief.md
  │
  ├─→ qa-investigate
  │   ├─ Input: jira-fetch-brief.md
  │   ├─ Input: repo-context/SKILL.md
  │   └─ Output: investigation.md
  │
  ├─→ plan-change (if story)
  │   ├─ Input: investigation.md
  │   └─ Output: plan.md
  │
  └─→ qa-implement
      ├─ Input: investigation.md
      ├─ Input: plan.md (or fix description)
      └─ Output: [modified project files] + summary
```

**Confidence:** 🟡 INFERIDO (integration pattern inferred from skills' descriptions and agent workflows)

---

## 5. Principais Fluxos

### 5.1 Bug Fix Workflow

```
User: "fix QA-5678"
  ↓
work-on fetches QA-5678 (type=Bug)
  ↓
fix-qa-bug [QA-5678]
  │
  ├─→ invoke qa-investigate
  │   ├─ Input: task="investigate the bug described in QA-5678"
  │   ├─ Input: jira_brief_path, output_file="investigation.md"
  │   └─ Output: investigation.md (root cause identified)
  │
  ├─→ User reviews investigation
  │   ├─ Question 1: "Is the root cause clear?" (yes/no)
  │   └─ Decision: proceed with fix?
  │
  └─→ invoke qa-implement
      ├─ Input: fix_description="Fix stale element locator (see investigation.md)"
      ├─ Input: investigation_path, jira_brief_path
      ├─ Workflow:
      │  ├─ Read investigation.md (understand root cause)
      │  ├─ Read target file (cost-locators.yml)
      │  ├─ Make fix: cost-result-old → final-cost-display
      │  └─ Verify: reload locators, check syntax
      └─ Output: summary of changes
  
  ↓
User reviews changes
  ├─ Approves: invoke commit-change
  ├─ Requests revisions: invoke qa-implement again with feedback
  └─ Rejects: abandon or escalate

  ↓ (if approved)
commit-change
  ├─ Commit message: "Fix cost calculation bug (QA-5678): update stale element locator"
  └─ Link commit to QA-5678
```

**Confidence:** 🟢 CONFIRMADO (fix-qa-bug referenced in work-on routing; agent workflows documented)

---

### 5.2 Story Implementation Workflow

```
User: "implement QA-1234"
  ↓
work-on fetches QA-1234 (type=Automation Story)
  ↓
implement-story [QA-1234]
  │
  ├─→ invoke qa-investigate
  │   ├─ Input: task="investigate existing test patterns for cost scenarios"
  │   └─ Output: investigation.md (existing tests, utilities, patterns)
  │
  ├─→ User reviews investigation + considers requirements
  │
  └─→ plan-change [story description]
      ├─ Clarifying questions answered
      ├─ Implementation plan created (what files, order, patterns)
      └─ User approves plan
  
  ├─→ invoke qa-implement
  │   ├─ Input: plan_path, investigation_path
  │   ├─ Workflow:
  │   │  ├─ Step 1 (from plan): Create test file TestNewScenario.cs
  │   │  │ ├─ Read: existing test pattern (TestScenarioCalculation.cs)
  │   │  │ ├─ Create: new test following pattern
  │   │  │ └─ Add: step definitions
  │   │  │
  │   │  ├─ Step 2: Add helper method in StepHelpers.cs
  │   │  │ ├─ Read: StepHelpers.cs (understand pattern)
  │   │  │ ├─ Add: new helper method
  │   │  │ └─ Verify: signature matches usage in test
  │   │  │
  │   │  └─ Step 3: Add locators to cost-locators.yml
  │   │     ├─ Read: existing locators (understand YAML structure)
  │   │     ├─ Add: new selectors
  │   │     └─ Verify: YAML parses correctly
  │   │
  │   └─ Output: summary (3 files: 1 created, 2 modified)
  │
  ├─→ User reviews changes
  │   ├─ Questions: ask for clarification / revisions
  │   └─ Approves: move forward
  │
  └─→ commit-change
      ├─ Commit message: "Implement story QA-1234: add cost scenario tests"
      └─ Link commit to QA-1234
```

**Confidence:** 🟡 INFERIDO (implement-story skill mentioned but not fully detailed; workflow inferred from agent processes)

---

## 6. Entidades Chave

### 6.1 Agent Execution Environment

**Model:** Claude Sonnet (both agents)  
**Tools Available:**
- File operations (Read, Write, Edit, Glob)
- Code search (Grep, Bash)
- Execution (Bash for tests, builds)

**Input Files (in $USERPROFILE/.claude/workflows/{issue-key}/):**
- `jira-fetch-brief.md` — work item details (from fetch-jira-item)
- `investigation.md` — codebase analysis (from qa-investigate)
- `plan.md` — implementation plan (from plan-change)

**Output Files:**
- `investigation.md` — (qa-investigate writes)
- `[modified project files]` — (qa-implement writes)

**Confidence:** 🟢 CONFIRMADO (agent definitions, workflow integration)

---

### 6.2 Repo Context Integration

**Both agents read:**
- `.claude/skills/repo-context/SKILL.md`

**From repo-context, agents extract:**
- Directory structure (where tests, helpers, page objects live)
- Naming conventions (test file pattern, helper naming)
- Framework setup (base test classes, fixtures, test runners)
- Project-specific investigation techniques
- Common failure patterns

**Example (Cost Library):**
```
Test files: tests/features/cost/*.cs
Page objects: tests/pages/CostPage.cs
Helpers: tests/helpers/StepHelpers.cs
Locators: tests/locators/cost-locators.yml
Naming: Test{FeatureName} (e.g., TestCostCalculation)
Framework: NUnit + Playwright
Base class: BasePage (page objects), BaseTest (tests)
```

**Confidence:** 🟡 INFERIDO (repo-context mentioned in both agents; structure inferred from Skills module analysis)

---

## 7. Lições de Confiança

### 🟢 CONFIRMADO (High Confidence)

- Agent definitions (name, tools, model, skills)
- qa-investigate: 8-step process documented
- qa-implement: 3-step process documented
- Tool permissions per agent
- Frontmatter metadata structure
- Investigation brief template (8 sections)
- Skill loading via frontmatter (principles)
- Root cause categories (6 types)

### 🟡 INFERIDO (Medium Confidence)

- File location algorithm (described at high level, detailed algorithm inferred)
- Plan interpretation algorithm (structure documented, details inferred)
- Workflow integration (inferred from agent I/O descriptions + skills)
- Data flow between agents (inferred from steps)
- Repo-context structure (inferred from agent references)

### 🔴 LACUNA (Information Gaps)

- Error handling in agents (what if file not found, git command fails?)
- Edge cases: large codebases (>1000 files), deep dependency chains
- Performance: how long does investigation take for large repo?
- Concurrency: can multiple agents run on same issue simultaneously?
- Rollback: if qa-implement makes partial changes then fails?
- Conflict handling: how specific is "flag conflict"? What info to include?

---

## 8. Estrutura de Dados Consolidada

**Agents Module Summary:**

| Aspect | Value |
|---|---|
| **Agents** | 2 (qa-investigate, qa-implement) |
| **Model** | Sonnet (both) |
| **Total tools** | 10 (distributed across agents) |
| **Processes documented** | 2 (8 steps + 3 steps) |
| **Input files** | 3 (jira-fetch-brief, investigation, plan) |
| **Output files** | 2+ (investigation.md + project files) |
| **Key algorithms** | 3 (file location, root cause classification, plan interpretation) |
| **Data structures** | 4 (frontmatter, investigation brief, plan, tool permissions) |
| **Skill dependencies** | 1 (principles) |

**Integration Points:**

```
Claude Skills (workflow orchestration)
  ├─→ work-on (routing)
  ├─→ fix-qa-bug (bug fix workflow)
  ├─→ implement-story (story workflow)
  ├─→ plan-change (planning)
  └─→ commit-change (VCS integration)
      │
      ├─→ invoke qa-investigate (understand codebase)
      ├─→ invoke qa-implement (execute changes)
      └─→ receive results (investigation brief, changed files)
```

**Confidence:** 🟢 CONFIRMADO (agent definitions, processes, integration with Skills)

---

## 9. Recomendações para Próximas Análises

1. **Scripts Module:** Analyze 22 PowerShell automation scripts
   - Jira integration scripts (6)
   - ADO integration scripts (10)
   - Utilities (3)

2. **Deep dive — Error handling:**
   - What happens if qa-investigate can't find the test file?
   - What if qa-implement encounters file system errors?
   - Recovery strategies

3. **Performance baseline:**
   - Time to investigate medium-size codebase (100 files)
   - Time to implement small change (1 file modification)
   - Time to implement medium story (3 files)

4. **Rollback & safety:**
   - How are failed changes handled?
   - Is there automatic rollback or user approval before commits?
   - What prevents partial implementations from being committed?

---

**Analysis Complete — Agents Module**

**Modules Analyzed:** 2 of 5 (Claude Skills, Agents)  
**Estimated Time for Remaining:** 3–4 hours  
**Next Modules:** Scripts (22 PS1 files), Setup & Configuration, CI/CD Pipelines
