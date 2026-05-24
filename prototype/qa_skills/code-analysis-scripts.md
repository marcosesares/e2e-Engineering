# Code Analysis — Scripts Module

**Analysis Date:** 2026-05-23
**Module:** Scripts (22 PowerShell automation scripts)
**Scope:** REST API wrappers + deterministic generators that back the higher-level skills
**Doc Level:** Detalhado

---

## Executive Summary

The Scripts module is the deterministic execution layer of BeckTech.QA.Tools. It consists of **22 PowerShell scripts** in `claude-skills/scripts/` that wrap third-party REST APIs (Atlassian Jira Cloud, Azure DevOps) and produce deterministic outputs (test plan markdown, JSON patches). Scripts are invoked by Claude Code skills via the slash-command surface (`/work-on`, `/apply-test-plan`, `/revise-test-plan`, `/plan-change`, etc.) — never directly by the end user except for debugging.

**Core design rules:**

1. **Unified JSON envelope** — every script returns `{ success, data, error }` per `SCRIPT_OUTPUT_STANDARD.md`. Consumers `ConvertFrom-Json` the stdout and branch on `success`. Stderr is reserved for `Write-Error` fatal aborts.
2. **Credentials resolved by precedence** — `-Pat`/`-PAT` parameter > environment variable (`ATLASSIAN_EMAIL`+`ATLASSIAN_API_TOKEN` for Jira, `ADO_PAT` for ADO) > hard error. No fallback to interactive prompts (would block the agent).
3. **Stateless, idempotent where possible** — scripts do not cache between runs. Operations files (JSON) carry the full intent so re-runs are deterministic.
4. **Cost minimization** — deterministic formatting (markdown generation, validation, HTML formatting) is moved out of the LLM and into scripts. `generate-test-plan-md.ps1` is the canonical example: the categorization JSON comes from the LLM, but the markdown serialization is pure PowerShell.
5. **Action separation** — fetch, create, update, transition are separate scripts. No "create-or-update" multi-purpose endpoints. Caller composes them.

🟢 **Confirmed** — All 22 scripts read end-to-end. APIs, parameters, return shapes, side effects extracted directly from source.
🟡 **Inferred** — Authoring intent (e.g., why pipe-delimited steps in `update-ado-test-cases` but XML in `create-ado-test-cases`) inferred from code comments + ADO API behavior.
🔴 **Gap** — No retry, no rate-limit handling, no circuit breaker. Documented below.

---

## 1. Inventário de Scripts

### 1.1 Jira Integration (7 scripts)

| Script | Purpose | HTTP Method(s) | Endpoint |
|---|---|---|---|
| `fetch-jira-issue.ps1` | Single issue → structured brief | GET | `/rest/api/3/issue/{key}` |
| `fetch-jira-items-batch.ps1` | JQL → list of issues (auto-paginates) | POST | `/rest/api/3/search/jql` |
| `query-jira.ps1` | JQL → summarized results (legacy `/search`) | POST | `/rest/api/3/search` |
| `add-jira-comment.ps1` | Append comment in ADF format | POST | `/rest/api/3/issue/{key}/comments` |
| `update-jira-issue.ps1` | PATCH issue fields (summary/desc/labels/customs) | PUT | `/rest/api/3/issue/{key}` |
| `transition-jira-issue.ps1` | Resolve transition name → execute | GET + POST | `/rest/api/3/issue/{key}/transitions` |
| `set-jira-test-plan-ids.ps1` | Write `customfield_10257`+`customfield_10258` on a batch of stories with conflict detection | GET + PUT | `/rest/api/3/issue/{key}` |

### 1.2 Azure DevOps Integration (14 scripts)

