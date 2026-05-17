# Superpowers — Project Inventory

**Generated**: 2026-05-17  
**Reversa Version**: 1.2.39  
**Scout Analysis**: Complete surface mapping

---

## 1. Project Overview

| Aspect | Details |
|--------|---------|
| **Name** | superpowers |
| **Version** | 5.1.0 |
| **Type** | AI Agent Skills Framework & Plugin System |
| **Description** | Complete software development methodology for coding agents via composable skills and behavior instructions |
| **Primary Purpose** | Enable autonomous AI agent workflows (planning, implementation, code review, testing) across multiple harnesses |

---

## 2. Directory Structure

```
superpowers/
├── skills/                    # Core skill definitions (21 skills)
│   ├── brainstorming/
│   ├── cavecrew/
│   ├── caveman/               # Caveman mode (lite, full, ultra variants)
│   ├── caveman-commit/
│   ├── caveman-compress/
│   ├── caveman-help/
│   ├── caveman-review/
│   ├── caveman-stats/
│   ├── dispatching-parallel-agents/
│   ├── executing-plans/
│   ├── finishing-a-development-branch/
│   ├── receiving-code-review/
│   ├── requesting-code-review/
│   ├── subagent-driven-development/
│   ├── systematic-debugging/
│   ├── test-driven-development/
│   ├── using-git-worktrees/
│   ├── using-superpowers/
│   ├── verification-before-completion/
│   ├── writing-plans/
│   └── writing-skills/
│
├── .claude-plugin/            # Claude Code plugin integration
├── .codex-plugin/             # Codex CLI plugin integration
├── .cursor-plugin/            # Cursor IDE plugin integration
├── .opencode/                 # OpenCode plugin integration
├── hooks/                     # System hooks (lifecycle, behavior)
├── docs/                      # Documentation
├── tests/                     # Test suite
├── scripts/                   # Utility scripts
├── assets/                    # Static assets
│
├── .github/                   # GitHub issue templates
├── .version-bump.json         # Version management config
├── package.json               # Node.js metadata (ES6 module)
├── CLAUDE.md                  # Project contributor guidelines & Reversa framework
├── AGENTS.md                  # Agent documentation
├── README.md                  # Main documentation
├── RELEASE-NOTES.md           # Release history
├── LICENSE                    # MIT License
└── CODE_OF_CONDUCT.md         # Community guidelines
```

---

## 3. Technologies & Frameworks

### Languages
- **Markdown** (293 files) — Primary language for skill definitions, documentation
- **JSON** (31 files) — Configuration, plugin metadata, version specs
- **JavaScript** (5 files) — Plugin entry points, minimal JS implementation
- **YAML/YML** — Configuration files
- **Shell/PowerShell** — Build and utility scripts

### Frameworks & Libraries
- **No external runtime dependencies** — Superpowers is zero-dependency by design
- **Plugin architecture** — Native support for Claude Code, Codex, Cursor, OpenCode, Gemini, GitHub Copilot CLI
- **Markdown-based skills** — Skills are text documents with structured instructions for AI agents

### Package Manager
- **npm** — Node.js package management (package.json, semantic versioning)

### Harness Integrations
- ✓ **Claude Code** (.claude-plugin/) — Anthropic's official CLI
- ✓ **Codex CLI** (.codex-plugin/) — OpenAI Codex interface
- ✓ **Codex App** (.codex-plugin/) — Codex visual interface
- ✓ **Cursor IDE** (.cursor-plugin/) — Cursor AI editor
- ✓ **OpenCode** (.opencode/) — Open-source alternative
- ✓ **Gemini CLI** (gemini-extension.json) — Google Gemini integration
- ✓ **Factory Droid** — Droid agent runner
- ✓ **GitHub Copilot CLI** — GitHub's CLI interface

---

## 4. Entry Points

### Plugin Entry Points (per harness)
- `.claude-plugin/plugin.json` → Claude Code bootstrap
- `.codex-plugin/plugin.json` → Codex bootstrap
- `.cursor-plugin/plugin.json` → Cursor bootstrap
- `.opencode/config.json` → OpenCode bootstrap
- `gemini-extension.json` → Gemini extension manifest
- `package.json.main` → `.opencode/plugins/superpowers.js`

### Skill Entry Points
- `skills/<skill-name>/SKILL.md` — Each skill has a `SKILL.md` as primary definition
- Auto-triggered skills based on context (e.g., `brainstorming` on "Let's make a X" prompts)
- Manual skills invoked via `/skill-name` commands

---

## 5. Configuration Files

- `package.json` — ES6 module metadata, version string
- `.version-bump.json` — Automated version sync across 6 plugin manifests + extensions
- `tsconfig.json` (if present) — TypeScript config
- `.eslintrc*` (if present) — Linting rules
- `.gitignore` — Excluded paths (node_modules, build artifacts)
- `.github/ISSUE_TEMPLATE/` — Issue templates (no workflows found)

