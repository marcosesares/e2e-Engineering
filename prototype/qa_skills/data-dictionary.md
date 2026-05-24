# Data Dictionary — BeckTech.QA.Tools

**Last updated:** 2026-05-23
**Source modules:** Claude Skills, Agents, Scripts, Setup & Configuration, CI/CD Pipelines
**Confidence legend:** 🟢 Confirmed (extracted from source) · 🟡 Inferred (pattern-based) · 🔴 Gap (needs validation)

---

## 1. Operations JSON — Test Case Creation (input)

Input contract for `claude-skills/scripts/create-ado-test-cases.ps1`.

| Field | Type | Required | Default | Purpose | Confidence |
|---|---|---|---|---|---|
| `defaults` | object | no | — | Per-batch ADO field defaults applied to every TC | 🟢 |
| `defaults.area_path` | string | no | inherited | ADO area path | 🟢 |
| `defaults.iteration_path` | string | no | inherited | ADO iteration path | 🟢 |
| `defaults.priority` | int | no | inherited | `Microsoft.VSTS.Common.Priority` | 🟢 |
| `defaults.aut` | string | no | inherited | `Custom.AUT` (Application Under Test) | 🟢 |
| `defaults.qa_blocked` | bool | no | false | `Custom.QABlocked` | 🟢 |
| `test_cases` | array | **yes** | — | List of TC to create; must not be empty | 🟢 |
| `test_cases[].title` | string | **yes** | — | `System.Title` | 🟢 |
| `test_cases[].preconditions` | string[] | no | [] | Rendered to HTML `<ul>` in `System.Description` | 🟢 |
| `test_cases[].steps` | object[] | no | [] | Action/expected pairs; encoded as TCM Steps XML | 🟢 |
| `test_cases[].steps[].action` | string | yes (when steps present) | — | Step Action; must not start with forbidden verbs (observe, verify, see, check, confirm, note) — warning | 🟢 |
| `test_cases[].steps[].expected_result` | string | yes (when steps present) | — | Step Expected Result | 🟢 |
| `test_cases[].qa_functional_area` | string | **yes** | — | `Custom.QAFunctionalArea` | 🟢 |
| `test_cases[].test_type` | string | **yes** | — | `Custom.TestType` | 🟢 |
| `test_cases[].coverage_type` | string | **yes** | — | `Custom.CoverageType` | 🟢 |
| `test_cases[].description_metadata` | object | no | — | Source links and notes; mutually exclusive ac_references vs absorbs_ids | 🟢 |
| `test_cases[].description_metadata.ac_references` | string[] | xor with `absorbs_ids` | — | AC list rendered as bulleted block | 🟢 |
| `test_cases[].description_metadata.absorbs_ids` | string[] | xor with `ac_references` | — | TC IDs absorbed by this TC | 🟢 |
| `test_cases[].description_metadata.notes` | string | no | — | Free text appended to description | 🟢 |
| `test_cases[].multi_user` | bool? | no | ADO default | `Custom.MultiUser` (omitted when null) | 🟢 |
| `test_cases[].manual` | bool? | no | ADO default | `Custom.Manual` (omitted when null) | 🟢 |
| `test_cases[].manual_reason` | string | required if `manual=true` | — | `Custom.ManualReason` | 🟢 |
| `test_cases[].cost_item_type` | string | no | — | `Custom.CostItemType` | 🟢 |
| `test_cases[].base_vs_alternates` | string | no | — | `Custom.BasevsAlternates` | 🟢 |
| `test_cases[].regression_coverage_evaluation` | string | no | — | `Custom.RegressionCoverageEvaluation`; value "Contributes to Coverage" + non-manual triggers `AutomationStatus="Planned"` | 🟢 |

---

## 2. Operations JSON — Test Case Update (input)

Input contract for `update-ado-test-cases.ps1`.

| Field | Type | Required | Purpose | Confidence |
|---|---|---|---|---|
| `test_cases` | array | **yes** | List of update ops; non-empty | 🟢 |
| `test_cases[].ado_id` | int | **yes** | Target ADO work item ID | 🟢 |
| `test_cases[].updates` | object | one of updates/steps/state required | Field replacements | 🟢 |
| `test_cases[].updates.title` | string | no | New `System.Title` (replace op) | 🟢 |
| `test_cases[].updates.description` | string | no | New `System.Description` | 🟢 |
| `test_cases[].updates.custom_fields` | object | no | Map of `Custom.<Name>` → value (replace op) | 🟢 |
| `test_cases[].steps` | object[] | no | Replacement steps; serialized as **pipe-delimited** for `/testplan/workitems/{id}` (NOT XML) | 🟢 |
| `test_cases[].state` | string | no | Target `System.State` (transition applied last) | 🟢 |

