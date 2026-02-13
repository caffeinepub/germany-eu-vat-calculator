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
import { Info, Check, AlertTriangle } from 'lucide-react';
import { type VATCalculationInput, type ServiceCategory } from '../../lib/vat/calculateVat';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';
import { 
  type VatCategory, 
  VAT_CATEGORIES, 
  VAT_CATEGORY_LABELS,
  computeVatRateForCategory 
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
  const { log } = useEventLogger();

  const country = getCountryConfig(countryCode);

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

  // Compute VAT rate based on country and category
  const computedVatRate = computeVatRateForCategory(countryCode, vatCategory, country.standardRate);

  // Determine if this is a reduced rate country (DE, FR, IT, SE, BE)
  const isReducedRateCountry = ['DE', 'FR', 'IT', 'SE', 'BE'].includes(countryCode);

  const standardRate = country.standardRate;
  const reducedRates = country.reducedRates;

  const features = [
    `${country.invoiceLabel} calculation`,
    'Reverse charge support',
    'Invoice ready',
    'EU compliant formatting',
  ];

  const handleCalculate = () => {
    log(CORE_EVENTS.VAT_CALCULATED, JSON.stringify({
      customerType,
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      computedVatRate,
      reverseCharge,
    }));

    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatCategory,
      reverseCharge,
    });
  };

  return (
    <div className="space-y-6">
      {/* Country VAT Info Section */}
      <div className="text-center pb-4 border-b">
        <div className="text-5xl mb-3">{country.flag}</div>
        <h2 className="text-xl font-bold mb-1">{country.name} VAT Calculator</h2>
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
          {/* VAT Rates Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Standard VAT</div>
                  <div className="text-2xl font-bold text-primary">
                    {country.standardRate}%
                  </div>
                </div>
                {country.reducedRates.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Reduced VAT</div>
                    <div className="flex gap-2 flex-wrap">
                      {country.reducedRates.map((rate) => (
                        <Badge key={rate} variant="outline" className="text-base">
                          {rate}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Features:</h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details Form */}
          <div className="pt-4 border-t space-y-6">
            <h3 className="font-semibold text-lg">Transaction Details</h3>

            <div>
              <Label>Customer Type</Label>
              <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'B2C' | 'B2B')} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B2C" id="b2c" />
                  <Label htmlFor="b2c" className="font-normal cursor-pointer">
                    B2C (Private individual)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B2B" id="b2b" />
                  <Label htmlFor="b2b" className="font-normal cursor-pointer">
                    B2B (VAT-registered business)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {customerType === 'B2B' && (
              <div>
                <Label htmlFor="vat-id">VAT ID (optional)</Label>
                <Input
                  id="vat-id"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                  placeholder="e.g., DE123456789"
                  className="mt-2"
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

            {/* VAT Category Dropdown */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="vat-category">VAT Category</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Not sure which category applies? Select 'Others' to apply the standard VAT rate.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={vatCategory} onValueChange={(v) => setVatCategory(v as VatCategory)}>
                <SelectTrigger id="vat-category" className="select-trigger-safe w-full min-w-0">
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {VAT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {VAT_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Computed VAT Rate Display for Reduced Rate Countries */}
            {isReducedRateCountry && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Computed VAT Rate</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Based on selected category
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {computedVatRate}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="service-category">Service/Product Category</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Select the category that best describes your service or product.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={serviceCategory} onValueChange={(v) => setServiceCategory(v as ServiceCategory)}>
                  <SelectTrigger id="service-category" className="select-trigger-safe w-full min-w-0">
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital service</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="consulting">Consulting / freelance</SelectItem>
                    <SelectItem value="physical">Physical goods</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="net-amount">Net Amount (€)</Label>
                <Input
                  id="net-amount"
                  type="number"
                  step="0.01"
                  value={netAmount}
                  onChange={(e) => setNetAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reverse-charge" className="text-base font-medium">
                    Reverse Charge
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable if reverse charge applies (VAT = 0%)
                  </p>
                </div>
                <Switch
                  id="reverse-charge"
                  checked={reverseCharge}
                  onCheckedChange={setReverseCharge}
                />
              </div>
            </div>

            {/* Legal Disclaimer */}
            <Alert className="bg-muted/50 border-muted-foreground/20">
              <Info className="h-4 w-4" />
              <AlertDescription className="ml-2 text-sm">
                Reduced VAT rates apply only to specific goods and services as defined under national VAT legislation. Users are responsible for verifying eligibility before applying reduced rates.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleCalculate}
          disabled={!country.configured || !netAmount || parseFloat(netAmount) <= 0}
          className="flex-1"
        >
          Calculate VAT
        </Button>
      </div>
    </div>
  );
}
