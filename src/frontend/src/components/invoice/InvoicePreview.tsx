import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Shield, Save } from 'lucide-react';
import { buildInvoiceHtml } from '../../lib/invoice/buildInvoiceHtml';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { useInvoiceQuota } from '../../hooks/useInvoiceQuota';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { useDownloadInvoicePdf } from '../../hooks/useInvoiceOperations';
import { useAnonymousUsage } from '../../hooks/useAnonymousUsage';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { downloadFile } from '../../utils/downloadFile';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';
import UpgradeModal from '../usage/UpgradeModal';
import LimitReachedModal from '../usage/LimitReachedModal';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  formData: VATCalculationInput;
  result: VATCalculationResult;
  onBack: () => void;
}

export default function InvoicePreview({ formData, result, onBack }: InvoicePreviewProps) {
  const { saveInvoice, canSaveInvoice, remaining, activePlan } = useInvoiceQuota();
  const { isPaid } = usePlanAccess();
  const downloadPdf = useDownloadInvoicePdf();
  const anonymousUsage = useAnonymousUsage();
  const { log } = useEventLogger();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  
  const invoiceHtml = buildInvoiceHtml(formData, result);
  const riskCheck = performInvoiceRiskCheck(formData, result);

  const handleSaveInvoice = async () => {
    if (!canSaveInvoice) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await saveInvoice({
        id: invoiceId,
        invoiceNumber: formData.invoiceNumber || 'DRAFT',
        invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
        htmlSource: invoiceHtml,
      });
      setSavedInvoiceId(invoiceId);
      toast.success('Invoice saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice');
    }
  };

  const handleDownloadPdf = async () => {
    // Check anonymous usage limit first (for non-authenticated users)
    if (!isPaid && anonymousUsage.isAvailable && !anonymousUsage.canUse) {
      log(CORE_EVENTS.FREE_LIMIT_REACHED, JSON.stringify({
        currentCount: anonymousUsage.currentCount,
        limit: 5,
      }));
      setShowLimitReachedModal(true);
      return;
    }

    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    if (!savedInvoiceId) {
      toast.error('Please save the invoice first');
      return;
    }

    try {
      // Increment anonymous usage if applicable
      if (anonymousUsage.isAvailable) {
        await anonymousUsage.increment();
      }

      const pdfFile = await downloadPdf.mutateAsync(savedInvoiceId);
      downloadFile(pdfFile.content, pdfFile.filename, 'application/pdf');
      
      log(CORE_EVENTS.INVOICE_DOWNLOADED, JSON.stringify({
        invoiceId: savedInvoiceId,
        invoiceNumber: formData.invoiceNumber,
      }));
      
      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const handlePrint = () => {
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
        {!isPaid && (
          <Badge variant="outline" className="text-xs">
            Free Plan: {remaining} invoices remaining this month
          </Badge>
        )}
      </div>

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
        <Button onClick={handleSaveInvoice} disabled={!!savedInvoiceId} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {savedInvoiceId ? 'Saved' : 'Save Invoice'}
        </Button>
        <Button onClick={handleDownloadPdf} disabled={!savedInvoiceId} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF {!isPaid && '(Starter/Pro)'}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Shield className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      <LimitReachedModal open={showLimitReachedModal} onOpenChange={setShowLimitReachedModal} />
    </div>
  );
}
