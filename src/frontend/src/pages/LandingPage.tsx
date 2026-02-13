import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Calculator, FileText, Brain, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Calculator, text: 'Multi-country EU VAT rates' },
    { icon: FileText, text: 'Reverse charge checker' },
    { icon: Zap, text: 'Country-specific rules' },
    { icon: Brain, text: 'AI VAT explanation' },
    { icon: Shield, text: 'Audit-safe invoices' },
    { icon: Globe, text: 'EU compliant formatting' },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Supporting 10 EU countries with country-specific VAT rules
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Free EU VAT Calculator & Invoice Generator
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Calculate VAT correctly for multiple EU countries. Generate compliant invoices. No signup required.
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/calculator' })}
            className="text-lg px-8 py-6 h-auto"
          >
            Calculate VAT Now – Free
          </Button>
        </div>

        <Card className="mb-12">
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

        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-4">Supported Countries</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['🇩🇪 Germany', '🇫🇷 France', '🇪🇸 Spain', '🇳🇱 Netherlands', '🇵🇱 Poland', '🇸🇪 Sweden', '🇮🇹 Italy', '🇧🇪 Belgium', '🇦🇹 Austria', '🇭🇺 Hungary'].map((country) => (
              <Badge key={country} variant="outline" className="text-sm">
                {country}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
