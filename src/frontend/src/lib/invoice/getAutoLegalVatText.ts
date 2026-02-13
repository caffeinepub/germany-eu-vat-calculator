import { type VATCalculationResult } from '../vat/calculateVat';

export function getAutoLegalVatText(scenario: VATCalculationResult['scenario']): string {
  switch (scenario) {
    case 'kleinunternehmer':
      return 'Steuerfreie Leistung gemäß §19 Abs. 1 UStG (Kleinunternehmerregelung). Es wird keine Umsatzsteuer berechnet.\n\nTax-exempt service under §19 (1) UStG (small business regulation). No VAT is charged.';
    
    case 'reverse-charge':
      return 'Steuerschuldnerschaft des Leistungsempfängers gemäß §13b UStG. Der Leistungsempfänger schuldet die Umsatzsteuer.\n\nReverse charge applies under §13b UStG (Article 196 EU VAT Directive). The recipient is liable for VAT.';
    
    case 'vat-exempt':
      return 'Steuerfreie Leistung gemäß [Artikel/Paragraph einfügen]. Diese Leistung ist von der Umsatzsteuer befreit.\n\nVAT-exempt service under [insert Article/Paragraph]. This service is exempt from VAT.';
    
    case 'intra-eu-supply':
      return 'Innergemeinschaftliche Lieferung gemäß §4 Nr. 1b UStG i.V.m. §6a UStG. Steuerfreie Lieferung innerhalb der EU.\n\nIntra-Community supply under §4 No. 1b UStG in conjunction with §6a UStG. Tax-free delivery within the EU.';
    
    case 'digital-b2c-eu':
      return 'Elektronisch erbrachte Dienstleistung an Privatperson in der EU. Es gilt die Umsatzsteuer des Bestimmungslandes gemäß Art. 58 MwStSystRL.\n\nElectronically supplied service to EU consumer. The VAT rate of the destination country applies under Article 58 VAT Directive.';
    
    case 'b2c-standard':
      return 'Umsatzsteuer gemäß §12 Abs. 1 UStG zum Regelsteuersatz.\n\nVAT charged at the standard rate under §12 (1) UStG.';
    
    case 'b2c-reduced':
      return 'Umsatzsteuer gemäß §12 Abs. 2 UStG zum ermäßigten Steuersatz.\n\nVAT charged at the reduced rate under §12 (2) UStG.';
    
    default:
      return '';
  }
}
