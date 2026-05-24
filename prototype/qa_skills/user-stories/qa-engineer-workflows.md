# User Stories: QA Engineer Workflows

## Overview

Primary user journeys for QA engineers operating within the BeckTech.QA.Tools ecosystem. Each workflow documents user intent, system interaction, and acceptance criteria tied to implemented skills and scripts. Confidence levels: 🟢 CONFIRMADO (code trace), 🟡 INFERIDO (pattern-based), 🔴 LACUNA (manual validation required).

---

## US-01: Bug Investigation & Repair Workflow

**User Story (🟢)**  
As a QA engineer, I need to investigate a failing test in Azure DevOps or Jira, determine root cause, and apply or request a fix so that the test suite can be restored to health.

**Primary Actor:** QA Engineer  
**Precondition:** 
- Azure DevOps test case marked `Failed` or Jira bug ticket exists
- User has read access to repos, test case history, and associated code

**Main Flow (🟢)**
1. User triggers `/work-on <bug-id>` or `/work-on jira <jira-key>` skill
2. System invokes `qa-investigate` agent with bug scope
3. Agent traces failing test steps, scans related code, identifies root cause
4. Agent generates `investigation.md` with findings (failure mode, suspected code location, confidence level)
5. User reviews findings; if automated fix possible, triggers `/fix-qa-bug <bug-id>`
6. System invokes orchestrator to apply patch, re-run test, attach results to bug ticket
7. Test case status transitions to `Ready` in Azure DevOps; Jira ticket transitions to `Done`

**Alternative Flows (🟡)**
- **Alt 1:** Agent cannot isolate cause → Generates `investigation.md` with 🔴 LACUNA sections, returns to user for manual triage
- **Alt 2:** Fix applied but test still fails → Re-run agent with latest code; loop back to step 3

**Acceptance Criteria (🟢)**
```
Dado a QA bug is assigned in Jira or ADO
Quando user runs /work-on <bug-id>
Então agent generates investigation.md within 5s with confidence markers (🟢/🟡/🔴)

Dado investigation identifies fix location  
Quando user runs /fix-qa-bug <bug-id>
Então patch is applied, test re-runs, status transitions in ADO, Jira transitions to Done, user receives confirmation email

Dado test still fails after fix
Quando user re-runs /work-on
Então agent discovers new state (different error or same error), updates investigation.md with delta markers
```

**Non-Functional Requirements (🟢)**
- Investigation generation: < 5 seconds for typical codebases (< 10k files)
- Bug fix applicability: 80% of common test failures (assertion changes, mock setup, state initialization)
- Rollback safety: All patches committed, reversible via git
- Jira fetch caching: 4-hour TTL to avoid repeated API calls

**Story Points:** 13  
**Status:** 🟢 Implemented (claude-skills: /work-on, /fix-qa-bug; agents: qa-investigate, qa-implement)

---

## US-02: Feature Test Plan Generation & Application

**User Story (🟢)**  
As a QA engineer, I need to generate a comprehensive test plan for a new feature epic or story, then apply that plan to Azure DevOps test cases so that test coverage is traceable and aligned with development scope.

**Primary Actor:** QA Engineer  
**Precondition:**
- Feature epic or user story exists in Jira with acceptance criteria
- Azure DevOps project configured for BeckTech.QA.TestKit

**Main Flow (🟢)**
1. User triggers `/plan-feature-tests <jira-epic-key>` skill
2. System fetches epic from Jira (title, description, linked stories, acceptance criteria)
3. System generates test plan markdown: feature summary, test scenarios (happy path + edge cases), preconditions, postconditions
4. System outputs plan to `~/.claude/fetch-jira-item/<jira-key>/test-plan-<epoch>.md`
5. User reviews plan; if satisfied, runs `/apply-test-plan <jira-epic-key> --type feature`
6. System parses test plan markdown, constructs Operations JSON, validates against schema
7. System invokes ADO bulk TC creation: creates test cases in feature suite, attaches steps from plan, transitions to `Ready`
8. System reports results: N test cases created, M skipped (duplicates), 0 errors
9. Jira epic updated with link to published test suite

