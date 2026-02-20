import { getVatTableEntry, type VatTableEntry } from './vatTable';

// Re-export VatTableEntry as CountryConfig for semantic clarity
export type CountryConfig = VatTableEntry;

/**
 * Get country configuration with UK/GB normalization.
 * Returns null if country is undefined/null or not found.
 */
export function getCountryConfig(country: string | null | undefined): CountryConfig | null {
  if (!country) {
    return null;
  }

  const entry = getVatTableEntry(country);
  return entry;
}

/**
 * Get all EU country configs (excludes UK).
 */
export function getEUCountryConfigs(): CountryConfig[] {
  const euCountries = ['DE', 'FR', 'NL', 'PL', 'SE', 'IT', 'BE', 'AT', 'HU', 'ES'];
  return euCountries
    .map(code => getCountryConfig(code))
    .filter((config): config is CountryConfig => config !== null);
}

/**
 * Get UK country config.
 */
export function getUKCountryConfig(): CountryConfig | null {
  return getCountryConfig('GB');
}

/**
 * Get all country configs as a list (constant, not a function).
 */
export const COUNTRY_LIST: CountryConfig[] = [
  ...['DE', 'FR', 'NL', 'PL', 'SE', 'IT', 'BE', 'AT', 'HU', 'ES', 'GB']
    .map(code => getCountryConfig(code))
    .filter((config): config is CountryConfig => config !== null)
];
