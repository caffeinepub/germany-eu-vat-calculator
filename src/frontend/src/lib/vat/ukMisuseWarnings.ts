import { type UkVatCategory } from './ukTypes';

export interface UkMisuseWarning {
  message: string;
  showModal: boolean;
}

/**
 * Check for UK VAT misuse patterns and return appropriate warnings
 */
export function checkUkMisuseWarnings(
  vatCategory: UkVatCategory,
  serviceType?: string
): UkMisuseWarning | null {
  // Reduced rate + Consulting services
  if (vatCategory === 'reduced-5' && serviceType?.toLowerCase().includes('consult')) {
    return {
      message: 'Consulting services typically do not qualify for reduced VAT in the UK.',
      showModal: false,
    };
  }

  // Zero rate + Software
  if (vatCategory === 'zero-0' && serviceType?.toLowerCase().includes('software')) {
    return {
      message: 'Software typically does not qualify for zero-rate VAT in the UK. Zero-rated supplies are limited to specific categories such as food, books, and exports.',
      showModal: true,
    };
  }

  return null;
}
