import { type VATCalculationInput, type VATCalculationResult } from './calculateVat';

export function explainGermanyVAT(input: VATCalculationInput, result: VATCalculationResult): string {
  const { scenario, vatRatePercent } = result;

  switch (scenario) {
    case 'kleinunternehmer':
      return `Your business qualifies for the Kleinunternehmer (small business) exemption under §19 UStG.

Since your previous year's turnover was less than €22,000 and your expected current year turnover is less than €50,000, you are exempt from charging VAT.

This means:
• You do not charge VAT to your customers
• You cannot deduct input VAT on your purchases
• You must include the exemption notice on all invoices

This exemption is optional. You can choose to charge VAT voluntarily, but then you're bound to it for 5 years.`;

    case 'reverse-charge':
      return `Reverse charge applies to this B2B transaction according to Article 196 of the EU VAT Directive.

Since you provided a valid EU VAT ID for your business customer, the VAT liability shifts to the customer (reverse charge mechanism).

This means:
• You charge 0% VAT on your invoice
• Your customer must self-assess and pay VAT in their country
• You must include the reverse charge notice on your invoice
• Both parties must report this transaction in their VAT returns

The reverse charge prevents double taxation in cross-border B2B transactions within the EU.`;

    case 'vat-exempt':
      return `This transaction is VAT exempt under applicable law.

VAT exemption applies to specific goods and services defined by EU and national law, such as:
• Medical and healthcare services
• Educational services
• Financial and insurance services
• Certain cultural and sporting activities
• Social welfare services

This means:
• You charge 0% VAT on your invoice
• You cannot deduct input VAT on related purchases
• You must include a legal note on your invoice specifying the exemption basis (Article or Paragraph reference)
• The exemption must be legally applicable to your specific transaction

Important: Ensure your transaction genuinely qualifies for exemption. Incorrect use of VAT exemption can result in penalties.`;

    case 'digital-b2c-eu':
      return `For digital services sold to consumers in other EU countries, special rules apply.

Since you're selling a digital service (e.g., software, streaming, online courses) to a customer in ${input.customerCountry}, the VAT rate of the customer's country applies, not Germany's rate.

This means:
• You must charge the VAT rate of ${input.customerCountry}
• You may need to register for VAT in ${input.customerCountry} or use the OSS (One-Stop-Shop) scheme
• The OSS scheme allows you to report and pay VAT for all EU countries through a single German portal

This calculator shows 0% as a placeholder. Please determine the correct ${input.customerCountry} VAT rate and consider registering for OSS.`;

    case 'intra-eu-supply':
      return `Intra-EU supply rules apply to this transaction.

Since you're selling physical goods to a consumer in ${input.customerCountry}, special cross-border VAT rules apply.

This means:
• Distance selling thresholds may apply (€10,000 across all EU sales)
• Above the threshold, you must charge ${input.customerCountry}'s VAT rate
• Consider using the OSS (One-Stop-Shop) scheme for simplified reporting
• Keep proper documentation of the cross-border delivery

The OSS scheme allows you to report and pay VAT for all EU countries through a single German portal.`;

    case 'b2c-reduced':
      return `The reduced VAT rate of ${vatRatePercent}% applies to this transaction.

Reduced VAT rates apply to specific goods and services including:
• Books and printed materials
• Food and beverages (with exceptions)
• Cultural services (theater, concerts, museums)
• Public transportation
• Hotel accommodations

This means:
• You charge ${vatRatePercent}% VAT on the net amount
• The VAT is clearly shown on the invoice
• You can deduct input VAT on related business expenses
• You report this in your regular VAT return

Make sure your product/service actually qualifies for the reduced rate. When in doubt, use the standard rate.`;

    case 'b2c-standard':
    default:
      return `The standard VAT rate of ${vatRatePercent}% applies to this transaction.

This is a standard domestic B2C (business-to-consumer) sale.

This means:
• You charge ${vatRatePercent}% VAT on the net amount
• The VAT is clearly shown on the invoice
• You can deduct input VAT on related business expenses
• You report this in your regular VAT return (monthly, quarterly, or annually depending on your turnover)

The standard rate applies to most goods and services unless they specifically qualify for the reduced rate or are exempt.`;
  }
}
