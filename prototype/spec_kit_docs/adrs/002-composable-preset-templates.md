# ADR-002: Composable Preset Templates with Priority Stack

**Status**: Accepted  
**Decided**: 2026-Q1 (estimated from code structure; presets fully functional in v0.8.x)  
**Confidence**: 🟡 INFERIRED (no explicit commit message; inferred from implementation)

---

## Context

Specify CLI provides templates (Markdown specs, scripts, command definitions) to users. These templates are consumed by agents to generate code, specs, and artifacts.

**Problem**:
- Templates should be customizable per project (user overrides)
- Teams may want to share templates across projects (presets from catalog)
- Extensions may provide domain-specific templates (e.g., Python-specific preset, game-narrative preset)
- Core templates should always be available as a fallback

**Constraints**:
- Must support layering (multiple sources providing same template)
- Must define precedence (which template wins if multiple sources provide it?)
- Must support composition strategies (replace entirely, prepend, append, wrap)
- Performance: template lookup happens on every agent request

---

## Decision

**Implement a 4-level priority stack for template resolution with composition strategies**:

### Priority Levels (1 = highest precedence)

1. **Project Overrides** — `.specify/templates/overrides/{template_name}.{ext}`
2. **Installed Presets** — `.specify/presets/` (sorted by priority; lower number = higher precedence)
3. **Extensions** — `.specify/extensions/{ext_id}/templates/` (sorted by priority)
4. **Core Templates** — `.specify/templates/` (built-in, always available)

### Resolution Algorithm

```
resolve(template_name, template_type, skip_presets=False):
  for level in [OVERRIDES, (PRESETS if !skip_presets), EXTENSIONS, CORE]:
    if level == PRESETS and skip_presets: continue
    for source in level.sorted_by_priority():
      path = source / template_name
      if exists(path):
        return path
  return None
```

### Composition Strategies

For non-replace strategies, collect all layers and compose:

| Strategy | Behavior | Applies To |
|----------|----------|-----------|
| **replace** | Use top-level template only (default) | templates, commands, scripts |
| **prepend** | Insert top-level content before lower-level content | templates, commands (not scripts) |
| **append** | Insert top-level content after lower-level content | templates, commands (not scripts) |
| **wrap** | Wrap lower-level content; top-level must contain `{CORE_TEMPLATE}` placeholder | templates, commands, scripts |

### Key Implementation

**PresetResolver** (in `src/specify_cli/presets.py`):
- `resolve(template_name, template_type, skip_presets=False)` — Returns first matching path
- `collect_all_layers(template_name, template_type)` — Collects all matching paths for composition
- `resolve_content(template_name, template_type)` — Resolves and reads content

**PresetManager** (in `src/specify_cli/presets.py`):
- On install, validates composition strategies per template type (scripts reject prepend/append)
- On composition, pre-writes composed templates to `.composed/` directory
- On registry reconciliation, finalizes all template compositions

**Priority Field** (in `PresetRegistry`):
- Each preset/extension has numeric `priority` field
- Lower number = higher precedence (priority 1 before priority 10)
- Normalized at load time (invalid values → default)

---

## Rationale

### Why 4 Levels?

**Progressive override authority**:
1. Project overrides = developer's local customization (highest authority)
2. Presets = team-shared templates (good default customizations)
3. Extensions = domain-specific templates (specialized, optional)
4. Core = always available (fallback, never breaks)

**Benefits**:
- Developer can override anything without forking presets
- Teams can share presets without modifying core
- Extensions don't interfere with core commands
- Core is always available (no single point of failure)

### Why Priority Numbers?

**Deterministic** within each level (no ambiguity if two presets both provide same template)  
**Sortable** (lower = higher, following common convention from CSS cascade)  
**Flexible** (teams can inject presets at different priority levels)

### Why Composition Strategies?

**Flexibility**:
- `replace` is simple (most common case)
- `prepend`/`append` allow layering without full override (e.g., preset extends core spec with extra sections)
- `wrap` allows instrumentation (e.g., extend core command with logging, validation)

**Constraint on Scripts**:
- Scripts are executable code; prepending/appending doesn't make semantic sense
- Wrapping is OK (shell wrapper around script)

### Why `{CORE_TEMPLATE}` Placeholder?

**Explicit composition**:
- Wrap strategy requires placeholder to know where to insert wrapped content
- Clear, readable syntax in template files
- Fail-fast if placeholder missing (can't auto-guess insertion point)

---

## Consequences

### Positive

✅ **Flexibility**: Users can customize templates without forking presets  
✅ **Reusability**: Presets shareable across projects and teams  
✅ **Deterministic**: Priority stack is predictable (first match wins)  
✅ **Extensible**: Composition strategies enable advanced use cases  
✅ **Testable**: Each level can be tested independently

### Negative

⚠️ **Complexity**: 4-level lookup is harder to debug than single source  
⚠️ **Performance**: Lookup on every agent request (mitigated by caching manifest files)  
⚠️ **Composition overhead**: Pre-writing composed templates adds latency on install  
⚠️ **Conflict ambiguity**: If two presets at same priority level conflict, error is not clear  
⚠️ **Silent overrides**: Developer may not realize override is masking preset template

---

## Alternatives Considered

### A1: Single Preset Source
- **Pros**: Simple; no composition complexity
- **Cons**: Users must fork/branch presets for local customization
- **Rejected**: Not flexible enough

### A2: Environment Variable Precedence
- **Pros**: Easier to override for CI/CD (no file edit needed)
- **Cons**: Magic behavior; implicit; hard to debug
- **Rejected**: Not explicit enough

### A3: Manifest-Level Include/Inheritance
- **Pros**: More declarative (preset B extends preset A)
- **Cons**: Circular dependency risks; complex dependency resolution
- **Rejected**: Over-engineered

---

## Implementation Checklist

- [x] Design and implement 4-level priority stack
- [x] Implement PresetResolver with priority sorting
- [x] Implement composition pipeline (collect → compose → pre-write)
- [x] Validate composition strategies per template type
- [x] Cache manifest files (avoid re-parsing on every lookup)
- [x] Implement fallback to core templates (core always available)
- [x] Test priority conflicts and edge cases
- [x] Document resolution order in user guide

---

## Related Decisions

- **ADR-001**: Opt-in authentication (used to fetch presets from catalogs)
- **ADR-003** (inferred): Multi-integration support

---

## Open Questions

- [ ] How to debug/visualize which template is being resolved?
- [ ] Should `.composed/` directory be versioned or transient?
- [ ] What happens if composition fails (e.g., wrap strategy but no placeholder)?
- [ ] Can users dynamically reorder presets to change priority?

---

## References

- **Files**:
  - `src/specify_cli/presets.py` (PresetResolver, PresetManager, composition logic)
  - `_reversa_sdd/code-analysis.md` (Section 6: PresetResolver, Section 8: Data Structures)
