// UK-specific types for VAT calculation

export type UkTransactionType = 
  | 'domestic-sale'
  | 'goods-export'
  | 'service-eu-business'
  | 'service-eu-consumer'
  | 'international-sale'
  | 'import-into-uk';

export type UkCustomerType = 
  | 'business-vat-registered'
  | 'business-eu'
  | 'individual-consumer'
  | 'government-charity';

export type UkVatCategory = 
  | 'standard-20'
  | 'reduced-5'
  | 'zero-0'
  | 'exempt'
  | 'other-standard';

export interface UkTransactionInput {
  transactionType: UkTransactionType;
  customerType: UkCustomerType;
  vatCategory: UkVatCategory;
  netAmount: number;
  customerVatId?: string;
}

export type UkVatScenario = 
  | 'uk-domestic' 
  | 'uk-export-zero' 
  | 'uk-reverse-charge' 
  | 'uk-exempt';

export interface UkVatResult {
  netAmountCents: number;
  vatAmountCents: number;
  grossAmountCents: number;
  vatRatePercent: number;
  scenario: UkVatScenario;
  vatType: 'Standard' | 'Reduced' | 'Zero Rated' | 'Reverse Charge' | 'Exempt';
  message: string;
}
