# authentication — Multi-Provider Auth Framework

> **Unit**: authentication  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `authentication` module provides a pluggable authentication framework for external integrations. It supports multiple auth providers (GitHub PAT, Azure DevOps, HTTP Basic, custom), generates authorization headers, and manages token lifecycle. Authentication is **opt-in**: absence of configuration = no authentication.

---

## Responsibilities

- Provide AuthProvider abstract base for all auth implementations
- Resolve tokens from auth.json config or environment variables
- Generate HTTP Authorization headers (bearer, basic, custom schemes)
- Implement concrete providers (GitHub, Azure DevOps, HTTP Basic)
- Support dynamic token acquisition (e.g., via Azure CLI)
- Manage auth config parsing and validation

---

## Business Rules

- **Auth is opt-in** — No configuration = no authentication sent. 🟢
- **Token sources** — Resolved from auth.json entry.token or entry.token_env. 🟢
- **Host patterns** — Glob-safe patterns (`example.com`, `*.example.com`); dangerous patterns rejected. 🟢
- **Supported schemes** — bearer, basic, azure-cli, custom (extensible). 🟢
- **Header format** — Standard HTTP Authorization header (e.g., `Authorization: Bearer <token>`). 🟢

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | System loads auth config from auth.json | Should | `~/.specify/auth.json` parsed; each entry has provider, scheme, token/token_env |
| RF-02 | System resolves tokens from config or env | Must | Entry.token used if present; else read from entry.token_env |
| RF-03 | System generates bearer token Authorization header | Must | Format: `Authorization: Bearer <token>` |
| RF-04 | System generates HTTP Basic Authorization header | Must | Format: `Authorization: Basic <base64(user:pass)>` |
| RF-05 | System supports GitHub auth provider | Should | GitHubAuth (authentication/github.py:8) implements bearer scheme 🟢 |
| RF-06 | System supports Azure DevOps auth provider | Should | AzureDevOpsAuth (authentication/azure_devops.py:20) supports 4 schemes (basic-pat, bearer, azure-cli, azure-ad) 🟢 |
| RF-07 | System supports HTTP Basic auth provider | Could | Planned / Not implemented. AzureDevOpsAuth `basic-pat` covers partial need. 🟡 |
| RF-08 | System validates host patterns (rejects dangerous globs) | Should | Allow `*.example.com`; reject `*`, `*github.com` |
| RF-09 | System allows custom auth providers | Could | AuthProvider subclass extensible; new providers registered in registry |
| RF-10 | System handles missing token gracefully | Should | Log warning; continue without auth (if not required) |
| RF-11 | System supports environment variable tokens | Must | Entry.token_env allows reading token from $ENV_VAR |
| RF-12 | System integrates auth into catalog/integration workflows | Should | When fetching remote resource, check auth config for matching host |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Security | Tokens never logged or displayed in output | Careful handling in code | 🟢 |
| Usability | Error messages guide user to create auth config | Clear guidance on missing auth | 🟡 |
| Extensibility | New providers added via AuthProvider subclass | Abstract base pattern | 🟢 |
| Compatibility | Supports 30+ AI agents' auth schemes | Integration with agent metadata | 🟡 |

---

## Acceptance Criteria

```gherkin
Scenario: Generate bearer token header
  Given auth entry with provider="github", scheme="bearer", token="ghp_xxx"
  When header generated
  Then "Authorization: Bearer ghp_xxx" returned

Scenario: Resolve token from environment
  Given auth entry with token_env="GITHUB_TOKEN"
  When token requested
  Then environment variable $GITHUB_TOKEN read
  And token value returned

Scenario: Validate host pattern
  Given host pattern "*.example.com"
  When pattern validated
  Then pattern accepted
  Given pattern "*"
  When validated
  Then error: "Dangerous glob pattern"

Scenario: Opt-in authentication
  Given no auth.json configured
  When system sends HTTP request
  Then no Authorization header added

Scenario: Azure CLI token acquisition
  Given integration requires Azure DevOps auth
  And auth entry with scheme="azure-cli"
  When token requested
  Then 'az account get-access-token' executed
  And token extracted from response
```

---

## Scope & Scale

- **Auth entries**: 5–20 typical (one per integration/catalog)
- **Token refresh**: No automatic refresh (assume long-lived tokens)
- **Host patterns**: 100+ patterns supported (typical: 5–10)
