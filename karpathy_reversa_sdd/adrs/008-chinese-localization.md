# ADR-008 — Add Simplified Chinese Localization

> Type: Retroactive · Date: 2026-04-14 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `54a3028` (vtrois white — community contribution)

---

## Context

All project documentation was English-only. A community contributor (vtrois white) submitted translations of all four key documents into Simplified Chinese.

## Decision

Add `*.zh.md` variants of all major documentation files:
- `CLAUDE.zh.md`
- `EXAMPLES.zh.md`
- `README.zh.md`
- `skills/karpathy-guidelines/SKILL.zh.md`

## Rationale

Expanding accessibility to Chinese-speaking developers. The `*.zh.md` naming convention avoids overwriting English originals and allows both versions to coexist.

## Alternatives Considered

- **i18n framework or separate branches per language**: Not chosen — the project has no build system; flat file naming is the simplest approach.
- **Single file with language sections**: Not chosen — would make files unwieldy and harder to maintain.

## Consequences

**Positive:**
- Significantly broadens potential audience
- The `SKILL.zh.md` file enables Chinese-language skill loading for users who configure Claude Code with a Chinese locale

**Negative:**
- No automated sync process between English and Chinese versions — translations will drift as English content evolves
- 🔴 LACUNA: no contributor guidelines for keeping translations up to date
- 🟡 INFERIDO: the `SKILL.zh.md` file may behave differently from `SKILL.md` under Claude Code skill loading — it's unclear whether the runtime selects the locale-appropriate file or always uses `SKILL.md`
