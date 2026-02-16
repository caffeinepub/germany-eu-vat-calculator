/**
 * Centralized application metadata
 * Used for consistent branding across UI, document metadata, and deployment
 */
export const APP_META = {
  displayName: 'Glotaxa',
  suggestedSlug: 'glotaxa',
  description: 'Calculate Tax correctly for multiple countries. Generate compliant invoices.',
} as const;

/**
 * Deployment slug validation constraints (platform requirements):
 * - Length: 5-50 characters
 * - Allowed: letters (a-z, A-Z), numbers (0-9), hyphens (-)
 * - No spaces or special characters
 * 
 * Regex: /^[a-zA-Z0-9-]{5,50}$/
 */
export function validateDeploymentSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-]{5,50}$/.test(slug);
}

// Validate our suggested slug at build time
if (!validateDeploymentSlug(APP_META.suggestedSlug)) {
  throw new Error(`Invalid deployment slug: ${APP_META.suggestedSlug}`);
}
