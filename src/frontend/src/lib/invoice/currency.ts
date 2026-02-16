// Currency helpers for invoice generation
import { lookupVatConfig } from '../vat/vatTable';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  CHF: 'CHF',
};

/**
 * Get the default currency for a country using VAT_TABLE as primary source
 */
export function getCountryCurrency(countryCode: string): CurrencyInfo {
  // Try VAT_TABLE first
  const vatConfig = lookupVatConfig(countryCode);
  if (vatConfig) {
    const currencyCode = vatConfig.currency;
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return { 
      code: currencyCode, 
      symbol, 
      name: currencyCode 
    };
  }
  
  // Fallback to EUR
  return { code: 'EUR', symbol: '€', name: 'Euro' };
}

/**
 * Determine the local currency (for comparison/warning purposes)
 * Uses browser locale as a hint, defaults to EUR
 */
export function getLocalCurrency(): string {
  try {
    const locale = navigator.language || 'en-US';
    const parts = locale.split('-');
    const countryCode = parts[1] || 'DE';
    return getCountryCurrency(countryCode).code;
  } catch {
    return 'EUR';
  }
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Check if currency differs from local currency
 */
export function isDifferentFromLocalCurrency(currencyCode: string): boolean {
  const localCurrency = getLocalCurrency();
  return currencyCode !== localCurrency;
}
