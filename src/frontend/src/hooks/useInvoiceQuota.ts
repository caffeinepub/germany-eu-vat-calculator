import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAccountPlan } from './useAccountPlan';

interface SaveInvoiceParams {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  htmlSource: string;
  vatRate: number;
  vatAmount: number;
  currency: string;
  vatLabel: string;
}

export function useInvoiceQuota() {
  const { actor } = useActor();
  const { data: planData } = useAccountPlan();
  const queryClient = useQueryClient();

  const saveInvoiceMutation = useMutation({
    mutationFn: async (params: SaveInvoiceParams) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.saveInvoice(
        params.id,
        params.invoiceNumber,
        params.invoiceDate,
        params.htmlSource,
        params.vatAmount,
        params.vatRate,
        params.currency,
        params.vatLabel
      );
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountPlan'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const activePlan = planData?.activePlan || 'free';
  const invoicesThisMonth = planData?.invoicesThisMonth || 0;
  
  // Free plan: 5 invoices/month
  const remaining = activePlan === 'free' ? Math.max(0, 5 - invoicesThisMonth) : Infinity;
  const canSaveInvoice = remaining > 0;

  return {
    saveInvoice: (params: SaveInvoiceParams) => saveInvoiceMutation.mutateAsync(params),
    canSaveInvoice,
    remaining,
    activePlan,
  };
}
