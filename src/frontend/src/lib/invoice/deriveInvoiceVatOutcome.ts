// Invoice VAT outcome derivation for invoice persistence and display
// Computes VAT rate, amount, label, and currency from VAT calculation results

import { lookupVatConfig } from '../vat/vatTable';
import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';

export interface InvoiceVatOutcome {
  vatRate: number;
  vatAmount: number;
  vatLabel: string;
  currency: string;
  note?: string;
}

/**
 * Derive invoice VAT outcome from calculation result
 * Uses the canonical VAT result from the unified engine
 */
export function deriveInvoiceVatOutcome(
  input: VATCalculationInput,
  result: VATCalculationResult,
  netAmount: number
): InvoiceVatOutcome {
  const sellerCountry = input.sellerCountry || 'DE';
  
  // Lookup VAT config for seller country
  const vatConfig = lookupVatConfig(sellerCountry);
  
  // If VAT config is not found, return explicit error state
  if (!vatConfig) {
    return {
      vatRate: 0,
      vatAmount: 0,
      vatLabel: 'Error',
      currency: 'EUR',
      note: `Seller country "${sellerCountry}" is not supported for VAT calculation.`,
    };
  }
  
  const currency = vatConfig.currency;
  
  // Use the result from the unified VAT engine
  const vatRate = result.vatRatePercent;
  const vatAmount = result.vatAmountCents / 100;
  
  // Derive label from scenario and message
  let vatLabel = result.message || 'Standard VAT';
  
  // Map scenario to canonical labels
  if (result.scenario === 'reverse-charge' || result.scenario === 'uk-reverse-charge') {
    vatLabel = 'Reverse Charge';
  } else if (result.scenario === 'vat-exempt' || result.scenario === 'uk-exempt') {
    vatLabel = 'Exempt';
  } else if (result.scenario === 'uk-export-zero' && result.message === 'Zero Rated Export') {
    vatLabel = 'Zero Rated Export';
  } else if (result.scenario === 'uk-export-zero' && result.message === 'Zero Rated') {
    vatLabel = 'Zero Rated';
  } else if (result.scenario === 'b2c-reduced') {
    vatLabel = 'Reduced VAT';
  } else if (result.scenario === 'b2c-standard') {
    vatLabel = 'Standard VAT';
  }
  
  return {
    vatRate,
    vatAmount,
    vatLabel,
    currency,
  };
}
