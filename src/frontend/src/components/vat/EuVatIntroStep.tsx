import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRY_LIST } from '../../lib/vat/euCountryConfig';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface EuVatIntroStepProps {
  onCountrySelect: (countryCode: string) => void;
}

export default function EuVatIntroStep({ onCountrySelect }: EuVatIntroStepProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCountry) {
      onCountrySelect(selectedCountry);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">EU VAT Calculator</h2>
        <p className="text-muted-foreground">
          Select your country to calculate VAT with country-specific rates and rules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COUNTRY_LIST.map((country) => (
          <button
            key={country.code}
            onClick={() => setSelectedCountry(country.code)}
            className={`relative p-4 rounded-lg border-2 transition-all text-left hover:border-primary/50 ${
              selectedCountry === country.code
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{country.name}</div>
                {country.configured ? (
                  <div className="text-xs text-muted-foreground">
                    Standard: {country.standardRate}%
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Configuration pending
                  </div>
                )}
              </div>
              {selectedCountry === country.code && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedCountry}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
}