**Alternative Flows (🟡)**
- **Alt 1:** Plan has syntax errors → System reports validation failure with line numbers, user edits markdown, re-runs apply
- **Alt 2:** ADO API fails on 1 of 100 TCs → System logs partial failure, returns report with success count + error details, user can retry failed batch

**Acceptance Criteria (🟢)**
```
Dado feature epic exists in Jira  
Quando user runs /plan-feature-tests <epic-key>
Então plan markdown is generated with >= 3 test scenarios per epic and saved to ~/.claude/fetch-jira-item/

Dado plan markdown is approved
Quando user runs /apply-test-plan <epic-key> --type feature
Então test cases are created in ADO, >= 80% success rate on first attempt, remaining failures reported with actionable errors

Dado TC creation succeeds
Então TC title derives from plan scenario name, steps match plan step sequence, suite is linked to epic
```

**Non-Functional Requirements (🟢)**
- Plan generation: < 2 seconds for typical epics (5–10 linked stories)
- TC creation: bulk operation, ~100 TCs per minute sustainable rate
- Idempotency: applying same plan twice skips duplicate TCs (via title + suite path match)
- Cache stability: Jira plan cached until user explicitly clears or 4 hours elapse

**Story Points:** 21  
**Status:** 🟢 Implemented (claude-skills: /plan-feature-tests, /apply-test-plan; scripts: test-plan-feature.ps1, invoke-ado-tc-create.ps1)

---

## US-03: Regression Test Plan & Execution Scope

**User Story (🟢)**  
As a QA engineer, I need to define a regression scope for a release (which modules changed?), generate test cases to cover that scope, and track which regression TCs pass so that we can confidently release with evidence of non-regression.

**Primary Actor:** QA Engineer / Release Manager  
**Precondition:**
- Release branch exists in git with commits since last release
- ADO regression test suite exists (or will be created)
- Modules map to Azure DevOps area paths

**Main Flow (🟡)**
1. User triggers `/plan-regression-tests --branch release/v1.2.0 --since main`
2. System analyzes git diff: identifies which PowerShell scripts, .NET code, CI/CD pipelines changed
3. System maps code changes to modules (Claude Skills, Agents, Scripts, Setup, CI/CD)
4. System generates regression plan: test scenarios per changed module, linking to code changed
5. User reviews plan; runs `/apply-test-plan <release-id> --type regression`
6. System creates regression TC suite in ADO, tags with release version
7. During release validation, team executes TCs in ADO; results feed back to plan tracker

**Alternative Flows (🟡)**
- **Alt 1:** No module mapping exists → System lists files changed, asks user to classify by module, proceeds
- **Alt 2:** Regression plan is empty (no code changed) → System reports "no coverage needed" and exits

**Acceptance Criteria (🟡)**
```
Dado release branch exists
Quando user runs /plan-regression-tests --branch <branch> --since <base-branch>
Então plan identifies >= 80% of code changes by module (confidence 🟡)

Dado plan is generated
Quando user applies plan to ADO
Entonces >= 1 regression TC per changed module, each TC linked to changed code via design.md

Dado regression suite created
Cuando team executes TCs
Entonces results are tracked in ADO; plan document auto-updates with pass/fail summary
```

**Non-Functional Requirements (🟡)**
- Scope analysis: < 3 seconds for typical release (< 50 files changed)
- Module mapping accuracy: 70–80% auto-detection, manual override for edge cases
- TC creation: same as feature plan (100 TCs/min)
- Release blocking: regression suite completion is gated before release approval

**Story Points:** 13  
**Status:** 🟡 Partially Implemented (claude-skills: /plan-regression-tests; apply infrastructure works; module mapping in detective/architect outputs, not yet wired to skill)

---

## US-04: Jira Issue Triage & Fast-Track Fix

**User Story (🟢)**  
As a QA engineer, I need to quickly fetch Jira issue details (title, description, linked PRs, comments), determine if it's a duplicate or already fixed, and decide next action without leaving the terminal.

**Primary Actor:** QA Engineer  
**Precondition:**
- Jira instance configured in setup
- User has Jira read access

