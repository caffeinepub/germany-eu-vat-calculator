import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, BookOpen, Plus, Info } from 'lucide-react';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { formatCurrency } from '../../lib/invoice/currency';

interface VatResultsStepProps {
  result: VATCalculationResult;
  formData: VATCalculationInput;
  onViewInvoice: () => void;
  onExplainVat: () => void;
  onBack: () => void;
  onGenerateNew: () => void;
  onOpenUpgradeModal: () => void;
}

export default function VatResultsStep({
  result,
  formData,
  onViewInvoice,
  onExplainVat,
  onBack,
  onGenerateNew,
}: VatResultsStepProps) {
  const currency = formData.currency || (formData.region === 'UK' ? 'GBP' : 'EUR');
  const netAmount = result.netAmountCents / 100;
  const vatAmount = result.vatAmountCents / 100;
  const grossAmount = result.grossAmountCents / 100;

  const isReverseCharge = result.scenario === 'reverse-charge' || result.scenario === 'uk-reverse-charge';
  const isVatExempt = result.scenario === 'vat-exempt' || result.scenario === 'uk-exempt';
  const isKleinunternehmer = result.scenario === 'kleinunternehmer';
  const isUkExportZero = result.scenario === 'uk-export-zero';

  // Determine VAT type for UK scenarios
  const ukVatType = (result as any).vatType as string | undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">VAT Calculation Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Net Amount:</span>
              <span className="font-semibold text-lg">{formatCurrency(netAmount, currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">
                VAT ({result.vatRatePercent}%):
              </span>
              <span className="font-semibold text-lg">{formatCurrency(vatAmount, currency)}</span>
            </div>

            <div className="flex justify-between items-center py-3 bg-muted/30 rounded-lg px-4">
              <span className="font-medium text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(grossAmount, currency)}</span>
            </div>
          </div>

          {/* UK Export Zero Rated */}
          {isUkExportZero && ukVatType === 'Zero Rated' && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2 text-green-900 dark:text-green-100">
                <p className="font-medium mb-1">Zero Rated Export</p>
                <p className="text-sm">
                  {result.message || 'Zero-rated export under UK VAT legislation.'}
                </p>
                <p className="text-xs mt-2 opacity-80">
                  This is a taxable supply at 0%. Input VAT is recoverable.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* UK Reverse Charge */}
          {isReverseCharge && ukVatType === 'Reverse Charge' && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Reverse Charge</p>
                <p className="text-sm">
                  {result.message || 'Reverse charge – customer to account for VAT.'}
                </p>
                <p className="text-xs mt-2 opacity-80">
                  Customer is responsible for accounting for VAT in their jurisdiction.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* EU Reverse Charge (non-UK) */}
          {isReverseCharge && !ukVatType && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Reverse Charge Applies</p>
                <p className="text-sm">
                  {result.message || 'VAT liability shifts to the customer. Your invoice must include the reverse charge legal note.'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* VAT Exempt */}
          {isVatExempt && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
                <p className="font-medium mb-1">VAT Exempt Transaction</p>
                <p className="text-sm">
                  {result.message || 'This transaction is VAT exempt. Your invoice must include a legal note explaining the exemption basis.'}
                </p>
                <p className="text-xs mt-2 opacity-80">
                  Exempt supplies are not taxable. Input VAT is usually not recoverable.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Kleinunternehmer */}
          {isKleinunternehmer && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2 text-green-900 dark:text-green-100">
                <p className="font-medium mb-1">Kleinunternehmer Exemption</p>
                <p className="text-sm">
                  Small business exemption under §19 UStG applies. Your invoice must include the §19 UStG reference.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button onClick={onViewInvoice} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
        <Button onClick={onExplainVat} variant="outline" className="w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          Explain VAT
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" onClick={onGenerateNew} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          New Calculation
        </Button>
      </div>
    </div>
  );
}
