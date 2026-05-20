# Tasks — LineItems Feature

**Unit:** LineItems  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| LI-001 | Add Line Item | MUST | 2m |
| LI-002 | Edit Line Item | MUST | 2m |
| LI-003 | Delete Line Item | MUST | 1m |
| LI-004 | Unit Validation | MUST | 1m |
| LI-005 | Subtotal Real-Time Calc | MUST | 2m |
| LI-006 | Reorder Items (Drag-Drop) | SHOULD | 2m |

**Total:** ~10 minutes

---

## Tests

### LI-001: Add Line Item
1. Click "Add Line Item"
2. Fill: Desc="Beams", Qty=150, Unit="FT", Price=125.50
3. Click Save
4. Assert: Grid row added with values
5. Assert: Extended = 18,825.00
6. Assert: Subtotal updated

### LI-005: Subtotal Calc
1. Add 3 line items with different Extended values
2. Assert: Subtotal = sum of all Extended
3. Edit one item's Qty
4. Assert: Extended & Subtotal update (no page refresh)

