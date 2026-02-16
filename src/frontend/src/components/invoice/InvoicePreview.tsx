import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Shield, Save, AlertTriangle } from 'lucide-react';
import { buildInvoiceHtml } from '../../lib/invoice/buildInvoiceHtml';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { validateInvoiceComplianceSync } from '../../lib/invoice/validateInvoiceCompliance';
import { deriveInvoiceVatOutcome } from '../../lib/invoice/deriveInvoiceVatOutcome';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { type InvoiceLineItem, calculateInvoiceTotals } from '../../lib/invoice/invoiceLineItems';
import { type InvoiceDetails } from './InvoiceDetailsStep';
import { useInvoiceQuota } from '../../hooks/useInvoiceQuota';
import { useDownloadInvoicePdf } from '../../hooks/useInvoiceOperations';
import { useAnonymousUsage } from '../../hooks/useAnonymousUsage';
import { useEventLogger } from '../../hooks/useEventLogger';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { downloadFile } from '../../utils/downloadFile';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';
import LimitReachedModal from '../usage/LimitReachedModal';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  formData: InvoiceDetails;
  result: VATCalculationResult;
  onBack: () => void;
}

export default function InvoicePreview({ formData, result, onBack }: InvoicePreviewProps) {
  const { saveInvoice, canSaveInvoice, remaining, activePlan } = useInvoiceQuota();
  const downloadPdf = useDownloadInvoicePdf();
  const anonymousUsage = useAnonymousUsage();
  const { log } = useEventLogger();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  
  const invoiceHtml = buildInvoiceHtml(formData, result);
  
  // Create a combined input for risk check
  const riskCheckInput: VATCalculationInput = {
    sellerCountry: formData.sellerCountry,
    customerCountry: formData.customerCountry,
    customerType: 'B2B',
    vatId: '',
    serviceCategory: formData.serviceCategory,
    netAmount: 0,
    previousYearTurnover: 0,
    currentYearTurnover: 0,
    vatRate: 'standard',
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
    currency: formData.currency,
    legalVatTextOverride: formData.legalVatTextOverride,
  };
  
  const riskCheck = performInvoiceRiskCheck(riskCheckInput, result);

  // Final compliance validation
  const finalValidation = validateInvoiceComplianceSync(
    riskCheckInput,
    result,
    formData.lineItems || [],
    invoiceHtml
  );

  const [complianceErrors, setComplianceErrors] = useState<string[]>([]);

  useEffect(() => {
    setComplianceErrors(
      finalValidation.errors.filter(e => e.blocking).map(e => e.message)
    );
  }, [finalValidation]);

  const canDownloadPdf = complianceErrors.length === 0;

  // Calculate VAT outcome using the VAT engine
  const invoiceTotals = calculateInvoiceTotals(formData.lineItems || []);
  const vatOutcome = deriveInvoiceVatOutcome(riskCheckInput, result, invoiceTotals.netAmount);

  const handleSaveInvoice = async () => {
    if (!canSaveInvoice) {
      toast.error('Free plan limit reached: Maximum 5 invoices per month');
      return;
    }

    if (!canDownloadPdf) {
      toast.error('Please fix all validation errors before saving.');
      return;
    }

    try {
      const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await saveInvoice({
        id: invoiceId,
        invoiceNumber: formData.invoiceNumber || 'DRAFT',
        invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
        htmlSource: invoiceHtml,
        vatRate: vatOutcome.vatRate,
        vatAmount: vatOutcome.vatAmount,
        currency: vatOutcome.currency,
        vatLabel: vatOutcome.vatLabel,
      });
      setSavedInvoiceId(invoiceId);
      toast.success('Invoice saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice');
    }
  };

  const handleDownloadPdf = async () => {
    if (!canDownloadPdf) {
      toast.error('Cannot download PDF. Please fix all validation errors first.');
      return;
    }

    // Check anonymous usage limit
    if (!isAuthenticated && anonymousUsage.isAvailable && !anonymousUsage.canUse) {
      log(CORE_EVENTS.FREE_LIMIT_REACHED, JSON.stringify({
        currentCount: anonymousUsage.currentCount,
        limit: 5,
      }));
      setShowLimitReachedModal(true);
      return;
    }

    try {
      // Save invoice first if not saved
      let invoiceId = savedInvoiceId;
      if (!invoiceId) {
        invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await saveInvoice({
          id: invoiceId,
          invoiceNumber: formData.invoiceNumber || 'DRAFT',
          invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
          htmlSource: invoiceHtml,
          vatRate: vatOutcome.vatRate,
          vatAmount: vatOutcome.vatAmount,
          currency: vatOutcome.currency,
          vatLabel: vatOutcome.vatLabel,
        });
        setSavedInvoiceId(invoiceId);
      }

      // Increment anonymous usage if applicable
      if (!isAuthenticated && anonymousUsage.isAvailable) {
        await anonymousUsage.increment();
      }

      const pdfFile = await downloadPdf.mutateAsync(invoiceId);
      downloadFile(pdfFile.content, pdfFile.filename, 'application/pdf');
      
      log(CORE_EVENTS.INVOICE_DOWNLOADED, JSON.stringify({
        invoiceId: invoiceId,
        invoiceNumber: formData.invoiceNumber,
      }));
      
      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const handlePrint = () => {
    if (!canDownloadPdf) {
      toast.error('Cannot print. Please fix all validation errors first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const showWatermark = activePlan === 'free';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoice Preview</h2>
        {isAuthenticated && activePlan === 'free' && (
          <Badge variant="outline" className="text-xs">
            Free Plan: {remaining} invoices remaining this month
          </Badge>
        )}
      </div>

      {/* Compliance Errors */}
      {complianceErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="ml-2 text-red-900 dark:text-red-100">
            <p className="font-medium mb-2">Cannot download PDF - please fix the following:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {complianceErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className="relative overflow-hidden">
        {showWatermark && (
          <div className="watermark-overlay">
            <div className="watermark-text">FREE PLAN</div>
          </div>
        )}
        <CardContent className="p-6">
          <div
            className="invoice-preview-content"
            dangerouslySetInnerHTML={{ __html: invoiceHtml }}
          />
        </CardContent>
      </Card>

      <InvoiceRiskCheckPanel riskCheck={riskCheck} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {isAuthenticated && (
          <Button 
            onClick={handleSaveInvoice} 
            disabled={!!savedInvoiceId || !canDownloadPdf} 
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {savedInvoiceId ? 'Saved' : 'Save Invoice'}
          </Button>
        )}
        <Button 
          onClick={handleDownloadPdf} 
          disabled={!canDownloadPdf}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={!canDownloadPdf}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <LimitReachedModal open={showLimitReachedModal} onOpenChange={setShowLimitReachedModal} />
    </div>
  );
}
