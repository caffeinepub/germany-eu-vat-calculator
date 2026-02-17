// Shared VAT result builder utility

export interface VatResult {
  rate: number;
  vatAmount: number;
  total: number;
  label: string;
}

/**
 * Build a canonical VAT result
 */
export function buildResult(rate: number, netAmount: number, label: string): VatResult {
  const vatAmount = (netAmount * rate) / 100;
  const total = netAmount + vatAmount;

  return {
    rate,
    vatAmount,
    total,
    label,
  };
}
