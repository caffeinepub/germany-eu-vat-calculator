import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Save, AlertTriangle } from 'lucide-react';
import { buildInvoiceHtml } from '../../lib/invoice/buildInvoiceHtml';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { validateInvoiceComplianceSync } from '../../lib/invoice/validateInvoiceCompliance';
import { deriveInvoiceVatOutcome } from '../../lib/invoice/deriveInvoiceVatOutcome';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { calculateInvoiceTotals } from '../../lib/invoice/invoiceLineItems';
import { type InvoiceData } from './InvoiceDetailsStep';
import { useInvoiceQuota } from '../../hooks/useInvoiceQuota';
import { useDownloadInvoicePdf } from '../../hooks/useInvoiceOperations';
import { useEventLogger } from '../../hooks/useEventLogger';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { downloadFile } from '../../utils/downloadFile';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';
import LimitReachedModal from '../usage/LimitReachedModal';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  result: VATCalculationResult;
  calculationInput: VATCalculationInput;
  onBack: () => void;
}

export default function InvoicePreview({ result, calculationInput, onBack }: InvoicePreviewProps) {
  const { saveInvoice, canSaveInvoice, remaining, activePlan } = useInvoiceQuota();
  const downloadPdf = useDownloadInvoicePdf();
  const { log } = useEventLogger();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Create a mock InvoiceData from calculationInput for preview
  const mockInvoiceData: InvoiceData = {
    invoiceNumber: calculationInput.invoiceNumber || 'INV-PREVIEW',
    invoiceDate: calculationInput.invoiceDate || new Date().toISOString().split('T')[0],
    sellerName: calculationInput.sellerName || '',
    sellerAddress: calculationInput.sellerAddress || '',
    sellerVatId: calculationInput.sellerVatId || '',
    sellerCountry: calculationInput.sellerCountry,
    customerName: calculationInput.customerName || '',
    customerAddress: calculationInput.customerAddress || '',
    customerVatId: calculationInput.vatId || '',
    lineItems: [],
    legalVatText: calculationInput.legalVatTextOverride || '',
    notes: '',
  };
  
  const invoiceHtml = buildInvoiceHtml(mockInvoiceData, result);
  
  const riskCheck = performInvoiceRiskCheck(calculationInput, result);

  // Final compliance validation
  const finalValidation = validateInvoiceComplianceSync(
    calculationInput,
    result,
    mockInvoiceData.lineItems || [],
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
  const invoiceTotals = calculateInvoiceTotals(mockInvoiceData.lineItems || []);
  const vatOutcome = deriveInvoiceVatOutcome(calculationInput, result, invoiceTotals.netAmount);

  const handleSaveInvoice = async () => {
    if (!canSaveInvoice) {
      toast.error('Free plan limit reached: Maximum 5 invoices per month');
      return;
    }

    if (!canDownloadPdf) {
      toast.error('Please fix all validation errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const invoiceId = `inv-${Date.now()}`;
      
      await saveInvoice({
        id: invoiceId,
        invoiceNumber: mockInvoiceData.invoiceNumber,
        invoiceDate: mockInvoiceData.invoiceDate,
        htmlSource: invoiceHtml,
        vatAmount: vatOutcome.vatAmount,
        vatRate: vatOutcome.vatRate,
        currency: vatOutcome.currency,
        vatLabel: vatOutcome.vatLabel,
      });

      setSavedInvoiceId(invoiceId);
      log(CORE_EVENTS.INVOICE_DOWNLOADED);
      toast.success('Invoice saved successfully');
    } catch (error: any) {
      if (error.message?.includes('Free plan limit reached')) {
        setShowLimitReachedModal(true);
      } else {
        toast.error('Failed to save invoice');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!savedInvoiceId) {
      toast.error('Please save the invoice first');
      return;
    }

    try {
      const result = await downloadPdf.mutateAsync(savedInvoiceId);
      downloadFile(result.content, result.filename, 'application/pdf');
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
        </CardContent>
      </Card>

      {complianceErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Compliance Errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {complianceErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <InvoiceRiskCheckPanel riskCheck={riskCheck} />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSaveInvoice}
          disabled={!canDownloadPdf || isSaving}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </Button>
        {savedInvoiceId && (
          <Button
            onClick={handleDownloadPdf}
            disabled={downloadPdf.isPending}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloadPdf.isPending ? 'Downloading...' : 'Download PDF'}
          </Button>
        )}
      </div>

      <LimitReachedModal open={showLimitReachedModal} onOpenChange={setShowLimitReachedModal} />
    </div>
  );
}
