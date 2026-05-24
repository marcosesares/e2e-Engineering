# ADR-008: Sidecar Schema Aligned with Operations JSON to Eliminate Re-serialization

- **Status:** Active
- **Date:** 2026-05-20 (PR 14747)
- **Confidence:** 🟢 CONFIRMADO (PR description: "Token Efficiency Improvements" section)

## Contexto

In the original `apply-test-plan` implementation, the skill parsed the test plan markdown into an intermediate representation, then re-serialized it into the `create-ado-test-cases.ps1` Operations JSON format. This required an extra transformation step and consumed additional LLM tokens for re-serialization.

PR 14747 also renamed fields in the sidecar schema (`name → title`) and added new fields (`cost_item_type`, `absorbs_ids`, `regression_coverage_evaluation`) to align directly with the Operations JSON input contract.

## Decisão

Design the `apply-test-plan` sidecar JSON format to be a strict superset of the Operations JSON format accepted by `create-ado-test-cases.ps1` and `update-ado-test-cases.ps1`. The sidecar is passed directly as input to the scripts — no intermediate transformation step.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Keep separate intermediate format + transformation step** | Extra LLM call or code step for transformation; additional tokens at Step 4. Eliminated as part of token efficiency initiative. | 🟢 |
| **Script accepts markdown directly** | Would require natural language parsing inside the PowerShell script — out of scope for deterministic API-wrapping scripts. | 🟡 |
| **Separate planning sidecar per skill** | Divergent schemas require syncing when either side changes. Single schema reduces drift risk. | 🟡 |

## Consequências

**Positivas:**
- No re-serialization step in `apply-test-plan` Step 4 — sidecar data passes directly to scripts.
- Reduced token consumption per apply operation.
- Schema changes to Operations JSON require corresponding sidecar updates — single point of truth.

**Negativas / Trade-offs:**
- Tighter coupling between `apply-test-plan` (planner) and the creation/update scripts (executors). A change to the Operations JSON schema requires updating both the sidecar generation and the script.
- Field renames (`name → title`) are breaking changes for existing cached sidecars. In-progress plans with old-format sidecars would need to be re-generated.
