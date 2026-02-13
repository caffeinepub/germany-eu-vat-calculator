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
    if (vatTreatment === 'standard') return standardRate;
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
                          Exempt VAT
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold">
                        0%
                      </Badge>
                    </div>
                  </RadioGroup>
                </div>

                {/* Effective Rate Display */}
                <div className="flex items-center justify-between pt-1.5 border-t">
                  <span className="text-sm font-medium text-muted-foreground">Effective VAT Rate:</span>
                  <span className="text-lg font-bold text-primary">{getEffectiveVatRate()}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAT Exempt Warning */}
          {vatTreatment === 'exempt' && !reverseCharge && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
                <p className="font-medium mb-1">VAT Exemption Must Be Legally Applicable</p>
                <p className="text-sm mb-2">
                  VAT exemption applies only to specific goods and services defined by law (e.g., medical services, education, financial services). Ensure your transaction qualifies for exemption.
                </p>
                <p className="text-sm font-medium">
                  ⚠️ Your invoice must include a legal note explaining the exemption basis (e.g., Article reference).
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Reduced Rate Selection Warning */}
          {vatTreatment === 'reduced' && !reverseCharge && reducedRates.length > 0 && selectedReducedRate === null && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
                <p className="text-sm font-medium">
                  Please select a specific reduced VAT rate before calculating.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Features List - Compact */}
          <div className="space-y-1.5">
            <h3 className="font-medium text-xs text-muted-foreground">Features:</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details Form - Responsive Grid */}
          <div className="pt-3 border-t space-y-4">
            <h3 className="font-semibold text-base">Transaction Details</h3>

            <div>
              <Label className="text-sm">Customer Type</Label>
              <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'B2C' | 'B2B')} className="mt-1.5">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B2C" id="b2c" />
                  <Label htmlFor="b2c" className="font-normal cursor-pointer text-sm">
                    B2C (Private individual)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B2B" id="b2b" />
                  <Label htmlFor="b2b" className="font-normal cursor-pointer text-sm">
                    B2B (VAT-registered business)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {customerType === 'B2B' && (
              <div>
                <Label htmlFor="vat-id" className="text-sm">VAT ID (optional)</Label>
                <Input
                  id="vat-id"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                  placeholder="e.g., DE123456789"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valid EU VAT ID enables reverse charge validation
                </p>
              </div>
            )}

            {customerType === 'B2B' && vatId && (
              <ReverseChargeProofChecker
                vatId={vatId}
                customerCountry={initialData.customerCountry}
                customerType={customerType}
              />
            )}

            {/* Responsive Grid: single column on mobile, two columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="net-amount" className="text-sm">Net Amount (€)</Label>
                <Input
                  id="net-amount"
                  type="number"
                  step="0.01"
                  value={netAmount}
                  onChange={(e) => setNetAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>

              {/* VAT Category Dropdown - Right column on md+ */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Label htmlFor="vat-category" className="text-sm">VAT Category</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Not sure which category applies? Select 'Others' to apply the standard VAT rate.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={vatCategory} onValueChange={(v) => setVatCategory(v as VatCategory)}>
                  <SelectTrigger id="vat-category" className="select-trigger-safe w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dropdown-safe max-h-[200px] overflow-y-auto">
                    {VAT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {VAT_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleCalculate} 
              disabled={!canCalculate()}
              className="flex-1"
            >
              Calculate VAT
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
