import { getInvoiceWording } from './getInvoiceWording';
import { getCrossBorderInvoiceWording } from '../vat/determineCrossBorderVAT';

/**
 * Auto-generates professional legal VAT text for all scenarios
 * using country-specific wording from invoiceWording module
 * with seller country parameter.
 * 
 * Prioritizes cross-border VAT treatment wording when applicable.
 */
export function getAutoLegalVatText(
  scenario: string,
  sellerCountry: string,
  crossBorderTreatment?: string
): string {
  // Prioritize cross-border treatment wording
  if (crossBorderTreatment) {
    const crossBorderWording = getCrossBorderInvoiceWording(crossBorderTreatment as any);
    if (crossBorderWording) {
      return crossBorderWording;
    }
  }

  // Fallback to scenario-based wording
  switch (scenario) {
    case 'reverse-charge':
    case 'uk-reverse-charge':
      return getInvoiceWording(sellerCountry, 'Reverse Charge');
    
    case 'vat-exempt':
    case 'uk-exempt':
      return getInvoiceWording(sellerCountry, 'Exempt');
    
    case 'uk-export-zero':
      return getInvoiceWording(sellerCountry, 'Zero Rated Export');
    
    case 'intra-eu-supply':
      return 'VAT exempt intra-Community supply under Article 138 EU VAT Directive.';
    
    case 'kleinunternehmer':
      return 'VAT exempt under §19 UStG (German small business regulation).';
    
    case 'digital-b2c-eu':
      return 'Digital service subject to customer country VAT rate or OSS scheme.';
    
    case 'b2c-reduced':
      return getInvoiceWording(sellerCountry, 'Reduced VAT');
    
    case 'b2c-standard':
    default:
      return getInvoiceWording(sellerCountry, 'Standard VAT');
  }
}
