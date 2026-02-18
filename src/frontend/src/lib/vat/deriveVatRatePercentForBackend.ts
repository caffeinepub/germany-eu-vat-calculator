import { type VATCalculationInput } from './calculateVat';
import { computeVatRateForCategory } from './vatCategoryRateRules';
import { getCountryConfig } from './euCountryConfig';

/**
 * Derives the VAT rate percentage to send to backend.calculate()
 * from the current UI state (country/region + VAT category + treatment + selectedReducedRate + reverseCharge).
 * 
 * Ensures UK reduced selection deterministically yields 5%.
 * Uses existing VAT helpers rather than hard-coded 19/20 logic.
 */
export function deriveVatRatePercentForBackend(input: VATCalculationInput): number {
  const sellerCountry = input.sellerCountry;
  const customerCountry = input.customerCountry;
  const isB2B = input.customerType === 'B2B';
  const vatCategory = input.vatCategory || 'standard';
  const reverseCharge = input.reverseCharge || false;
  const vatTreatment = input.vatTreatment || 'standard';
  const selectedReducedRate = input.selectedReducedRate;

  // Normalize UK -> GB
  const normalizedSellerCountry = sellerCountry.toUpperCase() === 'UK' ? 'GB' : sellerCountry;
  const normalizedCustomerCountry = customerCountry ? (customerCountry.toUpperCase() === 'UK' ? 'GB' : customerCountry) : '';

  // Get country config
  const country = getCountryConfig(normalizedSellerCountry);
  if (!country) {
    throw new Error(`Country not supported: ${sellerCountry}`);
  }

  const standardRate = country.standardRate;
  const reducedRates = country.reducedRates || [];

  // Cross-border check
  const isCrossBorder = normalizedSellerCountry !== normalizedCustomerCountry && normalizedCustomerCountry;

  // Reverse charge: 0% (only when B2B AND cross-border AND reverse charge enabled)
  if (reverseCharge && isB2B && isCrossBorder) {
    return 0;
  }

  // Exempt: 0%
  if (vatTreatment === 'exempt') {
    return 0;
  }

  // Reduced treatment: use selectedReducedRate if available
  if (vatTreatment === 'reduced' && selectedReducedRate !== null && selectedReducedRate !== undefined) {
    return selectedReducedRate;
  }

  // Standard treatment: compute rate from VAT category
  if (vatTreatment === 'standard') {
    return computeVatRateForCategory(normalizedSellerCountry, vatCategory, standardRate);
  }

  // Fallback to first reduced rate if available, otherwise standard
  return reducedRates.length > 0 ? reducedRates[0] : standardRate;
}
