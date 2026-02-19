# Specification

## Summary
**Goal:** Add required compliance fields to the invoice form with comprehensive validation that prevents PDF generation until all required information is provided.

**Planned changes:**
- Add manual input fields for Supplier Legal Name, Supplier Address, Supplier VAT Number, Invoice Number, and Invoice Date to the invoice form
- Mark all new fields as required with visual indicators
- Implement validation that prevents PDF download when required fields are empty
- Add validation to ensure at least one line item exists before PDF generation
- Add validation to ensure invoice grand total is greater than zero
- Display consolidated validation error list showing all missing or invalid fields when PDF download is attempted
- Include all validated field values in the generated invoice PDF

**User-visible outcome:** Users must fill in all supplier compliance fields (legal name, address, VAT number), invoice details (number, date), add at least one line item, and ensure a positive grand total before they can download the invoice PDF. Clear validation errors guide users to complete any missing information.
