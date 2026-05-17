# Flowcharts — Preset Module

**Generated**: 2026-05-17  
**Module**: preset (Preset Management System)

---

## 1. Installation Flow

Preset installation orchestration from discovery through persistence.

```mermaid
flowchart TD
    START([User: install preset]) --> INPUT["INPUT: preset_id, source_type<br/>(remote|local)"]
    
    INPUT --> FETCH{Source Type?}
    FETCH -->|remote| FETCH_CAT["1. PresetCatalog<br/>.fetch_catalog()"]
    FETCH -->|local| LOAD_LOCAL["1. Load from<br/>local source"]
    
    FETCH_CAT --> FOR_CAT["For each active catalog<br/>(by priority):"]
    FOR_CAT --> SINGLE["_fetch_single_catalog()<br/>with cache check"]
    SINGLE --> CACHE{"Cache<br/>valid?"}
    CACHE -->|yes| USE_CACHE["Load from cache"]
    CACHE -->|no| NETWORK["Fetch from network"]
    NETWORK --> SAVE_CACHE["Save to cache<br/>(1h TTL)"]
    SAVE_CACHE --> MERGE["Merge into result"]
    MERGE --> NEXT_CAT{More<br/>catalogs?}
    NEXT_CAT -->|yes| FOR_CAT
    NEXT_CAT -->|no| MERGED["Catalog merged<br/>(priority-based)"]
    USE_CACHE --> MERGE
    
    LOAD_LOCAL --> VALIDATE_PATH["Validate source<br/>directory exists"]
    MERGED --> MANIFEST["2. Load manifest<br/>(preset.yml)"]
    VALIDATE_PATH --> MANIFEST
    
    MANIFEST --> LOAD_YAML["PresetManifest<br/>._load_yaml()"]
    LOAD_YAML --> YAML_ERR{"Valid<br/>YAML?"}
    YAML_ERR -->|no| ERR1["❌ PresetValidationError:<br/>Invalid YAML"]
    
    YAML_ERR -->|yes| VALIDATE["_validate()<br/>manifest schema"]
    VALIDATE --> CHK_REQUIRED["Check required<br/>fields"]
    CHK_REQUIRED --> CHK_TEMPLATES["Check ≥1 template"]
    CHK_TEMPLATES --> CHK_STRATEGY["Validate template<br/>strategies"]
    CHK_STRATEGY --> VALID_ERR{Validation<br/>pass?}
    
    VALID_ERR -->|no| ERR1
    VALID_ERR -->|yes| COMPAT["3. Check compatibility"]
    
    COMPAT --> GET_VER["Get speckit version"]
    GET_VER --> CHK_SPEC["Check: current ∈<br/>preset.requires.speckit_version"]
    CHK_SPEC --> COMPAT_ERR{Compatible?}
    
    COMPAT_ERR -->|no| ERR2["❌ PresetCompatibilityError:<br/>Version mismatch"]
    COMPAT_ERR -->|yes| COPY["4. Copy preset"]
    
    COPY --> IF_REMOTE{Remote<br/>source?}
    IF_REMOTE -->|yes| DOWNLOAD["download_preset()<br/>→ ZIP"]
    IF_REMOTE -->|no| FROM_LOCAL["Use local files"]
    
    DOWNLOAD --> URL_CHECK["Validate URL:<br/>HTTPS only<br/>(except localhost)"]
    URL_CHECK --> URL_ERR{Valid?}
    URL_ERR -->|no| ERR3["❌ SecurityError:<br/>Invalid URL"]
    URL_ERR -->|yes| DL_ZIP["Download ZIP<br/>via _open_url()"]
    DL_ZIP --> DL_ERR{Success?}
    DL_ERR -->|no| ERR4["❌ NetworkError"]
    DL_ERR -->|yes| EXTRACT["Extract ZIP<br/>to temp dir"]
    
    EXTRACT --> COPY_DIR["5. shutil.copytree<br/>→ .specify/presets/{preset_id}"]
    FROM_LOCAL --> COPY_DIR
    
    COPY_DIR --> IGNORE["Load .presetignore<br/>(if exists)"]
    IGNORE --> IGNORE_FUNC["Create ignore function"]
    IGNORE_FUNC --> COPYTREE["copytree(src, dst,<br/>ignore=ignore_func)"]
    COPYTREE --> COPY_ERR{Copy<br/>success?}
    COPY_ERR -->|no| ERR5["❌ IOError:<br/>Copy failed"]
    COPY_ERR -->|yes| COMPOSE["6. Compose templates<br/>(non-replace)"]
    
    COMPOSE --> FOR_TMPL["For each template"]
    FOR_TMPL --> CHK_STRAT{"Strategy<br/>!=<br/>replace?"}
    CHK_STRAT -->|no| SKIP_COMP["Skip compose"]
    CHK_STRAT -->|yes| GET_LAYERS["collect_all_layers<br/>(template_name)"]
    GET_LAYERS --> IS_TOP{"This preset<br/>top<br/>layer?"}
    IS_TOP -->|no| SKIP_COMP
    IS_TOP -->|yes| COMPOSE_IT["resolve_content()<br/>compose layers"]
    COMPOSE_IT --> COMP_ERR{Success?}
    COMP_ERR -->|no| ERR6["❌ Validation:<br/>No base layer"]
    COMP_ERR -->|yes| WRITE_COMP["Write to<br/>.composed/{name}"]
    WRITE_COMP --> NEXT_TMPL{More<br/>templates?}
    SKIP_COMP --> NEXT_TMPL
    NEXT_TMPL -->|yes| FOR_TMPL
    NEXT_TMPL -->|no| REGISTER_CMD["7. Register commands<br/>with agents"]
    
    REGISTER_CMD --> EXTRACT_CMD["Extract command<br/>templates"]
    EXTRACT_CMD --> FILTER_EXT["Filter: skip extension<br/>commands if ext<br/>not installed"]
    FILTER_EXT --> REGISTRAR["CommandRegistrar<br/>.register_commands<br/>_for_all_agents()"]
    REGISTRAR --> REG_ERR{Success?}
    REG_ERR -->|no| ERR7["❌ IOError:<br/>Registration failed"]
    REG_ERR -->|yes| RECONCILE["8. Reconcile<br/>all command files"]
    
    RECONCILE --> FOR_CMD_REC["For each command<br/>file in agent dirs"]
    FOR_CMD_REC --> RESOLVE_FINAL["resolve_content()<br/>final composition"]
    RESOLVE_FINAL --> WRITE_FINAL["Overwrite with<br/>correct content"]
    WRITE_FINAL --> NEXT_REC{More?}
    NEXT_REC -->|yes| FOR_CMD_REC
    NEXT_REC -->|no| PERSIST["9. Persist to registry"]
    
    PERSIST --> REGISTRY["PresetRegistry<br/>.add()"]
    REGISTRY --> SAVE_REG["Save to .registry<br/>(JSON)"]
    SAVE_REG --> SUCCESS["✅ Install complete"]
    
    ERR1 --> CLEANUP1["Cleanup:"]
    ERR2 --> CLEANUP1
    ERR3 --> CLEANUP1
    ERR4 --> CLEANUP1
    ERR5 --> CLEANUP1
    ERR6 --> CLEANUP1
    ERR7 --> CLEANUP1
    
    CLEANUP1 --> DEL_DIR["Delete .specify/presets<br/>/{preset_id}"]
    DEL_DIR --> UNREG_CMD["Unregister agent<br/>commands"]
    UNREG_CMD --> FAIL["❌ Installation failed"]
    
    SUCCESS --> END([Done])
    FAIL --> END
```

