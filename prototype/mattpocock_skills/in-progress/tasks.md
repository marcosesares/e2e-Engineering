# Tasks: In-Progress Skills Bucket

> Identificador: `004-in-progress-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## T-01 — Implementar `review` — two-axis code review

**Origem**: `skills/in-progress/review/SKILL.md`
**Pronto quando**:
- [ ] Accepts one or more file paths as input
- [ ] Evaluates each file on CORRECTNESS axis (does it work? bugs? edge cases? test adequacy?)
- [ ] Evaluates each file on CRAFT axis (readable? well-named? follows patterns? unnecessary complexity?)
- [ ] Parallel processing per file (when runtime supports it)
- [ ] Produces ReviewReport with: per-file findings, critical vs suggested classification, confidence marker
- [ ] Critical findings are explicitly distinguished from suggested findings

**Confiança**: 🟢 (structure) | 🟡 (parallel sub-agent mechanism — engine-dependent)

---

## T-02 — Implementar `writing-beats` — beat-by-beat article development

**Origem**: `skills/in-progress/writing-beats/SKILL.md`
**Pronto quando**:
- [ ] Accepts article file path as input (prompts if not provided)
- [ ] Presents 2-3 starting beat candidates before writing anything
- [ ] User selects a beat candidate
- [ ] Re-reads article from disk before writing (invariant)
- [ ] Writes one beat at a time to the article file
- [ ] After each beat: offers 2-3 next-beat candidates
- [ ] User can request rewrite of a beat; skill returns to offering candidates
- [ ] Session ends at natural narrative end — NOT when candidates are exhausted
- [ ] User edits made between turns to the article file are preserved

**Confiança**: 🟢

---

## T-03 — Implementar `writing-fragments` — fragment accumulator

**Origem**: `skills/in-progress/writing-fragments/SKILL.md`
**Pronto quando**:
- [ ] Captures fragment from the very first user message before asking any question
- [ ] Writes H1 title + first fragment to target file on session start
- [ ] Conducts interview to surface additional fragments
- [ ] Re-reads file from disk before each append (invariant)
- [ ] Appends new fragments separated by `---` horizontal rules
- [ ] Handles editing commands: cut, rewrite, merge (re-reads before editing)
- [ ] Session ends when user signals done — pile does not need to be exhausted
- [ ] User edits to fragment file between turns are preserved

**Confiança**: 🟢

---

## T-04 — Implementar `writing-shape` — article shaping

**Origem**: `skills/in-progress/writing-shape/SKILL.md`
**Pronto quando**:
- [ ] Accepts raw material file path (READ-ONLY) and shaped target file path
- [ ] Never writes to or modifies the raw material file
- [ ] Reads existing shaped target content if file exists
- [ ] Analyses raw material: themes, strongest claims, structural possibilities
- [ ] Proposes next structural move; user approves or redirects
- [ ] Re-reads shaped target from disk before each write (invariant)
- [ ] Writes shaped sections to target file
- [ ] Raw material file is byte-for-byte identical before and after session

**Confiança**: 🟢

---

## T-05 — Definir critérios de graduação para skills in-progress

**Origem**: `_reversa_sdd/domain.md#gaps` (🔴 GAP documentado)
**Pronto quando**:
- [ ] Maintainer has defined a documented graduation threshold for in-progress → active bucket
- [ ] Criteria documented in CLAUDE.md or a dedicated `docs/graduation-criteria.md`
- [ ] Threshold applied retroactively to: review, writing-beats, writing-fragments, writing-shape

**Confiança**: 🔴 (gap — requires maintainer decision)

---

## T-06 — Verificar que in-progress/ skills NÃO aparecem no registry

**Origem**: `CLAUDE.md`
**Pronto quando**:
- [ ] None of the 4 in-progress skills appear in `.claude-plugin/plugin.json`
- [ ] None of the 4 appear in top-level `README.md`
- [ ] All 4 appear in `skills/in-progress/README.md` (bucket-level listing only)

**Confiança**: 🟢

---

## Tarefas com lacuna

| Task | Gap | Action needed |
|------|-----|---------------|
| T-01 | Parallel sub-agent mechanism engine-dependent | Document runtime requirements or fallback to sequential |
| T-05 | Graduation criteria undefined | Maintainer decision required |
