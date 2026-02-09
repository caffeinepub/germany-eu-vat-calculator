import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Languages, AlertTriangle, Lock } from 'lucide-react';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { getAutoLegalVatText } from '../../lib/invoice/getAutoLegalVatText';
import { validateInvoiceMandatoryFields } from '../../lib/invoice/validateInvoiceMandatoryFields';
import { checkHistoricalRateDifference } from '../../lib/vat/germanyVatRateHistory';
import { calculateGermanyVAT } from '../../lib/vat/calculateVat';
import InvoiceMandatoryFieldsChecklist from './InvoiceMandatoryFieldsChecklist';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { toast } from 'sonner';

export interface InvoiceDetails {
  sellerName: string;
  sellerAddress: string;
  sellerVatId: string;
  customerName: string;
  customerAddress: string;
  itemDescription: string;
  translateToEnglish: boolean;
  invoiceNumber: string;
  invoiceDate: string;
  taxPointDate: string;
  legalVatTextOverride?: string;
}

interface InvoiceDetailsStepProps {
  initialData?: Partial<InvoiceDetails>;
  formData: VATCalculationInput;
  result: VATCalculationResult;
  onNext: (data: InvoiceDetails) => void;
  onBack: () => void;
  onRecalculate: (newResult: VATCalculationResult) => void;
}

