// Region helpers and types for multi-region VAT calculator

export type Region = 'EU' | 'UK' | 'USA' | 'APAC';

export interface RegionInfo {
  code: Region;
  name: string;
  supported: boolean;
}

export const REGIONS: Record<Region, RegionInfo> = {
  EU: { code: 'EU', name: 'European Union', supported: true },
  UK: { code: 'UK', name: 'United Kingdom', supported: true },
  USA: { code: 'USA', name: 'United States', supported: false },
  APAC: { code: 'APAC', name: 'Asia Pacific', supported: false },
};

/**
 * Normalize country code to internal identifier
 * Maps common UK inputs to GB
 */
export function normalizeCountryCode(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();
  if (normalized === 'UK') return 'GB';
  return normalized;
}

/**
 * Detect region from country code
 */
export function detectRegion(countryCode: string): Region | null {
  const normalized = normalizeCountryCode(countryCode);
  
  // UK region
  if (normalized === 'GB') return 'UK';
  
  // EU region
  const euCountries = ['DE', 'FR', 'NL', 'PL', 'SE', 'IT', 'BE', 'AT', 'HU', 'ES'];
  if (euCountries.includes(normalized)) return 'EU';
  
  // USA region
  if (normalized === 'US') return 'USA';
  
  // APAC region
  const apacCountries = ['AU', 'IN', 'JP', 'CN', 'SG', 'NZ'];
  if (apacCountries.includes(normalized)) return 'APAC';
  
  return null;
}

/**
 * Check if a region is supported for calculation
 */
export function isRegionSupported(region: Region): boolean {
  return REGIONS[region]?.supported || false;
}
