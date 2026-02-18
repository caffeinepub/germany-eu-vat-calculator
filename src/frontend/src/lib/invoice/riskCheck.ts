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
  const sellerCountry = input.sellerCountry || 'DE';
  const autoLegalText = getAutoLegalVatText(result.scenario, sellerCountry, result.crossBorderVatTreatment);
  const fieldValidation = validateInvoiceMandatoryFields(input, result, autoLegalText);
  
  if (!fieldValidation.allPassed) {
    fieldValidation.missingFields.forEach(field => {
      risks.push(`Missing mandatory field: ${field}`);
    });
  }

  // Critical: Check legal VAT text for scenarios that require it
  const requiresLegalText = 
    result.scenario === 'reverse-charge' ||
    result.scenario === 'vat-exempt' ||
    result.scenario === 'kleinunternehmer' ||
    result.scenario === 'intra-eu-supply' ||
    result.scenario === 'digital-b2c-eu';

  if (requiresLegalText) {
    const legalVatText = input.legalVatTextOverride || autoLegalText;
    if (!legalVatText || legalVatText.trim().length === 0) {
      risks.push(`Critical: Legal VAT text is required for ${result.scenario} scenario`);
    }
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

  // Check for VAT exempt scenario
  if (result.scenario === 'vat-exempt') {
    const legalVatText = input.legalVatTextOverride || autoLegalText;
    if (!legalVatText || legalVatText.includes('[insert Article/Paragraph]')) {
      risks.push('VAT exempt invoices must specify the legal basis for exemption (Article/Paragraph reference)');
    }
    warnings.push('Ensure the transaction qualifies for VAT exemption under applicable law');
  }

  // Check for Kleinunternehmer scenario
  if (result.scenario === 'kleinunternehmer') {
    const legalVatText = input.legalVatTextOverride || autoLegalText;
    if (!legalVatText || !legalVatText.includes('§19')) {
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
