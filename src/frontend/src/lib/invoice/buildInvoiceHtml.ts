import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';
import { translateGermanToEnglish } from '../translation/deToEn';
import { getAutoLegalVatText } from './getAutoLegalVatText';
import { getCountryConfig } from '../vat/euCountryConfig';

export function buildInvoiceHtml(input: VATCalculationInput, result: VATCalculationResult): string {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const today = new Date().toLocaleDateString('en-US');
  const invoiceNumber = input.invoiceNumber || `INV-${Date.now()}`;
  const invoiceDate = input.invoiceDate ? new Date(input.invoiceDate).toLocaleDateString('en-US') : today;
  const taxPointDate = input.taxPointDate ? new Date(input.taxPointDate).toLocaleDateString('en-US') : invoiceDate;

  // Apply translation if enabled
  const shouldTranslate = input.translateToEnglish || false;
  
  const sellerName = shouldTranslate && input.sellerName 
    ? translateGermanToEnglish(input.sellerName) 
    : (input.sellerName || 'Your Company Name');
    
  const sellerAddress = shouldTranslate && input.sellerAddress 
    ? translateGermanToEnglish(input.sellerAddress) 
    : (input.sellerAddress || 'Your Address');
    
  const customerName = shouldTranslate && input.customerName 
    ? translateGermanToEnglish(input.customerName) 
    : (input.customerName || 'Customer Name');
    
  const customerAddress = shouldTranslate && input.customerAddress 
    ? translateGermanToEnglish(input.customerAddress) 
    : (input.customerAddress || 'Customer Address');
    
  const itemDescription = shouldTranslate && input.itemDescription 
    ? translateGermanToEnglish(input.itemDescription) 
    : (input.itemDescription || getDefaultItemDescription(input.serviceCategory));

  // Get country-specific VAT label
  const country = getCountryConfig(input.selectedCountry || 'DE');
  const vatLabel = country?.invoiceLabel || 'VAT';

  // Get legal VAT text (override or auto, with country-specific reverse charge text)
  let autoLegalText = getAutoLegalVatText(result.scenario);
  
  // If reverse charge and country-specific text available, use it
  if (result.scenario === 'reverse-charge' && country && input.reverseCharge) {
    autoLegalText = country.reverseChargeText;
  }
  
  const legalVatText = input.legalVatTextOverride || autoLegalText;

  // Convert newlines to HTML line breaks for display
  const legalVatTextHtml = legalVatText.replace(/\n/g, '<br>');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 28px;">INVOICE</h1>
        <p style="margin: 5px 0; color: #666;">Invoice #${invoiceNumber}</p>
        <p style="margin: 5px 0; color: #666;">Invoice Date: ${invoiceDate}</p>
        <p style="margin: 5px 0; color: #666;">Tax Point Date: ${taxPointDate}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">FROM</h3>
          <p style="margin: 0; font-weight: bold;">${sellerName}</p>
          <p style="margin: 5px 0; white-space: pre-line;">${sellerAddress}</p>
          ${input.sellerVatId ? `<p style="margin: 5px 0;">VAT ID: ${input.sellerVatId}</p>` : ''}
        </div>
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">TO</h3>
          <p style="margin: 0; font-weight: bold;">${customerName}</p>
          <p style="margin: 5px 0; white-space: pre-line;">${customerAddress}</p>
          ${input.vatId ? `<p style="margin: 5px 0;">VAT ID: ${input.vatId}</p>` : ''}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #333;">
            <th style="text-align: left; padding: 10px; font-size: 14px;">Description</th>
            <th style="text-align: right; padding: 10px; font-size: 14px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">
              ${itemDescription}
              ${input.customerType === 'B2B' ? ' (B2B)' : ' (B2C)'}
            </td>
            <td style="text-align: right; padding: 10px;">${formatCurrency(result.netAmountCents)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-left: auto; max-width: 300px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span>Net Amount:</span>
          <span>${formatCurrency(result.netAmountCents)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span>${vatLabel} (${result.vatRatePercent}%):</span>
          <span>${formatCurrency(result.vatAmountCents)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #333;">
          <span>Total:</span>
          <span>${formatCurrency(result.grossAmountCents)}</span>
        </div>
      </div>

      ${
        legalVatText
          ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #333;">
          <p style="margin: 0; font-size: 13px; line-height: 1.6;"><strong>Legal Note:</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.6;">${legalVatTextHtml}</p>
        </div>
      `
          : ''
      }
    </div>
  `;
}

function getDefaultItemDescription(serviceCategory?: string): string {
  switch (serviceCategory) {
    case 'digital':
      return 'Digital Service';
    case 'saas':
      return 'SaaS Subscription';
    case 'consulting':
      return 'Consulting Services';
    case 'physical':
      return 'Physical Goods';
    default:
      return 'Service/Product';
  }
}
