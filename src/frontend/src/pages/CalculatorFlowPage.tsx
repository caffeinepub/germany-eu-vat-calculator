import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import CountrySelectionStep from '../components/vat/CountrySelectionStep';
import TransactionDetailsStep from '../components/vat/TransactionDetailsStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import InvoiceDetailsStep, { type InvoiceData } from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import FlowStepper from '../components/vat/FlowStepper';
import { type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import { calculateUnifiedVat } from '../lib/vat/calculateUnifiedVat';

type Step = 'country' | 'transaction' | 'results' | 'explain' | 'invoice-details' | 'invoice-preview';

const STEP_CONFIGS = [
  { id: 'country', label: 'Country' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'results', label: 'Results' },
  { id: 'explain', label: 'Explain' },
  { id: 'invoice-details', label: 'Invoice' },
  { id: 'invoice-preview', label: 'Preview' },
];

export default function CalculatorFlowPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/calculator' });
  const [currentStep, setCurrentStep] = useState<Step>('country');
  const [formData, setFormData] = useState<Partial<VATCalculationInput>>({
    sellerCountry: search.country || '',
  });
  const [result, setResult] = useState<VATCalculationResult | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleCountrySelect = (country: string | null | undefined) => {
    // Enhanced defensive check
    if (!country) {
      console.error('Country selection failed: no country provided');
      return;
    }
    
    // Validate country is a non-empty string
    const validCountry = String(country);
    if (!validCountry || validCountry === 'undefined' || validCountry === 'null') {
      console.error('Country selection failed: invalid country value', country);
      return;
    }
    
    setFormData({ ...formData, sellerCountry: validCountry });
    setCurrentStep('transaction');
  };

  const handleTransactionComplete = (data: Partial<VATCalculationInput>) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    // Add defensive checks before calculation
    if (!updatedFormData.sellerCountry) {
      console.error('Cannot calculate VAT: seller country is missing');
      return;
    }

    if (!updatedFormData.customerCountry && !updatedFormData.sellerCountry) {
      console.error('Cannot calculate VAT: customer country is missing');
      return;
    }

    try {
      const calculationResult = calculateUnifiedVat(
        updatedFormData.sellerCountry,
        updatedFormData.customerCountry || updatedFormData.sellerCountry,
        updatedFormData.customerType === 'B2B' ? 'business' : 'consumer',
        updatedFormData.supplyType || 'services',
        updatedFormData.vatCategory || 'standard',
        updatedFormData.netAmount || 0,
        updatedFormData.vatId,
        updatedFormData.selectedReducedRate ?? undefined // Convert null to undefined
      );
      setResult(calculationResult);
      setCurrentStep('results');
    } catch (error) {
      console.error('VAT calculation error:', error);
      // Show error to user or handle gracefully
    }
  };

  const handleResultsNext = () => {
    setCurrentStep('explain');
  };

  const handleExplainNext = () => {
    setCurrentStep('invoice-details');
  };

  const handleInvoiceDetailsNext = (data: InvoiceData) => {
    setInvoiceData(data);
    
    // Merge invoice data into formData for preview
    const updatedFormData: VATCalculationInput = {
      ...formData,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      supplierLegalName: data.supplierLegalName,
      supplierAddress: data.supplierAddress,
      supplierVatNumber: data.supplierVatNumber,
      sellerName: data.sellerName,
      sellerAddress: data.sellerAddress,
      sellerVatId: data.sellerVatId,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      legalVatTextOverride: data.legalVatText,
    } as VATCalculationInput;
    
    setFormData(updatedFormData);
    setCurrentStep('invoice-preview');
  };

  const handleBack = () => {
    const steps: Step[] = ['country', 'transaction', 'results', 'explain', 'invoice-details', 'invoice-preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      navigate({ to: '/', search: {} });
    }
  };

  const currentStepIndex = STEP_CONFIGS.findIndex(s => s.id === currentStep);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <FlowStepper steps={STEP_CONFIGS} currentStep={currentStepIndex} />

      <div className="mt-8">
        {currentStep === 'country' && (
          <CountrySelectionStep
            onCountrySelect={handleCountrySelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 'transaction' && formData.sellerCountry && (
          <TransactionDetailsStep
            initialData={formData as VATCalculationInput}
            onNext={handleTransactionComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'results' && result && formData.sellerCountry && (
          <VatResultsStep
            result={result}
            countryCode={formData.sellerCountry}
            onNext={handleResultsNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'explain' && result && (
          <ExplainVatPanel
            formData={formData as VATCalculationInput}
            result={result}
            onBack={handleBack}
            onNext={handleExplainNext}
          />
        )}

        {currentStep === 'invoice-details' && result && (
          <InvoiceDetailsStep
            vatResult={result}
            calculationInput={formData as VATCalculationInput}
            onNext={handleInvoiceDetailsNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'invoice-preview' && result && invoiceData && (
          <InvoicePreview
            result={result}
            calculationInput={formData as VATCalculationInput}
            invoiceData={invoiceData}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
