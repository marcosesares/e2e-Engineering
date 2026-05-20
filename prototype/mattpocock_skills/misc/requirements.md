# Requirements: Misc Skills Bucket

> Identificador: `003-misc-skills`
> Data: `2026-05-15`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## 1. Resumo executivo

The `misc/` bucket contains 4 skills kept in the repository but rarely used in day-to-day workflows. They are NOT published in `plugin.json` and are NOT listed in the top-level `README.md`. Each operates independently: `git-guardrails-claude-code` configures Claude Code safety settings, `migrate-to-shoehorn` converts test code to use the shoehorn API, `scaffold-exercises` generates learning exercise scaffolding, and `setup-pre-commit` installs pre-commit hooks with lint-staged and Prettier.

---

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#misc` | 4 skills; none published; each operates independently | 🟢 |
| `_reversa_sdd/domain.md#publication-and-linking-rules` | misc/ exists in repo but NOT published via plugin.json | 🟢 |
| `_reversa_sdd/domain.md#pre-commit-shoehorn-rules` | shoehorn is test-only; setup-pre-commit idempotent | 🟢 |
| `_reversa_sdd/flowcharts/misc.md` | All 4 misc skill flows documented | 🟢 |

---

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Developer | Configure Claude Code to prevent dangerous git operations | Invokes `git-guardrails-claude-code`; safety settings written |
| Developer | Convert existing test factories to shoehorn API | Invokes `migrate-to-shoehorn`; test files updated |
| Educator / Maintainer | Scaffold exercises for a tutorial repo | Invokes `scaffold-exercises`; exercise structure generated |
| Developer | Add lint-staged + Prettier pre-commit hooks to repo | Invokes `setup-pre-commit`; hooks installed |

---

## 4. Regras de negócio

1. **RN-01:** `misc/` skills must NOT appear in `plugin.json` or top-level `README.md`. 🟢
   - Origem: `CLAUDE.md`, `domain.md#publication-and-linking-rules`

2. **RN-02:** `shoehorn` API usage (`fromPartial`, `fromAny`, `fromExact`) is test code only — never production. 🟢
   - Origem: `domain.md#pre-commit-shoehorn-rules`

3. **RN-03:** `setup-pre-commit` — `.prettierrc` creation is idempotent: only creates if no Prettier config exists. 🟢
   - Origem: `domain.md#pre-commit-shoehorn-rules`

4. **RN-04:** `scaffold-exercises` generates a linting loop: fails lint → error displayed → student fixes → re-lint. 🟢
   - Origem: `flowcharts/misc.md#scaffold-exercises`

---

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | `git-guardrails-claude-code` writes Claude Code safety config preventing dangerous git ops | Must | Config written; dangerous operations blocked by Claude Code | 🟢 |
| RF-02 | `migrate-to-shoehorn` converts test factory calls to `fromPartial` / `fromAny` / `fromExact` | Must | All factory calls replaced; tests still pass after migration | 🟢 |
| RF-03 | `migrate-to-shoehorn` never introduces shoehorn calls in production code | Must | Only test files (*.test.*, *.spec.*) are modified | 🟢 |
| RF-04 | `scaffold-exercises` creates `DESCRIPTION.md`, `solution/`, test file, and lint config per exercise | Must | Exercise structure complete; lint fails on empty student file | 🟢 |
| RF-05 | `scaffold-exercises` lint loop: displays error, waits for student fix, re-runs | Must | Loop continues until lint passes | 🟢 |
| RF-06 | `setup-pre-commit` installs husky and lint-staged | Must | `.husky/` and `lint-staged` config present after install | 🟢 |
| RF-07 | `setup-pre-commit` creates `.prettierrc` only if no existing Prettier config | Must | Existing `.prettierrc`, `prettier.config.js`, etc. are not overwritten | 🟢 |
| RF-08 | `setup-pre-commit` configures lint-staged to run Prettier on staged files | Must | Staged files are formatted on commit | 🟢 |

---

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confidência |
|------|-----------|-----------|-------------|
| Idempotency | `setup-pre-commit`: Prettier config creation skips if any config exists | `domain.md#pre-commit-shoehorn-rules` | 🟢 |
| Safety | `migrate-to-shoehorn`: never modify production code | `domain.md#pre-commit-shoehorn-rules` | 🟢 |
| Correctness | `scaffold-exercises`: lint must fail on empty student file (tests the loop) | `flowcharts/misc.md#scaffold-exercises` | 🟢 |

---

## 7. Critérios de Aceitação

```gherkin
Cenário: setup-pre-commit — idempotency for Prettier config
  Dado a .prettierrc file already exists in the repo
  Quando /setup-pre-commit is invoked
  Então the existing .prettierrc is not overwritten
    E the user is informed that Prettier config was skipped

Cenário: migrate-to-shoehorn — production files untouched
  Dado a codebase with factory calls in both test and production files
  Quando /migrate-to-shoehorn is invoked
  Então only *.test.* and *.spec.* files are modified
    E no production file contains shoehorn API calls after migration

Cenário: scaffold-exercises — lint loop
  Dado an exercise scaffold has been generated
  Quando the student submits an empty or invalid solution
  Então the lint check fails with a descriptive error
    E the student is prompted to fix and resubmit
    E the loop continues until lint passes
```

---

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-07 (Prettier idempotency) | Must | Data loss risk if existing config overwritten |
| RF-03 (shoehorn test-only) | Must | Correctness invariant; production contamination is a bug |
| RF-01 (git-guardrails) | Should | Useful but not widely used; rare invocation |
| RF-05 (scaffold lint loop) | Should | Core learning mechanic for exercises |
| RF-02, RF-04, RF-06, RF-08 | Should | Primary functions of each skill |

---

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda.

---

## 10. Lacunas

- 🔴 [DÚVIDA] `git-guardrails-claude-code` exact config format and which operations are blocked is not documented outside the SKILL.md.

---

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-15 | Versão inicial gerada por reversa-writer | reversa |
