# Design — BidResponses Feature

**Unit:** BidResponses  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
BidPackagePage.BidResponses
  ├── LineItemsGrid
  │   ├── Edit mode per cell (inline)
  │   ├── Dependent calculations (Extended, Subtotal)
  │   └── Validation on blur
  ├── AdjustmentsGrid
  │   ├── Add/Edit/Delete adjustments
  │   └── AdjustmentAmount calc
  ├── GeneralRequirementsSection
  │   ├── Display conditions (read-only)
  │   └── Bidder response (checkbox + notes)
  ├── FeesSummary (read-only display)
  │   └── Fee rows with calculated amounts
  ├── GrandTotal Display
  │   └── Final amount (includes subtotal, adjustments, fees)
  └── Submit Button
      └── Validation + API call

Calculator Service (internal)
  ├── SubtotalCalculator()
  ├── AdjustmentCalculator()
  ├── FeeCalculator() → calls FeeCalculation microservice
  └── GrandTotalCalculator()
```

---

## State Machine

```
[BidOpen] --Edit Cell--> [Calculating]
           <-- Recalc complete <--
           --Change Fee--> [FeeService.Calc]
           <-- Fee result <--
           --Submit--> [Validating]
                       ├─ Valid --> [SubmittedSaved]
                       └─ Invalid --> [ErrorShown] --Retry
```

---

## Calculation Flow (Detailed)

1. User edits cell (LineItem.Qty or UnitPrice)
2. Blur event triggered
3. Validate (Qty > 0, UnitPrice ≥ 0)
4. Recalculate Extended = Qty × UnitPrice
5. Recalculate Subtotal = Σ Extended
6. Call FeeCalculationService (async) with Subtotal
7. Recalculate GrandTotal = Subtotal ± Adjustments + Fees
8. Validate GrandTotal vs MinBid/MaxBid constraints
9. Update grid display (no flickering, all cells update together)

---

## Retry Logic

```csharp
await FeeCalculationService.CalculateAsync(subtotal)
  ├─ Success (200): Use result
  └─ Timeout/Error: Retry 3x with exponential backoff
                    If all fail: Show error, keep previous value
```

---

## Data Binding

| Grid Column | Source | Editable | Depends On |
|------------|--------|----------|------------|
| LineItem Description | Domain | No | - |
| Quantity | Response | Yes | - |
| UnitPrice | Response | Yes | - |
| Extended | Calc | No | Qty × UnitPrice |
| Subtotal | Calc | No | Σ Extended |
| AdjustmentAmount | Calc | No | Adjustment rule |
| FeeAmount | Calc | No | Fee rule × Subtotal |
| GrandTotal | Calc | No | All above |

---

## Component Interactions

| Component | Trigger | Action | Timeout |
|-----------|---------|--------|---------|
| LineItemCell | blur | Validate, recalc Extended | 2s |
| CalculatorService | subtotal change | Call FeeService, recalc fees | 5s |
| GrandTotalDisplay | fees updated | Render new total | 500ms |
| SubmitButton | click | Validate + API call | 10s |