---

## 2. Manifest Validation Details

Detailed breakdown of validation rules.

```mermaid
flowchart TD
    START([Manifest<br/>._validate()]) --> R1["✓ Required fields:<br/>'schema_version'<br/>'preset'<br/>'requires'<br/>'provides'"]
    
    R1 --> R1_ERR{All<br/>present?}
    R1_ERR -->|no| ERR["❌ Missing<br/>required field"]
    R1_ERR -->|yes| R2["✓ schema_version<br/>== '1.0'"]
    
    R2 --> R2_ERR{Match?}
    R2_ERR -->|no| ERR
    R2_ERR -->|yes| R3["✓ preset.id<br/>matches ^[a-z0-9-]+$"]
    
    R3 --> R3_ERR{Valid?}
    R3_ERR -->|no| ERR
    R3_ERR -->|yes| R4["✓ preset.version<br/>is semantic version"]
    
    R4 --> R4_ERR{Valid?}
    R4_ERR -->|no| ERR
    R4_ERR -->|yes| R5["✓ requires<br/>.speckit_version<br/>present"]
    
    R5 --> R5_ERR{Present?}
    R5_ERR -->|no| ERR
    R5_ERR -->|yes| R6["✓ provides.templates<br/>is non-empty list"]
    
    R6 --> R6_ERR{Valid?}
    R6_ERR -->|no| ERR
    R6_ERR -->|yes| R7["✓ For each template:<br/>name, type, file"]
    
    R7 --> R7_ERR{Valid?}
    R7_ERR -->|no| ERR
    R7_ERR -->|yes| R8["✓ Template type ∈<br/>{template, command<br/>script}"]
    
    R8 --> R8_ERR{Valid?}
    R8_ERR -->|no| ERR
    R8_ERR -->|yes| R9["✓ Template strategy<br/>∈ VALID_STRATEGIES"]
    
    R9 --> R9_ERR{Valid?}
    R9_ERR -->|no| ERR
    R9_ERR -->|yes| R10["✓ Script strategy<br/>∈ {replace, wrap}"]
    
    R10 --> R10_ERR{Valid?}
    R10_ERR -->|no| ERR
    R10_ERR -->|yes| SUCCESS["✅ Validation<br/>passed"]
    
    ERR --> RAISE["raise<br/>PresetValidationError"]
    SUCCESS --> END([Return<br/>manifest])
    RAISE --> END
```

