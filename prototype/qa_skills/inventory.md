# BeckTech.QA.Tools — Project Inventory

**Last Mapped:** 2026-05-21 · **Reviewed:** 2026-05-23
**Repository:** Internal QA automation framework
**Primary Language:** PowerShell + Markdown
**Total Files:** **380** (excluding `.git`, `node_modules`, `.reversa`, `_reversa_sdd`, `_reversa_forward`, build artifacts) — verified by Reviewer 2026-05-23 via `find`. Previous estimate ~399 was off by ~19.

---

## 1. Directory Structure

```
BeckTech.QA.Tools/
├── claude-skills/                     # Shared QA automation skills (published to consuming repos via git subtree)
│   ├── skills/                        # 19 reusable Claude Code skills
│   │   ├── apply-test-plan/
│   │   ├── commit-change/
│   │   ├── create-ado-test-cases/
│   │   ├── fetch-jira-item/
│   │   ├── fix-qa-bug/
│   │   ├── implement-story/
│   │   ├── manage-ado-test-suite/
│   │   ├── onboard/
│   │   ├── plan-change/
│   │   ├── plan-feature-coverage/
│   │   ├── plan-regression-coverage/
│   │   ├── principles/
│   │   ├── refresh-setup/
│   │   ├── review-change/
│   │   ├── revise-test-plan/
│   │   ├── test-plan/
│   │   ├── update-ado-test-cases/
│   │   ├── work-on/
│   │   └── + `qa-evaluate-regression-rubric/` (19th skill; sub-skill of `plan-regression-coverage`, applies regression rubric)
│   ├── setup-skills/                  # 9 leaf setup skills (NOT under skills/)
│   │   ├── setup-claude-hooks/        # per-user, /onboard step 1
│   │   ├── setup-atlassian-mcp/       # per-user, step 2
│   │   ├── setup-atlassian-credentials/ # per-user, step 3
│   │   ├── setup-azure-devops-mcp/    # per-user, step 4
│   │   ├── setup-ado-credentials/     # per-user, step 5
│   │   ├── setup-playwright-mcp/      # per-user, step 6
│   │   ├── setup-notifications/       # per-user, step 7 (Windows toast via hooks/notify.ps1)
│   │   ├── setup-claude-md/           # project-scope, invoked from onboard pre-flight
│   │   └── setup-repo-context/        # project-scope, invoked from onboard pre-flight
│   ├── agents/                        # 2 specialized workers
│   │   ├── qa-investigate.md          # Read-only codebase exploration (Read/Glob/Grep/Bash; no Write tool)
│   │   └── qa-implement.md            # Code changes following approved plan (Read/Write/Edit/Glob/Grep/Bash)
│   ├── scripts/                       # 22 PowerShell automation scripts (flat layout, no subfolders)
│   │   ├── Jira integration (7): fetch-jira-issue, fetch-jira-items-batch, query-jira, add-jira-comment, update-jira-issue, transition-jira-issue, set-jira-test-plan-ids
│   │   ├── ADO integration (14): create-ado-test-cases, update-ado-test-cases, manage-ado-test-suite, fetch-ado-test-case, fetch-ado-test-cases-by-suite, fetch-ado-test-cases-by-query, fetch-ado-test-suite-hierarchy, create-ado-pull-request, fetch-ado-pr-summary, fetch-ado-pr-files, fetch-ado-pr-diff, fetch-ado-pr-comments, post-ado-pr-comment, update-ado-pr-status
│   │   └── Test Plan Generation (1): generate-test-plan-md
│   ├── setup/                         # Configuration and manifest
│   │   ├── sync-shared-skills.ps1     # Manifest-driven sync from BeckTech.QA.Tools
│   │   ├── check-updates.ps1          # SessionStart hook — checks for updates
│   │   ├── guard-shared-skills.ps1    # PreToolUse hook — blocks edits to synced files
│   │   ├── generate-manifest.ps1      # Regenerate SHARED_MANIFEST
│   │   └── publish-skills.ps1         # Update published-skills branch
│   ├── references/                    # Documentation and templates
│   ├── SHARED_MANIFEST                # List of paths to sync
│   └── README.md, REPO_SETUP.md, templates...
│
├── .claude/                           # Claude Code project configuration
│   ├── skills/
│   │   ├── reversa/                   # Reversa framework (installed)
│   │   └── ... (shared skills sync here)
│   └── settings.json
│
├── .agents/                           # Agent definitions (mirror of .claude/)
│
├── .reversa/                          # Reversa working directory (not part of extraction)
│   ├── state.json
│   ├── plan.md
│   ├── config.toml
│   └── ...
│
├── .vscode/                           # VS Code workspace configuration
│   ├── launch.json
│   └── tasks.json
│
├── .vs/                               # Visual Studio cache/metadata
│
├── .gitignore, CLAUDE.md, README.md, AGENTS.md
│
└── publish-claude-skills.yml          # Azure DevOps Pipelines (push to master, claude-skills/*)
    publish-testkit.yml                # Azure DevOps Pipelines (push to master, dotnet/BeckTech.QA.TestKit/**)
```

