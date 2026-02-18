import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { type VATCalculationResult } from '../../lib/vat/calculateVat';
import { getCountryCurrency } from '../../lib/invoice/currency';

interface VatResultsStepProps {
  result: VATCalculationResult;
  countryCode: string;
  onNext: () => void;
  onBack: () => void;
}

export default function VatResultsStep({
  result,
  countryCode,
  onNext,
  onBack,
}: VatResultsStepProps) {
  const currency = getCountryCurrency(countryCode);
  
  const netAmount = result.netAmountCents / 100;
  const vatAmount = result.vatAmountCents / 100;
  const grossAmount = result.grossAmountCents / 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Determine classification and educational note based on scenario and cross-border treatment
  let classification = 'Standard VAT';
  let educationalNote = 'Standard VAT rate applies to this transaction.';
  let alertVariant: 'default' | 'destructive' = 'default';

  if (result.crossBorderVatTreatment === 'INTRA_EU_SUPPLY_0_PERCENT') {
    classification = 'Intra-EU Supply (0%)';
    educationalNote = 'VAT exempt intra-Community supply under Article 138 EU VAT Directive. The buyer will account for VAT in their country (reverse charge mechanism).';
    alertVariant = 'default';
  } else if (result.crossBorderVatTreatment === 'REVERSE_CHARGE') {
    classification = 'Reverse Charge (0%)';
    educationalNote = 'Reverse charge applies — customer to account for VAT. The buyer is responsible for accounting for VAT in their jurisdiction.';
    alertVariant = 'default';
  } else if (result.crossBorderVatTreatment === 'EXPORT_0_PERCENT') {
    classification = 'Export (0%)';
    educationalNote = 'Zero-rated export outside VAT territory. This supply is outside the scope of domestic VAT as it is exported to another tax jurisdiction.';
    alertVariant = 'default';
  } else if (result.scenario === 'reverse-charge' || result.scenario === 'uk-reverse-charge') {
    classification = 'Reverse Charge';
    educationalNote = 'Reverse charge mechanism applies. The customer is responsible for accounting for VAT.';
    alertVariant = 'default';
  } else if (result.scenario === 'vat-exempt' || result.scenario === 'uk-exempt') {
    classification = 'Exempt';
    educationalNote = 'This transaction is VAT exempt. Ensure you have a valid legal basis for the exemption.';
    alertVariant = 'destructive';
  } else if (result.scenario === 'uk-export-zero' && result.message === 'Zero Rated Export') {
    classification = 'Zero Rated Export';
    educationalNote = 'Zero-rated export. This supply is taxable at 0% as it is exported outside the VAT territory.';
    alertVariant = 'default';
  } else if (result.scenario === 'uk-export-zero' && result.message === 'Zero Rated') {
    classification = 'Zero Rated';
    educationalNote = 'Zero-rated supply. This is a taxable supply at 0% VAT rate.';
    alertVariant = 'default';
  } else if (result.scenario === 'b2c-reduced') {
    classification = 'Reduced VAT';
    educationalNote = 'Reduced VAT rate applies to this transaction based on the product category.';
    alertVariant = 'default';
  } else if (result.scenario === 'kleinunternehmer') {
    classification = 'Kleinunternehmer (Small Business)';
    educationalNote = 'VAT exempt under §19 UStG (German small business regulation).';
    alertVariant = 'default';
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">VAT Calculation Results</h2>
        <p className="text-muted-foreground">Review your VAT calculation details</p>
      </div>

      {/* Classification Badge */}
      <div className="flex justify-center">
        <Badge variant={alertVariant === 'destructive' ? 'destructive' : 'default'} className="text-lg px-4 py-2">
          {classification}
        </Badge>
      </div>

      {/* Educational Note */}
      <Alert variant={alertVariant}>
        <Info className="h-4 w-4" />
        <AlertDescription>{educationalNote}</AlertDescription>
      </Alert>

      {/* Calculation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-muted-foreground">Net Amount</span>
            <span className="font-semibold">{formatCurrency(netAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-muted-foreground">VAT Rate</span>
            <span className="font-semibold">{result.vatRatePercent}%</span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-muted-foreground">VAT Amount</span>
            <span className="font-semibold">{formatCurrency(vatAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold">Gross Amount</span>
            <span className="text-lg font-bold">{formatCurrency(grossAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Legal Note */}
      {result.legalNote && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {result.legalNote}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue to Invoice
        </Button>
      </div>
    </div>
  );
}