| Script | Purpose | HTTP Method(s) | Endpoint family |
|---|---|---|---|
| `create-ado-test-cases.ps1` | Create Test Case work items via JSON Patch; attach `Microsoft.VSTS.TCM.Steps` XML; transition to `Ready`; optional `-Verify` re-fetch | PATCH+GET | `/wit/workitems/$Test%20Case` |
| `update-ado-test-cases.ps1` | Batch field updates + per-TC step rewrite (pipe-delimited) + state transition | POST(batch) PATCH | `/wit/workitemsbatch`, `/testplan/workitems/{id}`, `/wit/workitems/{id}` |
| `manage-ado-test-suite.ps1` | Resolve suite by name (lookup → create under parent) → add TC IDs (batch w/ per-ID fallback) | GET+POST | `/testplan/plans/{p}/suites`, `/test/plans/{p}/suites/{s}/testcases/{ids}` |
| `fetch-ado-test-case.ps1` | Single TC fetch with 19 fields + parsed steps | GET | `/wit/workitems/{id}` |
| `fetch-ado-test-cases-by-suite.ps1` | Suite → TC IDs → batch detail fetch + step count | GET+POST | `/testplan/{p}/suites/{s}/testcases`, `/wit/workitemsbatch` |
| `fetch-ado-test-cases-by-query.ps1` | WIQL → TC IDs → batch detail fetch + step count | POST+POST | `/wit/wiql`, `/wit/workitemsbatch` |
| `fetch-ado-test-suite-hierarchy.ps1` | Plan → flat suite list + recursive tree (root resolved by `parent.id=0`) | GET | `/testplan/{p}/suites` |
| `create-ado-pull-request.ps1` | Create PR (draft/published), optional auto-complete with `noFastForward` strategy | POST+PATCH | `/git/repositories/{r}/pullrequests` |
| `fetch-ado-pr-summary.ps1` | PR metadata + reviewers + votes | GET | `/git/repositories/{r}/pullrequests/{id}` |
| `fetch-ado-pr-files.ps1` | Latest iteration → change list with `changeType` decoded | GET | `/git/.../iterations/{i}/changes` |
| `fetch-ado-pr-diff.ps1` | Per-file diff metadata (partial — blob fetch is TODO) | GET | `/git/.../iterations/{i}/changes` |
| `fetch-ado-pr-comments.ps1` | All threads + status decoded (active/fixed/wontFix/closed/byDesign/pending) | GET | `/git/repositories/{r}/pullrequests/{id}/threads` |
| `post-ado-pr-comment.ps1` | New thread (file+line context optional), status as numeric | POST | `/git/repositories/{r}/pullrequests/{id}/threads` |
| `update-ado-pr-status.ps1` | Update reviewer vote (-10..10) | PATCH | `/git/repositories/{r}/pullrequests/{id}/reviewers` |

### 1.3 Test Plan Generation (1 script)

| Script | Purpose | I/O |
|---|---|---|
| `generate-test-plan-md.ps1` | Convert categorization JSON → ADO-wiki-compatible markdown. Branches on `plan_type ∈ { feature, regression }`. Generates summary table, "New Test Case Details" blocks, anchors, and (for regression) Section 2 manual TCs + dropped-bucket disposition. | Input: `categorization.json` Output: `plan.md` |

---

## 2. Fluxo de Controle — Padrão Comum

All scripts share a **5-block layout**:

```
1. param() block             ← typed parameters, Mandatory/optional, defaults
2. $ErrorActionPreference = 'Stop'  ← terminate on any cmdlet error
3. Credential resolution     ← -Pat/-PAT > env var > Write-Error+exit 1
4. function Invoke-{Jira|Ado}Api {}  ← API wrapper, returns @{Success, Data, Error}
5. try { ... } catch { ... } ← Main work; on catch, emit error envelope + exit 1
```

🟢 **Confirmed pattern** — present in all 22 scripts. Variations are internal logic only.

### 2.1 Two Invoke-*Api signatures

Two parallel helper signatures exist across the codebase:

**Signature A** (endpoint-style, used by most): `Invoke-AdoApi -Method <verb> -Endpoint <relative> -Body <hashtable> [-ApiVersion <v>]` — builds URI from `$BaseUri`.

