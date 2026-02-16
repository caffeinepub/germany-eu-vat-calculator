# Specification

## Summary
**Goal:** Roll back the app to the behavior and UI outputs from immediately before the most recent VAT priority logic changes, while keeping existing invoices accessible.

**Planned changes:**
- Revert VAT calculator + invoice flow logic and UI outputs to the pre–VAT-priority version.
- Ensure existing saved invoices remain listable/viewable/downloadable without traps or manual resets after rollback.
- Update the existing production console marker to reflect the rolled-back release identifier for deployment verification.

**User-visible outcome:** VAT rate/label/amount results and invoice flow match the prior version (before the latest VAT-priority update), previously saved invoices still open normally, and operators can confirm the rollback via the production console marker.
