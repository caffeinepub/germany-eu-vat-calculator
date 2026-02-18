/**
 * VAT Rate Decision Engine
 * Implements the exact priority flow for determining VAT rate based on:
 * - Country configuration
 * - VAT category
 * - Product category
 * - Export status
 * - B2B status
 */

import { VAT_CONFIG } from './vatConfig';
import {
  isExemptCategory,
  isUKZeroEligible,
  isUKReducedEligible,
  isEUReducedEligible,
  EXEMPT_CATEGORIES,
} from './categoryEligibility';
import { normalizeIdentifier } from './identifierNormalization';

export interface DetermineVatRateInput {
  country: string;
  vatCategory: string;
  productCategory: string;
  isExport: boolean;
  isB2B: boolean;
}

/**
 * Determine the VAT rate based on the exact priority flow:
 * 1. Reverse Charge (vatCategory=reverse AND isB2B)
 * 2. Export (isExport=true)
 * 3. Exempt (vatCategory=exempt OR productCategory in EXEMPT_CATEGORIES)
 * 4. UK Zero (country=GB AND vatCategory=zero AND productCategory in UK_ZERO)
 * 5. Reduced (vatCategory=reduced with eligibility checks and auto-fallback)
 * 6. Standard (default fallback)
 */
export function determineVATRate(input: DetermineVatRateInput): number {
  const { country, vatCategory, productCategory, isExport, isB2B } = input;

  // Normalize country code (UK -> GB)
  const normalizedCountry = country.toUpperCase() === 'UK' ? 'GB' : country.toUpperCase();

  // Get country config
  const config = VAT_CONFIG[normalizedCountry];
  if (!config) {
    throw new Error('Unsupported country selected');
  }

  // PRIORITY 1: Reverse Charge (only when B2B)
  if (vatCategory === 'reverse' && isB2B) {
    return 0;
  }

  // PRIORITY 2: Export
  if (isExport) {
    return 0;
  }

  // PRIORITY 3: Exempt
  if (vatCategory === 'exempt' || isExemptCategory(productCategory)) {
    return 0;
  }

  // PRIORITY 4: UK Zero Rate
  if (normalizedCountry === 'GB' && vatCategory === 'zero' && isUKZeroEligible(productCategory)) {
    return 0;
  }

  // PRIORITY 5: Reduced Rate
  if (vatCategory === 'reduced') {
    // UK reduced rate eligibility
    if (normalizedCountry === 'GB' && isUKReducedEligible(productCategory)) {
      return config.reduced;
    }

    // EU reduced rate eligibility
    if (normalizedCountry !== 'GB' && isEUReducedEligible(productCategory)) {
      return config.reduced;
    }

    // Auto-fallback protection: if reduced is selected but not eligible, use standard
    return config.standard;
  }

  // PRIORITY 6: Standard (default)
  return config.standard;
}
