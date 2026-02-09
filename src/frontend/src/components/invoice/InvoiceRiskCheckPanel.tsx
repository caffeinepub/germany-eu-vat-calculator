import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { type RiskCheckResult } from '../../lib/invoice/riskCheck';

interface InvoiceRiskCheckPanelProps {
  riskCheck: RiskCheckResult;
}

export default function InvoiceRiskCheckPanel({ riskCheck }: InvoiceRiskCheckPanelProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Will Finanzamt accept this invoice?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Risk Check</DialogTitle>
          <DialogDescription>
            Deterministic analysis based on German VAT law requirements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Disclaimer:</strong> This is not legal advice. This analysis is provided for informational 
              purposes only and does not guarantee acceptance by the Finanzamt. Please consult a qualified tax 
              advisor for specific guidance.
            </AlertDescription>
          </Alert>

          {riskCheck.passed && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2 text-green-900 dark:text-green-100">
                <strong>No critical issues detected</strong>
                <p className="text-sm mt-1">All mandatory fields are present and validation checks passed.</p>
              </AlertDescription>
            </Alert>
          )}

          {riskCheck.risks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-red-600 dark:text-red-400">Critical Issues</h3>
              <ul className="space-y-2">
                {riskCheck.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {riskCheck.warnings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-amber-600 dark:text-amber-400">Warnings</h3>
              <ul className="space-y-2">
                {riskCheck.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
