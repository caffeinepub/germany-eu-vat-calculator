import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import FlowStepper from '../components/vat/FlowStepper';
import CountrySelectionStep from '../components/vat/CountrySelectionStep';
import CountryTransactionStep from '../components/vat/CountryTransactionStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import { calculateUnifiedVat } from '../lib/vat/calculateUnifiedVat';
import { toBackendVatCalculation } from '../lib/vat/toBackendVatCalculation';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';

const STEPS = [
  { id: 'select-country', label: 'Select Country' },
  { id: 'transaction-details', label: 'Transaction Details' },
  { id: 'vat-results', label: 'VAT Results' },
  { id: 'explanation', label: 'Explanation' },
  { id: 'invoice-preview', label: 'Invoice Preview' },
];

export default function CalculatorFlowPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/calculator' });
  const { actor } = useActor();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<string>(search.country || '');
  const [isCalculating, setIsCalculating] = useState(false);

  const [formData, setFormData] = useState<VATCalculationInput>({
    sellerCountry: selectedCountry,
    customerCountry: selectedCountry,
    buyerCountry: selectedCountry,
    customerType: 'B2C',
    vatId: '',
    serviceCategory: 'digital',
    netAmount: 0,
    previousYearTurnover: 0,
    currentYearTurnover: 0,
    vatRate: 'standard',
    isExport: false,
    supplyType: 'services',
  });

  const [vatResult, setVatResult] = useState<VATCalculationResult | null>(null);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setFormData((prev) => ({
      ...prev,
      sellerCountry: countryCode,
      customerCountry: countryCode,
      buyerCountry: countryCode,
    }));
    setCurrentStep(1);
  };

  const handleTransactionNext = async (data: Partial<VATCalculationInput>) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);
    setIsCalculating(true);

    try {
      // Calculate using frontend unified VAT engine
      const frontendResult = calculateUnifiedVat(updatedFormData);
      
      // Also call backend for consistency check
      if (actor) {
        const backendPayload = toBackendVatCalculation(updatedFormData);
        const backendResult = await actor.calculate(backendPayload);
        
        // Verify consistency (allow small floating-point differences)
        const netDiff = Math.abs(frontendResult.netAmountCents / 100 - backendResult.priceNetEuros);
        const grossDiff = Math.abs(frontendResult.grossAmountCents / 100 - backendResult.priceGrossEuros);
        
        if (netDiff > 0.02 || grossDiff > 0.02) {
          console.warn('Frontend/backend calculation mismatch:', {
            frontend: frontendResult,
            backend: backendResult,
          });
        }
      }

      setVatResult(frontendResult);
      setCurrentStep(2);
    } catch (error) {
      console.error('VAT calculation error:', error);
      toast.error('Failed to calculate VAT. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate({ to: '/', search: {} });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <FlowStepper steps={STEPS} currentStep={currentStep} />

      <div className="mt-8">
        {currentStep === 0 && (
          <CountrySelectionStep 
            onSelectCountry={handleCountrySelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 1 && selectedCountry && (
          <CountryTransactionStep
            countryCode={selectedCountry}
            initialData={formData}
            onNext={handleTransactionNext}
            onBack={handleBack}
            isCalculating={isCalculating}
          />
        )}

        {currentStep === 2 && vatResult && (
          <VatResultsStep
            result={vatResult}
            countryCode={selectedCountry}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && vatResult && (
          <ExplainVatPanel
            formData={formData}
            result={vatResult}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {currentStep === 4 && vatResult && (
          <InvoicePreview
            result={vatResult}
            calculationInput={formData}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
