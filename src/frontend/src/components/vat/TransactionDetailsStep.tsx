import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { type VATCalculationInput, type ServiceCategory } from '../../lib/vat/calculateVat';
import { getCurrentVatRate } from '../../lib/vat/germanyVatRateHistory';
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
  const [previousYearTurnover, setPreviousYearTurnover] = useState(initialData.previousYearTurnover.toString());
  const [currentYearTurnover, setCurrentYearTurnover] = useState(initialData.currentYearTurnover.toString());
  const { log } = useEventLogger();

  const currentStandardRate = getCurrentVatRate('standard');
  const currentReducedRate = getCurrentVatRate('reduced');

  const handleNext = () => {
    // Log VAT calculation event
    log(CORE_EVENTS.VAT_CALCULATED, JSON.stringify({
      customerType,
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatRate,
    }));

    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      serviceCategory,
      netAmount: parseFloat(netAmount) || 0,
      vatRate,
      previousYearTurnover: parseFloat(previousYearTurnover) || 0,
      currentYearTurnover: parseFloat(currentYearTurnover) || 0,
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
            Valid EU VAT ID enables reverse charge (0% VAT)
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
            <Badge variant="outline" className="text-xs">
              Valid as of today
            </Badge>
          </div>
          <RadioGroup value={vatRate} onValueChange={(v) => setVatRate(v as 'standard' | 'reduced')} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="font-normal cursor-pointer">
                Standard ({currentStandardRate}%)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reduced" id="reduced" />
              <Label htmlFor="reduced" className="font-normal cursor-pointer">
                Reduced ({currentReducedRate}%) - books, food, cultural services
              </Label>
            </div>
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
                  <p>Digital services to EU consumers use customer's VAT rate.</p>
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

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Kleinunternehmer Check (§19 UStG)</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="prev-turnover">Previous Year Turnover (€)</Label>
            <Input
              id="prev-turnover"
              type="number"
              step="0.01"
              value={previousYearTurnover}
              onChange={(e) => setPreviousYearTurnover(e.target.value)}
              placeholder="0.00"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="curr-turnover">Current Year Expected Turnover (€)</Label>
            <Input
              id="curr-turnover"
              type="number"
              step="0.01"
              value={currentYearTurnover}
              onChange={(e) => setCurrentYearTurnover(e.target.value)}
              placeholder="0.00"
              className="mt-2"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            If previous year &lt; €22,000 AND current year &lt; €50,000, you may qualify for VAT exemption
          </p>
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
