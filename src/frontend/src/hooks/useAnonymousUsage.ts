import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useDailyFingerprint } from './useDailyFingerprint';

const FREE_LIMIT = 5;

export function useAnonymousUsage() {
  const { actor } = useActor();
  const { fingerprint, isAvailable } = useDailyFingerprint();
  const queryClient = useQueryClient();

  const usageQuery = useQuery({
    queryKey: ['anonymousUsage', fingerprint],
    queryFn: async () => {
      if (!actor || !fingerprint) return 0;
      const count = await actor.getUsage(fingerprint);
      return Number(count);
    },
    enabled: !!actor && !!fingerprint && isAvailable,
  });

  const incrementMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !fingerprint) throw new Error('Actor or fingerprint not available');
      const newCount = await actor.incrementUsage(fingerprint);
      return Number(newCount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anonymousUsage', fingerprint] });
    },
  });

  const currentCount = usageQuery.data || 0;
  const canUse = currentCount < FREE_LIMIT;
  const remaining = Math.max(0, FREE_LIMIT - currentCount);

  return {
    currentCount,
    canUse,
    remaining,
    increment: incrementMutation.mutateAsync,
    isLoading: usageQuery.isLoading,
    isAvailable,
  };
}
