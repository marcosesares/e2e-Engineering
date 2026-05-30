# Data Dictionary — Specify CLI

**Generated**: 2026-05-17  
**Module**: preset (Preset Management System)  
**Scope**: Manifest format, registry schema, configuration files, template composition

---

## 1. Preset Manifest (`preset.yml`)

**Type**: YAML  
**Location**: `<project>/.specify/presets/{preset_id}/preset.yml`  
**Validation**: Strict — required fields, version checking, template constraints

### Top-Level Schema

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `schema_version` | string | ✅ | Exact match: `"1.0"` | Manifest format version |
| `preset` | object | ✅ | See sub-table | Preset metadata |
| `requires` | object | ✅ | Contains `speckit_version` | Dependency specification |
| `provides` | object | ✅ | Contains `templates` array | What the preset provides |
| `metadata` | object | ❌ | N/A | Additional preset metadata (tags, keywords) |

### `preset` Object

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-----------|---------|
| `id` | string | ✅ | Lowercase, alphanumeric + hyphens: `^[a-z0-9-]+$` | `"python-templates"` |
| `name` | string | ✅ | Human-readable | `"Python Project Templates"` |
| `version` | string | ✅ | Semantic version (PEP 440) | `"2.1.0"` |
| `description` | string | ✅ | Human-readable | `"Spec templates for Python projects"` |
| `author` | string | ❌ | N/A | `"John Doe"` |
| `repository` | string | ❌ | Valid URL (optional) | `"https://github.com/user/presets"` |
| `license` | string | ❌ | N/A | `"MIT"` |

### `requires` Object

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| `speckit_version` | string | ✅ | PEP 440 specifier set | `">=0.8.0,<2.0.0"` |
| `python_version` | string | ❌ | PEP 440 specifier set | `">=3.11"` |
| `presets` | list of strings | ❌ | Preset IDs | `["base-templates", "ui-templates"]` |

### `provides.templates` Array

Each template object:

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `name` | string | ✅ | Template identifier | `"example-spec"`, `"speckit.specify"` |
| `type` | string | ✅ | Enum: `"template"`, `"command"`, `"script"` | What kind of template |
| `file` | string | ✅ | Relative path to file | Path within preset dir |
| `strategy` | string | ❌ | Default: `"replace"` | `"replace"`, `"prepend"`, `"append"`, `"wrap"` |
| `description` | string | ❌ | Human-readable | Brief description |

