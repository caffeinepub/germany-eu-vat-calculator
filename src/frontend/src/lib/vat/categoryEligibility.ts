// Category eligibility database for VAT rate determination
// Uses explicit category lists (not keyword matching)

import { type ProductCategory } from './reducedEligibility';

// UK Zero Eligible (0%)
export const UK_ZERO: ProductCategory[] = [
  'basic-food',
  'children-clothing',
  'books',
  'newspapers',
  'public-transport',
];

// UK Reduced (5%)
export const UK_REDUCED: ProductCategory[] = [
  'domestic-fuel',
  'energy-saving',
  'child-car-seats',
];

// EU Reduced Eligible (Common Categories)
export const EU_REDUCED: ProductCategory[] = [
  'basic-food',
  'books',
  'newspapers',
  'medicines',
  'medical-equipment',
  'passenger-transport',
  'hotel-accommodation',
  'cultural-events',
  'social-housing',
];

// Exempt Categories (All Countries)
// These are special categories that map to 'others' in ProductCategory
// but are identified by their label in the dropdown
export const EXEMPT_CATEGORIES: string[] = [
  'financial-services',
  'insurance',
  'education',
  'healthcare',
  'postal-services',
  'social-care',
];

/**
 * Check if a product category is eligible for UK zero rate
 */
export function isUKZeroEligible(productCategory: ProductCategory): boolean {
  return UK_ZERO.includes(productCategory);
}

/**
 * Check if a product category is eligible for UK reduced rate
 */
export function isUKReducedEligible(productCategory: ProductCategory): boolean {
  return UK_REDUCED.includes(productCategory);
}

/**
 * Check if a product category is eligible for EU reduced rate
 */
export function isEUReducedEligible(productCategory: ProductCategory): boolean {
  return EU_REDUCED.includes(productCategory);
}

/**
 * Check if a category identifier is an exempt category
 * This checks against the explicit exempt list
 */
export function isExemptCategory(categoryIdentifier: string): boolean {
  return EXEMPT_CATEGORIES.includes(categoryIdentifier);
}
