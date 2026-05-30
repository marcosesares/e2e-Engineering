# BeckTech.QA.Tools — Dependencies & Integrations

**Last Updated:** 2026-05-21

---

## Runtime Dependencies

### PowerShell Modules (Implicit)
- **PowerShell 7+** — All scripts use modern pwsh (Set-Location, ForEach-Object, etc.)

### External Services & APIs (MCP Servers)
1. **Azure DevOps**
   - Endpoint: Azure DevOps organization (Beck Technology)
   - Access: `mcp__ado_*` tools (work items, repos, pipelines, wikis, test plans)
   - Configured by: `/setup-azure-devops-mcp`

2. **Jira / Atlassian**
   - Endpoint: Jira Cloud / Atlassian
   - Access: `mcp__atlassian_*` tools + REST API (email + API token)
   - Configured by: `/setup-atlassian-mcp` and `/setup-atlassian-credentials`

3. **Playwright (Browser Automation)**
   - Endpoint: Local Playwright browsers (Chromium, Firefox, WebKit)
   - Access: `mcp__playwright_*` tools
   - Configured by: `/setup-playwright-mcp` (installs browsers on first run)

4. **Claude API**
   - Endpoint: Claude models (Sonnet, Haiku)
   - Access: Agents use models specified in frontmatter
   - Implicit: Required for all skill execution

---

## Build & Distribution Dependencies

### NuGet Packages (TestKit — Planned, Not Yet in Repo)
The `publish-testkit.yml` pipeline publishes two packages:

| Package | Purpose | Target | Version |
|---------|---------|--------|---------|
| **BeckTech.QA.TestKit** | Shared test infrastructure | NUnit + config helpers | From csproj |
| **BeckTech.QA.TestKit.Playwright** | Playwright UI fixture support | NUnit + Playwright | From csproj |

**Feed:** Azure Artifacts (DESTINI-Web)

**SDK Required:**
- .NET 9.x (specified in publish-testkit.yml)

---

## Source Control Dependencies

### Git Subtree Sync
**Source:** This repo (`BeckTech.QA.Tools`)  
**Branch:** `published-skills` (derived from `claude-skills/`)  
**Target Repos:** Consuming QA test automation repos  
**Path:** `claude-skills/` → `.claude/`  
**Mechanism:** `git subtree pull --prefix=.claude shared-skills published-skills --squash`

### GitHub Branches
- **main** — Default; PRs merge here
- **published-skills** — Derived via `git subtree split` from claude-skills/; read-only for consumers

---

## Configuration & Hook Dependencies

### Project-Level Hooks (`.claude/settings.json`)
Installed by `/setup-claude-hooks`:

1. **SessionStart update-checker**
   - Runs: On each Claude Code start
   - Action: Checks for skill updates (cached 4h per repo)
   - Triggers: Asks user to pull updates if available

2. **PreToolUse path-guard**
   - Runs: Before Edit/Write/MultiEdit
   - Action: Blocks writes to synced files (raises error)
   - Purpose: Prevents overwriting shared skills; forces changes to BeckTech.QA.Tools

### Permissions Allowlist (`.claude/settings.json`)
Pre-approves writes/commands for:
- Saving Jira responses to `~/.claude/fetch-jira-item/`
- ADO test case operations
- Skill-internal reads

---

## Data Dependencies

### Jira Work Items
- **Accessed by:** fetch-jira-item, add-jira-comment, query-jira, transition-jira-issue, update-jira-issue, set-jira-test-plan-ids
- **Custom Fields:** `customfield_10257` (Test Plan ID), `customfield_10258` (Test Suite ID)
- **Attachment Download:** Stored in `~/.claude/fetch-jira-item/` (user-local, not repo)

### ADO Test Plans & Cases
- **Accessed by:** create-ado-test-cases, update-ado-test-cases, apply-test-plan, manage-ado-test-suite
- **Field Formats:** HTML (test case description steps), plain text (title)
- **Workflow Rules:** No System.Reason on state transitions; steps via testplan_update_test_case_steps

### ADO Pull Requests
- **Accessed by:** fetch-ado-pr-{summary,comments,diff,files}, post-ado-pr-comment, update-ado-pr-status, create-ado-pull-request

---

## Version & Compatibility

### Reversa Framework
- **Current Version:** 1.2.43 (from .reversa/state.json)
- **Check:** `npx reversa update` for newer versions

