import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAccountPlan } from '../../hooks/useAccountPlan';

export default function UsageLimitBanner() {
  const { data: planData, isLoading } = useAccountPlan();

  if (isLoading || !planData) return null;

  const activePlan = planData.activePlan;
  const invoicesThisMonth = planData.invoicesThisMonth;
  
  // Only show for Free plan
  if (activePlan !== 'free') return null;

  const remaining = Math.max(0, 5 - invoicesThisMonth);
  const planName = activePlan.charAt(0).toUpperCase() + activePlan.slice(1);

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <strong>{planName} Plan:</strong> {remaining} of 5 invoices remaining this month
      </AlertDescription>
    </Alert>
  );
}
