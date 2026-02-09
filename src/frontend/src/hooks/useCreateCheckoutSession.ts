import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShoppingItem } from '../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      
      // Parse and validate the session response
      const session = JSON.parse(result) as CheckoutSession;
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      
      // Safety check: ensure the URL is a valid Stripe-hosted HTTPS URL
      if (!session.url.startsWith('https://checkout.stripe.com/')) {
        throw new Error('Invalid Stripe checkout URL');
      }
      
      return session;
    },
  });
}
