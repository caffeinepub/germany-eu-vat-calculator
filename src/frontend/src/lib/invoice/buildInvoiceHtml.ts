import { type InvoiceDetails } from '../../components/invoice/InvoiceDetailsStep';
import { type VATCalculationResult } from '../vat/calculateVat';
import { calculateInvoiceTotals, groupLineItemsByVatRate } from './invoiceLineItems';
import { formatCurrency } from './currency';
import { getAutoLegalVatText } from './getAutoLegalVatText';
import { translateGermanToEnglish } from '../translation/deToEn';

export function buildInvoiceHtml(
  details: InvoiceDetails,
  result: VATCalculationResult
): string {
  const totals = calculateInvoiceTotals(details.lineItems);
  const vatBreakdown = groupLineItemsByVatRate(details.lineItems);
  
  // Get legal VAT text (use override if provided, otherwise auto-generate)
  const legalVatText = details.legalVatTextOverride || getAutoLegalVatText(result.scenario, details.sellerCountry);
  
  // Translate if requested
  const sellerName = details.translateToEnglish ? translateGermanToEnglish(details.sellerName) : details.sellerName;
  const sellerAddress = details.translateToEnglish ? translateGermanToEnglish(details.sellerAddress) : details.sellerAddress;
  const customerName = details.translateToEnglish ? translateGermanToEnglish(details.customerName) : details.customerName;
  const customerAddress = details.translateToEnglish ? translateGermanToEnglish(details.customerAddress) : details.customerAddress;
  
  // Build line items HTML
  const lineItemsHtml = details.lineItems.map((item, index) => {
    const netAmount = item.quantity * item.unitPrice;
    const vatAmount = netAmount * (item.vatRate / 100);
    const grossAmount = netAmount + vatAmount;
    
    const description = details.translateToEnglish ? translateGermanToEnglish(item.description) : item.description;
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice, details.currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(netAmount, details.currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.vatRate}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(vatAmount, details.currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(grossAmount, details.currency)}</td>
      </tr>
    `;
  }).join('');
  
  // Build VAT breakdown HTML
  const vatBreakdownHtml = vatBreakdown.map(group => `
    <tr>
      <td style="padding: 8px;">VAT ${group.vatRate}%</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(group.vatAmount, details.currency)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${details.invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .invoice-meta {
      font-size: 14px;
      color: #666;
    }
    .party-info {
      margin-bottom: 20px;
    }
    .party-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f3f4f6;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .totals-table {
      margin-left: auto;
      width: 300px;
    }
    .grand-total {
      font-size: 18px;
      font-weight: bold;
      background-color: #f9fafb;
    }
    .legal-text {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9fafb;
      border-left: 4px solid #3b82f6;
      font-size: 12px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">
        <div>Invoice Number: ${details.invoiceNumber}</div>
        <div>Invoice Date: ${details.invoiceDate}</div>
        <div>Tax Point Date: ${details.taxPointDate || details.invoiceDate}</div>
      </div>
    </div>
  </div>

  <div class="party-info">
    <div class="party-label">From (Supplier):</div>
    <div>${sellerName}</div>
    <div>${sellerAddress}</div>
    <div>VAT ID: ${details.sellerVatId}</div>
  </div>

  <div class="party-info">
    <div class="party-label">To (Customer):</div>
    <div>${customerName || 'N/A'}</div>
    <div>${customerAddress || 'N/A'}</div>
    ${details.customerCountry ? `<div>Country: ${details.customerCountry}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="width: 80px; text-align: right;">Qty</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 100px; text-align: right;">Net Amount</th>
        <th style="width: 80px; text-align: right;">VAT Rate</th>
        <th style="width: 100px; text-align: right;">VAT Amount</th>
        <th style="width: 100px; text-align: right;">Gross Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHtml}
    </tbody>
  </table>

  <table class="totals-table">
    <tbody>
      ${vatBreakdownHtml}
      <tr style="border-top: 2px solid #e5e7eb;">
        <td style="padding: 8px; font-weight: 600;">Net Total</td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">${formatCurrency(totals.netAmount, details.currency)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: 600;">Total VAT</td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">${formatCurrency(totals.vatAmount, details.currency)}</td>
      </tr>
      <tr class="grand-total">
        <td style="padding: 12px;">Grand Total</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(totals.grossAmount, details.currency)}</td>
      </tr>
    </tbody>
  </table>

  ${legalVatText ? `<div class="legal-text">${legalVatText}</div>` : ''}
</body>
</html>
  `;
}
