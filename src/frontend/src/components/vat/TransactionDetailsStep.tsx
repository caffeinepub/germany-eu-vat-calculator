import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { type VATCalculationInput } from '../../lib/vat/calculateVat';
import { type VatCategory, VAT_CATEGORIES, VAT_CATEGORY_LABELS } from '../../lib/vat/vatCategoryRateRules';
import { type ProductCategory, PRODUCT_CATEGORIES } from '../../lib/vat/reducedEligibility';

interface TransactionDetailsStepProps {
  initialData: VATCalculationInput;
  onNext: (data: Partial<VATCalculationInput>) => void;
  onBack: () => void;
}

export default function TransactionDetailsStep({
  initialData,
  onNext,
  onBack,
}: TransactionDetailsStepProps) {
  const [customerType, setCustomerType] = useState<'B2C' | 'B2B'>(initialData.customerType);
  const [vatId, setVatId] = useState(initialData.vatId);
  const [productCategory, setProductCategory] = useState<ProductCategory>(
    initialData.productCategory || 'others'
  );
  const [vatCategory, setVatCategory] = useState<VatCategory>(
    initialData.vatCategory || 'others'
  );
  const [netAmount, setNetAmount] = useState(initialData.netAmount.toString());

  const handleNext = () => {
    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      productCategory,
      vatCategory,
      netAmount: parseFloat(netAmount) || 0,
    });
  };

  const showAutoFallbackWarning = productCategory === 'others';

  return (
    <div className="space-y-6" style={{ overflow: 'visible' }}>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Customer Type</Label>
            <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'B2C' | 'B2B')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2 flex-1 border rounded-md p-3 hover:bg-muted/50">
                  <RadioGroupItem value="B2C" id="customer-b2c" />
                  <Label htmlFor="customer-b2c" className="font-normal cursor-pointer flex-1">
                    B2C (Consumer)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1 border rounded-md p-3 hover:bg-muted/50">
                  <RadioGroupItem value="B2B" id="customer-b2b" />
                  <Label htmlFor="customer-b2b" className="font-normal cursor-pointer flex-1">
                    B2B (Business)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* VAT ID (B2B only) */}
          {customerType === 'B2B' && (
            <div>
              <Label htmlFor="vat-id">Customer VAT ID (optional)</Label>
              <Input
                id="vat-id"
                value={vatId}
                onChange={(e) => setVatId(e.target.value)}
                placeholder="e.g., DE123456789"
                className="font-mono"
              />
            </div>
          )}

          {/* Product Category */}
          <div style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
            <Label htmlFor="product-category">Product Category</Label>
            <Select value={productCategory} onValueChange={(v) => setProductCategory(v as ProductCategory)}>
              <SelectTrigger id="product-category" className="select-trigger-safe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dropdown-safe">
                {PRODUCT_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VAT Category */}
          <div style={{ overflow: 'visible', position: 'relative', zIndex: 90 }}>
            <Label htmlFor="vat-category">VAT Category</Label>
            <Select value={vatCategory} onValueChange={(v) => setVatCategory(v as VatCategory)}>
              <SelectTrigger id="vat-category" className="select-trigger-safe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dropdown-safe">
                {VAT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {VAT_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-fallback warning */}
          {showAutoFallbackWarning && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
                <p className="font-medium">Auto-fallback to Standard Rate</p>
                <p className="text-sm mt-1">
                  The "Others" category will use the standard VAT rate. If your product/service qualifies for a reduced rate, please select the appropriate category.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Net Amount */}
          <div>
            <Label htmlFor="net-amount">Net Amount (€)</Label>
            <Input
              id="net-amount"
              type="number"
              step="0.01"
              min="0"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!netAmount || parseFloat(netAmount) <= 0}>
          Calculate VAT
        </Button>
      </div>
    </div>
  );
}
