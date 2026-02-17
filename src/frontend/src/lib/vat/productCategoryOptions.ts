// Product category dropdown options mapping to internal keys for VAT engine
// Uses existing ProductCategory type from reducedEligibility.ts

import { type ProductCategory } from './reducedEligibility';

export interface ProductCategoryOption {
  value: ProductCategory;
  label: string;
  ukOnly?: boolean;
}

// Mapping user requirements to existing ProductCategory types:
// basic_food -> basic-food
// childrens_clothing -> children-clothing
// printed_media -> newspapers
// public_transport -> public-transport
// domestic_fuel -> domestic-fuel
// energy_saving_materials -> energy-saving
// child_car_seats -> child-car-seats
// medicine -> medicines
// medical_equipment -> medical-equipment
// passenger_transport -> passenger-transport
// hotel_accommodation -> hotel-accommodation
// cultural_events -> cultural-events
// social_housing_renovation -> social-housing
// financial_services, insurance, education, healthcare, postal_services, social_care -> handled via exempt logic

export const PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  { value: 'basic-food', label: 'Basic Food' },
  { value: 'books', label: 'Books' },
  { value: 'medicines', label: 'Medical' },
  { value: 'passenger-transport', label: 'Transport' },
  { value: 'hotel-accommodation', label: 'Hotel' },
  { value: 'others', label: 'Financial Services' }, // Exempt category
  { value: 'others', label: 'Insurance' }, // Exempt category
  { value: 'others', label: 'Education' }, // Exempt category
  { value: 'domestic-fuel', label: 'Domestic Fuel (UK)', ukOnly: true },
  { value: 'others', label: 'Others' },
];

// Simplified options to avoid duplicates
export const SIMPLIFIED_PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  { value: 'basic-food', label: 'Basic Food' },
  { value: 'books', label: 'Books' },
  { value: 'medicines', label: 'Medical' },
  { value: 'passenger-transport', label: 'Transport' },
  { value: 'hotel-accommodation', label: 'Hotel' },
  { value: 'domestic-fuel', label: 'Domestic Fuel (UK)', ukOnly: true },
  { value: 'others', label: 'Others' },
];

/**
 * Get filtered options based on country
 */
export function getProductCategoryOptions(countryCode: string): ProductCategoryOption[] {
  const isUK = countryCode === 'GB' || countryCode === 'UK';
  
  if (isUK) {
    return SIMPLIFIED_PRODUCT_CATEGORY_OPTIONS;
  }
  
  // Filter out UK-only options for non-UK countries
  return SIMPLIFIED_PRODUCT_CATEGORY_OPTIONS.filter(opt => !opt.ukOnly);
}
