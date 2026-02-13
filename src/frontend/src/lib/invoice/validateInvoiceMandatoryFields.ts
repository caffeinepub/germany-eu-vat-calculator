import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';

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
  autoLegalText: string
): MandatoryFieldsValidation {
  const legalVatText = input.legalVatTextOverride || autoLegalText;
  
  // Scenarios that require legal VAT text
  const requiresLegalText = 
    result.scenario === 'reverse-charge' ||
    result.scenario === 'vat-exempt' ||
    result.scenario === 'kleinunternehmer' ||
    result.scenario === 'intra-eu-supply' ||
    result.scenario === 'digital-b2c-eu';
  
  const checks: MandatoryFieldCheck[] = [
    {
      field: 'invoiceNumber',
      required: true,
      present: !!input.invoiceNumber && input.invoiceNumber.trim().length > 0,
      label: 'Invoice number',
    },
    {
      field: 'sellerVatId',
      required: true,
      present: !!input.sellerVatId && input.sellerVatId.trim().length > 0,
      label: 'Seller VAT ID',
    },
    {
      field: 'customerVatId',
      required: input.customerType === 'B2B',
      present: !!input.vatId && input.vatId.trim().length > 0,
      label: 'Customer VAT ID',
    },
    {
      field: 'invoiceDate',
      required: true,
      present: !!input.invoiceDate && input.invoiceDate.trim().length > 0,
      label: 'Invoice date',
    },
    {
      field: 'taxPointDate',
      required: true,
      present: !!input.taxPointDate && input.taxPointDate.trim().length > 0,
      label: 'Tax point date',
    },
    {
      field: 'vatRateAndAmount',
      required: true,
      present: result.vatRatePercent !== undefined && result.vatAmountCents !== undefined,
      label: 'VAT rate & amount',
    },
    {
      field: 'legalVatText',
      required: requiresLegalText,
      present: legalVatText.trim().length > 0,
      label: 'Legal VAT text',
    },
  ];

  const requiredChecks = checks.filter(c => c.required);
  const failedChecks = requiredChecks.filter(c => !c.present);
  
  return {
    checks,
    allPassed: failedChecks.length === 0,
    missingFields: failedChecks.map(c => c.label),
  };
}
