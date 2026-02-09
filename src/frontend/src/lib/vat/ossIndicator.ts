import { type VATCalculationInput } from './calculateVat';

export interface OSSRelevance {
  isRelevant: boolean;
  reason: string;
}

export function checkOSSRelevance(input: VATCalculationInput): OSSRelevance {
  const isDigitalOrSaaS = input.serviceCategory === 'digital' || input.serviceCategory === 'saas';
  const isB2C = input.customerType === 'B2C';
  const isCrossBorderEU = input.customerCountry !== 'DE' && isEUCountry(input.customerCountry);

  if (isDigitalOrSaaS && isB2C && isCrossBorderEU) {
    return {
      isRelevant: true,
      reason: `You're selling digital services to consumers in ${input.customerCountry}. OSS registration simplifies VAT compliance across the EU.`,
    };
  }

  return {
    isRelevant: false,
    reason: '',
  };
}

function isEUCountry(countryCode: string): boolean {
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  return euCountries.includes(countryCode);
}
