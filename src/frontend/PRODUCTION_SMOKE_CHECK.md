# Production Smoke Check - Version 39

This document provides a quick verification runbook for testing the deployed production application.

## Console Production Marker (CRITICAL)

**Check immediately after opening the app:**

1. Open the deployed frontend canister URL in a browser
2. Open browser DevTools (F12) → Console tab
3. **Expected:** Console shows `🚀 Glotaxa v39 - Production Build` immediately on page load
4. **Note:** This marker appears before any user interaction or navigation

## Required Routes Check

Test that all main routes render without errors:

### 1. Landing Page
- **URL:** `/`
- **Expected:** Landing page loads with tagline, features list, and CTA buttons
- **Check:** No console errors, all images/assets load
- **Navigation:** Header shows "Glotaxa" and navigation links work

### 2. Calculator Page
- **URL:** `/calculator`
- **Expected:** 6-step VAT calculator flow loads
- **Check:** Step 1 (Country Selection) displays, navigation works
- **Interaction:** Can select countries and proceed through steps

### 3. Upgrade/Pricing Page
- **URL:** `/upgrade`
- **Expected:** Three pricing tiers (Free/Starter/Pro) display
- **Check:** Plan cards render, current plan is highlighted
- **Stripe Status:** Shows alert if Stripe not configured, or enables subscribe buttons if configured

### 4. Payment Success Page
- **URL:** `/payment-success`
- **Expected:** Success message and navigation options
- **Check:** Page renders (can be tested directly via URL)

### 5. Payment Failure Page
- **URL:** `/payment-failure`
- **Expected:** Failure message and retry options
- **Check:** Page renders (can be tested directly via URL)

### 6. Invoices Page (Authenticated Users)
- **URL:** `/invoices`
- **Expected:** Requires login; shows saved invoices list
- **Check:** Page renders after authentication
- **Backward Compatibility:** Existing invoices display correctly with currency and VAT label fields

## Internet Identity Authentication

### Login Flow
1. Click "Login" button in header
2. **Expected:** Internet Identity dialog opens
3. Complete authentication
4. **Expected:** Button changes to "Logout" with user icon
5. **Check:** No console errors during login

### Logout Flow
1. Click "Logout" button
2. **Expected:** User is logged out immediately
3. **Expected:** Query cache is cleared (no stale data visible)
4. **Check:** Button changes back to "Login"

### Profile Setup (First-Time Users)
1. Log in with new Internet Identity
2. **Expected:** Profile setup modal appears asking for name
3. Enter name and save
4. **Expected:** Modal closes, name is saved
5. **Check:** On subsequent logins, modal does not appear (profile already exists)

## Stripe Checkout Flow Verification

### Prerequisites
- Admin must be logged in via Internet Identity
- Stripe must be configured (secret key + allowed countries)

### Test Steps

#### 1. Admin Configuration (First Time Only)
- Log in as admin
- Navigate to `/upgrade`
- If Stripe setup card appears (yellow border), enter valid Stripe secret key
- Click "Configure Stripe"
- **Expected:** Success toast appears, setup card disappears
- **Security Check:** Confirm secret key is NOT visible in:
  - Browser DevTools > Application > Local Storage
  - Browser DevTools > Application > Session Storage
  - Browser DevTools > Network tab responses (check all XHR/Fetch)
  - Page source (Right-click > View Page Source, search for `sk_test_`, `sk_live_`, `secretKey`)

#### 2. Checkout Session Creation (Stripe Configured)
- Navigate to `/upgrade`
- Verify no alert message about "payment processing being configured"
- Click "Subscribe" on Starter or Pro plan
- **Expected:** Button shows "Processing..." state
- **Expected:** Browser redirects to Stripe-hosted checkout page
- **URL Check:** Verify redirect URL starts with `https://checkout.stripe.com/`
- **Error Check:** If redirect fails, check console for error message

#### 3. Invalid URL Protection (Automatic)
- **Validation:** The checkout hook validates that session URLs are Stripe-hosted HTTPS URLs
- **Expected:** If backend returns invalid URL, user sees error toast (not redirect to `/undefined`)
- **Expected:** If session URL is missing, user sees error toast: "Stripe session missing url"
- **Expected:** If session URL doesn't start with `https://checkout.stripe.com/`, user sees error toast: "Invalid Stripe checkout URL"
- **Test:** This validation happens automatically in `useCreateCheckoutSession` hook before any redirect

#### 4. Stripe Not Configured (Non-Admin or Pre-Configuration)
- Log out and log in as non-admin user (or test before admin configures Stripe)
- Navigate to `/upgrade`
- **Expected:** Alert message displays: "Payment processing is currently being configured. Please check back shortly to subscribe to paid plans."
- **Expected:** Subscribe buttons are disabled (grayed out)
- **Expected:** Free plan button still works (shows "Current Plan" if on free)

## Invoice Backward Compatibility (Version 39)

### Existing Invoice Display
1. Log in as user with existing saved invoices
2. Navigate to `/invoices`
3. **Expected:** All existing invoices display without errors
4. **Check:** Invoice list shows:
   - Invoice number and date
   - VAT rate and amount with correct currency
   - VAT label (Reverse Charge, Exempt, Reduced VAT, Standard VAT)
5. **Legacy Records:** Invoices without currency/vatLabel fields display with safe fallbacks (EUR, "VAT")
6. **No Backend Reset:** Existing invoice records remain intact (no reinstall required)

