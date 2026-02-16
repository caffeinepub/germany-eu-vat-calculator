import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface UkSelectCountryStepProps {
  onContinue: () => void;
}

export default function UkSelectCountryStep({ onContinue }: UkSelectCountryStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🇬🇧 UK VAT Calculator & Invoice Generator</h2>
        <p className="text-muted-foreground">Calculate VAT and generate compliant invoices for UK transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            UK VAT Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Standard VAT Rate:</span>
            <span className="text-lg font-bold text-primary">20%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Reduced VAT Rate:</span>
            <span className="text-lg font-bold text-primary">5%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Zero Rate:</span>
            <span className="text-lg font-bold text-primary">0%</span>
          </div>
          <div className="pt-2 text-sm text-muted-foreground">
            <p>VAT Registration Threshold: £90,000 (2024/25)</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onContinue} className="w-full" size="lg">
        Continue
      </Button>
    </div>
  );
}
