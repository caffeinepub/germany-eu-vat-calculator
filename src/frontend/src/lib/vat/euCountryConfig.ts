export interface EUCountryConfig {
  code: string;
  name: string;
  flag: string;
  standardRate: number;
  reducedRates: number[];
  zeroRate?: number;
  invoiceLabel: string;
  reverseChargeText: string;
  configured: boolean;
}

export const EU_COUNTRIES: Record<string, EUCountryConfig> = {
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    standardRate: 19,
    reducedRates: [7],
    invoiceLabel: 'Umsatzsteuer (MwSt)',
    reverseChargeText: 'Reverse charge applies under EU VAT Directive Article 44/196',
    configured: true,
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    standardRate: 20,
    reducedRates: [10, 5.5],
    invoiceLabel: 'TVA',
    reverseChargeText: 'Autoliquidation – Article 283 CGI',
    configured: true,
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    standardRate: 21,
    reducedRates: [9],
    invoiceLabel: 'BTW',
    reverseChargeText: 'BTW verlegd',
    configured: true,
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    standardRate: 23,
    reducedRates: [8, 5],
    invoiceLabel: 'VAT',
    reverseChargeText: 'Odwrotne obciążenie',
    configured: true,
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    standardRate: 25,
    reducedRates: [12, 6],
    invoiceLabel: 'Moms',
    reverseChargeText: 'Omvänd betalningsskyldighet',
    configured: true,
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    standardRate: 22,
    reducedRates: [10, 5, 4],
    invoiceLabel: 'IVA',
    reverseChargeText: 'Inversione contabile',
    configured: true,
  },
  BE: {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    standardRate: 21,
    reducedRates: [12, 6],
    invoiceLabel: 'TVA / BTW',
    reverseChargeText: 'Autoliquidation',
    configured: true,
  },
  AT: {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    standardRate: 20,
    reducedRates: [10, 13],
    invoiceLabel: 'Umsatzsteuer',
    reverseChargeText: 'Reverse-Charge-Verfahren',
    configured: true,
  },
  HU: {
    code: 'HU',
    name: 'Hungary',
    flag: '🇭🇺',
    standardRate: 27,
    reducedRates: [18, 5],
    invoiceLabel: 'ÁFA',
    reverseChargeText: 'Fordított adózás',
    configured: true,
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    standardRate: 21,
    reducedRates: [10, 4],
    invoiceLabel: 'IVA',
    reverseChargeText: 'Inversión del sujeto pasivo',
    configured: true,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    standardRate: 20,
    reducedRates: [5],
    zeroRate: 0,
    invoiceLabel: 'VAT',
    reverseChargeText: 'Reverse charge',
    configured: true,
  },
};

export const COUNTRY_LIST = Object.values(EU_COUNTRIES);

/**
 * Get country configuration by code
 * Normalizes UK -> GB
 */
export function getCountryConfig(countryCode: string): EUCountryConfig | null {
  if (!countryCode) return null;
  
  const normalized = countryCode.trim().toUpperCase();
  
  // UK alias
  if (normalized === 'UK') {
    return EU_COUNTRIES['GB'];
  }
  
  return EU_COUNTRIES[normalized] || null;
}
