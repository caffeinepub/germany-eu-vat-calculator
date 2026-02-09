export interface VatRateInfo {
  standard: number;
  reduced: number;
  validFrom: string;
  validTo?: string;
  description: string;
}

const VAT_RATE_HISTORY: VatRateInfo[] = [
  {
    standard: 19,
    reduced: 7,
    validFrom: '2021-01-01',
    description: 'Current standard rates',
  },
  {
    standard: 16,
    reduced: 5,
    validFrom: '2020-07-01',
    validTo: '2020-12-31',
    description: 'COVID-19 temporary reduction',
  },
  {
    standard: 19,
    reduced: 7,
    validFrom: '2007-01-01',
    validTo: '2020-06-30',
    description: 'Standard rates before COVID',
  },
];

export function getCurrentVatRate(rateType: 'standard' | 'reduced'): number {
  const today = new Date();
  return getVatRateForDate(rateType, today);
}

export function getVatRateForDate(rateType: 'standard' | 'reduced', date: Date): number {
  for (const period of VAT_RATE_HISTORY) {
    const validFrom = new Date(period.validFrom);
    const validTo = period.validTo ? new Date(period.validTo) : new Date('2099-12-31');
    
    if (date >= validFrom && date <= validTo) {
      return period[rateType];
    }
  }
  
  // Default to current rates
  return rateType === 'standard' ? 19 : 7;
}

export function checkHistoricalRateDifference(
  invoiceDate: string,
  currentRateType: 'standard' | 'reduced'
): { isDifferent: boolean; historicalRate: number; currentRate: number; description: string } | null {
  const invoiceDateObj = new Date(invoiceDate);
  const today = new Date();
  
  const historicalRate = getVatRateForDate(currentRateType, invoiceDateObj);
  const currentRate = getVatRateForDate(currentRateType, today);
  
  if (historicalRate !== currentRate) {
    const period = VAT_RATE_HISTORY.find(p => {
      const validFrom = new Date(p.validFrom);
      const validTo = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
      return invoiceDateObj >= validFrom && invoiceDateObj <= validTo;
    });
    
    return {
      isDifferent: true,
      historicalRate,
      currentRate,
      description: period?.description || 'Historical rate period',
    };
  }
  
  return null;
}
