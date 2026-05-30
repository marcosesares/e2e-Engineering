# Design — BidDaySettings Feature

**Unit:** BidDaySettings  
**Confidence:** 🟡 INFERIDO  
**Date:** 2026-05-20

---

## Architecture

8 sub-pages, each with identical CRUD pattern:

```
Settings.* PageObject
  ├── Grid (list view)
  │   ├── Add Button
  │   ├── Table rows (Edit, Delete actions)
  │   └── Empty state
  └── Modal (add/edit form)
      ├── Required fields
      ├── Validation
      ├── Save/Cancel buttons
      └── Error display
```

---

## Test Execution Pattern (per sub-area)

1. **Setup:** Create project, sign in as Admin
2. **Navigate:** Settings page → sub-tab (Fees, Packages, etc.)
3. **CRUD Flow:**
   - Add: Click Add → Fill form → Save → Verify grid updated
   - Edit: Click Edit → Modify → Save → Verify grid updated
   - Delete: Click Delete → Confirm → Verify removal
4. **Validation:** Required fields, format constraints, uniqueness

---

## Assumptions

- 🟡 Permission checks happen at UI + API level (need to verify in code)
- 🟡 Each sub-area follows identical modal pattern (design-by-convention)
- 🟢 Grids paginate at 10 items per page
- 🟢 Modals timeout at 5s

---

## State Machines (per entity type)

```
Add Flow: [Grid] --Add--> [Modal] --Fill--> [Saving] --> [Grid Updated]
                                    ↓
                              [Error] --Retry
```

---

## Dependencies

- CommandService (API endpoint per entity)
- QueryService (for grid display)
- Permission middleware (authorization)

