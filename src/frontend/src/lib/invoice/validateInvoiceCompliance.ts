// Comprehensive invoice compliance validation

import { type VATCalculationInput, type VATCalculationResult } from '../vat/calculateVat';
import { type InvoiceLineItem, calculateInvoiceTotals } from './invoiceLineItems';
import { getCountryCurrency } from './currency';
import { lookupVatConfig, getCountryCode } from '../vat/vatTable';

export interface ValidationError {
  field: string;
  message: string;
  blocking: boolean;
}

export interface ComplianceValidationResult {
  errors: ValidationError[];
  warnings: string[];
  isValid: boolean;
  requiredNotes: string[];
}

/**
 * Get VAT number prefix for a country
 */
function getCountryVatPrefix(countryCode: string): string {
  return countryCode.toUpperCase();
}

/**
 * Validate that seller country has VAT configuration
 */
function validateSellerCountrySupport(
  input: VATCalculationInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!input.sellerCountry || input.sellerCountry.trim().length === 0) {
    errors.push({
      field: 'sellerCountry',
      message: 'Seller country is required.',
      blocking: true,
    });
    return errors;
  }
  
  const vatConfig = lookupVatConfig(input.sellerCountry);
  if (!vatConfig) {
    errors.push({
      field: 'sellerCountry',
      message: 'Seller country is not supported for VAT calculation. Please select a supported seller country.',
      blocking: true,
    });
  }
  
  return errors;
}

/**
 * Validate supplier information (Section 1)
 */
function validateSupplier(
  input: VATCalculationInput
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.sellerName || input.sellerName.trim().length === 0) {
    errors.push({
      field: 'sellerName',
      message: 'Supplier legal name is required.',
      blocking: true,
    });
  }

  if (!input.sellerAddress || input.sellerAddress.trim().length === 0) {
    errors.push({
      field: 'sellerAddress',
      message: 'Supplier address is required.',
      blocking: true,
    });
  }

  if (!input.sellerCountry || input.sellerCountry.trim().length === 0) {
    errors.push({
      field: 'sellerCountry',
      message: 'Supplier country is required.',
      blocking: true,
    });
  }

  if (!input.sellerVatId || input.sellerVatId.trim().length === 0) {
    errors.push({
      field: 'sellerVatId',
      message: 'Supplier VAT number is required.',
      blocking: true,
    });
  } else if (input.sellerCountry) {
    // Validate VAT number format
    const expectedPrefix = getCountryVatPrefix(input.sellerCountry);
    if (!input.sellerVatId.toUpperCase().startsWith(expectedPrefix)) {
      errors.push({
        field: 'sellerVatId',
        message: 'Invalid VAT number format.',
        blocking: true,
      });
    }
  }

  return errors;
}

/**
 * Validate customer information (Section 2)
 */
function validateCustomer(
  input: VATCalculationInput
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.customerType === 'B2B') {
    if (!input.customerName || input.customerName.trim().length === 0) {
      errors.push({
        field: 'customerName',
        message: 'Customer name is required for B2B transactions.',
        blocking: true,
      });
    }

    if (!input.customerAddress || input.customerAddress.trim().length === 0) {
      errors.push({
        field: 'customerAddress',
        message: 'Customer address is required for B2B transactions.',
        blocking: true,
      });
    }

    if (!input.vatId || input.vatId.trim().length === 0) {
      errors.push({
        field: 'vatId',
        message: 'Customer VAT number is required for B2B transactions.',
        blocking: true,
      });
    }
  }

  // B2C does not require VAT ID

  return errors;
}

/**
 * Validate invoice identification (Section 3)
 */
async function validateInvoiceIdentification(
  input: VATCalculationInput,
  checkUniqueness?: (invoiceNumber: string) => Promise<boolean>
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!input.invoiceNumber || input.invoiceNumber.trim().length === 0) {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is required.',
      blocking: true,
    });
  } else if (checkUniqueness) {
    // Check uniqueness for authenticated users
    const exists = await checkUniqueness(input.invoiceNumber);
    if (exists) {
      errors.push({
        field: 'invoiceNumber',
        message: 'Invoice number already exists. Please use a unique invoice number.',
        blocking: true,
      });
    }
  }

  if (!input.invoiceDate || input.invoiceDate.trim().length === 0) {
    errors.push({
      field: 'invoiceDate',
      message: 'Invoice date is required.',
      blocking: true,
    });
  }

  // Tax point date validation is handled by auto-fill logic

  return errors;
}

/**
 * Validate line items (Section 4)
 */
