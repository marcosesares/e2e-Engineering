# Design — LineItems Feature

**Unit:** LineItems  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
BidPackagePage.LineItemsGrid
  ├── Grid Display
  │   ├── Columns: Description, Qty, Unit, UnitPrice, Extended, Actions
  │   ├── Add Line Item button
  │   ├── Rows with Edit/Delete buttons
  │   └── Subtotal summary row
  ├── LineItemModal
  │   ├── Description input
  │   ├── Quantity input
  │   ├── Unit dropdown (from settings)
  │   ├── UnitPrice input
  │   ├── Save/Cancel buttons
  │   └── Validation messages
  └── Calculator
      ├── CalculateExtended(qty, unitPrice)
      └── CalculateSubtotal(items)

TestStep.BidResponses (implicit LineItems steps)
  ├── teststep_AddLineItem(desc, qty, unit, price)
  ├── teststep_EditLineItem(index, newQty, newPrice)
  └── teststep_DeleteLineItem(index)
```

---

## State Machine

```
[Grid] --Add--> [Modal] --Fill--> [Valid] --> [Saving] --> [GridUpdated]
                                     ↓
                                  [Invalid] --Retry

[Grid] --Edit--> [Modal] --Modify--> [Valid] --> [Saving] --> [GridUpdated]

[Grid] --Delete--> [Confirm] --> [Deleting] --> [GridUpdated]
```

