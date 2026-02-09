import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import { toast } from 'sonner';
import type { ShoppingItem } from '../../backend';

interface StripeCheckoutButtonProps {
  planName: string;
  priceInCents: number;
  disabled?: boolean;
}

export default function StripeCheckoutButton({ planName, priceInCents, disabled }: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createCheckoutSession = useCreateCheckoutSession();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const items: ShoppingItem[] = [
        {
          productName: `${planName} Plan`,
          productDescription: `Monthly subscription to ${planName} plan`,
          priceInCents: BigInt(priceInCents),
          quantity: BigInt(1),
          currency: 'EUR',
        },
      ];

      const session = await createCheckoutSession.mutateAsync(items);
      
      // Validate session URL before redirecting
      if (!session?.url) {
        throw new Error('Checkout session URL is missing');
      }

      // Only redirect after successful validation
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to start checkout: ${errorMessage}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="w-full"
    >
      {isLoading ? 'Loading...' : disabled ? 'Current Plan' : 'Subscribe'}
    </Button>
  );
}
