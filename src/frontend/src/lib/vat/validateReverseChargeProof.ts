export interface ReverseChargeValidation {
  isAllowed: boolean;
  checks: {
    formatValid: boolean;
    countryMatch: boolean;
  };
  explanation: string;
}

/**
 * Validates reverse charge eligibility for B2B cross-border transactions.
 * Works for all supported countries by checking VAT ID prefix against customer country.
 */
export function validateReverseChargeProof(
  vatId: string,
  customerCountry: string,
  customerType: 'B2C' | 'B2B'
): ReverseChargeValidation {
  if (customerType !== 'B2B') {
    return {
      isAllowed: false,
      checks: {
        formatValid: false,
        countryMatch: false,
      },
      explanation: 'Reverse charge only applies to B2B transactions.',
    };
  }

  if (!vatId || vatId.length < 4) {
    return {
      isAllowed: false,
      checks: {
        formatValid: false,
        countryMatch: false,
      },
      explanation: 'VAT ID is required for B2B cross-border validation.',
    };
  }

  // Normalize customer country (UK -> GB)
  const normalizedCustomerCountry = customerCountry.toUpperCase() === 'UK' ? 'GB' : customerCountry.toUpperCase();
  
  // Extract country code from VAT ID (first 2 characters)
  const vatCountryCode = vatId.substring(0, 2).toUpperCase();
  
  // All supported countries for VAT ID validation
  const supportedCountries = [
    // EU countries
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
    'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
    'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
    // UK
    'GB',
    // Other countries with VAT systems
    'CH', 'NO', 'IS'
  ];

  const formatValid = supportedCountries.includes(vatCountryCode) && vatId.length >= 4;
  const countryMatch = vatCountryCode === normalizedCustomerCountry;

  const isAllowed = formatValid && countryMatch;

  let explanation = '';
  if (!formatValid) {
    explanation = 'VAT ID format is invalid or country not supported.';
  } else if (!countryMatch) {
    explanation = `VAT ID country (${vatCountryCode}) does not match customer country (${normalizedCustomerCountry}).`;
  } else {
    explanation = 'VAT ID format is valid and matches customer country. Cross-border B2B transaction validated.';
  }

  return {
    isAllowed,
    checks: {
      formatValid,
      countryMatch,
    },
    explanation,
  };
}