### .NET SDK (for TestKit builds)
- **Required:** .NET 9.x (from publish-testkit.yml)
- **Build Output:** .nupkg files in bin/Release
- **Published to:** DESTINI-Web feed (Azure Artifacts)

### Claude Models
- **qa-investigate:** Sonnet (read-only exploration)
- **qa-implement:** Sonnet (code changes)
- **Skills:** Default/inherit from Claude Code session model

---

## Security & Credentials

### Stored Credentials
- **ATLASSIAN_EMAIL** — Environment variable (set by /setup-atlassian-credentials)
- **ATLASSIAN_API_TOKEN** — Environment variable (set by /setup-atlassian-credentials)
- **.claude/settings.local.json** — User-local settings (gitignored; contains personal tokens)

### OAuth Flows
- **Atlassian** — Browser OAuth (select **Jira only**, not Confluence)
- **Azure DevOps** — Browser OAuth (via /mcp)
- **Playwright** — No auth (local browsers)

### Pre-Approval Gates
- Skill-internal writes (test case operations, Jira updates) are pre-approved in .claude/settings.json
- PR/commit operations prompt for user approval (plan-change, review-change, commit-change)

---

## Sync Behavior & Manifest

### SHARED_MANIFEST
Located at `claude-skills/SHARED_MANIFEST`. Lists all paths to sync:
- `skills/*/SKILL.md`
- `skills/*/references/**`
- `skills/*/scripts/**`
- `agents/**`
- `setup/**`
- `README.md`, `REPO_SETUP.md`, etc.

**Regenerate after file changes:**
```powershell
.\claude-skills\setup\generate-manifest.ps1
```

### Sync Locations in Consuming Repos
- One-level setup: `.claude/` ← `claude-skills/` (direct)
- Subdirectory setup (e.g., tests/QA/): `tests/QA/.claude/` ← `claude-skills/`

Pull updates:
```bash
git subtree pull --prefix=.claude shared-skills published-skills --squash
```

---

## Integrations Matrix

| System | Role | Access | Configured By |
|--------|------|--------|---------------|
| **Jira / Atlassian** | Issue tracking, test plan IDs | MCP + REST API | /setup-atlassian-mcp, /setup-atlassian-credentials |
| **Azure DevOps** | Test plans, cases, work items, repos, pipelines | MCP | /setup-azure-devops-mcp |
| **GitHub** | Source control, Actions | Git + Webhooks | Native (no setup skill) |
| **Azure Artifacts** | NuGet hosting | dotnet nuget push | publish-testkit.yml (pipeline native) |
| **Playwright** | Browser automation | MCP | /setup-playwright-mcp |
| **Claude Code** | Development environment | Sessions, models | Native (settings.json) |

---

## Development & Publishing Workflow

1. **Develop skills** in `claude-skills/skills/`
2. **Update SHARED_MANIFEST** if files added/removed: `.\claude-skills\setup\generate-manifest.ps1`
3. **Create PR to main** (BeckTech.QA.Tools)
4. **Complete PR** → triggers `publish-claude-skills.yml` pipeline
5. **Pipeline output:** `published-skills` branch updated automatically
6. **Consuming repos:** Pick up on next `/setup-claude-hooks` check (max 4h cache) or manual `git subtree pull`

---

## Dependency Graph (High-Level)

```
┌─────────────────────────────────────┐
│  Consuming Repo (e.g., QA Test Repo) │
└──────────────┬──────────────────────┘
               │
               │ git subtree pull
               ↓
     ┌─────────────────────┐
     │ published-skills br. │ (read-only for consumers)
     └──────────┬──────────┘
                │
                │ derived from (git subtree split)
                ↓
     ┌──────────────────────────┐
     │ BeckTech.QA.Tools/       │
     │ claude-skills/           │
     │ (development happens here)│
     └──────┬───────────────────┘
            │
            ├─→ GitHub Actions (publish-claude-skills.yml)
            │
            └─→ Jira, ADO MCP (runtime skill execution)
                Playwright MCP
                Claude APIs
                Azure Artifacts (TestKit NuGet)
```

---

## Checksum & Versioning

### File Checksums (for manifest validation)
Not implemented; sync relies on `SHARED_MANIFEST` path list and git subtree integrity.

### Version Tracking
- **Skill versions:** Optional `version: N` in SKILL.md frontmatter (used by /refresh-setup to detect stale generated files)
- **Package versions:** Bump `<Version>` in `.csproj` (e.g., BeckTech.QA.TestKit.csproj)
- **Reversa version:** 1.2.43 (check `npx reversa update` for updates)
