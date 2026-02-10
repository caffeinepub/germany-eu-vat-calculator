import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { useEffect } from 'react';

interface ExplainVatPaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExplainVatPaywallDialog({ open, onOpenChange }: ExplainVatPaywallDialogProps) {
  const navigate = useNavigate();
  const { log } = useEventLogger();

  useEffect(() => {
    if (open) {
      log(CORE_EVENTS.UPGRADE_CTA_SHOWN, 'explain_vat_paywall');
    }
  }, [open, log]);

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate({ to: '/upgrade' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl">Why is VAT applied here?</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Pro explains the legal basis, rate, and exceptions in plain language.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            Get VAT explanations with Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