---

## 3. Template Resolution Stack

How templates are resolved via 4-level priority hierarchy.

```mermaid
flowchart TD
    START([PresetResolver<br/>.resolve<br/>template_name]) --> TEMPLATE_NAME["Input: template_name<br/>(e.g., 'example-spec'<br/>or 'speckit.specify')"]
    
    TEMPLATE_NAME --> LEVEL1["Level 1 (Highest):<br/>.specify/templates/overrides/"]
    
    LEVEL1 --> L1_CHECK["Check for file:<br/>{template_name}.md<br/>or variant"]
    L1_CHECK --> L1_FOUND{Found?}
    L1_FOUND -->|yes| L1_RETURN["✅ Return path<br/>(override wins)"]
    L1_FOUND -->|no| LEVEL2["Level 2:<br/>.specify/presets/"]
    
    LEVEL2 --> L2_SORT["Sort installed presets<br/>by priority<br/>(lower = higher)"]
    L2_SORT --> L2_LOOP["For each preset<br/>(in order):"]
    L2_LOOP --> L2_CHECK["Check for file:<br/>{template_name}.md"]
    L2_CHECK --> L2_FOUND{Found?}
    L2_FOUND -->|yes| L2_RETURN["✅ Return path"]
    L2_FOUND -->|no| L2_NEXT{More<br/>presets?}
    L2_NEXT -->|yes| L2_LOOP
    L2_NEXT -->|no| LEVEL3["Level 3:<br/>.specify/extensions/"]
    
    LEVEL3 --> L3_LOOP["For each extension<br/>(by priority):"]
    L3_LOOP --> L3_CHECK["Check: ext.dir<br/>/templates<br/>/{template_name}.md"]
    L3_CHECK --> L3_FOUND{Found?}
    L3_FOUND -->|yes| L3_RETURN["✅ Return path"]
    L3_FOUND -->|no| L3_NEXT{More<br/>extensions?}
    L3_NEXT -->|yes| L3_LOOP
    L3_NEXT -->|no| LEVEL4["Level 4 (Lowest):<br/>.specify/templates/"]
    
    LEVEL4 --> L4_CHECK["Check for file:<br/>{template_name}.md<br/>or variant"]
    L4_CHECK --> L4_FOUND{Found?}
    L4_FOUND -->|yes| L4_RETURN["✅ Return path"]
    L4_FOUND -->|no| NOT_FOUND["❌ Not found"]
    
    L1_RETURN --> END([Return path<br/>or None])
    L2_RETURN --> END
    L3_RETURN --> END
    L4_RETURN --> END
    NOT_FOUND --> END
```

---

## 4. Template Composition Algorithm

How multiple template layers are composed based on strategy.

```mermaid
flowchart TD
    START([resolve_content<br/>template_name]) --> COLLECT["collect_all_layers<br/>(template_name)"]
    
    COLLECT --> LAYERS["layers = [{<br/>path, source,<br/>strategy<br/>}, ...]<br/>(highest to lowest)"]
    
    LAYERS --> INIT["content = layers[0]"]
    
    INIT --> FOR["For each layer<br/>from index 1 to end:"]
    
    FOR --> GET_STRAT["strategy =<br/>layer.strategy"]
    
    GET_STRAT --> STRAT_CHK{Strategy<br/>type?}
    
    STRAT_CHK -->|replace| SKIP["Skip composition<br/>(layer 0 wins)"]
    STRAT_CHK -->|prepend| PREPEND["content =<br/>layer.content +<br/>content"]
    STRAT_CHK -->|append| APPEND["content =<br/>content +<br/>layer.content"]
    STRAT_CHK -->|wrap| WRAP["Check:<br/>'{CORE_TEMPLATE}'<br/>in layer"]
    
    WRAP --> WRAP_CHK{Has<br/>placeholder?}
    WRAP_CHK -->|yes| WRAP_DO["content =<br/>layer.content<br/>.replace<br/>'{CORE_TEMPLATE}'<br/>content"]
    WRAP_CHK -->|no| WRAP_ERR["❌ Error:<br/>No placeholder"]
    
    SKIP --> NEXT{More<br/>layers?}
    PREPEND --> NEXT
    APPEND --> NEXT
    WRAP_DO --> NEXT
    WRAP_ERR --> FINAL_ERR
    
    NEXT -->|yes| FOR
    NEXT -->|no| FINAL["✅ Return<br/>composed content"]
    
    FINAL_ERR["❌ Composition<br/>failed"] --> END([Done])
    FINAL --> END
```