---

## 3. Operations JSON — Suite Management

Input contract for `manage-ado-test-suite.ps1`.

| Field | Type | Required | Purpose | Confidence |
|---|---|---|---|---|
| `test_plan_id` | int/string | **yes** | Target ADO Test Plan ID | 🟢 |
| `suite_name` | string | yes (if no `suite_id`) | Name; ambiguity (multiple suites with same name) returns error | 🟢 |
| `suite_id` | int | yes (if no `suite_name`) | Bypass lookup; use directly | 🟢 |
| `parent_suite_id` | int | no | Parent suite for creation; defaults to root suite (suiteType="RootSuite") | 🟢 |
| `tc_ids` | int[] | no | TC IDs to add; tried as batch then per-ID fallback | 🟢 |

Output `data` shape: `{ suite: { test_plan_id, suite_id, suite_name }, added_tc_ids: [], failures: [{ tc_id, error }] }`.

---

## 4. Operations JSON — JIRA Test Plan Linking

Input contract for `set-jira-test-plan-ids.ps1`.

| Field | Type | Required | Purpose | Confidence |
|---|---|---|---|---|
| `story_keys` | string[] | **yes** | JIRA issue keys to update; non-empty | 🟢 |
| `test_plan_id` | string | **yes** | Plan ID as string (JIRA field rejects integer) | 🟢 |
| `suite_id` | string | **yes** | Suite ID as string | 🟢 |
| `overwrite_conflicts` | bool | no | When `true`, overwrite existing non-matching values instead of reporting as conflict | 🟢 |

Output buckets each story into `updated`, `skipped` (already matches), `conflicts` (non-empty differing values, when overwrite=false), `failures`.

---

## 5. ADO Test Case (response from `fetch-ado-test-case.ps1`)

19 fields returned in `data`:

| Field | ADO Field | Type | Purpose | Confidence |
|---|---|---|---|---|
| `id` | `System.Id` | int | Work item ID | 🟢 |
| `title` | `System.Title` | string | TC title | 🟢 |
| `state` | `System.State` | string | Workflow state (Ready, Active, Closed, etc.) | 🟢 |
| `area_path` | `System.AreaPath` | string | Area path | 🟢 |
| `description` | `System.Description` | string (HTML) | Description with preconditions | 🟢 |
| `automation_status` | `Microsoft.VSTS.TCM.AutomationStatus` | string | "Not Automated" / "Planned" / "Automated" | 🟢 |
| `steps` | `Microsoft.VSTS.TCM.Steps` | object[] | Parsed from pipe-delimited or XML | 🟢 |
| `qa_functional_area` | `Custom.QAFunctionalArea` | string | Functional area | 🟢 |
| `test_type` | `Custom.TestType` | string | Test type | 🟢 |
| `coverage_type` | `Custom.CoverageType` | string | Coverage type | 🟢 |
| `multi_user` | `Custom.MultiUser` | bool | Multi-user scenario | 🟢 |
| `manual` | `Custom.Manual` | bool | Manual-only TC | 🟢 |
| `manual_reason` | `Custom.ManualReason` | string | Why manual | 🟢 |
| `cost_item_type` | `Custom.CostItemType` | string | Domain-specific | 🟢 |
| `base_vs_alternates` | `Custom.BasevsAlternates` | string | Domain-specific | 🟢 |
| `test_case_description` | `Custom.TestCaseDescription` | string (HTML) | Long-form metadata block | 🟢 |
| `regression_coverage_evaluation` | `Custom.RegressionCoverageEvaluation` | string | "Contributes to Coverage" / "Evaluated, not Contributing" / etc. | 🟢 |
| `qa_blocked` | `Custom.QABlocked` | bool | Blocked flag | 🟢 |
| `aut` | `Custom.AUT` | string | Application Under Test | 🟢 |

---

## 6. JIRA Custom Fields (resolved)

