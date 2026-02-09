export interface ReverseChargeValidation {
  isValid: boolean;
  checks: {
    vatIdFormat: { passed: boolean; message: string };
    countryMatch: { passed: boolean; message: string };
  };
  conclusion: 'allowed' | 'not-allowed';
  explanation: string;
}

export function validateReverseChargeProof(
  vatId: string,
  customerCountry: string,
  customerType: 'B2C' | 'B2B'
): ReverseChargeValidation {
  if (customerType !== 'B2B') {
    return {
      isValid: false,
      checks: {
        vatIdFormat: { passed: false, message: 'Not applicable for B2C transactions' },
        countryMatch: { passed: false, message: 'Not applicable for B2C transactions' },
      },
      conclusion: 'not-allowed',
      explanation: 'Reverse charge only applies to B2B transactions',
    };
  }

  const checks = {
    vatIdFormat: validateVatIdFormat(vatId),
    countryMatch: validateCountryMatch(vatId, customerCountry),
  };

  const isValid = checks.vatIdFormat.passed && checks.countryMatch.passed;

  return {
    isValid,
    checks,
    conclusion: isValid ? 'allowed' : 'not-allowed',
    explanation: isValid
      ? 'Reverse charge applies because both parties are VAT-registered in the EU.'
      : 'VAT must be charged. ' + (!checks.vatIdFormat.passed ? checks.vatIdFormat.message : checks.countryMatch.message),
  };
}

function validateVatIdFormat(vatId: string): { passed: boolean; message: string } {
  if (!vatId || vatId.trim().length === 0) {
    return { passed: false, message: 'VAT ID is required for reverse charge' };
  }

  if (vatId.length < 4) {
    return { passed: false, message: 'VAT ID is too short' };
  }

  const countryCode = vatId.substring(0, 2).toUpperCase();
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  if (!euCountries.includes(countryCode)) {
    return { passed: false, message: 'VAT ID must start with a valid EU country code' };
  }

  return { passed: true, message: 'VAT ID format is valid' };
}

function validateCountryMatch(vatId: string, customerCountry: string): { passed: boolean; message: string } {
  if (!vatId || vatId.length < 2) {
    return { passed: false, message: 'Cannot validate country match without VAT ID' };
  }

  const vatIdCountry = vatId.substring(0, 2).toUpperCase();
  const normalizedCustomerCountry = customerCountry.toUpperCase();

  if (vatIdCountry !== normalizedCustomerCountry) {
    return {
      passed: false,
      message: `VAT ID country (${vatIdCountry}) does not match customer country (${normalizedCustomerCountry})`,
    };
  }

  return { passed: true, message: 'VAT ID country matches customer country' };
}
