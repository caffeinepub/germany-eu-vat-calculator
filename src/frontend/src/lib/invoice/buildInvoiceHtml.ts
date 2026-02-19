import { type InvoiceData } from '../../components/invoice/InvoiceDetailsStep';
import { type VATCalculationResult } from '../vat/calculateVat';
import { calculateInvoiceTotals, groupLineItemsByVatRate } from './invoiceLineItems';
import { formatCurrency } from './currency';
import { getInvoiceWording } from './getInvoiceWording';
import { translateGermanToEnglish } from '../translation/deToEn';

const GLOBAL_VAT_DISCLAIMER = 'VAT calculated based on selected country, product category and transaction type. The supplier is responsible for verifying compliance with applicable VAT legislation.';

export function buildInvoiceHtml(
  details: InvoiceData,
  result: VATCalculationResult
): string {
  const totals = calculateInvoiceTotals(details.lineItems);
  const vatBreakdown = groupLineItemsByVatRate(details.lineItems);
  
  // Get legal VAT text from result or override
  const legalVatText = details.legalVatTextOverride || result.legalNote || '';
  
  // Translate if requested
  const supplierLegalName = details.translateToEnglish ? translateGermanToEnglish(details.supplierLegalName) : details.supplierLegalName;
  const supplierAddress = details.translateToEnglish ? translateGermanToEnglish(details.supplierAddress) : details.supplierAddress;
  const sellerName = details.translateToEnglish ? translateGermanToEnglish(details.sellerName) : details.sellerName;
  const sellerAddress = details.translateToEnglish ? translateGermanToEnglish(details.sellerAddress) : details.sellerAddress;
  const customerName = details.translateToEnglish ? translateGermanToEnglish(details.customerName) : details.customerName;
  const customerAddress = details.translateToEnglish ? translateGermanToEnglish(details.customerAddress) : details.customerAddress;
  
  const currency = details.currency || 'EUR';
  
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
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice, currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(netAmount, currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.vatRate}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(vatAmount, currency)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(grossAmount, currency)}</td>
      </tr>
    `;
  }).join('');
  
  // Build VAT breakdown HTML
  const vatBreakdownHtml = vatBreakdown.map(group => `
    <tr>
      <td style="padding: 8px;">VAT ${group.vatRate}%</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(group.vatAmount, currency)}</td>
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
    .disclaimer {
      margin-top: 20px;
      padding: 12px;
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      font-size: 11px;
      color: #92400e;
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
        <div>Supply Date: ${details.taxPointDate || details.invoiceDate}</div>
      </div>
    </div>
  </div>

  <div class="party-info">
    <div class="party-label">Supplier:</div>
    <div>${supplierLegalName}</div>
    <div style="white-space: pre-wrap;">${supplierAddress}</div>
    <div>VAT Number: ${details.supplierVatNumber}</div>
  </div>

  ${sellerName ? `
  <div class="party-info">
    <div class="party-label">Seller:</div>
    <div>${sellerName}</div>
    <div>${sellerAddress}</div>
    <div>VAT ID: ${details.sellerVatId}</div>
  </div>
  ` : ''}

  <div class="party-info">
    <div class="party-label">Buyer:</div>
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
        <th style="width: 100px; text-align: right;">Total Amount</th>
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
        <td style="padding: 8px; font-weight: 600;">Subtotal</td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">${formatCurrency(totals.netAmount, currency)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: 600;">VAT</td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">${formatCurrency(totals.vatAmount, currency)}</td>
      </tr>
      <tr class="grand-total">
        <td style="padding: 12px;">Grand Total</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(totals.grossAmount, currency)}</td>
      </tr>
    </tbody>
  </table>

  ${legalVatText ? `<div class="legal-text">${legalVatText}</div>` : ''}
  
  ${details.notes ? `<div class="legal-text" style="border-left-color: #10b981;"><strong>Notes:</strong><br/>${details.notes}</div>` : ''}
  
  <div class="disclaimer">
    ${GLOBAL_VAT_DISCLAIMER}
  </div>
</body>
</html>
  `;
}
