import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface FlowStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function FlowStepper({ steps, currentStep }: FlowStepperProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-xs mt-1 text-center hidden sm:block">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 transition-colors ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
