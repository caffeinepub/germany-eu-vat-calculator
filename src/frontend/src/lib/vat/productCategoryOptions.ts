// Product category dropdown options mapping to internal keys for VAT engine
// Uses existing ProductCategory type from reducedEligibility.ts

import { type ProductCategory } from './reducedEligibility';

export interface ProductCategoryOption {
  value: ProductCategory;
  label: string;
  ukOnly?: boolean;
  exemptIdentifier?: string; // For exempt categories
}

// Exact UX list as specified
export const PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  { value: 'basic-food', label: 'Basic Food' },
  { value: 'books', label: 'Books' },
  { value: 'medicines', label: 'Medical' },
  { value: 'passenger-transport', label: 'Transport' },
  { value: 'hotel-accommodation', label: 'Hotel' },
  { value: 'others', label: 'Financial Services', exemptIdentifier: 'financial-services' },
  { value: 'others', label: 'Insurance', exemptIdentifier: 'insurance' },
  { value: 'others', label: 'Education', exemptIdentifier: 'education' },
  { value: 'domestic-fuel', label: 'Domestic Fuel (UK)', ukOnly: true },
  { value: 'others', label: 'Others' },
];

/**
 * Get filtered options based on country
 */
export function getProductCategoryOptions(countryCode: string): ProductCategoryOption[] {
  const isUK = countryCode === 'GB' || countryCode === 'UK';
  
  if (!isUK) {
    // Filter out UK-only options for non-UK countries
    return PRODUCT_CATEGORY_OPTIONS.filter(opt => !opt.ukOnly);
  }
  
  return PRODUCT_CATEGORY_OPTIONS;
}
