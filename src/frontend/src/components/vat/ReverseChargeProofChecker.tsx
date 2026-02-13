import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { validateReverseChargeProof } from '../../lib/vat/validateReverseChargeProof';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { useEffect } from 'react';

interface ReverseChargeProofCheckerProps {
  vatId: string;
  customerCountry: string;
  customerType: 'B2C' | 'B2B';
}

export default function ReverseChargeProofChecker({
  vatId,
  customerCountry,
  customerType,
}: ReverseChargeProofCheckerProps) {
  const { log } = useEventLogger();
  const validation = validateReverseChargeProof(vatId, customerCountry, customerType);

  useEffect(() => {
    if (validation.isAllowed) {
      log(CORE_EVENTS.REVERSE_CHARGE_CHECKED);
    }
  }, [validation.isAllowed, log]);

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">B2B Cross-Border VAT Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">VAT ID Format</span>
          {validation.checks.formatValid ? (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Check className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              <X className="h-3 w-3 mr-1" />
              Invalid
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Country Match</span>
          {validation.checks.countryMatch ? (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Check className="h-3 w-3 mr-1" />
              Match
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              <X className="h-3 w-3 mr-1" />
              Mismatch
            </Badge>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Validation Result</span>
            {validation.isAllowed ? (
              <Badge className="bg-primary text-primary-foreground">
                <Check className="h-3 w-3 mr-1" />
                Allowed
              </Badge>
            ) : (
              <Badge variant="destructive">
                <X className="h-3 w-3 mr-1" />
                Not Allowed
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{validation.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
