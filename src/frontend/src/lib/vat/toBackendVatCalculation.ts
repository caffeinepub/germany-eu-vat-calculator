import type { VatCalculation, ServiceProductCategory } from '../../backend';
import { deriveVatRatePercentForBackend } from './deriveVatRatePercentForBackend';
import type { VatCategory } from './vatCategoryRateRules';

/**
 * Maps calculator form state to backend VatCalculation payload.
 * Uses determineVATRate decision engine for rate computation.
 */
export function toBackendVatCalculation(
  sellerCountry: string | null | undefined,
  customerCountry: string | null | undefined,
  vatIdNumber: string | null | undefined,
  category: string,
  netAmount: number,
  vatCategory: VatCategory,
  selectedReducedRate: number | null | undefined,
  reverseCharge: boolean
): VatCalculation {
  // Defensive checks for undefined/null values
  if (!sellerCountry) {
    throw new Error('Seller country is required');
  }
  
  if (!customerCountry) {
    throw new Error('Customer country is required');
  }

  const vatRatePercent = deriveVatRatePercentForBackend(
    sellerCountry,
    vatCategory,
    selectedReducedRate,
    reverseCharge
  );

  const priceGrossCents = Math.round(netAmount * 100);

  return {
    fromCountry: sellerCountry.toUpperCase(),
    toCountry: customerCountry.toUpperCase(),
    vatIdNumber: vatIdNumber || undefined,
    category: mapCategoryToBackend(category),
    priceGrossCents: BigInt(priceGrossCents),
    vatRatePercent,
  };
}

function mapCategoryToBackend(category: string): ServiceProductCategory {
  switch (category) {
    case 'consulting_development':
      return 'consultingDevelopment' as ServiceProductCategory;
    case 'hardware':
      return 'hardware' as ServiceProductCategory;
    case 'content_media_design':
      return 'contentMediaDesign' as ServiceProductCategory;
    case 'hosting_support':
      return 'hostingSupport' as ServiceProductCategory;
    default:
      return 'others' as ServiceProductCategory;
  }
}
