import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, Brain, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Calculator, text: 'Multi-country tax rates' },
    { icon: FileText, text: 'Reverse charge checker' },
    { icon: Zap, text: 'Country-specific rules' },
    { icon: Brain, text: 'AI tax explanation' },
    { icon: Shield, text: 'Audit-safe invoices' },
    { icon: Globe, text: 'Compliant formatting' },
  ];

  const euCountries = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  ];

  const handleCountrySelect = (countryCode: string) => {
    navigate({ 
      to: '/calculator',
      search: { country: countryCode }
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Calculate Tax correctly for multiple countries
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate compliant invoices. No signup required.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/calculator', search: {} })}
            className="text-lg px-8 py-6 h-auto"
          >
            Get Started
          </Button>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Your Region</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* EU Region */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">EU Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {euCountries.map((country) => (
                  <Button
                    key={country.code}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleCountrySelect(country.code)}
                  >
                    <span className="mr-2">{country.flag}</span>
                    {country.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* UK Region */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">UK Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCountrySelect('GB')}
                >
                  <span className="mr-2">🇬🇧</span>
                  United Kingdom
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
