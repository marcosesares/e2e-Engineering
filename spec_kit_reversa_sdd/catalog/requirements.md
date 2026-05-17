# catalog — Shared Catalog Stack Infrastructure

> **Unit**: catalog  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `catalog` module provides shared, reusable primitives for all catalog-backed features (extensions, presets, workflows, integrations). It manages remote catalog discovery, caching, merging, and priority ordering. Multiple catalogs can be stacked with configurable priorities, enabling both official and community registries.

---

## Responsibilities

- Provide CatalogEntry dataclass for catalog metadata
- Implement CatalogStackBase abstract class for orchestrating catalog operations
- Manage HTTPS enforcement and localhost exception for dev
- Load catalog configuration from YAML files
- Handle remote fetching and caching (with TTL per catalog type)
- Merge multiple catalogs respecting priority ordering
- Validate URLs and enforce security constraints

---

## Business Rules

- **HTTPS enforcement** — All remote catalog URLs must be HTTPS, except localhost:* for dev. 🟢
- **Priority ordering** — Lower numeric priority wins; multiple catalogs merged with strict ordering. 🟢
- **Caching** — Different TTLs: Extensions (24h), Presets (1h), Workflows (15m), Integrations (1h). 🟡
- **Install permission** — Each catalog entry has `install_allowed` flag; installation only from allowed catalogs. 🟡
- **Config reloading** — Catalog config files (YAML) reloaded on each operation (no in-memory cache). 🟡

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | System loads catalogs from YAML config file | Must | `catalogs.yml` parsed; each entry has url, name, priority, install_allowed |
| RF-02 | System enforces HTTPS for remote catalogs | Must | Non-HTTPS URL rejected unless localhost:*; error message clear |
| RF-03 | System validates URL patterns (no dangerous globs) | Should | Glob patterns like `*.example.com` allowed; `*` or `*github.com` rejected |
| RF-04 | System fetches remote JSON catalog | Should | HTTP GET with timeout (10s default); retry on transient failure (3 attempts) |
| RF-05 | System caches fetched catalogs with TTL | Should | Cached in `.specify/.cache/catalogs/`; TTL per catalog type (24h, 1h, 15m) |
| RF-06 | System merges multiple catalogs respecting priority | Must | Sort by priority; merge into single list; duplicate removal by ID |
| RF-07 | System respects install_allowed flag | Should | User can only install from catalogs with install_allowed=true |
| RF-08 | System provides ExtensionCatalog subclass | Must | 24h cache TTL; discovers extensions |
| RF-09 | System provides PresetCatalog subclass | Must | 1h cache TTL; discovers presets |
| RF-10 | System provides WorkflowCatalog subclass | Should | 15m cache TTL; discovers workflows |
| RF-11 | System provides IntegrationCatalog subclass | Should | 1h cache TTL; discovers new integrations |
| RF-12 | System supports custom catalog implementations | Could | CatalogStackBase allows subclasses for new catalog types |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Performance | Catalog fetch <2s (remote), <100ms (cached) | HTTP timeout, disk cache | 🟡 |
| Reliability | Graceful fallback if catalog fetch fails | Retry logic, cached fallback | 🟡 |
| Security | HTTPS enforcement, no arbitrary glob patterns | URL validation in code | 🟢 |
| Extensibility | New catalog types via CatalogStackBase subclass | Abstract base pattern | 🟢 |

---

## Acceptance Criteria

```gherkin
Scenario: Load catalog from YAML
  Given catalogs.yml with 2 entries (Official, Community)
  When ExtensionCatalog initialized
  Then both entries loaded
  And sorted by priority
  And merged into single list

Scenario: Fetch remote catalog with caching
  Given remote catalog at https://registry.example.com/extensions.json
  When first fetch
  Then HTTP GET; cache in .specify/.cache/
  When second fetch within TTL
  Then cached version returned (no HTTP)
  When TTL expired
  Then fresh HTTP fetch

Scenario: Reject non-HTTPS URL
  Given catalog config with http://registry.example.com
  When loading
  Then error: "Catalog URL must be HTTPS"
  Unless URL is localhost

Scenario: Enforce install_allowed
  Given catalog with install_allowed=false
  When user tries to install from it
  Then error: "Installation not allowed from this catalog"
```

---

## Scope & Scale

- **Catalog count**: Up to 10 catalogs per type (stackable)
- **Entries per catalog**: 1,000+ (typical: 100–500)
- **Cache size**: <100 MB total
- **Fetch timeout**: 10 seconds (configurable)
- **Retry attempts**: 3 on transient failure
