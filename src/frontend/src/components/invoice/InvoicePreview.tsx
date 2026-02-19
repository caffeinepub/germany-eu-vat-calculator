import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Save, AlertTriangle } from 'lucide-react';
import { buildInvoiceHtml } from '../../lib/invoice/buildInvoiceHtml';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { validateInvoiceMandatoryFields } from '../../lib/invoice/validateInvoiceMandatoryFields';
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
import { getAutoLegalVatText } from '../../lib/invoice/getAutoLegalVatText';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';
import LimitReachedModal from '../usage/LimitReachedModal';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  result: VATCalculationResult;
  calculationInput: VATCalculationInput;
  invoiceData: InvoiceData;
  onBack: () => void;
}

export default function InvoicePreview({ result, calculationInput, invoiceData, onBack }: InvoicePreviewProps) {
  const { saveInvoice, canSaveInvoice, remaining, activePlan } = useInvoiceQuota();
  const downloadPdf = useDownloadInvoicePdf();
  const { log } = useEventLogger();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const invoiceHtml = buildInvoiceHtml(invoiceData, result);
  
  const riskCheck = performInvoiceRiskCheck(calculationInput, result);

  // Generate auto legal text for validation
  const autoLegalText = getAutoLegalVatText(result.scenario, calculationInput.sellerCountry);

  // Final mandatory fields validation with line items
  const mandatoryFieldsValidation = validateInvoiceMandatoryFields(
    calculationInput,
    result,
    autoLegalText,
    invoiceData.lineItems
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const errors: string[] = [];
    
    // Check all mandatory fields
    if (!mandatoryFieldsValidation.allPassed) {
      errors.push(...mandatoryFieldsValidation.missingFields.map(field => `${field} is required.`));
    }

    setValidationErrors(errors);
  }, [mandatoryFieldsValidation]);

  const canDownloadPdf = validationErrors.length === 0;

  // Calculate VAT outcome using the VAT engine
  const invoiceTotals = calculateInvoiceTotals(invoiceData.lineItems || []);
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
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
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

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Please fix all validation errors before downloading PDF:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
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
