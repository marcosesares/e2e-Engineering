# Legacy Mapping — Scripts Module

**Module:** Scripts (22 PowerShell automation scripts)
**Granularity:** `module` (per `.reversa/config.toml [specs]`)
**Last updated:** 2026-05-23

This document maps every file that participates in the "Scripts" unit to its physical location in the legacy repository. Used by downstream agents (Architect, Writer) to anchor specs back to source.

---

## File inventory

### Jira Integration (7 files)

| File | Path | LOC | Endpoints |
|---|---|---|---|
| `fetch-jira-issue.ps1` | `claude-skills/scripts/fetch-jira-issue.ps1` | 135 | GET `/rest/api/3/issue/{key}` |
| `fetch-jira-items-batch.ps1` | `claude-skills/scripts/fetch-jira-items-batch.ps1` | 91 | POST `/rest/api/3/search/jql` |
| `query-jira.ps1` | `claude-skills/scripts/query-jira.ps1` | 135 | POST `/rest/api/3/search` (deprecated) |
| `add-jira-comment.ps1` | `claude-skills/scripts/add-jira-comment.ps1` | 121 | POST `/rest/api/3/issue/{key}/comments` |
| `update-jira-issue.ps1` | `claude-skills/scripts/update-jira-issue.ps1` | 157 | PUT `/rest/api/3/issue/{key}` |
| `transition-jira-issue.ps1` | `claude-skills/scripts/transition-jira-issue.ps1` | 119 | GET+POST `/rest/api/3/issue/{key}/transitions` |
| `set-jira-test-plan-ids.ps1` | `claude-skills/scripts/set-jira-test-plan-ids.ps1` | 172 | GET+PUT `/rest/api/3/issue/{key}` |

### ADO Integration (14 files)

| File | Path | LOC | Endpoints |
|---|---|---|---|
| `create-ado-test-cases.ps1` | `claude-skills/scripts/create-ado-test-cases.ps1` | 407 | PATCH `/wit/workitems/$Test%20Case`, PATCH `/wit/workitems/{id}` |
| `update-ado-test-cases.ps1` | `claude-skills/scripts/update-ado-test-cases.ps1` | 319 | POST `/wit/workitemsbatch`, PATCH `/testplan/workitems/{id}`, PATCH `/wit/workitems/{id}` |
| `manage-ado-test-suite.ps1` | `claude-skills/scripts/manage-ado-test-suite.ps1` | 181 | GET `/testplan/plans/{p}/suites`, POST `/testplan/plans/{p}/suites/{parent}`, POST `/test/plans/{p}/suites/{s}/testcases/{ids}` |
| `fetch-ado-test-case.ps1` | `claude-skills/scripts/fetch-ado-test-case.ps1` | 155 | GET `/wit/workitems/{id}` |
| `fetch-ado-test-cases-by-suite.ps1` | `claude-skills/scripts/fetch-ado-test-cases-by-suite.ps1` | 148 | GET `/testplan/{p}/suites/{s}/testcases`, POST `/wit/workitemsbatch` |
| `fetch-ado-test-cases-by-query.ps1` | `claude-skills/scripts/fetch-ado-test-cases-by-query.ps1` | 143 | POST `/wit/wiql`, POST `/wit/workitemsbatch` |
| `fetch-ado-test-suite-hierarchy.ps1` | `claude-skills/scripts/fetch-ado-test-suite-hierarchy.ps1` | 143 | GET `/testplan/{p}/suites` |
| `create-ado-pull-request.ps1` | `claude-skills/scripts/create-ado-pull-request.ps1` | 154 | POST `/git/repositories/{r}/pullrequests`, PATCH `/git/repositories/{r}/pullrequests/{id}` |
| `fetch-ado-pr-summary.ps1` | `claude-skills/scripts/fetch-ado-pr-summary.ps1` | 121 | GET `/git/repositories/{r}/pullrequests/{id}` |
| `fetch-ado-pr-files.ps1` | `claude-skills/scripts/fetch-ado-pr-files.ps1` | 144 | GET `/git/.../iterations`, GET `/git/.../iterations/{i}/changes` |
| `fetch-ado-pr-diff.ps1` | `claude-skills/scripts/fetch-ado-pr-diff.ps1` | 166 | GET `/git/.../iterations`, GET `/git/.../iterations/{i}/changes` |
| `fetch-ado-pr-comments.ps1` | `claude-skills/scripts/fetch-ado-pr-comments.ps1` | 151 | GET `/git/repositories/{r}/pullrequests/{id}/threads` |
| `post-ado-pr-comment.ps1` | `claude-skills/scripts/post-ado-pr-comment.ps1` | 133 | POST `/git/repositories/{r}/pullrequests/{id}/threads` |
| `update-ado-pr-status.ps1` | `claude-skills/scripts/update-ado-pr-status.ps1` | 121 | PATCH `/git/repositories/{r}/pullrequests/{id}/reviewers` |

