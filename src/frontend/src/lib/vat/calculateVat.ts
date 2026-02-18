import { type VatCategory } from './vatCategoryRateRules';
import { lookupVatConfig } from './vatTable';
import { type ProductCategory } from './reducedEligibility';

export type ServiceCategory = 'digital' | 'physical' | 'consulting' | 'saas' | 'others';
export type SupplyType = 'goods' | 'services';

export interface VATCalculationInput {
  sellerCountry: string;
  customerCountry: string;
  buyerCountry?: string; // New field for Buyer Country
  customerType: 'B2C' | 'B2B';
  vatId: string;
  serviceCategory: ServiceCategory;
  netAmount: number;
  previousYearTurnover: number;
  currentYearTurnover: number;
  vatRate: 'standard' | 'reduced';
  reverseCharge?: boolean;
  selectedCountry?: string;
  vatCategory?: VatCategory;
  productCategory?: ProductCategory;
  isExport?: boolean; // New field for explicit export toggle
  supplyType?: SupplyType; // New field for goods/services
  // New fields for VAT treatment selection
  vatTreatment?: 'standard' | 'reduced' | 'exempt';
  selectedReducedRate?: number | null;
  effectiveVatRate?: number;
  // Invoice detail fields
  sellerName?: string;
  sellerAddress?: string;
  sellerVatId?: string;
  customerName?: string;
  customerAddress?: string;
  itemDescription?: string;
  translateToEnglish?: boolean;
  invoiceNumber?: string;
  invoiceDate?: string;
  taxPointDate?: string;
  currency?: string;
  legalVatTextOverride?: string;
  // UK-specific fields
  region?: 'EU' | 'UK' | 'USA' | 'APAC';
  ukScenario?: 'uk-domestic' | 'uk-export-zero' | 'uk-reverse-charge' | 'uk-exempt';
  ukMessage?: string;
}

export interface VATCalculationResult {
  netAmountCents: number;
  vatAmountCents: number;
  grossAmountCents: number;
  vatRatePercent: number;
  legalNote: string | null;
  scenario: 'kleinunternehmer' | 'reverse-charge' | 'vat-exempt' | 'b2c-standard' | 'b2c-reduced' | 'digital-b2c-eu' | 'intra-eu-supply' | 'uk-domestic' | 'uk-export-zero' | 'uk-reverse-charge' | 'uk-exempt';
  message?: string;
  crossBorderVatTreatment?: string; // New field for cross-border treatment
}

export function calculateEUVAT(input: VATCalculationInput, countryRate: number): VATCalculationResult {
  const netAmountCents = Math.round(input.netAmount * 100);

  // Check reverse charge toggle first
  if (input.reverseCharge) {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: 'Reverse charge applies under EU VAT Directive Article 44/196',
      scenario: 'reverse-charge',
    };
  }

  // Check for explicit VAT exempt treatment (not reverse charge)
  if (input.vatTreatment === 'exempt') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: 'VAT exempt - legal exemption must apply',
      scenario: 'vat-exempt',
    };
  }

  // Use effective VAT rate if provided (from treatment selection)
  const effectiveRate = input.effectiveVatRate !== undefined ? input.effectiveVatRate : countryRate;

  // Calculate VAT with selected rate
  const vatAmountCents = Math.round(netAmountCents * (effectiveRate / 100));
  const grossAmountCents = netAmountCents + vatAmountCents;

  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent: effectiveRate,
    legalNote: null,
    scenario: input.vatRate === 'reduced' ? 'b2c-reduced' : 'b2c-standard',
  };
}

// Legacy Germany-specific function (kept for backward compatibility)
export function calculateGermanyVAT(input: VATCalculationInput, asOfDate?: string): VATCalculationResult {
  const netAmountCents = Math.round(input.netAmount * 100);

  const isKleinunternehmer =
    input.previousYearTurnover < 22000 && input.currentYearTurnover < 50000;

  if (isKleinunternehmer) {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: 'VAT exempt under §19 UStG',
      scenario: 'kleinunternehmer',
    };
  }

  if (input.customerType === 'B2B' && input.vatId && isValidEUVatId(input.vatId)) {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: 'VAT reverse-charged according to Article 196 EU VAT Directive',
      scenario: 'reverse-charge',
    };
  }

  const isDigitalOrSaaS = input.serviceCategory === 'digital' || input.serviceCategory === 'saas';
  if (isDigitalOrSaaS && input.customerCountry !== 'DE' && input.customerType === 'B2C') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: `Digital service to ${input.customerCountry} consumer - use customer's VAT rate or OSS`,
      scenario: 'digital-b2c-eu',
    };
  }

  // Use VAT_TABLE for Germany rates
  const vatConfig = lookupVatConfig('DE');
  const standardRate = vatConfig?.standard || 19;
  const reducedRate = vatConfig?.reduced || 7;
  
  const ratePercent = input.vatRate === 'reduced' ? reducedRate : standardRate;
  const vatAmountCents = Math.round(netAmountCents * (ratePercent / 100));
  const grossAmountCents = netAmountCents + vatAmountCents;

  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent: ratePercent,
    legalNote: null,
    scenario: input.vatRate === 'reduced' ? 'b2c-reduced' : 'b2c-standard',
  };
}

function isValidEUVatId(vatId: string): boolean {
  if (!vatId || vatId.length < 4) return false;
  const countryCode = vatId.substring(0, 2).toUpperCase();
  const euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
  return euCountries.includes(countryCode);
}
