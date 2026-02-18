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
import { type ProductCategory } from '../../lib/vat/reducedEligibility';
import { getProductCategoryOptions, type ProductCategoryOption } from '../../lib/vat/productCategoryOptions';
import VatCategoryItemsPicker from './VatCategoryItemsPicker';

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
  const [productCategoryOption, setProductCategoryOption] = useState<string>('others');
  const [vatCategory, setVatCategory] = useState<VatCategory>(
    initialData.vatCategory || 'standard'
  );
  const [netAmount, setNetAmount] = useState(initialData.netAmount.toString());

  const sellerCountry = initialData.sellerCountry || 'DE';
  const categoryOptions = getProductCategoryOptions(sellerCountry);

  const handleNext = () => {
    // Find the selected option to get exemptIdentifier
    const selectedOption = categoryOptions.find(opt => 
      `${opt.value}-${opt.label}` === productCategoryOption
    );
    
    const productCategory = selectedOption?.value || 'others';
    const exemptIdentifier = selectedOption?.exemptIdentifier || '';

    onNext({
      customerType,
      vatId: customerType === 'B2B' ? vatId : '',
      productCategory,
      vatCategory,
      netAmount: parseFloat(netAmount) || 0,
      // Pass exemptIdentifier for exempt category detection
      ...(exemptIdentifier && { exemptIdentifier }),
    } as any);
  };

  const showAutoFallbackWarning = productCategoryOption.includes('Others');

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

          {/* VAT ID for B2B */}
          {customerType === 'B2B' && (
            <div>
              <Label htmlFor="vat-id" className="text-sm font-medium mb-2 block">
                Customer VAT ID (Optional)
              </Label>
              <Input
                id="vat-id"
                value={vatId}
                onChange={(e) => setVatId(e.target.value)}
                placeholder="e.g., DE123456789"
              />
            </div>
          )}

          {/* Product Category */}
          <div>
            <Label htmlFor="product-category" className="text-sm font-medium mb-2 block">
              Product Category
            </Label>
            <Select value={productCategoryOption} onValueChange={setProductCategoryOption}>
              <SelectTrigger id="product-category" className="select-trigger-safe dropdown-safe">
                <SelectValue placeholder="Select product category" />
              </SelectTrigger>
              <SelectContent className="dropdown-safe" style={{ overflow: 'visible' }}>
                {categoryOptions.map((option, index) => (
                  <SelectItem key={`${option.value}-${option.label}-${index}`} value={`${option.value}-${option.label}`}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showAutoFallbackWarning && (
              <Alert className="mt-2 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  This category will automatically use the standard VAT rate.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* VAT Category - Now using visible items picker */}
          <div>
            <VatCategoryItemsPicker
              categories={VAT_CATEGORIES}
              selectedValue={vatCategory}
              onSelect={(category) => setVatCategory(category)}
            />
          </div>

          {/* Net Amount */}
          <div>
            <Label htmlFor="net-amount" className="text-sm font-medium mb-2 block">
              Net Amount (€)
            </Label>
            <Input
              id="net-amount"
              type="number"
              step="0.01"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          className="flex-1"
          disabled={!netAmount || parseFloat(netAmount) <= 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
