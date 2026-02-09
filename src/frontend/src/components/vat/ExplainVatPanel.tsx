import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ArrowLeft, Download } from 'lucide-react';
import { explainGermanyVAT } from '../../lib/vat/explainVat';
import { explainVatLikeIm12 } from '../../lib/vat/explainVatLikeIm12';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { toast } from 'sonner';

interface ExplainVatPanelProps {
  formData: VATCalculationInput;
  result: VATCalculationResult;
  onBack: () => void;
}

export default function ExplainVatPanel({ formData, result, onBack }: ExplainVatPanelProps) {
  const { isPro } = usePlanAccess();
  const [activeTab, setActiveTab] = useState<'standard' | 'simple'>('standard');
  
  const standardExplanation = explainGermanyVAT(formData, result);
  const simpleExplanation = explainVatLikeIm12(formData, result);

  const handleDownloadPDF = () => {
    if (!isPro) {
      toast.error('PDF export is only available for Pro users. Please upgrade.');
      return;
    }
    toast.info('PDF export feature coming soon!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VAT Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'standard' | 'simple')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="simple">Explain like I'm 12</TabsTrigger>
            </TabsList>
            <TabsContent value="standard" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">{standardExplanation}</p>
              </div>
            </TabsContent>
            <TabsContent value="simple" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">{simpleExplanation}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as PDF {!isPro && '(Pro only)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>Disclaimer:</strong> This is not legal advice. This explanation is provided for
          informational purposes only. Please consult a qualified tax advisor for specific guidance
          on your situation.
        </AlertDescription>
      </Alert>

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Results
      </Button>
    </div>
  );
}