export default function InvoiceDetailsStep({ 
  initialData, 
  formData,
  result,
  onNext, 
  onBack,
  onRecalculate,
}: InvoiceDetailsStepProps) {
  const { isPaid } = usePlanAccess();
  const today = new Date().toISOString().split('T')[0];
  
  const [invoiceData, setInvoiceData] = useState<InvoiceDetails>({
    sellerName: initialData?.sellerName || formData.sellerName || '',
    sellerAddress: initialData?.sellerAddress || formData.sellerAddress || '',
    sellerVatId: initialData?.sellerVatId || formData.sellerVatId || '',
    customerName: initialData?.customerName || formData.customerName || '',
    customerAddress: initialData?.customerAddress || formData.customerAddress || '',
    itemDescription: initialData?.itemDescription || formData.itemDescription || '',
    translateToEnglish: initialData?.translateToEnglish || formData.translateToEnglish || false,
    invoiceNumber: initialData?.invoiceNumber || formData.invoiceNumber || '',
    invoiceDate: initialData?.invoiceDate || formData.invoiceDate || today,
    taxPointDate: initialData?.taxPointDate || formData.taxPointDate || today,
    legalVatTextOverride: initialData?.legalVatTextOverride || formData.legalVatTextOverride || '',
  });

  const [showHistoricalWarning, setShowHistoricalWarning] = useState(false);
  const [historicalRateInfo, setHistoricalRateInfo] = useState<any>(null);

  const autoLegalText = getAutoLegalVatText(result.scenario);
  const displayLegalText = invoiceData.legalVatTextOverride || autoLegalText;

  // Create a combined input for validation
  const combinedInput: VATCalculationInput = {
    ...formData,
    ...invoiceData,
    vatId: formData.vatId,
  };

  const validation = validateInvoiceMandatoryFields(combinedInput, result, autoLegalText);

  useEffect(() => {
    if (invoiceData.invoiceDate) {
      const rateDiff = checkHistoricalRateDifference(invoiceData.invoiceDate, formData.vatRate);
      if (rateDiff) {
        setShowHistoricalWarning(true);
        setHistoricalRateInfo(rateDiff);
      } else {
        setShowHistoricalWarning(false);
        setHistoricalRateInfo(null);
      }
    }
  }, [invoiceData.invoiceDate, formData.vatRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(invoiceData);
  };

  const updateField = (field: keyof InvoiceDetails, value: string | boolean) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleLegalTextEdit = () => {
    if (!isPaid) {
      toast.error('Custom legal VAT text is only available for paid plans. Please upgrade to edit.');
      return;
    }
  };

  const handleHistoricalRecalculation = () => {
    if (!isPaid) {
      toast.error('Historical VAT recalculation is only available for paid plans. Please upgrade.');
      return;
    }
    
    const newResult = calculateGermanyVAT(formData, invoiceData.invoiceDate);
    onRecalculate(newResult);
    toast.success('VAT recalculated for historical date');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InvoiceMandatoryFieldsChecklist validation={validation} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Mode
          </CardTitle>
          <CardDescription>
            Enable to input invoice details in German and display them in English on the final invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="translate-mode"
              checked={invoiceData.translateToEnglish}
              onCheckedChange={(checked) => updateField('translateToEnglish', checked)}
            />
            <Label htmlFor="translate-mode" className="cursor-pointer">
              {invoiceData.translateToEnglish 
                ? 'German input → English output' 
                : 'Standard mode (English)'}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice Number *</Label>
          <Input
            id="invoice-number"
            value={invoiceData.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
            placeholder="e.g. INV-2026-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seller-vat-id">Seller VAT ID *</Label>
          <Input
            id="seller-vat-id"
            value={invoiceData.sellerVatId}
            onChange={(e) => updateField('sellerVatId', e.target.value)}
            placeholder="e.g. DE123456789"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice-date">Invoice Date *</Label>
          <Input
            id="invoice-date"
            type="date"
            value={invoiceData.invoiceDate}
            onChange={(e) => updateField('invoiceDate', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-point-date">Tax Point Date *</Label>
          <Input
            id="tax-point-date"
            type="date"
            value={invoiceData.taxPointDate}
            onChange={(e) => updateField('taxPointDate', e.target.value)}
            required
          />
        </div>
      </div>

      {showHistoricalWarning && historicalRateInfo && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-2">Historical VAT rate detected</p>
            <p className="text-sm mb-2">
              Invoice date uses {historicalRateInfo.historicalRate}% rate ({historicalRateInfo.description}), 
              but current rate is {historicalRateInfo.currentRate}%.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleHistoricalRecalculation}
              disabled={!isPaid}
            >
              {!isPaid && <Lock className="h-3 w-3 mr-2" />}
              Recalculate with historical rate {!isPaid && '(Paid)'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seller-name">
            Seller Name {invoiceData.translateToEnglish && '(German)'}
          </Label>
          <Input
            id="seller-name"
            value={invoiceData.sellerName}
            onChange={(e) => updateField('sellerName', e.target.value)}
            placeholder={invoiceData.translateToEnglish ? 'z.B. Mustermann GmbH' : 'e.g. Your Company Name'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seller-address">
            Seller Address {invoiceData.translateToEnglish && '(German)'}
          </Label>
          <Textarea
            id="seller-address"
            value={invoiceData.sellerAddress}
            onChange={(e) => updateField('sellerAddress', e.target.value)}
            placeholder={invoiceData.translateToEnglish 
              ? 'z.B. Musterstraße 123\n12345 Berlin\nDeutschland' 
              : 'e.g. 123 Main Street\nBerlin 12345\nGermany'}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-name">
            Customer Name {invoiceData.translateToEnglish && '(German)'}
          </Label>
          <Input
            id="customer-name"
            value={invoiceData.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
            placeholder={invoiceData.translateToEnglish ? 'z.B. Kunde GmbH' : 'e.g. Customer Company'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-address">
            Customer Address {invoiceData.translateToEnglish && '(German)'}
          </Label>
          <Textarea
            id="customer-address"
            value={invoiceData.customerAddress}
            onChange={(e) => updateField('customerAddress', e.target.value)}
            placeholder={invoiceData.translateToEnglish 
              ? 'z.B. Kundenstraße 456\n54321 München\nDeutschland' 
              : 'e.g. 456 Customer Street\nMunich 54321\nGermany'}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-description">
            Item/Service Description {invoiceData.translateToEnglish && '(German)'}
          </Label>
          <Textarea
            id="item-description"
            value={invoiceData.itemDescription}
            onChange={(e) => updateField('itemDescription', e.target.value)}
            placeholder={invoiceData.translateToEnglish 
              ? 'z.B. Software Entwicklung und Beratung' 
              : 'e.g. Software Development and Consulting'}
            rows={2}
            required
          />
        </div>

        {displayLegalText && (
          <div className="space-y-2">
            <Label htmlFor="legal-vat-text">
              Legal VAT Text
              {!isPaid && <span className="text-xs text-muted-foreground ml-2">(Read-only - Upgrade to edit)</span>}
            </Label>
            <Textarea
              id="legal-vat-text"
              value={displayLegalText}
              onChange={(e) => isPaid && updateField('legalVatTextOverride', e.target.value)}
              onClick={handleLegalTextEdit}
              readOnly={!isPaid}
              className={!isPaid ? 'cursor-not-allowed bg-muted' : ''}
              rows={3}
            />
            {!isPaid && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Upgrade to Starter or Pro to customize legal VAT text
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Preview Invoice
        </Button>
      </div>
    </form>
  );
}
