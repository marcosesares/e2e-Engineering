# Agents Module

---

## Overview

Agents module defines two specialized Claude Code agents (qa-investigate, qa-implement) that execute read-only investigation and code-writing tasks in QA automation workflows. Both use Sonnet model; invoked by workflow skills (fix-qa-bug, implement-story, plan-change).

---

## Responsibilities

- Analyze codebase to locate test files, helpers, patterns; trace execution flow 🟢
- Identify bug root causes (stale reference, timing, logic, state, product) 🟡
- Write investigation briefs documenting findings and recommendations 🟢
- Execute approved code changes following repo-context conventions 🟢
- Follow project principles (readability, real interfaces, scope discipline) 🟢
- Provide clear summary of work performed 🟢

---

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| RF-01 | qa-investigate reads repo-context, Jira brief, locates relevant files, traces flow, writes investigation.md | Must |
| RF-02 | qa-investigate categorizes bug root causes (stale ref, timing, logic, state, product, other) | Should |
| RF-03 | qa-investigate checks git history; correlates recent commits vs issue | Should |
| RF-04 | qa-implement reads plan, investigation, Jira brief; executes code changes; returns summary | Must |
| RF-05 | qa-implement respects approved plan scope; no out-of-scope changes | Must |
| RF-06 | Both agents load principles skill; governed by project QA principles | Must |
| RF-07 | qa-investigate is read-only; never modifies project files (except investigation.md output) | Must |
| RF-08 | qa-implement edits only files and directories in approved plan | Must |

---

## Non-Functional Requirements

| Type | Requirement | Confidence |
|------|-------------|------------|
| Safety | qa-investigate must not attempt shell commands that modify files | 🟢 |
| Correctness | qa-implement must follow patterns found in codebase, not invent new patterns | 🟡 |
| Clarity | Investigation brief must be human-reviewable; findings cited with line numbers | 🟡 |

---

## Acceptance Criteria

```gherkin
Given a bug in a test file
When qa-investigate runs
Then investigation.md contains: Work Item, Relevant Files table, Findings, Root Cause, Patterns, Recent History, Recommendations, Gaps

Given an approved fix plan
When qa-implement runs
Then changed files list is returned; changes respect repo-context conventions; no files edited outside plan scope
```

---

## Code Traceability

| Symbol | File | Confidence |
|--------|------|------------|
| qa-investigate agent | AGENT.md | 🟢 |
| qa-implement agent | AGENT.md | 🟢 |
