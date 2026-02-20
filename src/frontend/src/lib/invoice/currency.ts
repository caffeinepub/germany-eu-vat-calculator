import { getVatTableEntry } from '../vat/vatTable';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

/**
 * Get currency code for a country using VAT_TABLE as primary source.
 * Returns null if country is undefined/null or not found.
 */
export function getCurrencyForCountry(country: string | null | undefined): string | null {
  if (!country) {
    return null;
  }

  const entry = getVatTableEntry(country);
  return entry?.currency || null;
}

/**
 * Get country currency info (alias for backward compatibility).
 */
export function getCountryCurrency(country: string | null | undefined): CurrencyInfo {
  const currencyCode = getCurrencyForCountry(country);
  
  if (!currencyCode) {
    return { code: 'EUR', symbol: '€', name: 'Euro' };
  }

  const symbol = getCurrencySymbol(currencyCode);
  return { code: currencyCode, symbol, name: currencyCode };
}

/**
 * Format amount with currency symbol.
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is invalid
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol for a currency code.
 */
export function getCurrencySymbol(currency: string): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    
    // Extract symbol by removing digits and spaces
    return formatted.replace(/[\d\s]/g, '');
  } catch (error) {
    return currency;
  }
}
