import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEventLogger } from '../hooks/useEventLogger';
import { CORE_EVENTS } from '../lib/analytics/coreEvents';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { log } = useEventLogger();

  useEffect(() => {
    // Log payment success
    log(CORE_EVENTS.PAYMENT_SUCCESS);

    // Invalidate plan cache to fetch updated plan
    queryClient.invalidateQueries({ queryKey: ['accountPlan'] });
  }, [log, queryClient]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for upgrading! Your plan has been activated and you now have access to all premium features.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate({ to: '/calculator' })} className="flex-1">
              Start Calculating
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/invoices' })} className="flex-1">
              View Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