**Main Flow (🟢)**
1. User runs `/fetch-jira-item <jira-key>`
2. System queries Jira REST API for issue (title, description, status, assignee, linked items, comments)
3. System caches result in `~/.claude/fetch-jira-item/<jira-key>/issue.json` (TTL 4 hours)
4. System returns formatted summary: issue type, status, linked PRs (if any), recent comments (last 3)
5. User reviews; if duplicate, runs `jira-mark-duplicate <jira-key> <original-key>`
6. If already fixed by merged PR, runs `jira-transition <jira-key> Done`
7. System updates Jira and confirms transition

**Alternative Flows (🟢)**
- **Alt 1:** Jira API timeout → System uses cache if available, reports "using cached data (age: N hours)"
- **Alt 2:** Cache expired → System fetches fresh data, updates cache, returns result

**Acceptance Criteria (🟢)**
```
Dado /fetch-jira-item called  
Cuando Jira API is available
Entonces issue data returned within 1s, cached for 4 hours, subsequent calls use cache

Dado issue is cached
Cuando cache is > 4 hours old
Entonces system refreshes automatically on next call (silent)

Dado user marks duplicate or transitions status
Cuando jira-mark-duplicate or jira-transition called
Entonces Jira is updated, confirmation returned, cache invalidated
```

**Non-Functional Requirements (🟢)**
- Fetch latency: 1 second (includes Jira API call)
- Cache hit rate: > 90% for typical dev session (same issues reviewed multiple times)
- Offline fallback: stale cache returned with age indicator if API unavailable
- Credential resolution: env var → param → error (no plaintext in code)

**Story Points:** 5  
**Status:** 🟢 Implemented (claude-skills: /fetch-jira-item, jira-mark-duplicate, jira-transition; scripts: invoke-jira-*.ps1 suite with cache in ~/.claude/)

---

## US-05: Skill Sync & Update Detection (Setup Automation)

**User Story (🟢)**  
As a QA engineer (team member), I need to know when new skills are available, download them automatically on session start, and refresh them on demand so that I always have the latest test automation tools without manual git pulls.

**Primary Actor:** QA Engineer / Team Lead  
**Precondition:**
- User's repo is a BeckTech.QA.Tools consumer (e.g., test automation repo)
- `shared-skills` remote is configured (points to published-skills branch)

**Main Flow (🟢)**
1. **SessionStart hook fires:** `check-updates.ps1` runs automatically
2. System checks `shared-skills` remote for new commits (compares local version marker vs remote)
3. If update available and age > 4 hours, system prompts: "New skills available. Run `/refresh-setup` to update."
4. User runs `/refresh-setup`
5. `sync-shared-skills.ps1` runs: clones published-skills, diffs against local, pulls new/updated skill files
6. `setup-claude-hooks.ps1` and other setup skills re-run to register hooks
7. System reports: "N files synced, manifest updated, ready to use"
8. User can now call new/updated skills

**Alternative Flows (🟢)**
- **Alt 1:** Network error during sync → Fail-open guard (sync skipped, warning logged, tools continue working)
- **Alt 2:** Manifest corruption detected → Set-based delta recalculates sync list, re-fetches all files

**Acceptance Criteria (🟢)**
```
Dado SessionStart hook executes  
Quando shared-skills has updates
Entonces check-updates detects delta within 5s, user prompted with "/refresh-setup" hint

Dado /refresh-setup called
Entonces sync-shared-skills pulls N new/updated files, skill hooks re-registered, manifest updated
Cuando manifest is updated
Entonces skill calls work with latest code; no manual git required

Dado network unavailable  
Cuando check-updates or sync fails
Entonces system logs error, uses cached manifest, tools continue (fail-open)
```

**Non-Functional Requirements (🟢)**
- Update check latency: < 5 seconds (includes git remote check)
- Update detection frequency: Once per session (4-hour TTL blocks re-check within window)
- Sync time: < 30 seconds for typical incremental sync (5–10 files changed)
- Manifest file: JSON, tracks version hash per skill for drift detection

