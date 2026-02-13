import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function GlobalDisclaimer() {
  return (
    <Alert className="bg-muted/50 border-muted-foreground/20">
      <Info className="h-4 w-4 text-muted-foreground" />
      <AlertDescription className="ml-2 text-xs text-muted-foreground">
        At applicable, VAT rates may vary depending on goods, services, and regional regulations. 
        This tool provides estimates only and does not constitute legal or tax advice.
      </AlertDescription>
    </Alert>
  );
}
