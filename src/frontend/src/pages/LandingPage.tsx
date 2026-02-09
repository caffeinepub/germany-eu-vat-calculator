import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Calculator, FileText, Brain, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Calculator, text: 'German VAT (19% / 7%)' },
    { icon: FileText, text: 'Reverse charge checker' },
    { icon: Zap, text: 'Kleinunternehmer exemption' },
    { icon: Brain, text: 'AI VAT explanation' },
    { icon: Shield, text: 'Audit-safe invoices' },
    { icon: Globe, text: 'OSS readiness indicator' },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Built specifically for German VAT rules — not a generic EU calculator.
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Free German VAT Calculator & Invoice Generator
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Calculate VAT correctly for Germany. Generate compliant invoices. No signup required.
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

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">19%</div>
              <p className="text-muted-foreground">Standard VAT Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">7%</div>
              <p className="text-muted-foreground">Reduced VAT Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <p className="text-muted-foreground">Reverse Charge</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
