// VAT_TABLE: Single source of truth for country VAT rates, currency, and VAT prefix

import { VAT_CONFIG } from './vatConfig';

export interface CountryVatConfig {
  standard: number;
  reduced: number;
  currency: string;
  prefix: string;
}

// Central VAT configuration table - keyed by 2-letter country codes
export const VAT_TABLE: Record<string, CountryVatConfig> = {
  DE: { standard: VAT_CONFIG.DE.standard, reduced: VAT_CONFIG.DE.reduced, currency: 'EUR', prefix: 'DE' },
  FR: { standard: VAT_CONFIG.FR.standard, reduced: VAT_CONFIG.FR.reduced, currency: 'EUR', prefix: 'FR' },
  NL: { standard: VAT_CONFIG.NL.standard, reduced: VAT_CONFIG.NL.reduced, currency: 'EUR', prefix: 'NL' },
  PL: { standard: VAT_CONFIG.PL.standard, reduced: VAT_CONFIG.PL.reduced, currency: 'EUR', prefix: 'PL' },
  SE: { standard: VAT_CONFIG.SE.standard, reduced: VAT_CONFIG.SE.reduced, currency: 'EUR', prefix: 'SE' },
  IT: { standard: VAT_CONFIG.IT.standard, reduced: VAT_CONFIG.IT.reduced, currency: 'EUR', prefix: 'IT' },
  BE: { standard: VAT_CONFIG.BE.standard, reduced: VAT_CONFIG.BE.reduced, currency: 'EUR', prefix: 'BE' },
  AT: { standard: VAT_CONFIG.AT.standard, reduced: VAT_CONFIG.AT.reduced, currency: 'EUR', prefix: 'AT' },
  HU: { standard: VAT_CONFIG.HU.standard, reduced: VAT_CONFIG.HU.reduced, currency: 'EUR', prefix: 'HU' },
  ES: { standard: VAT_CONFIG.ES.standard, reduced: VAT_CONFIG.ES.reduced, currency: 'EUR', prefix: 'ES' },
  GB: { standard: VAT_CONFIG.GB.standard, reduced: VAT_CONFIG.GB.reduced, currency: 'GBP', prefix: 'GB' },
};

// Legacy name-based lookup for backward compatibility
const LEGACY_NAME_TO_CODE: Record<string, string> = {
  Germany: 'DE',
  France: 'FR',
  Netherlands: 'NL',
  Poland: 'PL',
  Sweden: 'SE',
  Italy: 'IT',
  Belgium: 'BE',
  Austria: 'AT',
  Hungary: 'HU',
  Spain: 'ES',
  'United Kingdom': 'GB',
};

/**
 * Lookup VAT configuration by country code (2-letter) or legacy name
 * Normalizes UK/GB aliases
 */
export function lookupVatConfig(countryIdentifier: string): CountryVatConfig | null {
  if (!countryIdentifier) return null;
  
  const normalized = countryIdentifier.trim().toUpperCase();
  
  // Direct lookup by 2-letter code
  if (VAT_TABLE[normalized]) {
    return VAT_TABLE[normalized];
  }
  
  // UK alias
  if (normalized === 'UK') {
    return VAT_TABLE['GB'];
  }
  
  // Legacy name-based lookup
  const code = LEGACY_NAME_TO_CODE[countryIdentifier.trim()];
  if (code && VAT_TABLE[code]) {
    return VAT_TABLE[code];
  }
  
  return null;
}

/**
 * Get country code from country name or code
 * Normalizes UK -> GB
 */
export function getCountryCode(countryIdentifier: string): string | null {
  if (!countryIdentifier) return null;
  
  const normalized = countryIdentifier.trim().toUpperCase();
  
  // Check if it's already a valid code
  if (VAT_TABLE[normalized]) {
    return normalized;
  }
  
  // UK alias
  if (normalized === 'UK') {
    return 'GB';
  }
  
  // Legacy name lookup
  const code = LEGACY_NAME_TO_CODE[countryIdentifier.trim()];
  return code || null;
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string | null {
  if (!countryCode) return null;
  
  const normalized = countryCode.trim().toUpperCase();
  
  // UK alias
  const code = normalized === 'UK' ? 'GB' : normalized;
  
  // Reverse lookup
  for (const [name, c] of Object.entries(LEGACY_NAME_TO_CODE)) {
    if (c === code) {
      return name;
    }
  }
  
  return null;
}

/**
 * Get all supported country codes
 */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(VAT_TABLE);
}
