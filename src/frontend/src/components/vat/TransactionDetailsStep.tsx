import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { type VATCalculationInput, type ServiceCategory } from '../../lib/vat/calculateVat';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';
import ReverseChargeProofChecker from './ReverseChargeProofChecker';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';

interface TransactionDetailsStepProps {
  initialData: VATCalculationInput;
  onNext: (data: Partial<VATCalculationInput>) => void;
  onBack: () => void;
}

export default function TransactionDetailsStep({ initialData, onNext, onBack }: TransactionDetailsStepProps) {
  const [customerType, setCustomerType] = useState<'B2C' | 'B2B'>(initialData.customerType);
  const [vatId, setVatId] = useState(initialData.vatId);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(initialData.serviceCategory || 'digital');
  const [netAmount, setNetAmount] = useState(initialData.netAmount.toString());
  const [vatRate, setVatRate] = useState<'standard' | 'reduced'>(initialData.vatRate);
  const [reverseCharge, setReverseCharge] = useState(initialData.reverseCharge || false);
  const { log } = useEventLogger();

  const country = getCountryConfig(initialData.selectedCountry || 'DE');
  const standardRate = country?.standardRate || 19;
  const reducedRates = country?.reducedRates || [7];

  const handleNext = () => {
    log(CORE_EVENTS.VAT_CALCULATED, JSON.stringify({
      customerType,
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatRate,
      reverseCharge,
    }));

    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatRate,
      reverseCharge,
    });
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label>VAT Rate</Label>
          </div>
          <RadioGroup value={vatRate} onValueChange={(v) => setVatRate(v as 'standard' | 'reduced')} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="font-normal cursor-pointer">
                Standard ({standardRate}%)
              </Label>
            </div>
            {reducedRates.length > 0 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reduced" id="reduced" />
                <Label htmlFor="reduced" className="font-normal cursor-pointer">
                  Reduced ({reducedRates.join(' / ')}%)
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>

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

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Calculate VAT
        </Button>
      </div>
    </div>
  );
}
