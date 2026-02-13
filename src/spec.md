# Specification

## Summary
**Goal:** Reorganize the VAT calculator UI to improve the transaction/invoice flow and make key controls more compact and usable.

**Planned changes:**
- Move the “Service/Product Category” field from the Transaction/Results UI into the Invoice step, placing it before the item Description field/column, and ensure invoice preview/layout includes it as a column before Description where applicable.
- Compact the “Enable Reverse Charge” and “VAT Treatment” controls by reducing spacing/padding while keeping readability and avoiding clipping across common breakpoints.
- Reposition the “VAT Category” selector to the right column of the Transaction Details section on md+ breakpoints, keeping a sensible stacked order on mobile.
- Update the “VAT Category” dropdown menu so only ~5 options are visible at once, with vertical scrolling to access remaining categories while preserving keyboard navigation.

**User-visible outcome:** Users select Service/Product Category during the Invoice step (not in Results), see a cleaner/compact Transaction Details area with VAT Category on the right on larger screens, and can scroll a constrained VAT Category dropdown list that shows about five options at a time.