**Signature B** (full-URI style, used by `create-ado-test-cases.ps1` and `manage-ado-test-suite.ps1`): `Invoke-AdoApi -Method <verb> -Uri <full> -Body <hashtable> [-ContentType <ct>]` — accepts arbitrary full URLs. Required because work-item-create uses `_apis/wit/workitems/$Test%20Case` (literal `$` must not be expanded by PowerShell variable substitution).

🟡 **Inferred** — Signature B used wherever URI construction needs literal `$` (test case template) or non-standard content type (`application/json-patch+json`).

---

## 3. Algorithms & Non-trivial Logic

### 3.1 Atlassian Auth Header Construction — DIVERGENT IMPLEMENTATIONS

**🔴 Bug class found:**

Two different implementations of basic auth encoding exist:

**Correct** (`fetch-jira-issue.ps1` line 45, `fetch-jira-items-batch.ps1` line 43, `update-jira-issue.ps1` line 57, `set-jira-test-plan-ids.ps1` line 52):
```powershell
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($Pat))
# Pat already in "email:apitoken" form
```

**Incorrect** (`query-jira.ps1` line 37, `add-jira-comment.ps1` line 38, `transition-jira-issue.ps1` line 39):
```powershell
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($Pat.Split(':')[0]):$Pat"))
# Encodes "email:email:apitoken" — double-concatenated, invalid auth
```

Outcome: Three Jira scripts will fail 401 unless the caller passes a `-Pat` that the broken formula happens to mangle into a valid string (it does not — the result is malformed). Either these scripts have never been exercised since the others were refactored, or they are always run with `-Pat` from skills that catch the error. 🔴 **LACUNA** — needs validation against actual call sites.

### 3.2 Jira REST API v3 Pagination — `search/jql` vs `search`

`fetch-jira-items-batch.ps1` uses **POST `/rest/api/3/search/jql`** (current Atlassian Cloud endpoint) with token-based pagination via `nextPageToken` and `isLast`:

```powershell
do {
    $body['nextPageToken'] = $nextPageToken  # if present
    $response = POST search/jql
    $nextPageToken = if ($response.isLast -eq $false) { $response.nextPageToken } else { $null }
} while ($nextPageToken)
```

`query-jira.ps1` uses **POST `/rest/api/3/search`** (deprecated). 🟡 Single-page only — no pagination loop. 🔴 Drift between the two scripts; `query-jira.ps1` may break when Atlassian retires the legacy endpoint.

### 3.3 ADO Test Case Creation — Multi-phase PATCH

`create-ado-test-cases.ps1` orchestrates a **3-phase write per test case** because ADO rejects step XML and state transitions in the same payload as field creation:

```
Phase 1: POST $Test%20Case with JSON Patch (field set)  → returns ADO id
Phase 2: PATCH /wit/workitems/{id} with Steps XML       (if steps provided)
Phase 3: PATCH /wit/workitems/{id} with state = "Ready" (always last)
```

🟢 **Confirmed** — code at lines 305–379. Failure in any phase records `partial: true` flag in the failures array, so the caller knows the work item exists but is incomplete.

### 3.4 ADO Step Encoding — XML+HTML Entity Hybrid

`Format-StepsXml` and `ConvertTo-StepXmlText` (lines 176–205) build the `Microsoft.VSTS.TCM.Steps` field. Key rules:

- Step IDs start at **2** (ADO convention; ID 1 is reserved).
- Outer envelope: `<steps id="0" last="{count+1}">...</steps>`.
- Each step: `<step id="N" type="ActionStep"><parameterizedString isformatted="true">{action}</parameterizedString><parameterizedString isformatted="true">{expected}</parameterizedString><description/></step>`.
- Text inside `parameterizedString` is **HTML inside XML**: `<br/>` must be encoded as `&lt;br&gt;` (visual break inside the parameterized string), not `<br/>` (would be parsed as XML element). Ampersand encoded first.

🟢 **Confirmed** — explicit inline comment line 174–175.

### 3.5 ADO Step Encoding — Pipe-delimited (different format)

