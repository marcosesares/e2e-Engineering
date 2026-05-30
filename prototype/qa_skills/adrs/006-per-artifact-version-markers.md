# ADR-006: Independent Version Markers Per Generated Artifact

- **Status:** Active
- **Date:** ~2026-04 (PR 14305)
- **Confidence:** 🟢 CONFIRMADO (`refresh-setup/SKILL.md:39-58`, `setup-claude-hooks/SKILL.md:84-104`)

## Contexto

Several setup skills generate files in consumer repos (`CLAUDE.md`, `.claude/settings.json`, `.claude/skills/repo-context/SKILL.md`, `~/.claude/settings.json`). These files need to be versionable independently so `refresh-setup` can detect drift and offer selective refreshes.

## Decisão

Each generated artifact has its own version marker with a distinct syntax:

| Artifact | Marker Syntax | Location |
|----------|---------------|----------|
| `CLAUDE.md` | `<!-- qa-version: claude-md=N -->` | HTML comment in file body |
| `repo-context/SKILL.md` | `qa-version: N` | YAML frontmatter field |
| `.claude/settings.json` | `_qaHookVersion: N` | Top-level JSON key |
| `~/.claude/settings.json` | `_qaNotificationsVersion: N` | Top-level JSON key |

`refresh-setup` reads each marker and classifies it: `current`, `stale`, `missing`, or `ahead` (anomaly).

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Single global version for all artifacts** | Forces refreshes of unchanged artifacts when only one changes. Coarser than needed. | 🟡 |
| **Git hash as version** | Ties artifact version to source repo history — consumers would need git access to verify. An integer is simpler. | 🟡 |
| **No versioning (always overwrite)** | Would destroy consumer customizations on every `/refresh-setup`. Unacceptable. | 🟢 |
| **File hash comparison** | Requires the template to be available locally for comparison. Integer marker is self-contained and readable by humans. | 🟡 |

## Consequências

**Positivas:**
- Selective refresh — engineer can refresh only the artifact that drifted.
- Human-readable marker embedded in the file makes it self-describing.
- Each setup skill owns its own version counter independently.

**Negativas / Trade-offs:**
- Different marker syntaxes per artifact (HTML comment, frontmatter, JSON key) — inconsistent, but chosen to fit naturally into each file format.
- `_qaNotificationsVersion` drift is not audited by `refresh-setup` automatically (known gap).
- "Ahead" classification (consumer version > source version) is treated as an anomaly — unclear recovery path.
