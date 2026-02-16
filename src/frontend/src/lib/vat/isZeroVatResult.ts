/**
 * Helper to identify when a VATCalculationResult implies an explicitly 0% VAT outcome
 * Used by invoice line-item editor to lock VAT rate to 0 for zero-rated scenarios
 */

import { type VATCalculationResult } from './calculateVat';

/**
 * Check if the VAT calculation result indicates a zero-VAT scenario
 * Returns true for:
 * - UK export zero-rated (uk-export-zero)
 * - Any scenario with explicit 0% VAT rate
 */
export function isZeroVatResult(result: VATCalculationResult): boolean {
  // Check for UK export zero-rated scenario
  if (result.scenario === 'uk-export-zero') {
    return true;
  }
  
  // Check for explicit 0% VAT rate
  if (result.vatRatePercent === 0) {
    return true;
  }
  
  return false;
}
