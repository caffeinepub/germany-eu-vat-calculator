import { type VATCalculationResult } from '../vat/calculateVat';
import { getCountryWording } from './invoiceWording';

export function getAutoLegalVatText(
  scenario: VATCalculationResult['scenario'],
  sellerCountry?: string
): string {
  const country = sellerCountry || 'DE';
  
  switch (scenario) {
    case 'kleinunternehmer':
      return 'Steuerfreie Leistung gemäß §19 Abs. 1 UStG (Kleinunternehmerregelung). Es wird keine Umsatzsteuer berechnet.\n\nTax-exempt service under §19 (1) UStG (small business regulation). No VAT is charged.';
    
    case 'reverse-charge':
      return getCountryWording(country, 'reverse');
    
    case 'vat-exempt':
      return getCountryWording(country, 'exempt');
    
    case 'intra-eu-supply':
      return 'Intra-Community supply – zero-rated under Article 138 of Council Directive 2006/112/EC.\n\nInnergemeinschaftliche Lieferung – steuerfrei gemäß Artikel 138 der Richtlinie 2006/112/EG.';
    
    case 'digital-b2c-eu':
      return 'VAT charged under the One-Stop-Shop (OSS) scheme for digital services to EU consumers.\n\nUmsatzsteuer wird im Rahmen der One-Stop-Shop (OSS) Regelung für digitale Dienstleistungen an EU-Verbraucher erhoben.';
    
    // UK-specific scenarios
    case 'uk-export-zero':
      return 'Zero-rated export under UK VAT legislation.';
    
    case 'uk-reverse-charge':
      return getCountryWording('United Kingdom', 'reverse');
    
    case 'uk-exempt':
      return getCountryWording('United Kingdom', 'exempt');
    
    case 'uk-domestic':
      return ''; // No special legal text needed for standard UK domestic transactions
    
    default:
      return '';
  }
}
