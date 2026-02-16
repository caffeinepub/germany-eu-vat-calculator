import { type UkTransactionInput, type UkVatResult } from './ukTypes';

/**
 * Calculate UK VAT based on transaction details
 * Implements the rules:
 * - Goods Export → Zero Rated (0% VAT)
 * - Service to EU Business → Reverse Charge (0% VAT)
 * - Exempt → Separate treatment
 */
export function calculateUkVat(input: UkTransactionInput): UkVatResult {
  const netAmountCents = Math.round(input.netAmount * 100);

  // CASE 1: Goods Export → Zero Rated
  if (input.transactionType === 'goods-export') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      scenario: 'uk-export-zero',
      vatType: 'Zero Rated',
      message: 'Zero-rated export under UK VAT legislation.',
    };
  }

  // CASE 2: Service to EU Business → Reverse Charge
  if (input.transactionType === 'service-eu-business' && input.customerType === 'business-eu') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      scenario: 'uk-reverse-charge',
      vatType: 'Reverse Charge',
      message: 'Reverse charge – customer to account for VAT.',
    };
  }

  // CASE 3: Exempt (user-selected)
  if (input.vatCategory === 'exempt') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      scenario: 'uk-exempt',
      vatType: 'Exempt',
      message: 'VAT Exempt Supply',
    };
  }

  // CASE 4: Service to EU Consumer (simplified/basic mode - zero rated)
  if (input.transactionType === 'service-eu-consumer') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      scenario: 'uk-export-zero',
      vatType: 'Zero Rated',
      message: 'Export to EU consumer – Zero rated (basic mode)',
    };
  }

  // CASE 5: International Sale (Non-EU) - zero rated
  if (input.transactionType === 'international-sale') {
    return {
      netAmountCents,
      vatAmountCents: 0,
      grossAmountCents: netAmountCents,
      vatRatePercent: 0,
      scenario: 'uk-export-zero',
      vatType: 'Zero Rated',
      message: 'Zero-rated export under UK VAT legislation.',
    };
  }

  // CASE 6: Domestic UK Sale - Apply selected VAT rate
  let vatRate = 20; // Default standard rate
  let vatType: 'Standard' | 'Reduced' | 'Zero Rated' = 'Standard';
  
  switch (input.vatCategory) {
    case 'standard-20':
    case 'other-standard':
      vatRate = 20;
      vatType = 'Standard';
      break;
    case 'reduced-5':
      vatRate = 5;
      vatType = 'Reduced';
      break;
    case 'zero-0':
      vatRate = 0;
      vatType = 'Zero Rated';
      break;
  }

  const vatAmountCents = Math.round(netAmountCents * (vatRate / 100));
  const grossAmountCents = netAmountCents + vatAmountCents;

  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent: vatRate,
    scenario: 'uk-domestic',
    vatType,
    message: `UK domestic transaction with ${vatRate}% VAT`,
  };
}
