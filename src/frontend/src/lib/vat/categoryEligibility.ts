// Category eligibility database for VAT rate determination
// Uses explicit category lists with normalized identifier matching

import { type ProductCategory } from './reducedEligibility';
import { normalizeIdentifier, isInNormalizedList } from './identifierNormalization';

// Exempt Categories (All Countries) - using snake_case as provided by user
export const EXEMPT_CATEGORIES: string[] = [
  'financial_services',
  'insurance',
  'education',
  'healthcare',
  'postal_services',
];

// UK Zero Eligible (0%) - using snake_case as provided by user
export const UK_ZERO: string[] = [
  'basic_food',
  'childrens_clothing',
  'books',
  'printed_media',
  'public_transport',
];

// UK Reduced (5%) - using snake_case as provided by user
export const UK_REDUCED: string[] = [
  'domestic_fuel',
  'energy_saving_materials',
  'child_car_seats',
];

// EU Reduced Eligible (Common Categories) - using snake_case as provided by user
export const EU_REDUCED: string[] = [
  'basic_food',
  'books',
  'printed_media',
  'medicine',
  'medical_equipment',
  'passenger_transport',
  'hotel_accommodation',
  'cultural_events',
];

/**
 * Check if a product category is eligible for UK zero rate.
 * Uses normalized identifier matching to support both snake_case and kebab-case.
 */
export function isUKZeroEligible(productCategory: ProductCategory | string): boolean {
  return isInNormalizedList(productCategory, UK_ZERO);
}

/**
 * Check if a product category is eligible for UK reduced rate.
 * Uses normalized identifier matching to support both snake_case and kebab-case.
 */
export function isUKReducedEligible(productCategory: ProductCategory | string): boolean {
  return isInNormalizedList(productCategory, UK_REDUCED);
}

/**
 * Check if a product category is eligible for EU reduced rate.
 * Uses normalized identifier matching to support both snake_case and kebab-case.
 */
export function isEUReducedEligible(productCategory: ProductCategory | string): boolean {
  return isInNormalizedList(productCategory, EU_REDUCED);
}

/**
 * Check if a category identifier is an exempt category.
 * Uses normalized identifier matching to support both snake_case and kebab-case.
 */
export function isExemptCategory(categoryIdentifier: string): boolean {
  return isInNormalizedList(categoryIdentifier, EXEMPT_CATEGORIES);
}
