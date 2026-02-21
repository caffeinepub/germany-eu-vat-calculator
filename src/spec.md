# Specification

## Summary
**Goal:** Fix the 'Cannot read property toString' error that occurs during country selection.

**Planned changes:**
- Add null safety checks to all country selection onChange handlers
- Guard country code references with optional chaining or explicit null checks
- Add null/undefined validation to country object property access (like .toString())

**User-visible outcome:** Users can select countries without encountering toString errors, and the country selection flow completes smoothly across all flows (EU VAT intro, UK, and country transaction steps).
