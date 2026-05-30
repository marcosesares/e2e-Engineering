# Requirements — LineItems Feature

**Unit:** LineItems  
**Type:** Bid Entry Component (High Complexity)  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Line item entry for bid packages. Add, edit, delete, reorder, with validation and dependent calculations.

---

## Functional Requirements

### FR-01: Add Line Item
**Priority:** MUST

- Modal: Description, Quantity, Unit (dropdown), UnitPrice
- Save → Item added to grid
- Validation: All required fields, Qty > 0, UnitPrice ≥ 0

### FR-02: Edit Line Item
**Priority:** MUST

- Click Edit → Modal pre-fills
- Modify any field
- Save → Grid updated

### FR-03: Delete Line Item
**Priority:** MUST

- Confirmation dialog
- Delete → Subtotal recalc, grid updated

### FR-04: Reorder Items
**Priority:** SHOULD

- Drag-drop reorder (or up/down buttons)
- DisplayOrder persisted
- Subtotal unaffected

### FR-05: Unit Validation
**Priority:** MUST

- Unit dropdown populated from admin-defined units
- Invalid units rejected

### FR-06: Subtotal Calculation
**Priority:** MUST

- Extended = Qty × UnitPrice (per item)
- Subtotal = Σ Extended
- Real-time update on any edit

---

## Data Entities

| Field | Type | Validation | Example |
|-------|------|-----------|---------|
| Description | String | Not empty, max 255 | "Steel Beams #10x20" |
| Quantity | Decimal | > 0, 2 decimal places | 150.00 |
| Unit | Enum | Must be in defined units | "FT" |
| UnitPrice | Decimal | ≥ 0, 2 decimal places | 125.50 |
| DisplayOrder | Int | Sequential (0, 1, 2...) | 0 |

---

## Dependencies

- Admin-defined units (from BidDaySettings)
- CommandService (add/edit/delete)
- QueryService (list display)

