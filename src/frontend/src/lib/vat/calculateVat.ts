export type ServiceCategory = 'digital' | 'physical' | 'consulting' | 'saas';

export interface VATCalculationInput {
  sellerCountry: string;
  customerCountry: string;
  customerType: 'B2C' | 'B2B';
  vatId: string;
  serviceCategory: ServiceCategory;
  netAmount: number;
  previousYearTurnover: number;
  currentYearTurnover: number;
  vatRate: 'standard' | 'reduced';
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
  legalVatTextOverride?: string;
}

export interface VATCalculationResult {
  netAmountCents: number;
  vatAmountCents: number;
  grossAmountCents: number;
  vatRatePercent: number;
  legalNote: string | null;
  scenario: 'kleinunternehmer' | 'reverse-charge' | 'b2c-standard' | 'b2c-reduced' | 'digital-b2c-eu' | 'intra-eu-supply';
}

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
      legalNote: `Digital service to ${input.customerCountry}: VAT based on customer's country`,
      scenario: 'digital-b2c-eu',
    };
  }

  // Check for intra-EU supply (B2C physical goods to another EU country)
  if (input.serviceCategory === 'physical' && input.customerCountry !== 'DE' && input.customerType === 'B2C' && isEUCountry(input.customerCountry)) {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      legalNote: `Intra-EU supply to ${input.customerCountry}: Special VAT rules apply`,
      scenario: 'intra-eu-supply',
    };
  }

  // Apply historical VAT rate if asOfDate is provided
  const vatRatePercent = getVatRateForDate(input.vatRate, asOfDate);
  const vatAmountCents = Math.round((netAmountCents * vatRatePercent) / 100);
  const grossAmountCents = netAmountCents + vatAmountCents;

  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent,
    legalNote: null,
    scenario: input.vatRate === 'reduced' ? 'b2c-reduced' : 'b2c-standard',
  };
}

function isValidEUVatId(vatId: string): boolean {
  if (!vatId || vatId.length < 4) return false;
  const countryCode = vatId.substring(0, 2).toUpperCase();
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  return euCountries.includes(countryCode);
}

function isEUCountry(countryCode: string): boolean {
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  return euCountries.includes(countryCode);
}

function getVatRateForDate(rateType: 'standard' | 'reduced', asOfDate?: string): number {
  // Current rates (2026)
  const currentRates = {
    standard: 19,
    reduced: 7,
  };

  if (!asOfDate) {
    return currentRates[rateType];
  }

  // Parse the date
  const date = new Date(asOfDate);
  
  // Historical rate: COVID-19 temporary reduction (July 1, 2020 - December 31, 2020)
  const covidStart = new Date('2020-07-01');
  const covidEnd = new Date('2020-12-31');
  
  if (date >= covidStart && date <= covidEnd) {
    return rateType === 'standard' ? 16 : 5;
  }

  return currentRates[rateType];
}
