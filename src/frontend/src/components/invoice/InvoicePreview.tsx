import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Shield } from 'lucide-react';
import { buildInvoiceHtml } from '../../lib/invoice/buildInvoiceHtml';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { useInvoiceQuota } from '../../hooks/useInvoiceQuota';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  formData: VATCalculationInput;
  result: VATCalculationResult;
  onBack: () => void;
}

export default function InvoicePreview({ formData, result, onBack }: InvoicePreviewProps) {
  const { saveInvoice, canSaveInvoice, isPro } = useInvoiceQuota();
  const invoiceHtml = buildInvoiceHtml(formData, result);
  const riskCheck = performInvoiceRiskCheck(formData, result);

  const handleSaveInvoice = async () => {
    const success = await saveInvoice();
    if (success) {
      toast.success('Invoice saved successfully!');
    } else {
      toast.error('Failed to save invoice. Please upgrade your plan.');
    }
  };

  const handleDownloadPDF = () => {
    if (!isPro) {
      toast.error('PDF export is only available for Pro users');
      return;
    }
    toast.info('PDF export feature coming soon!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-600">
          <Shield className="h-3 w-3 mr-1" />
          Audit-safe
        </Badge>
        <span className="text-sm text-muted-foreground">
          Designed to meet German tax office requirements
        </span>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm max-w-none"
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
        <Button
          onClick={handleSaveInvoice}
          disabled={!canSaveInvoice}
          className="flex-1"
        >
          Save Invoice
        </Button>
        {isPro && (
          <Button onClick={handleDownloadPDF} variant="secondary" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>
    </div>
  );
}