| Field ID | Meaning | Set by | Read by | Confidence |
|---|---|---|---|---|
| `customfield_10001` | Story Points | — | `fetch-jira-issue.ps1` | 🟢 |
| `customfield_10002` | Sprint | — | `fetch-jira-issue.ps1` | 🟢 |
| `customfield_10096` | unknown | — | `fetch-jira-items-batch.ps1` (default field list) | 🔴 |
| `customfield_10140` | unknown | — | `fetch-jira-items-batch.ps1` | 🔴 |
| `customfield_10181` | unknown | — | `fetch-jira-items-batch.ps1` | 🔴 |
| `customfield_10184` | unknown | — | `fetch-jira-items-batch.ps1` | 🔴 |
| `customfield_10257` | ADO Test Plan ID (stored as string) | `set-jira-test-plan-ids.ps1` | `set-jira-test-plan-ids.ps1` | 🟢 |
| `customfield_10258` | ADO Suite ID (stored as string) | `set-jira-test-plan-ids.ps1` | `set-jira-test-plan-ids.ps1` | 🟢 |

---

## 7. ADO PR Thread Status

| Numeric value | Label |
|---|---|
| 0 | active |
| 1 | fixed |
| 2 | wontFix |
| 3 | closed |
| 4 | byDesign |
| 5 | pending |
| default | unknown |

Used by `fetch-ado-pr-comments.ps1`, `post-ado-pr-comment.ps1`.

---

## 8. ADO Reviewer Vote Encoding

| Numeric value | Label |
|---|---|
| -10 | Rejected |
| -5 | Waiting for author |
| 0 | No vote |
| 5 | Approved with suggestions |
| 10 | Approved |

Used by `fetch-ado-pr-summary.ps1`, `update-ado-pr-status.ps1`.

---

## 9. ADO Change Type (PR file changes)

| Numeric value | Label |
|---|---|
| 1 | added |
| 2 | modified |
| 3 | deleted |
| 4 | renamed |
| 5 | undeleted |
| 6 | branch |
| default | unknown |

Used by `fetch-ado-pr-files.ps1`, `fetch-ado-pr-diff.ps1`.

---

## 10. Standard Script Output Envelope

Defined in `SCRIPT_OUTPUT_STANDARD.md` (repo root). Every script emits this shape to stdout.

| Field | Type | Semantics |
|---|---|---|
| `success` | bool | `true` iff the operation completed without thrown error |
| `data` | object/null | Operation payload (per-script shape); null on failure |
| `error` | string/null | Error message; null on success |

Exit codes: `0` = script ran (operation may have `success:false`); `1` = fatal script error.

---

## 11. Test Plan Markdown Categorization (input)

Input contract for `generate-test-plan-md.ps1`. Two shapes branch on `plan_type`:

**Common fields:**

| Field | Type | Required | Purpose | Confidence |
|---|---|---|---|---|
| `plan_type` | "feature" \| "regression" | **yes** | Branches markdown layout | 🟢 |
| `header` | object | **yes** | Top-of-doc metadata | 🟢 |
| `test_cases` | object[] | **yes** | Summary table rows; entries with `id="NEW"` get anchor links | 🟢 |

**Feature plan header:**

| Field | Purpose |
|---|---|
| `epic_key` | JIRA epic key (e.g., DC-1234); rendered as JIRA link |
| `epic_title` | Document H1 |
| `epic_summary` | Subheader paragraph |
| `stories_covered[]` | `{ key, title, behavior_summary }` |
| `stories_excluded[]` | `{ key, title, reason }` |

**Regression plan header:**

| Field | Purpose |
|---|---|
| `aut_name` | Application Under Test name (H1 prefix) |
| `scope_paragraph` | Scope description |
| `field_defaults` | Arbitrary key-value bullet list |

**Regression `additional_sections`:**

| Field | Purpose |
|---|---|
| `manual_tcs[]` | TCs presented in "Section 2 — Manual regression" |
| `dropped_buckets[]` | `{ name, count, ids[] }` bucketed disposition |

---

## 12. Configuration Files (top-level)

| File | Purpose | Confidence |
|---|---|---|
| `SHARED_MANIFEST` | Tracks paths distributed via git subtree (generated by `generate-manifest.ps1`) | 🟢 |
| `claude-skills/setup/sync-shared-skills.ps1` | Distribution sync | 🟢 |
| `claude-skills/setup/guard-shared-skills.ps1` | PreToolUse hook — blocks edits to synced files | 🟢 |
| `SCRIPT_OUTPUT_STANDARD.md` | Output envelope contract | 🟢 |

---

## 13. Setup & Configuration Module

### 13.1 `SHARED_MANIFEST` (plain text)

