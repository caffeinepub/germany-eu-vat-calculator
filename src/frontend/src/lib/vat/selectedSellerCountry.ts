/**
 * Helper to read and validate seller country from URL search params.
 * Returns null if invalid or missing.
 */
export function getSelectedSellerCountry(searchParams: URLSearchParams): string | null {
  const country = searchParams.get('country');
  
  // Comprehensive null/undefined check
  if (country === null || country === undefined) {
    return null;
  }

  // Type check - ensure it's a string
  if (typeof country !== 'string') {
    console.warn(`Invalid country type: ${typeof country}`);
    return null;
  }

  // Validate country code format (2-3 uppercase letters)
  const trimmed = country.trim();
  
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
    console.warn(`Invalid country value: ${country}`);
    return null;
  }
  
  const normalized = trimmed.toUpperCase();
  
  if (!/^[A-Z]{2,3}$/.test(normalized)) {
    console.warn(`Invalid country code format: ${country}`);
    return null;
  }

  return normalized;
}

/**
 * Sets the seller country in URL search params.
 */
export function setSelectedSellerCountry(
  searchParams: URLSearchParams,
  country: string | null | undefined
): URLSearchParams {
  const newParams = new URLSearchParams(searchParams);
  
  // Comprehensive null/undefined check
  if (country === null || country === undefined) {
    newParams.delete('country');
    return newParams;
  }

  // Type check - ensure it's a string
  if (typeof country !== 'string') {
    console.warn(`Invalid country type for setting: ${typeof country}`);
    newParams.delete('country');
    return newParams;
  }

  const trimmed = country.trim();
  
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
    console.warn(`Invalid country value for setting: ${country}`);
    newParams.delete('country');
    return newParams;
  }
  
  const normalized = trimmed.toUpperCase();
  
  if (!/^[A-Z]{2,3}$/.test(normalized)) {
    console.warn(`Invalid country code format for setting: ${country}`);
    newParams.delete('country');
    return newParams;
  }

  newParams.set('country', normalized);
  return newParams;
}
