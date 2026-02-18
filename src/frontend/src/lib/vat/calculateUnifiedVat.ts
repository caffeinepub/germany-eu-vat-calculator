import { type VATCalculationInput, type VATCalculationResult } from './calculateVat';
import { VAT_CONFIG } from './vatConfig';
import { determineVATRate } from './determineVatRate';
import { calculateVAT } from './calculateVatAmounts';
import { type ProductCategory } from './reducedEligibility';
import { 
  determineCrossBorderVAT, 
  mapTreatmentToVATRate, 
  getCrossBorderInvoiceWording,
  type SupplyType,
  type CrossBorderVATTreatment
} from './determineCrossBorderVAT';
import { getInvoiceWording } from '../invoice/getInvoiceWording';

/**
 * Smart VAT Engine using cross-border VAT treatment engine.
 * Implements exact priority flow with automatic VAT rate selection.
 */
export function calculateUnifiedVat(input: VATCalculationInput): VATCalculationResult {
  const netAmountCents = Math.round(input.netAmount * 100);
  const netAmount = input.netAmount;
  const sellerCountry = input.sellerCountry;
  const buyerCountry = input.buyerCountry || input.customerCountry;
  const isB2B = input.customerType === 'B2B';
  const vatCategory = input.vatCategory || 'standard';
  const productCategory = (input.productCategory as ProductCategory) || 'others';
  const supplyType: SupplyType = (input.supplyType as SupplyType) || 'services';
  
  // Track if this is an exempt category by identifier
  const exemptIdentifier = (input as any).exemptIdentifier || '';

  // Normalize UK -> GB for both seller and customer
  const normalizedSellerCountry = sellerCountry.toUpperCase() === 'UK' ? 'GB' : sellerCountry;
  const normalizedBuyerCountry = buyerCountry ? (buyerCountry.toUpperCase() === 'UK' ? 'GB' : buyerCountry) : normalizedSellerCountry;

  // Validate country config
  const vatConfig = VAT_CONFIG[normalizedSellerCountry];
  if (!vatConfig) {
    throw new Error(`Country not supported: ${sellerCountry}`);
  }

  // Check if this is a cross-border transaction
  const isCrossBorder = normalizedSellerCountry !== normalizedBuyerCountry;
  const isExport: boolean = input.isExport !== undefined ? Boolean(input.isExport) : isCrossBorder;

  // Determine cross-border VAT treatment
  let crossBorderTreatment: CrossBorderVATTreatment | undefined;
  let vatRatePercent: number;
  
  if (isCrossBorder) {
    crossBorderTreatment = determineCrossBorderVAT({
      sellerCountry: normalizedSellerCountry,
      buyerCountry: normalizedBuyerCountry,
      isB2B,
      supplyType,
    });
    
    // Map treatment to VAT rate
    vatRatePercent = mapTreatmentToVATRate(crossBorderTreatment, vatConfig.standard);
  } else {
    // Domestic transaction - use standard VAT rate determination
    vatRatePercent = determineVATRate({
      country: normalizedSellerCountry,
      vatCategory,
      productCategory: exemptIdentifier || productCategory,
      isExport,
      isB2B,
    });
  }

  // Calculate VAT amounts using the shared formula
  const { vatAmount, total } = calculateVAT(netAmount, vatRatePercent);
  const vatAmountCents = Math.round(vatAmount * 100);
  const grossAmountCents = Math.round(total * 100);

  // Determine scenario, message, and legal note
  let scenario: VATCalculationResult['scenario'] = 'b2c-standard';
  let message = 'Standard VAT';
  let legalNote = getInvoiceWording(normalizedSellerCountry, 'Standard VAT');

  // Handle cross-border treatments
  if (crossBorderTreatment) {
    if (crossBorderTreatment === 'INTRA_EU_SUPPLY_0_PERCENT') {
      scenario = 'intra-eu-supply';
      message = 'Intra-EU Supply (0%)';
      legalNote = getCrossBorderInvoiceWording(crossBorderTreatment);
    } else if (crossBorderTreatment === 'REVERSE_CHARGE') {
      scenario = 'reverse-charge';
      message = 'Reverse Charge (0%)';
      legalNote = getCrossBorderInvoiceWording(crossBorderTreatment);
    } else if (crossBorderTreatment === 'EXPORT_0_PERCENT') {
      scenario = 'uk-export-zero';
      message = 'Export (0%)';
      legalNote = getCrossBorderInvoiceWording(crossBorderTreatment);
    } else if (crossBorderTreatment === 'CHARGE_SELLER_VAT') {
      scenario = 'b2c-standard';
      message = 'Seller VAT';
      legalNote = getInvoiceWording(normalizedSellerCountry, 'Standard VAT');
    }
  } else {
    // Domestic scenarios
    if (vatRatePercent === 0) {
      if (vatCategory === 'reverse' && isB2B && isCrossBorder) {
        scenario = 'reverse-charge';
        message = 'Reverse Charge';
        legalNote = getInvoiceWording(normalizedSellerCountry, 'Reverse Charge');
      } else if (isExport) {
        scenario = 'uk-export-zero';
        message = 'Zero Rated Export';
        legalNote = getInvoiceWording(normalizedSellerCountry, 'Zero Rated Export');
      } else if (vatCategory === 'exempt' || exemptIdentifier) {
        scenario = 'vat-exempt';
        message = 'Exempt';
        legalNote = getInvoiceWording(normalizedSellerCountry, 'Exempt');
      } else if (vatCategory === 'zero') {
        scenario = 'uk-export-zero';
        message = 'Zero Rated';
        legalNote = getInvoiceWording(normalizedSellerCountry, 'Zero Rated');
      }
    } else if (vatRatePercent === vatConfig.reduced) {
      scenario = 'b2c-reduced';
      message = 'Reduced VAT';
      legalNote = getInvoiceWording(normalizedSellerCountry, 'Reduced VAT');
    }
  }

  return {
    netAmountCents,
    vatAmountCents,
    grossAmountCents,
    vatRatePercent,
    legalNote,
    scenario,
    message,
    crossBorderVatTreatment: crossBorderTreatment,
  };
}
