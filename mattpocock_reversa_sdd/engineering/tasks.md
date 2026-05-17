# Tasks: Engineering Skills Bucket

> Identificador: `001-engineering-skills`
> Data: `2026-05-15`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## Legenda

- **Origem**: arquivo do legado de onde o comportamento foi extraído
- **Pronto quando**: critério verificável de conclusão
- **Confiança**: 🟢 extraído diretamente do código | 🟡 inferido | 🔴 requer validação

---

## T-01 — Implementar `setup-matt-pocock-skills`

**Origem**: `skills/engineering/setup-matt-pocock-skills/SKILL.md`
**Pronto quando**:
- [ ] Invocation seeds `triage-labels.md` with correct label strings for selected tracker
- [ ] Invocation seeds empty `CONTEXT.md` if absent
- [ ] Invocation creates `docs/adr/` directory structure if absent
- [ ] Re-invocation skips all three if files already exist (idempotency)
- [ ] User is informed of each file created or skipped

**Confiança**: 🟢

---

## T-02 — Implementar `triage` — state machine

**Origem**: `skills/engineering/triage/SKILL.md`
**Pronto quando**:
- [ ] Reads `triage-labels.md`; halts with setup pointer if missing
- [ ] Fetches current issue labels and detects current state role
- [ ] Detects conflicting state roles; halts and asks maintainer before acting
- [ ] Performs concept-similarity scan against `.out-of-scope/*.md` before grilling
- [ ] Grills one question at a time; explores codebase before asking
- [ ] Executes correct side effects per transition:
  - [ ] `needs-info`: posts Triage Notes comment (AI-generated header)
  - [ ] `ready-for-agent`: posts Agent Brief comment (behavioral, no file paths/line numbers)
  - [ ] `wontfix` + enhancement: writes `.out-of-scope/<concept>.md`
  - [ ] `wontfix` + bug: polite explanation only (no .out-of-scope entry)
- [ ] Enforces exactly 1 state role + exactly 1 category role after each action

**Confiança**: 🟢

---

## T-03 — Implementar `to-prd`

**Origem**: `skills/engineering/to-prd/SKILL.md`
**Pronto quando**:
- [ ] Reads `triage-labels.md`; halts with setup pointer if missing
- [ ] Accepts freeform requirements text or existing document as input
- [ ] Grills user for missing details one question at a time (no cap)
- [ ] Produces PRD with: title, user stories (role/want/so-that), acceptance criteria
- [ ] PRD is usable as input to `to-issues` without further transformation

**Confiança**: 🟢

---

## T-04 — Implementar `to-issues`

**Origem**: `skills/engineering/to-issues/SKILL.md`
**Pronto quando**:
- [ ] Reads `triage-labels.md`; halts with setup pointer if missing
- [ ] Decomposes PRD into vertical slices (not horizontal layers)
- [ ] Identifies tracer bullet (thinnest end-to-end path) as first issue
- [ ] Types each slice: AFK (automatable) or HITL (requires human)
- [ ] Orders remaining slices by layer: schema → api → ui → test
- [ ] Creates issues in the configured tracker (GitHub / GitLab / local-markdown)
- [ ] Tracer bullet issue is created before all others

**Confiança**: 🟢

---

## T-05 — Implementar `grill-with-docs`

**Origem**: `skills/engineering/grill-with-docs/SKILL.md`, `skills/engineering/grill-with-docs/LANGUAGE.md`
**Pronto quando**:
- [ ] Reads CONTEXT.md, ADRs, and relevant docs before first question
- [ ] If a question is answerable by codebase exploration: explores, does not ask
- [ ] Asks exactly one question per turn; never batches
- [ ] No maximum question cap; continues until output spec is complete
- [ ] Extracts domain vocabulary and entity models as natural output of grilling
- [ ] Output usable as input to `to-prd`

**Confiança**: 🟢

---

## T-06 — Implementar `tdd`

**Origem**: `skills/engineering/tdd/SKILL.md`, `skills/engineering/tdd/deep-modules.md`, `skills/engineering/tdd/vertical-slice.md`, `skills/engineering/tdd/tracer-bullet.md`, `skills/engineering/tdd/anti-patterns.md`
**Pronto quando**:
- [ ] Follows red-green-refactor loop; exactly 1 failing test before implementation
- [ ] Never suggests writing multiple tests before implementation (no horizontal slices)
- [ ] Tracer bullet is the first slice implemented (proves end-to-end path)
- [ ] Tests target public interfaces only — never private methods or internal state
- [ ] Refactoring only occurs while tests are GREEN; halts refactor suggestion while RED
- [ ] Supports all layer types: schema, business logic, API, UI

**Confiança**: 🟢

---

