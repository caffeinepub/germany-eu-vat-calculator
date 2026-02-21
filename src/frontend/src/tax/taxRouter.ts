import { calculateEUVAT } from "./euVatEngine";
import { calculateUKVAT } from "./ukVatEngine";
import { calculateUSTax } from "./usSalesTaxEngine";
import { TaxInput } from "../types/taxTypes";

export interface TaxResult {
  rate: number;
  reason: string;
  amount?: number;
  total?: number;
}

const EU_COUNTRIES = [
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "SE", "PL", "HU"
];

/**
 * Global tax router that decides which tax engine to use
 * based on the seller country.
 */
export function calculateTax(input: TaxInput): TaxResult {
  // UK routing
  if (input.sellerCountry === "GB") {
    return calculateUKVAT(input);
  }

  // EU routing
  if (EU_COUNTRIES.includes(input.sellerCountry)) {
    return calculateEUVAT(input);
  }

  // US routing
  if (input.sellerCountry === "US") {
    return calculateUSTax(input, 0, 0);
  }

  // Unsupported region
  return { 
    rate: 0, 
    reason: "Region not supported yet",
    amount: 0,
    total: input.amount
  };
}
