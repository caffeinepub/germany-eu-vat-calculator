import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info, ArrowLeft, RefreshCw, Download, TrendingUp } from 'lucide-react';
import { type VATCalculationResult } from '../../lib/vat/calculateVat';
import { type VATCalculationInput } from '../../lib/vat/calculateVat';
import { checkOSSRelevance } from '../../lib/vat/ossIndicator';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { toast } from 'sonner';

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
  onOpenUpgradeModal,
}: VatResultsStepProps) {
  const { isPro } = usePlanAccess();
  const { log } = useEventLogger();
  const ossRelevance = checkOSSRelevance(formData);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleExportOSS = () => {
    if (!isPro) {
      toast.error('OSS report export is only available for Pro users');
      return;
    }
    toast.info('OSS report export feature coming soon!');
  };

  const handleExplainVat = () => {
    log(CORE_EVENTS.AI_EXPLAIN_CLICKED);
    onExplainVat();
  };

  const handleInlineUpgrade = () => {
    log(CORE_EVENTS.UPGRADE_CTA_SHOWN, 'inline_upsell');
    if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    }
  };

  const isReverseCharge = result.scenario === 'reverse-charge' && result.vatRatePercent === 0;

  return (
    <div className="space-y-6">
      {result.scenario === 'kleinunternehmer' && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
            <strong>You qualify as a Kleinunternehmer. VAT should NOT be charged.</strong>
          </AlertDescription>
        </Alert>
      )}

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

      {result.legalNote && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Legal Note:</strong> {result.legalNote}
          </AlertDescription>
        </Alert>
      )}

      {isReverseCharge && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100">
            <div className="space-y-1">
              <p className="font-medium">Steuerschuldnerschaft des Leistungsempfängers (§13b UStG)</p>
              <p className="text-sm">Tax liability of the recipient of services (§13b UStG)</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Inline Upsell */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="ml-2">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">⚠️ Note:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Cross-border EU business may require reverse-charge rules. Pro users get automatic checks and explanations.
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleInlineUpgrade}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upgrade for audit-safe invoices
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {ossRelevance.isRelevant && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100">
            <div className="space-y-2">
              <p><strong>OSS registration recommended</strong></p>
              <p className="text-sm">{ossRelevance.reason}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportOSS}
                className="mt-2"
              >
                <Download className="h-3 w-3 mr-2" />
                Export OSS report (Pro)
              </Button>
            </div>
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
