// Professional invoice wording auto-switch based on country and VAT label

export function getInvoiceWording(country: string, label: string): string {
  const wording: Record<string, Record<string, string>> = {
    DE: {
      reverse: 'Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)',
    },
    FR: {
      reverse: 'Autoliquidation – Article 283 CGI',
    },
    IT: {
      reverse: 'Inversione contabile – Art. 17 DPR 633/72',
    },
    GB: {
      reverse: 'Reverse charge: Customer to account for VAT',
    },
  };

  // Reverse Charge
  if (label === 'Reverse Charge') {
    return wording[country]?.reverse || 'Reverse charge applies';
  }

  // Exempt
  if (label === 'Exempt') {
    return 'VAT exempt under applicable VAT legislation.';
  }

  // Zero Rated
  if (label === 'Zero Rated') {
    return 'Zero-rated supply under applicable VAT legislation.';
  }

  // Zero Rated Export
  if (label === 'Zero Rated Export') {
    return 'Zero-rated supply under applicable VAT legislation.';
  }

  // Reduced VAT
  if (label === 'Reduced VAT') {
    return 'Reduced VAT rate applied as per national VAT law.';
  }

  // Standard VAT (default)
  return 'Standard VAT applied as per national VAT law.';
}
