import { VAT_CONFIG } from './vatConfig';

export interface VatTableEntry {
  country: string;
  countryName: string;
  name: string; // Alias for countryName
  code: string; // Alias for country
  standardRate: number;
  standard: number; // Alias for standardRate
  reducedRates: number[];
  reduced: number; // First reduced rate
  zeroRate?: number;
  currency: string;
  flag: string;
  invoiceLabel: string;
  configured: boolean;
}

// Central VAT configuration table - keyed by 2-letter country codes
export const VAT_TABLE: Record<string, VatTableEntry> = {
  DE: {
    country: 'DE',
    code: 'DE',
    countryName: 'Germany',
    name: 'Germany',
    standardRate: VAT_CONFIG.DE.standard,
    standard: VAT_CONFIG.DE.standard,
    reducedRates: [VAT_CONFIG.DE.reduced],
    reduced: VAT_CONFIG.DE.reduced,
    currency: 'EUR',
    flag: '🇩🇪',
    invoiceLabel: 'Umsatzsteuer (MwSt)',
    configured: true,
  },
  FR: {
    country: 'FR',
    code: 'FR',
    countryName: 'France',
    name: 'France',
    standardRate: VAT_CONFIG.FR.standard,
    standard: VAT_CONFIG.FR.standard,
    reducedRates: [VAT_CONFIG.FR.reduced],
    reduced: VAT_CONFIG.FR.reduced,
    currency: 'EUR',
    flag: '🇫🇷',
    invoiceLabel: 'TVA',
    configured: true,
  },
  NL: {
    country: 'NL',
    code: 'NL',
    countryName: 'Netherlands',
    name: 'Netherlands',
    standardRate: VAT_CONFIG.NL.standard,
    standard: VAT_CONFIG.NL.standard,
    reducedRates: [VAT_CONFIG.NL.reduced],
    reduced: VAT_CONFIG.NL.reduced,
    currency: 'EUR',
    flag: '🇳🇱',
    invoiceLabel: 'BTW',
    configured: true,
  },
  PL: {
    country: 'PL',
    code: 'PL',
    countryName: 'Poland',
    name: 'Poland',
    standardRate: VAT_CONFIG.PL.standard,
    standard: VAT_CONFIG.PL.standard,
    reducedRates: [VAT_CONFIG.PL.reduced],
    reduced: VAT_CONFIG.PL.reduced,
    currency: 'EUR',
    flag: '🇵🇱',
    invoiceLabel: 'VAT',
    configured: true,
  },
  SE: {
    country: 'SE',
    code: 'SE',
    countryName: 'Sweden',
    name: 'Sweden',
    standardRate: VAT_CONFIG.SE.standard,
    standard: VAT_CONFIG.SE.standard,
    reducedRates: [VAT_CONFIG.SE.reduced],
    reduced: VAT_CONFIG.SE.reduced,
    currency: 'EUR',
    flag: '🇸🇪',
    invoiceLabel: 'Moms',
    configured: true,
  },
  IT: {
    country: 'IT',
    code: 'IT',
    countryName: 'Italy',
    name: 'Italy',
    standardRate: VAT_CONFIG.IT.standard,
    standard: VAT_CONFIG.IT.standard,
    reducedRates: [VAT_CONFIG.IT.reduced],
    reduced: VAT_CONFIG.IT.reduced,
    currency: 'EUR',
    flag: '🇮🇹',
    invoiceLabel: 'IVA',
    configured: true,
  },
  BE: {
    country: 'BE',
    code: 'BE',
    countryName: 'Belgium',
    name: 'Belgium',
    standardRate: VAT_CONFIG.BE.standard,
    standard: VAT_CONFIG.BE.standard,
    reducedRates: [VAT_CONFIG.BE.reduced],
    reduced: VAT_CONFIG.BE.reduced,
    currency: 'EUR',
    flag: '🇧🇪',
    invoiceLabel: 'TVA / BTW',
    configured: true,
  },
  AT: {
    country: 'AT',
    code: 'AT',
    countryName: 'Austria',
    name: 'Austria',
    standardRate: VAT_CONFIG.AT.standard,
    standard: VAT_CONFIG.AT.standard,
    reducedRates: [VAT_CONFIG.AT.reduced],
    reduced: VAT_CONFIG.AT.reduced,
    currency: 'EUR',
    flag: '🇦🇹',
    invoiceLabel: 'Umsatzsteuer',
    configured: true,
  },
  HU: {
    country: 'HU',
    code: 'HU',
    countryName: 'Hungary',
    name: 'Hungary',
    standardRate: VAT_CONFIG.HU.standard,
    standard: VAT_CONFIG.HU.standard,
    reducedRates: [VAT_CONFIG.HU.reduced],
    reduced: VAT_CONFIG.HU.reduced,
    currency: 'EUR',
    flag: '🇭🇺',
    invoiceLabel: 'ÁFA',
    configured: true,
  },
  ES: {
    country: 'ES',
    code: 'ES',
    countryName: 'Spain',
    name: 'Spain',
    standardRate: VAT_CONFIG.ES.standard,
    standard: VAT_CONFIG.ES.standard,
    reducedRates: [VAT_CONFIG.ES.reduced],
    reduced: VAT_CONFIG.ES.reduced,
    currency: 'EUR',
    flag: '🇪🇸',
    invoiceLabel: 'IVA',
    configured: true,
  },
  GB: {
    country: 'GB',
    code: 'GB',
    countryName: 'United Kingdom',
    name: 'United Kingdom',
    standardRate: VAT_CONFIG.GB.standard,
    standard: VAT_CONFIG.GB.standard,
    reducedRates: [VAT_CONFIG.GB.reduced],
    reduced: VAT_CONFIG.GB.reduced,
    zeroRate: 0,
    currency: 'GBP',
    flag: '🇬🇧',
    invoiceLabel: 'VAT',
    configured: true,
  },
};

