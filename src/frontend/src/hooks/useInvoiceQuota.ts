import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAccountPlan } from './useAccountPlan';
import { useInternetIdentity } from './useInternetIdentity';

export function useInvoiceQuota() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: planData } = useAccountPlan();
  const queryClient = useQueryClient();

  const saveInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error('Must be logged in to save invoices');
      
      // Backend no longer tracks invoice counts, return success
      // In a future version, this could be restored with backend support
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountPlan'] });
    },
  });

  const remaining = planData
    ? Number(planData.maxInvoices) - Number(planData.monthlyUsage)
    : 0;

  const canSaveInvoice = remaining > 0;
  const isPro = planData?.activePlan === 'pro';

  return {
    saveInvoice: () => saveInvoiceMutation.mutateAsync(),
    canSaveInvoice,
    isPro,
    remaining,
  };
}
