import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type VATCalculationInput } from '../../lib/vat/calculateVat';

interface CountrySelectionStepProps {
  initialData: VATCalculationInput;
  onNext: (data: Partial<VATCalculationInput>) => void;
}

const EU_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PL', name: 'Poland' },
];

export default function CountrySelectionStep({ initialData, onNext }: CountrySelectionStepProps) {
  const [customerCountry, setCustomerCountry] = useState(initialData.customerCountry);

  const handleNext = () => {
    onNext({ customerCountry });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="seller-country">Seller Country</Label>
          <div className="mt-2 p-3 bg-muted rounded-md text-sm">
            <strong>Germany (DE)</strong> - Fixed for this calculator
          </div>
        </div>

        <div>
          <Label htmlFor="customer-country">Customer Country</Label>
          <Select value={customerCountry} onValueChange={setCustomerCountry}>
            <SelectTrigger id="customer-country" className="mt-2">
              <SelectValue placeholder="Select customer country" />
            </SelectTrigger>
            <SelectContent>
              {EU_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleNext} className="w-full">
        Next: Transaction Details
      </Button>
    </div>
  );
}
