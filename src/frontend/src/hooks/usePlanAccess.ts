import { useAccountPlan } from './useAccountPlan';

export function usePlanAccess() {
  const { data: planData } = useAccountPlan();

  const activePlan = planData?.activePlan || 'free';
  const isPaid = activePlan === 'starter' || activePlan === 'pro';
  const isPro = activePlan === 'pro';
  const isStarter = activePlan === 'starter';

  return {
    activePlan,
    isPaid,
    isPro,
    isStarter,
  };
}
