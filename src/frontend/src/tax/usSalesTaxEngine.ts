import { TaxInput } from "../types/taxTypes";
import { US_STATES } from "../config/usStates";

export interface TaxResult {
  rate: number;
  reason: string;
  amount?: number;
  total?: number;
}

/**
 * US Sales Tax calculation engine implementing:
 * - Economic nexus logic
 * - Destination-based sales tax
 */
export function calculateUSTax(
  input: TaxInput,
  annualRevenue: number,
  transactions: number
): TaxResult {
  const state = US_STATES[input.buyerState || ""];

  if (!state) {
    return { 
      rate: 0, 
      reason: "State not supported yet",
      amount: 0,
      total: input.amount
    };
  }

  // Economic Nexus
  if (
    annualRevenue > state.nexusRevenue ||
    transactions > state.nexusTransactions
  ) {
    const taxAmount = (input.amount * state.taxRate) / 100;
    return {
      rate: state.taxRate,
      reason: "Economic Nexus Triggered",
      amount: taxAmount,
      total: input.amount + taxAmount
    };
  }

  return {
    rate: 0,
    reason: "No Nexus Yet",
    amount: 0,
    total: input.amount
  };
}
