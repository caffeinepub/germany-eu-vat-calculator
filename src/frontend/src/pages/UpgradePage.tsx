import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import StripeCheckoutButton from '../components/payments/StripeCheckoutButton';
import StripeAdminSetup from '../components/payments/StripeAdminSetup';
import { useAccountPlan } from '../hooks/useAccountPlan';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UpgradePage() {
  const { actor } = useActor();
  const { data: planData } = useAccountPlan();
  const currentPlan = planData?.activePlan || 'free';

  const { data: isStripeConfigured } = useQuery({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      features: ['5 invoices/month', 'German VAT calculation', 'Invoice preview', 'AI explanation'],
      planId: 'free',
    },
    {
      name: 'Starter',
      price: '€5',
      period: 'per month',
      features: ['50 invoices/month', 'All Free features', 'Priority support', 'Email notifications'],
      planId: 'starter',
      priceInCents: 500,
    },
    {
      name: 'Pro',
      price: '€12',
      period: 'per month',
      features: [
        'Unlimited invoices',
        'All Starter features',
        'PDF export',
        'Custom branding',
        'API access',
      ],
      planId: 'pro',
      priceInCents: 1200,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <StripeAdminSetup />
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the plan that best fits your business needs
          </p>
        </div>

        {!isStripeConfigured && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment processing is currently being configured. Please check back shortly to subscribe to paid plans.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.planId}
              className={currentPlan === plan.planId ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground"> / {plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.planId === 'free' ? (
                  <Button variant="outline" className="w-full" disabled={currentPlan === 'free'}>
                    {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                  </Button>
                ) : (
                  <StripeCheckoutButton
                    planName={plan.name}
                    priceInCents={plan.priceInCents!}
                    disabled={currentPlan === plan.planId || !isStripeConfigured}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