`update-ado-test-cases.ps1::Format-Steps` (lines 146–162) uses a **pipe-delimited plain-text format** instead of XML:

```
"1. {action with | escaped}|{expected_result with | escaped}\n2. ..."
```

This is sent to the `/testplan/workitems/{tcId}` endpoint, which is a different ADO API surface than the work-item PATCH used by `create-ado-test-cases.ps1`. The two formats are mutually exclusive at the API layer.

🟡 **Inferred** — the API surface `testplan/workitems` accepts only this delimited format; `wit/workitems` only XML. Drift between create and update encodings is intentional, not an inconsistency.

### 3.6 ADO Test Suite Resolution — 3-branch decision

`manage-ado-test-suite.ps1` line 95–135:

```
if ops.suite_id → use directly, skip lookup
elif suite_name found uniquely in plan → use that ID
elif suite_name found multiple times → ERROR (ambiguous, demand explicit suite_id)
else → CREATE under (parent_suite_id ?? root suite of plan)
                where root suite is `suiteType == "RootSuite"`
```

🟢 **Confirmed**. Ambiguity guard (line 109–112) prevents silently writing to the wrong suite when names collide.

### 3.7 ADO Test Case Batch Add — Fallback to Per-ID

`manage-ado-test-suite.ps1` line 143–161: tries to add all TC IDs in one call via comma-separated path segment. On failure, retries per-ID to isolate which IDs are rejected. Returns `added_tc_ids` (succeeded) + `failures` (rejected with reason).

🟢 **Confirmed** — important for partial-success reporting; the batch endpoint returns a single error code without naming which ID failed.

### 3.8 Conflict-aware Custom Field Write (Jira)

`set-jira-test-plan-ids.ps1` line 100–151: for each story key, fetches `customfield_10257` (Test Plan ID) and `customfield_10258` (Suite ID), classifies into one of four buckets:

```
already_set_to_target  → skipped
non-null and differs   → conflicts (skipped unless overwrite_conflicts=true)
null or empty          → updated
update API error       → failures
```

🟢 **Confirmed**. Normalization of literal `"null"` string (line 113–114) defends against PowerShell serializing `$null` PSCustomObject members as the string `"null"`.

### 3.9 Test Case Validation — Forbidden Verbs

`create-ado-test-cases.ps1::Validate-OperationsJson` line 84–134:

- Hard errors: missing `title`, `qa_functional_area`, `test_type`, `coverage_type`; `manual_reason` required when `manual=true`; `description_metadata` cannot have both `ac_references` AND `absorbs_ids`.
- Soft warnings: step `action` starting with verbs `observe|verify|see|check|confirm|note` (these describe verifications, not user actions, and belong in Expected Result).

🟢 **Confirmed**. Reflects a domain rule: ADO test step "Action" is an instruction; "Expected Result" is the assertion.

### 3.10 Automation Status Inference

`create-ado-test-cases.ps1` line 312–315:

```powershell
$automationStatus = "Not Automated"
if ($tc.regression_coverage_evaluation -eq "Contributes to Coverage" -and $tc.manual -ne $true) {
    $automationStatus = "Planned"
}
```

🟢 **Confirmed**. Only manually-flagged TCs that contribute to regression coverage are marked `Planned` (queued for automation work). Manual=true forces `Not Automated`.

### 3.11 Markdown Anchor Generation (test plan)

`generate-test-plan-md.ps1::Get-MarkdownAnchor` line 29–36: lowercases, strips non-alphanumeric (preserves hyphens), collapses whitespace, normalizes consecutive hyphens. Prepends `#`. Anchors used only for **NEW** test cases (id == "NEW") so the summary table row links to the detail block below.

🟢 **Confirmed**.

### 3.12 PR Vote Encoding

`update-ado-pr-status.ps1` line 67–75 + `fetch-ado-pr-summary.ps1` line 84: ADO vote values are integers, mapped:

