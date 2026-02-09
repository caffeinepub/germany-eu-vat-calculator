import { type VATCalculationResult } from '../vat/calculateVat';

export function getAutoLegalVatText(scenario: VATCalculationResult['scenario']): string {
  switch (scenario) {
    case 'kleinunternehmer':
      return 'Steuerfreie Leistung gemäß §19 Abs. 1 UStG (Kleinunternehmerregelung). Es wird keine Umsatzsteuer berechnet.';
    
    case 'reverse-charge':
      return 'Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)\nTax liability of the recipient of services (§13b UStG)';
    
    case 'intra-eu-supply':
      return 'Innergemeinschaftliche Lieferung gemäß §4 Nr. 1b UStG i.V.m. §6a UStG. Steuerfreie Lieferung innerhalb der EU.';
    
    case 'digital-b2c-eu':
      return 'Elektronisch erbrachte Dienstleistung an Privatperson in der EU. Es gilt die Umsatzsteuer des Bestimmungslandes.';
    
    case 'b2c-standard':
    case 'b2c-reduced':
    default:
      return '';
  }
}
