import { TaxInput } from "../types/taxTypes";

export interface TaxResult {
  rate: number;
  reason: string;
  amount?: number;
  total?: number;
}

const UK_STANDARD = 20;

/**
 * UK VAT calculation engine implementing:
 * - UK Domestic VAT
 * - Export Zero Rated
 * - Import VAT (handled by customs)
 */
export function calculateUKVAT(input: TaxInput): TaxResult {
  // UK Domestic
  if (input.sellerCountry === "GB" && input.buyerCountry === "GB") {
    const vatAmount = (input.amount * UK_STANDARD) / 100;
    return { 
      rate: UK_STANDARD, 
      reason: "UK Domestic VAT",
      amount: vatAmount,
      total: input.amount + vatAmount
    };
  }

  // Export from UK
  if (input.sellerCountry === "GB" && input.buyerCountry !== "GB") {
    return { 
      rate: 0, 
      reason: "Export Zero Rated",
      amount: 0,
      total: input.amount
    };
  }

  // Import VAT handled separately
  return { 
    rate: 0, 
    reason: "Import VAT handled by customs",
    amount: 0,
    total: input.amount
  };
}
