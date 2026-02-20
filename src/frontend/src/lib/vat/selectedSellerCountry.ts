/**
 * Helper to read and validate seller country from URL search params.
 * Returns null if invalid or missing.
 */
export function getSelectedSellerCountry(searchParams: URLSearchParams): string | null {
  const country = searchParams.get('country');
  
  // Defensive null/undefined check
  if (!country) {
    return null;
  }

  // Validate country code format (2-3 uppercase letters)
  const normalized = country.trim().toUpperCase();
  
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
  
  // Defensive check before normalization
  if (!country) {
    newParams.delete('country');
    return newParams;
  }

  const normalized = country.trim().toUpperCase();
  
  if (!/^[A-Z]{2,3}$/.test(normalized)) {
    console.warn(`Invalid country code format: ${country}`);
    newParams.delete('country');
    return newParams;
  }

  newParams.set('country', normalized);
  return newParams;
}
