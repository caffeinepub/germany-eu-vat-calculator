# Specification

## Summary
**Goal:** Align the Smart VAT engine and invoice output with the specified VAT rate config, category eligibility rules, priority flow, and updated product category dropdown behavior.

**Planned changes:**
- Update the VAT rate configuration to use the provided country VAT rates (DE/FR/NL/PL/SE/IT/BE/AT/HU/ES/GB with GB zero=0) as the authoritative source for calculations.
- Add explicit category eligibility lists (UK zero, UK reduced, EU reduced, and global exempt) and enforce them in the unified VAT calculation.
- Amend the unified VAT engine to follow the required priority order: Reverse Charge (B2B + reverse) → Export → Exempt → UK Zero → Reduced (UK vs EU list) → Standard fallback.
- Enforce auto-fallback protection so reduced/zero cannot be applied via manual selection when the product category is ineligible; “Others” always forces Standard VAT.
- Update the product category dropdown to exactly match the requested options, show “Domestic Fuel (UK)” only for GB, and preserve existing dropdown rendering/usability fixes.
- Ensure VAT computation outputs use the standard result fields (rate, vatAmount, total, label) and that UI/invoice values are derived from these outputs.
- Drive invoice legal wording from the VAT label, including localized Reverse Charge wording (DE/FR/IT/GB with fallback) and provided English wording for other labels.
- Add the specified global legal disclaimer text to all generated invoices.

**User-visible outcome:** Users see the updated product category choices and always get VAT rates/labels/amounts and invoice legal text/disclaimer that follow the specified eligibility rules and priority flow, with reduced/zero prevented when not permitted.
