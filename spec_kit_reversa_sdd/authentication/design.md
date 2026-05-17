# authentication — Design Técnico

> **Unit**: authentication  
> **Type**: Feature  
> **Language**: English

---

## Interface

### AuthProvider (Abstract Base)

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `get_auth_header()` | resource: str | dict or None | Returns Authorization header dict or None |
| `resolve_token()` | — | str or None | Fetch token from config/env |
| `supports_scheme()` | scheme: str | bool | Check if provider handles scheme |

### AuthConfigEntry (Dataclass)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `host` | string | Yes | Glob pattern (example.com, *.example.com) |
| `provider` | string | Yes | "github", "azure-devops", "http", etc. |
| `scheme` | string | Yes | "bearer", "basic", "azure-cli", etc. |
| `token` | string | No | Literal token value |
| `token_env` | string | No | Environment variable name |
| `username` | string | No | For basic auth |
| `password` | string | No | For basic auth |

### AuthManager (Orchestrator)

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `load_config()` | path: str | list[AuthConfigEntry] | Load and parse auth.json |
| `get_header()` | resource_url: str | dict or None | Get auth header for URL |
| `resolve_entry()` | url: str | AuthConfigEntry or None | Find matching config entry |

---

## Providers Implemented

### GitHubAuth 🟢

- **Scheme**: bearer
- **Token source**: token or GITHUB_TOKEN env
- **Header**: `Authorization: Bearer <token>`
- **Code**: `authentication/github.py:8`

### AzureDevOpsAuth 🟢

- **Scheme**: azure-cli, bearer (supports 4 schemes: basic-pat, bearer, azure-cli, azure-ad)
- **Token source**: `az account get-access-token` (azure-cli), or token/AZURE_TOKEN env
- **Header**: `Authorization: Bearer <token>`
- **Code**: `authentication/azure_devops.py:20`

### HttpBasicAuthProvider 🟡 (Planned / Not Implemented)

- **Scheme**: basic
- **Token source**: username + password
- **Header**: `Authorization: Basic <base64(user:pass)>`
- **Status**: No concrete class exists. Covered partially by AzureDevOpsAuth `basic-pat` scheme.
- **Note**: Base class `AuthProvider` defined at `authentication/base.py:12`

### GenericBearerAuthProvider 🟡 (Planned / Not Implemented)

- **Scheme**: bearer (fallback for unlisted agents)
- **Token source**: token or configured env var
- **Header**: `Authorization: Bearer <token>`
- **Status**: No concrete class exists. Future extension point.

---

## Config Schema (auth.json)

```json
{
  "version": "1.0",
  "entries": [
    {
      "host": "github.com",
      "provider": "github",
      "scheme": "bearer",
      "token": null,
      "token_env": "GITHUB_TOKEN"
    },
    {
      "host": "*.azuredevops.com",
      "provider": "azure-devops",
      "scheme": "azure-cli"
    }
  ]
}
```

---

## Token Resolution Priority

1. **Explicit token** (`entry.token`): Use if present
2. **Environment variable** (`entry.token_env`): Read $VAR if present
3. **Dynamic acquisition** (azure-cli): Execute command
4. **None**: Return null (no auth)

---

## Host Pattern Matching

- **Exact match**: `github.com` → matches `github.com` only
- **Wildcard**: `*.example.com` → matches `api.example.com`, `registry.example.com`, etc.
- **Rejected patterns**: `*`, `*.example.*`, `*github.com` (dangerous)

---

## Error Handling

- **Missing token**: Log warning; continue without auth
- **Invalid pattern**: Reject config on load
- **Invalid base64 (basic)**: Log error; skip auth for this entry
- **Azure CLI not found**: Log error; fall back to env token

---

## Integration Points

- **Catalog fetch**: Check auth before HTTP GET
- **Extension install**: Auth when fetching from private registry
- **Workflow prompt step**: Auth when calling private AI agent API
- **Integration setup**: Auth when registering with service

---

## Diagram: Token Resolution

```
[Get header for URL]
    ↓
[Find matching entry by host pattern]
    ↓
[Resolve token source]
    ├─ entry.token? → Use
    ├─ entry.token_env? → Read $VAR
    ├─ Dynamic (azure-cli)? → Execute
    └─ None → Skip auth
    ↓
[Generate Authorization header]
    ├─ bearer → "Authorization: Bearer ..."
    ├─ basic → "Authorization: Basic ..."
    └─ custom → Provider-specific
    ↓
[Return header dict or None]
```

---

## Security: Credential Redaction Status

**Current State**: 🔴 NOT AUDITED

- **Tokens in logs**: Not logged today (grep verified: zero `redact|REDACTED|scrub` in src/)
- **Token handling safe**: Via `entry.token`, `entry.token_env`, `os.environ.get()` — never printed
- **Azure CLI exceptions**: Caught broadly; token never appears in traceback
- **Risk**: Future `debug=True` logging could leak Authorization headers via `urllib.error.HTTPError` repr

**Mitigation (Recommended)**:
- Add `_redact_headers(headers: dict) -> dict` utility in `_console.py`
- Call on any HTTPError exception before logging
- Format: replace value after "Authorization: " with `<redacted>`
- Cost: Low (5–10 LOC)
- Timeline: TBD / not blocking
