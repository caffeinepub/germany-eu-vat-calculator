import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FlowStepper from '../components/vat/FlowStepper';
import CountrySelectionStep from '../components/vat/CountrySelectionStep';
import TransactionDetailsStep from '../components/vat/TransactionDetailsStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import InvoiceDetailsStep from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import UpgradeModal from '../components/usage/UpgradeModal';
import { calculateGermanyVAT, type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import { useEventLogger } from '../hooks/useEventLogger';
import { CORE_EVENTS } from '../lib/analytics/coreEvents';
import { useEffect } from 'react';

const STEPS = [
  { id: 'country', label: 'Country Selection' },
  { id: 'details', label: 'Transaction Details' },
  { id: 'results', label: 'Results' },
  { id: 'invoice', label: 'Invoice Details' },
  { id: 'preview', label: 'Preview' },
  { id: 'explain', label: 'Explain VAT' },
];

const initialFormData: VATCalculationInput = {
  sellerCountry: 'DE',
  customerCountry: 'DE',
  customerType: 'B2C',
  vatId: '',
  serviceCategory: 'digital',
  netAmount: 0,
  vatRate: 'standard',
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
};

export default function CalculatorFlowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VATCalculationInput>(initialFormData);
  const [result, setResult] = useState<VATCalculationResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { log } = useEventLogger();

  useEffect(() => {
    // Log invoice_previewed when entering step 4 (Invoice Details)
    if (currentStep === 3) {
      log(CORE_EVENTS.INVOICE_PREVIEWED, JSON.stringify({
        invoiceNumber: formData.invoiceNumber || 'draft',
        customerCountry: formData.customerCountry,
      }));
    }
  }, [currentStep, formData.invoiceNumber, formData.customerCountry, log]);

  const handleNext = (data: Partial<VATCalculationInput>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep === 1) {
      const calculationResult = calculateGermanyVAT(updatedData);
      setResult(calculationResult);
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleViewInvoice = () => {
    setCurrentStep(3);
  };

  const handleExplainVat = () => {
    setCurrentStep(5);
  };

  const handleGenerateNew = () => {
    setFormData(initialFormData);
    setResult(null);
    setCurrentStep(0);
  };

  const handleOpenUpgradeModal = () => {
    setShowUpgradeModal(true);
  };

  const handleRecalculate = (newResult: VATCalculationResult) => {
    setResult(newResult);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs font-medium">
            🇩🇪 Germany-specific
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">Germany EU VAT Calculator</h1>
        <p className="text-muted-foreground">
          Built specifically for German VAT rules — not a generic EU calculator
        </p>
      </div>

      <FlowStepper steps={STEPS} currentStep={currentStep} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{STEPS[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <CountrySelectionStep
              initialData={formData}
              onNext={handleNext}
            />
          )}
          {currentStep === 1 && (
            <TransactionDetailsStep
              initialData={formData}
              onNext={handleNext}
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
              onGenerateNew={handleGenerateNew}
              onOpenUpgradeModal={handleOpenUpgradeModal}
            />
          )}
          {currentStep === 3 && result && (
            <InvoiceDetailsStep
              formData={formData}
              result={result}
              onNext={handleNext}
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
            <div className="space-y-6">
              <ExplainVatPanel formData={formData} result={result} />
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Back to Results
                </button>
                <button
                  onClick={handleGenerateNew}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  New Calculation
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
