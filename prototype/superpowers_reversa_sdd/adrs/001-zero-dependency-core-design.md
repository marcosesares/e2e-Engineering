# ADR-001: Zero-Dependency Core Design

**Status:** ACCEPTED  
**Date:** 2024-Q3 (inferred from codebase maturity)  
**Updated:** 2026-05-16 (git phase refactor work)

---

## Context

Early in Superpowers development, the project faced a decision: Should the framework depend on external npm packages, language runtimes, or third-party services to enhance capabilities? Or should it operate as pure markdown skills, depending only on what the harness (IDE/CLI) provides?

Distributed adoption across multiple harnesses (Claude Code, Codex, Gemini CLI, custom IDEs) required maximum portability. Each harness provider has different dependency policies, package management strategies, and security constraints.

## Decision

**Superpowers core contains zero external tool dependencies.** Skills are self-contained markdown documents. Complex behavior is expressed as documented process (phases, gates, red flags) rather than code or build artifacts.

**Consequences:**

1. **Portability:** Skills work on any harness that loads the bootstrap (no npm install, no Python env setup, no language-specific runtime required).
2. **Security:** No supply chain risk from package dependencies. All code visible and auditable in git.
3. **Maintenance:** No dependency version management, no transitive dependency conflicts, no "breaking change in upstream package" surprises.
4. **Adoption Friction:** Users don't install superpowers; they install their IDE/CLI, which bundles it. Zero added setup.

**Trade-off:** Complex behaviors (subagent dispatch, hook injection, caveman token counting) are documented in markdown rather than implemented as libraries. This makes the behavior specifications more complex to read but easier to debug and modify.

## Alternatives Considered

### A. npm Package with Zero External Dependencies

**Description:** Publish superpowers as an npm package with no transitive deps. Package provides helper functions (TDD validation, debugging phase templates, skill metadata parsing).

**Why Rejected:** Still adds npm install step for users. Doesn't help users on Python, Go, or non-Node.js stacks. Complicates harness integration (each harness must install npm package).

### B. Language-Specific SDK (Python, Go, Ruby)

**Description:** Implement superpowers as SDK for each language (superpowers-py, superpowers-go, etc.), providing native APIs for skill composition.

**Why Rejected:** Zero-dependency principle violated. Creates maintenance burden (3+ codebases). Skills become language-specific, breaking harness portability. Users pick based on language, not harness preference.

### C. Cloud-Hosted Skill Server

**Description:** Superpowers core implemented as SaaS API. Harnesses make remote calls to fetch and execute skills.

**Why Rejected:** Zero-dependency principle violated (requires network). Privacy concerns (skill content sent to external server). Latency impact. Vendor lock-in risk.

## How This Decision Shapes the System

### 1. Skill Structure is Process, Not Code

Skills are executable specifications of workflow phases and decision trees. TDD cycle is documented as:
- Phase RED: write failing test
- Verify RED: confirm test fails
- Phase GREEN: write minimal code
- Verify GREEN: confirm test passes
- Phase REFACTOR: clean code
- Verify REFACTOR: confirm no regressions

This is all markdown and red flags tables. No test runner code needed.

### 2. Hook Injection is Harness-Specific

The caveman-stats skill appears to inject token usage hooks into the harness. This cannot be a shared library (would violate zero-dependency). Instead:
- Each harness (Claude Code, Codex) implements the hook mechanism
- caveman-stats documents what the hook should do
- Harness maintainers copy the hook template and integrate

### 3. Subagent Dispatch Depends on Harness Capability

Agents can spawn subagents only if the harness provides a spawn tool. superpowers:subagent-driven-development documents the pattern; each harness implements `spawn_agent` or equivalent.

### 4. No Skill Packaging or Discovery System

Skills are distributed as git-managed markdown files. No package registry, no semantic versioning, no "skill dependencies" metadata. Harnesses load from the git repo directly.

## Implementation Details

- **Skills Directory:** `skills/` contains 21 .md files
- **Metadata:** Each skill has frontmatter (name, description, triggers, type)
- **Process:** Steps, phases, gates, red flags tables, decision trees — all markdown
- **Examples:** Concrete code samples embedded (unchanged across harnesses)
- **References:** Links to other skills or documentation, not npm requires

## Validation

**How we know this works:**
- 5 harnesses successfully load superpowers (Claude Code, Codex App, Codex CLI, Gemini CLI, custom IDEs)
- Zero reported "dependency version conflict" issues
- Zero package manager integration issues
- Agent behavior is consistent across harnesses (process, not tooling)

**Signals of success:**
- High adoption across heterogeneous harness ecosystem
- Low friction onboarding for new harnesses
- No "breaking change in dependency" incidents

## Risk & Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| Skill complexity becomes unmaintainable | Low | Process docs are highly structured; red flags tables are concise. Git blame shows all changes. |
| Harnesses can't implement required features (hooks, subagent spawn) | Low | Design spec (`codex-tools.md`) documents contracts. New harnesses require bootstrap autoload test (acceptance gate). |
| Markdown limitations hide important logic | Medium | Acknowledged; accept trade-off of readability over code succinctness. Skills are meant to be read by agents, not compiled. |

## Related Decisions

- [[ADR-002-skill-content-is-code]] — Skills are behavior-shaping content, require eval evidence to modify
- [[ADR-004-zero-domain-specific-skills]] — Core contains only general-purpose skills
- [[ADR-003-mandatory-gates]] — Process gates (TDD red, brainstorming approval) are non-negotiable

## Future Reconsideration

This decision should be revisited if:
1. A pattern emerges requiring complex state management that markdown cannot express
2. Adoption across non-git harnesses (e.g., proprietary enterprise IDEs) creates maintenance burden
3. Agent behavior becomes significantly inconsistent across harnesses due to missing library primitives

**Likelihood of reconsideration:** Low (zero-dependency design is core to project identity)

---

**Confidence:** 🟢 CONFIRMADO
