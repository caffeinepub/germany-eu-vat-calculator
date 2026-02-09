# Deployment Configuration

## App Display Name
**Germany EU Vat Calculator**

## Recommended Deployment Slug
**germany-eu-vat-calculator**

This slug is validated in `frontend/src/config/appMeta.ts` to ensure compliance with platform requirements.

## Platform Constraints
- **Length:** 5-50 characters
- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), and hyphens (-)
- **Not allowed:** spaces, special characters (+, &, etc.)
- **Validation regex:** `/^[a-zA-Z0-9-]{5,50}$/`

## Validation
The suggested slug is automatically validated at build time in `frontend/src/config/appMeta.ts`. If the slug does not meet platform requirements, the build will fail with a clear error message:

