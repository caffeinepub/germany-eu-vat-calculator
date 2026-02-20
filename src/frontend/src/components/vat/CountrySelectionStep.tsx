import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEUCountryConfigs, getUKCountryConfig } from '@/lib/vat/euCountryConfig';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface CountrySelectionStepProps {
  onCountrySelect: (country: string) => void;
  onBack?: () => void;
}

export default function CountrySelectionStep({ onCountrySelect, onBack }: CountrySelectionStepProps) {
  const navigate = useNavigate();
  const euCountries = getEUCountryConfigs();
  const ukConfig = getUKCountryConfig();

  const handleCountryClick = (countryCode: string | null | undefined) => {
    // Defensive check before calling callback
    if (!countryCode) {
      console.error('Country code is undefined');
      return;
    }
    onCountrySelect(countryCode);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Select Your Country</h2>
          <p className="text-muted-foreground">Choose where your business is registered</p>
        </div>
      </div>

      <Tabs defaultValue="eu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eu">EU Countries</TabsTrigger>
          <TabsTrigger value="uk">United Kingdom</TabsTrigger>
        </TabsList>

        <TabsContent value="eu" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {euCountries.map((config) => {
              if (!config) return null;
              
              return (
                <Button
                  key={config.country}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4 hover:bg-accent"
                  onClick={() => handleCountryClick(config.country)}
                >
                  <span className="text-3xl">{config.flag}</span>
                  <span className="font-medium">{config.countryName}</span>
                  <span className="text-sm text-muted-foreground">
                    {config.standardRate}% VAT
                  </span>
                </Button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="uk" className="space-y-4">
          {ukConfig && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-accent"
                onClick={() => handleCountryClick(ukConfig.country)}
              >
                <span className="text-3xl">{ukConfig.flag}</span>
                <span className="font-medium">{ukConfig.countryName}</span>
                <span className="text-sm text-muted-foreground">
                  {ukConfig.standardRate}% VAT
                </span>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
