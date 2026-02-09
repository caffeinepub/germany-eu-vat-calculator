# Production Publish Checklist - Version 5

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
- [ ] **Version marker:** Check browser console for "🚀 Germany EU VAT Calculator v5 - Production Build"
- [ ] **Browser tab title:** Verify tab shows "Germany EU Vat Calculator"
- [ ] **Routes accessible:** Test all main routes (see PRODUCTION_SMOKE_CHECK.md)
- [ ] **Authentication works:** Test Internet Identity login/logout flow
- [ ] **Stripe configuration:** Admin can configure Stripe (if not already done)
- [ ] **Checkout flow:** Verify Stripe checkout redirects properly (see PRODUCTION_SMOKE_CHECK.md)

### 6. Metadata Verification
- [ ] **Display name:** Confirm "Germany EU Vat Calculator" appears in UI header
- [ ] **Deployment slug:** Verify slug is "germany-eu-vat-calculator" (check deployment output)
- [ ] **Page title:** Check browser tab shows "Germany EU Vat Calculator"
- [ ] **Build-time validation:** Confirm slug validation passed (no build errors)

### 7. Security Checks
- [ ] **No Stripe secrets exposed:** Run full security checklist from PRODUCTION_SMOKE_CHECK.md
- [ ] **Checkout URL validation:** Verify only `https://checkout.stripe.com/` URLs are accepted
- [ ] **Error handling:** Test that invalid session URLs show error (not redirect to `/undefined`)

## Rollback Plan
If critical issues are discovered:
1. Identify the issue from browser console or network logs
2. Roll back to previous canister version if needed: `dfx canister install <canister-id> --mode reinstall --wasm <previous-version.wasm>`
3. Fix the issue in development
4. Re-run this checklist before redeploying

## Success Criteria
✅ Production deployment completes without errors  
✅ Live app is reachable at recorded frontend canister URL  
✅ Browser tab title shows "Germany EU Vat Calculator"  
✅ All routes render correctly without runtime errors  
✅ Internet Identity login/logout works  
✅ Stripe checkout creates sessions and redirects to valid Stripe URLs  
✅ No sensitive data exposed in frontend bundle, page source, storage, or network  
✅ Console shows Version 5 marker  

## Live URLs (Record After Deployment)
**Backend Canister:** `https://________.icp0.io`  
**Frontend Canister:** `https://________.icp0.io`  
**Deployment Date:** `__________`  
**Deployed By:** `__________`

---

**Version:** 5  
**Last Updated:** February 8, 2026
