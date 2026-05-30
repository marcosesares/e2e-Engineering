# Claude Skills, Tarefas de Implementação

---

## Pré-requisitos

- [ ] Azure DevOps MCP configured; ADO_PAT set
- [ ] Atlassian MCP configured; ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN set
- [ ] Jira Cloud ID: `ec1222f5-ecd6-4b14-a4b4-68c3ed82ef14`
- [ ] Consumer repo has git remote `shared-skills` pointing to BeckTech.QA.Tools

## Tarefas

- [ ] T-01, Implement `/work-on` router
  - Origin: `claude-skills/skills/work-on/SKILL.md`
  - DoD: Routing decision matrix (Bug→fix-qa-bug, Story→implement-story, Spike→ask, Unknown→ask)
  - Confidence: 🟢

- [ ] T-02, Implement `/fetch-jira-item` with caching
  - Origin: `code-analysis.md §2.4`
  - DoD: Cache in ~/.claude/fetch-jira-item/<key>/; lightweight timestamp check; returns structured brief
  - Confidence: 🟢

- [ ] T-03, Implement `/plan-feature-coverage`
  - Origin: `code-analysis.md §1.2`
  - DoD: Generates feature test plan Markdown; invokes test-plan skill
  - Confidence: 🟡

- [ ] T-04, Implement `/plan-regression-coverage`
  - Origin: `code-analysis.md §1.2`
  - DoD: Generates regression test plan Markdown; applies rubric (NEW/Manual/Absorbed/Dropped)
  - Confidence: 🟡

- [ ] T-05, Implement `test-plan` generator
  - Origin: `code-analysis.md §1.2`
  - DoD: Converts categorization input → feature or regression Markdown
  - Confidence: 🟢

- [ ] T-06, Implement `/apply-test-plan` (8-step pipeline)
  - Origin: `apply-test-plan/references/instructions.md`
  - DoD: Parse → Validate → Approve → Create TCs → Add to suite → Writeback (feature only)
  - Confidence: 🟢

- [ ] T-07, Implement `create-ado-test-cases` PowerShell script
  - Origin: `code-analysis.md §2.2`
  - DoD: Validates Operations JSON; creates TCs via wit_create_work_item; sets all Custom.* fields; transitions to Ready
  - Confidence: 🟢

- [ ] T-08, Implement `manage-ado-test-suite` PowerShell script
  - Origin: `code-analysis.md §2.3`
  - DoD: Resolve suite by name or ID; create if absent; add TC IDs
  - Confidence: 🟢

- [ ] T-09, Implement `/plan-change` approval gate
  - Origin: `code-analysis.md §1.3`
  - DoD: Iterates with user until explicit approval; emits implementation plan
  - Confidence: 🟡

- [ ] T-10, Implement `/fix-qa-bug` orchestrator
  - Origin: `code-analysis.md §1.2`
  - DoD: Fetches issue → plan-change → spawn qa-investigate/qa-implement agents → review-change → commit-change
  - Confidence: 🟡

- [ ] T-11, Implement `/implement-story` orchestrator
  - Origin: `code-analysis.md §1.2`
  - DoD: Same pipeline as fix-qa-bug; story-specific context
  - Confidence: 🟡

- [ ] T-12, Implement `review-change` approval gate
  - Origin: `code-analysis.md §1.3`
  - DoD: Summarizes code changes; requires approval before commit
  - Confidence: 🟡

- [ ] T-13, Implement `commit-change` skill
  - Origin: `code-analysis.md §1.3`
  - DoD: Commits to git; adds Jira comment with commit link
  - Confidence: 🟡

- [ ] T-14, Implement `principles` skill (QA automation principles)
  - Origin: `domain.md §2.8` (BR-PL-01 through BR-PL-06)
  - DoD: Display 7 principles; loaded by all workflow skills
  - Confidence: 🟢

- [ ] T-15, Implement `/onboard` setup orchestration
  - Origin: `code-analysis.md §1.5`
  - DoD: Repo checks → per-user setup steps (7 total) in order
  - Confidence: 🟢

