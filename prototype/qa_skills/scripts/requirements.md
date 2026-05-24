# Scripts Module

## Overview

PowerShell scripting layer wrapping Jira Cloud REST API and Azure DevOps MCP. 22 deterministic scripts handle fetching, creating, updating test cases; generating test plans; managing pull requests.

## Responsibilities

- Fetch Jira issues + attachments; cache in user home 🟢
- Fetch ADO test cases, suites, PRs; parse states 🟢
- Create ADO test case work items with all custom fields in single call 🟢
- Update ADO test cases (fields, steps, state transitions) 🟢
- Manage ADO test suites (resolve, create, add TCs) 🟢
- Generate test plan Markdown from categorization JSON 🟢
- Resolve credentials by precedence (param > env var > error) 🟢

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| RF-01 | Each script returns unified JSON envelope `{ success, data, error }` | Must |
| RF-02 | Credentials resolved: `-Pat` > env var > error (no interactive prompts) | Must |
| RF-03 | All Jira scripts handle API 401/403 errors gracefully | Should |
| RF-04 | ADO TC creation validates all required custom fields before API call | Must |
| RF-05 | Test plan generation supports feature and regression plan shapes | Should |

---

## Non-Functional Requirements

| Type | Requirement | Confidence |
|------|-------------|------------|
| Robustness | No retry logic; fail-fast on API error. `Invoke-AdoApi` and `Invoke-JiraApi` wrap a single `Invoke-RestMethod` in try/catch; on failure return `{ Success=$false; Error }`. No exponential backoff. (Verified by Reviewer 2026-05-23 in `create-ado-test-cases.ps1:55-81`.) | 🟢 |
| Robustness | **No rollback on partial TC creation.** Successful TCs remain in ADO; failures accumulate in `failures[]` with `partial: true` flag when steps/state PATCH fails post-create. Consumer must filter already-created TCs before retry (BR-TC-09 non-idempotency). | 🟢 |
| Performance | **Performance not characterized** beyond theoretical analysis. `create-ado-test-cases.ps1` makes ≥3 sequential API calls per TC (+ optional verification call). 100 TCs ≈ 400 calls. ADO REST API soft caps documented at Microsoft side (~200 req/sec/user). No measured benchmark in repo; recommended before relying on `/apply-test-plan` for >100-TC batches. | 🟡 |
| Determinism | Scripts are stateless; re-runs produce same output (modulo ADO TC creation, which is non-idempotent per BR-TC-09) | 🟢 |

---

## Code Traceability

| Symbol | File |
|--------|------|
| Jira fetch | `fetch-jira-issue.ps1` |
| ADO TC create | `create-ado-test-cases.ps1` |
| Test plan generate | `generate-test-plan-md.ps1` |
