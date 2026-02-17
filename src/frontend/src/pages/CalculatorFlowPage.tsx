import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import FlowStepper from '../components/vat/FlowStepper';
import CountrySelectionStep from '../components/vat/CountrySelectionStep';
import CountryTransactionStep from '../components/vat/CountryTransactionStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import InvoiceDetailsStep from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import { type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import { calculateUnifiedVat } from '../lib/vat/calculateUnifiedVat';
import { getSelectedSellerCountry } from '../lib/vat/selectedSellerCountry';

type FlowStep = 'country' | 'transaction' | 'results' | 'invoice' | 'preview' | 'explain';

const FLOW_STEPS = [
  { id: 'country', label: 'Country' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'results', label: 'Results' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'preview', label: 'Preview' },
  { id: 'explain', label: 'Explain' },
];

export default function CalculatorFlowPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/calculator' });
  const urlCountry = search.country;

  const [currentStep, setCurrentStep] = useState<FlowStep>('country');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [calculationInput, setCalculationInput] = useState<VATCalculationInput>({
    sellerCountry: '',
    customerCountry: '',
    customerType: 'B2C',
    vatId: '',
    serviceCategory: 'digital',
    netAmount: 0,
    previousYearTurnover: 0,
    currentYearTurnover: 0,
    vatRate: 'standard',
    productCategory: 'others',
    vatCategory: 'others',
    reverseCharge: false,
  });
  const [calculationResult, setCalculationResult] = useState<VATCalculationResult | null>(null);

  // Initialize from URL parameter
  useEffect(() => {
    const result = getSelectedSellerCountry();
    if (result.isValid && result.countryCode) {
      setSelectedCountry(result.countryCode);
      setCalculationInput((prev) => ({ ...prev, sellerCountry: result.countryCode }));
      setCurrentStep('transaction');
    } else {
      setCurrentStep('country');
    }
  }, [urlCountry]);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setCalculationInput((prev) => ({ ...prev, sellerCountry: countryCode }));
    navigate({ to: '/calculator', search: { country: countryCode } });
    setCurrentStep('transaction');
  };

  const handleTransactionNext = (data: Partial<VATCalculationInput>) => {
    const updatedInput = { ...calculationInput, ...data };
    setCalculationInput(updatedInput);

    const result = calculateUnifiedVat(updatedInput);
    setCalculationResult(result);
    setCurrentStep('results');
  };

  const handleResultsNext = () => {
    setCurrentStep('invoice');
  };

  const handleInvoiceNext = () => {
    setCurrentStep('preview');
  };

  const handlePreviewNext = () => {
    setCurrentStep('explain');
  };

  const handleBackToCountry = () => {
    setCurrentStep('country');
    setSelectedCountry('');
    navigate({ to: '/calculator', search: {} });
  };

  const handleBackToTransaction = () => {
    setCurrentStep('transaction');
  };

  const handleBackToResults = () => {
    setCurrentStep('results');
  };

  const handleBackToInvoice = () => {
    setCurrentStep('invoice');
  };

  const handleBackToPreview = () => {
    setCurrentStep('preview');
  };

  const stepIndex = {
    country: 0,
    transaction: 1,
    results: 2,
    invoice: 3,
    preview: 4,
    explain: 5,
  }[currentStep];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" style={{ overflow: 'visible' }}>
      <FlowStepper steps={FLOW_STEPS} currentStep={stepIndex} />

      <div className="mt-8" style={{ overflow: 'visible' }}>
        {currentStep === 'country' && (
          <CountrySelectionStep onSelectCountry={handleCountrySelect} />
        )}

        {currentStep === 'transaction' && selectedCountry && (
          <CountryTransactionStep
            countryCode={selectedCountry}
            initialData={calculationInput}
            onNext={handleTransactionNext}
            onBack={handleBackToCountry}
          />
        )}

        {currentStep === 'results' && calculationResult && (
          <VatResultsStep
            result={calculationResult}
            formData={calculationInput}
            onViewInvoice={handleResultsNext}
            onExplainVat={handlePreviewNext}
            onBack={handleBackToTransaction}
            onGenerateNew={handleBackToCountry}
            onOpenUpgradeModal={() => {}}
          />
        )}

        {currentStep === 'invoice' && calculationResult && (
          <InvoiceDetailsStep
            vatResult={calculationResult}
            calculationInput={calculationInput}
            onNext={handleInvoiceNext}
            onBack={handleBackToResults}
          />
        )}

        {currentStep === 'preview' && calculationResult && (
          <InvoicePreview
            result={calculationResult}
            calculationInput={calculationInput}
            onBack={handleBackToInvoice}
          />
        )}

        {currentStep === 'explain' && calculationResult && (
          <ExplainVatPanel
            formData={calculationInput}
            result={calculationResult}
          />
        )}
      </div>
    </div>
  );
}
