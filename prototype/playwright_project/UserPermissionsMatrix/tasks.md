# Tasks — UserPermissionsMatrix Feature

**Unit:** UserPermissionsMatrix  
**Status:** 🟡 CONFIRMADO  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| UPM-001 | Define 4×4 Permission Matrix | MUST | 1m |
| UPM-002 | UI Enforcement Test (16 combos) | MUST | 5m |
| UPM-003 | API Authorization Test | MUST | 3m |
| UPM-004 | Role Inheritance Validation | SHOULD | 2m |
| UPM-005 | Audit Log Verification | SHOULD | 2m |

**Total:** ~13 minutes

---

## Key Tests

### UPM-002: UI Enforcement (16 combinations)
Test cases (parameterized):
1. Admin + BidProject + Delete → Delete button visible & enabled
2. Editor + BidProject + Delete → Delete button hidden
3. Contributor + BidResponse + Create → Create button hidden
4. Viewer + BidPackage + View → View allowed, Edit hidden, Delete hidden
... (12 more combinations)

Assert: Button presence/state matches permission matrix

### UPM-003: API Authorization
1. Sign in as Contributor
2. Call DELETE /api/commands/delete-bidproject/{id}
3. Assert: 403 Forbidden
4. Audit log: "Delete BidProject - DENIED for Contributor"

