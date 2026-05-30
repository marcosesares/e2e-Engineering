# Permissions & Authentication Matrix — Specify CLI

**Generated**: 2026-05-18 (Detective)  
**Project**: spec-kit

---

## 1. Authentication Model

### Philosophy

**Opt-in security**: No credentials are sent to any host unless the user explicitly creates `~/.specify/auth.json` mapping that host to a provider.

- **Default**: All HTTP requests are unauthenticated
- **Activation**: User creates `~/.specify/auth.json` with provider mappings
- **Scope**: Applies to catalog fetch, preset/extension downloads, and any HTTP requests made during workflow execution

**Confidence**: 🟢 (Commit f099834: "Config-driven opt-in authentication registry")

---

## 2. Auth Config File (`~/.specify/auth.json`)

### Structure

```json
{
  "providers": [
    {
      "hosts": ["github.com", "*.github.enterprise.com"],
      "provider": "github",
      "auth": "bearer",
      "token": "ghp_xxxx...",
      "token_env": null
    },
    {
      "hosts": ["dev.azure.com", "*.visualstudio.com"],
      "provider": "azure-devops",
      "auth": "bearer",
      "token": null,
      "token_env": "AZURE_DEVOPS_TOKEN"
    }
  ]
}
```

### Fields

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `hosts` | `string[]` | ✅ | 1+ entries; each must be exact hostname or `*.suffix` | Host patterns to match requests |
| `provider` | `string` | ✅ | Enum: `"github"`, `"azure-devops"`, `"http"` | Which provider handles these hosts |
| `auth` | `string` | ✅ | Enum: `"bearer"`, `"basic"` (provider-specific) | HTTP Authorization scheme |
| `token` | `string` | ❌ | If set, must be non-empty after strip | Literal token value (not recommended for secrets) |
| `token_env` | `string` | ❌ | Environment variable name | Read token from `$env:VAR` at request time |
| `tenant_id` | `string` | ❌ | UUID-like | Azure AD tenant (for azure-ad provider) |
| `client_id` | `string` | ❌ | UUID-like | Azure AD client/app ID |
| `client_secret_env` | `string` | ❌ | Environment variable name | Read client secret from env |

**Resolution Logic** (in `resolve_token(entry)`):
1. If `token` set: use it (after strip)
2. Else if `token_env` set: read from environment variable
3. Else: return `None` (unauthenticated)

**Confidence**: 🟢 (from `src/specify_cli/authentication/config.py`)

---

## 3. Host Pattern Validation

### Valid Patterns

| Pattern | Valid | Matches |
|---------|-------|---------|
| `github.com` | ✅ | Exact hostname only |
| `*.github.com` | ✅ | `api.github.com`, `gist.github.com`, etc. |
| `*.enterprise.github.com` | ✅ | `corp.enterprise.github.com`, etc. |
| `*github.com` | ❌ REJECTED | Would match `github.com.evil.com` (subdomain spoofing) |
| `*.*.example.com` | ❌ REJECTED | Multiple wildcards not allowed |

### Security Rule

**Implemented in** `_is_valid_host_pattern(pattern)`:
```python
if "*" not in pattern:
    return True  # exact hostname
# Only *.suffix is allowed; no other wildcard positions
return pattern.startswith("*.") and "*" not in pattern[2:]
```

**Confidence**: 🟢 (explicit check in code; prevents DNS spoofing)

---

## 4. Supported Providers & Auth Schemes

### GitHub Provider

| Attribute | Value |
|-----------|-------|
| **Key** | `"github"` |
| **Supported Schemes** | `"bearer"` |
| **Common Hosts** | `github.com`, `api.github.com`, `raw.githubusercontent.com` |
| **Token Sources** | `token` (PAT), `token_env` (`GITHUB_TOKEN`, `GH_TOKEN`) |
| **Header** | `Authorization: Bearer <token>` |

**Confidence**: 🟢

### Azure DevOps Provider

| Attribute | Value |
|-----------|-------|
| **Key** | `"azure-devops"` |
| **Supported Schemes** | `"bearer"` (or `"basic"` for PATs encoded as Basic auth) |
| **Common Hosts** | `dev.azure.com`, `*.visualstudio.com` |
| **Token Sources** | `token` (PAT), `token_env` (env var), Azure AD service principal (tenant_id, client_id, client_secret_env) |
| **Header** | `Authorization: Bearer <token>` or `Authorization: Basic <base64>` |

**Confidence**: 🟢 (from `src/specify_cli/authentication/azure_devops.py`)

### HTTP Basic Auth Provider

| Attribute | Value |
|-----------|-------|
| **Key** | `"http"` |
| **Supported Schemes** | `"basic"` |
| **Common Hosts** | Generic/custom HTTP endpoints |
| **Token Sources** | `token` (username:password), `token_env` |
| **Header** | `Authorization: Basic <base64(username:password)>` |

**Confidence**: 🟡 (implied from base provider interface; not fully analyzed)

---

## 5. File Permissions

### Unix/Linux (POSIX) Validation

**Check**: If `~/.specify/auth.json` is readable by group or others:

```python
if mode & (stat.S_IRGRP | stat.S_IROTH):
    warnings.warn(
        f"{config_path} is readable by group/others. "
        "Consider restricting with: chmod 600 {config_path}",
        UserWarning
    )
```