| Label | Integer |
|---|---|
| Rejected | -10 |
| Waiting for author | -5 |
| No vote | 0 |
| Approved with suggestions | 5 |
| Approved | 10 |

🟢 **Confirmed**. Mapping is repeated independently in both scripts (no shared constants); 🔴 **LACUNA** — risk of drift if ADO adds a new value.

### 3.13 PR Comment Thread Status Encoding

`fetch-ado-pr-comments.ps1` line 85–92 + `post-ado-pr-comment.ps1` line 76–82:

| Label | Integer |
|---|---|
| active | 0 |
| fixed | 1 |
| wontFix | 2 |
| closed | 3 |
| byDesign | 4 |
| pending | 5 |
| unknown | default |

🟢 **Confirmed**. Mapping repeated in both scripts.

---

## 4. Estruturas de Dados

### 4.1 Standard JSON Output Envelope

Defined in `SCRIPT_OUTPUT_STANDARD.md` (repo root) and instantiated by every script:

```json
{
  "success": true,
  "data": { /* per-script payload */ },
  "error": null
}
```

Failure form: `success=false`, `data=null`, `error="message"`, exit code 1.

### 4.2 Test Case Operations JSON (input to `create-ado-test-cases.ps1`)

```json
{
  "defaults": {
    "area_path": "DESTINI Web",
    "iteration_path": "DESTINI Web",
    "priority": 2,
    "aut": "Cost Library",
    "qa_blocked": false
  },
  "test_cases": [
    {
      "title": "string (required)",
      "preconditions": ["string", ...],
      "steps": [{ "action": "string", "expected_result": "string" }],
      "qa_functional_area": "string (required)",
      "test_type": "string (required)",
      "coverage_type": "string (required)",
      "description_metadata": {
        "ac_references": ["string"],
        "absorbs_ids": ["string"],
        "notes": "string"
      },
      "multi_user": "bool?",
      "manual": "bool?",
      "manual_reason": "string (required if manual)",
      "cost_item_type": "string?",
      "base_vs_alternates": "string?",
      "regression_coverage_evaluation": "string?"
    }
  ]
}
```

### 4.3 ADO Test Case (post-create / fetch response)

19 fields (confirmed via `fetch-ado-test-case.ps1` line 87–107):

System fields: `System.Id`, `System.Title`, `System.State`, `System.AreaPath`, `System.Description`.

Test-case-specific: `Microsoft.VSTS.TCM.AutomationStatus`, `Microsoft.VSTS.TCM.Steps`.

Custom (`Custom.*`): `QAFunctionalArea`, `TestType`, `CoverageType`, `MultiUser`, `Manual`, `ManualReason`, `CostItemType`, `BasevsAlternates`, `TestCaseDescription`, `RegressionCoverageEvaluation`, `QABlocked`, `AUT`.

### 4.4 Jira Custom Field Mapping (confirmed IDs)

| ID | Purpose | Set by |
|---|---|---|
| `customfield_10001` | Story Points | read in `fetch-jira-issue.ps1` |
| `customfield_10002` | Sprint | read in `fetch-jira-issue.ps1` |
| `customfield_10096` | Unknown (in default field list of `fetch-jira-items-batch.ps1`) | read only |
| `customfield_10140` | Unknown (in default field list) | read only |
| `customfield_10181` | Unknown (in default field list) | read only |
| `customfield_10184` | Unknown (in default field list) | read only |
| `customfield_10257` | ADO Test Plan ID | `set-jira-test-plan-ids.ps1` |
| `customfield_10258` | ADO Suite ID | `set-jira-test-plan-ids.ps1` |

🔴 **LACUNA** — 10096/10140/10181/10184 referenced by ID without inline comment. Field meaning lives in Jira config UI; consult JIRA admin to map.

### 4.5 PR Operations Shape

`create-ado-pull-request.ps1` payload:

