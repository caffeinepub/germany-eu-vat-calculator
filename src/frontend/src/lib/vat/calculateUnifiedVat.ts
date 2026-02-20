import { determineCrossBorderVAT } from './determineCrossBorderVAT';
import { getCountryConfig } from './euCountryConfig';
import { computeVatRateForCategory } from './vatCategoryRateRules';
import type { VatCategory } from './vatCategoryRateRules';
import type { VATCalculationResult } from './calculateVat';

/**
 * Smart VAT engine using cross-border VAT treatment.
 * Determines treatment based on country pairs and transaction type,
 * then computes VAT accordingly.
 */
export function calculateUnifiedVat(
  sellerCountry: string | null | undefined,
  customerCountry: string | null | undefined,
  customerType: 'business' | 'consumer',
  supplyType: 'goods' | 'services',
  vatCategory: VatCategory,
  netAmount: number,
  vatIdNumber?: string,
  selectedReducedRate?: number
): VATCalculationResult {
  // Defensive checks for undefined/null country codes
  if (!sellerCountry) {
    throw new Error('Seller country is required for VAT calculation');
  }

  if (!customerCountry) {
    throw new Error('Customer country is required for VAT calculation');
  }

  // Normalize country codes before processing
  const normalizedSeller = sellerCountry.toUpperCase();
  const normalizedCustomer = customerCountry.toUpperCase();

  // Determine cross-border treatment
  const treatment = determineCrossBorderVAT(
    normalizedSeller,
    normalizedCustomer,
    customerType,
    supplyType,
    vatIdNumber
  );

  // Get seller country config
  const config = getCountryConfig(normalizedSeller);
  if (!config) {
    throw new Error(`VAT configuration not found for country: ${normalizedSeller}`);
  }

  // Compute VAT rate based on treatment and category
  let vatRatePercent: number;
  let vatAmount: number;
  let total: number;
  let scenario: VATCalculationResult['scenario'];

  switch (treatment) {
    case 'reverse-charge':
      // No VAT charged
      vatRatePercent = 0;
      vatAmount = 0;
      total = netAmount;
      scenario = 'reverse-charge';
      break;

    case 'export':
      // Zero-rated for exports
      vatRatePercent = 0;
      vatAmount = 0;
      total = netAmount;
      scenario = 'uk-export-zero';
      break;

    case 'intra-eu-supply':
      // Zero-rated for B2B intra-EU
      vatRatePercent = 0;
      vatAmount = 0;
      total = netAmount;
      scenario = 'intra-eu-supply';
      break;

    case 'domestic':
    case 'eu-b2c':
      // Apply domestic VAT rate based on category
      if (vatCategory === 'reduced' && selectedReducedRate != null) {
        vatRatePercent = selectedReducedRate;
      } else {
        vatRatePercent = computeVatRateForCategory(normalizedSeller, vatCategory, config.standardRate);
      }
      vatAmount = (netAmount * vatRatePercent) / 100;
      total = netAmount + vatAmount;
      scenario = vatCategory === 'reduced' ? 'b2c-reduced' : 'b2c-standard';
      break;

    default:
      throw new Error(`Unknown VAT treatment: ${treatment}`);
  }

  const netAmountCents = Math.round(netAmount * 100);
  const vatAmountCents = Math.round(vatAmount * 100);
  const grossAmountCents = Math.round(total * 100);

  return {
    scenario,
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent,
    legalNote: null,
    crossBorderVatTreatment: treatment,
  };
}
