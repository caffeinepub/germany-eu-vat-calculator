/**
 * VAT amount calculation helper.
 * Implements the exact formula: vatAmount = netAmount * rate / 100; total = netAmount + vatAmount
 */

export interface VatAmounts {
  rate: number;
  vatAmount: number;
  total: number;
}

/**
 * Calculate VAT amount and total from net amount and rate.
 * Uses the exact formula specified by the user.
 */
export function calculateVAT(netAmount: number, rate: number): VatAmounts {
  const vatAmount = (netAmount * rate) / 100;
  const total = netAmount + vatAmount;

  return {
    rate,
    vatAmount,
    total,
  };
}