**Story Points:** 13  
**Status:** 🟢 Implemented (claude-skills: /refresh-setup; scripts: check-updates.ps1, sync-shared-skills.ps1, setup-claude-hooks.ps1)

---

## US-06: New Team Member Onboarding (First-Run Setup)

**User Story (🟢)**  
As a team lead, I need a single command to onboard a new QA engineer to the BeckTech.QA.Tools ecosystem so that they can immediately start using test automation skills without manual configuration.

**Primary Actor:** Team Lead (on behalf of new QA Engineer)  
**Precondition:**
- New engineer has local copy of BeckTech.QA.Tools or consumer repo
- Claude Code is installed
- No prior setup has been run

**Main Flow (🟢)**
1. Team lead runs `/onboard` skill (or new engineer runs it)
2. System validates prerequisites: git, PowerShell, Claude Code, .NET SDK
3. System checks repo state: is this the BeckTech.QA.Tools repo or a consumer?
4. System runs 7 sequential setup skills:
   - `setup-claude-hooks.ps1` → register SessionStart, PreToolUse hooks
   - `setup-jira-credentials.ps1` → prompt for Jira URL, API token (or use env var)
   - `setup-ado-credentials.ps1` → prompt for ADO PAT
   - `setup-mcp-servers.ps1` → register Jira/ADO MCP servers
   - `setup-shared-skills-remote.ps1` → add `shared-skills` git remote (if consumer repo)
   - `sync-shared-skills.ps1` → initial clone of published-skills
   - `notify.ps1` → send summary email to team lead
5. System outputs completion report: all 7 steps OK, user can now run `/work-on`, `/plan-feature-tests`, etc.

**Alternative Flows (🟢)**
- **Alt 1:** Prerequisite missing (e.g., .NET SDK) → System reports missing tool, halts, instructs user to install
- **Alt 2:** MCP server registration fails → Logs warning, continues (non-blocking); user must manually register later
- **Alt 3:** `/onboard` run twice → Detects prior state, asks: "Already set up. Re-run all 7 steps? (y/n)"

**Acceptance Criteria (🟢)**
```
Dado new engineer runs /onboard  
Entonces 7 setup steps execute in sequence, each must complete before next starts

Dado all steps succeed
Cuando engineer runs /work-on <jira-key>
Entonces skill resolves credentials, fetches Jira issue, agent traces code — no manual config needed

Dado prerequisite missing  
Cuando system validates
Entonces clear error message with installation instructions, does not proceed to 7 steps
```

**Non-Functional Requirements (🟢)**
- Onboard duration: < 2 minutes (assuming credentials ready) for typical setup
- Idempotency: Re-running `/onboard` is safe (skips completed steps, re-runs only missing ones)
- Fail-open: Missing optional steps (e.g., MCP server) do not block overall onboard completion
- Email report: Summary sent to team lead with setup status + notes for any manual follow-up

**Story Points:** 21  
**Status:** 🟢 Implemented (claude-skills: /onboard; scripts: 7 setup-*.ps1 scripts, notify.ps1)

---

## US-07: Code Review & PR Feedback (Story Implementation)

**User Story (🟡)**  
As a QA engineer, I need to review a developer's story implementation PR, verify that test coverage is adequate, and approve or request changes so that stories are tested before merge.

**Primary Actor:** QA Engineer  
**Precondition:**
- Pull request exists in Azure DevOps or GitHub
- Story has acceptance criteria and linked feature test plan

**Main Flow (🟡)**
1. Developer creates PR, tags with linked Jira story key
2. QA engineer runs `/review-pr <pr-number>` (or `/review-pr <pr-url>`)
3. System fetches PR metadata: title, commits, files changed, linked issues
4. System retrieves linked story + its feature test plan from Jira
5. System analyzes code changes against test plan scenarios
6. QA engineer reviews analysis; if coverage is adequate, runs `jira-pr-approve <story-key> <pr-url>`
7. Jira story transitions to `In Review`, PR is approved in ADO/GitHub

**Alternative Flows (🟡)**
- **Alt 1:** Code changes exceed test plan scope → System flags with 🟡 and suggests additional test scenarios
- **Alt 2:** Feature test plan is missing → System reports gap, asks QA engineer to generate plan first

