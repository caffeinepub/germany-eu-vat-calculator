/**
 * Cross-border VAT treatment engine.
 * Determines treatment based on country pairs and transaction type.
 */

export type CrossBorderVatTreatment =
  | 'domestic'
  | 'intra-eu-supply'
  | 'reverse-charge'
  | 'export'
  | 'eu-b2c';

// Legacy type alias for backward compatibility
export type CrossBorderVATTreatment = CrossBorderVatTreatment;

export interface CrossBorderVATInput {
  sellerCountry: string;
  buyerCountry: string;
  isB2B: boolean;
  supplyType: 'goods' | 'services';
}

const EU_COUNTRIES = ['DE', 'FR', 'NL', 'PL', 'SE', 'IT', 'BE', 'AT', 'HU', 'ES'];

function isEU(country: string | null | undefined): boolean {
  if (!country) return false;
  const normalized = country.toUpperCase();
  return EU_COUNTRIES.includes(normalized);
}

function isUK(country: string | null | undefined): boolean {
  if (!country) return false;
  const normalized = country.toUpperCase();
  return normalized === 'GB' || normalized === 'UK';
}

function isSameCountry(country1: string | null | undefined, country2: string | null | undefined): boolean {
  if (!country1 || !country2) return false;
  
  const norm1 = country1.toUpperCase();
  const norm2 = country2.toUpperCase();
  
  // Handle UK/GB equivalence
  if ((norm1 === 'GB' || norm1 === 'UK') && (norm2 === 'GB' || norm2 === 'UK')) {
    return true;
  }
  
  return norm1 === norm2;
}

export function determineCrossBorderVAT(
  sellerCountry: string | null | undefined,
  customerCountry: string | null | undefined,
  customerType: 'business' | 'consumer',
  supplyType: 'goods' | 'services',
  vatIdNumber?: string
): CrossBorderVatTreatment {
  // Defensive checks for undefined/null values
  if (!sellerCountry || !customerCountry) {
    throw new Error('Both seller and customer countries are required');
  }

  // Normalize before comparison
  const normalizedSeller = sellerCountry.toUpperCase();
  const normalizedCustomer = customerCountry.toUpperCase();

  // Domestic transaction
  if (isSameCountry(normalizedSeller, normalizedCustomer)) {
    return 'domestic';
  }

  const sellerInEU = isEU(normalizedSeller);
  const customerInEU = isEU(normalizedCustomer);
  const sellerInUK = isUK(normalizedSeller);
  const customerInUK = isUK(normalizedCustomer);

  // B2B with valid VAT ID
  const hasValidVatId = !!vatIdNumber && vatIdNumber.length > 0;

  // Intra-EU B2B with VAT ID
  if (sellerInEU && customerInEU && customerType === 'business' && hasValidVatId) {
    return 'intra-eu-supply';
  }

  // EU to UK or UK to EU B2B with VAT ID
  if ((sellerInEU && customerInUK) || (sellerInUK && customerInEU)) {
    if (customerType === 'business' && hasValidVatId) {
      return 'reverse-charge';
    }
  }

  // Export (outside EU/UK)
  if (!customerInEU && !customerInUK) {
    if (customerType === 'business' && hasValidVatId) {
      return 'reverse-charge';
    }
    return 'export';
  }

  // Intra-EU B2C
  if (sellerInEU && customerInEU && customerType === 'consumer') {
    return 'eu-b2c';
  }

  // Default to domestic (fallback)
  return 'domestic';
}

/**
 * Maps cross-border VAT treatment to VAT rate percentage.
 */
export function mapTreatmentToVATRate(
  treatment: CrossBorderVatTreatment,
  domesticRate: number
): number {
  switch (treatment) {
    case 'domestic':
    case 'eu-b2c':
      return domesticRate;
    case 'intra-eu-supply':
    case 'reverse-charge':
    case 'export':
      return 0;
    default:
      return domesticRate;
  }
}

/**
 * Gets professional invoice wording for cross-border VAT treatment.
 */
export function getCrossBorderInvoiceWording(
  treatment: CrossBorderVatTreatment
): string {
  switch (treatment) {
    case 'intra-eu-supply':
      return 'VAT exempt intra-Community supply under Article 138 EU VAT Directive.';
    case 'reverse-charge':
      return 'Reverse charge applies — customer to account for VAT.';
    case 'export':
      return 'Zero-rated export outside VAT territory.';
    case 'domestic':
    case 'eu-b2c':
    default:
      return '';
  }
}

/**
 * Gets display label for cross-border VAT treatment.
 */
export function getCrossBorderDisplayLabel(
  treatment: CrossBorderVatTreatment
): string {
  switch (treatment) {
    case 'intra-eu-supply':
      return 'Intra-EU Supply (0%)';
    case 'reverse-charge':
      return 'Reverse Charge (0%)';
    case 'export':
      return 'Export (0%)';
    case 'domestic':
      return 'Domestic VAT';
    case 'eu-b2c':
      return 'EU B2C';
    default:
      return 'Standard VAT';
  }
}
