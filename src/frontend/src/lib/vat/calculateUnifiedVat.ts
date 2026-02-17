import { type VATCalculationInput, type VATCalculationResult } from './calculateVat';
import { VAT_CONFIG } from './vatConfig';
import {
  isUKZeroEligible,
  isUKReducedEligible,
  isEUReducedEligible,
  isExemptCategory,
} from './categoryEligibility';
import { type ProductCategory } from './reducedEligibility';
import { buildResult } from './vatResultBuilder';
import { getInvoiceWording } from '../invoice/getInvoiceWording';

/**
 * Smart VAT Engine with exact priority flow:
 * 1. Reverse Charge (B2B + vatCategory=reverse)
 * 2. Export (isExport=true)
 * 3. Exempt (productCategory in EXEMPT_CATEGORIES)
 * 4. Zero (UK only, productCategory in UK_ZERO)
 * 5. Reduced (UK_REDUCED for GB, EU_REDUCED for others)
 * 6. Standard (fallback, including "others")
 */
export function calculateUnifiedVat(input: VATCalculationInput): VATCalculationResult {
  const netAmountCents = Math.round(input.netAmount * 100);
  const netAmount = input.netAmount;
  const sellerCountry = input.sellerCountry;
  const buyerCountry = input.customerCountry;
  const isB2B = input.customerType === 'B2B';
  const vatCategory = input.vatCategory || 'standard';
  const productCategory = (input.productCategory as ProductCategory) || 'others';
  
  // Track if this is an exempt category by identifier
  const exemptIdentifier = (input as any).exemptIdentifier || '';

  // Normalize UK -> GB
  const normalizedSellerCountry = sellerCountry.toUpperCase() === 'UK' ? 'GB' : sellerCountry;

  // Validate country config
  const vatConfig = VAT_CONFIG[normalizedSellerCountry];
  if (!vatConfig) {
    throw new Error(`Country not supported: ${sellerCountry}`);
  }

  const standardRate = vatConfig.standard;
  const reducedRate = vatConfig.reduced;
  const zeroRate = vatConfig.zero ?? 0;
  const isExport = normalizedSellerCountry !== buyerCountry && buyerCountry;

  // PRIORITY 1: Reverse Charge (only when vatCategory=reverse AND B2B)
  if (vatCategory === 'reverse' && isB2B) {
    const result = buildResult(0, netAmount, 'Reverse Charge');
    const legalNote = getInvoiceWording(normalizedSellerCountry, 'Reverse Charge');
    
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote,
      scenario: 'reverse-charge',
      message: 'Reverse Charge',
    };
  }

  // PRIORITY 2: Export
  if (isExport) {
    const result = buildResult(0, netAmount, 'Zero Rated Export');
    const legalNote = getInvoiceWording(normalizedSellerCountry, 'Zero Rated Export');
    
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote,
      scenario: 'uk-export-zero',
      message: 'Zero Rated Export',
    };
  }

  // PRIORITY 3: Exempt (when exemptIdentifier is in EXEMPT_CATEGORIES)
  if (exemptIdentifier && isExemptCategory(exemptIdentifier)) {
    const result = buildResult(0, netAmount, 'Exempt');
    const legalNote = getInvoiceWording(normalizedSellerCountry, 'Exempt');
    
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote,
      scenario: 'vat-exempt',
      message: 'Exempt',
    };
  }

  // PRIORITY 4: UK Zero (only when seller is GB and productCategory is eligible)
  if (normalizedSellerCountry === 'GB' && isUKZeroEligible(productCategory)) {
    const result = buildResult(0, netAmount, 'Zero Rated');
    const legalNote = getInvoiceWording(normalizedSellerCountry, 'Zero Rated');
    
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote,
      scenario: 'uk-export-zero',
      message: 'Zero Rated',
    };
  }

  // PRIORITY 5: UK Reduced (only when seller is GB and productCategory is eligible)
  if (normalizedSellerCountry === 'GB' && isUKReducedEligible(productCategory)) {
    const result = buildResult(reducedRate, netAmount, 'Reduced VAT');
    const vatAmountCents = Math.round(netAmountCents * (reducedRate / 100));
    const grossAmountCents = netAmountCents + vatAmountCents;
    
    return {
      netAmountCents,
      vatAmountCents,
      grossAmountCents,
      vatRatePercent: reducedRate,
      legalNote: getInvoiceWording(normalizedSellerCountry, 'Reduced VAT'),
      scenario: 'b2c-reduced',
      message: 'Reduced VAT',
    };
  }

  // PRIORITY 6: EU Reduced (only when seller is NOT GB and productCategory is eligible)
  if (normalizedSellerCountry !== 'GB' && isEUReducedEligible(productCategory)) {
    const result = buildResult(reducedRate, netAmount, 'Reduced VAT');
    const vatAmountCents = Math.round(netAmountCents * (reducedRate / 100));
    const grossAmountCents = netAmountCents + vatAmountCents;
    
    return {
      netAmountCents,
      vatAmountCents,
      grossAmountCents,
      vatRatePercent: reducedRate,
      legalNote: getInvoiceWording(normalizedSellerCountry, 'Reduced VAT'),
      scenario: 'b2c-reduced',
      message: 'Reduced VAT',
    };
  }

  // PRIORITY 7: Standard (fallback for all other cases, including "others")
  const result = buildResult(standardRate, netAmount, 'Standard VAT');
  const vatAmountCents = Math.round(netAmountCents * (standardRate / 100));
  const grossAmountCents = netAmountCents + vatAmountCents;
  
  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent: standardRate,
    legalNote: getInvoiceWording(normalizedSellerCountry, 'Standard VAT'),
    scenario: 'b2c-standard',
    message: 'Standard VAT',
  };
}