| Property | Value |
|---|---|
| Encoding | UTF-8, LF line endings, trailing LF |
| Line format | one subtree-relative path with forward slashes |
| Sort | lexicographic, deduplicated |
| Exclusion | the file does not list itself |
| Tolerated by guard | blank lines and `#`-prefixed comments (skipped); not emitted by `generate-manifest.ps1` |
| Current entry count | 76 |

### 13.2 `.sync-record` (JSON, consumer side)

```json
{
  "version": "<git-sha-of-published-skills-HEAD>",
  "timestamp": "<ISO 8601>",
  "files": { "<subtree-relative-path>": true, ... }
}
```

| Field | Type | Notes |
|---|---|---|
| `version` | string (40-hex SHA) | Remote `published-skills` HEAD at sync time |
| `timestamp` | string (ISO 8601, `o` format) | Wall-clock of last sync |
| `files` | object (hashtable serialized) | Each key = synced file; value always `true` |

Location: `<RepoRoot>/<TargetPrefix>/.sync-record` (e.g., `.claude/.sync-record`). Malformed JSON → treated as first sync.

### 13.3 `.claude/settings.json` (project-scoped)

| Field | Type | Producer | Purpose |
|---|---|---|---|
| `_qaHookVersion` | int | `setup-claude-hooks` | Drift marker; mirrors skill frontmatter `version` |
| `hooks.SessionStart[]` | array | `setup-claude-hooks` | Each entry has `hooks: [{ type: "command", command: "..." }]` |
| `hooks.PreToolUse[]` | array | `setup-claude-hooks` | Each entry has `matcher` (pipe-separated tool regex) + `hooks: [...]` |
| `permissions.allow[]` | string[] | `setup-claude-hooks` | Pre-approved Write/Bash patterns; suppresses prompt mid-workflow |

Merge: arrays are extended (push deduplicated), never replaced. Other unrelated keys are preserved.

### 13.4 `~/.claude/settings.json` (user-scoped)

| Field | Type | Producer | Purpose |
|---|---|---|---|
| `_qaNotificationsVersion` | int | `setup-notifications` | Drift marker (per-machine) |
| `hooks.Stop[]` | array | `setup-notifications` | Toast on session-end |
| `hooks.Notification[]` | array | `setup-notifications` | Toast on user-input request (`matcher: ""`) |

Empty matcher (`""`) on Notification = match all events.

### 13.5 PreToolUse hook payload (stdin to guard)

```json
{ "tool_input": { "file_path": "<absolute or relative path>" } }
```

| Field | Type | Required | Used by guard |
|---|---|---|---|
| `tool_input.file_path` | string | yes | yes |
| other tool fields | any | no | ignored |

Malformed/empty → fail-open (exit 0).

