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
 * Calculate VAT based on VAT engine result
 */
function calculateVAT(
  netAmount: number,
  vatType: string,
  standardRate: number,
  reducedRate: number,
  currency: string
): InvoiceVatOutcome {
  // REVERSE CHARGE
  if (vatType === 'reverse') {
    return {
      vatRate: 0,
      vatAmount: 0,
      vatLabel: 'Reverse Charge',
      currency,
    };
  }
  
  // EXEMPT
  if (vatType === 'exempt') {
    return {
      vatRate: 0,
      vatAmount: 0,
      vatLabel: 'Exempt',
      currency,
    };
  }
  
  // REDUCED RATE
  if (vatType === 'reduced') {
    const vatAmount = netAmount * (reducedRate / 100);
    return {
      vatRate: reducedRate,
      vatAmount,
      vatLabel: 'Reduced VAT',
      currency,
    };
  }
  
  // STANDARD RATE (Default)
  const vatAmount = netAmount * (standardRate / 100);
  return {
    vatRate: standardRate,
    vatAmount,
    vatLabel: 'Standard VAT',
    currency,
  };
}

/**
 * Derive invoice VAT outcome from calculation result
 */
export function deriveInvoiceVatOutcome(
  input: VATCalculationInput,
  result: VATCalculationResult,
  netAmount: number
): InvoiceVatOutcome {
  const sellerCountry = input.sellerCountry || 'DE';
  
  // Lookup VAT config for seller country
  const vatConfig = lookupVatConfig(sellerCountry);
  
  // If VAT config is not found, return error state
  if (!vatConfig) {
    return {
      vatRate: 0,
      vatAmount: 0,
      vatLabel: 'Error',
      currency: 'EUR',
      note: `Seller country "${sellerCountry}" is not supported for VAT calculation.`,
    };
  }
  
  const standardRate = vatConfig.standard;
  const reducedRate = vatConfig.reduced;
  const currency = vatConfig.currency;
  
  // Determine VAT type from result scenario
  let vatType = 'standard';
  
  if (input.reverseCharge || result.scenario === 'reverse-charge') {
    vatType = 'reverse';
  } else if (result.scenario === 'vat-exempt' || result.scenario === 'uk-exempt' || input.vatTreatment === 'exempt') {
    vatType = 'exempt';
  } else if (input.vatRate === 'reduced' || input.vatTreatment === 'reduced') {
    vatType = 'reduced';
  }
  
  // Use the VAT engine
  return calculateVAT(netAmount, vatType, standardRate, reducedRate, currency);
}
