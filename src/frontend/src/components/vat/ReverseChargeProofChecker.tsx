import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { validateReverseChargeProof } from '../../lib/vat/validateReverseChargeProof';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { useEffect, useRef } from 'react';

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
  const validation = validateReverseChargeProof(vatId, customerCountry, customerType);
  const { log } = useEventLogger();
  const hasLoggedReverseCharge = useRef(false);

  useEffect(() => {
    // Log reverse_charge_checked when validation is allowed
    if (validation.conclusion === 'allowed' && !hasLoggedReverseCharge.current) {
      hasLoggedReverseCharge.current = true;
      log(CORE_EVENTS.REVERSE_CHARGE_CHECKED, JSON.stringify({
        vatId,
        customerCountry,
        conclusion: validation.conclusion,
      }));
    }
  }, [validation.conclusion, vatId, customerCountry, log]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Reverse Charge Proof Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">VAT ID Format</span>
            {validation.checks.vatIdFormat.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{validation.checks.vatIdFormat.message}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Country Match</span>
            {validation.checks.countryMatch.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{validation.checks.countryMatch.message}</p>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Conclusion:</span>
            <Badge variant={validation.conclusion === 'allowed' ? 'default' : 'destructive'}>
              {validation.conclusion === 'allowed' ? '✔ Reverse charge allowed' : '❌ VAT must be charged'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{validation.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
