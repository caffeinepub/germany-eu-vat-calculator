import { type VATCalculationInput, type VATCalculationResult } from './calculateVat';
import { lookupVatConfig } from './vatTable';
import { VAT_CONFIG } from './vatConfig';
import {
  isUKZeroEligible,
  isUKReducedEligible,
  isEUReducedEligible,
} from './categoryEligibility';
import { type ProductCategory } from './reducedEligibility';
import { buildResult } from './vatResultBuilder';
import { getInvoiceWording } from '../invoice/getInvoiceWording';

/**
 * Smart VAT Engine with priority flow:
 * 1. Reverse Charge
 * 2. Export
 * 3. Exempt
 * 4. Zero (UK only)
 * 5. Reduced (UK/EU)
 * 6. Standard (fallback)
 */
export function calculateUnifiedVat(input: VATCalculationInput): VATCalculationResult {
  const netAmountCents = Math.round(input.netAmount * 100);
  const netAmount = input.netAmount;
  const sellerCountry = input.sellerCountry;
  const buyerCountry = input.customerCountry;
  const isB2B = input.customerType === 'B2B';
  const vatCategory = input.vatCategory || 'standard';
  const productCategory = (input.productCategory as ProductCategory) || 'others';

  // Normalize UK -> GB
  const normalizedSellerCountry = sellerCountry.toUpperCase() === 'UK' ? 'GB' : sellerCountry;

  // Validate country config
  const vatConfig = VAT_CONFIG[normalizedSellerCountry];
  if (!vatConfig) {
    throw new Error(`Country not supported: ${sellerCountry}`);
  }

  const standardRate = vatConfig.standard;
  const reducedRate = vatConfig.reduced;
  const isExport = normalizedSellerCountry !== buyerCountry && buyerCountry;

  // PRIORITY 1: Reverse Charge
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

  // PRIORITY 3: Exempt (via vatCategory)
  if (vatCategory === 'exempt') {
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

  // PRIORITY 4: UK Zero
  if (normalizedSellerCountry === 'GB' && (vatCategory === 'zero' || isUKZeroEligible(productCategory))) {
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

  // PRIORITY 5: UK Reduced
  if (normalizedSellerCountry === 'GB' && (vatCategory === 'reduced' || isUKReducedEligible(productCategory))) {
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

  // PRIORITY 6: EU Reduced
  if (normalizedSellerCountry !== 'GB' && (vatCategory === 'reduced' || isEUReducedEligible(productCategory))) {
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

  // PRIORITY 7: Standard (fallback, including "others")
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
