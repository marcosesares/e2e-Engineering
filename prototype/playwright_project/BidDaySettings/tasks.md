# Tasks — BidDaySettings Feature

**Unit:** BidDaySettings  
**Status:** 🟡 CONFIRMADO  
**Date:** 2026-05-20

---

## Task List (Compressed)

| Task ID | Title | Priority | Type | Est. Time | Status |
|---------|-------|----------|------|-----------|--------|
| BS-001 | Admin Bid Packages CRUD | MUST | Functional | 2m | Pending |
| BS-002 | Fees CRUD + Calculation | MUST | Functional | 3m | Pending |
| BS-003 | General Conditions Add/Edit | SHOULD | Functional | 2m | Pending |
| BS-004 | General Requirements Add/Edit | SHOULD | Functional | 2m | Pending |
| BS-005 | Units of Measure Define | MUST | Functional | 2m | Pending |
| BS-006 | User Permissions RBAC 4×4 Matrix | MUST | Validation | 5m | Pending |
| BS-007 | Directory Member Management | SHOULD | Functional | 2m | Pending |
| BS-008 | Preferences Theme/Locale | COULD | Functional | 1m | Pending |
| BS-009 | Bulk Validation (all sub-areas) | SHOULD | Integration | 3m | Pending |

**Total Est.:** ~22 minutes sequential

---

## Key Tasks (Detailed)

### BS-006: RBAC Permission Matrix Test
**Scope:** 4 roles × 4 entity types = 16 permission combinations

**Matrix:**
| Role | View | Edit | Delete | Create |
|------|------|------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ❌ | ✅ |
| Contributor | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

**Test Approach:** For each role, attempt each action → Assert success/401 Unauthorized

