# Design — UserPermissionsMatrix Feature

**Unit:** UserPermissionsMatrix  
**Confidence:** 🟡 INFERIDO  
**Date:** 2026-05-20

---

## Test Architecture

```
PermissionMatrix Test (NUnit parameterized)
  for each (Role, Entity, Action) combination:
    1. Create test user with role
    2. Sign in as user
    3. Attempt action on entity
    4. Assert: ✅ Success or ❌ 401/403 Unauthorized
    5. Assert: Audit log entry (if applicable)

TestData
  ├── RolePermissionMatrix[16] (hardcoded expectations)
  └── Assertions mapped by (role, action, entity)
```

---

## Parameterized Test Structure

```
[TestCaseSource("PermissionCombinations")]
public async Task VerifyPermission(Role role, Entity entity, Action action, bool allowed)
{
  // Sign in as role
  var user = new TestUser { Role = role };
  // Attempt action
  // Assert: allowed == (API call succeeded)
}
```

---

## Permission Enforcement Points

1. **UI Level:** Buttons disabled/hidden per role
2. **API Level:** Authorization middleware checks JWT claim
3. **Domain Level:** Command handlers verify role (implicit)

