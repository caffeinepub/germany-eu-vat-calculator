export const US_STATES: Record<string, { taxRate: number; nexusRevenue: number; nexusTransactions: number }> = {
  CA: {
    taxRate: 7.25,
    nexusRevenue: 500000,
    nexusTransactions: 0
  },
  TX: {
    taxRate: 6.25,
    nexusRevenue: 500000,
    nexusTransactions: 0
  },
  NY: {
    taxRate: 4,
    nexusRevenue: 500000,
    nexusTransactions: 100
  },
  FL: {
    taxRate: 6,
    nexusRevenue: 100000,
    nexusTransactions: 200
  },
  WA: {
    taxRate: 6.5,
    nexusRevenue: 100000,
    nexusTransactions: 200
  }
};
