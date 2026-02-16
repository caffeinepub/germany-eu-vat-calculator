import { type UkVatResult } from './ukTypes';

/**
 * Generate UK-specific VAT explanation
 */
export function explainUkVat(result: UkVatResult): string {
  switch (result.scenario) {
    case 'uk-domestic':
      if (result.vatRatePercent === 20) {
        return 'This is a domestic UK transaction subject to the standard VAT rate of 20%. VAT is added to the net amount and payable to HMRC.\n\nThe standard rate applies to most goods and services in the UK unless a specific reduced rate or exemption applies.';
      } else if (result.vatRatePercent === 5) {
        return 'This is a domestic UK transaction subject to the reduced VAT rate of 5%. VAT is added to the net amount and payable to HMRC.\n\nThe reduced rate applies to specific goods and services such as home energy, energy-saving materials, and children\'s car seats.';
      } else if (result.vatRatePercent === 0) {
        return 'This is a domestic UK transaction with a zero VAT rate. No VAT is charged, but the supply is still within the VAT system.\n\nZero-rated supplies include most food and groceries, children\'s clothing, books, newspapers, and public transport. This is a taxable supply at 0% – input VAT is recoverable.';
      }
      return 'This is a domestic UK transaction.';

    case 'uk-export-zero':
      return 'This supply is classified as Zero Rated because it qualifies as an export of goods or services outside the United Kingdom.\n\nUnder UK VAT law, exports are zero-rated, meaning:\n• VAT rate is 0%\n• This is a taxable supply (not exempt)\n• You can reclaim input VAT on related costs\n• Proper export documentation should be retained\n\nZero Rated ≠ Exempt. Zero-rated supplies remain within the VAT system and allow input VAT recovery.';

    case 'uk-reverse-charge':
      return 'This transaction uses the Reverse Charge mechanism for services supplied to an EU business customer.\n\nUnder the reverse charge:\n• VAT rate shown is 0%\n• No UK VAT is charged on your invoice\n• The customer accounts for VAT in their own jurisdiction\n• You must include the reverse charge wording on your invoice\n\nReverse Charge ≠ Zero Rated. The reverse charge shifts the VAT liability to the customer, whereas zero-rated supplies remain the supplier\'s responsibility at 0%.';

    case 'uk-exempt':
      return 'This is a VAT exempt supply under UK VAT legislation. No VAT is charged, and you cannot reclaim input VAT on related costs.\n\nExempt supplies include:\n• Financial services\n• Insurance\n• Education and training\n• Healthcare\n• Postal services\n\nExempt ≠ Zero Rated. Exempt supplies are outside the VAT system and do not allow input VAT recovery, whereas zero-rated supplies are taxable at 0% and allow input VAT recovery.';

    default:
      return 'UK VAT calculation completed.';
  }
}
