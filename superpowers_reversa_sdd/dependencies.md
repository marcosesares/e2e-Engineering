# Superpowers — Dependencies Analysis

**Generated**: 2026-05-17  
**Analysis Depth**: Surface-level (zero external runtime dependencies)

---

## 1. Runtime Dependencies

### Zero External Dependencies
✓ **Superpowers is intentionally dependency-free.**

The framework operates purely through:
- Agent instructions (Markdown)
- Plugin manifests (JSON)
- Harness integrations (native APIs)

**No npm packages, pip packages, Maven artifacts, or external libraries required.**

---

## 2. Development & Build Dependencies

### package.json Configuration

```json
{
  "name": "superpowers",
  "version": "5.1.0",
  "type": "module",
  "main": ".opencode/plugins/superpowers.js"
}
```

| Field | Value | Notes |
|-------|-------|-------|
| **name** | superpowers | Official package identifier |
| **version** | 5.1.0 | Semantic versioning (MAJOR.MINOR.PATCH) |
| **type** | module | ES6 modules (import/export syntax) |
| **main** | .opencode/plugins/superpowers.js | Primary entry point for OpenCode harness |

### No devDependencies Listed
- No test runners (Jest, Vitest, Mocha)
- No linters (ESLint)
- No build tools (Webpack, TypeScript compiler)
- No formatters (Prettier)

**Implication**: Skills are pure text definitions; no compilation required.

---

## 3. Harness Requirements (External to Superpowers)

To use Superpowers, install into one or more supported harnesses:

### Claude Code
- **Requirement**: Claude Code installed
- **Method**: Official plugin marketplace (`/plugin install superpowers@claude-plugins-official`)
- **URL**: https://claude.com/plugins/superpowers
- **Version Constraint**: Latest compatible

### Codex CLI
- **Requirement**: OpenAI Codex CLI
- **Method**: Plugin search interface (`/plugins`)
- **Version Constraint**: Latest compatible

### Cursor IDE
- **Requirement**: Cursor editor installed
- **Method**: Cursor plugin interface
- **Version Constraint**: Latest compatible

### OpenCode
- **Requirement**: OpenCode framework
- **Method**: CLI marketplace (`/plugin install superpowers`)
- **Version Constraint**: Latest compatible

### Gemini CLI
- **Requirement**: Google Gemini CLI
- **Extension**: `gemini-extension.json`
- **Version Constraint**: Latest compatible

### Factory Droid
- **Requirement**: Droid agent runner
- **Registry**: Marketplace registration required
- **Version Constraint**: Latest compatible

### GitHub Copilot CLI
- **Requirement**: GitHub Copilot CLI installed
- **Version Constraint**: Latest compatible

---

## 4. Implicit Dependencies (Harness-Managed)

Each harness provides:

| Harness | Core Engine | State Management | Hook System | Config API |
|---------|-------------|------------------|-------------|-----------|
| Claude Code | Claude API (Anthropic) | Session-based | Built-in | .claude/settings.json |
| Codex CLI | OpenAI Codex | File-based | External | .codex/config |
| Cursor | Cursor AI | IDE-managed | Built-in | Cursor settings |
| OpenCode | Custom engine | File-based | Plugin system | .opencode/config |
| Gemini CLI | Google Gemini | File-based | Built-in | .gemini/config |

**Superpowers depends on**: Harness hook systems for auto-triggering skills at the right moments.

---

## 5. Skill Content Dependencies

### Internal Cross-References
Skills reference each other via manual invocation:
- `brainstorming` → leads to `writing-plans`
- `writing-plans` → leads to `subagent-driven-development`
- `subagent-driven-development` → may use `caveman-*` utilities
- Error states → may trigger `systematic-debugging`
- Code submission → triggers `requesting-code-review`
- Feedback received → handled by `receiving-code-review`

**No circular dependencies detected.**

---

## 6. Plugin Manifest Versions

Tracked in `.version-bump.json` for sync:

| File | Version Field | Sync Frequency |
|------|----------------|-----------------|
| package.json | "version" | On release |
| .claude-plugin/plugin.json | "version" | On release |
| .cursor-plugin/plugin.json | "version" | On release |
| .codex-plugin/plugin.json | "version" | On release |
| .claude-plugin/marketplace.json | "plugins.0.version" | On release |
| gemini-extension.json | "version" | On release |

**Current Version**: 5.1.0 (all in sync)

---

## 7. Version Management Strategy

### Semantic Versioning
- **Major (5)** — Breaking changes to agent API, skill structure, or harness compatibility
- **Minor (1)** — New skills, new harness support, new features (backward-compatible)
- **Patch (0)** — Bug fixes, documentation, non-breaking improvements

### Release Process
1. Update `package.json` version
2. Run version bump script → propagates to 6 plugin manifests
3. Create release notes in `RELEASE-NOTES.md`
4. Tag Git commit
5. Publish to official marketplaces

---

## 8. Known Compatibility

### Tested Harness Versions (from README)
- Claude Code → Latest (install from official marketplace)
- Codex → Latest (install from OpenAI marketplace)
- Cursor → Latest (built-in plugin search)
- OpenCode → Latest (marketplace)
- Gemini → Latest (extension)
- Factory Droid → Latest (marketplace)
- GitHub Copilot CLI → Latest (built-in)

**No version pinning needed** — Skills are stable across harness versions.

---

## 9. Dependency Tree Summary

```
superpowers (v5.1.0)
│
├── ✓ Zero external runtime dependencies
│
├── Harness Requirements (one or more):
│   ├── Claude Code (latest)
│   ├── Codex CLI (latest)
│   ├── Cursor (latest)
│   ├── OpenCode (latest)
│   ├── Gemini CLI (latest)
│   ├── Factory Droid (latest)
│   └── GitHub Copilot CLI (latest)
│
├── Plugin Manifests (synced via version-bump):
│   ├── .claude-plugin/plugin.json (v5.1.0)
│   ├── .codex-plugin/plugin.json (v5.1.0)
│   ├── .cursor-plugin/plugin.json (v5.1.0)
│   ├── .opencode/config (v5.1.0)
│   └── gemini-extension.json (v5.1.0)
│
└── No build/dev dependencies (skills are text)
```

---

## 10. Security Profile

### No Supply Chain Risk
- Zero external dependencies → no dependency injection attacks
- All code in-repository → no transitive vulnerabilities
- Plugin signatures managed by harnesses → no tampering risk

### Update Strategy
- Skills updated by maintainer (@obra)
- Pulled from official marketplace channels
- No auto-update mechanism (user-triggered via `/plugin update`)

---

## End of Dependency Analysis

**Key Finding**: Superpowers is a **zero-dependency framework** by design. This significantly reduces:
- Security attack surface
- Version conflict management
- Build complexity
- Runtime footprint

Installation only requires choosing one or more compatible harnesses.
