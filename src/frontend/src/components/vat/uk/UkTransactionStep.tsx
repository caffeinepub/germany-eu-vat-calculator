import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import { type UkTransactionInput, type UkTransactionType, type UkCustomerType, type UkVatCategory } from '@/lib/vat/ukTypes';
import { checkUkMisuseWarnings } from '@/lib/vat/ukMisuseWarnings';

interface UkTransactionStepProps {
  initialData?: Partial<UkTransactionInput>;
  onNext: (data: UkTransactionInput) => void;
  onBack: () => void;
}

export default function UkTransactionStep({ initialData, onNext, onBack }: UkTransactionStepProps) {
  const [transactionType, setTransactionType] = useState<UkTransactionType>(
    initialData?.transactionType || 'domestic-sale'
  );
  const [customerType, setCustomerType] = useState<UkCustomerType>(
    initialData?.customerType || 'individual-consumer'
  );
  const [vatCategory, setVatCategory] = useState<UkVatCategory>(
    initialData?.vatCategory || 'standard-20'
  );
  const [netAmount, setNetAmount] = useState<string>(
    initialData?.netAmount?.toString() || ''
  );
  const [customerVatId, setCustomerVatId] = useState<string>(
    initialData?.customerVatId || ''
  );
  const [serviceDescription, setServiceDescription] = useState<string>('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [inlineWarning, setInlineWarning] = useState<string | null>(null);

  // Check for misuse warnings when VAT category or service description changes
  useEffect(() => {
    const warning = checkUkMisuseWarnings(vatCategory, serviceDescription);
    if (warning) {
      if (warning.showModal) {
        setWarningMessage(warning.message);
        setShowWarningModal(true);
        setInlineWarning(null);
      } else {
        setInlineWarning(warning.message);
      }
    } else {
      setInlineWarning(null);
    }
  }, [vatCategory, serviceDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(netAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const data: UkTransactionInput = {
      transactionType,
      customerType,
      vatCategory,
      netAmount: amount,
      customerVatId: customerVatId.trim() || undefined,
    };

    onNext(data);
  };

  const isGoodsExport = transactionType === 'goods-export';
  const isServiceEuBusiness = transactionType === 'service-eu-business';
  const showEuBusinessOption = isServiceEuBusiness;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transactionType">Supply Type</Label>
          <Select value={transactionType} onValueChange={(value) => setTransactionType(value as UkTransactionType)}>
            <SelectTrigger id="transactionType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic-sale">Domestic Sale (UK → UK)</SelectItem>
              <SelectItem value="goods-export">Goods Export (UK → Outside UK)</SelectItem>
              <SelectItem value="service-eu-business">Service to EU Business</SelectItem>
              <SelectItem value="service-eu-consumer">Service to EU Consumer</SelectItem>
              <SelectItem value="international-sale">International Sale (UK → Non-EU)</SelectItem>
              <SelectItem value="import-into-uk">Import into UK</SelectItem>
            </SelectContent>
          </Select>
          {isGoodsExport && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 mt-2">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2 text-green-900 dark:text-green-100 text-sm">
                Goods exports are <strong>Zero Rated</strong> (0% VAT). This is a taxable supply where you can reclaim input VAT.
              </AlertDescription>
            </Alert>
          )}
          {isServiceEuBusiness && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 mt-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="ml-2 text-blue-900 dark:text-blue-100 text-sm">
                Services to EU businesses use <strong>Reverse Charge</strong> (0% VAT). Customer accounts for VAT in their country.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerType">Customer Type</Label>
          <Select value={customerType} onValueChange={(value) => setCustomerType(value as UkCustomerType)}>
            <SelectTrigger id="customerType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business-vat-registered">Business (UK VAT Registered)</SelectItem>
              {showEuBusinessOption && (
                <SelectItem value="business-eu">Business (EU)</SelectItem>
              )}
              <SelectItem value="individual-consumer">Individual / Consumer</SelectItem>
              <SelectItem value="government-charity">Government / Charity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(customerType === 'business-vat-registered' || customerType === 'business-eu') && (
          <div className="space-y-2">
            <Label htmlFor="customerVatId">Customer VAT Number (Optional)</Label>
            <Input
              id="customerVatId"
              value={customerVatId}
              onChange={(e) => setCustomerVatId(e.target.value)}
              placeholder={customerType === 'business-eu' ? 'DE123456789' : 'GB123456789'}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="vatCategory">VAT Category</Label>
          <Select value={vatCategory} onValueChange={(value) => setVatCategory(value as UkVatCategory)}>
            <SelectTrigger id="vatCategory">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard-20">Standard Rate (20%)</SelectItem>
              <SelectItem value="reduced-5">Reduced Rate (5%)</SelectItem>
              <SelectItem value="zero-0">Zero Rate (0%)</SelectItem>
              <SelectItem value="exempt">Exempt</SelectItem>
              <SelectItem value="other-standard">Other (Standard Rate Applied)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Reduced and zero VAT rates apply only to specific goods and services under UK VAT law. Users must verify eligibility before applying reduced or zero rates.
          </p>
        </div>

        {inlineWarning && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="ml-2 text-amber-900 dark:text-amber-100">
              {inlineWarning}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="serviceDescription">Service/Product Description (Optional)</Label>
          <Input
            id="serviceDescription"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            placeholder="e.g., Consulting, Software, Hardware"
          />
          <p className="text-xs text-muted-foreground">
            Helps identify potential VAT category mismatches
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="netAmount">Net Amount (£)</Label>
          <Input
            id="netAmount"
            type="number"
            step="0.01"
            min="0"
            value={netAmount}
            onChange={(e) => setNetAmount(e.target.value)}
            placeholder="1000.00"
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Calculate VAT
        </Button>
      </div>

      <AlertDialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              VAT Category Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningModal(false)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
