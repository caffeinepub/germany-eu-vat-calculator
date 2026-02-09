import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAccountPlan } from '../../hooks/useAccountPlan';

export default function UsageLimitBanner() {
  const { data: planData, isLoading } = useAccountPlan();

  if (isLoading || !planData) return null;

  const remaining = Number(planData.maxInvoices) - Number(planData.monthlyUsage);
  const planName = planData.activePlan.charAt(0).toUpperCase() + planData.activePlan.slice(1);

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="ml-2">
        <strong>{planName} Plan:</strong> {remaining} of {planData.maxInvoices.toString()} invoices
        remaining this month
      </AlertDescription>
    </Alert>
  );
}
