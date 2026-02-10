import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { PlanType } from '../backend';

export type AccountPlanData = {
  activePlan: 'free' | 'starter' | 'pro';
  invoicesThisMonth: number;
};

export function useAccountPlan() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AccountPlanData>({
    queryKey: ['accountPlan', identity?.getPrincipal().toString()],
    queryFn: async (): Promise<AccountPlanData> => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      
      const usage = await actor.getMappedPlanUsage();
      
      // Map backend PlanType to frontend plan string
      let activePlan: 'free' | 'starter' | 'pro' = 'free';
      if (usage.plan === PlanType.starter) {
        activePlan = 'starter';
      } else if (usage.plan === PlanType.pro) {
        activePlan = 'pro';
      }
      
      return {
        activePlan,
        invoicesThisMonth: Number(usage.invoicesThisMonth),
      };
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 30000,
  });
}
