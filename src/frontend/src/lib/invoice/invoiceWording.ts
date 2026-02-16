// Country-specific invoice wording for Reverse Charge and Exempt scenarios

export interface CountryWording {
  reverse: string;
  exempt: string;
}

export const WORDING: Record<string, CountryWording> = {
  Germany: {
    reverse: 'Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG).',
    exempt: 'Steuerfreie Leistung gemäß § 4 UStG.',
  },
  DE: {
    reverse: 'Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG).',
    exempt: 'Steuerfreie Leistung gemäß § 4 UStG.',
  },
  France: {
    reverse: 'Autoliquidation – TVA due par le preneur.',
    exempt: 'Exonération de TVA selon CGI.',
  },
  FR: {
    reverse: 'Autoliquidation – TVA due par le preneur.',
    exempt: 'Exonération de TVA selon CGI.',
  },
  Italy: {
    reverse: 'Inversione contabile.',
    exempt: 'Operazione esente art.10 DPR 633/72.',
  },
  IT: {
    reverse: 'Inversione contabile.',
    exempt: 'Operazione esente art.10 DPR 633/72.',
  },
  'United Kingdom': {
    reverse: 'Reverse charge – customer to account for VAT.',
    exempt: 'VAT exempt supply under UK legislation.',
  },
  GB: {
    reverse: 'Reverse charge – customer to account for VAT.',
    exempt: 'VAT exempt supply under UK legislation.',
  },
  UK: {
    reverse: 'Reverse charge – customer to account for VAT.',
    exempt: 'VAT exempt supply under UK legislation.',
  },
};

/**
 * Get country-specific wording for a scenario
 * Falls back to generic text if country not found
 */
export function getCountryWording(
  sellerCountry: string,
  scenario: 'reverse' | 'exempt'
): string {
  const wording = WORDING[sellerCountry];
  
  if (wording) {
    return wording[scenario];
  }
  
  // Fallback to generic wording
  if (scenario === 'reverse') {
    return 'Reverse charge applies under EU VAT Directive Article 44/196';
  } else {
    return 'VAT exempt supply under applicable VAT legislation.';
  }
}
