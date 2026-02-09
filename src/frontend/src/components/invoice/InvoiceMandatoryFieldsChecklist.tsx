import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { type MandatoryFieldsValidation } from '../../lib/invoice/validateInvoiceMandatoryFields';

interface InvoiceMandatoryFieldsChecklistProps {
  validation: MandatoryFieldsValidation;
}

export default function InvoiceMandatoryFieldsChecklist({ validation }: InvoiceMandatoryFieldsChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invoice Mandatory Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {validation.checks
          .filter(check => check.required)
          .map((check) => (
            <div key={check.field} className="flex items-center justify-between">
              <span className="text-sm">{check.label}</span>
              {check.present ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          ))}

        {!validation.allPassed && validation.missingFields.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>⚠ Missing mandatory field:</strong> {validation.missingFields[0]}
              {validation.missingFields.length > 1 && ` (+${validation.missingFields.length - 1} more)`}
            </AlertDescription>
          </Alert>
        )}

        {validation.allPassed && (
          <Alert className="mt-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="ml-2 text-green-900 dark:text-green-100">
              All mandatory fields are complete
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
