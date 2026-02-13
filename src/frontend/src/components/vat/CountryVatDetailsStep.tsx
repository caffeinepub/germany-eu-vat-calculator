import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle } from 'lucide-react';
import { getCountryConfig } from '../../lib/vat/euCountryConfig';

interface CountryVatDetailsStepProps {
  countryCode: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function CountryVatDetailsStep({
  countryCode,
  onContinue,
  onBack,
}: CountryVatDetailsStepProps) {
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

  const features = [
    `${country.invoiceLabel} calculation`,
    'Reverse charge support',
    'Invoice ready',
    'EU compliant formatting',
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{country.flag}</div>
        <h2 className="text-2xl font-bold mb-2">{country.name} VAT Calculator</h2>
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
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Standard VAT</div>
                  <div className="text-3xl font-bold text-primary">
                    {country.standardRate}%
                  </div>
                </div>
                {country.reducedRates.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Reduced VAT</div>
                    <div className="flex gap-2">
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

          <div className="space-y-2">
            <h3 className="font-medium">Features:</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!country.configured}
          className="flex-1"
        >
          Start Calculator
        </Button>
      </div>
    </div>
  );
}
