import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CountrySelectionStep from '../components/vat/CountrySelectionStep';
import TransactionDetailsStep from '../components/vat/TransactionDetailsStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import InvoiceDetailsStep from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import UsageLimitBanner from '../components/usage/UsageLimitBanner';
import UpgradeModal from '../components/usage/UpgradeModal';
import FlowStepper from '../components/vat/FlowStepper';
import { calculateGermanyVAT, type VATCalculationInput, type VATCalculationResult } from '../lib/vat/calculateVat';
import type { InvoiceDetails } from '../components/invoice/InvoiceDetailsStep';

export type FlowStep = 'country' | 'details' | 'results' | 'invoice-details' | 'invoice' | 'explain';

export default function CalculatorFlowPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('country');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [formData, setFormData] = useState<VATCalculationInput>({
    sellerCountry: 'DE',
    customerCountry: 'DE',
    customerType: 'B2C',
    vatId: '',
    serviceCategory: 'digital',
    netAmount: 0,
    previousYearTurnover: 0,
    currentYearTurnover: 0,
    vatRate: 'standard',
  });

  const [calculationResult, setCalculationResult] = useState<VATCalculationResult | null>(null);

  const handleCountryNext = (data: Partial<VATCalculationInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep('details');
  };

  const handleDetailsNext = (data: Partial<VATCalculationInput>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    const result = calculateGermanyVAT(updatedData);
    setCalculationResult(result);
    setCurrentStep('results');
  };

  const handleBack = () => {
    if (currentStep === 'details') setCurrentStep('country');
    else if (currentStep === 'results') setCurrentStep('details');
    else if (currentStep === 'invoice-details') setCurrentStep('results');
    else if (currentStep === 'invoice') setCurrentStep('invoice-details');
    else if (currentStep === 'explain') setCurrentStep('results');
  };

  const handleEnterInvoiceDetails = () => {
    setCurrentStep('invoice-details');
  };

  const handleInvoiceDetailsNext = (invoiceDetails: InvoiceDetails) => {
    setFormData((prev) => ({
      ...prev,
      sellerName: invoiceDetails.sellerName,
      sellerAddress: invoiceDetails.sellerAddress,
      sellerVatId: invoiceDetails.sellerVatId,
      customerName: invoiceDetails.customerName,
      customerAddress: invoiceDetails.customerAddress,
      itemDescription: invoiceDetails.itemDescription,
      translateToEnglish: invoiceDetails.translateToEnglish,
      invoiceNumber: invoiceDetails.invoiceNumber,
      invoiceDate: invoiceDetails.invoiceDate,
      taxPointDate: invoiceDetails.taxPointDate,
      legalVatTextOverride: invoiceDetails.legalVatTextOverride,
    }));
    setCurrentStep('invoice');
  };

  const handleRecalculate = (newResult: VATCalculationResult) => {
    setCalculationResult(newResult);
  };

  const handleExplainVat = () => {
    setCurrentStep('explain');
  };

  const steps = [
    { id: 'country', label: 'Country' },
    { id: 'details', label: 'Details' },
    { id: 'results', label: 'Results' },
    { id: 'invoice', label: 'Invoice' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep || (currentStep === 'invoice-details' && s.id === 'invoice'));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <UsageLimitBanner />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Germany VAT Calculator</CardTitle>
          <CardDescription className="text-base font-medium">
            Built specifically for German VAT rules — not a generic EU calculator.
          </CardDescription>
          <FlowStepper steps={steps} currentStep={currentStepIndex} />
        </CardHeader>
        <CardContent>
          {currentStep === 'country' && (
            <CountrySelectionStep
              initialData={formData}
              onNext={handleCountryNext}
            />
          )}
          
          {currentStep === 'details' && (
            <TransactionDetailsStep
              initialData={formData}
              onNext={handleDetailsNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 'results' && calculationResult && (
            <VatResultsStep
              result={calculationResult}
              formData={formData}
              onViewInvoice={handleEnterInvoiceDetails}
              onExplainVat={handleExplainVat}
              onBack={handleBack}
              onGenerateNew={() => setCurrentStep('country')}
            />
          )}
          
          {currentStep === 'invoice-details' && calculationResult && (
            <InvoiceDetailsStep
              initialData={{
                sellerName: formData.sellerName,
                sellerAddress: formData.sellerAddress,
                sellerVatId: formData.sellerVatId,
                customerName: formData.customerName,
                customerAddress: formData.customerAddress,
                itemDescription: formData.itemDescription,
                translateToEnglish: formData.translateToEnglish,
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.invoiceDate,
                taxPointDate: formData.taxPointDate,
                legalVatTextOverride: formData.legalVatTextOverride,
              }}
              formData={formData}
              result={calculationResult}
              onNext={handleInvoiceDetailsNext}
              onBack={handleBack}
              onRecalculate={handleRecalculate}
            />
          )}
          
          {currentStep === 'invoice' && calculationResult && (
            <div>
              <InvoicePreview
                formData={formData}
                result={calculationResult}
                onBack={handleBack}
              />
            </div>
          )}
          
          {currentStep === 'explain' && calculationResult && (
            <ExplainVatPanel
              formData={formData}
              result={calculationResult}
              onBack={handleBack}
            />
          )}
        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
}
