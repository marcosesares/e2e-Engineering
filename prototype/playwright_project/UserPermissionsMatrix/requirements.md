# Requirements — UserPermissionsMatrix Feature

**Unit:** UserPermissionsMatrix  
**Type:** Authorization & RBAC  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Role-based access control matrix. 4 roles × 4 primary entities = 16 permission combinations. Test that each role can/cannot perform expected actions.

---

## Functional Requirements

### FR-01: Permission Definitions
**Priority:** MUST

Roles & Permissions:
| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ❌ |
| Contributor | ✅ | ❌ | ✅ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

Entities: BidProject, BidPackage, Bidder, BidResponse

### FR-02: Permission Enforcement (UI)
**Priority:** MUST

- Create button hidden for non-editors (Contributor, Viewer)
- Edit button disabled for Contributor, Viewer
- Delete button hidden for non-admins

### FR-03: Permission Enforcement (API)
**Priority:** MUST

- Unauthorized roles → 401 Unauthorized or 403 Forbidden
- Audit log: Who, What, When, Result

### FR-04: Role Inheritance
**Priority:** SHOULD

- Editor perms ⊇ Contributor perms
- Contributor perms ⊇ Viewer perms (transitivity)

---

## Test Coverage

- 🟢 All 16 permission combinations tested
- 🟡 API validation (TBD: how to mock roles in test)

---

## Gaps

🔴 **Q1:** How to assume role in test (jwt claim, session claim, query param)?  
🔴 **Q2:** Permission inheritance rules formalized?

