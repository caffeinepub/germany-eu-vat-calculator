// VAT Configuration with rates for all supported countries

export interface VatRates {
  standard: number;
  reduced: number;
  zero?: number;
}

export const VAT_CONFIG: Record<string, VatRates> = {
  DE: { standard: 19, reduced: 7 },
  FR: { standard: 20, reduced: 10 },
  NL: { standard: 21, reduced: 9 },
  PL: { standard: 23, reduced: 8 },
  SE: { standard: 25, reduced: 12 },
  IT: { standard: 22, reduced: 10 },
  BE: { standard: 21, reduced: 6 },
  AT: { standard: 20, reduced: 10 },
  HU: { standard: 27, reduced: 5 },
  ES: { standard: 21, reduced: 10 },
  GB: { standard: 20, reduced: 5, zero: 0 },
};
