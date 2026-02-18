import { type VATCalculationInput } from './calculateVat';
import { type VatCalculation, type ServiceProductCategory } from '../../backend';
import { determineVATRate } from './determineVatRate';

/**
 * Converts the calculator form state into the backend VatCalculation payload shape,
 * using the determineVATRate decision engine to derive the correct VAT rate.
 */
export function toBackendVatCalculation(input: VATCalculationInput): VatCalculation {
  // Normalize UK -> GB for backend
  const normalizedSellerCountry = input.sellerCountry.toUpperCase() === 'UK' ? 'GB' : input.sellerCountry;
  const normalizedCustomerCountry = input.customerCountry ? 
    (input.customerCountry.toUpperCase() === 'UK' ? 'GB' : input.customerCountry) : 
    normalizedSellerCountry;

  // Map service category to backend enum
  const categoryMap: Record<string, ServiceProductCategory> = {
    'digital': 'consultingDevelopment' as ServiceProductCategory,
    'consulting': 'consultingDevelopment' as ServiceProductCategory,
    'hardware': 'hardware' as ServiceProductCategory,
    'content': 'contentMediaDesign' as ServiceProductCategory,
    'hosting': 'hostingSupport' as ServiceProductCategory,
    'others': 'others' as ServiceProductCategory,
  };

  const backendCategory = categoryMap[input.serviceCategory] || 'others' as ServiceProductCategory;

  // Determine if this is an export
  const isCrossBorder = normalizedSellerCountry !== normalizedCustomerCountry;
  const isExport: boolean = input.isExport !== undefined ? Boolean(input.isExport) : isCrossBorder;

  // Get exempt identifier if present
  const exemptIdentifier = (input as any).exemptIdentifier || '';

  // Derive VAT rate using the decision engine
  const vatRatePercent = determineVATRate({
    country: normalizedSellerCountry,
    vatCategory: input.vatCategory || 'standard',
    productCategory: exemptIdentifier || (input.productCategory as string) || 'others',
    isExport,
    isB2B: input.customerType === 'B2B',
  });

  // Convert net amount to cents
  const priceGrossCents = BigInt(Math.round(input.netAmount * 100));

  return {
    fromCountry: normalizedSellerCountry,
    toCountry: normalizedCustomerCountry,
    vatIdNumber: input.customerType === 'B2B' && input.vatId ? input.vatId : undefined,
    category: backendCategory,
    priceGrossCents,
    vatRatePercent,
  };
}
