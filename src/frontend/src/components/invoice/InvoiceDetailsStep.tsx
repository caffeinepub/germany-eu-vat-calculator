import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Languages, AlertTriangle, Lock, Plus, Trash2 } from 'lucide-react';
import { type VATCalculationInput, type VATCalculationResult, type ServiceCategory } from '../../lib/vat/calculateVat';
import { type VatCategory, VAT_CATEGORY_LABELS, VAT_CATEGORIES, computeVatRateForCategory } from '../../lib/vat/vatCategoryRateRules';
import { type InvoiceLineItem, calculateInvoiceTotals, groupLineItemsByVatRate } from '../../lib/invoice/invoiceLineItems';
import { validateInvoiceComplianceSync } from '../../lib/invoice/validateInvoiceCompliance';
import { getCountryCurrency, isDifferentFromLocalCurrency, formatCurrency } from '../../lib/invoice/currency';
import { getAutoLegalVatText } from '../../lib/invoice/getAutoLegalVatText';
import { checkHistoricalRateDifference } from '../../lib/vat/germanyVatRateHistory';
import { calculateGermanyVAT } from '../../lib/vat/calculateVat';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';
import { isZeroVatResult } from '../../lib/vat/isZeroVatResult';
import { lookupVatConfig } from '../../lib/vat/vatTable';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { usePreferredLanguage } from '../../hooks/usePreferredLanguage';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useInvoiceNumberUniqueness } from '../../hooks/useInvoiceNumberUniqueness';
import { toast } from 'sonner';

export interface InvoiceDetails {
  sellerName: string;
  sellerAddress: string;
  sellerCountry: string;
  sellerVatId: string;
  customerName: string;
  customerAddress: string;
  customerCountry: string;
  serviceCategory: ServiceCategory;
  itemDescription: string;
  translateToEnglish: boolean;
  invoiceNumber: string;
  invoiceDate: string;
  taxPointDate: string;
  currency: string;
  lineItems: InvoiceLineItem[];
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
  const { identity } = useInternetIdentity();
  const { checkUniqueness } = useInvoiceNumberUniqueness();
  const today = new Date().toISOString().split('T')[0];
  
  // Get default currency from VAT_TABLE
  const sellerCountry = formData.sellerCountry || 'DE';
  const vatConfig = lookupVatConfig(sellerCountry);
  const defaultCurrency = vatConfig?.currency || getCountryCurrency(sellerCountry).code;
  
  const countryConfig = getCountryConfig(sellerCountry);
  
  // Check if this is a zero-VAT scenario
  const isZeroVatScenario = isZeroVatResult(result);
  
  // Get standard rate from VAT_TABLE - no fallback to 19%
  const standardRate = vatConfig?.standard || countryConfig?.standardRate || 0;
  
