# Flowchart — Validate-OperationsJson (create-ado-test-cases.ps1)

**Source:** `claude-skills/scripts/create-ado-test-cases.ps1` lines 84–134
**Inputs:** `[object]$Ops`
**Outputs:** `@{ Errors = [], Warnings = [] }`

---

```mermaid
flowchart TD
    Start([Ops]) --> ChkArr{test_cases array non-empty?}
    ChkArr -->|no| Err1[errors += 'test_cases array is required and must not be empty']
    ChkArr -->|yes| Loop[for i in 0..test_cases.Count-1]
    Err1 --> Return

    Loop --> TC[tc = Ops.test_cases i]
    TC --> Title{tc.title present?}
    Title -->|no| EAdd1[errors += i: title is required]
    Title -->|yes| QFA{tc.qa_functional_area present?}
    EAdd1 --> QFA

    QFA -->|no| EAdd2[errors += i: qa_functional_area is required]
    QFA -->|yes| TT{tc.test_type present?}
    EAdd2 --> TT

    TT -->|no| EAdd3[errors += i: test_type is required]
    TT -->|yes| CT{tc.coverage_type present?}
    EAdd3 --> CT

    CT -->|no| EAdd4[errors += i: coverage_type is required]
    CT -->|yes| Manual{tc.manual == true AND no manual_reason?}
    EAdd4 --> Manual

    Manual -->|yes| EAdd5[errors += i: manual_reason required when manual is true]
    Manual -->|no| StepsArr{tc.steps present AND not array?}
    EAdd5 --> StepsArr

    StepsArr -->|yes| EAdd6[errors += i: steps must be an array]
    StepsArr -->|no| Xor{description_metadata has BOTH ac_references AND absorbs_ids?}
    EAdd6 --> Xor

    Xor -->|yes| EAdd7[errors += i: cannot have both ac_references and absorbs_ids]
    Xor -->|no| StepLoop{tc.steps array?}
    EAdd7 --> StepLoop

    StepLoop -->|yes| SLoop[for s in 0..steps.Count-1]
    StepLoop -->|no| NextTc

    SLoop --> FirstWord[firstWord = action.Split whitespace first non-empty]
    FirstWord --> Forbid{firstWord.ToLower in observe,verify,see,check,confirm,note?}
    Forbid -->|yes| WAdd[warnings += i step s+1: action starts with forbidden verb]
    Forbid -->|no| NextStep
    WAdd --> NextStep
    NextStep[Next step] --> SLoop
    SLoop -->|done| NextTc

    NextTc[Next test case] --> Loop
    Loop -->|done| Return[Return Errors, Warnings]
```

---

## Decision summary

| Rule | Type | Outcome |
|---|---|---|
| `test_cases` missing or empty | hard | early exit with single error |
| missing `title`/`qa_functional_area`/`test_type`/`coverage_type` | hard | error added, continue checking other rules |
| `manual=true` but no `manual_reason` | hard | error added |
| `steps` provided but not an array | hard | error added |
| `description_metadata` has both `ac_references` and `absorbs_ids` | hard | error added (XOR rule) |
| step `action` first word ∈ forbidden verbs (`observe`,`verify`,`see`,`check`,`confirm`,`note`) | soft | warning added |

Hard errors abort the whole run (caller calls `Write-Error` → `$ErrorActionPreference=Stop` → exit). Warnings are surfaced in the response envelope under `data.warnings`.