function validateLineItems(
  items: InvoiceLineItem[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!items || items.length === 0) {
    errors.push({
      field: 'lineItems',
      message: 'At least one line item is required.',
      blocking: true,
    });
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.description || item.description.trim().length === 0) {
      errors.push({
        field: `lineItem[${index}].description`,
        message: `Line item ${index + 1}: Description is required.`,
        blocking: true,
      });
    }

    if (item.quantity <= 0) {
      errors.push({
        field: `lineItem[${index}].quantity`,
        message: `Line item ${index + 1}: Quantity must be greater than zero.`,
        blocking: true,
      });
    }

    if (item.unitPrice < 0) {
      errors.push({
        field: `lineItem[${index}].unitPrice`,
        message: `Line item ${index + 1}: Unit price cannot be negative.`,
        blocking: true,
      });
    }

    if (!item.vatCategory) {
      errors.push({
        field: `lineItem[${index}].vatCategory`,
        message: `Line item ${index + 1}: VAT category is required.`,
        blocking: true,
      });
    }
  });

  return errors;
}

/**
 * Validate VAT category rules (Section 5)
 */
function validateVatCategories(
  input: VATCalculationInput,
  result: VATCalculationResult,
  items: InvoiceLineItem[]
): { errors: ValidationError[]; requiredNotes: string[] } {
  const errors: ValidationError[] = [];
  const requiredNotes: string[] = [];

  // Check for reverse charge requirements
  const hasReverseCharge = items.some(item => item.vatRate === 0 && result.scenario === 'reverse-charge');
  
  if (hasReverseCharge || result.scenario === 'reverse-charge') {
    if (!input.vatId || input.vatId.trim().length === 0) {
      errors.push({
        field: 'vatId',
        message: 'Customer VAT number is required for reverse charge.',
        blocking: true,
      });
    }

    if (input.sellerCountry === input.customerCountry) {
      errors.push({
        field: 'reverseCharge',
        message: 'Reverse charge cannot apply when supplier and customer are in the same country.',
        blocking: true,
      });
    }

    requiredNotes.push('Reverse charge – VAT to be accounted for by the customer.');
  }

  // Check for exempt scenario
  if (result.scenario === 'vat-exempt') {
    requiredNotes.push('VAT exempt supply under applicable VAT legislation.');
  }

  // Check for zero rate
  const hasZeroRate = items.some(item => item.vatRate === 0 && result.scenario !== 'reverse-charge' && result.scenario !== 'vat-exempt');
  if (hasZeroRate) {
    requiredNotes.push('Zero-rated supply under EU VAT Directive.');
  }

  return { errors, requiredNotes };
}

/**
 * Validate totals (Section 7)
 */