---

## 5. Catalog Fetching with Cache

Multi-catalog merge with intelligent caching.

```mermaid
flowchart TD
    START([PresetCatalog<br/>.fetch_catalog<br/>force_refresh]) --> LOAD_ACTIVE["get_active_catalogs()<br/>from<br/>.specify/preset<br/>-catalogs.yml"]
    
    LOAD_ACTIVE --> INIT["merged = {}<br/>any_success<br/>= false"]
    
    INIT --> SORT["Sort catalogs<br/>by priority"]
    
    SORT --> FOR["For each catalog<br/>(in order):"]
    
    FOR --> CACHE_CHK{"force_refresh<br/>or cache<br/>invalid?"}
    
    CACHE_CHK -->|use cache| LOAD_CACHE["Load from<br/>catalog.json"]
    CACHE_CHK -->|fetch network| VALIDATE_URL["_validate_catalog<br/>_url()"]
    
    VALIDATE_URL --> URL_OK{URL<br/>valid?}
    URL_OK -->|no| WARN["⚠️ Skip catalog<br/>(invalid URL)"]
    URL_OK -->|yes| NETWORK["Fetch from<br/>network<br/>_open_url()"]
    
    NETWORK --> PARSE["Parse JSON"]
    PARSE --> VALIDATE["Validate schema:<br/>schema_version &<br/>presets"]
    VALIDATE --> VALID{Valid?}
    VALID -->|no| WARN
    VALID -->|yes| SAVE_CACHE["Save to cache<br/>catalog-{hash}.json<br/>+ metadata"]
    
    SAVE_CACHE --> USE["catalog_data<br/>= {...}"]
    LOAD_CACHE --> USE
    
    USE --> PROCESS["For each preset<br/>in catalog:"]
    
    PROCESS --> CHECK_EXIST{preset_id<br/>in<br/>merged?}
    
    CHECK_EXIST -->|yes| SKIP["Skip<br/>(first catalog<br/>wins)"]
    CHECK_EXIST -->|no| ADD["merged[preset_id]<br/>= {...preset_data<br/>_catalog_name<br/>_install_allowed<br/>}"]
    
    ADD --> MARK["any_success<br/>= true"]
    SKIP --> MARK
    WARN --> MARK
    
    MARK --> NEXT_CAT{More<br/>catalogs?}
    
    NEXT_CAT -->|yes| FOR
    NEXT_CAT -->|no| CHECK_SUCCESS{"any_success<br/>== true?"}
    
    CHECK_SUCCESS -->|no| FAIL["❌ Error:<br/>All catalogs<br/>failed"]
    CHECK_SUCCESS -->|yes| SUCCESS["✅ Return<br/>merged catalog"]
    
    FAIL --> END([Done])
    SUCCESS --> END
```

---

## 6. Compatibility Check

Preset compatibility validation.

```mermaid
flowchart TD
    START([PresetManager<br/>.check_compatibility<br/>manifest, version]) --> GET_REQ["required =<br/>manifest<br/>.requires<br/>.speckit_version"]
    
    GET_REQ --> GET_CURRENT["current =<br/>Version<br/>(speckit_version)"]
    
    GET_CURRENT --> PARSE_SPEC["SpecifierSet<br/>(required)"]
    
    PARSE_SPEC --> PARSE_ERR{Parse<br/>success?}
    
    PARSE_ERR -->|no| ERR1["❌ PresetCompatibilityError:<br/>Invalid specifier"]
    PARSE_ERR -->|yes| CHECK["current in<br/>specifier?"]
    
    CHECK --> CHK_RESULT{Compatible?}
    
    CHK_RESULT -->|no| ERR2["❌ PresetCompatibilityError:<br/>Version mismatch<br/>Suggest upgrade"]
    CHK_RESULT -->|yes| OK["✅ Compatible"]
    
    ERR1 --> END([Return error])
    ERR2 --> END
    OK --> END2([Return True])
    END2 --> END
```

---

## Summary

| Flow | Purpose | Key Decision Points |
|------|---------|-------------------|
| **Installation** | End-to-end preset setup | Fetch source → Validate → Compose → Register → Persist |
| **Validation** | Enforce manifest schema | Required fields, version, templates, strategies |
| **Resolution** | Find templates via 4-level stack | Override → Preset → Extension → Core |
| **Composition** | Merge multiple template layers | Strategy type → Layer combination |
| **Catalog** | Discover & cache presets | Priority-based merge, cache validity, fallback tolerance |
| **Compatibility** | Check version safety | Specifier validation, version matching |
