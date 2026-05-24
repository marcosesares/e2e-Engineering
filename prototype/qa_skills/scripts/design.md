# Scripts, Design Técnico

## Interface

All scripts return: `{ success: bool, data: object|null, error: string|null }`

### Jira Scripts (7)

| Script | Input | Returns |
|--------|-------|---------|
| fetch-jira-issue.ps1 | key, -Pat | raw.json object |
| add-jira-comment.ps1 | key, comment, -Pat | comment object |
| update-jira-issue.ps1 | key, fields hash, -Pat | updated issue object |
| transition-jira-issue.ps1 | key, transition name, -Pat | result object |
| set-jira-test-plan-ids.ps1 | keys array, customfield values, -Pat | batch result |

### ADO Scripts (14)

| Script | Input | Returns |
|--------|-------|---------|
| create-ado-test-cases.ps1 | Operations JSON, -Pat | { created[], failures[], warnings[], verification[] } |
| manage-ado-test-suite.ps1 | suite_name, TC IDs, -Pat | { suite_id, added_tc_ids[] } |
| update-ado-test-cases.ps1 | TC updates JSON, -Pat | batch result |
| fetch-ado-test-case.ps1 | TC ID, -Pat | TC object with 19 fields |
| fetch-ado-pr-*.ps1 (4) | PR ID, -Pat | PR metadata |

### Generation Scripts (1)

| Script | Input | Returns |
|--------|-------|---------|
| generate-test-plan-md.ps1 | categorization JSON | Markdown string |

---

## Fluxo Principal

1. Caller constructs parameters (or -Pat if using param)
2. Script resolves credentials: -Pat > $env:ADO_PAT / $env:ATLASSIAN_* > Write-Error + exit 1
3. Script calls Invoke-*Api helper with HTTP method + endpoint + body
4. Helper constructs header (Basic Auth for Jira, Bearer for ADO), sends request
5. Script processes response, builds output object
6. Script emits JSON envelope to stdout
7. Script exits 0 (success) or 1 (error)

---

## Decisões

- No retry logic; fail fast 🟢
- Credentials by precedence (not interactive) 🟢
- Stateless; re-runs are deterministic 🟢
- Batch operations where possible 🟡

---

## Riscos

- 🔴 No rate-limit handling
- 🔴 No circuit breaker or backoff
- 🟡 Performance at 100+ TCs not measured
