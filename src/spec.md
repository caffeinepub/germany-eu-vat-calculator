# Specification

## Summary
**Goal:** Add GDPR-safe, anonymous event tracking plus fingerprint-based monthly free limits and instrumentation for monetization/conversion analytics.

**Planned changes:**
- Backend: implement a persistent on-chain `events` store (monotonic id, server timestamp) with a public append method usable without login, optionally including a provided fingerprint.
- Backend: add a persistent `usage_limits` store keyed by fingerprint to track monthly `invoices_count` with monthly reset, plus anonymous methods to check and increment usage enforcing 5 invoices/month.
- Backend: add admin-only query methods to list events (with filters) and to return weekly aggregates and ratios for key events (free_limit_reached/invoice_previewed, ai_explain_clicked count, stripe_checkout_clicked/upgrade_cta_shown).
- Backend: add upgrade/migration handling to initialize new stable fields for `events` and `usage_limits` without breaking existing deployed state.
- Frontend: add a reusable event logging utility to send core events (exact names) with country, page, device, metadata, and fingerprint when available, without breaking primary flows on failure.
- Frontend: compute a daily-rotating fingerprint as hash(IP + user_agent + day); send only the hash to the backend and degrade gracefully when IP is unavailable.
- Frontend: instrument the specified flow by logging the core events at the defined points (app load, country detect, VAT calc, reverse charge check, invoice preview, invoice download success/blocked, AI explanation click, upgrade shown, Stripe click, payment success), and increment usage on invoice preview when fingerprint is available.
- Frontend: update limit-reached/upgrade messaging to the provided Germany-optimized English copy, show the modal when the free limit is reached, and log upgrade_cta_shown when shown.
- Frontend: add an inline upsell under the VAT result with the provided English copy and a button that opens upgrade and logs upgrade_cta_shown.
- Frontend: add an AI explanation paywall message (English) for gated explanation/export actions; log ai_explain_clicked on click and upgrade_cta_shown when the paywall is shown.
- Frontend: update pricing presentation (Free: 5 invoices/month, Starter: €5/month, Pro: €12/month) and add micro-trust text: “GDPR-compliant • No signup required • No ads”.

**User-visible outcome:** Users can use the app anonymously while events are tracked in a GDPR-safe way, free usage is limited to 5 invoices per month per fingerprint, upgrade/upsell messaging is updated for Germany, and admins can query event analytics and weekly conversion ratios.
