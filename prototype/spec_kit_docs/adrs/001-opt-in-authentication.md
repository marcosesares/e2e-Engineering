# ADR-001: Config-Driven Opt-In Authentication Registry

**Status**: Accepted  
**Decided**: 2026-Q1 (estimated from commit f099834)  
**Confidence**: 🟢 CONFIRMED (commit message: "Config-driven opt-in authentication registry with multi-platform support")

---

## Context

Specify CLI needs to fetch presets, extensions, and resources from remote sources (GitHub, Azure DevOps, private registries, etc.). These sources may require authentication (PATs, credentials, service principals).

**Problem**:
- How to securely manage credentials without hardcoding?
- How to support multiple authentication providers and schemes?
- How to avoid accidental credential leakage?
- How to support multi-platform environments (GitHub, Azure, generic HTTP)?

**Constraints**:
- CLI runs locally on developer machines
- Credentials must never leak in logs, environment variables printed to console, or default requests
- Must support different auth schemes (bearer tokens, basic auth, Azure AD, azure-cli)

---

## Decision

**Adopt a config-driven, opt-in authentication model**:

1. **No automatic authentication** — Requests are unauthenticated by default
2. **Explicit configuration** — Users create `~/.specify/auth.json` mapping hosts to providers
3. **Provider abstraction** — Pluggable `AuthProvider` ABC with concrete implementations (GitHub, Azure DevOps, HTTP, Azure AD, Azure CLI)
4. **Host-pattern matching** — Safe hostname matching (`example.com`, `*.example.com` only; rejects `*example.com`)
5. **Multi-source token resolution** — Token from literal value, environment variable, or dynamic acquisition (e.g., azure-cli)
6. **Validating loader** — Strict schema validation and permission warnings (POSIX `chmod 600`)

### Components

**Implementation** (Commit f099834):
- `authentication/config.py` — Loader for `auth.json`; validates schema, host patterns, file permissions
- `authentication/base.py` — `AuthProvider` ABC; subclasses: `github.py`, `azure_devops.py`, `http.py`, `config.py`
- HTTP request layer uses auth infrastructure to inject headers before requests

**File Structure**:
```
~/.specify/auth.json
{
  "providers": [
    {
      "hosts": ["github.com", "*.github.enterprise.com"],
      "provider": "github",
      "auth": "bearer",
      "token": null,
      "token_env": "GITHUB_TOKEN"
    },
    ...
  ]
}
```

---

## Rationale

### Why Opt-In?

**Opt-in is more secure than opt-out**:
- Opt-out (send auth by default) risks leaking credentials if user misconfigures or forgets to disable
- Opt-in (require explicit config) means credentials only leave the machine if user explicitly wants it
- Default unauthenticated access works for public resources (GitHub.com, public presets)

### Why Config-Driven?

**Explicit over implicit**:
- Avoids magic detection (looking for GitHub env vars, Azure CLI, etc. by default)
- Centralizes credential configuration in one place
- User controls when/how credentials are used

### Why Host-Pattern Matching?

**Security**:
- Prevents hostname spoofing attacks (e.g., `*github.com` matches `github.com.evil.com`)
- Validates patterns at config load time, not per-request
- Only safe patterns allowed: exact hostname or `*.suffix` wildcard

### Why Pluggable Providers?

**Extensibility**:
- Different hosts need different auth schemes (GitHub PAT vs Azure DevOps vs generic HTTP)
- Future providers can be added without modifying loader logic
- Each provider encapsulates its auth scheme (bearer, basic, OAuth2, etc.)

### Why Multiple Token Sources?

**Flexibility**:
- Literal `token` field for simple cases (less secure, discouraged)
- `token_env` for environment variables (recommended; allows secret management via CI/CD, `direnv`, etc.)
- Dynamic acquisition (e.g., `azure-cli` can fetch token at request time)

---

## Consequences

### Positive

✅ **Security**: Credentials don't leak unless explicitly configured  
✅ **Transparency**: Users see exactly which hosts get credentials  
✅ **Flexibility**: Supports multiple providers and token sources  
✅ **Simplicity**: Config file is human-readable YAML/JSON  
✅ **Auditability**: Auth config is in one place (can be audited, rotated, etc.)

### Negative

⚠️ **User friction**: Users must create `auth.json` for authenticated resources (vs. auto-detecting env vars)  
⚠️ **File management**: `~/.specify/auth.json` contains secrets (must be protected; warnings on POSIX systems)  
⚠️ **No token expiry validation**: Cached tokens may be stale; no check before use  
⚠️ **Limited to local dev**: Workflow agent integrations may need different auth mechanisms (not covered here)

---

## Alternatives Considered

### A1: Auto-Detect Environment Variables
- **Pros**: Zero config; works out-of-the-box
- **Cons**: Risky (credentials leak if env is printed; magic detection is error-prone)
- **Rejected**: Violates opt-in principle

### A2: Interactive Login Prompt
- **Pros**: User-friendly; no config file needed
- **Cons**: Doesn't work in CI/CD; slow (prompt on every request if cached)
- **Rejected**: Not suitable for automation

### A3: System Keyring Integration
- **Pros**: Secure storage (credentials in OS keyring)
- **Cons**: Complex (platform-specific); dependency on external tools; breaks in remote/containerized environments
- **Rejected**: Over-engineered for current use case

---

## Implementation Checklist

- [x] Define `AuthConfigEntry` dataclass
- [x] Implement `load_auth_config()` with schema validation
- [x] Add host pattern validator (`_is_valid_host_pattern()`)
- [x] Implement `AuthProvider` ABC
- [x] Add GitHub provider (bearer token support)
- [x] Add Azure DevOps provider (bearer + service principal support)
- [x] Add HTTP Basic provider
- [x] Integrate into HTTP request layer (catalog fetch, preset download)
- [x] Add POSIX permission warning (chmod 600)
- [x] Test manifest validation and edge cases

---

## Related Decisions

- **ADR-002** (inferred): Template composition strategy (presets can override core templates)
- **ADR-003** (inferred): Multi-integration support (agents have pluggable provider model)

---

## Validation Questions

- [ ] How are credentials rotated? (Cache invalidation, TTL management)
- [ ] How are failed auth attempts handled? (Retry logic, fallback to public access)
- [ ] How are credentials logged? (Should never appear in debug output)
- [ ] How do workflow agents acquire credentials? (Different from CLI? Separate config?)

---

## References

- **Commit**: f099834 (Config-driven opt-in authentication registry with multi-platform support)
- **Files**:
  - `src/specify_cli/authentication/config.py`
  - `src/specify_cli/authentication/base.py`
  - `src/specify_cli/authentication/github.py`
  - `src/specify_cli/authentication/azure_devops.py`
  - `src/specify_cli/authentication/http.py`
