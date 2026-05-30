# ADR-002: Skills Defined as Markdown (SKILL.md), Not Code

- **Status:** Active
- **Date:** ~2026-04 (PR 14285)
- **Confidence:** 🟢 CONFIRMADO (all skills are Markdown; no DSL or compiled format present)

## Contexto

Claude Code skills need a format that is readable by the LLM, editable by QA engineers who are not software developers, and distributable via plain file system (git subtree).

## Decisão

Skills are defined as `SKILL.md` files in YAML-frontmatter + Markdown prose format. The frontmatter declares metadata (`name`, `description`, `user-invocable`, `allowed-tools`, `skills`). The Markdown body is the instruction set read directly by the Claude model.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **JSON/YAML skill DSL** | Would require a parser/runtime separate from Claude Code. Markdown is natively consumed by the model. | 🟡 |
| **TypeScript/Python skill code** | Executable code skills exist in some LLM frameworks but require a build step and toolchain. QA engineers are not primarily developers. | 🟡 |
| **Prompt templates** | Pure prompt files have no metadata layer. Frontmatter gives Claude Code the registration information it needs. | 🟡 |

## Consequências

**Positivas:**
- QA engineers can read, understand, and modify skill behavior without programming knowledge.
- Skills are distributable as plain files — no build step.
- The model reads instruction prose directly — no schema interpretation layer.
- Composition via `skills:` frontmatter (e.g., `skills: [principles]`) allows loading shared context.

**Negativas / Trade-offs:**
- No type safety or schema validation on skill logic — incorrect instructions go undetected until runtime.
- Skill description must fit within Claude Code's skill listing limit (enforced by PR 14747 "Skill Description Trimming").
- `user-invocable: false` prevents a skill from being called directly but does NOT prevent other skills from invoking it — the semantics were discovered to be different from expected (PR 14285 note: "`disable-model-invocation: true` blocked the Skill tool from invoking them at all, not just auto-firing").