---

## 6. CI/CD & Deployment

| Component | Details |
|-----------|---------|
| **Version Management** | Automated sync via `.version-bump.json` across multiple plugin manifests |
| **Publishing** | Official plugin marketplaces (Anthropic, OpenAI, GitHub) |
| **Release Artifacts** | RELEASE-NOTES.md tracks version history |
| **GitHub Integration** | No GitHub Actions workflows; version bumping via external script |

---

## 7. Database & External Integrations

- **No database** — This is a plugin framework, not an application with persistent storage
- **No external service dependencies** — Zero-dependency design
- **Plugin data isolation** — Each harness manages its own state (if any)

---

## 8. Test Coverage

| Component | Status |
|-----------|--------|
| **Test Framework** | `tests/` directory present (format unclear; likely Markdown-based or JSON specs) |
| **Test Files** | Count not specified in inventory |
| **Coverage Approach** | Behavioral testing via skill execution in live harness environments |

---

## 9. Key Files & Artifacts

| File | Purpose | Notes |
|------|---------|-------|
| `CLAUDE.md` | Contributor guidelines & Reversa framework instructions | Non-negotiable PR requirements; 94% historical rejection rate for slop |
| `AGENTS.md` | Multi-harness agent documentation | Lists all supported agent types |
| `README.md` | Main documentation & installation instructions | Per-harness install guides |
| `RELEASE-NOTES.md` | Release history & changelog | Version tracking |
| `CODE_OF_CONDUCT.md` | Community standards | |
| `LICENSE` | MIT open-source license | |
| `.version-bump.json` | Version sync configuration | Maintains parity across 6 plugin manifests |

---

## 10. Statistics

| Metric | Count |
|--------|-------|
| **Total Files** | ~640+ (includes reversa framework) |
| **Markdown Files** | 293 |
| **JSON Files** | 31 |
| **JavaScript Files** | 5 |
| **Skills Defined** | 21 |
| **Supported Harnesses** | 8 |
| **Languages Supported** | Markdown, JSON, JS, YAML, Shell |

---

## 11. Architectural Patterns

### Skill-Driven Workflow
- **Brainstorming** → `brainstorming` skill (auto-trigger on user description)
- **Planning** → `writing-plans` skill (auto-trigger on approval)
- **Implementation** → `subagent-driven-development` skill (parallel agent coordination)
- **Review** → `receiving-code-review` + `requesting-code-review` skills (peer feedback loop)
- **Completion** → `verification-before-completion` + `finishing-a-development-branch` skills (final checks)

### Behavioral Modulation
- **Caveman mode** — Ultra-compressed communication (`caveman`, `caveman-lite`, `caveman-full`, `caveman-ultra`)
- **Caveman utilities** — Code review, commit message, compression helpers
- **Context management** — `cavecrew` for distributed subagent work

### Auxiliary Workflows
- **Debugging** → `systematic-debugging` skill
- **Testing** → `test-driven-development` skill
- **Parallel execution** → `dispatching-parallel-agents` skill
- **Git workflows** → `using-git-worktrees` skill
- **Skill authoring** → `writing-skills` skill

---

## 12. Key Constraints & Decisions

From `CLAUDE.md`:

### PR Requirements (Non-Negotiable)
- Must follow PR template completely
- Search for existing duplicate PRs before submission
- Only accept real, verified problems (not speculative)
- Changes must be general-purpose (not domain-specific or fork-specific)
- Human review of complete diff required before submission
- No third-party dependencies (zero-dependency design)

### Rejection Criteria
- Bulk/spray-and-pray PRs (multiple issues in one session)
- Fabricated problem descriptions
- Unrelated bundled changes
- Domain-specific or project-specific skills (publish separately)
- Skills that don't match Superpowers' tuned behavior philosophy

### Skill Philosophy
- Carefully tuned for real-world agent behavior
- Evidence-based changes (not theoretical compliance)
- High bar for behavior-shaping content modifications
- Language choices are deliberate ("your human partner" ≠ "the user")

---

## 13. Community & Governance

| Aspect | Detail |
|--------|--------|
| **License** | MIT (permissive open-source) |
| **Maintainer** | Jesse Obra (@obra) |
| **Sponsorship** | GitHub Sponsors available |
| **Code of Conduct** | Community guidelines present |
| **Contribution Model** | High-quality gate (94% rejection rate indicates strict filtering) |

---

## End of Inventory

**Next Steps**: Reversa will now:
1. Suggest spec organization granularity
2. Activate Archaeologist for module-level deep-dives
3. Generate architectural diagrams (C4) and specs
4. Produce executable specifications per harness