### VAT Outcome Derivation (Version 39 Logic)
1. Create new invoice via calculator
2. **Reverse Charge:** Should produce 0% VAT with "Reverse Charge" label
3. **Exempt:** Should produce 0% VAT with "Exempt" label
4. **Reduced Rate:** Should apply reduced rate consistently (no fallback to standard)
5. **Standard Rate:** Should apply standard rate as default
6. **Unsupported Country:** Should return explicit error state (no runtime crash)

## Security Verification

### Critical: No Secrets Exposed

#### 1. Page Source Check
- Right-click page → "View Page Source"
- Search for: `sk_test_`, `sk_live_`, `secretKey`, `stripeConfiguration`
- **Expected:** No matches found (secret keys never in frontend bundle)

#### 2. Network Tab Check
- Open DevTools → Network tab
- Clear network log
- Perform a checkout action (click Subscribe button)
- Inspect all XHR/Fetch requests to backend
- **Expected:** Secret key never appears in request/response bodies
- **Note:** Only session ID and public data should be visible

#### 3. Local Storage Check
- Open DevTools → Application → Local Storage
- Check all entries
- **Expected:** No Stripe secret keys stored
- **Expected:** Only theme preference and query cache metadata

#### 4. Session Storage Check
- Open DevTools → Application → Session Storage
- Check all entries
- **Expected:** No Stripe secret keys stored

#### 5. Console Check
- Open DevTools → Console
- Check all logged messages
- **Expected:** No secret keys logged (admin component has inline note preventing this)

## Console Verification

Open browser console (F12) and check for:

- ✅ **Version marker:** `🚀 Glotaxa v39 - Production Build` (appears immediately on page load)
- ✅ **No errors:** No red error messages during normal navigation
- ⚠️ **Warnings:** Minor warnings are acceptable (e.g., React DevTools, third-party extensions)

## Metadata Verification

### Browser Tab Title
- **Check:** Browser tab shows "Glotaxa"
- **Test:** Navigate between routes (`/`, `/calculator`, `/upgrade`, `/invoices`), title should remain consistent
- **Note:** Title is set in `main.tsx` and reinforced in `AppLayout.tsx` on mount

### App Header
- **Check:** Header displays "Glotaxa"
- **Test:** Visible on all pages

### Deployment Slug
- **Check:** Deployment used slug "glotaxa"
- **Validation:** Build-time validation passed (no errors during `pnpm build`)

## Quick Smoke Test Checklist

- [ ] Console shows production marker `v39` immediately on page load
- [ ] Landing page loads (`/`)
- [ ] Calculator page loads (`/calculator`)
- [ ] Upgrade page loads (`/upgrade`)
- [ ] Payment success page loads (`/payment-success`)
- [ ] Payment failure page loads (`/payment-failure`)
- [ ] Invoices page loads for authenticated users (`/invoices`)
- [ ] Existing invoices display correctly with currency and VAT labels
- [ ] Browser tab title shows "Glotaxa" consistently across routes
- [ ] Header displays app name correctly
- [ ] Login/logout works (Internet Identity)
- [ ] Profile setup works for new users (modal appears once)
- [ ] Admin can configure Stripe (if not configured)
- [ ] Checkout creates session and redirects to `https://checkout.stripe.com/` URL
- [ ] Invalid/missing session URLs show error toast (not redirect to `/undefined`)
- [ ] Stripe not configured: alert shows, buttons disabled
- [ ] No Stripe secrets in page source, network logs, local storage, session storage, or console
- [ ] No critical console errors
- [ ] VAT outcome derivation follows Version 39 logic (reverse charge → exempt → reduced → standard)

## Troubleshooting

### Issue: Console marker not appearing
- Verify you're testing the production build (not development)
- Check that `pnpm build` completed successfully
- Verify `frontend/dist/` contains the built files
- Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Browser tab title incorrect or changes unexpectedly
- Check that `main.tsx` sets `document.title` on initialization
- Verify `AppLayout.tsx` reinforces title in `useEffect`
- Clear browser cache and reload

### Issue: Invoices page shows errors or missing data
- Check browser console for specific error messages
- Verify backend is accessible and user is authenticated
- Check that invoice records have required fields (currency, vatLabel)
- Legacy records should display with safe fallbacks (EUR, "VAT")

### Issue: Checkout button does nothing
- Check browser console for errors
- Verify Stripe is configured (admin check)
- Verify user is logged in (Internet Identity)
- Check network tab for failed requests

### Issue: Redirect to invalid URL or `/undefined`
- **Should not happen:** App validates URLs before redirect
- If it does: Check console error message
- Verify backend `createCheckoutSession` returns valid JSON with `url` field
- Confirm URL starts with `https://checkout.stripe.com/`
- Check `useCreateCheckoutSession` hook for validation logic

### Issue: "Actor not available" error
- Refresh the page
- Clear browser cache and reload
- Check that backend canister is deployed and accessible
- Verify `env.json` is present in frontend dist folder

### Issue: Profile setup modal keeps appearing
- Check browser console for errors during profile save
- Verify backend `saveCallerUserProfile` is working
- Clear query cache and try again

### Issue: Stripe secrets visible in frontend
- **Critical security issue:** Immediately investigate
- Check admin setup component for logging/storage bugs
- Verify backend is not returning secrets in responses
- Clear all browser storage and reconfigure

---

**Version:** 39  
**Last Updated:** February 16, 2026  
**Language:** English
