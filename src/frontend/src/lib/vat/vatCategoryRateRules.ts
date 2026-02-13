// VAT Category type and labels
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
 * Implements reduced rate logic for DE, FR, IT, SE, BE, ES.
 * For all other countries or when category is not eligible, returns standard rate.
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

  switch (countryCode) {
    case 'DE':
      return computeGermanyRate(category, standardRate);
    case 'FR':
      return computeFranceRate(category, standardRate);
    case 'IT':
      return computeItalyRate(category, standardRate);
    case 'SE':
      return computeSwedenRate(category, standardRate);
    case 'BE':
      return computeBelgiumRate(category, standardRate);
    case 'ES':
      return computeSpainRate(category, standardRate);
    default:
      // For all other countries, return standard rate
      return standardRate;
  }
}

function computeGermanyRate(category: VatCategory, standardRate: number): number {
  // Standard = 19%, Reduced = 7%
  const eligibleCategories: VatCategory[] = [
    'food',
    'books',
    'accommodation',
    'transport',
    'cultural',
  ];

  if (eligibleCategories.includes(category)) {
    return 7;
  }

  return standardRate; // 19%
}

function computeFranceRate(category: VatCategory, standardRate: number): number {
  // Standard = 20%, Reduced = 10% / 5.5%
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
    return 10;
  }

  if (rate5_5Categories.includes(category)) {
    return 5.5;
  }

  return standardRate; // 20%
}

function computeItalyRate(category: VatCategory, standardRate: number): number {
  // Standard = 22%, Reduced = 10% / 5% / 4%
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
    return 10;
  }

  if (rate5Categories.includes(category)) {
    return 5;
  }

  if (rate4Categories.includes(category)) {
    return 4;
  }

  return standardRate; // 22%
}

function computeSwedenRate(category: VatCategory, standardRate: number): number {
  // Standard = 25%, Reduced = 12% / 6%
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
    return 12;
  }

  if (rate6Categories.includes(category)) {
    return 6;
  }

  return standardRate; // 25%
}

function computeBelgiumRate(category: VatCategory, standardRate: number): number {
  // Standard = 21%, Reduced = 12% / 6%
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
    return 6;
  }

  return standardRate; // 21%
}

function computeSpainRate(category: VatCategory, standardRate: number): number {
  // Standard = 21%, Reduced = 10% / 4% (super-reduced)
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
    return 10;
  }

  if (rate4Categories.includes(category)) {
    return 4;
  }

  return standardRate; // 21%
}
