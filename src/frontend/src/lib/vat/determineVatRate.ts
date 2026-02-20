import { getCountryConfig } from './euCountryConfig';
import { computeVatRateForCategory } from './vatCategoryRateRules';
import type { VatCategory } from './vatCategoryRateRules';

/**
 * VAT rate decision engine implementing priority flow:
 * 1. Reverse charge → 0%
 * 2. Explicit reduced rate selection → use that
 * 3. Category-based rate → compute from country config
 */
export function determineVATRate(
  country: string | null | undefined,
  vatCategory: VatCategory,
  selectedReducedRate: number | null | undefined,
  reverseCharge: boolean
): number {
  // Defensive check for undefined/null country
  if (!country) {
    console.warn('determineVATRate: country is undefined/null, defaulting to 0');
    return 0;
  }

  // Priority 1: Reverse charge
  if (reverseCharge) {
    return 0;
  }

  // Priority 2: Explicit reduced rate selection
  if (vatCategory === 'reduced' && selectedReducedRate != null) {
    return selectedReducedRate;
  }

  // Priority 3: Category-based rate
  const normalizedCountry = country.toUpperCase();
  const config = getCountryConfig(normalizedCountry);
  
  if (!config) {
    console.warn(`determineVATRate: No config for country ${normalizedCountry}, defaulting to 0`);
    return 0;
  }

  return computeVatRateForCategory(normalizedCountry, vatCategory, config.standardRate);
}