function validateTotals(
  items: InvoiceLineItem[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const totals = calculateInvoiceTotals(items);

  if (totals.grossAmount <= 0) {
    errors.push({
      field: 'totals',
      message: 'Invoice grand total must be greater than zero.',
      blocking: true,
    });
  }

  return errors;
}

/**
 * Validate currency (Section 8)
 */
function validateCurrency(
  input: VATCalculationInput & { currency?: string }
): { errors: ValidationError[]; warnings: string[] } {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Currency defaults are handled in the component
  // Here we just check if it differs from local currency
  if (input.currency) {
    const localCurrency = getCountryCurrency(input.sellerCountry || 'DE').code;
    if (input.currency !== localCurrency) {
      warnings.push('VAT may need reporting in local currency.');
    }
  }

  return { errors, warnings };
}

/**
 * Safety check: Prevent 19% VAT rate for non-Germany countries (Section 5.5)
 */
function validateVatRateSafety(
  input: VATCalculationInput,
  items: InvoiceLineItem[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const sellerCountry = input.sellerCountry || 'DE';
  const countryCode = getCountryCode(sellerCountry);
  
  // Check if any line item has 19% VAT rate
  const has19PercentRate = items.some(item => item.vatRate === 19);
  
  if (has19PercentRate && countryCode !== 'DE') {
    errors.push({
      field: 'vatRate',
      message: `Incorrect VAT rate detected: 19% is only valid for Germany. The selected seller country (${sellerCountry}) requires a different VAT rate.`,
      blocking: true,
    });
  }
  
  return errors;
}

/**
 * Final compliance check (Section 9)
 */
function validateFinalCompliance(
  errors: ValidationError[],
  requiredNotes: string[],
  invoiceHtml: string
): ValidationError[] {
  const finalErrors: ValidationError[] = [];

  // Check if any blocking errors exist
  if (errors.some(e => e.blocking)) {
    finalErrors.push({
      field: 'compliance',
      message: 'Please fix all validation errors before downloading PDF.',
      blocking: true,
    });
  }

  // Check if required notes are present in invoice HTML
  for (const note of requiredNotes) {
    if (!invoiceHtml.includes(note)) {
      finalErrors.push({
        field: 'requiredNotes',
        message: `Required note missing: "${note}"`,
        blocking: true,
      });
    }
  }

  return finalErrors;
}

/**
 * Main validation function
 */
export async function validateInvoiceCompliance(
  input: VATCalculationInput & { currency?: string },
  result: VATCalculationResult,
  items: InvoiceLineItem[],
  invoiceHtml?: string,
  checkUniqueness?: (invoiceNumber: string) => Promise<boolean>
): Promise<ComplianceValidationResult> {
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];
  let requiredNotes: string[] = [];

  // Section 0: Seller country support validation (must be first)
  allErrors.push(...validateSellerCountrySupport(input));

  // Section 1: Supplier validation
  allErrors.push(...validateSupplier(input));

  // Section 2: Customer validation
  allErrors.push(...validateCustomer(input));

  // Section 3: Invoice identification
  const identificationErrors = await validateInvoiceIdentification(input, checkUniqueness);
  allErrors.push(...identificationErrors);

  // Section 4: Line items validation
  allErrors.push(...validateLineItems(items));

  // Section 5: VAT category validation
  const vatCategoryResult = validateVatCategories(input, result, items);
  allErrors.push(...vatCategoryResult.errors);
  requiredNotes = vatCategoryResult.requiredNotes;

  // Section 5.5: VAT rate safety check
  allErrors.push(...validateVatRateSafety(input, items));

  // Section 7: Totals validation
  allErrors.push(...validateTotals(items));

  // Section 8: Currency validation
  const currencyResult = validateCurrency(input);
  allErrors.push(...currencyResult.errors);
  allWarnings.push(...currencyResult.warnings);

  // Section 9: Final compliance check (only if invoice HTML is provided)
  if (invoiceHtml) {
    const finalErrors = validateFinalCompliance(allErrors, requiredNotes, invoiceHtml);
    allErrors.push(...finalErrors);
  }

  return {
    errors: allErrors,
    warnings: allWarnings,
    isValid: !allErrors.some(e => e.blocking),
    requiredNotes,
  };
}

/**
 * Synchronous validation (without uniqueness check)
 */
export function validateInvoiceComplianceSync(
  input: VATCalculationInput & { currency?: string },
  result: VATCalculationResult,
  items: InvoiceLineItem[],
  invoiceHtml?: string
): ComplianceValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];
  let requiredNotes: string[] = [];

  // Section 0: Seller country support validation (must be first)
  allErrors.push(...validateSellerCountrySupport(input));

  // Section 1: Supplier validation
  allErrors.push(...validateSupplier(input));

  // Section 2: Customer validation
  allErrors.push(...validateCustomer(input));

  // Section 3: Invoice identification (without uniqueness check)
  if (!input.invoiceNumber || input.invoiceNumber.trim().length === 0) {
    allErrors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is required.',
      blocking: true,
    });
  }

  if (!input.invoiceDate || input.invoiceDate.trim().length === 0) {
    allErrors.push({
      field: 'invoiceDate',
      message: 'Invoice date is required.',
      blocking: true,
    });
  }

  // Section 4: Line items validation
  allErrors.push(...validateLineItems(items));

  // Section 5: VAT category validation
  const vatCategoryResult = validateVatCategories(input, result, items);
  allErrors.push(...vatCategoryResult.errors);
  requiredNotes = vatCategoryResult.requiredNotes;

  // Section 5.5: VAT rate safety check
  allErrors.push(...validateVatRateSafety(input, items));

  // Section 7: Totals validation
  allErrors.push(...validateTotals(items));

  // Section 8: Currency validation
  const currencyResult = validateCurrency(input);
  allErrors.push(...currencyResult.errors);
  allWarnings.push(...currencyResult.warnings);

  // Section 9: Final compliance check (only if invoice HTML is provided)
  if (invoiceHtml) {
    const finalErrors = validateFinalCompliance(allErrors, requiredNotes, invoiceHtml);
    allErrors.push(...finalErrors);
  }

  return {
    errors: allErrors,
    warnings: allWarnings,
    isValid: !allErrors.some(e => e.blocking),
    requiredNotes,
  };
}
