# Preset Management System

> Unit: **preset**  
> **Generated**: 2026-05-16  
> **Confidence**: Extracted from code analysis, flowcharts, domain model

## Overview

The **preset module** is a composable template system that allows users to install, manage, and layer collections of versioned artifact templates, command templates, and script templates. Presets enable multi-layer template override via four composition strategies (replace, prepend, append, wrap) and support discovery via remote catalogs. This unit handles manifest validation, lifecycle management (install/remove/update/enable/disable), template composition, catalog fetching with cache, and template resolution via a 4-level priority stack.

## Responsibilities

- **Manifest Validation** — Load and validate `preset.yml` YAML files against schema v1.0; enforce ID format, version semantics, and template constraints
- **Preset Lifecycle** — Install presets from remote URLs or local sources; remove/update/enable/disable with rollback on failure
- **Template Composition** — Combine multiple template layers (override → preset → extension → core) using composition strategies (replace, prepend, append, wrap)
- **Catalog Discovery** — Fetch preset metadata from remote catalogs (official + community), cache results (1h TTL), merge prioritized sources
- **Template Resolution** — Resolve template names via 4-level priority stack; expose both file paths and content
- **Command Registration** — Register command templates from presets with agent directories; reconcile final composition after registration
- **Registry Persistence** — Load/save preset metadata to `.specify/presets/.registry` (JSON) with versioning and priority ordering

## Regras de Negócio

- **Preset IDs** follow regex `^[a-z0-9-]+$` (lowercase, alphanumeric, hyphens only) 🟢
- **Manifest schema** locked at version `1.0` (no forward compatibility) 🟢
- **Presets use PEP 440 semantic versioning** (e.g., `1.2.3`, `2.0.0a1`) 🟢
- **Dependencies** specified via PEP 440 specifiers (e.g., `">=0.8.0,<2.0.0"`) 🟢
- **Compatibility check required** before install — speckit version must match preset's `requires.speckit_version` 🟢
- **Priority ordering** — lower numeric priority = higher precedence (1 > 10) 🟢
- **Scripts only support replace/wrap** — prepend/append invalid for executable code 🟢
- **Templates must have ≥1 provider** — empty `provides.templates` list rejected 🟢
- **Template resolution** — first match wins via 4-level stack (override > preset > extension > core) 🟢
- **Composition strategies**:
  - `replace`: Override entirely (default)
  - `prepend`: Insert before lower-priority layer
  - `append`: Insert after lower-priority layer
  - `wrap`: Surround with placeholder `{CORE_TEMPLATE}` 🟢