  // Initialize with one line item by default
  const defaultLineItem: InvoiceLineItem = {
    description: initialData?.itemDescription || formData.itemDescription || '',
    quantity: 1,
    unitPrice: result.netAmountCents ? result.netAmountCents / 100 : 0,
    vatCategory: 'standard',
    // Use 0% VAT rate for zero-rated scenarios, otherwise use country standard rate from VAT_TABLE
    vatRate: isZeroVatScenario ? 0 : standardRate,
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceDetails>({
    sellerName: initialData?.sellerName || formData.sellerName || '',
    sellerAddress: initialData?.sellerAddress || formData.sellerAddress || '',
    sellerCountry: initialData?.sellerCountry || sellerCountry,
    sellerVatId: initialData?.sellerVatId || formData.sellerVatId || '',
    customerName: initialData?.customerName || formData.customerName || '',
    customerAddress: initialData?.customerAddress || formData.customerAddress || '',
    customerCountry: initialData?.customerCountry || formData.customerCountry || '',
    serviceCategory: initialData?.serviceCategory || formData.serviceCategory || 'digital',
    itemDescription: initialData?.itemDescription || formData.itemDescription || '',
    translateToEnglish: initialData?.translateToEnglish ?? formData.translateToEnglish ?? isEnglish,
    invoiceNumber: initialData?.invoiceNumber || formData.invoiceNumber || '',
    invoiceDate: initialData?.invoiceDate || formData.invoiceDate || today,
    taxPointDate: initialData?.taxPointDate || formData.taxPointDate || today,
    currency: initialData?.currency || formData.currency || defaultCurrency,
    lineItems: initialData?.lineItems || [defaultLineItem],
    legalVatTextOverride: initialData?.legalVatTextOverride || formData.legalVatTextOverride || '',
  });

  const [showHistoricalWarning, setShowHistoricalWarning] = useState(false);
  const [historicalRateInfo, setHistoricalRateInfo] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [currencyManuallySet, setCurrencyManuallySet] = useState(false);

  const autoLegalText = getAutoLegalVatText(result.scenario, invoiceData.sellerCountry);
  const displayLegalText = invoiceData.legalVatTextOverride || autoLegalText;

  // Create a combined input for validation
  const combinedInput: VATCalculationInput = {
    ...formData,
    ...invoiceData,
    vatId: formData.vatId,
    currency: invoiceData.currency,
  };

  // Run validation
  useEffect(() => {
    const validation = validateInvoiceComplianceSync(
      combinedInput,
      result,
      invoiceData.lineItems
    );
    
    setValidationErrors(validation.errors.filter(e => e.blocking).map(e => e.message));
    setValidationWarnings(validation.warnings);
  }, [invoiceData, formData, result]);

  // Check for currency warning
  const showCurrencyWarning = isDifferentFromLocalCurrency(invoiceData.currency);

  // Calculate totals
  const totals = calculateInvoiceTotals(invoiceData.lineItems);
  const vatBreakdown = groupLineItemsByVatRate(invoiceData.lineItems);

  // Update currency when seller country changes (only if not manually set)
  useEffect(() => {
    if (!currencyManuallySet) {
      const newVatConfig = lookupVatConfig(invoiceData.sellerCountry);
      const newCurrency = newVatConfig?.currency || getCountryCurrency(invoiceData.sellerCountry).code;
      if (newCurrency !== invoiceData.currency) {
        setInvoiceData(prev => ({ ...prev, currency: newCurrency }));
      }
    }
  }, [invoiceData.sellerCountry, currencyManuallySet]);

  // Recompute line item VAT rates when seller country changes
  useEffect(() => {
    const newVatConfig = lookupVatConfig(invoiceData.sellerCountry);
    if (!newVatConfig) {
      // If country not supported, set all non-zero-scenario items to 0 and let validation catch it
      const isZeroVat = isZeroVatResult(result);
      if (!isZeroVat) {
        setInvoiceData(prev => {
          const updatedLineItems = prev.lineItems.map(item => ({
            ...item,
            vatRate: 0,
          }));
          return {
            ...prev,
            lineItems: updatedLineItems,
          };
        });
      }
      return;
    }
    
    const newStandardRate = newVatConfig.standard;
    const isZeroVat = isZeroVatResult(result);
    
    setInvoiceData(prev => {
      const updatedLineItems = prev.lineItems.map(item => {
        // Only preserve 0% for zero-VAT scenarios (not for any item that happens to have 0%)
        if (isZeroVat) {
          return {
            ...item,
            vatRate: 0,
          };
        }
        
        // For non-zero scenarios, recompute VAT rate from category and new country
        const newVatRate = computeVatRateForCategory(
          invoiceData.sellerCountry,
          item.vatCategory,
          newStandardRate
        );
        
        return {
          ...item,
          vatRate: newVatRate,
        };
      });
      
      return {
        ...prev,
        lineItems: updatedLineItems,
      };
    });
  }, [invoiceData.sellerCountry, result]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-fill taxPointDate if empty
    const finalData = {
      ...invoiceData,
      taxPointDate: invoiceData.taxPointDate || invoiceData.invoiceDate,
    };

    // Check invoice number uniqueness for authenticated users
    if (identity && finalData.invoiceNumber) {
      const exists = await checkUniqueness(finalData.invoiceNumber);
      if (exists) {
        toast.error('Invoice number already exists. Please use a unique invoice number.');
        return;
      }
    }

    // Final validation
    const validation = validateInvoiceComplianceSync(
      { ...combinedInput, taxPointDate: finalData.taxPointDate, currency: finalData.currency },
      result,
      finalData.lineItems
    );

    if (!validation.isValid) {
      toast.error('Please fix all validation errors before proceeding.');
      return;
    }

    onNext(finalData);
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newLineItems = [...invoiceData.lineItems];
    const item = { ...newLineItems[index] };
    
    if (field === 'vatCategory') {
      // Check if this is a zero-VAT scenario
      const isZeroVat = isZeroVatResult(result);
      
      if (isZeroVat) {
        // For zero-VAT scenarios, keep VAT rate locked at 0%
        item.vatCategory = value;
        item.vatRate = 0;
      } else {
        // For non-zero scenarios, compute VAT rate from category
        item.vatCategory = value;
        const currentVatConfig = lookupVatConfig(invoiceData.sellerCountry);
        if (!currentVatConfig) {
          // If no VAT config, set to 0 and let validation catch it
          item.vatRate = 0;
        } else {
          const currentStandardRate = currentVatConfig.standard;
          item.vatRate = computeVatRateForCategory(
            invoiceData.sellerCountry,
            value,
            currentStandardRate
          );
        }
      }
    } else {
      (item as any)[field] = value;
    }
    
    newLineItems[index] = item;
    setInvoiceData({ ...invoiceData, lineItems: newLineItems });
  };

  const handleAddLineItem = () => {
    const currentVatConfig = lookupVatConfig(invoiceData.sellerCountry);
    const currentStandardRate = currentVatConfig?.standard || 0;
    const isZeroVat = isZeroVatResult(result);
    
    const newItem: InvoiceLineItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatCategory: 'standard',
      vatRate: isZeroVat ? 0 : currentStandardRate,
    };
    setInvoiceData({ ...invoiceData, lineItems: [...invoiceData.lineItems, newItem] });
  };

