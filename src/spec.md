# Specification

## Summary
**Goal:** Restore United Kingdom VAT country configuration and calculation behavior in the VAT calculator UI, including consistent handling of the GB/UK country code alias.

**Planned changes:**
- Add/restore the United Kingdom (GB) entry in the country configuration used by the VAT calculator UI so it resolves correctly wherever country configuration is displayed.
- Ensure the UK configuration exposes the expected VAT rates (standard 20%, reduced 5%, and zero rate 0% where applicable) and is treated as configured/available (no disabled proceed CTA due to missing config).
- Restore UK VAT rate selection and calculations in the unified VAT calculation flow when sellerCountry is GB, including correct vatRatePercent, vatAmountCents, and grossAmountCents across standard/reduced/zero-eligible cases and supported UK-specific scenarios.
- Normalize country code handling so inputs/links using `UK` behave identically to `GB` across country selection, URL query parameters, and configuration lookups.

**User-visible outcome:** United Kingdom can be selected/linked to (via GB or UK) without “country configuration not found” errors, and UK VAT results are calculated and displayed correctly using 20%/5%/0% rates as applicable.
