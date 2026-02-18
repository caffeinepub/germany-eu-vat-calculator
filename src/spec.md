# Specification

## Summary
**Goal:** Add consistent in-flow Back navigation across all VAT calculator steps so users can review and adjust prior selections without losing entered data.

**Planned changes:**
- Add a visible Back button on every step of the /calculator multi-step flow, wired into the existing CalculatorFlowPage step navigation.
- Ensure Back navigation preserves existing step state so previously selected/entered values remain populated when returning to earlier steps.
- Implement missing Back controls specifically on the “Select Country” step (navigate to prior location or home if no prior step) and the “Explanation” step (Back to “VAT Results”, Continue to “Invoice Preview”) using the shared Button component styling.

**User-visible outcome:** Users can move backward through the calculator steps (including Select Country and Explanation) to review and change earlier inputs, with their previous selections retained.
