import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FlowStepper from '../components/vat/FlowStepper';
import EuVatIntroStep from '../components/vat/EuVatIntroStep';
import CountryTransactionStep from '../components/vat/CountryTransactionStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import InvoiceDetailsStep from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import UpgradeModal from '../components/usage/UpgradeModal';
import GlobalDisclaimer from '../components/vat/GlobalDisclaimer';
import { calculateEUVAT, type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import { getCountryConfig } from '../lib/vat/euCountryConfig';
import { computeVatRateForCategory } from '../lib/vat/vatCategoryRateRules';
import { useEventLogger } from '../hooks/useEventLogger';
import { CORE_EVENTS } from '../lib/analytics/coreEvents';
import { useEffect } from 'react';

const STEPS = [
  { id: 'intro', label: 'Select Country' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'results', label: 'Results' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'preview', label: 'Preview' },
  { id: 'explain', label: 'Explain' },
];

const initialFormData: VATCalculationInput = {
  sellerCountry: 'DE',
  customerCountry: 'DE',
  customerType: 'B2C',
  vatId: '',
  serviceCategory: 'digital',
  netAmount: 0,
  vatRate: 'standard',
  reverseCharge: false,
  vatCategory: 'others',
  previousYearTurnover: 0,
  currentYearTurnover: 0,
  invoiceNumber: '',
  invoiceDate: '',
  sellerVatId: '',
  sellerName: '',
  sellerAddress: '',
  customerName: '',
  customerAddress: '',
  itemDescription: '',
  legalVatTextOverride: '',
  selectedCountry: '',
};

export default function CalculatorFlowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VATCalculationInput>(initialFormData);
  const [result, setResult] = useState<VATCalculationResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { log } = useEventLogger();

  useEffect(() => {
    // Log invoice_previewed when entering step 3 (Invoice Details)
    if (currentStep === 3) {
      log(CORE_EVENTS.INVOICE_PREVIEWED, JSON.stringify({
        invoiceNumber: formData.invoiceNumber || 'draft',
        customerCountry: formData.customerCountry,
      }));
    }
  }, [currentStep, formData.invoiceNumber, formData.customerCountry, log]);

  const handleCountrySelect = (countryCode: string) => {
    const country = getCountryConfig(countryCode);
    if (country) {
      setFormData({
        ...formData,
        selectedCountry: countryCode,
        customerCountry: countryCode,
        vatCategory: 'others', // Reset to default
      });
      setCurrentStep(1);
    }
  };

  const handleTransactionNext = (data: Partial<VATCalculationInput>) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    // Compute VAT rate based on country and category
    const country = getCountryConfig(updatedFormData.selectedCountry || updatedFormData.customerCountry);
    if (!country) return;

    const isReducedRateCountry = ['DE', 'FR', 'IT', 'SE', 'BE'].includes(country.code);
    
    let computedRate: number;
    if (isReducedRateCountry && updatedFormData.vatCategory) {
      // Use computed rate for reduced-rate countries
      computedRate = computeVatRateForCategory(
        country.code,
        updatedFormData.vatCategory,
        country.standardRate
      );
    } else {
      // For other countries, use standard or first reduced rate
      computedRate = updatedFormData.vatRate === 'reduced' && country.reducedRates.length > 0
        ? country.reducedRates[0]
        : country.standardRate;
    }

    const calculationResult = calculateEUVAT(updatedFormData, computedRate);
    setResult(calculationResult);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleViewInvoice = () => {
    setCurrentStep(3);
  };

  const handleExplainVat = () => {
    setCurrentStep(5);
  };

  const handleInvoiceNext = (data: Partial<VATCalculationInput>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(4);
  };

  const handleRecalculate = (newResult: VATCalculationResult) => {
    setResult(newResult);
  };

  const handleNewCalculation = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">EU VAT Calculator</CardTitle>
            <FlowStepper steps={STEPS} currentStep={currentStep} />
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <EuVatIntroStep onCountrySelect={handleCountrySelect} />
            )}

            {currentStep === 1 && (
              <CountryTransactionStep
                countryCode={formData.selectedCountry || formData.customerCountry}
                initialData={formData}
                onNext={handleTransactionNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 2 && result && (
              <VatResultsStep
                result={result}
                formData={formData}
                onViewInvoice={handleViewInvoice}
                onExplainVat={handleExplainVat}
                onBack={handleBack}
                onGenerateNew={handleNewCalculation}
                onOpenUpgradeModal={() => setShowUpgradeModal(true)}
              />
            )}

            {currentStep === 3 && result && (
              <InvoiceDetailsStep
                initialData={formData}
                formData={formData}
                result={result}
                onNext={handleInvoiceNext}
                onBack={handleBack}
                onRecalculate={handleRecalculate}
              />
            )}

            {currentStep === 4 && result && (
              <InvoicePreview
                formData={formData}
                result={result}
                onBack={handleBack}
              />
            )}

            {currentStep === 5 && result && (
              <ExplainVatPanel
                formData={formData}
                result={result}
              />
            )}
          </CardContent>
        </Card>

        <GlobalDisclaimer />
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
}
