/**
 * Country configuration for tax router and engines
 */

export const EU_COUNTRY_CODES = [
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "SE", "PL", "HU"
];

export const UK_COUNTRY_CODES = ["GB", "UK"];

export const US_COUNTRY_CODE = "US";

/**
 * Check if a country is in the EU
 */
export function isEUCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return EU_COUNTRY_CODES.includes(countryCode.toUpperCase());
}

/**
 * Check if a country is the UK
 */
export function isUKCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  const normalized = countryCode.toUpperCase();
  return UK_COUNTRY_CODES.includes(normalized);
}

/**
 * Check if a country is the US
 */
export function isUSCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return countryCode.toUpperCase() === US_COUNTRY_CODE;
}

/**
 * Get region for a country code
 */
export function getRegion(countryCode: string | null | undefined): "EU" | "UK" | "US" | "OTHER" {
  if (!countryCode) return "OTHER";
  
  if (isEUCountry(countryCode)) return "EU";
  if (isUKCountry(countryCode)) return "UK";
  if (isUSCountry(countryCode)) return "US";
  
  return "OTHER";
}
