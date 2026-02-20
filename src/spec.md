# Specification

## Summary
**Goal:** Fix the toString error that occurs when selecting a country in the VAT calculator flow.

**Planned changes:**
- Add null/undefined checks in country selection and VAT calculation logic
- Implement defensive programming patterns (optional chaining, explicit null checks) for all country-related data access
- Ensure currency formatting functions validate input before calling toString()

**User-visible outcome:** Users can successfully select a country and proceed through the VAT calculator without encountering runtime errors.
