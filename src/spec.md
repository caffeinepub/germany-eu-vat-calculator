# Specification

## Summary
**Goal:** Add a VAT Category dropdown and ensure VAT rates for DE/FR/IT/SE/BE are automatically computed from (country, category), with guidance/disclaimer text in the transaction step.

**Planned changes:**
- Add a “VAT Category” dropdown under the VAT selection area in the VAT calculator transaction step with the specified English options and default to “Others”.
- Persist the selected VAT Category in the calculator form state so it carries through the flow and is available when computing VAT (including results/invoice/preview).
- Implement country-based VAT rate computation for Germany, France, Italy, Sweden, and Belgium using the provided (country, category) mapping, including reduced-rate selection and standard-rate fallback rules.
- Update the transaction step VAT selection UI so users can’t apply an incorrect reduced rate for DE/FR/IT/SE/BE; the computed (country, category) rate must be the final rate used.
- Add the provided legal disclaimer under the VAT selection area and add an info tooltip near VAT Category / VAT selection with the provided text.

**User-visible outcome:** Users can choose a VAT Category during the transaction step, see VAT calculated using the correct country+category VAT rate for DE/FR/IT/SE/BE (with safe fallback to standard rate), and view an on-screen tooltip and legal disclaimer explaining reduced-rate usage.
