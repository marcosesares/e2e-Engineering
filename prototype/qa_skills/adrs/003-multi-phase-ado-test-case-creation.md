# ADR-003: Multi-Phase ADO Test Case Creation (3 Separate API Calls)

- **Status:** Active
- **Date:** ~2026-05 (PR 14429, formalized in PR 14747)
- **Confidence:** 🟢 CONFIRMADO (`create-ado-test-cases.ps1:267-379`, `custom-fields.md §4`)

## Contexto

Creating an ADO Test Case with all required fields, steps, and state in a single API call fails. The Azure DevOps REST API has multiple surfaces for test case properties with different update semantics.

## Decisão

Split test case creation into three sequential phases:

1. **Phase 1 — Fields:** `PATCH /wit/workitems/$Test%20Case` — creates the work item and sets all required custom fields.
2. **Phase 2 — Steps:** `testplan_update_test_case_steps` (or its REST equivalent) — sets `Microsoft.VSTS.TCM.Steps` XML.
3. **Phase 3 — State:** `PATCH /wit/workitems/{id}` with `System.State=Ready` — transitions from `Design` to `Ready`.

The step delimiter is `|` (pipe) for the `testplan/workitems` update surface, and XML with `<steps>` wrapper for the `wit/workitems` creation surface — these are **different serialization formats for different API surfaces**.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Single PATCH with all fields + steps + state** | ADO rejects the combined request with `TF401320`. Confirmed via trial. | 🟢 |
| **`testplan_create_test_case` endpoint** | Cannot set required `Custom.*` fields. The API response sets defaults that violate BeckTech's required-field rules. | 🟢 |
| **Two phases (fields+steps, then state)** | Steps XML cannot be set via `wit_update_work_item` — a separate `testplan_update_test_case_steps` call is always required. | 🟢 |

## Consequências

**Positivas:**
- Reliable creation that avoids `TF401320` errors.
- Each phase is independently retryable.
- Clean separation of concerns (field schema vs step content vs lifecycle state).

**Negativas / Trade-offs:**
- Three API round trips per test case. At scale (20+ TCs), latency compounds.
- No transactional guarantee: if Phase 2 or 3 fails, Phase 1 has already created the work item. No rollback mechanism. Partial TCs in `Design` state with no steps may appear in ADO.
- Creation is **not idempotent** — re-runs produce duplicate work items with no pre-check or operation key.
- Step encoding split (pipe-delimited `update` vs XML `create`) is an ADO API quirk; it's documented but unexpected and has caused integration bugs historically.
