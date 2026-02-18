import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

interface CountrySelectionStepProps {
  onSelectCountry: (countryCode: string) => void;
  onBack: () => void;
}

export default function CountrySelectionStep({ onSelectCountry, onBack }: CountrySelectionStepProps) {
  const euCountries = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪', rate: '19%' },
    { code: 'FR', name: 'France', flag: '🇫🇷', rate: '20%' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', rate: '21%' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱', rate: '23%' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', rate: '25%' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', rate: '22%' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪', rate: '21%' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹', rate: '20%' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺', rate: '27%' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', rate: '21%' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Select Country</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="eu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="eu">EU Region</TabsTrigger>
              <TabsTrigger value="uk">UK Region</TabsTrigger>
            </TabsList>
            
            <TabsContent value="eu" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {euCountries.map((country) => (
                  <Button
                    key={country.code}
                    variant="outline"
                    className="w-full justify-between h-auto py-3"
                    onClick={() => onSelectCountry(country.code)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{country.rate}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="uk" className="space-y-3 mt-4">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4"
                onClick={() => onSelectCountry('GB')}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🇬🇧</span>
                  <span className="font-medium">United Kingdom</span>
                </span>
                <span className="text-sm text-muted-foreground">20%</span>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex">
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
