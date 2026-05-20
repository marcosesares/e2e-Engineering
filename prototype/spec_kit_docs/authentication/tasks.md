# authentication — Tarefas de Implementação

> **Unit**: authentication  
> **Language**: English

---

## Pré-requisitos

- [ ] JSON config file handling utilities
- [ ] Base64 encoding library (stdlib base64)
- [ ] fnmatch for glob pattern matching
- [ ] Subprocess execution for azure-cli

---

## Phase 1: Core Framework

- [ ] T-01: Implement AuthProvider abstract base
  - Origin: `src/specify_cli/authentication/base.py:1–100`
  - Criteria: Abstract methods: get_auth_header(), resolve_token(), supports_scheme()
  - Confidence: 🟢

- [ ] T-02: Implement AuthConfigEntry dataclass
  - Origin: `src/specify_cli/authentication/config.py:1–100`
  - Criteria: Fields for host, provider, scheme, token, token_env, username, password
  - Confidence: 🟢

- [ ] T-03: Implement AuthManager orchestrator
  - Origin: `src/specify_cli/authentication/manager.py:1–200`
  - Criteria: load_config(), get_header(), resolve_entry(); host pattern matching
  - Confidence: 🟢

---

## Phase 2: Token Resolution

- [ ] T-04: Implement token resolution from config/env
  - Origin: `src/specify_cli/authentication/base.py:100–200`
  - Criteria: Check entry.token; fallback to entry.token_env; return string or None
  - Confidence: 🟢

- [ ] T-05: Implement dynamic token acquisition (azure-cli)
  - Origin: `src/specify_cli/authentication/azure_devops.py:1–150`
  - Criteria: Execute `az account get-access-token`; parse response; extract token
  - Confidence: 🟡

---

## Phase 3: Concrete Providers

- [x] T-06: Review GitHubAuth (implemented)
  - Real class name: `GitHubAuth` (not `GitHubAuthProvider`)
  - Origin: `src/specify_cli/authentication/github.py:8`
  - Criteria: Bearer scheme; resolve from GITHUB_TOKEN or config; generate header
  - Confidence: 🟢
  - Status: RENAME ONLY — class exists, specs had wrong name

- [x] T-07: Review AzureDevOpsAuth (implemented)
  - Real class name: `AzureDevOpsAuth` (not `AzureDevOpsAuthProvider`)
  - Origin: `src/specify_cli/authentication/azure_devops.py:20`
  - Criteria: Supports 4 schemes (basic-pat, bearer, azure-cli, azure-ad); dynamic token
  - Confidence: 🟢
  - Status: RENAME ONLY + VERIFY additional schemes

- [ ] T-08: HttpBasicAuthProvider — PLANNED / WON'T (not implemented)
  - Status: 🟡 Not in codebase. AzureDevOpsAuth `basic-pat` scheme covers partial need.
  - Decision: Future feature if needed

- [ ] T-09: GenericBearerAuthProvider — PLANNED / WON'T (not implemented)
  - Status: 🟡 Not in codebase. Future extension point.
  - Decision: Future feature if needed

---

## Phase 4: Host Pattern Matching & Validation

- [ ] T-10: Implement host pattern matching (fnmatch)
  - Origin: `src/specify_cli/authentication/manager.py:200–300`
  - Criteria: Match URL against pattern list; support glob wildcards
  - Confidence: 🟢

- [ ] T-11: Implement pattern validation (reject dangerous globs)
  - Origin: `src/specify_cli/authentication/config.py:100–200`
  - Criteria: Reject `*`, `*.example.*`, `*github.com`; accept `*.example.com`
  - Confidence: 🟡

---

## Phase 5: Config Loading & Integration

- [ ] T-12: Implement auth.json parsing
  - Origin: `src/specify_cli/authentication/config.py:200–300`
  - Criteria: Load JSON; validate schema; return AuthConfigEntry list
  - Confidence: 🟢

- [ ] T-13: Integrate auth into HTTP flows
  - Origin: `src/specify_cli/catalogs.py:fetch()`, `extensions.py:install()`
  - Criteria: Before HTTP request, call AuthManager.get_header(); add to request headers
  - Confidence: 🟡

---

## Phase 6: Security & Error Handling

- [ ] T-14: Prevent token logging
  - Origin: `src/specify_cli/authentication/`
  - Criteria: Never log token values; use `<redacted>` in logs
  - Confidence: 🟢

- [ ] T-15: Handle missing token gracefully
  - Origin: `src/specify_cli/authentication/manager.py:300–400`
  - Criteria: Log warning; continue without auth (if not required by provider)
  - Confidence: 🟡