---

## 2. Technologies & Frameworks

### Languages
- **PowerShell** (22 scripts + setup utilities) — primary automation language
- **Markdown** (SKILL.md files + documentation) — skill definitions
- **YAML** (GitHub Actions, ADO pipelines)
- **TOML** (.reversa/config.toml)

### Frameworks & Libraries
- **Claude Code** — AI-powered development environment; skills are the primary artifact type
- **Azure DevOps MCP** — work item, repo, pipeline, test plan integration
- **Atlassian Jira MCP** — issue tracking and REST API
- **Playwright MCP** — browser automation for web UI testing
- **NUnit** (planned TestKit) — test framework for .NET
- **Nuke** (inferred) — build automation
- **.NET 9** (TestKit, Azure Test Results tool) — cross-platform development

### Package Management
- **NuGet** — distributes `BeckTech.QA.TestKit` and `BeckTech.QA.TestKit.Playwright` packages
- **git subtree** — syncs `claude-skills/` into consuming repos as `.claude/`

### CI/CD
- **GitHub Actions** (`publish-claude-skills.yml`) — publishes skill updates to `published-skills` branch
- **Azure DevOps Pipelines** (`publish-testkit.yml`) — builds, tests, publishes NuGet packages

---

## 3. Core Modules / Components

### A. Claude Skills (19)

#### Workflow Skills (End-to-End)
- **fix-qa-bug** — Fetch Jira → investigate → plan → implement → review → commit
- **implement-story** — Same flow, story-oriented

#### Test Planning & Execution
- **plan-feature-coverage** — Evaluate AC vs existing TCs, build feature plan → test-plan
- **plan-regression-coverage** — Audit AUT/sprint/JQL, apply rubric, hand to test-plan
- **test-plan** — Convert categorization into feature/regression markdown
- **apply-test-plan** — Parse plan markdown, validate, summarize, approve, delegate to create/update
- **revise-test-plan** — Parse, iterate on feedback, rewrite via test-plan

#### Change Management
- **plan-change** — Create implementation plan with user approval
- **review-change** — Summarize changes and get user approval
- **commit-change** — Commit and update Jira

#### ADO Test Case Management
- **create-ado-test-cases** — Source-agnostic creator; owns field formats, state transitions
- **update-ado-test-cases** — Field updates, step rewrites, state transitions
- **manage-ado-test-suite** — Create suites, manage hierarchy

#### Jira Integration
- **fetch-jira-item** — Fetch issue details + download attachments
- **work-on** — Entry point router; dispatches to fix-qa-bug or implement-story

#### Setup Skills
- **onboard** — Walks QA engineers through per-user setup
- **setup-repo-context** — Populate/refresh consuming repo's repo-context
- **setup-claude-md** — Create/update CLAUDE.md
- **setup-claude-hooks** — Install SessionStart update-checker + PreToolUse path-guard
- **setup-atlassian-mcp** — Add Jira MCP
- **setup-atlassian-credentials** — Store email + API token
- **setup-azure-devops-mcp** — Add ADO MCP
- **setup-playwright-mcp** — Add Playwright MCP + install browsers
- **setup-notifications** — Windows toast notifications
- **refresh-setup** — Audit and refresh generated files

#### Principles
- **principles** — QA automation principles (agent-loaded)

### B. Agents (2)

- **qa-investigate** (Sonnet) — Read-only codebase exploration; finds tests, page objects, helpers
- **qa-implement** (Sonnet) — Code changes following approved plan and principles

### C. Scripts (22 PowerShell)

**Jira Integration (6)**
- fetch-jira-issue.ps1, add-jira-comment.ps1, query-jira.ps1, transition-jira-issue.ps1, update-jira-issue.ps1, set-jira-test-plan-ids.ps1

