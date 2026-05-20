# Design — BidSummaryPageEdits Feature

**Unit:** BidSummaryPageEdits  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
BidSummaryPage.SummaryGrid
  ├── Cell (normal state)
  │   ├── Display value (read-only)
  │   └── Click → EditCell state
  ├── EditCell (edit state)
  │   ├── Input field (focused)
  │   ├── Event listeners: blur, keydown(ESC), Enter
  │   └── Validation on blur
  ├── ErrorCell (invalid state)
  │   ├── Input with red border
  │   └── Error message below
  └── Handlers
      ├── blur → Validate + Save
      ├── ESC → Cancel (revert)
      └── Tab/Enter → blur (same as above)

CalculatorService
  ├── RecalculateExtended(qty, unitPrice)
  ├── RecalculateSubtotal(lineItems)
  └── RecalculateGrandTotal(subtotal, fees)
```

---

## State Machine (per cell)

```
[Display] --Click--> [Edit] --Fill value--> [Validating]
                                               ├─ Valid --> [Saving] --> [Display]
                                               └─ Invalid --> [Error] --Retry
                      --ESC--> [Cancelled] --> [Display]
```

---

## Retry Logic

```csharp
on blur:
  1. Validate (local)
  2. If valid: Save to API
  3. If error: Retry 3x exponential backoff
  4. If all fail: Show "Could not save. Try again?" button
```