### 13.6 SessionStart hook output (stdout from check-updates)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<sync instructions>"
  }
}
```

Emitted only when updates available. Becomes additional context injected into the next assistant turn.

### 13.7 Version markers (drift detection)

| Artifact | Marker | Owner skill | Current value |
|---|---|---|---|
| `<qa-dir>/CLAUDE.md` | `<!-- qa-version: claude-md=N -->` at top | `setup-claude-md` | 2 |
| `<claude-dir>/skills/repo-context/SKILL.md` | frontmatter `qa-version: N` | `setup-repo-context` | 2 |
| `<claude-dir>/settings.json` | `"_qaHookVersion": N` | `setup-claude-hooks` | 2 |
| `~/.claude/settings.json` | `"_qaNotificationsVersion": N` | `setup-notifications` | 1 |

### 13.8 Cache file (`check-updates`)

| Property | Value |
|---|---|
| Path | `$env:USERPROFILE/.claude/cache/shared-skills-check-<RepoKey>.txt` |
| `RepoKey` derivation | `RepoRoot` with `[\\/:*?"<>|]` → `'_'` |
| TTL | 4 hours (compared by `LastWriteTime`) |
| Content | ISO 8601 timestamp (unused — only mtime matters) |

### 13.9 Environment variables (setup-managed)

| Var | Scope | Producer | Consumer |
|---|---|---|---|
| `ATLASSIAN_EMAIL` | User | `setup-atlassian-credentials` | Jira REST scripts (Basic auth) |
| `ATLASSIAN_API_TOKEN` | User | `setup-atlassian-credentials` | Jira REST scripts |
| `ADO_PAT` | User | `setup-ado-credentials` | ADO REST scripts (Basic auth) |
| `QA_ALLOW_SHARED_EDIT` | Session (manual) | — | `guard-shared-skills.ps1` escape hatch |
| `CLAUDE_PROJECT_DIR` | Process | Claude Code runtime | Hook command paths |
| `USERPROFILE` | OS | Windows | Cache dir for `check-updates.ps1` |

### 13.10 Git remotes & branches

| Remote | Branch | Direction | Purpose |
|---|---|---|---|
| `origin` (BeckTech.QA.Tools) | `main`/`master` | producer | Source of truth for `claude-skills/` |
| `origin` (BeckTech.QA.Tools) | `published-skills` | producer | Subtree-split distribution; force-pushed |
| `shared-skills` (consumer) | `published-skills` | consumer | Fetched by sync script |

## 14. CI/CD Pipelines Module

### 14.1 Pipeline parameters & variables

| Pipeline | Name | Kind | Type | Default | Where | Confidence |
|---|---|---|---|---|---|---|
| `publish-testkit.yml` | `azureArtifactsPath` | parameter | string (URL) | `https://pkgs.dev.azure.com/becktech/7a23932a-63a6-4ad9-9313-800a9913891c/_packaging/DESTINI-Web/nuget/v3/index.json` | overridable at queue time | 🟢 |
| `publish-testkit.yml` | `solution` | variable | string (relative path) | `dotnet/BeckTech.QA.TestKit/BeckTech.QA.TestKit.sln` | YAML edit only | 🟢 |
| `publish-testkit.yml` | `buildConfiguration` | variable | string (enum-like: `Release`/`Debug`) | `Release` | YAML edit only | 🟢 |
| `publish-claude-skills.yml` | identity `user.email` / `user.name` | inline git config | string | `build@beck-technology.com` / `Build Service` | YAML edit only | 🟢 |

### 14.2 ADO predefined variables used

| Variable | Used by | Purpose | Confidence |
|---|---|---|---|
| `Build.Reason` | `publish-testkit.yml` conditions on CopyFiles@2 + push step | Detect PR triggers and skip publish | 🟢 |
| `Build.ArtifactStagingDirectory` | `publish-testkit.yml` CopyFiles@2 target, pwsh push enumerate | Standard staging dir for build artifacts | 🟢 |
| `System.AccessToken` | implicit via `persistCredentials: true` on `checkout` | git push under ADO build service identity | 🟡 |

### 14.3 NuGet package metadata (release contract)

| Field | Source | Role | Confidence |
|---|---|---|---|
| `<Version>` | each `dotnet/BeckTech.QA.TestKit/src/*.csproj` | Release version — the **only** input that determines NuGet feed version | 🟢 |
| `<GeneratePackageOnBuild>` | each `src/*.csproj` | Causes `dotnet build` to emit `.nupkg` (no separate `dotnet pack`) | 🟢 |
| `.nupkg` files | `**/bin/Release/*.nupkg` | Build output; collected into `$(Build.ArtifactStagingDirectory)/nuget` (flattened) | 🟢 |

### 14.4 Trigger filter shapes

| Pipeline | Branch include | Path include | Notes |
|---|---|---|---|
| `publish-claude-skills.yml` | `master` | `claude-skills/*` | Single-level glob; descendant matches confirmed via commit history 🟡 |
| `publish-testkit.yml` | `master` | `dotnet/BeckTech.QA.TestKit/**` | Recursive 🟢 |

### 14.5 Step conditions in `publish-testkit.yml`

| Step | Condition | Effect |
|---|---|---|
| `PublishTestResults@2` | `succeededOrFailed()` | Publishes test results even when tests fail |
| `CopyFiles@2` | `and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))` | Skip on test failure or PR trigger |
| `dotnet nuget push` (pwsh) | `and(ne(variables['Build.Reason'], 'PullRequest'), succeeded())` | Skip on test failure or PR trigger |

### 14.6 External endpoints

| Endpoint | Used by | Method | Confidence |
|---|---|---|---|
| Azure Artifacts feed `DESTINI-Web` (org `becktech`, project GUID `7a23932a-63a6-4ad9-9313-800a9913891c`) | `publish-testkit.yml` push step | `dotnet nuget push -k az --skip-duplicate` | 🟢 |
| Azure DevOps git remote `origin` of self-repo | `publish-claude-skills.yml` push step | `git push origin published-skills --force` (auth via `persistCredentials: true`) | 🟢 |
| ADO Service Connection (implicit, name not declared) | `NuGetAuthenticate@1` | injects NuGet config credentials | 🔴 LACUNA |
