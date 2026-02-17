// Category eligibility database for VAT rate determination
// Uses existing ProductCategory type from reducedEligibility.ts

import { type ProductCategory } from './reducedEligibility';

// UK Zero Eligible (0%)
// Mapping: basic_food -> basic-food, childrens_clothing -> children-clothing, 
// printed_media -> newspapers, public_transport -> public-transport
export const UK_ZERO: ProductCategory[] = [
  'basic-food',
  'children-clothing',
  'books',
  'newspapers',
  'public-transport',
];

// UK Reduced (5%)
// Mapping: domestic_fuel -> domestic-fuel, energy_saving_materials -> energy-saving,
// child_car_seats -> child-car-seats
export const UK_REDUCED: ProductCategory[] = [
  'domestic-fuel',
  'energy-saving',
  'child-car-seats',
];

// EU Reduced Eligible (Common Categories)
// Mapping: medicine -> medicines, medical_equipment -> medical-equipment,
// passenger_transport -> passenger-transport, hotel_accommodation -> hotel-accommodation,
// cultural_events -> cultural-events, social_housing_renovation -> social-housing
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

// Exempt categories are handled via special string matching
// financial_services, insurance, education, healthcare, postal_services, social_care
// These will be detected by checking if productCategory is 'others' AND
// the label contains these keywords
export const EXEMPT_CATEGORY_KEYWORDS = [
  'financial',
  'insurance',
  'education',
  'healthcare',
  'postal',
  'social care',
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
 * Check if a product category is exempt
 * For now, we don't have explicit exempt categories in ProductCategory type,
 * so this returns false. Exempt logic should be handled at a higher level.
 */
export function isExemptCategory(productCategory: ProductCategory): boolean {
  // Exempt categories (financial_services, insurance, education, etc.) 
  // are not part of the ProductCategory type.
  // They should be handled via vatCategory === 'exempt' instead.
  return false;
}
