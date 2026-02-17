// Country-specific invoice wording for Reverse Charge and Exempt scenarios

export interface CountryWording {
  reverse: string;
  exempt: string;
}

export const WORDING: Record<string, CountryWording> = {
  Germany: {
    reverse: 'Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  DE: {
    reverse: 'Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  France: {
    reverse: 'Autoliquidation – Article 283 CGI',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  FR: {
    reverse: 'Autoliquidation – Article 283 CGI',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  Italy: {
    reverse: 'Inversione contabile – Art. 17 DPR 633/72',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  IT: {
    reverse: 'Inversione contabile – Art. 17 DPR 633/72',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  Netherlands: {
    reverse: 'BTW verlegd',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  NL: {
    reverse: 'BTW verlegd',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  'United Kingdom': {
    reverse: 'Reverse charge: Customer to account for VAT',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  GB: {
    reverse: 'Reverse charge: Customer to account for VAT',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
  },
  UK: {
    reverse: 'Reverse charge: Customer to account for VAT',
    exempt: 'VAT exempt under Article 132 EU VAT Directive.',
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
    return 'VAT exempt under Article 132 EU VAT Directive.';
  }
}
