# ADR-001: Git Subtree for Skill Distribution

- **Status:** Active
- **Date:** ~2026-04 (PR 14285)
- **Confidence:** 🟢 CONFIRMADO (evidenced by `publish-claude-skills.yml`, `REPO_SETUP.md`, `sync-shared-skills.ps1`)

## Contexto

BeckTech QA engineers work across multiple repos (`BeckTech.QA.Estimator`, `BeckTech.QA.CostLibrary`, etc.). The team needed a way to distribute a shared set of Claude Code skills without duplicating them in each repo.

## Decisão

Use `git subtree split` to project `claude-skills/` into a dedicated `published-skills` branch. Consuming repos add `BeckTech.QA.Tools` as a git remote (`shared-skills`) and pull via `git subtree pull --prefix=.claude`. Publishing rebuilds and force-pushes `published-skills` on every master merge touching `claude-skills/` via `publish-claude-skills.yml`.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **npm private package** | Would require TypeScript/JSON skill format — not Markdown. Adding a package manager just for text file distribution is excessive overhead. | 🟡 |
| **Copy-paste / manual sync** | No traceability, drift-prone, doesn't scale across N repos. | 🟡 |
| **Git submodule** | Submodules require explicit init in each consumer clone; bad developer experience. History coupling is tighter than desired. | 🟡 |
| **Shared GitHub org template** | Templates are one-time copies; no ongoing update mechanism. | 🟡 |
| **Symlinks** | Cross-platform path issues; breaks on Windows; not committed to git. | 🟡 |

## Consequências

**Positivas:**
- Single source of truth for all shared skills.
- Consumer repos get update notifications automatically (SessionStart hook).
- Published-skills branch history is disposable — each publish is a clean rebuild.
- Path-guard hook (`guard-shared-skills.ps1`) protects synced files on consumer side.

**Negativas / Trade-offs:**
- Force-pushing `published-skills` destroys branch history — any consumer that has cached a commit SHA from it may see unexpected behavior.
- `git subtree` is not a standard git workflow; onboarding docs (`REPO_SETUP.md`) required.
- Partial writes possible if `sync-shared-skills.ps1` is interrupted mid-sync (`.sync-record` becomes stale).
- ADO path filter `claude-skills/*` uses single-level glob — works in practice because ADO matches descendants, but this is an undocumented behavior (see CI/CD module inference).
