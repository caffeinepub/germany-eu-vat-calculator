import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

// Mock account plan data since backend no longer tracks this
export type AccountPlanData = {
  activePlan: 'free' | 'starter' | 'pro';
  maxInvoices: bigint;
  monthlyUsage: bigint;
};

export function useAccountPlan() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AccountPlanData>({
    queryKey: ['accountPlan', identity?.getPrincipal().toString()],
    queryFn: async (): Promise<AccountPlanData> => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      
      // Backend no longer tracks account plans, return default free plan
      // In a future version, this could be restored with backend support
      return {
        activePlan: 'free',
        maxInvoices: BigInt(5),
        monthlyUsage: BigInt(0),
      };
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 30000,
  });
}
