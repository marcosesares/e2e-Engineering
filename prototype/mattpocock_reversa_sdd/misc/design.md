# Design: Misc Skills Bucket

> Identificador: `003-misc-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO

---

## 1. Componentes

| Component | Responsibility | Idempotent? |
|-----------|---------------|-------------|
| `git-guardrails-claude-code` | Write Claude Code settings preventing dangerous git ops | 🟡 (not explicitly documented) |
| `migrate-to-shoehorn` | Convert test factory calls to shoehorn API | No (one-time migration) |
| `scaffold-exercises` | Generate exercise folder structure with lint loop | Yes per exercise (new folder each time) |
| `setup-pre-commit` | Install husky + lint-staged; create Prettier config | Yes (skips existing config) |

---

## 2. Fluxo de controle — `git-guardrails-claude-code`

```
/git-guardrails-claude-code invoked
  │
  ├─ READ: existing Claude Code settings (if any)
  ├─ WRITE: safety configuration
  │   └─ guard rules for: force push, reset --hard, branch -D, rm -rf
  └─ CONFIRM: config written; dangerous operations now blocked
```

---

## 3. Fluxo de controle — `migrate-to-shoehorn`

```
/migrate-to-shoehorn invoked
  │
  ├─ SCAN: codebase for factory call patterns
  │   └─ only in: *.test.ts, *.spec.ts, *.test.js, *.spec.js
  │   └─ NEVER in: production files
  │
  ├─ FOR EACH factory call found in test files:
  │   ├─ DETERMINE: appropriate shoehorn method
  │   │   ├─ Partial object → fromPartial
  │   │   ├─ Unknown type → fromAny
  │   │   └─ Exact shape → fromExact
  │   └─ REPLACE: factory call with shoehorn call
  │
  └─ REPORT: files modified; factory calls replaced; production files untouched
```

**Key constraint** (🟢): `fromPartial`, `fromAny`, `fromExact` are test-code only. Any migration that would touch a production file must halt and report the conflict.

---

## 4. Fluxo de controle — `scaffold-exercises`

```
/scaffold-exercises invoked with exercise spec
  │
  ├─ FOR EACH exercise:
  │   ├─ CREATE: <exercise-name>/
  │   │   ├─ DESCRIPTION.md (exercise instructions)
  │   │   ├─ solution/       (reference solution)
  │   │   ├─ <exercise>.test.ts (test file)
  │   │   └─ <lint config>  (ESLint or similar)
  │   │
  │   └─ LINT LOOP:
  │       ├─ Run lint on student's empty file
  │       ├─ Lint fails → display error to student
  │       ├─ Student makes change
  │       └─ Re-run lint → repeat until passes
  │
  └─ REPORT: exercises created; lint loop confirmed working
```

---

## 5. Fluxo de controle — `setup-pre-commit`

```
/setup-pre-commit invoked
  │
  ├─ CHECK: is husky installed?
  │   ├─ NO  → npm install --save-dev husky
  │   └─ YES → skip
  │
  ├─ CHECK: is lint-staged installed?
  │   ├─ NO  → npm install --save-dev lint-staged
  │   └─ YES → skip
  │
  ├─ CHECK: does any Prettier config exist?
  │   (.prettierrc | prettier.config.js | .prettierrc.js | prettierrc.json | package.json#prettier)
  │   ├─ YES → skip Prettier config creation
  │   └─ NO  → create .prettierrc with sensible defaults
  │
  ├─ CONFIGURE lint-staged:
  │   └─ "*.{ts,tsx,js,jsx,json,css,md}": ["prettier --write"]
  │
  ├─ CONFIGURE husky pre-commit hook:
  │   └─ npx lint-staged
  │
  └─ REPORT: installed / skipped
```

---

## 6. Estruturas de dados

### Shoehorn API (🟢 — test-only)

| Method | Use case | Input | Output |
|--------|----------|-------|--------|
| `fromPartial<T>(partial)` | Only some fields needed in test | Partial object | Full T with defaults for missing fields |
| `fromAny(value)` | Type is unknown or `any` | any | Typed value |
| `fromExact<T>(exact)` | All fields explicitly provided | Exact object | T (no defaults) |

### Exercise structure (🟢)

```
<exercise-name>/
├── DESCRIPTION.md      — exercise instructions and learning objective
├── solution/           — reference solution (hidden from student in exercises)
│   └── <exercise>.ts   — complete working solution
├── <exercise>.test.ts  — tests that student's code must pass
└── .eslintrc.json      — lint config used in the lint loop
```

### `setup-pre-commit` Prettier defaults (🟡)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 7. Invariantes

| Invariant | Skill | Source |
|-----------|-------|--------|
| shoehorn methods: test files only, never production | migrate-to-shoehorn | `domain.md#pre-commit-shoehorn-rules` 🟢 |
| Prettier config: only create if absent | setup-pre-commit | `domain.md#pre-commit-shoehorn-rules` 🟢 |
| misc/ skills: not in plugin.json or README.md | all misc | `CLAUDE.md` 🟢 |
