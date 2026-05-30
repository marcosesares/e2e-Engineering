# Scripts, Casos Extremos

- **Case 1:** API returns 500 → `Invoke-*Api` returns `{Success=$false; Error}`; no retry, no backoff. Caller (script main + downstream skill) decides. 🟢 (confirmed `create-ado-test-cases.ps1:55-81`)
- **Case 2:** Large batch (100+ TCs) → performance unknown; no client-side rate limiting; 3 sequential PATCH calls per TC + optional verify. 🟡 (recorded as backlog)
- **Case 3:** Credentials not found → hard error; no fallback to interactive prompt 🟢
- **Case 4:** JSON envelope parsing fails → script exits 1; caller catches it 🟡
- **Case 5:** Partial TC creation (TC created, steps/state PATCH fails) → entry pushed to `failures[]` with `partial: true` + `ado_id`; **no rollback**; created TC stays in ADO. 🟢 (confirmed `create-ado-test-cases.ps1:362-378`)
