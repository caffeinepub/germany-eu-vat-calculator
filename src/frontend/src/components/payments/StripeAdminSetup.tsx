import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../../backend';

export default function StripeAdminSetup() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [secretKey, setSecretKey] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity,
  });

  const { data: isConfigured } = useQuery({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const setConfigMutation = useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      toast.success('Stripe configured successfully');
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      setShowSetup(false);
      // Clear the secret key from state after successful configuration
      setSecretKey('');
    },
    onError: (error) => {
      toast.error('Failed to configure Stripe');
      console.error(error);
    },
  });

  useEffect(() => {
    if (isAdmin && isConfigured === false) {
      setShowSetup(true);
    }
  }, [isAdmin, isConfigured]);

  if (!isAdmin || isConfigured) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Note: Secret key is only stored in backend, never logged or persisted client-side
    const config: StripeConfiguration = {
      secretKey,
      allowedCountries: ['DE', 'AT', 'FR', 'NL', 'BE', 'ES', 'IT', 'PL'],
    };
    setConfigMutation.mutate(config);
  };

  if (!showSetup) return null;

  return (
    <Card className="mb-8 border-yellow-500">
      <CardHeader>
        <CardTitle>⚠️ Admin: Configure Stripe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stripe-key">Stripe Secret Key</Label>
            <Input
              id="stripe-key"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              required
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your secret key is securely stored in the backend and never exposed in the frontend.
            </p>
          </div>
          <Button type="submit" disabled={setConfigMutation.isPending}>
            {setConfigMutation.isPending ? 'Configuring...' : 'Configure Stripe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