```json
{
  "sourceRefName": "refs/heads/feature-x",   // prefix added if absent
  "targetRefName": "refs/heads/master",
  "title": "string",
  "isDraft": false,
  "description": "string?",                  // optional
  // If -AutoComplete: PATCH adds completionOptions {
  //   mergeCommitMessage: "Merge pull request <id>: <title>",
  //   deleteSourceBranch: false,
  //   mergeStrategy: "noFastForward",
  //   transitionWorkItems: true
  // }
}
```

### 4.6 Test Plan Markdown Categorization JSON (`generate-test-plan-md.ps1` input)

Two shapes branch on `plan_type`:

**Feature plan:**
```json
{
  "plan_type": "feature",
  "header": {
    "epic_key": "DC-1234",
    "epic_title": "...",
    "epic_summary": "...",
    "stories_covered": [{ "key", "title", "behavior_summary" }],
    "stories_excluded": [{ "key", "title", "reason" }]
  },
  "test_cases": [ /* TC objects with id="NEW" or numeric ADO id */ ]
}
```

**Regression plan:**
```json
{
  "plan_type": "regression",
  "header": {
    "aut_name": "...",
    "scope_paragraph": "...",
    "field_defaults": { /* arbitrary key-value */ }
  },
  "test_cases": [...],
  "additional_sections": {
    "manual_tcs": [...],
    "dropped_buckets": [{ "name", "count", "ids": [] }]
  }
}
```

---

## 5. Metadata & Configurations

### 5.1 Environment Variables

| Var | Used by | Required if -Pat/-PAT absent |
|---|---|---|
| `ATLASSIAN_EMAIL` | Jira scripts (those that resolve credentials from env) | yes (combined with token) |
| `ATLASSIAN_API_TOKEN` | Jira scripts | yes |
| `ADO_PAT` | All ADO scripts | yes |

🟢 **Confirmed.** Only `fetch-jira-issue.ps1`, `fetch-jira-items-batch.ps1`, `update-jira-issue.ps1`, and `set-jira-test-plan-ids.ps1` support env-var fallback for Jira. The other Jira scripts (`query-jira`, `add-jira-comment`, `transition-jira-issue`) require explicit `-Pat`. 🔴 **LACUNA** — inconsistency may surprise callers that expect uniform behavior.

### 5.2 API Version Pinning

- ADO `wit/*`, `git/*`, `test/plans/*`: **7.0** (stable).
- ADO `testplan/*` family: **7.1-preview.1** (suite + work-item attach endpoints).

🟢 **Confirmed.** Pinning the preview API surface is a known stability risk; ADO may deprecate `7.1-preview.1`.

### 5.3 Default Constants

| Constant | Value | Location |
|---|---|---|
| Default Jira instance | `https://beck-technology.atlassian.net` | `fetch-jira-issue.ps1` line 17, `fetch-jira-items-batch.ps1` line 24, `update-jira-issue.ps1` line 27, `set-jira-test-plan-ids.ps1` line 23 |
| Jira base URL for anchors | `https://beck-technology.atlassian.net/browse` | `generate-test-plan-md.ps1` line 20 |
| Default `MaxResults` (batch) | `50` | `fetch-jira-items-batch.ps1` line 21, `query-jira.ps1` line 20 |
| Default fields (batch fetch) | `summary,status,issuetype,description,parent,customfield_10096,customfield_10140,customfield_10184,customfield_10181` | `fetch-jira-items-batch.ps1` line 18 |
| Default merge strategy (auto-complete PR) | `noFastForward` | `create-ado-pull-request.ps1` line 120 |
| Step ID base (ADO steps XML) | `2` | `create-ado-test-cases.ps1` line 195 |

---

## 6. Error Handling — Audit

