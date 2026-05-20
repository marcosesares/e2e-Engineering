# catalog — Design Técnico

> **Unit**: catalog  
> **Type**: Feature  
> **Language**: English

---

## Interface

### CatalogEntry (Dataclass)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | string | Yes | Remote JSON URL or file path |
| `name` | string | Yes | Human-readable catalog name |
| `priority` | int | Yes | Lower number = higher precedence |
| `install_allowed` | bool | No | Defaults to true |
| `cache_ttl_hours` | int | No | Cache lifetime (type-specific default) |

### CatalogStackBase (Abstract)

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `__init__()` | — | CatalogStackBase | Load config file, init cache |
| `fetch_catalogs()` | — | list[dict] | Merge all catalogs respecting priority |
| `get_item()` | item_id: str | dict or None | Lookup single item across catalogs |
| `can_install_from()` | catalog_url: str | bool | Check install_allowed for source |

### JSON Schema (Catalog)

```json
{
  "version": "1.0",
  "entries": [
    {
      "id": "extension-name",
      "name": "Display Name",
      "description": "...",
      "version": "1.2.3",
      "url": "https://github.com/...",
      "installed": false,
      "updated_at": "2026-05-16T00:00:00Z"
    }
  ]
}
```

---

## Core Workflow

1. **Load Config** (`src/specify_cli/catalogs.py:100–200`)
   - Read YAML (catalogs.yml, preset-catalogs.yml, etc.)
   - Parse CatalogEntry list
   - Validate HTTPS + URL patterns
   - 🟢 CONFIRMADO

2. **Fetch Catalogs** (`catalogs.py:200–350`)
   - For each entry in priority order:
     - Check cache (TTL valid?)
     - If valid: use cached JSON
     - Else: HTTP GET to URL (10s timeout, 3 retries)
     - Save to cache
   - Collect all JSON objects
   - 🟡 INFERIDO

3. **Merge Catalogs** (`catalogs.py:350–450`)
   - Iterate entries by priority (lowest first)
   - Accumulate into result list
   - Remove duplicates (by ID, keep first seen)
   - Return merged list
   - 🟡 INFERIDO

4. **Install Permission Check** (`catalogs.py:450–500`)
   - User selects item from merged catalog
   - Track which source catalog it came from
   - Check source.install_allowed
   - Allow install only if true
   - 🟡 INFERIDO

---

## Cache Strategy

**Location**: `.specify/.cache/catalogs/`

**Naming**: `{catalog_type}_{hash(url)}.json`

**TTL by type**:
- ExtensionCatalog: 24 hours
- PresetCatalog: 1 hour
- WorkflowCatalog: 15 minutes
- IntegrationCatalog: 1 hour

**Cleanup**: Delete expired cache files on load.

---

## Error Handling

- **HTTPS violation**: Reject immediately with clear error
- **URL fetch timeout**: Retry 3 times with exponential backoff (1s, 2s, 4s)
- **Invalid JSON**: Log warning, skip catalog, continue with others
- **Empty catalog**: Treat as valid (0 entries)
- **Network unreachable**: Fall back to stale cache (if available), else error

---

## Diagram: Merge Algorithm

```
[Load Config]
    ↓
[Sort by priority (ascending)]
    ↓
[Iterate entries]
    ├─ Fetch/cache JSON
    ├─ Merge into result
    └─ Skip duplicates (keep first)
    ↓
[Return merged list]
```

---

## YAML Config Format (catalogs.yml)

```yaml
catalogs:
  - url: https://registry.speckit.io/extensions.json
    name: "Official Registry"
    priority: 1
    install_allowed: true
    cache_ttl_hours: 24
  - url: https://community.example.com/extensions.json
    name: "Community Registry"
    priority: 2
    install_allowed: false
    cache_ttl_hours: 24
```