- **Catalog cache TTL** — 1 hour (shorter than extensions' 24h for responsive updates) 🟢
- **Multi-catalog merge** — first preset ID wins; catalogs merged by priority order 🟡
- **Security** — HTTPS required for catalog URLs (localhost HTTP allowed) 🟢
- **Installation rollback** — cleanup on any error; unregister commands, delete preset dir 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Load and validate preset manifest (preset.yml) | Must | Parser accepts valid YAML, rejects invalid schema with `PresetValidationError` |
| RF-02 | Check Specify version compatibility before install | Must | Install blocked if current version ∉ preset's `requires.speckit_version` specifier |
| RF-03 | Copy preset files from remote URL or local source | Must | Remote: HTTPS download → ZIP extraction; Local: copytree with .presetignore support |
| RF-04 | Compose templates using non-replace strategies | Should | For each preset template with strategy ∈ {prepend, append, wrap}: resolve layers, compose, write to `.composed/` |
| RF-05 | Register command templates with agent directories | Must | Extract command templates from manifest, filter by extension availability, register via `CommandRegistrar` |
| RF-06 | Reconcile final command composition after registration | Must | Re-resolve all command templates, apply final composition, overwrite agent command files |
| RF-07 | Persist preset metadata to registry | Must | `PresetRegistry.add()` writes to `.specify/presets/.registry` with version, priority, `installed_at` timestamp |
| RF-08 | Enable/disable presets without uninstall | Should | Toggle `enabled` flag in registry; disabled presets skip template resolution |
| RF-09 | Remove preset with rollback support | Must | Unregister commands, delete preset dir, remove from registry; preserve `.specify/` config unless `keep_config=false` |
| RF-10 | Update preset in place | Should | Check compatibility, replace files, re-register commands, update metadata |
| RF-11 | List installed presets with metadata | Should | Return all presets in registry sorted by priority; expose version, enabled status, install time |
| RF-12 | Fetch preset catalogs from remote sources | Must | Support multiple catalog URLs (official + community), validate HTTPS, parse JSON schema |
| RF-13 | Cache catalog fetch results with 1h TTL | Must | Store to `.specify/presets/.cache/catalog.json` + metadata; check TTL before fetching |
| RF-14 | Merge multiple catalogs by priority | Must | First catalog's preset ID wins; later catalogs skipped if duplicate; annotate with `_catalog_name` |
| RF-15 | Resolve template via 4-level priority stack | Must | Check in order: override → preset → extension → core; return first match or None |
| RF-16 | Resolve template content (not just path) | Should | Read file content via `resolve_content()`; support all 4 levels |
| RF-17 | Collect all layers for template composition | Should | `collect_all_layers()` returns list of {path, source, strategy} for all levels |
| RF-18 | Substitute {CORE_TEMPLATE} placeholder in wrap strategy | Must | Replace placeholder with core template body via fallback: override → extension manifest → core |
| RF-19 | Support skip-presets resolution mode | Should | `resolve_core()` skips presets, returns path via: extension → core only |
| RF-20 | Support skip-extensions resolution mode | Could | Skips extension level; used in niche scenarios |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Catalog fetch with cache avoids network on cache hit | `PresetCatalog._fetch_single_catalog()` with `is_cache_valid()` check | 🟢 |
| Performance | Template resolution is O(n) where n = depth of priority stack (max 4 levels) | `PresetResolver.resolve()` iterates 4 levels, stops at first match | 🟢 |
| Escalabilidade | Registry merge handles multiple catalogs without blocking | `PresetCatalog.fetch_catalog()` loops through active catalogs sequentially | 🟡 |
| Segurança | HTTPS required for catalog URLs | `_validate_catalog_url()` blocks non-HTTPS (except localhost) | 🟢 |
| Segurança | Manifest schema validation prevents injection | `PresetManifest._validate()` enforces strict ID regex, path whitelisting | 🟢 |
| Confiabilidade | Installation rollback on failure | Error handlers at each step (lines 540–1798) cleanup preset dir, unregister commands | 🟢 |
| Confiabilidade | Resilient catalog fetch with fallback | If catalog fails, continues to next; all-fail triggers error only after all attempts | 🟡 |
| Manutenibilidade | Registry and cache stored as JSON | Portable, human-readable, no external dependencies | 🟢 |
| Usabilidade | Clear error messages on validation failures | Exception types: `PresetError`, `PresetValidationError`, `PresetCompatibilityError` | 🟡 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Scenario: Install valid preset from remote catalog
  Dado o usuário tem acesso à internet e um preset válido está no catálogo
  Quando o usuário executa `specify preset install <preset-id>`
  Então o preset é baixado, validado, copiado para `.specify/presets/<id>/`
  E as templates são registradas nos agentes
  E os metadados são persistidos no registry
  E o prompt retorna "✅ Installed <preset-id>@<version>"

Scenario: Block install on version mismatch
  Dado o preset requer speckit >=1.5.0
  E o speckit instalado é 1.2.0
  Quando o usuário executa `specify preset install <preset-id>`
  Então a instalação é bloqueada
  E um `PresetCompatibilityError` é exibido

Scenario: Resolve template via priority stack
  Dado overrides, 3 presets instalados, 2 extensões instaladas, e templates core
  E o usuário chama `resolve(template_name)`
  Então a busca segue: override → preset (por prioridade) → extension → core
  E o primeiro match é retornado

Scenario: Compose template with wrap strategy
  Dado um preset com template strategy="wrap" e placeholder {CORE_TEMPLATE}
  Quando `collect_all_layers()` retorna as camadas
  E o core template é resolvido
  Então o placeholder é substituído pelo conteúdo do core
  E o resultado final é escrito em `.composed/<name>`

Scenario: Cache catalog for 1 hour
  Dado uma busca inicial de catálogo foi feita às 14:00
  Quando o usuário tenta buscar novamente às 14:30
  Então o resultado é servido do cache (sem fetch de rede)
  E nenhuma requisição HTTP é feita

Scenario: Merge multiple catalogs by priority
  Dado 2 catalogs com presets sobrepostos (id "my-preset" em ambos)
  Quando catalogs são mergeados
  Então "my-preset" do catálogo de prioridade mais alta (lower number) vence
  E "my-preset" do catálogo secundário é ignorado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Manifest validation | Must | Caminho crítico; bloqueia todas as operações de install |
| Compatibility check | Must | Segurança; evita instalar presets incompatíveis |
| Copy preset files | Must | Caminho crítico; sem cópia, preset não é persistido |
| Register commands | Must | Caminho crítico; sem registro, templates não são resolvidas |
| Persist to registry | Must | Caminho crítico; sem persistência, preset "desaparece" na próxima sessão |
| Fetch catalogs | Must | Caminho crítico; users descobrem presets via catalogs |
| Cache with TTL | Should | Melhora performance; mas fallback sem cache ainda funciona |
| Compose non-replace | Should | Importante para poder estratégico; mas replace-only é suficiente para MVP |
| Enable/disable | Should | Nice-to-have; users pode desinstalar e reinstalar |
| Update preset | Should | Nice-to-have; users pode desinstalar/reinstalar |
| List presets | Should | Debugging; mas not critical path |
| Resolve template | Must | Caminho crítico; sem resolução, templates não são encontradas |
| Skip-presets mode | Could | Raro; somente em cenários niche onde core-only é necessário |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Classe / Função | Cobertura |
|---------|-----------------|-----------|
| `src/specify_cli/presets.py` | `PresetManifest` (linhas 117–308) | RF-01, RF-02 |
| `src/specify_cli/presets.py` | `PresetRegistry` (linhas 309–539) | RF-07 |
| `src/specify_cli/presets.py` | `PresetManager` (linhas 540–1798) | RF-02, RF-03, RF-04, RF-05, RF-06, RF-08, RF-09, RF-10, RF-11 |
| `src/specify_cli/presets.py` | `PresetCatalog` (linhas 1799–2328) | RF-12, RF-13, RF-14 |
| `src/specify_cli/presets.py` | `PresetResolver` (linhas 2329–3097) | RF-15, RF-16, RF-17, RF-18, RF-19, RF-20 |
| `src/specify_cli/presets.py` | `_substitute_core_template()` | RF-18 |
| `src/specify_cli/presets.py` | Exception types: `PresetError`, `PresetValidationError`, `PresetCompatibilityError` | Error handling |
