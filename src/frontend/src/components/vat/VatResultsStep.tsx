import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info, ArrowLeft, RefreshCw } from 'lucide-react';
import { type VATCalculationResult } from '../../lib/vat/calculateVat';
import { type VATCalculationInput } from '../../lib/vat/calculateVat';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';

interface VatResultsStepProps {
  result: VATCalculationResult;
  formData: VATCalculationInput;
  onViewInvoice: () => void;
  onExplainVat: () => void;
  onBack: () => void;
  onGenerateNew: () => void;
  onOpenUpgradeModal?: () => void;
}

export default function VatResultsStep({
  result,
  formData,
  onViewInvoice,
  onExplainVat,
  onBack,
  onGenerateNew,
}: VatResultsStepProps) {
  const { log } = useEventLogger();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleExplainVat = () => {
    log(CORE_EVENTS.AI_EXPLAIN_CLICKED);
    onExplainVat();
  };

  const isReverseCharge = formData.reverseCharge && result.vatRatePercent === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Net Amount</span>
              <span className="font-medium">{formatCurrency(result.netAmountCents)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">
                VAT ({result.vatRatePercent}%)
              </span>
              <span className="font-medium">{formatCurrency(result.vatAmountCents)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span>{formatCurrency(result.grossAmountCents)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReverseCharge && (
        <Alert className="bg-muted/50 border-muted-foreground/20">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="ml-2 text-sm">
            <strong>Reverse charge applies under EU VAT Directive Article 44/196</strong>
          </AlertDescription>
        </Alert>
      )}

      {result.legalNote && !isReverseCharge && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Legal Note:</strong> {result.legalNote}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={onViewInvoice} variant="default" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Enter Invoice Details
        </Button>
        <Button onClick={handleExplainVat} variant="outline" className="w-full">
          <Info className="h-4 w-4 mr-2" />
          Explain VAT
        </Button>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" onClick={onGenerateNew} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          New Calculation
        </Button>
      </div>
    </div>
  );
}
