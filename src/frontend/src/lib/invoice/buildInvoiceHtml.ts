import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';
import { translateGermanToEnglish } from '../translation/deToEn';
import { getAutoLegalVatText } from './getAutoLegalVatText';
import { getCountryConfig } from '../vat/euCountryConfig';

export function buildInvoiceHtml(
  input: VATCalculationInput,
  result: VATCalculationResult
): string {
  const netEuros = result.netAmountCents / 100;
  const vatEuros = result.vatAmountCents / 100;
  const grossEuros = result.grossAmountCents / 100;

  const shouldTranslate = input.translateToEnglish ?? false;

  const translate = (germanText: string): string => {
    return shouldTranslate ? translateGermanToEnglish(germanText) : germanText;
  };

  const sellerName = translate(input.sellerName || 'Seller Name');
  const sellerAddress = translate(input.sellerAddress || 'Seller Address');
  const customerName = translate(input.customerName || 'Customer Name');
  const customerAddress = translate(input.customerAddress || 'Customer Address');
  const itemDescription = translate(input.itemDescription || 'Service/Product Description');

  const invoiceNumber = input.invoiceNumber || 'INV-DRAFT';
  const invoiceDate = input.invoiceDate || new Date().toISOString().split('T')[0];
  const taxPointDate = input.taxPointDate || invoiceDate;

  // Service/Product Category label
  const serviceCategoryLabels: Record<string, string> = {
    digital: 'Digital service',
    saas: 'SaaS',
    consulting: 'Consulting / freelance',
    physical: 'Physical goods',
    others: 'Others',
  };
  const categoryLabel = serviceCategoryLabels[input.serviceCategory || 'others'] || 'Others';

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get country-specific VAT label
  const country = getCountryConfig(input.customerCountry);
  const vatLabel = country?.invoiceLabel || 'VAT';

  // Get legal VAT text
  const autoLegalText = getAutoLegalVatText(result.scenario);
  const legalVatText = input.legalVatTextOverride || autoLegalText;

  // Preserve line breaks in legal text
  const formattedLegalText = legalVatText
    .split('\n')
    .map(line => `<p style="margin: 0.25rem 0;">${line}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .invoice-meta div {
      flex: 1;
    }
    .invoice-meta strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 2rem;
    }
    .party {
      flex: 1;
    }
    .party h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .party p {
      margin: 0.25rem 0;
      white-space: pre-line;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
    }
    .items-table th {
      background: #2c3e50;
      color: white;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #ddd;
    }
    .items-table tr:last-child td {
      border-bottom: 2px solid #2c3e50;
    }
    .totals {
      margin-left: auto;
      width: 300px;
      margin-top: 1rem;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ddd;
    }
    .totals-row.total {
      font-weight: bold;
      font-size: 1.25rem;
      border-top: 2px solid #2c3e50;
      border-bottom: 2px solid #2c3e50;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      color: #2c3e50;
    }
    .legal-note {
      margin-top: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-left: 4px solid #2c3e50;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .legal-note h4 {
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 0.85rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
  </div>

  <div class="invoice-meta">
    <div>
      <strong>Invoice Date:</strong>
      <span>${formatDate(invoiceDate)}</span>
    </div>
    <div>
      <strong>Tax Point Date:</strong>
      <span>${formatDate(taxPointDate)}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>From (Seller)</h3>
      <p><strong>${sellerName}</strong></p>
      <p>${sellerAddress}</p>
      ${input.sellerVatId ? `<p>VAT ID: ${input.sellerVatId}</p>` : ''}
    </div>
    <div class="party">
      <h3>To (Customer)</h3>
      <p><strong>${customerName}</strong></p>
      <p>${customerAddress}</p>
      ${input.customerType === 'B2B' && input.vatId ? `<p>VAT ID: ${input.vatId}</p>` : ''}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Description</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${categoryLabel}</td>
        <td>${itemDescription}</td>
        <td style="text-align: right;">${formatCurrency(netEuros)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Net Amount:</span>
      <span>${formatCurrency(netEuros)}</span>
    </div>
    <div class="totals-row">
      <span>${vatLabel} (${result.vatRatePercent}%):</span>
      <span>${formatCurrency(vatEuros)}</span>
    </div>
    <div class="totals-row total">
      <span>Total Amount:</span>
      <span>${formatCurrency(grossEuros)}</span>
    </div>
  </div>

  ${legalVatText ? `
  <div class="legal-note">
    <h4>Legal VAT Note</h4>
    ${formattedLegalText}
  </div>
  ` : ''}

  <div class="footer">
    <p>This invoice was generated on ${formatDate(new Date().toISOString().split('T')[0])}</p>
  </div>
</body>
</html>
  `.trim();
}
