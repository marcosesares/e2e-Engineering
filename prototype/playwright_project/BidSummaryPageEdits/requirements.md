# Requirements — BidSummaryPageEdits Feature

**Unit:** BidSummaryPageEdits  
**Type:** Inline Editing  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Inline edit mode on bid summary grid. Click cell → edit → save/cancel. Real-time validation & dependent recalculation.

---

## Functional Requirements

### FR-01: Activate Edit Mode
**Priority:** MUST

- Click cell → Input field appears (not a modal)
- Cell value pre-fills input
- Cursor in input, ready for edit

### FR-02: Validate on Blur
**Priority:** MUST

- User edits value, presses Tab/Click elsewhere (blur)
- Validation runs: Required field, type check, range check
- If valid: Save to database (no extra click)
- If invalid: Show error below cell, keep edit mode

### FR-03: ESC to Cancel
**Priority:** MUST

- Press ESC while editing → Cancel edit, revert to original value
- No save to database

### FR-04: Dependent Recalculation
**Priority:** MUST

- Edit Quantity → Extended = Qty × UnitPrice recalcs
- Edit UnitPrice → Extended recalcs
- Subtotal, fees, GrandTotal cascade update

### FR-05: Concurrent Edit Handling
**Priority:** SHOULD

- 🟡 If another user edits same cell: Optimistic/pessimistic lock behavior (TBD)

---

## Data Entities

| Cell Type | Editable | Validation | Depends On |
|-----------|----------|-----------|------------|
| Quantity | Yes | > 0, integer or decimal | - |
| UnitPrice | Yes | ≥ 0, decimal 2 places | - |
| Extended (calc) | No | - | Qty × UnitPrice |
| Adjustment | Yes | Decimal 2 places | - |
| Fee (calc) | No | - | Fee rule |

---

## NFR

- Cell edit mode activation: <100ms
- Blur/validation: <200ms
- Dependent calc: <500ms
- No page flicker or jank

