import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePlanAccess } from '../hooks/usePlanAccess';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useIsStripeConfigured } from '../hooks/useQueries';
import StripeAdminSetup from '../components/payments/StripeAdminSetup';
import { toast } from 'sonner';
import { useEventLogger } from '../hooks/useEventLogger';
import { CORE_EVENTS } from '../lib/analytics/coreEvents';

export default function UpgradePage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { activePlan } = usePlanAccess();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: isStripeConfigured, isLoading: isCheckingStripe } = useIsStripeConfigured();
  const [isProcessing, setIsProcessing] = useState(false);
  const { log } = useEventLogger();

  const isAuthenticated = !!identity;

  const handleSelectPlan = async (planName: string, priceInCents: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to upgrade your plan');
      await login();
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Payment system is not configured yet');
      return;
    }

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

  const plans = [
    {
      name: 'Free',
      price: '€0',
      description: '5 invoices per month',
      features: [
        'VAT calculation',
        'Invoice preview',
        'Basic explanations',
        '5 invoices/month',
      ],
      cta: 'Current Plan',
      disabled: true,
      priceInCents: 0,
    },
    {
      name: 'Starter',
      price: '€5',
      period: '/month',
      description: 'For freelancers and small businesses',
      features: [
        'Everything in Free',
        'Unlimited invoices',
        'PDF download',
        'Invoice history',
        'Email support',
      ],
      cta: activePlan === 'starter' ? 'Current Plan' : 'Upgrade to Starter',
      disabled: activePlan === 'starter' || activePlan === 'pro',
      priceInCents: 500,
    },
    {
      name: 'Pro',
      price: '€12',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Everything in Starter',
        'Batch ZIP export',
        'CSV/Excel export (DATEV)',
        'OSS reports',
        'Priority support',
        'Advanced explanations',
      ],
      cta: activePlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      disabled: activePlan === 'pro',
      priceInCents: 1200,
      popular: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Get audit-safe invoices with German VAT compliance
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>GDPR-compliant • No signup required • No ads</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Please log in to upgrade your plan
          </p>
        </div>
      )}

      {isAuthenticated && !isStripeConfigured && !isCheckingStripe && (
        <div className="mb-8">
          <StripeAdminSetup />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled || isProcessing || !isAuthenticated}
                onClick={() => handleSelectPlan(plan.name, plan.priceInCents)}
              >
                {isProcessing ? 'Processing...' : plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include German VAT compliance and audit-safe invoices</p>
        <p className="mt-2">Need help? Contact us at support@example.com</p>
      </div>
    </div>
  );
}
