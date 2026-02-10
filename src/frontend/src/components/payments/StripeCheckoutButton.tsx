import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { toast } from 'sonner';
import { useState } from 'react';

interface StripeCheckoutButtonProps {
  planName: string;
  priceInCents: number;
  disabled?: boolean;
}

export default function StripeCheckoutButton({ planName, priceInCents, disabled }: StripeCheckoutButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession();
  const { log } = useEventLogger();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      log(CORE_EVENTS.STRIPE_CHECKOUT_CLICKED, JSON.stringify({ plan: planName, price: priceInCents }));

      const session = await createCheckoutSession.mutateAsync([
        {
          productName: `${planName} Plan`,
          productDescription: `Monthly subscription to ${planName} plan`,
          priceInCents: BigInt(priceInCents),
          quantity: BigInt(1),
          currency: 'EUR',
        },
      ]);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isProcessing}
      className="w-full"
    >
      <CreditCard className="h-4 w-4 mr-2" />
      {isProcessing ? 'Processing...' : `Upgrade to ${planName}`}
    </Button>
  );
}