### Test Plan Generation (1 file)

| File | Path | LOC | Purpose |
|---|---|---|---|
| `generate-test-plan-md.ps1` | `claude-skills/scripts/generate-test-plan-md.ps1` | 325 | Pure-PS markdown renderer (no HTTP) |

---

## Supporting contracts

| File | Path | Role |
|---|---|---|
| Standard envelope spec | `SCRIPT_OUTPUT_STANDARD.md` | Defines `{success, data, error}` shape returned by every script |

---

## Key call sites by line

| Symbol | File:line | Purpose |
|---|---|---|
| `Invoke-JiraApi` | every Jira script (canonical: `fetch-jira-issue.ps1:38-63`) | REST wrapper, returns `@{Success, Data, Error}` |
| `Invoke-AdoApi` (endpoint variant) | `update-ado-test-cases.ps1:48-76`, all fetch scripts | URI built from `$BaseUri` |
| `Invoke-AdoApi` (URI variant) | `create-ado-test-cases.ps1:55-81`, `manage-ado-test-suite.ps1:47-73` | Accepts full URI; supports custom content-type |
| `Validate-OperationsJson` | `create-ado-test-cases.ps1:84-134` | Hard errors + soft verb warnings |
| `Format-StepsXml` | `create-ado-test-cases.ps1:188-205` | TCM.Steps XML serializer |
| `Format-Steps` (pipe-delimited) | `update-ado-test-cases.ps1:146-162` | Different format for `/testplan/workitems` endpoint |
| `ConvertTo-StepXmlText` | `create-ado-test-cases.ps1:176-185` | HTML-encodes `<br/>` inside XML |
| `Format-PreconditionsHtml` | `create-ado-test-cases.ps1:137-146` | Renders preconditions as HTML bulleted list |
| `Format-DescriptionHtml` | `create-ado-test-cases.ps1:149-171` | Renders ac_references/absorbs_ids/notes metadata block |
| `Build-PatchDocument` | `create-ado-test-cases.ps1:208-216` | hashtable → JSON Patch `op=add` array |
| `Invoke-VerifyTc` | `create-ado-test-cases.ps1:219-265` | Spot-check post-create State/Description/Steps count |
| `Get-MarkdownAnchor` | `generate-test-plan-md.ps1:29-36` | Slugifies TC name into MD anchor |
| `Build-SuiteTree` (recursive) | `fetch-ado-test-suite-hierarchy.ps1:61-85` | Builds nested children with depth |
| `Parse-Steps` (pipe-delimited) | `fetch-ado-test-case.ps1:61-82` | Inverse of `Format-Steps` |

---

## Cross-references

- All Jira scripts share the v3 REST surface at `https://beck-technology.atlassian.net/rest/api/3/` (default; overridable).
- All ADO scripts target `https://dev.azure.com/{org}/{project}/_apis/`.
- Auth: Jira uses Basic with `email:apitoken` base64; ADO uses Basic with empty username + PAT base64 (`:$PAT`).
