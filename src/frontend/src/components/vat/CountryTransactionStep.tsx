import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { type VATCalculationInput, type ServiceCategory } from '../../lib/vat/calculateVat';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';
import { 
  type VatCategory, 
  VAT_CATEGORIES, 
  VAT_CATEGORY_LABELS,
  computeVatRateForCategory,
} from '../../lib/vat/vatCategoryRateRules';
import ReverseChargeProofChecker from './ReverseChargeProofChecker';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';

interface CountryTransactionStepProps {
  countryCode: string;
  initialData: VATCalculationInput;
  onNext: (data: Partial<VATCalculationInput>) => void;
  onBack: () => void;
}

type VatTreatment = 'standard' | 'reduced' | 'exempt';

export default function CountryTransactionStep({
  countryCode,
  initialData,
  onNext,
  onBack,
}: CountryTransactionStepProps) {
  const [customerType, setCustomerType] = useState<'B2C' | 'B2B'>(initialData.customerType);
  const [vatId, setVatId] = useState(initialData.vatId);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(initialData.serviceCategory || 'digital');
  const [netAmount, setNetAmount] = useState(initialData.netAmount.toString());
  const [vatCategory, setVatCategory] = useState<VatCategory>(initialData.vatCategory || 'others');
  const [reverseCharge, setReverseCharge] = useState(initialData.reverseCharge || false);
  const [vatTreatment, setVatTreatment] = useState<VatTreatment>(
    initialData.vatTreatment || 'standard'
  );
  const [selectedReducedRate, setSelectedReducedRate] = useState<number | null>(
    initialData.selectedReducedRate || null
  );
  const { log } = useEventLogger();

  const country = getCountryConfig(countryCode);
  const reducedRates = country?.reducedRates || [];

  // Auto-select first reduced rate when switching to reduced treatment
  useEffect(() => {
    if (vatTreatment === 'reduced' && selectedReducedRate === null && reducedRates.length > 0) {
      setSelectedReducedRate(reducedRates[0]);
    }
  }, [vatTreatment, selectedReducedRate, reducedRates]);

  // When VAT Category changes and treatment is standard, compute the rate
  useEffect(() => {
    if (vatTreatment === 'standard' && country) {
      const computedRate = computeVatRateForCategory(countryCode, vatCategory, country.standardRate);
      // If computed rate is a reduced rate, auto-switch to reduced treatment and select it
      if (computedRate !== country.standardRate && reducedRates.includes(computedRate)) {
        setVatTreatment('reduced');
        setSelectedReducedRate(computedRate);
      }
    }
  }, [vatCategory, vatTreatment, countryCode, country, reducedRates]);

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

  const standardRate = country.standardRate;

  // Compute effective VAT rate based on treatment and reverse charge
  const getEffectiveVatRate = (): number => {
    // Reverse charge always overrides to 0%
    if (reverseCharge) return 0;
    if (vatTreatment === 'exempt') return 0;
    if (vatTreatment === 'standard') {
      // Use computed rate from VAT Category
      return computeVatRateForCategory(countryCode, vatCategory, standardRate);
    }
    if (vatTreatment === 'reduced' && selectedReducedRate !== null) {
      return selectedReducedRate;
    }
    // Fallback to first reduced rate if available
    return reducedRates.length > 0 ? reducedRates[0] : standardRate;
  };

  const features = [
    `${country.invoiceLabel} calculation`,
    'Reverse charge support',
    'Invoice ready',
    'EU compliant formatting',
  ];

  // Validation: require reduced rate selection when reduced treatment is chosen
  const canCalculate = (): boolean => {
    if (vatTreatment === 'reduced' && reducedRates.length > 0 && selectedReducedRate === null) {
      return false;
    }
    return true;
  };

  const handleCalculate = () => {
    if (!canCalculate()) return;

    const effectiveRate = getEffectiveVatRate();
    
    log(CORE_EVENTS.VAT_CALCULATED, JSON.stringify({
      customerType,
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      vatTreatment,
      effectiveRate,
      reverseCharge,
    }));

    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      reverseCharge,
      vatTreatment,
      selectedReducedRate,
      effectiveVatRate: effectiveRate,
    });
  };

  return (
    <div className="space-y-4">
      {/* Country VAT Info Section - Compact */}
      <div className="text-center pb-3 border-b">
        <div className="text-4xl mb-2">{country.flag}</div>
        <h2 className="text-lg font-bold mb-0.5">{country.name} VAT Calculator</h2>
      </div>

      {!country.configured ? (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-1">Configuration Pending</p>
            <p className="text-sm">
              {country.name} VAT settings are not yet configured. Please check back later or contact support.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Reverse Charge Toggle - Compact */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="reverse-charge" className="text-sm font-medium cursor-pointer">
                    Enable Reverse Charge (B2B cross-border)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Reverse charge shifts VAT liability to the customer. Applies to B2B cross-border transactions within the EU.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  id="reverse-charge"
                  checked={reverseCharge}
                  onCheckedChange={setReverseCharge}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reverse Charge Warning */}
          {reverseCharge && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Reverse Charge Enabled</p>
                <p className="text-sm">
                  VAT will be 0% as the customer must self-assess VAT in their country. The VAT treatment selection below is overridden by reverse charge rules.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* VAT Rates Card - Compact with Treatment Selection */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="space-y-2.5">
                {/* VAT Treatment Selection */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">VAT Treatment</Label>
                  <RadioGroup 
                    value={vatTreatment} 
                    onValueChange={(v) => setVatTreatment(v as VatTreatment)}
                    className="flex flex-col gap-1.5"
                    disabled={reverseCharge}
                  >
                    <div className={`flex items-center justify-between border rounded-md p-1.5 hover:bg-muted/50 ${reverseCharge ? 'opacity-50' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="vat-standard" disabled={reverseCharge} />
                        <Label htmlFor="vat-standard" className="font-normal cursor-pointer text-sm">
                          Standard VAT
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {standardRate}%
                      </Badge>
                    </div>

                    {reducedRates.length > 0 && (
                      <div className={`flex items-center justify-between border rounded-md p-1.5 hover:bg-muted/50 ${reverseCharge ? 'opacity-50' : ''}`}>
                        <div className="flex items-center space-x-2 flex-1">
                          <RadioGroupItem value="reduced" id="vat-reduced" disabled={reverseCharge} />
                          <Label htmlFor="vat-reduced" className="font-normal cursor-pointer text-sm">
                            Reduced VAT
                          </Label>
                        </div>
                        {vatTreatment === 'reduced' && !reverseCharge && (
                          <Select 
                            value={selectedReducedRate?.toString() || reducedRates[0].toString()} 
                            onValueChange={(v) => setSelectedReducedRate(parseFloat(v))}
                          >
                            <SelectTrigger className="w-20 h-6 text-xs select-trigger-safe">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dropdown-safe">
                              {reducedRates.map((rate) => (
                                <SelectItem key={rate} value={rate.toString()}>
                                  {rate}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {(vatTreatment !== 'reduced' || reverseCharge) && (
                          <div className="flex gap-1">
                            {reducedRates.map((rate) => (
                              <Badge key={rate} variant="outline" className="text-xs">
                                {rate}%
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex items-center justify-between border rounded-md p-1.5 hover:bg-muted/50 ${reverseCharge ? 'opacity-50' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exempt" id="vat-exempt" disabled={reverseCharge} />
                        <Label htmlFor="vat-exempt" className="font-normal cursor-pointer text-sm">
                          VAT Exempt
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold">
                        0%
                      </Badge>
                    </div>
                  </RadioGroup>
                </div>

                {/* Effective Rate Display */}
                <div className="pt-1.5 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Effective VAT Rate:</span>
                    <span className="font-bold text-base">{getEffectiveVatRate()}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details Section */}
          <Card>
            <CardContent className="py-4 px-4">
              <div className="space-y-4">
                {/* Section Header with VAT Category positioned at top-right */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <h3 className="text-base font-semibold">Transaction Details</h3>
                  
                  {/* VAT Category - Top right on md+, full width on mobile */}
                  <div className="transaction-vat-category-wrapper md:w-64">
                    <Label htmlFor="vat-category" className="text-sm font-medium mb-1.5 block">
                      VAT Category
                    </Label>
                    <Select value={vatCategory} onValueChange={(v) => setVatCategory(v as VatCategory)}>
                      <SelectTrigger id="vat-category" className="select-trigger-safe">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dropdown-safe">
                        {VAT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {VAT_CATEGORY_LABELS[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* All other transaction fields stacked below */}
                <div className="space-y-3">
                  {/* Customer Type */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Customer Type</Label>
                    <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'B2C' | 'B2B')}>
                      <div className="flex gap-3">
                        <div className="flex items-center space-x-2 flex-1 border rounded-md p-2 hover:bg-muted/50">
                          <RadioGroupItem value="B2C" id="customer-b2c" />
                          <Label htmlFor="customer-b2c" className="font-normal cursor-pointer text-sm flex-1">
                            B2C (Consumer)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 flex-1 border rounded-md p-2 hover:bg-muted/50">
                          <RadioGroupItem value="B2B" id="customer-b2b" />
                          <Label htmlFor="customer-b2b" className="font-normal cursor-pointer text-sm flex-1">
                            B2B (Business)
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* VAT ID (B2B only) */}
                  {customerType === 'B2B' && (
                    <div>
                      <Label htmlFor="vat-id" className="text-sm font-medium mb-1.5 block">
                        Customer VAT ID (optional)
                      </Label>
                      <Input
                        id="vat-id"
                        value={vatId}
                        onChange={(e) => setVatId(e.target.value)}
                        placeholder="e.g., DE123456789"
                        className="font-mono text-sm"
                      />
                      {vatId && (
                        <ReverseChargeProofChecker 
                          vatId={vatId} 
                          customerCountry={countryCode}
                          customerType={customerType}
                        />
                      )}
                    </div>
                  )}

                  {/* Service Category */}
                  <div>
                    <Label htmlFor="service-category" className="text-sm font-medium mb-1.5 block">
                      Service Category
                    </Label>
                    <Select value={serviceCategory} onValueChange={(v) => setServiceCategory(v as ServiceCategory)}>
                      <SelectTrigger id="service-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital Services</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="goods">Physical Goods</SelectItem>
                        <SelectItem value="other">Other Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Net Amount */}
                  <div>
                    <Label htmlFor="net-amount" className="text-sm font-medium mb-1.5 block">
                      Net Amount (€)
                    </Label>
                    <Input
                      id="net-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={netAmount}
                      onChange={(e) => setNetAmount(e.target.value)}
                      placeholder="0.00"
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features List - Compact */}
          <Card className="bg-muted/30">
            <CardContent className="py-3 px-4">
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleCalculate} 
              className="flex-1"
              disabled={!canCalculate()}
            >
              Calculate VAT
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
