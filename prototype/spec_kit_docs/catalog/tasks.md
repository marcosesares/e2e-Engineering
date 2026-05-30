# catalog — Tarefas de Implementação

> **Unit**: catalog  
> **Language**: English

---

## Pré-requisitos

- [ ] HTTP client library available (requests or httpx)
- [ ] YAML parsing library (PyYAML)
- [ ] Cache directory structure created in .specify/.cache/

---

## Phase 1: Core Infrastructure

- [ ] T-01: Implement CatalogEntry dataclass
  - Origin: `src/specify_cli/catalogs.py:1–100`
  - Criteria: Fields for url, name, priority, install_allowed, cache_ttl_hours
  - Confidence: 🟢

- [ ] T-02: Implement CatalogStackBase abstract class
  - Origin: `src/specify_cli/catalogs.py:100–200`
  - Criteria: Abstract methods: fetch_catalogs(), get_item(), can_install_from()
  - Confidence: 🟢

- [ ] T-03: Implement YAML config loading
  - Origin: `src/specify_cli/catalogs.py:200–300`
  - Criteria: Parse YAML; validate HTTPS + URL patterns; return CatalogEntry list
  - Confidence: 🟢

---

## Phase 2: Fetching & Caching

- [ ] T-04: Implement HTTP fetch with retry
  - Origin: `src/specify_cli/catalogs.py:300–400`
  - Criteria: GET to URL, 10s timeout, 3 retries with exponential backoff
  - Confidence: 🟡

- [ ] T-05: Implement cache storage & TTL
  - Origin: `src/specify_cli/catalogs.py:400–500`
  - Criteria: Save JSON to `.specify/.cache/catalogs/`; check TTL before fetch; delete expired
  - Confidence: 🟡

- [ ] T-06: Implement catalog merge algorithm
  - Origin: `src/specify_cli/catalogs.py:500–600`
  - Criteria: Sort by priority; merge lists; remove duplicates (by ID, keep first)
  - Confidence: 🟡

---

## Phase 3: Subclasses

- [ ] T-07: Implement ExtensionCatalog
  - Origin: `src/specify_cli/catalogs.py:600–700`
  - Criteria: Subclass CatalogStackBase; TTL=24h; discover extensions
  - Confidence: 🟡

- [ ] T-08: Implement PresetCatalog
  - Origin: `src/specify_cli/catalogs.py:700–800`
  - Criteria: Subclass CatalogStackBase; TTL=1h; discover presets
  - Confidence: 🟡

- [ ] T-09: Implement WorkflowCatalog
  - Origin: `src/specify_cli/catalogs.py:800–850`
  - Criteria: Subclass CatalogStackBase; TTL=15m; discover workflows
  - Confidence: 🟡

- [ ] T-10: Implement IntegrationCatalog
  - Origin: `src/specify_cli/catalogs.py:850–900`
  - Criteria: Subclass CatalogStackBase; TTL=1h; discover integrations
  - Confidence: 🟡

---

## Phase 4: Permission Enforcement

- [ ] T-11: Implement install permission check
  - Origin: `src/specify_cli/catalogs.py:900–950`
  - Criteria: `can_install_from(url)` checks install_allowed; returns bool
  - Confidence: 🟡

- [ ] T-12: Integrate permission check into install flows
  - Origin: `src/specify_cli/presets.py:install()`, `extensions.py:install()`
  - Criteria: Before install, call catalog.can_install_from(source_url)
  - Confidence: 🟡
