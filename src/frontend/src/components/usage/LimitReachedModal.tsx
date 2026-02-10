import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { useEffect } from 'react';

interface LimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LimitReachedModal({ open, onOpenChange }: LimitReachedModalProps) {
  const navigate = useNavigate();
  const { log } = useEventLogger();

  useEffect(() => {
    if (open) {
      log(CORE_EVENTS.UPGRADE_CTA_SHOWN, 'limit_reached_modal');
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
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl">You've reached your free limit</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Germany has strict VAT rules. With the Pro plan, your invoices stay correct, audit-ready, and up to date.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Maybe later
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            ✔️ Unlock unlimited invoices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