**Acceptance Criteria (🟡)**
```
Dado PR is linked to story  
Cuando /review-pr called
Entonces system retrieves story + test plan, analyzes code coverage against plan scenarios

Dado coverage analysis complete
Cuando QA engineer approves
Entonces Jira story transitions, PR approval recorded, link updated

Dado test plan is missing
Cuando /review-pr detects absence
Entonces system reports error, suggests /plan-feature-tests <story-key>
```

**Non-Functional Requirements (🟡)**
- PR analysis: 2–5 seconds (depends on PR size and Jira fetch)
- Coverage matching: 🟡 INFERIDO (pattern-based heuristic, not 100% reliable)
- State transitions: PR approval and Jira transition are atomic (both succeed or both fail)

**Story Points:** 13  
**Status:** 🟡 Partially Implemented (infrastructure: ADO/GitHub PR MCP available; QA story review logic not yet wired)

---

## US-08: Deployment Gate & Smoke Test Validation

**User Story (🔴)**  
As a release manager, I need to run smoke tests on a staging environment before approving production deployment so that critical path failures are caught before release.

**Primary Actor:** Release Manager  
**Precondition:**
- Staging environment deployed with new build
- Smoke test suite exists in ADO with preconditions setup (baseline data, mock auth)

**Main Flow (🔴)**
1. Release manager triggers `/smoke-tests --environment staging --release v1.2.0`
2. System queries ADO for smoke test suite under release tag
3. System executes all TCs in suite (via ADO REST API or local Playwright runner)
4. System collects results: pass/fail per TC, execution time, stderr logs
5. System compares against baseline (all must pass; timing must be within 10% of baseline)
6. If all pass, system reports "Smoke tests OK, safe to promote to production"
7. Release manager approves promotion in ADO; deployment pipeline triggered

**Alternative Flows (🔴)**
- **Alt 1:** Smoke test fails → System captures failure details, halts promotion, notifies release manager + on-call engineer
- **Alt 2:** Execution time regresses > 10% → System reports performance regression, asks for acknowledgment before allowing promotion

**Acceptance Criteria (🔴)**
```
Dado smoke test suite exists
Cuando /smoke-tests triggered
Entonces all TCs execute, results collected within < 5 minutes

Dado all TCs pass
Cuando results compared to baseline
Entonces timing within 10%, release manager can approve promotion

Dado TC fails
Cuando failure captured
Entonces error details logged, on-call notified, promotion blocked
```

**Non-Functional Requirements (🔴)**
- Smoke test execution: < 5 minutes for typical suite (< 20 TCs)
- Baseline maintenance: captured on each successful release, used for next release comparison
- Notification: Slack/email to release manager + on-call engineer on failure

**Story Points:** 21  
**Status:** 🔴 Not Implemented (infrastructure foundation exists; orchestration logic, baseline capture, and gating decision not yet coded)

---

## Summary

| US | Title | Status | Points | Module Owner |
|-----|----------|--------|--------|--------------|
| US-01 | Bug Investigation & Repair | 🟢 | 13 | claude-skills + agents |
| US-02 | Feature Test Plan & Apply | 🟢 | 21 | claude-skills + scripts |
| US-03 | Regression Scope & Tracking | 🟡 | 13 | claude-skills + architect |
| US-04 | Jira Triage & Fast-Track Fix | 🟢 | 5 | claude-skills + scripts |
| US-05 | Skill Sync & Update Detection | 🟢 | 13 | setup + scripts |
| US-06 | Team Member Onboarding | 🟢 | 21 | setup + scripts |
| US-07 | PR Review & Story Approval | 🟡 | 13 | claude-skills (partial) |
| US-08 | Deployment Gate & Smoke Tests | 🔴 | 21 | (not implemented) |

**Coverage:** 6 workflows fully implemented (🟢), 1 partially (🟡), 1 not implemented (🔴).  
**Confidence:** 🟢 CONFIRMADO for workflows tied to live skills (US-01 through US-06); 🟡 INFERIDO for PR review and 🔴 LACUNA for smoke tests (infra available, business logic pending).
