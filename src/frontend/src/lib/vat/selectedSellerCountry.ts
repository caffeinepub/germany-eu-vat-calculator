// Helper to read and validate the seller country from URL query parameter

import { lookupVatConfig, getSupportedCountryCodes } from './vatTable';

export interface SelectedSellerCountryResult {
  countryCode: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Read the 'country' query parameter from URL and validate it
 * Returns normalized country code (e.g., UK -> GB) with fallback to DE
 */
export function getSelectedSellerCountry(): SelectedSellerCountryResult {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const countryParam = urlParams.get('country');
    
    // No country param - default to DE
    if (!countryParam) {
      return {
        countryCode: 'DE',
        isValid: true,
      };
    }
    
    // Normalize to uppercase
    const normalized = countryParam.trim().toUpperCase();
    
    // UK alias
    const countryCode = normalized === 'UK' ? 'GB' : normalized;
    
    // Validate against VAT_TABLE
    const vatConfig = lookupVatConfig(countryCode);
    
    if (!vatConfig) {
      const supported = getSupportedCountryCodes().join(', ');
      return {
        countryCode: 'DE', // Fallback
        isValid: false,
        errorMessage: `Country "${countryParam}" is not supported. Supported countries: ${supported}`,
      };
    }
    
    return {
      countryCode,
      isValid: true,
    };
  } catch (error) {
    return {
      countryCode: 'DE',
      isValid: false,
      errorMessage: 'Failed to read country parameter from URL',
    };
  }
}
