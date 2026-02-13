export interface ReverseChargeValidation {
  isAllowed: boolean;
  checks: {
    formatValid: boolean;
    countryMatch: boolean;
  };
  explanation: string;
}

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

  const vatCountryCode = vatId.substring(0, 2).toUpperCase();
  const euCountries = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
    'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
    'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ];

  const formatValid = euCountries.includes(vatCountryCode) && vatId.length >= 4;
  const countryMatch = vatCountryCode === customerCountry.toUpperCase();

  const isAllowed = formatValid && countryMatch;

  let explanation = '';
  if (!formatValid) {
    explanation = 'VAT ID format is invalid or not from an EU country.';
  } else if (!countryMatch) {
    explanation = `VAT ID country (${vatCountryCode}) does not match customer country (${customerCountry}).`;
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
