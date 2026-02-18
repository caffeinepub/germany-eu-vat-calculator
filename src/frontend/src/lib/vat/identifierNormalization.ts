/**
 * Identifier normalization helpers for VAT/product category identifiers.
 * Ensures consistent eligibility checks regardless of identifier format (snake_case vs kebab-case).
 */

/**
 * Normalize a category identifier to a canonical form for eligibility checks.
 * Converts to lowercase, trims whitespace, and converts underscores to hyphens.
 */
export function normalizeIdentifier(identifier: string): string {
  return identifier.toLowerCase().trim().replace(/_/g, '-');
}

/**
 * Check if two identifiers match after normalization.
 */
export function identifiersMatch(id1: string, id2: string): boolean {
  return normalizeIdentifier(id1) === normalizeIdentifier(id2);
}

/**
 * Check if an identifier is in a list after normalization.
 */
export function isInNormalizedList(identifier: string, list: string[]): boolean {
  const normalized = normalizeIdentifier(identifier);
  return list.some(item => normalizeIdentifier(item) === normalized);
}
