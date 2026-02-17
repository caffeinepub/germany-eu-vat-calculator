// Helper to read and validate the seller country from URL query parameter

import { lookupVatConfig, getSupportedCountryCodes } from './vatTable';

export interface SelectedSellerCountryResult {
  countryCode: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Read the 'country' query parameter from URL and validate it
 * Returns normalized country code (e.g., UK -> GB)
 * If no country param, returns empty string (not DE default) for explicit country selection flow
 */
export function getSelectedSellerCountry(): SelectedSellerCountryResult {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const countryParam = urlParams.get('country');
    
    // No country param - return empty (no default)
    if (!countryParam) {
      return {
        countryCode: '',
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
        countryCode: 'DE', // Fallback for error display
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
