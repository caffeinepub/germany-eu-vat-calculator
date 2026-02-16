# Production Publish Checklist - Version 4

## Pre-Deployment Verification

### 1. Build Preparation
- [ ] Ensure all dependencies are installed: `pnpm install`
- [ ] Run TypeScript type checking: `pnpm typescript-check`
- [ ] Run linting: `pnpm lint`
- [ ] Generate backend bindings: `dfx generate backend`

### 2. Build Process
- [ ] Create production build: `pnpm build`
- [ ] Verify build output in `frontend/dist/` directory
- [ ] Check that `env.json` is copied to dist folder

### 3. Preview (Optional)
- [ ] Preview the production build locally before deploying
- [ ] Test critical user flows in preview mode

### 4. Deployment
- [ ] Deploy backend canister: `dfx deploy backend`
- [ ] Deploy frontend canister: `dfx deploy frontend`
- [ ] **Record canister URLs from deployment output:**
  - Backend canister URL: `_______________________________`
  - Frontend canister URL: `_______________________________`
- [ ] **Verify app is reachable:** Open frontend URL in browser and confirm it loads

## Post-Deployment Verification

### 5. Live App Checks
- [ ] **App loads without errors:** Open the live URL and verify no console errors
- [ ] **Console production marker:** Open browser DevTools Console and verify the marker appears immediately on page load: `🚀 Germany EU VAT Calculator v4 - Production Build`
- [ ] **Browser tab title:** Verify tab shows "Germany EU Vat Calculator" (check immediately after load and after navigating between routes)
- [ ] **Routes accessible:** Test all main routes (see PRODUCTION_SMOKE_CHECK.md)
- [ ] **Authentication works:** Test Internet Identity login/logout flow
- [ ] **Stripe configuration:** Admin can configure Stripe (if not already done)
- [ ] **Checkout flow:** Verify Stripe checkout redirects properly (see PRODUCTION_SMOKE_CHECK.md)

### 6. Metadata Verification
- [ ] **Display name:** Confirm "Germany EU Vat Calculator" appears in UI header
- [ ] **Deployment slug:** Verify slug is "germany-eu-vat-calculator" (check deployment output)
- [ ] **Page title consistency:** Check browser tab shows "Germany EU Vat Calculator" on initial load and after route transitions
- [ ] **Build-time validation:** Confirm slug validation passed (no build errors)

### 7. Security Checks
- [ ] **No Stripe secrets exposed:** Run full security checklist from PRODUCTION_SMOKE_CHECK.md
- [ ] **Checkout URL validation:** Verify only `https://checkout.stripe.com/` URLs are accepted
- [ ] **Error handling:** Test that invalid/missing session URLs show error toast (not redirect to `/undefined`)
- [ ] **Stripe checkout validation:** Confirm the checkout hook validates session URL before redirect and shows user-friendly error messages

## Rollback Plan
If critical issues are discovered:
1. Identify the issue from browser console or network logs
2. Roll back to previous canister version if needed: `dfx canister install <canister-id> --mode reinstall --wasm <previous-version.wasm>`
3. Fix the issue in development
4. Re-run this checklist before redeploying

## Success Criteria
✅ Production deployment completes without errors  
✅ Live app is reachable at recorded frontend canister URL  
✅ Console shows Version 4 marker immediately on page load  
✅ Browser tab title shows "Germany EU Vat Calculator" consistently across routes  
✅ All routes render correctly without runtime errors  
✅ Internet Identity login/logout works  
✅ Stripe checkout creates sessions and redirects to valid Stripe URLs  
✅ Invalid/missing Stripe URLs show error toasts instead of redirecting  
✅ No sensitive data exposed in frontend bundle, page source, storage, or network  

## Live URLs (Record After Deployment)
**Backend Canister:** `https://________.icp0.io`  
**Frontend Canister:** `https://________.icp0.io`  
**Deployment Date:** `__________`  
**Deployed By:** `__________`

---

**Version:** 4  
**Last Updated:** February 16, 2026