## T-07 — Implementar `diagnose`

**Origem**: `skills/engineering/diagnose/SKILL.md`
**Pronto quando**:
- [ ] Executes all 6 phases in order: clarify → reproduce → hypothesize → test → confirm → fix
- [ ] Does not suggest a fix before Phase 5 (confirm) is complete
- [ ] If soft deps present (CONTEXT.md, ADRs): uses vocabulary for sharper hypothesis
- [ ] If soft deps absent: degrades gracefully; still completes all 6 phases

**Confiança**: 🟢

---

## T-08 — Implementar `prototype`

**Origem**: `skills/engineering/prototype/SKILL.md`, `skills/engineering/prototype/SKILL-logic.md`, `skills/engineering/prototype/SKILL-ui.md`
**Pronto quando**:
- [ ] Routes correctly: logic question → LOGIC BRANCH; UI question → UI BRANCH
- [ ] Ambiguous question resolved via surrounding code context or by asking user
- [ ] LOGIC BRANCH: builds logic module + TUI shell; TUI shell deleted after answer captured; logic module may be promoted
- [ ] UI BRANCH: builds 2-3 variants; gates switcher with `NODE_ENV !== 'production'`; winner promoted; losers deleted
- [ ] Delete-or-absorb lifecycle enforced: no prototype artifact left in production

**Confiança**: 🟢

---

## T-09 — Implementar `improve-codebase-architecture`

**Origem**: `skills/engineering/improve-codebase-architecture/SKILL.md`, `skills/engineering/improve-codebase-architecture/LANGUAGE.md`
**Pronto quando**:
- [ ] Identifies seams in the codebase area under review
- [ ] Assesses each component: deep (small interface, large impl) or shallow (large interface, thin impl)
- [ ] Proposes refactor toward deeper module / cleaner seam
- [ ] Uses canonical vocabulary: "seam" (not "boundary"), "deep module", "shallow module"
- [ ] Iterates: re-reads updated code after each refactor

**Confiança**: 🟢

---

## T-10 — Implementar `zoom-out`

**Origem**: `skills/engineering/zoom-out/SKILL.md`
**Pronto quando**:
- [ ] Skill is registered with `disable-model-invocation: true` in SKILL.md frontmatter
- [ ] Content of SKILL.md IS the instruction (no AI reasoning at load time)
- [ ] Prompts developer to step back from implementation detail
- [ ] Soft dependency only: references domain glossary if present, but works without it

**Confiança**: 🟢

---

## T-11 — Registrar todos os skills no plugin registry

**Origem**: `CLAUDE.md`, `.claude-plugin/plugin.json`, `link-skills.sh`
**Pronto quando**:
- [ ] All 10 engineering skills appear in `.claude-plugin/plugin.json`
- [ ] All 10 engineering skills appear in top-level `README.md` with links to their `SKILL.md`
- [ ] All 10 engineering skills appear in `skills/engineering/README.md` with one-line descriptions
- [ ] `link-skills.sh` includes all 10 engineering skills and excludes deprecated skills

**Confiança**: 🟢

---

## T-12 — Verificar limites de SKILL.md (100 linhas)

**Origem**: `CLAUDE.md`, `_reversa_sdd/domain.md#skill-authoring-rules`
**Pronto quando**:
- [ ] Each SKILL.md is ≤ 100 lines; content beyond that is in supporting files
- [ ] Supporting files are linked from SKILL.md
- [ ] `description` field is ≤ 1024 characters and includes "Use when [specific trigger]"

**Confiança**: 🟢

---

## T-13 — Validar separação `<what-to-do>` / `<supporting-info>` (complexos)

**Origem**: `_reversa_sdd/adrs/0015-what-to-do-supporting-info-xml-sections.md`
**Pronto quando**:
- [ ] `grill-with-docs`, `tdd`, `triage` (complex skills) use `<what-to-do>` and `<supporting-info>` XML sections
- [ ] Imperative instructions are inside `<what-to-do>` only
- [ ] Background context and examples are inside `<supporting-info>` only

**Confiança**: 🟡 (pattern confirmed but threshold for "complex enough" is undefined)

---

## Tarefas com lacuna (requerem validação humana)

| Task | Gap | Action needed |
|------|-----|---------------|
| T-02 (triage) | Concept-similarity algorithm not precisely defined | Maintainer to define threshold or document examples |
| T-05 (grill-with-docs) | No graduation criteria for in-progress → engineering | Maintainer to define promotion criteria |
| T-11 (registry) | No CI check enforces registry consistency | Add automated check to CI or pre-commit hook |
| T-13 (xml sections) | No threshold for "complex" skill requiring XML split | Maintainer to document criteria (e.g., > 60 lines before split) |
