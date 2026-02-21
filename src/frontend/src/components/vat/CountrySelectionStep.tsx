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
    // Comprehensive null/undefined check
    if (countryCode === null || countryCode === undefined) {
      console.warn("Invalid country code: null or undefined");
      return;
    }

    // Ensure we have a valid string type
    const validCountryCode = typeof countryCode === 'string' ? countryCode : String(countryCode);
    
    // Validate the string value
    if (!validCountryCode || validCountryCode === 'undefined' || validCountryCode === 'null' || validCountryCode.trim() === '') {
      console.warn("Invalid country code value:", countryCode);
      return;
    }

    onCountrySelect(validCountryCode);
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
              if (!config || !config.country) return null;
              
              return (
                <Button
                  key={config.country}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4 hover:bg-accent"
                  onClick={() => handleCountryClick(config.country)}
                >
                  <span className="text-3xl">{config.flag || '🏳️'}</span>
                  <span className="font-medium">{config.countryName || config.country}</span>
                  <span className="text-sm text-muted-foreground">
                    {config.standardRate || 0}% VAT
                  </span>
                </Button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="uk" className="space-y-4">
          {ukConfig && ukConfig.country && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-accent"
                onClick={() => handleCountryClick(ukConfig.country)}
              >
                <span className="text-3xl">{ukConfig.flag || '🏳️'}</span>
                <span className="font-medium">{ukConfig.countryName || ukConfig.country}</span>
                <span className="text-sm text-muted-foreground">
                  {ukConfig.standardRate || 0}% VAT
                </span>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
