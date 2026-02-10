import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { type VATCalculationInput, type VATCalculationResult } from '../../lib/vat/calculateVat';
import { explainGermanyVAT } from '../../lib/vat/explainVat';
import { explainVatLikeIm12 } from '../../lib/vat/explainVatLikeIm12';
import { usePlanAccess } from '../../hooks/usePlanAccess';
import ExplainVatPaywallDialog from './ExplainVatPaywallDialog';

interface ExplainVatPanelProps {
  formData: VATCalculationInput;
  result: VATCalculationResult;
}

export default function ExplainVatPanel({ formData, result }: ExplainVatPanelProps) {
  const { isPro } = usePlanAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const standardExplanation = explainGermanyVAT(formData, result);
  const simpleExplanation = explainVatLikeIm12(formData, result);

  const handleExportPdf = () => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    // Pro feature - PDF export
    alert('PDF export feature coming soon for Pro users!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>VAT Explanation</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF {!isPro && '(Pro)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="simple">Explain like I'm 12</TabsTrigger>
            </TabsList>
            <TabsContent value="standard" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{standardExplanation}</p>
              </div>
            </TabsContent>
            <TabsContent value="simple" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{simpleExplanation}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ExplainVatPaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  );
}
