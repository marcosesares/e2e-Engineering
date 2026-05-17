# Tasks: Misc Skills Bucket

> Identificador: `003-misc-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## T-01 — Implementar `git-guardrails-claude-code`

**Origem**: `skills/misc/git-guardrails-claude-code/SKILL.md`
**Pronto quando**:
- [ ] Writes Claude Code safety configuration to target repo
- [ ] Guards against: `git push --force`, `git reset --hard`, `git branch -D`, `rm -rf`
- [ ] Configuration is compatible with Claude Code's settings format
- [ ] User is informed of what was written and what is now guarded

**Confiança**: 🟡 (exact config format not fully specified in available artefacts)

---

## T-02 — Implementar `migrate-to-shoehorn`

**Origem**: `skills/misc/migrate-to-shoehorn/SKILL.md`
**Pronto quando**:
- [ ] Scans only test files (`*.test.*`, `*.spec.*`) for factory call patterns
- [ ] Never modifies production files — halts if factory call found in production code
- [ ] Maps each factory call to the correct shoehorn method:
  - [ ] Partial object → `fromPartial`
  - [ ] Unknown type → `fromAny`
  - [ ] Exact shape → `fromExact`
- [ ] Replaces factory calls with shoehorn API calls
- [ ] All modified test files still compile and pass after migration
- [ ] Reports: files modified, calls replaced, production files untouched

**Confiança**: 🟢

---

## T-03 — Implementar `scaffold-exercises`

**Origem**: `skills/misc/scaffold-exercises/SKILL.md`
**Pronto quando**:
- [ ] Creates `<exercise-name>/` directory for each exercise
- [ ] Creates `DESCRIPTION.md` with exercise instructions
- [ ] Creates `solution/` directory with reference solution
- [ ] Creates test file (`*.test.ts` or equivalent)
- [ ] Creates lint config (ESLint or similar)
- [ ] Lint loop: runs lint on empty student file → lint fails → error displayed → student fixes → re-lint

**Confiança**: 🟢

---

## T-04 — Implementar `setup-pre-commit`

**Origem**: `skills/misc/setup-pre-commit/SKILL.md`
**Pronto quando**:
- [ ] Installs husky if not already installed
- [ ] Installs lint-staged if not already installed
- [ ] Detects any existing Prettier config (`.prettierrc`, `prettier.config.js`, `package.json#prettier`, etc.)
- [ ] Creates `.prettierrc` ONLY if no Prettier config exists
- [ ] Configures lint-staged to run Prettier on staged files
- [ ] Configures husky pre-commit hook to run `npx lint-staged`
- [ ] Reports each item: installed / skipped

**Confiança**: 🟢

---

## T-05 — Verificar que misc/ skills NÃO aparecem no registry

**Origem**: `CLAUDE.md`
**Pronto quando**:
- [ ] None of the 4 misc skills appear in `.claude-plugin/plugin.json`
- [ ] None of the 4 misc skills appear in top-level `README.md`
- [ ] All 4 appear in `skills/misc/README.md` (bucket-level listing only)

**Confiança**: 🟢

---

## Tarefas com lacuna

| Task | Gap | Action needed |
|------|-----|---------------|
| T-01 | Exact Claude Code settings format not documented in artefacts | Read `git-guardrails-claude-code/SKILL.md` directly to extract exact config schema |
| T-02 | Factory call patterns not enumerated | Read `migrate-to-shoehorn/SKILL.md` for factory pattern list |
