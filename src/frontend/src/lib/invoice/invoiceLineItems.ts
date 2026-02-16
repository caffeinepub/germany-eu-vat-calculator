// Invoice line items data structures and calculations

import { type VatCategory } from '../vat/vatCategoryRateRules';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatCategory: VatCategory;
  vatRate: number; // Computed based on category and country
}

export interface LineItemTotals {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
}

export interface VatRateGroup {
  vatRate: number;
  taxableAmount: number;
  vatAmount: number;
  lineCount: number;
}

/**
 * Calculate totals for a single line item
 */
export function calculateLineItemTotals(
  item: InvoiceLineItem
): LineItemTotals {
  const netAmount = item.quantity * item.unitPrice;
  const vatAmount = netAmount * (item.vatRate / 100);
  const grossAmount = netAmount + vatAmount;

  return {
    netAmount,
    vatAmount,
    grossAmount,
  };
}

/**
 * Calculate aggregate totals from all line items
 */
export function calculateInvoiceTotals(
  items: InvoiceLineItem[]
): LineItemTotals {
  let netAmount = 0;
  let vatAmount = 0;
  let grossAmount = 0;

  for (const item of items) {
    const totals = calculateLineItemTotals(item);
    netAmount += totals.netAmount;
    vatAmount += totals.vatAmount;
    grossAmount += totals.grossAmount;
  }

  return {
    netAmount,
    vatAmount,
    grossAmount,
  };
}

/**
 * Group line items by VAT rate for VAT summary
 */
export function groupLineItemsByVatRate(
  items: InvoiceLineItem[]
): VatRateGroup[] {
  const groups = new Map<number, VatRateGroup>();

  for (const item of items) {
    const totals = calculateLineItemTotals(item);
    const existing = groups.get(item.vatRate);

    if (existing) {
      existing.taxableAmount += totals.netAmount;
      existing.vatAmount += totals.vatAmount;
      existing.lineCount += 1;
    } else {
      groups.set(item.vatRate, {
        vatRate: item.vatRate,
        taxableAmount: totals.netAmount,
        vatAmount: totals.vatAmount,
        lineCount: 1,
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.vatRate - a.vatRate);
}

/**
 * Check if invoice has multiple VAT rates
 */
export function hasMultipleVatRates(items: InvoiceLineItem[]): boolean {
  const uniqueRates = new Set(items.map(item => item.vatRate));
  return uniqueRates.size > 1;
}
