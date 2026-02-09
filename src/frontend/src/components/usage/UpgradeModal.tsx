import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate({ to: '/upgrade' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            You've reached your monthly invoice limit. Upgrade to continue generating invoices.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Choose a plan that fits your needs:
          </p>
          <ul className="text-sm space-y-2">
            <li>• <strong>Starter:</strong> €5/month - 50 invoices</li>
            <li>• <strong>Pro:</strong> €10-15/month - Unlimited + PDF export</li>
          </ul>
          <Button onClick={handleUpgrade} className="w-full">
            View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
