# Specification

## Summary
**Goal:** Improve frontend clarity by fixing the Service/Product Category dropdown readability across viewports and adding an exact bilingual §13b reverse-charge note in both the result UI and invoice preview for reverse-charge (0%) scenarios.

**Planned changes:**
- Adjust the “Service/Product Category” select styling/layout on the Transaction Details step so the selected value never overlaps the chevron, label, or nearby UI (including narrow/mobile widths), while keeping long labels readable via truncation/wrapping without breaking layout.
- In reverse-charge (0% VAT) results, display a two-line comment directly under the reverse-charge output with the exact German line followed by the exact English line.
- In reverse-charge (0% VAT) invoice previews, include the same two lines (German then English) as the legal VAT note with a visible line break; leave non-reverse-charge invoice legal note behavior unchanged.

**User-visible outcome:** Users can clearly read the chosen Service/Product Category on all screen sizes, and reverse-charge (0%) cases show the required bilingual §13b note beneath the result and inside the invoice preview legal note section.
