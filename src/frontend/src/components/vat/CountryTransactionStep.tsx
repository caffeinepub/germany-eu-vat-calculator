import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { type VATCalculationInput, type ServiceCategory, type SupplyType } from '../../lib/vat/calculateVat';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';
import { 
  type VatCategory, 
  VAT_CATEGORIES,
} from '../../lib/vat/vatCategoryRateRules';
import { determineVATRate } from '../../lib/vat/determineVatRate';
import { getProductCategoryOptions, type ProductCategoryOption } from '../../lib/vat/productCategoryOptions';
import ReverseChargeProofChecker from './ReverseChargeProofChecker';
import ProductCategoryItemsPicker from './ProductCategoryItemsPicker';
import VatCategoryItemsPicker from './VatCategoryItemsPicker';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { getSupportedCountryCodes } from '../../lib/vat/vatTable';
import { getCountryCurrency } from '../../lib/invoice/currency';

interface CountryTransactionStepProps {
  countryCode: string;
  initialData: VATCalculationInput;
  onNext: (data: Partial<VATCalculationInput>) => void;
  onBack: () => void;
  isCalculating?: boolean;
}

export default function CountryTransactionStep({
  countryCode,
  initialData,
  onNext,
  onBack,
  isCalculating = false,
}: CountryTransactionStepProps) {
  const [customerType, setCustomerType] = useState<'B2C' | 'B2B'>(initialData.customerType);
  const [customerCountry, setCustomerCountry] = useState(initialData.customerCountry || countryCode);
  const [buyerCountry, setBuyerCountry] = useState(initialData.buyerCountry || initialData.customerCountry || countryCode);
  const [vatId, setVatId] = useState(initialData.vatId);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(initialData.serviceCategory || 'digital');
  const [netAmount, setNetAmount] = useState(initialData.netAmount.toString());
  const [vatCategory, setVatCategory] = useState<VatCategory>(initialData.vatCategory || 'others');
  const [productCategory, setProductCategory] = useState<string>((initialData.productCategory as string) || 'others');
  const [exemptIdentifier, setExemptIdentifier] = useState<string>((initialData as any).exemptIdentifier || '');
  const [isExport, setIsExport] = useState(initialData.isExport || false);
  const [supplyType, setSupplyType] = useState<SupplyType>((initialData.supplyType as SupplyType) || 'services');
  const { log } = useEventLogger();

  const country = getCountryConfig(countryCode);
  
  // Get all supported countries for customer country selection
  const supportedCountries = getSupportedCountryCodes();

  // Get currency for the country
  const currencyInfo = getCountryCurrency(countryCode);

  // Check if transaction is cross-border
  const isCrossBorder = countryCode.toUpperCase() !== customerCountry.toUpperCase() && 
                        countryCode.toUpperCase() !== (customerCountry.toUpperCase() === 'UK' ? 'GB' : customerCountry.toUpperCase());

  // Get product category options for this country
  const productCategoryOptions = getProductCategoryOptions(countryCode);

  // Sync buyerCountry with customerCountry when customerCountry changes
  useEffect(() => {
    if (!initialData.buyerCountry) {
      setBuyerCountry(customerCountry);
    }
  }, [customerCountry, initialData.buyerCountry]);

  // Compute effective VAT rate using the decision engine
  const getEffectiveVatRate = (): number => {
    try {
      return determineVATRate(
        countryCode,
        vatCategory,
        null, // selectedReducedRate
        false // reverseCharge
      );
    } catch (error) {
      console.error('Error determining VAT rate:', error);
      return country?.standardRate || 0;
    }
  };

  const effectiveRate = getEffectiveVatRate();

  if (!country) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Country configuration not found</p>
        <Button onClick={onBack} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const handleCalculate = () => {
    log(CORE_EVENTS.VAT_CALCULATED, JSON.stringify({
      customerType,
      customerCountry,
      buyerCountry,
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      productCategory,
      effectiveRate,
      isExport,
      supplyType,
    }));

    onNext({
      customerType,
      customerCountry,
      buyerCountry,
      vatId: customerType === 'B2B' ? vatId : '',
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      productCategory: productCategory as any,
      isExport,
      effectiveVatRate: effectiveRate,
      exemptIdentifier,
      supplyType,
    } as any);
  };

  const handleProductCategorySelect = (option: ProductCategoryOption) => {
    setProductCategory(option.value);
    setExemptIdentifier(option.exemptIdentifier || '');
  };

  return (
    <div className="space-y-4">
      {/* Country VAT Info Section - Compact */}
      <div className="text-center pb-3 border-b">
        <div className="text-4xl mb-2">{country.flag}</div>
        <h2 className="text-lg font-bold mb-0.5">{country.name} VAT Calculator</h2>
      </div>

      {!country.configured ? (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This country is not yet fully configured. Some features may be limited.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Customer Type Selection */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-3 block">Customer Type</Label>
          <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'B2C' | 'B2B')}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="B2C" id="b2c" />
              <Label htmlFor="b2c" className="font-normal cursor-pointer">
                B2C (Business to Consumer)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B2B" id="b2b" />
              <Label htmlFor="b2b" className="font-normal cursor-pointer">
                B2B (Business to Business)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Supply Type Selection */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-3 block">Supply Type</Label>
          <RadioGroup value={supplyType} onValueChange={(v) => setSupplyType(v as SupplyType)}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="goods" id="goods" />
              <Label htmlFor="goods" className="font-normal cursor-pointer">
                Goods
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="services" id="services" />
              <Label htmlFor="services" className="font-normal cursor-pointer">
                Services
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Customer Country and Buyer Country Selection - Side by Side on Desktop */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-country" className="text-base font-semibold mb-3 block">
                Customer Country
              </Label>
              <Select value={customerCountry} onValueChange={setCustomerCountry}>
                <SelectTrigger id="customer-country" className="select-trigger-safe dropdown-safe">
                  <SelectValue placeholder="Select customer country" />
                </SelectTrigger>
                <SelectContent className="dropdown-safe" style={{ overflow: 'visible' }}>
                  {supportedCountries.map((code) => {
                    const countryConfig = getCountryConfig(code);
                    return (
                      <SelectItem key={code} value={code}>
                        {countryConfig?.flag} {countryConfig?.name || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {isCrossBorder && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cross-border transaction detected
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="buyer-country" className="text-base font-semibold mb-3 block">
                Buyer Country
              </Label>
              <Select value={buyerCountry} onValueChange={setBuyerCountry}>
                <SelectTrigger id="buyer-country" className="select-trigger-safe dropdown-safe">
                  <SelectValue placeholder="Select buyer country" />
                </SelectTrigger>
                <SelectContent className="dropdown-safe" style={{ overflow: 'visible' }}>
                  {supportedCountries.map((code) => {
                    const countryConfig = getCountryConfig(code);
                    return (
                      <SelectItem key={code} value={code}>
                        {countryConfig?.flag} {countryConfig?.name || code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="export-toggle" className="text-base font-semibold">
                Export Transaction
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable for cross-border sales outside your country
              </p>
            </div>
            <Switch
              id="export-toggle"
              checked={isExport}
              onCheckedChange={setIsExport}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Category Selection */}
      <Card>
        <CardContent className="pt-6">
          <ProductCategoryItemsPicker
            options={productCategoryOptions}
            selectedValue={productCategory}
            selectedExemptIdentifier={exemptIdentifier}
            onSelect={handleProductCategorySelect}
          />
        </CardContent>
      </Card>

      {/* VAT Category Selection */}
      <Card>
        <CardContent className="pt-6">
          <VatCategoryItemsPicker
            categories={VAT_CATEGORIES}
            selectedValue={vatCategory}
            onSelect={setVatCategory}
          />
        </CardContent>
      </Card>

      {/* VAT ID Input for B2B */}
      {customerType === 'B2B' && (
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="vat-id" className="text-base font-semibold mb-3 block">
              Customer VAT ID (Optional)
            </Label>
            <Input
              id="vat-id"
              value={vatId}
              onChange={(e) => setVatId(e.target.value)}
              placeholder="e.g., DE123456789"
            />
            {vatId && (
              <div className="mt-3">
                <ReverseChargeProofChecker
                  vatId={vatId}
                  customerCountry={customerCountry}
                  customerType={customerType}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Net Amount Input */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="net-amount" className="text-base font-semibold mb-3 block">
            Net Amount ({currencyInfo.symbol})
          </Label>
          <Input
            id="net-amount"
            type="number"
            step="0.01"
            value={netAmount}
            onChange={(e) => setNetAmount(e.target.value)}
            placeholder="0.00"
          />
        </CardContent>
      </Card>

      {/* Effective VAT Rate Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Effective VAT Rate</Label>
            <Badge variant="secondary" className="text-lg font-bold">
              {effectiveRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleCalculate}
          disabled={!netAmount || parseFloat(netAmount) <= 0 || isCalculating}
          className="flex-1"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate VAT'
          )}
        </Button>
      </div>
    </div>
  );
}
