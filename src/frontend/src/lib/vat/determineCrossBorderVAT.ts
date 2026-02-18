/**
 * Cross-border VAT treatment engine for EU and UK
 * Determines the correct VAT treatment based on seller/buyer countries, B2B/B2C, and supply type
 */

export type SupplyType = 'goods' | 'services';

export type CrossBorderVATTreatment =
  | 'DOMESTIC_VAT'
  | 'INTRA_EU_SUPPLY_0_PERCENT'
  | 'EXPORT_0_PERCENT'
  | 'REVERSE_CHARGE'
  | 'CHARGE_SELLER_VAT';

export interface CrossBorderVATInput {
  sellerCountry: string;
  buyerCountry: string;
  isB2B: boolean;
  supplyType: SupplyType;
}

/**
 * Determines cross-border VAT treatment using exact EU list and UK rules
 */
export function determineCrossBorderVAT({
  sellerCountry,
  buyerCountry,
  isB2B,
  supplyType,
}: CrossBorderVATInput): CrossBorderVATTreatment {
  // Exact EU country list as specified
  const isEU = ['DE', 'FR', 'NL', 'PL', 'SE', 'IT', 'BE', 'AT', 'HU', 'ES'];

  const sellerIsEU = isEU.includes(sellerCountry);
  const buyerIsEU = isEU.includes(buyerCountry);

  const sellerIsUK = sellerCountry === 'GB';
  const buyerIsUK = buyerCountry === 'GB';

  const isDomestic = sellerCountry === buyerCountry;

  // 1️⃣ Domestic
  if (isDomestic) {
    return 'DOMESTIC_VAT';
  }

  // 2️⃣ EU to EU
  if (sellerIsEU && buyerIsEU) {
    if (isB2B) {
      if (supplyType === 'goods') {
        return 'INTRA_EU_SUPPLY_0_PERCENT';
      }
      if (supplyType === 'services') {
        return 'REVERSE_CHARGE';
      }
    }
    return 'CHARGE_SELLER_VAT';
  }

  // 3️⃣ EU to UK or UK to EU
  if ((sellerIsEU && buyerIsUK) || (sellerIsUK && buyerIsEU)) {
    if (supplyType === 'goods') {
      return 'EXPORT_0_PERCENT';
    }
    if (supplyType === 'services' && isB2B) {
      return 'REVERSE_CHARGE';
    }
  }

  // 4️⃣ Rest of World
  return 'EXPORT_0_PERCENT';
}

/**
 * Maps cross-border VAT treatment to VAT rate percentage
 */
export function mapTreatmentToVATRate(
  treatment: CrossBorderVATTreatment,
  domesticRate: number
): number {
  switch (treatment) {
    case 'DOMESTIC_VAT':
      return domesticRate;
    case 'CHARGE_SELLER_VAT':
      return domesticRate;
    case 'INTRA_EU_SUPPLY_0_PERCENT':
    case 'EXPORT_0_PERCENT':
    case 'REVERSE_CHARGE':
      return 0;
    default:
      return domesticRate;
  }
}

/**
 * Gets professional invoice wording for cross-border VAT treatment
 */
export function getCrossBorderInvoiceWording(
  treatment: CrossBorderVATTreatment
): string {
  switch (treatment) {
    case 'INTRA_EU_SUPPLY_0_PERCENT':
      return 'VAT exempt intra-Community supply under Article 138 EU VAT Directive.';
    case 'REVERSE_CHARGE':
      return 'Reverse charge applies — customer to account for VAT.';
    case 'EXPORT_0_PERCENT':
      return 'Zero-rated export outside VAT territory.';
    case 'DOMESTIC_VAT':
    case 'CHARGE_SELLER_VAT':
    default:
      return '';
  }
}

/**
 * Gets display label for cross-border VAT treatment
 */
export function getCrossBorderDisplayLabel(
  treatment: CrossBorderVATTreatment
): string {
  switch (treatment) {
    case 'INTRA_EU_SUPPLY_0_PERCENT':
      return 'Intra-EU Supply (0%)';
    case 'REVERSE_CHARGE':
      return 'Reverse Charge (0%)';
    case 'EXPORT_0_PERCENT':
      return 'Export (0%)';
    case 'DOMESTIC_VAT':
      return 'Domestic VAT';
    case 'CHARGE_SELLER_VAT':
      return 'Seller VAT';
    default:
      return 'Standard VAT';
  }
}
