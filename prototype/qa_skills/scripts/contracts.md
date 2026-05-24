# Scripts, External Contracts

## Jira REST API (Atlassian Cloud)

### Authentication

Header: `Authorization: Basic {base64(email:apiToken)}`

### Endpoints

- `GET /rest/api/3/issue/{key}` — Fetch issue + custom fields
- `POST /rest/api/3/issue/{key}/comments` — Add comment (ADF format)
- `PUT /rest/api/3/issue/{key}` — Update fields
- `POST /rest/api/3/issue/{key}/transitions` — Resolve + execute transition
- `POST /rest/api/3/search` — JQL search

### Expected Responses

- 200: Success, JSON response
- 401: Invalid auth → Instruct user to re-auth
- 403: Forbidden (custom field access) → User needs permissions
- 404: Issue not found

---

## Azure DevOps REST API

### Authentication

Header: `Authorization: Bearer {PAT}`

### Endpoints

- `POST /wit/workitems/$Test%20Case` — Create TC (JSON Patch RFC 6902)
- `PATCH /wit/workitems/{id}` — Update TC fields
- `POST /testplan/plans/{p}/suites` — Create suite
- `GET /testplan/plans/{p}/suites` — List suites
- `POST /git/repositories/{r}/pullrequests` — Create PR

### Field References

- `System.Title`, `System.State`, `System.AreaPath`
- `Custom.QAFunctionalArea`, `Custom.TestType`, `Custom.CoverageType`, `Custom.ManualReason`, etc.
- `Microsoft.VSTS.TCM.Steps` (XML format)

### State Transitions

- Design → Ready (via PATCH System.State)
- Ready → Closed
- Closed → Ready (reopen)

---

## Data Contracts

### Operations JSON (Input to create-ado-test-cases.ps1)

```json
{
  "defaults": { "area_path", "iteration_path", "priority", "aut" },
  "test_cases": [
    {
      "id": "NEW|{existing_id}",
      "title": "string",
      "qa_functional_area": "string",
      "test_type": "Functional|API|...",
      "coverage_type": "Story|Regression|...",
      "steps": [ { "action", "expected_result" }, ... ]
    }
  ]
}
```

### Test Plan Markdown (Output of generate-test-plan-md.ps1)

Feature plan shape:
```
# EPIC-KEY: Title

| Story | Title | Coverage |
| NEW | TC Title | AC ref |

## New Test Case Details
### TC {id}: Title
**Steps:**
1. action | expected result
```

Regression plan shape:
```
# Product Regression Plan

## Section 1: New Test Cases
## Section 2: Manual Test Cases
## Disposition
- Absorbed: [IDs]
- Dropped: [IDs]
```
