import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';
import { validateInvoiceMandatoryFields } from './validateInvoiceMandatoryFields';
import { validateReverseChargeProof } from '../vat/validateReverseChargeProof';
import { getAutoLegalVatText } from './getAutoLegalVatText';

export interface RiskCheckResult {
  risks: string[];
  warnings: string[];
  passed: boolean;
}

export function performInvoiceRiskCheck(
  input: VATCalculationInput,
  result: VATCalculationResult
): RiskCheckResult {
  const risks: string[] = [];
  const warnings: string[] = [];

  // Check mandatory fields
  const autoLegalText = getAutoLegalVatText(result.scenario);
  const fieldValidation = validateInvoiceMandatoryFields(input, result, autoLegalText);
  
  if (!fieldValidation.allPassed) {
    fieldValidation.missingFields.forEach(field => {
      risks.push(`Missing mandatory field: ${field}`);
    });
  }

  // Check reverse charge proof if applicable
  if (input.customerType === 'B2B' && result.scenario === 'reverse-charge') {
    const reverseChargeValidation = validateReverseChargeProof(
      input.vatId,
      input.customerCountry,
      input.customerType
    );
    
    if (!reverseChargeValidation.isAllowed) {
      risks.push('Reverse charge validation failed: ' + reverseChargeValidation.explanation);
    }
  }

  // Check for Kleinunternehmer scenario
  if (result.scenario === 'kleinunternehmer') {
    if (!autoLegalText || (input.legalVatTextOverride && !input.legalVatTextOverride.includes('§19'))) {
      warnings.push('Kleinunternehmer invoices must include §19 UStG reference');
    }
  }

  // Check VAT ID format for seller
  if (input.sellerVatId && input.sellerVatId.length > 0) {
    if (!input.sellerVatId.startsWith('DE')) {
      warnings.push('Seller VAT ID should start with "DE" for German businesses');
    }
  }

  // Check invoice date
  if (input.invoiceDate) {
    const invoiceDate = new Date(input.invoiceDate);
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 30);
    
    if (invoiceDate > futureLimit) {
      warnings.push('Invoice date is more than 30 days in the future');
    }
  }

  return {
    risks,
    warnings,
    passed: risks.length === 0,
  };
}