| Concern | Status |
|---|---|
| Network retry | 🔴 absent in all scripts |
| Rate limiting backoff | 🔴 absent (Jira: 10 req/s, ADO: 200 req/min per user typical limits) |
| Partial-failure reporting | 🟢 present in `create-ado-test-cases`, `update-ado-test-cases`, `manage-ado-test-suite`, `set-jira-test-plan-ids` |
| Timeout configuration | 🔴 absent (uses PowerShell `Invoke-RestMethod` default ~100s) |
| Token expiry detection | 🔴 absent (would manifest as 401 surfaced as generic error string) |
| Idempotency | 🟡 fetch ops are idempotent; create/update are NOT (re-running create-ado-test-cases produces duplicates) |
| Cancellation token | 🔴 absent (no graceful abort) |
| Auth failure messages | 🟡 raw `.Exception.Message` propagated — leaks little to no actionable detail |

---

## 7. Coupling & Composition

### 7.1 Script → Script invocation

Scripts do not call other scripts directly. The skill layer (`apply-test-plan`, `revise-test-plan`, `create-ado-test-cases` skill, etc.) is the composer:

```
/apply-test-plan
  → generate-test-plan-md.ps1     (markdown rendering)
  → create-ado-test-cases.ps1     (creation + step attach + state transition)
  → manage-ado-test-suite.ps1     (suite resolve + TC add)
  → set-jira-test-plan-ids.ps1    (write plan/suite IDs back to JIRA stories)
```

🟢 **Confirmed** by skill headers in `claude-skills/skills/apply-test-plan/SKILL.md` and source inspection.

### 7.2 Skill → Script direct call

Skills invoke scripts via `Bash` tool with the slash-command argument pattern:

```
pwsh -File claude-skills/scripts/<script>.ps1 -ParamA <val> -ParamB <val>
```

Output is parsed with `ConvertFrom-Json`; `success` field gates the next step.

---

## 8. Confidence Distribution

| Level | Count | Examples |
|---|---|---|
| 🟢 Confirmed | 28 | All HTTP endpoints, all parameter contracts, encoding rules, validation logic |
| 🟡 Inferred | 8 | Pipe-vs-XML rationale, signature B usage, env-var inconsistency intent |
| 🔴 Gap | 6 | Auth-encoding bug in 3 scripts, custom field meanings (10096/10140/10181/10184), retry/rate-limit absence, idempotency guarantees, `fetch-ado-pr-diff` blob-fetch incompleteness, deprecated `/rest/api/3/search` migration |

---

## 9. Open Questions / Validation Items

Recorded for `_reversa_sdd/questions.md`:

1. Are `query-jira.ps1`, `add-jira-comment.ps1`, and `transition-jira-issue.ps1` exercised in production? If yes, how does the documented auth-encoding bug not manifest as 401? Are they always called with a `-Pat` that gets mangled into something Jira coincidentally accepts (likely no), or have they not been run since refactor?
2. What are `customfield_10096`, `10140`, `10181`, `10184` in the JIRA schema?
3. Why does `fetch-ado-pr-diff.ps1` mark `diff_status = "fetch_from_blob_endpoint"` instead of actually fetching? Was the implementation deferred?
4. Is the lack of env-var fallback in `query-jira.ps1`, `add-jira-comment.ps1`, `transition-jira-issue.ps1` deliberate (callers always supply explicit creds) or oversight?
5. What rate limits has BeckTech hit in practice with Atlassian / ADO? Justifies retry/backoff prioritization.

---

## 10. Notes for downstream agents

**For the Detective:** the JIRA custom-field IDs and ADO field names listed here will recur in business-rules extraction. Cross-check the meaning of `customfield_10257`/`10258` against the actual JIRA project config — they may have human-readable names that should appear in the data dictionary.

**For the Architect:** Scripts module is a **leaf in the dependency graph** — no script depends on another script. Container diagrams should treat the Scripts module as the boundary to external systems (Jira, ADO). Integration-flow diagrams should show: skill → script → REST API.

**For the Writer:** Each script has a stable parameter contract suitable for a per-script spec. Recommend one `requirements.md` per script for the most-used 6 (create/update test cases, manage suite, fetch suite-hierarchy, generate-test-plan-md, set-jira-test-plan-ids). The remaining 16 are thin REST wrappers and can be summarized in a single `rest-wrappers.md` page with a uniform "params → endpoint → response shape" table.
