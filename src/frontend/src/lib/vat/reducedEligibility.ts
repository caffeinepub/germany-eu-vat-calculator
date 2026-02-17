// Reduced rate eligibility validation per country

export type ProductCategory =
  | 'food'
  | 'books'
  | 'newspapers'
  | 'medicines'
  | 'medical-equipment'
  | 'passenger-transport'
  | 'hotel-accommodation'
  | 'cultural-events'
  | 'social-housing'
  | 'domestic-fuel'
  | 'energy-saving'
  | 'child-car-seats'
  | 'basic-food'
  | 'children-clothing'
  | 'public-transport'
  | 'others';

export const PRODUCT_CATEGORIES: Array<{ value: ProductCategory; label: string }> = [
  { value: 'food', label: 'Food & beverages (basic)' },
  { value: 'books', label: 'Books (physical)' },
  { value: 'newspapers', label: 'Newspapers' },
  { value: 'medicines', label: 'Medicines' },
  { value: 'medical-equipment', label: 'Medical equipment' },
  { value: 'passenger-transport', label: 'Passenger transport' },
  { value: 'hotel-accommodation', label: 'Hotel accommodation' },
  { value: 'cultural-events', label: 'Cultural events' },
  { value: 'social-housing', label: 'Social housing renovation' },
  { value: 'domestic-fuel', label: 'Domestic fuel (UK)' },
  { value: 'energy-saving', label: 'Energy-saving materials (UK)' },
  { value: 'child-car-seats', label: 'Child car seats (UK)' },
  { value: 'basic-food', label: 'Basic food (UK zero)' },
  { value: 'children-clothing', label: "Children's clothing (UK zero)" },
  { value: 'public-transport', label: 'Public transport (UK zero)' },
  { value: 'others', label: 'Others' },
];

// Common EU reduced-eligible categories
const EU_COMMON_REDUCED: ProductCategory[] = [
  'food',
  'books',
  'newspapers',
  'medicines',
  'medical-equipment',
  'passenger-transport',
  'hotel-accommodation',
  'cultural-events',
  'social-housing',
];

// UK reduced (5%) eligible categories
const UK_REDUCED_5: ProductCategory[] = [
  'domestic-fuel',
  'energy-saving',
  'child-car-seats',
];

// UK zero (0%) eligible categories
const UK_ZERO: ProductCategory[] = [
  'basic-food',
  'children-clothing',
  'books',
  'public-transport',
];

const REDUCED_ELIGIBILITY_MAP: Record<string, ProductCategory[]> = {
  DE: EU_COMMON_REDUCED,
  FR: EU_COMMON_REDUCED,
  NL: EU_COMMON_REDUCED,
  PL: EU_COMMON_REDUCED,
  SE: EU_COMMON_REDUCED,
  IT: EU_COMMON_REDUCED,
  BE: EU_COMMON_REDUCED,
  AT: EU_COMMON_REDUCED,
  HU: EU_COMMON_REDUCED,
  ES: EU_COMMON_REDUCED,
  GB: [...UK_REDUCED_5, ...UK_ZERO],
};

export interface EligibilityResult {
  isEligible: boolean;
  message: string;
}

export function checkReducedEligibility(
  countryCode: string,
  productCategory: ProductCategory
): EligibilityResult {
  // "Others" always falls back to standard
  if (productCategory === 'others') {
    return {
      isEligible: false,
      message: 'Selected category is not eligible for reduced VAT in this country. Standard VAT applied.',
    };
  }

  const eligibleCategories = REDUCED_ELIGIBILITY_MAP[countryCode] || [];
  const isEligible = eligibleCategories.includes(productCategory);

  if (!isEligible) {
    return {
      isEligible: false,
      message: 'Selected category is not eligible for reduced VAT in this country. Standard VAT applied.',
    };
  }

  return {
    isEligible: true,
    message: '',
  };
}

export function getReducedRate(countryCode: string, productCategory: ProductCategory): number | null {
  // UK special handling
  if (countryCode === 'GB') {
    if (UK_REDUCED_5.includes(productCategory)) {
      return 5;
    }
    if (UK_ZERO.includes(productCategory)) {
      return 0;
    }
  }

  // For EU countries, return null to use VAT_TABLE reduced rate
  const eligibleCategories = REDUCED_ELIGIBILITY_MAP[countryCode] || [];
  if (eligibleCategories.includes(productCategory)) {
    return null; // Use VAT_TABLE
  }

  return null;
}
