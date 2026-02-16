// VAT category logic for invoice line items

import { type VatCategory } from '../vat/vatCategoryRateRules';

export interface VatCategoryNote {
  category: VatCategory;
  noteText: string;
  isWarning: boolean; // true for warnings, false for required notes
}

/**
 * Get the required note text for a VAT category
 */
export function getVatCategoryNote(
  category: VatCategory,
  vatRate: number
): VatCategoryNote | null {
  // Reduced rate warning
  if (vatRate > 0 && vatRate < 15 && category !== 'standard') {
    return {
      category,
      noteText: 'Reduced VAT applies only to qualifying goods/services.',
      isWarning: true,
    };
  }

  return null;
}

/**
 * Get required notes for special VAT scenarios
 */
export function getSpecialVatScenarioNote(
  scenario: string
): string | null {
  switch (scenario) {
    case 'zero-rate':
      return 'Zero-rated supply under EU VAT Directive.';
    case 'reverse-charge':
      return 'Reverse charge – VAT to be accounted for by the customer.';
    case 'vat-exempt':
      return 'VAT exempt supply under applicable VAT legislation.';
    default:
      return null;
  }
}

/**
 * Aggregate all required notes for an invoice
 */
export function aggregateInvoiceNotes(
  lineItemCategories: Array<{ category: VatCategory; vatRate: number }>,
  scenario: string
): string[] {
  const notes: string[] = [];
  const seenWarnings = new Set<string>();

  // Add line item warnings
  for (const item of lineItemCategories) {
    const note = getVatCategoryNote(item.category, item.vatRate);
    if (note && note.isWarning && !seenWarnings.has(note.noteText)) {
      notes.push(note.noteText);
      seenWarnings.add(note.noteText);
    }
  }

  // Add special scenario note
  const scenarioNote = getSpecialVatScenarioNote(scenario);
  if (scenarioNote) {
    notes.push(scenarioNote);
  }

  return notes;
}