- [ ] T-16, Implement setup-\* skills (**9 total** — 7 per-user + 2 project-scope)
  - Origin: `code-analysis.md §1.5`, `setup/legacy-mapping.md`
  - DoD (per-user, /onboard steps 1-7): setup-claude-hooks, setup-atlassian-mcp, setup-atlassian-credentials, setup-azure-devops-mcp, setup-ado-credentials, setup-playwright-mcp, setup-notifications
  - DoD (project-scope pre-flight): setup-claude-md, setup-repo-context
  - Confidence: 🟢 (verified 2026-05-23: `ls claude-skills/setup-skills/` returns 9 dirs)

- [ ] T-17, Implement `guard-shared-skills.ps1` (PreToolUse hook)
  - Origin: `code-analysis.md §4.2`
  - DoD: Block edits to synced files via .sync-manifest; fail-open on errors
  - Confidence: 🟢

- [ ] T-18, Implement `check-updates.ps1` (SessionStart hook)
  - Origin: `code-analysis.md §4.2`
  - DoD: Detect available updates; cache with 4-hour TTL; prompt user
  - Confidence: 🟢

- [ ] T-19, Implement `sync-shared-skills.ps1`
  - Origin: `code-analysis.md §2.5`
  - DoD: Fetch published-skills branch; sync files; track in .sync-manifest; cleanup orphaned
  - Confidence: 🟢

- [ ] T-20, Implement `/revise-test-plan`
  - Origin: `code-analysis.md §1.2`
  - DoD: Iterate plan on feedback; no ADO mutations
  - Confidence: 🟡

- [ ] T-21, Implement `/refresh-setup`
  - Origin: `code-analysis.md §1.5`
  - DoD: Re-run setup hooks, sync skills, validate MCP; check for drift in generated files
  - Confidence: 🟡

- [ ] T-22, Implement `qa-evaluate-regression-rubric` (RF-18)
  - Origin: `claude-skills/skills/qa-evaluate-regression-rubric/SKILL.md`
  - DoD: Sonnet sub-skill of `plan-regression-coverage`. Input: chunk of existing ADO TCs (id, title, qa_functional_area, state, manual, manual_reason) + rubric rules + tool capability profile. Output: JSON array `[ {tc_id, disposition: absorb|keep|manual|drop, reason} ]`. Uses extended thinking for judgment-heavy rubric matching.
  - Confidence: 🟢

---

## Tarefas de Teste

- [ ] TT-01, Test `/work-on` with Bug, Story, Spike, Subtask, Unknown types
- [ ] TT-02, Test `/fetch-jira-item` cache hit + cache miss scenarios
- [ ] TT-03, Test `/apply-test-plan` with feature and regression plans; validation failures
- [ ] TT-04, Test `create-ado-test-cases` with large batch (>50 TCs); error handling
- [ ] TT-05, Test ADO state transition: Design → Ready → Closed
- [ ] TT-06, Test Jira writeback (feature plans only)
- [ ] TT-07, Test guard hook with synced vs non-synced files
- [ ] TT-08, Test guard hook error conditions (missing manifest)
- [ ] TT-09, Test update check cache (4-hour TTL)
- [ ] TT-10, Test /onboard with missing pre-conditions

---

## Ordem Sugerida

1. **Foundation (T-02, T-14):** Jira fetch + principles — required by all workflows
2. **Routing (T-01):** work-on router — top-level entry point
3. **Test Planning (T-03, T-04, T-05):** plan-feature-coverage, plan-regression-coverage, test-plan
4. **Apply Pipeline (T-06, T-07, T-08):** apply-test-plan + create/manage PowerShell
5. **Change Management (T-09, T-10, T-11, T-12, T-13):** plan-change → fix-qa-bug/implement-story → commit
6. **Setup & Distribution (T-15, T-16, T-17, T-18, T-19):** onboard, hooks, sync
7. **Optional (T-20, T-21):** revise-test-plan, refresh-setup

**Bloqueadores:**
- T-07, T-08 blocked by T-06 (need apply-test-plan interface defined)
- T-10, T-11 blocked by T-09 (need plan-change approval gate)
- T-17 blocked by T-19 (need .sync-manifest from sync script)

---

## Lacunas Pendentes (🔴)

- Exception handling strategy in PowerShell scripts — retry vs fail fast?
- Rollback behavior on partial ADO TC creation failures
- Concurrent skill execution safety — is repo locking needed?
- Performance characteristics for large batches (measured?)
