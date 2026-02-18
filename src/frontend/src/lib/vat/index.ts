// Barrel export for VAT-related modules
export * from './calculateVat';
export * from './calculateUnifiedVat';
export * from './explainVat';
export * from './explainVatLikeIm12';
export * from './germanyVatRateHistory';
export * from './validateReverseChargeProof';
export * from './ossIndicator';
export * from './vatCategoryRateRules';
export * from './euCountryConfig';
export * from './region';
export * from './ukTypes';
export * from './calculateUkVat';
export * from './ukMisuseWarnings';
export * from './explainUkVat';
export * from './isZeroVatResult';
export * from './vatTable';
export * from './reducedEligibility';
export * from './determineVatRate';
export * from './calculateVatAmounts';
export * from './identifierNormalization';
// Export specific items from determineCrossBorderVAT to avoid SupplyType conflict
export { 
  determineCrossBorderVAT, 
  mapTreatmentToVATRate, 
  getCrossBorderInvoiceWording,
  getCrossBorderDisplayLabel,
  type CrossBorderVATTreatment,
  type CrossBorderVATInput
} from './determineCrossBorderVAT';