**Enforced**: Warning only (not blocking), issued at config load time
**Skipped on**: Windows (no POSIX mode bits)

**Confidence**: 🟢 (from `authentication/config.py`)

---

## 6. Request-Level Authorization

### Catalog Fetch (Presets & Extensions)

**Flow**:
1. Load auth.json entries (or empty list if file doesn't exist)
2. Catalog URL (e.g., `https://raw.githubusercontent.com/github/spec-kit/main/presets/catalog.json`)
3. Extract hostname: `raw.githubusercontent.com`
4. Match against `hosts` patterns (fnmatch)
5. If match: resolve provider → resolve token → build auth headers
6. Fetch catalog with headers
7. Cache result (TTL: 1 hour for presets, 24 hours for extensions)

**Catalog URL Validation** (in `PresetCatalog._validate_catalog_url()`):
- Must be HTTPS (or `http://localhost:*` for dev)
- Rejects `http://` to production URLs

**Confidence**: 🟢

### Preset/Extension Download

**Flow** (same as catalog):
1. Get preset info from merged catalog
2. Download ZIP from catalog-provided URL (e.g., GitHub release URL)
3. Hostname from URL → match auth.json → resolve provider
4. Download with auth headers if matched

**Confidence**: 🟡 (logic inferred; not explicitly traced in analyzed modules)

### Workflow Step HTTP Requests

**Flow** (in `IntegrationRuntime`):
1. Step declares HTTP request (URL, method, body)
2. Extract hostname
3. Match against auth.json
4. Build auth headers if matched
5. Issue request

**Confidence**: 🟡 (integration runtime not fully analyzed; assumed to use same auth infrastructure)

---

## 7. Permission Matrix

### Who Can Do What?

| Action | Requirements | Notes |
|--------|--------------|-------|
| **List catalogs** | None (public, or auth.json if private) | Returns merged catalog from all enabled sources |
| **Install preset** | Catalog readable, manifest valid, speckit version compatible | Validates manifest.requires.speckit_version |
| **Install extension** | Catalog readable, manifest valid, speckit version compatible | Same as preset; also registers commands with agents |
| **Enable/disable preset** | Preset installed | Toggled in registry; affects template resolution |
| **Remove preset** | Preset installed | Optional `keep_config` flag preserves user settings |
| **Run workflow** | Workflow manifest valid, default integration set or step declares one | Requires integration runtime to be available |
| **Use template** | Template resolves (priority stack finds it) | Lookup is deterministic; no ACL per template |
| **Use authenticated catalog** | auth.json configured for that host OR catalog is public | Opt-in model; absence = public access |
| **Use authenticated preset download** | auth.json configured for preset source host | Same as catalog auth |

**Confidence**: 🟢 (matrix derived from code flows)

---

## 8. Access Control (Implicit)

### No User-Level ACL

**Current Model**:
- Single user per project (developer)
- No roles/teams/permissions system
- All actions available to that user if they have the file

**Implied Future Extension** (from code structure):
- Presets/extensions could be marked `install_allowed: false` in catalog (prevents install, allows use if already installed)
- Workflows could be marked `protected` or `read-only` (requires code change to support)

**Confidence**: 🟡 (current code lacks ACL; catalog entry has `install_allowed` flag but minimal usage)

---

## 9. Security Considerations

### Known Patterns

| Pattern | Risk | Mitigation |
|---------|------|-----------|
| **Token in auth.json** | If repo is pushed with token | Use `token_env` to read from secure env var instead |
| **Group-readable auth.json** | Other users on system can read tokens | Unix warning at load time; user must `chmod 600` |
| **Hostname pattern `*github.com`** | Matches `github.com.evil.com` (DNS spoofing) | Rejected at validation; only `*.suffix` allowed |
| **HTTP catalog URL** | Man-in-the-middle | Rejected; HTTPS only (except localhost dev) |
| **Catalog cache not invalidated on token rotation** | Old cached data with stale tokens | TTL: 1 hour; force-refresh available; manual clear available |
| **No token expiry check** | Expired tokens still sent | Each request sends current resolved token (good), but no validation of expiry before use |

**Confidence**: 🟡 (known patterns from code; potential gaps noted as inference)

---

## 10. Glossary for This Document

| Term | Definition |
|------|-----------|
| **auth.json** | User-created config file at `~/.specify/auth.json` mapping hosts to providers |
| **Provider** | Concrete auth mechanism (GitHub, Azure DevOps, HTTP Basic, Azure AD, Azure CLI) |
| **Auth Scheme** | HTTP Authorization header format (bearer, basic) |
| **Host Pattern** | Glob-like pattern matching hostnames (exact or `*.suffix`) |
| **Token** | Credential (PAT, JWT, Basic auth value) |
| **Opt-in** | Default unauthenticated; credentials sent only if configured |

---

## Summary

**Strengths**:
- 🟢 Opt-in auth prevents accidental credential leakage
- 🟢 Host pattern validation prevents spoofing
- 🟢 Providers are pluggable (ABC pattern)
- 🟢 Multiple token sources (literal, env var, dynamic acquisition)

**Gaps**:
- 🔴 No per-template/preset ACL (only install_allowed flag on catalog entries)
- 🔴 No token expiry validation
- 🔴 No audit log of which requests used which provider
- 🔴 Cache invalidation is time-based only (no signal-based refresh on token rotation)