  const handleRemoveLineItem = (index: number) => {
    if (invoiceData.lineItems.length > 1) {
      const newLineItems = invoiceData.lineItems.filter((_, i) => i !== index);
      setInvoiceData({ ...invoiceData, lineItems: newLineItems });
    }
  };

  const handleCurrencyChange = (value: string) => {
    setCurrencyManuallySet(true);
    setInvoiceData({ ...invoiceData, currency: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Invoice Details</h2>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {showHistoricalWarning && historicalRateInfo && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Historical VAT Rate Notice</div>
            <p className="text-sm mt-1">{historicalRateInfo.message}</p>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>Your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Legal Name *</Label>
                <Input
                  id="sellerName"
                  value={invoiceData.sellerName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, sellerName: e.target.value })}
                  placeholder="Your Company Ltd."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerVatId">VAT Number *</Label>
                <Input
                  id="sellerVatId"
                  value={invoiceData.sellerVatId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, sellerVatId: e.target.value })}
                  placeholder="DE123456789"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerAddress">Address *</Label>
              <Textarea
                id="sellerAddress"
                value={invoiceData.sellerAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, sellerAddress: e.target.value })}
                placeholder="Street, City, Postal Code, Country"
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              {formData.customerType === 'B2B' ? 'Business customer details (required)' : 'Consumer details (optional)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name {formData.customerType === 'B2B' && '*'}
                </Label>
                <Input
                  id="customerName"
                  value={invoiceData.customerName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                  placeholder="Customer Company Ltd."
                  required={formData.customerType === 'B2B'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCountry">Customer Country</Label>
                <Input
                  id="customerCountry"
                  value={invoiceData.customerCountry}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerCountry: e.target.value })}
                  placeholder="DE"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">
                Customer Address {formData.customerType === 'B2B' && '*'}
              </Label>
              <Textarea
                id="customerAddress"
                value={invoiceData.customerAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, customerAddress: e.target.value })}
                placeholder="Street, City, Postal Code, Country"
                rows={3}
                required={formData.customerType === 'B2B'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Identification */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Identification</CardTitle>
            <CardDescription>Invoice number and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  placeholder="INV-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxPointDate">Tax Point Date</Label>
                <Input
                  id="taxPointDate"
                  type="date"
                  value={invoiceData.taxPointDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, taxPointDate: e.target.value })}
                  placeholder="Auto-filled if empty"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Products or services on this invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Description</th>
                    <th className="text-left p-2 font-medium w-20">Qty</th>
                    <th className="text-left p-2 font-medium w-28">Unit Price</th>
                    <th className="text-left p-2 font-medium w-40">VAT Category</th>
                    <th className="text-left p-2 font-medium w-24">VAT Rate</th>
                    <th className="text-left p-2 font-medium w-28">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item, index) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const isZeroVat = isZeroVatResult(result);
                    
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={item.vatCategory}
                            onValueChange={(value) => handleLineItemChange(index, 'vatCategory', value as VatCategory)}
                            disabled={isZeroVat}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {VAT_CATEGORY_LABELS[cat]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{item.vatRate.toFixed(1)}%</span>
                            {isZeroVat && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(lineTotal, invoiceData.currency)}
                          </span>
                        </td>
                        <td className="p-2">
                          {invoiceData.lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLineItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLineItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>

            {/* Totals Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Net Amount:</span>
                <span className="font-medium">{formatCurrency(totals.netAmount, invoiceData.currency)}</span>
              </div>
              
              {vatBreakdown.length > 0 && (
                <div className="space-y-1">
                  {vatBreakdown.map((group, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>VAT ({group.vatRate.toFixed(1)}%):</span>
                      <span className="font-medium">{formatCurrency(group.vatAmount, invoiceData.currency)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between text-base font-semibold border-t pt-2">
                <span>Gross Amount:</span>
                <span>{formatCurrency(totals.grossAmount, invoiceData.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Invoice currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={invoiceData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF (Fr)</SelectItem>
                  <SelectItem value="PLN">PLN (zł)</SelectItem>
                  <SelectItem value="SEK">SEK (kr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showCurrencyWarning && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  VAT may need reporting in local currency ({getCountryCurrency(invoiceData.sellerCountry).code}).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Legal VAT Text */}
        <Card>
          <CardHeader>
            <CardTitle>Legal VAT Text</CardTitle>
            <CardDescription>
              Required legal text for this VAT scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto-generated text:</Label>
                {!isPaid && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Upgrade to customize
                  </span>
                )}
              </div>
              <div className="p-3 bg-muted rounded-md text-sm">
                {autoLegalText || 'No special legal text required for this scenario.'}
              </div>
            </div>

            {isPaid && (
              <div className="space-y-2">
                <Label htmlFor="legalVatTextOverride">Custom Legal Text (Optional)</Label>
                <Textarea
                  id="legalVatTextOverride"
                  value={invoiceData.legalVatTextOverride}
                  onChange={(e) => setInvoiceData({ ...invoiceData, legalVatTextOverride: e.target.value })}
                  placeholder="Leave empty to use auto-generated text"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Translation Option */}
        <Card>
          <CardHeader>
            <CardTitle>Language Options</CardTitle>
            <CardDescription>Invoice language preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="translateToEnglish" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Translate to English
                </Label>
                <p className="text-sm text-muted-foreground">
                  Generate invoice with English field labels
                </p>
              </div>
              <Switch
                id="translateToEnglish"
                checked={invoiceData.translateToEnglish}
                onCheckedChange={(checked) => setInvoiceData({ ...invoiceData, translateToEnglish: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={validationErrors.length > 0}>
            Continue to Preview
          </Button>
        </div>
      </form>
    </div>
  );
}
