import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';
import { type InvoiceLineItem, calculateInvoiceTotals } from './invoiceLineItems';

export interface MandatoryFieldCheck {
  field: string;
  required: boolean;
  present: boolean;
  label: string;
}

export interface MandatoryFieldsValidation {
  checks: MandatoryFieldCheck[];
  allPassed: boolean;
  missingFields: string[];
}

export function validateInvoiceMandatoryFields(
  input: VATCalculationInput,
  result: VATCalculationResult,
  autoLegalText: string,
  lineItems?: InvoiceLineItem[]
): MandatoryFieldsValidation {
  const checks: MandatoryFieldCheck[] = [];

  // Supplier Legal Name (required)
  checks.push({
    field: 'supplierLegalName',
    required: true,
    present: !!(input.supplierLegalName && input.supplierLegalName.trim().length > 0),
    label: 'Supplier Legal Name',
  });

  // Supplier Address (required)
  checks.push({
    field: 'supplierAddress',
    required: true,
    present: !!(input.supplierAddress && input.supplierAddress.trim().length > 0),
    label: 'Supplier Address',
  });

  // Supplier VAT Number (required)
  checks.push({
    field: 'supplierVatNumber',
    required: true,
    present: !!(input.supplierVatNumber && input.supplierVatNumber.trim().length > 0),
    label: 'Supplier VAT Number',
  });

  // Invoice Number (required)
  checks.push({
    field: 'invoiceNumber',
    required: true,
    present: !!(input.invoiceNumber && input.invoiceNumber.trim().length > 0),
    label: 'Invoice Number',
  });

  // Invoice Date (required)
  checks.push({
    field: 'invoiceDate',
    required: true,
    present: !!(input.invoiceDate && input.invoiceDate.trim().length > 0),
    label: 'Invoice Date',
  });

  // At least one line item (required)
  const hasLineItems = lineItems && lineItems.length > 0;
  checks.push({
    field: 'lineItems',
    required: true,
    present: !!hasLineItems,
    label: 'At least one line item',
  });

  // Grand total must be greater than zero (required)
  let grandTotalValid = false;
  if (lineItems && lineItems.length > 0) {
    const totals = calculateInvoiceTotals(lineItems);
    grandTotalValid = totals.grossAmount > 0;
  }
  checks.push({
    field: 'grandTotal',
    required: true,
    present: grandTotalValid,
    label: 'Invoice grand total must be greater than zero',
  });

  // Seller Name
  checks.push({
    field: 'sellerName',
    required: false,
    present: !!(input.sellerName && input.sellerName.trim().length > 0),
    label: 'Seller Name',
  });

  // Seller Address
  checks.push({
    field: 'sellerAddress',
    required: false,
    present: !!(input.sellerAddress && input.sellerAddress.trim().length > 0),
    label: 'Seller Address',
  });

  // Seller VAT ID
  checks.push({
    field: 'sellerVatId',
    required: false,
    present: !!(input.sellerVatId && input.sellerVatId.trim().length > 0),
    label: 'Seller VAT ID',
  });

  // Customer Name
  checks.push({
    field: 'customerName',
    required: false,
    present: !!(input.customerName && input.customerName.trim().length > 0),
    label: 'Customer Name',
  });

  // Customer Address
  checks.push({
    field: 'customerAddress',
    required: false,
    present: !!(input.customerAddress && input.customerAddress.trim().length > 0),
    label: 'Customer Address',
  });

  // Legal VAT Text - required for specific scenarios
  const requiresLegalText = [
    'reverse-charge',
    'vat-exempt',
    'kleinunternehmer',
    'intra-eu-supply',
    'digital-b2c-eu',
  ].includes(result.scenario);

  const hasLegalText = !!(input.legalVatTextOverride && input.legalVatTextOverride.trim().length > 0) || 
                       !!(autoLegalText && autoLegalText.trim().length > 0);

  checks.push({
    field: 'legalVatText',
    required: requiresLegalText,
    present: hasLegalText,
    label: 'Legal VAT Text',
  });

  // Calculate overall validation status
  const requiredChecks = checks.filter(c => c.required);
  const allPassed = requiredChecks.every(c => c.present);
  const missingFields = requiredChecks
    .filter(c => !c.present)
    .map(c => c.label);

  return {
    checks,
    allPassed,
    missingFields,
  };
}
