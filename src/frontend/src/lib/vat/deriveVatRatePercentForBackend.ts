import { getCountryConfig } from './euCountryConfig';
import { computeVatRateForCategory } from './vatCategoryRateRules';
import type { VatCategory } from './vatCategoryRateRules';

/**
 * Derives the VAT rate percentage to send to backend.calculate()
 * from the current UI state (country/region + VAT category + treatment + selectedReducedRate + reverseCharge).
 * 
 * Uses existing VAT helpers rather than hard-coded logic.
 */
export function deriveVatRatePercentForBackend(
  sellerCountry: string | null | undefined,
  vatCategory: VatCategory,
  selectedReducedRate: number | null | undefined,
  reverseCharge: boolean
): number {
  // Defensive check for undefined/null sellerCountry
  if (!sellerCountry) {
    console.warn('deriveVatRatePercentForBackend: sellerCountry is undefined/null, defaulting to 0');
    return 0;
  }

  // If reverse charge, VAT rate is 0
  if (reverseCharge) {
    return 0;
  }

  // For reduced category with explicit selection, use that rate
  if (vatCategory === 'reduced' && selectedReducedRate != null) {
    return selectedReducedRate;
  }

  // Otherwise compute from category using existing helpers
  const normalizedCountry = sellerCountry.toUpperCase();
  const config = getCountryConfig(normalizedCountry);
  
  if (!config) {
    console.warn(`deriveVatRatePercentForBackend: No config for country ${normalizedCountry}, defaulting to 0`);
    return 0;
  }

  return computeVatRateForCategory(normalizedCountry, vatCategory, config.standardRate);
}