**ADO Integration (10)**
- fetch-ado-pr-{summary,comments,diff,files}.ps1, fetch-ado-test-case{,s-by-query,-by-suite}.ps1, fetch-ado-test-suite-hierarchy.ps1, create-ado-pull-request.ps1, create-ado-test-cases.ps1, post-ado-pr-comment.ps1, update-ado-pr-status.ps1, manage-ado-test-suite.ps1

**Utilities (4)**
- generate-test-plan-md.ps1, fetch-jira-items-batch.ps1, download-attachment.ps1

**Setup & Manifest (3)**
- sync-shared-skills.ps1, check-updates.ps1, generate-manifest.ps1, guard-shared-skills.ps1, publish-skills.ps1

### D. Sync & Publishing

- **SHARED_MANIFEST** — List of paths to sync from BeckTech.QA.Tools to consuming repos
- **git subtree publish** — `published-skills` branch derives from `claude-skills/` root; never edited directly
- **Sync flow** — `sync-shared-skills.ps1` reads manifest, pulls from published-skills branch via subtree

---

## 4. Entry Points & CI/CD

### Skills Entry Points
- `/work-on [issue-key]` — Router to fix-qa-bug or implement-story
- `/fix-qa-bug [issue-key]` — End-to-end bug fix
- `/implement-story [issue-key]` — End-to-end story
- `/plan-feature-coverage [epic|story-key]` — Feature test coverage
- `/plan-regression-coverage` — Regression test coverage
- `/apply-test-plan <path>` — Apply saved plan to ADO
- `/onboard` — Per-user setup

### CI/CD Pipelines
- **publish-claude-skills.yml** (GitHub Actions) — Runs on completed PR to main touching claude-skills/; generates published-skills branch
- **publish-testkit.yml** (Azure DevOps) — Triggers on master commits to dotnet/BeckTech.QA.TestKit/; builds, tests, publishes NuGet to DESTINI-Web feed
  - Path filter: `dotnet/BeckTech.QA.TestKit/**`
  - SDK: .NET 9
  - Output: BeckTech.QA.TestKit, BeckTech.QA.TestKit.Playwright NuGet packages

---

## 5. Database / Persistence

None identified in current repo state. TestKit (planned) will likely use Entity Framework or similar ORM, but source is not present.

---

## 6. Test Coverage

**Test Files Found:**
- Referenced in README: NUnit tests for BeckTech.QA.TestKit (not in repo; built separately)
- Test results format: VSTest (.trx files) via publish-testkit.yml

**Test Runners:**
- NUnit (referenced in TestKit)
- ADO Test Plans (managed by apply-test-plan skill)

---

## 7. Configuration & Extensibility

### Generated Files (Not Synced)
- `.claude/settings.json` — Project-level hooks, permissions
- `~/.claude/settings.local.json` — User-local secrets (ignored)
- `CLAUDE.md` — Project context (generated by setup-claude-md)
- `.claude/skills/repo-context/SKILL.md` — Repo-specific context

### Configuration Files
- `.vscode/launch.json` — Debugger configuration
- `.vscode/tasks.json` — Build tasks
- `.reversa/` — Reversa working state (not synced)
- `claude-skills/SHARED_MANIFEST` — Sync manifest (regenerated by setup/generate-manifest.ps1)

---

## 8. External Integrations

1. **Jira** (Atlassian) — Work item tracking; REST API + MCP
2. **Azure DevOps** — Test plans, work items, repos, pipelines
3. **GitHub** — Source control, Actions CI/CD
4. **Azure Artifacts** — NuGet package hosting (DESTINI-Web feed)
5. **Playwright** — Browser automation
6. **Claude Code** — AI development environment

---

## Summary Table

| Aspect | Value |
|--------|-------|
| **Project Type** | QA Automation Framework (Skills + Scripts) |
| **Primary Language** | PowerShell + Markdown |
| **Modules** | 19 skills + 2 agents + 22 scripts |
| **Frameworks** | Claude Code, ADO/Jira MCP, Playwright, .NET 9 |
| **Distribution** | git subtree to consuming repos + NuGet packages |
| **CI/CD** | GitHub Actions (skills), Azure DevOps Pipelines (TestKit) |
| **External Deps** | Jira, ADO, Azure Artifacts, Claude APIs |
| **Code Share** | Manifest-driven sync; consuming repos lock synced files |
