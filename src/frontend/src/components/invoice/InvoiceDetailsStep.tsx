import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Languages, AlertTriangle, Lock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type VATCalculationInput, type VATCalculationResult, type ServiceCategory } from '../../lib/vat/calculateVat';
import { getAutoLegalVatText } from '../../lib/invoice/getAutoLegalVatText';
import { validateInvoiceMandatoryFields } from '../../lib/invoice/validateInvoiceMandatoryFields';
import { checkHistoricalRateDifference } from '../../lib/vat/germanyVatRateHistory';
import { calculateGermanyVAT } from '../../lib/vat/calculateVat';
import InvoiceMandatoryFieldsChecklist from './InvoiceMandatoryFieldsChecklist';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { usePreferredLanguage } from '../../hooks/usePreferredLanguage';
import { toast } from 'sonner';

export interface InvoiceDetails {
  sellerName: string;
  sellerAddress: string;
  sellerVatId: string;
  customerName: string;
  customerAddress: string;
  serviceCategory: ServiceCategory;
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
  const { isEnglish } = usePreferredLanguage();
  const today = new Date().toISOString().split('T')[0];
  
  const [invoiceData, setInvoiceData] = useState<InvoiceDetails>({
    sellerName: initialData?.sellerName || formData.sellerName || '',
    sellerAddress: initialData?.sellerAddress || formData.sellerAddress || '',
    sellerVatId: initialData?.sellerVatId || formData.sellerVatId || '',
    customerName: initialData?.customerName || formData.customerName || '',
    customerAddress: initialData?.customerAddress || formData.customerAddress || '',
    serviceCategory: initialData?.serviceCategory || formData.serviceCategory || 'digital',
    itemDescription: initialData?.itemDescription || formData.itemDescription || '',
    translateToEnglish: initialData?.translateToEnglish ?? formData.translateToEnglish ?? isEnglish,
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
            Automatically translate invoice details from your input language to English for the final invoice
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
                ? 'Translation enabled' 
                : 'Translation disabled'}
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
              Recalculate with historical rate
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="seller-name">Seller Name *</Label>
        <Input
          id="seller-name"
          value={invoiceData.sellerName}
          onChange={(e) => updateField('sellerName', e.target.value)}
          placeholder="Your Company Name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-address">Seller Address *</Label>
        <Textarea
          id="seller-address"
          value={invoiceData.sellerAddress}
          onChange={(e) => updateField('sellerAddress', e.target.value)}
          placeholder="Street, City, Postal Code, Country"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-name">Customer Name *</Label>
        <Input
          id="customer-name"
          value={invoiceData.customerName}
          onChange={(e) => updateField('customerName', e.target.value)}
          placeholder="Customer Company Name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-address">Customer Address *</Label>
        <Textarea
          id="customer-address"
          value={invoiceData.customerAddress}
          onChange={(e) => updateField('customerAddress', e.target.value)}
          placeholder="Street, City, Postal Code, Country"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Label htmlFor="service-category">Service/Product Category *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Select the type of service or product you're selling</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select 
          value={invoiceData.serviceCategory} 
          onValueChange={(v) => updateField('serviceCategory', v as ServiceCategory)}
        >
          <SelectTrigger id="service-category" className="select-trigger-safe w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dropdown-safe">
            <SelectItem value="digital">Digital service</SelectItem>
            <SelectItem value="saas">SaaS</SelectItem>
            <SelectItem value="consulting">Consulting / freelance</SelectItem>
            <SelectItem value="physical">Physical goods</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-description">Item Description *</Label>
        <Textarea
          id="item-description"
          value={invoiceData.itemDescription}
          onChange={(e) => updateField('itemDescription', e.target.value)}
          placeholder="Description of service or product"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="legal-vat-text">Legal VAT Text</Label>
          {!isPaid && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <Textarea
          id="legal-vat-text"
          value={displayLegalText}
          onChange={(e) => {
            if (isPaid) {
              updateField('legalVatTextOverride', e.target.value);
            }
          }}
          onFocus={handleLegalTextEdit}
          placeholder="Auto-generated legal text"
          rows={3}
          disabled={!isPaid}
          className={!isPaid ? 'opacity-60 cursor-not-allowed' : ''}
        />
        <p className="text-xs text-muted-foreground">
          {isPaid 
            ? 'Edit to customize the legal VAT text on your invoice' 
            : 'Upgrade to Pro to customize legal VAT text'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={!validation.allPassed} className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Preview Invoice
        </Button>
      </div>
    </form>
  );
}
