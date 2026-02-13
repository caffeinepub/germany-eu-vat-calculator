# Specification

## Summary
**Goal:** Make Spain (ES) a fully supported/ready country in the VAT calculator with correct VAT rates and category-based rate selection.

**Planned changes:**
- Complete the Spain (ES) entry in `frontend/src/lib/vat/euCountryConfig.ts` with a valid standard VAT rate, applicable reduced rates list, reverse charge text, and `configured=true`.
- Add explicit Spain (ES) handling in `frontend/src/lib/vat/vatCategoryRateRules.ts` so VAT Category selection yields Spain-appropriate reduced/super-reduced rates when applicable, otherwise uses Spain’s standard rate.
- Ensure Spain’s reduced rates integrate with the existing reduced treatment flow so users can select Spain reduced rates and calculations consistently use the selected reduced rate.

**User-visible outcome:** Spain no longer shows “Configuration Pending”; users can start the calculator for ES, select VAT Categories that affect the effective VAT rate, and choose Spain reduced rates that correctly update VAT and gross/net results.
