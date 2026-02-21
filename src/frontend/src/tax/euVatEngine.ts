import { TaxInput } from "../types/taxTypes";
import { EU_VAT_RATES } from "../config/euVatRates";

export interface TaxResult {
  rate: number;
  reason: string;
  amount?: number;
  total?: number;
}

/**
 * EU VAT calculation engine implementing:
 * - Domestic VAT
 * - Cross-border B2B → Reverse Charge
 * - Cross-border B2C → OSS destination VAT
 * - Digital services VAT (always destination country)
 */
export function calculateEUVAT(input: TaxInput): TaxResult {
  const seller = EU_VAT_RATES[input.sellerCountry];
  const buyer = EU_VAT_RATES[input.buyerCountry];

  if (!seller || !buyer) {
    return { 
      rate: 0, 
      reason: "Outside EU",
      amount: 0,
      total: input.amount
    };
  }

  // B2B Reverse Charge
  if (
    input.customerType === "B2B" &&
    input.sellerCountry !== input.buyerCountry &&
    input.hasValidVATID
  ) {
    return {
      rate: 0,
      reason: "Reverse Charge EU B2B",
      amount: 0,
      total: input.amount
    };
  }

  // Digital Services OSS
  if (
    input.productType === "DIGITAL_SERVICES" ||
    input.productType === "SAAS" ||
    input.productType === "EBOOK"
  ) {
    const vatAmount = (input.amount * buyer.standard) / 100;
    return {
      rate: buyer.standard,
      reason: "EU OSS Digital VAT",
      amount: vatAmount,
      total: input.amount + vatAmount
    };
  }

  // Cross-border B2C OSS
  if (
    input.customerType === "B2C" &&
    input.sellerCountry !== input.buyerCountry
  ) {
    const vatAmount = (input.amount * buyer.standard) / 100;
    return {
      rate: buyer.standard,
      reason: "EU OSS B2C VAT",
      amount: vatAmount,
      total: input.amount + vatAmount
    };
  }

  // Domestic VAT
  const vatAmount = (input.amount * seller.standard) / 100;
  return {
    rate: seller.standard,
    reason: "Domestic VAT",
    amount: vatAmount,
    total: input.amount + vatAmount
  };
}
