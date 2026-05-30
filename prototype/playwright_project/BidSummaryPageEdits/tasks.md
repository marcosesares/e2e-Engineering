# Tasks — BidSummaryPageEdits Feature

**Unit:** BidSummaryPageEdits  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| BSE-001 | Click Cell → Edit Mode Activation | MUST | 1m |
| BSE-002 | Validation on Blur | MUST | 2m |
| BSE-003 | ESC to Cancel Edit | MUST | 1m |
| BSE-004 | Extended Auto-Recalc (Qty change) | MUST | 2m |
| BSE-005 | Subtotal & GrandTotal Cascade Update | MUST | 2m |
| BSE-006 | Error Display & Retry | SHOULD | 2m |

**Total:** ~10 minutes

---

## Key Tests

### BSE-001: Edit Mode
1. Click cell (e.g., Quantity)
2. Assert: Input field appears, value pre-filled
3. Assert: Input focused (cursor visible)

### BSE-002: Validation & Save
1. Activate edit on Quantity cell
2. Enter 0 (invalid)
3. Press Tab → blur
4. Assert: Error message "Quantity must be > 0"
5. Input stays in edit mode
6. Enter 150 (valid)
7. Press Tab
8. Assert: Input closes, cell displays new value (150)
9. Assert: Extended recalculates

### BSE-004: Dependent Calc
1. Edit Quantity: 100 → 150
2. Blur
3. Assert: Extended = 150 × (existing UnitPrice)
4. Assert: Subtotal row updates
5. Assert: Fees recalculate
6. Assert: GrandTotal updates (live, no page refresh)

