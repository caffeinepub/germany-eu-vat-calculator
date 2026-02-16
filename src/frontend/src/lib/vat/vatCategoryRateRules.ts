// VAT Category type and labels
import { lookupVatConfig } from './vatTable';

export type VatCategory =
  | 'standard'
  | 'food'
  | 'books'
  | 'accommodation'
  | 'restaurant'
  | 'transport'
  | 'construction'
  | 'medical'
  | 'cultural'
  | 'utilities'
  | 'others';

export const VAT_CATEGORY_LABELS: Record<VatCategory, string> = {
  standard: 'Standard Goods / Services',
  food: 'Food & Essential Goods',
  books: 'Books & Printed Media',
  accommodation: 'Accommodation & Hospitality',
  restaurant: 'Restaurant Services',
  transport: 'Passenger Transport',
  construction: 'Construction & Renovation (Residential)',
  medical: 'Medical & Social Services',
  cultural: 'Cultural Events',
  utilities: 'Utilities (Electricity / Gas / Water)',
  others: 'Others',
};

export const VAT_CATEGORIES: VatCategory[] = [
  'standard',
  'food',
  'books',
  'accommodation',
  'restaurant',
  'transport',
  'construction',
  'medical',
  'cultural',
  'utilities',
  'others',
];

/**
 * Computes the VAT rate percent for a given country and VAT category.
 * Uses VAT_TABLE for standard rates, implements reduced rate logic for DE, FR, IT, SE, BE, ES.
 * For all other countries or when category is not eligible, returns standard rate from VAT_TABLE.
 */
export function computeVatRateForCategory(
  countryCode: string,
  category: VatCategory,
  standardRate: number
): number {
  // "Others" always returns standard rate
  if (category === 'others' || category === 'standard') {
    return standardRate;
  }

  // Lookup VAT config from VAT_TABLE
  const vatConfig = lookupVatConfig(countryCode);
  const tableStandardRate = vatConfig?.standard || standardRate;
  const tableReducedRate = vatConfig?.reduced || standardRate;

  switch (countryCode) {
    case 'DE':
    case 'Germany':
      return computeGermanyRate(category, tableStandardRate, tableReducedRate);
    case 'FR':
    case 'France':
      return computeFranceRate(category, tableStandardRate, tableReducedRate);
    case 'IT':
    case 'Italy':
      return computeItalyRate(category, tableStandardRate, tableReducedRate);
    case 'SE':
    case 'Sweden':
      return computeSwedenRate(category, tableStandardRate, tableReducedRate);
    case 'BE':
    case 'Belgium':
      return computeBelgiumRate(category, tableStandardRate, tableReducedRate);
    case 'ES':
    case 'Spain':
      return computeSpainRate(category, tableStandardRate, tableReducedRate);
    default:
      // For all other countries, return standard rate from VAT_TABLE
      return tableStandardRate;
  }
}

function computeGermanyRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const eligibleCategories: VatCategory[] = [
    'food',
    'books',
    'accommodation',
    'transport',
    'cultural',
  ];

  if (eligibleCategories.includes(category)) {
    return reducedRate;
  }

  return standardRate;
}

function computeFranceRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const rate10Categories: VatCategory[] = [
    'restaurant',
    'transport',
    'accommodation',
    'construction',
  ];

  const rate5_5Categories: VatCategory[] = [
    'food',
    'books',
    'utilities',
    'medical',
  ];

  if (rate10Categories.includes(category)) {
    return reducedRate; // 10%
  }

  if (rate5_5Categories.includes(category)) {
    return 5.5;
  }

  return standardRate;
}

function computeItalyRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const rate10Categories: VatCategory[] = [
    'restaurant',
    'accommodation',
    'transport',
    'utilities',
    'construction',
  ];

  const rate5Categories: VatCategory[] = ['medical'];

  const rate4Categories: VatCategory[] = ['food', 'books'];

  if (rate10Categories.includes(category)) {
    return reducedRate; // 10%
  }

  if (rate5Categories.includes(category)) {
    return 5;
  }

  if (rate4Categories.includes(category)) {
    return 4;
  }

  return standardRate;
}

function computeSwedenRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const rate12Categories: VatCategory[] = [
    'food',
    'restaurant',
    'accommodation',
  ];

  const rate6Categories: VatCategory[] = [
    'books',
    'transport',
    'cultural',
  ];

  if (rate12Categories.includes(category)) {
    return reducedRate; // 12%
  }

  if (rate6Categories.includes(category)) {
    return 6;
  }

  return standardRate;
}

function computeBelgiumRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const rate12Categories: VatCategory[] = ['restaurant'];

  const rate6Categories: VatCategory[] = [
    'food',
    'books',
    'transport',
    'medical',
    'construction',
    'utilities',
  ];

  if (rate12Categories.includes(category)) {
    return 12;
  }

  if (rate6Categories.includes(category)) {
    return reducedRate; // 6%
  }

  return standardRate;
}

function computeSpainRate(category: VatCategory, standardRate: number, reducedRate: number): number {
  const rate10Categories: VatCategory[] = [
    'restaurant',
    'accommodation',
    'transport',
    'cultural',
    'utilities',
    'construction',
  ];

  const rate4Categories: VatCategory[] = [
    'food',
    'books',
    'medical',
  ];

  if (rate10Categories.includes(category)) {
    return reducedRate; // 10%
  }

  if (rate4Categories.includes(category)) {
    return 4;
  }

  return standardRate;
}
