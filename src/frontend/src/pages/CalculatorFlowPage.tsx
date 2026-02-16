import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import TransactionDetailsStep from '../components/vat/TransactionDetailsStep';
import VatResultsStep from '../components/vat/VatResultsStep';
import InvoiceDetailsStep from '../components/invoice/InvoiceDetailsStep';
import InvoicePreview from '../components/invoice/InvoicePreview';
import ExplainVatPanel from '../components/vat/ExplainVatPanel';
import { type VATCalculationInput, type VATCalculationResult, calculateGermanyVAT } from '../lib/vat/calculateVat';
import { type InvoiceDetails } from '../components/invoice/InvoiceDetailsStep';
import { getSelectedSellerCountry } from '../lib/vat/selectedSellerCountry';
import { lookupVatConfig } from '../lib/vat/vatTable';

type Step = 'transaction' | 'results' | 'invoice' | 'preview' | 'explain';

export default function CalculatorFlowPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/calculator' });
  
  // Get seller country from URL with validation
  const sellerCountryResult = getSelectedSellerCountry();
  const urlSellerCountry = sellerCountryResult.countryCode;
  const hasCountryError = !sellerCountryResult.isValid;
  const countryErrorMessage = sellerCountryResult.errorMessage;
  
  // Get VAT config for the selected country
  const vatConfig = lookupVatConfig(urlSellerCountry);
  const defaultCurrency = vatConfig?.currency || 'EUR';
  
  const [currentStep, setCurrentStep] = useState<Step>('transaction');
  const [formData, setFormData] = useState<VATCalculationInput>({
    sellerCountry: urlSellerCountry,
    customerCountry: '',
    customerType: 'B2C',
    vatId: '',
    serviceCategory: 'digital',
    netAmount: 0,
    previousYearTurnover: 0,
    currentYearTurnover: 0,
    vatRate: 'standard',
    currency: defaultCurrency,
  });
  const [result, setResult] = useState<VATCalculationResult | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);

  // Update seller country and currency when URL changes
  useEffect(() => {
    const newSellerCountryResult = getSelectedSellerCountry();
    const newCountry = newSellerCountryResult.countryCode;
    const newVatConfig = lookupVatConfig(newCountry);
    const newCurrency = newVatConfig?.currency || 'EUR';
    
    setFormData(prev => ({
      ...prev,
      sellerCountry: newCountry,
      currency: newCurrency,
    }));
  }, [search.country]);

  const handleTransactionDetails = (data: Partial<VATCalculationInput>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    // Calculate VAT
    const calculationResult = calculateGermanyVAT(updatedData);
    setResult(calculationResult);
    setCurrentStep('results');
  };

  const handleViewInvoice = () => {
    setCurrentStep('invoice');
  };

  const handleInvoiceDetails = (details: InvoiceDetails) => {
    setInvoiceDetails(details);
    setCurrentStep('preview');
  };

  const handleExplainVat = () => {
    setCurrentStep('explain');
  };

  const handleBackToResults = () => {
    setCurrentStep('results');
  };

  const handleBackToInvoice = () => {
    setCurrentStep('invoice');
  };

  const handleBackToTransaction = () => {
    setCurrentStep('transaction');
  };

  const handleGenerateNew = () => {
    setCurrentStep('transaction');
    setResult(null);
    setInvoiceDetails(null);
  };

  const handleRecalculate = (newResult: VATCalculationResult) => {
    setResult(newResult);
  };

  // Show error state if country is invalid
  if (hasCountryError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertDescription className="ml-2 text-red-900 dark:text-red-100">
              <p className="font-semibold mb-2">Invalid Country Selection</p>
              <p className="text-sm">{countryErrorMessage}</p>
              <p className="text-sm mt-2">
                Please use a valid country code in the URL (e.g., ?country=GB) or remove the parameter to use the default (Germany).
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {currentStep === 'transaction' && (
          <TransactionDetailsStep
            initialData={formData}
            onNext={handleTransactionDetails}
            onBack={() => navigate({ to: '/' })}
          />
        )}
        
        {currentStep === 'results' && result && (
          <VatResultsStep
            formData={formData}
            result={result}
            onViewInvoice={handleViewInvoice}
            onBack={handleBackToTransaction}
            onExplainVat={handleExplainVat}
            onGenerateNew={handleGenerateNew}
            onOpenUpgradeModal={() => {}}
          />
        )}
        
        {currentStep === 'invoice' && result && (
          <InvoiceDetailsStep
            initialData={invoiceDetails || undefined}
            formData={formData}
            result={result}
            onNext={handleInvoiceDetails}
            onBack={handleBackToResults}
            onRecalculate={handleRecalculate}
          />
        )}
        
        {currentStep === 'preview' && result && invoiceDetails && (
          <InvoicePreview
            formData={invoiceDetails}
            result={result}
            onBack={handleBackToInvoice}
          />
        )}
        
        {currentStep === 'explain' && result && (
          <ExplainVatPanel
            formData={formData}
            result={result}
          />
        )}
      </div>
    </div>
  );
}