/**
 * Get VAT table entry for a country (with UK/GB normalization).
 * Returns null if country is undefined/null or not found.
 */
export function getVatTableEntry(country: string | null | undefined): VatTableEntry | null {
  if (!country) {
    return null;
  }

  const normalized = country.toUpperCase();
  const key = normalized === 'UK' ? 'GB' : normalized;
  return VAT_TABLE[key] || null;
}

/**
 * Lookup VAT configuration by country code (alias for getVatTableEntry).
 */
export function lookupVatConfig(country: string | null | undefined): VatTableEntry | null {
  return getVatTableEntry(country);
}

/**
 * Get country code from country identifier (with UK/GB normalization).
 */
export function getCountryCode(countryIdentifier: string | null | undefined): string | null {
  if (!countryIdentifier) {
    return null;
  }

  const normalized = countryIdentifier.toUpperCase();
  const key = normalized === 'UK' ? 'GB' : normalized;
  
  if (VAT_TABLE[key]) {
    return key;
  }
  
  return null;
}

/**
 * Get country name from country code.
 */
export function getCountryName(countryCode: string | null | undefined): string | null {
  const entry = getVatTableEntry(countryCode);
  return entry?.countryName || null;
}

/**
 * Get all supported country codes.
 */
export function getSupportedCountries(): string[] {
  return Object.keys(VAT_TABLE);
}

/**
 * Alias for getSupportedCountries (for backward compatibility).
 */
export function getSupportedCountryCodes(): string[] {
  return getSupportedCountries();
}

/**
 * Check if a country is supported.
 */
export function isCountrySupported(country: string | null | undefined): boolean {
  if (!country) {
    return false;
  }

  const normalized = country.toUpperCase();
  const key = normalized === 'UK' ? 'GB' : normalized;
  return key in VAT_TABLE;
}