**Strategy Constraints**:
- **template/command**: all 4 strategies allowed (replace, prepend, append, wrap)
- **script**: only replace and wrap (prepend/append don't make sense for executable code)

**Example**:
```yaml
provides:
  templates:
    - name: "example-spec"
      type: "template"
      file: "templates/example-spec.md"
      strategy: "replace"
      description: "Example specification template"
    - name: "speckit.specify"
      type: "command"
      file: "commands/specify-wrap.md"
      strategy: "wrap"
      description: "Wraps core specify command"
    - name: "deploy"
      type: "script"
      file: "scripts/deploy.sh"
      strategy: "replace"
      description: "Deployment script"
```

---

## 2. Preset Registry (`.registry`)

**Type**: JSON  
**Location**: `<project>/.specify/presets/.registry`  
**Purpose**: Persist installed preset metadata

### Schema

```json
{
  "schema_version": "1.0",
  "presets": {
    "preset-id": {
      "version": "2.1.0",
      "priority": 10,
      "installed_at": "2026-05-16T12:00:00Z",
      "source": "catalog",
      "source_url": "https://...",
      "enabled": true,
      "hash": "sha256_hash_of_manifest"
    }
  }
}
```

### `presets[preset_id]` Object Fields

| Field | Type | Nullable | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `version` | string | No | Semantic version | Installed version |
| `priority` | integer | Yes | Positive integer ≥ 1 | Sort order (lower = higher priority) |
| `installed_at` | string | No | ISO 8601 timestamp | When preset was installed |
| `source` | string | Yes | `"catalog"`, `"local"`, `"upload"` | Where it came from |
| `source_url` | string | Yes | Valid HTTPS URL or localhost | Catalog/source URL |
| `enabled` | boolean | No | Default: true | Whether preset is active |
| `hash` | string | Yes | SHA-256 hex | Manifest fingerprint |

### Resilience

- **Corrupted JSON**: Returns fresh template with empty presets
- **Missing/non-dict entry**: Treated as not installed
- **Non-numeric priority**: Normalized to default (10) via `normalize_priority()`

---

## 3. Template Resolution Stack

**Purpose**: 4-level hierarchy for resolving template names to files

### Precedence (High to Low)

| Level | Location | Purpose | Scope |
|-------|----------|---------|-------|
| 1 | `.specify/templates/overrides/` | Project-local overrides | All template names |
| 2 | `.specify/presets/{preset_id}/` | Installed presets (by priority) | All template names |
| 3 | `.specify/extensions/{ext_id}/templates/` | Extension-provided templates | All template names |
| 4 | `.specify/templates/` | Core templates (bundled) | All template names |

**Resolution Algorithm** (in `PresetResolver.resolve()`):
1. For each level (1 to 4):
   - Check for exact file match (name → {name}.md, name-with-dashes → name_with_dashes.md)
   - For presets (level 2): respect priority order (lower priority value = higher precedence)
   - First match wins
2. If no match found: return None

**Template Name Patterns**:
- **Core commands**: `speckit.specify`, `speckit.git.feature` → resolved to `specify.md`, `git_feature.md`
- **Extension commands**: `speckit.auth.check` → from extension manifest
- **Artifact templates**: `example-spec`, `data-model`, `api-docs`
- **Script templates**: `deploy`, `test-setup`, `validate`

---

## 4. Template Composition Strategies

**Purpose**: Define how multiple layers of templates combine

| Strategy | Behavior | Use Case | Supported Types |
|----------|----------|----------|-----------------|
| `replace` | Override lower-priority entirely (default) | Custom template versions | all |
| `prepend` | Insert before lower-priority content | Add preamble/header | template, command |
| `append` | Insert after lower-priority content | Add footer/suffix | template, command |
| `wrap` | Wrap lower-priority with placeholder `{CORE_TEMPLATE}` | Extend core command | all |

**Example - Wrap Strategy**:
```
Core command (speckit.specify):
---
## Spec Development
Run: `specify create`

Preset command (with wrap strategy):
---
## Enhanced Spec Development
> Enhanced with custom rules!

{CORE_TEMPLATE}

> Check our guide: ...
```

**Result After Composition**:
```
## Enhanced Spec Development
> Enhanced with custom rules!

## Spec Development
Run: `specify create`

> Check our guide: ...
```

---

## 5. Preset Catalog Configuration (`.specify/preset-catalogs.yml`)

**Type**: YAML  
**Location**: `<project>/.specify/preset-catalogs.yml`  
**Purpose**: Define active preset catalogs and settings

### Schema

```yaml
catalogs:
  - url: "https://raw.githubusercontent.com/github/spec-kit/main/presets/catalog.json"
    name: "Official Presets"
    priority: 1
    install_allowed: true
    description: "Official Spec Kit presets"
  - url: "https://community.example.com/presets/catalog.json"
    name: "Community Presets"
    priority: 2
    install_allowed: true
```

### `catalogs[]` Object Fields

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `url` | string | ✅ | Valid HTTPS URL or http://localhost | Remote catalog URL |
| `name` | string | ✅ | Human-readable, unique | Catalog display name |
| `priority` | integer | ✅ | Positive integer | Lower = higher priority |
| `install_allowed` | boolean | ✅ | Default: true | Whether to allow installs |
| `description` | string | ❌ | Human-readable | Catalog description |

---

## 6. Remote Preset Catalog Format

**Type**: JSON  
**Location**: Remote HTTP(S) URL  
**Fetched**: Via `PresetCatalog.fetch_catalog()`  
**Cached**: `.specify/presets/.cache/catalog.json` (1-hour TTL)

### Schema

```json
{
  "schema_version": "1.0",
  "presets": {
    "preset-id": {
      "name": "Preset Name",
      "version": "2.1.0",
      "description": "Description",
      "author": "Author Name",
      "author_url": "https://...",
      "repository": "https://github.com/...",
      "download_url": "https://example.com/preset.zip",
      "tags": ["tag1", "tag2"],
      "requirements": {
        "speckit_version": ">=0.8.0,<2.0.0"
      }
    }
  }
}
```

### Preset Catalog Entry Fields

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-----------|---------|
| `name` | string | ✅ | Human-readable | Display name |
| `version` | string | ✅ | Semantic version | Latest available |
| `description` | string | ✅ | Human-readable | What it provides |
| `author` | string | ❌ | N/A | Preset author name |
| `author_url` | string | ❌ | Valid URL | Author contact/website |
| `repository` | string | ❌ | Valid URL | Source code repository |
| `download_url` | string | ✅ | HTTPS or http://localhost | ZIP file location |
| `tags` | array | ❌ | List of strings | Search/filter tags |
| `requirements` | object | ❌ | `speckit_version`, etc. | Dependency specs |

---

## 7. Validation & Error Handling

### Validation Rules Summary

| Item | Rule | Raises |
|------|------|--------|
| Schema version | Must be exactly `"1.0"` | PresetValidationError |
| Preset ID | Lowercase alphanumeric + hyphens | PresetValidationError |
| Preset version | Valid semantic version (PEP 440) | PresetValidationError |
| Template type | One of {template, command, script} | PresetValidationError |
| Template strategy | Valid for type; scripts: only replace/wrap | PresetValidationError |
| ≥1 template | Must provide at least one template | PresetValidationError |
| speckit_version compatibility | Current version in specifier range | PresetCompatibilityError |
| Download URL | Must use HTTPS (localhost HTTP allowed) | PresetValidationError |
| Composition base | Non-replace strategy requires lower-priority layer | PresetValidationError |

### Exception Types

```
PresetError (base)
├─ PresetValidationError — manifest/data validation failed
└─ PresetCompatibilityError — version mismatch or incompatible
```

---

## 8. Algorithm: Template Composition

**Input**: Template name, preferred strategy, current preset priority

**Process**:
1. **Collect all layers** via `collect_all_layers(name)`:
   - Scan all 4 resolution levels
   - Return list of {path, source, strategy}
   - Ordered from highest (level 1) to lowest (level 4) priority

2. **Determine effective strategy**:
   - If any higher-priority layer uses "replace": use that, stop here
   - Otherwise: continue to step 3

3. **Compose if non-replace**:
   - If strategy is "prepend": `[higher] + [lower]`
   - If strategy is "append": `[lower] + [higher]`
   - If strategy is "wrap": `[higher].replace("{CORE_TEMPLATE}", [lower])`

4. **Return final content**: composed or single layer

---

## 9. Constants & Enums

### VALID_PRESET_TEMPLATE_TYPES (frozenset)

```python
{"template", "command", "script"}
```

### VALID_PRESET_STRATEGIES (frozenset)

```python
{"replace", "prepend", "append", "wrap"}
```

### VALID_SCRIPT_STRATEGIES (frozenset)

```python
{"replace", "wrap"}  # Subset for scripts (no prepend/append)
```

---

## 10. Comparison: Extension vs. Preset Manifests

| Aspect | Extension | Preset |
|--------|-----------|--------|
| **Purpose** | Commands + hooks | Templates + composition |
| **Provides** | Commands list, hooks dict | Templates list |
| **Key feature** | Command namespacing | Template composition strategies |
| **Installation** | Copy + register hooks | Copy + compose templates |
| **Conflict resolution** | Reject on command shadow | Allow via strategies |
| **Registry field** | `enabled`, `priority` | `enabled`, `priority`, `hash` |

---

## Summary

| Item | Count | Notes |
|------|-------|-------|
| Top-level manifest fields | 5 | required: 3, optional: 2 |
| Template fields | 5 | required: 3, optional: 2 |
| Registry entry fields | 8 | Mixed nullable |
| Resolution levels | 4 | Overrides → Presets → Extensions → Core |
| Composition strategies | 4 | replace, prepend, append, wrap |
| Validation rules | 10+ | Template constraints, version checking |

Presets extend the extension system by adding **composability**: multiple presets can layer templates using merge strategies, enabling non-destructive customization of Spec-Driven Development workflows.
