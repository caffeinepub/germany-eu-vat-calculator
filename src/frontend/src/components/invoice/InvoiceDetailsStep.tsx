import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { type VATCalculationResult, type VATCalculationInput } from '../../lib/vat/calculateVat';
import { type InvoiceLineItem } from '../../lib/invoice/invoiceLineItems';
import { type VatCategory, VAT_CATEGORIES, VAT_CATEGORY_LABELS, computeVatRateForCategory } from '../../lib/vat/vatCategoryRateRules';
import { isZeroVatResult } from '../../lib/vat/isZeroVatResult';
import { getSupportedCountryCodes, lookupVatConfig } from '../../lib/vat/vatTable';
import { getCountryName } from '../../lib/vat/vatTable';
import { validateInvoiceMandatoryFields } from '../../lib/invoice/validateInvoiceMandatoryFields';
import { performInvoiceRiskCheck } from '../../lib/invoice/riskCheck';
import { getAutoLegalVatText } from '../../lib/invoice/getAutoLegalVatText';
import InvoiceMandatoryFieldsChecklist from './InvoiceMandatoryFieldsChecklist';
import InvoiceRiskCheckPanel from './InvoiceRiskCheckPanel';

interface InvoiceDetailsStepProps {
  vatResult: VATCalculationResult;
  calculationInput: VATCalculationInput;
  onNext: (invoiceData: InvoiceData) => void;
  onBack: () => void;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  supplierLegalName: string;
  supplierAddress: string;
  supplierVatNumber: string;
  sellerName: string;
  sellerAddress: string;
  sellerVatId: string;
  sellerCountry: string;
  customerName: string;
  customerAddress: string;
  customerVatId: string;
  customerCountry?: string;
  lineItems: InvoiceLineItem[];
  legalVatText: string;
  legalVatTextOverride?: string;
  notes: string;
  currency?: string;
  serviceCategory?: string;
  itemDescription?: string;
  translateToEnglish?: boolean;
  taxPointDate?: string;
}

// Extended line item type to track selection state
interface LineItemWithSelectionState extends InvoiceLineItem {
  categorySelected?: boolean;
}

export default function InvoiceDetailsStep({
  vatResult,
  calculationInput,
  onNext,
  onBack,
}: InvoiceDetailsStepProps) {
  const today = new Date().toISOString().split('T')[0];
  const defaultInvoiceNumber = `INV-${Date.now()}`;

  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [supplierLegalName, setSupplierLegalName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierVatNumber, setSupplierVatNumber] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerVatId, setSellerVatId] = useState('');
  const [sellerCountry, setSellerCountry] = useState(calculationInput.sellerCountry);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerVatId, setCustomerVatId] = useState(calculationInput.vatId || '');
  const [legalVatText, setLegalVatText] = useState('');
  const [notes, setNotes] = useState('');

  // Track which VAT Category dropdown is open (null = none open, number = line item index)
  const [openVatCategoryDropdown, setOpenVatCategoryDropdown] = useState<number | null>(null);

  const [lineItems, setLineItems] = useState<LineItemWithSelectionState[]>([
    {
      description: 'Service',
      quantity: 1,
      unitPrice: calculationInput.netAmount,
      vatRate: vatResult.vatRatePercent,
      vatCategory: calculationInput.vatCategory || 'others',
      categorySelected: true, // First item is pre-filled
    },
  ]);

  // When seller country changes, update all line items' VAT rates
  useEffect(() => {
    const countryConfig = lookupVatConfig(sellerCountry);
    if (!countryConfig) return;

    setLineItems((prevItems) =>
      prevItems.map((item) => {
        // Preserve 0% for zero-VAT scenarios (e.g., reverse charge, export, exempt)
        if (isZeroVatResult(vatResult) && item.vatRate === 0) {
          return item;
        }
        // Recompute VAT rate for all other items based on new country
        const newRate = computeVatRateForCategory(
          sellerCountry,
          item.vatCategory,
          countryConfig.standard
        );
        return { ...item, vatRate: newRate };
      })
    );
  }, [sellerCountry, vatResult]);

  const handleAddLineItem = () => {
    const countryConfig = lookupVatConfig(sellerCountry);
    const defaultRate = countryConfig?.standard || 0;

    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: defaultRate,
        vatCategory: 'others',
        categorySelected: false, // New items require explicit selection
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updatedItems = [...lineItems];
    if (field === 'vatCategory') {
      const newCategory = value as VatCategory;
      updatedItems[index].vatCategory = newCategory;
      updatedItems[index].categorySelected = true;

      // Auto-update VAT rate based on category
      const countryConfig = lookupVatConfig(sellerCountry);
      if (countryConfig) {
        const newRate = computeVatRateForCategory(
          sellerCountry,
          newCategory,
          countryConfig.standard
        );
        updatedItems[index].vatRate = newRate;
      }
    } else {
      (updatedItems[index] as any)[field] = value;
    }
    setLineItems(updatedItems);
  };

  const handleNext = () => {
    // Remove the categorySelected flag before passing to next step
    const cleanedLineItems: InvoiceLineItem[] = lineItems.map(({ categorySelected, ...item }) => item);
    
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceDate,
      supplierLegalName,
      supplierAddress,
      supplierVatNumber,
      sellerName,
      sellerAddress,
      sellerVatId,
      sellerCountry,
      customerName,
      customerAddress,
      customerVatId,
      lineItems: cleanedLineItems,
      legalVatText,
      notes,
    };
    onNext(invoiceData);
  };

  const allCountries = getSupportedCountryCodes().map((code) => ({
    code,
    name: getCountryName(code) || code,
  }));

  // Create combined input for validation
  const validationInput: VATCalculationInput = {
    ...calculationInput,
    supplierLegalName,
    supplierAddress,
    supplierVatNumber,
    invoiceNumber,
    invoiceDate,
    sellerName,
    sellerAddress,
    sellerVatId,
    sellerCountry,
    customerName,
    customerAddress,
    legalVatTextOverride: legalVatText,
  };

  // Generate auto legal text for validation
  const autoLegalText = getAutoLegalVatText(vatResult.scenario, sellerCountry);

  // Remove the categorySelected flag for validation
  const cleanedLineItems: InvoiceLineItem[] = lineItems.map(({ categorySelected, ...item }) => item);

  const mandatoryFieldsValidation = validateInvoiceMandatoryFields(
    validationInput, 
    vatResult, 
    autoLegalText,
    cleanedLineItems
  );
  const riskCheck = performInvoiceRiskCheck(validationInput, vatResult);

  return (
    <div className="space-y-6" style={{ overflow: 'visible', position: 'relative' }}>
      {/* Backdrop overlay when any VAT Category dropdown is open */}
      {openVatCategoryDropdown !== null && (
        <div
          className="fixed inset-0 bg-black/20 z-[80]"
          onClick={() => setOpenVatCategoryDropdown(null)}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-number">
                Invoice Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">
                Invoice Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Supplier Information (New Required Fields) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supplier Information</h3>
            <div>
              <Label htmlFor="supplier-legal-name">
                Supplier Legal Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="supplier-legal-name"
                value={supplierLegalName}
                onChange={(e) => setSupplierLegalName(e.target.value)}
                placeholder="Your Legal Company Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="supplier-address">
                Supplier Address <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="supplier-address"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="Street, City, Postal Code, Country"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="supplier-vat-number">
                Supplier VAT Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="supplier-vat-number"
                value={supplierVatNumber}
                onChange={(e) => setSupplierVatNumber(e.target.value)}
                placeholder="DE123456789"
                className="font-mono"
                required
              />
            </div>
          </div>

          {/* Seller Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seller Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seller-name">Seller Name</Label>
                <Input
                  id="seller-name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
                <Label htmlFor="seller-country">Seller Country</Label>
                <Select value={sellerCountry} onValueChange={setSellerCountry}>
                  <SelectTrigger id="seller-country" className="select-trigger-safe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dropdown-safe">
                    {allCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="seller-address">Seller Address</Label>
              <Input
                id="seller-address"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="Street, City, Postal Code"
              />
            </div>
            <div>
              <Label htmlFor="seller-vat-id">Seller VAT ID</Label>
              <Input
                id="seller-vat-id"
                value={sellerVatId}
                onChange={(e) => setSellerVatId(e.target.value)}
                placeholder="DE123456789"
                className="font-mono"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Company Name"
              />
            </div>
            <div>
              <Label htmlFor="customer-address">Customer Address</Label>
              <Input
                id="customer-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Street, City, Postal Code"
              />
            </div>
            <div>
              <Label htmlFor="customer-vat-id">Customer VAT ID (optional)</Label>
              <Input
                id="customer-vat-id"
                value={customerVatId}
                onChange={(e) => setCustomerVatId(e.target.value)}
                placeholder="DE987654321"
                className="font-mono"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Line Items <span className="text-red-600">*</span>
              </h3>
              <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {lineItems.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    {lineItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLineItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(index, 'description', e.target.value)
                        }
                        placeholder="Service or product description"
                      />
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div>
                      <Label>Unit Price (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="md:col-span-2" style={{ overflow: 'visible', position: 'relative', zIndex: 90 }}>
                      <Label>VAT Category *</Label>
                      <Select
                        value={item.vatCategory}
                        onValueChange={(v) => {
                          handleLineItemChange(index, 'vatCategory', v);
                          setOpenVatCategoryDropdown(null);
                        }}
                        open={openVatCategoryDropdown === index}
                        onOpenChange={(open) => {
                          setOpenVatCategoryDropdown(open ? index : null);
                        }}
                      >
                        <SelectTrigger className="select-trigger-safe bg-background">
                          <SelectValue placeholder="Select VAT category" />
                        </SelectTrigger>
                        <SelectContent className="dropdown-safe z-[90]">
                          {VAT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {VAT_CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Only show VAT Rate field if VAT Category has been explicitly selected */}
                    {item.categorySelected && (
                      <div className="md:col-span-2">
                        <Label>VAT Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.vatRate}
                          onChange={(e) =>
                            handleLineItemChange(index, 'vatRate', parseFloat(e.target.value) || 0)
                          }
                          disabled={isZeroVatResult(vatResult) && item.vatRate === 0}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Legal VAT Text */}
          <div>
            <Label htmlFor="legal-vat-text">Legal VAT Text (optional)</Label>
            <Input
              id="legal-vat-text"
              value={legalVatText}
              onChange={(e) => setLegalVatText(e.target.value)}
              placeholder="e.g., Reverse charge applies - VAT to be accounted for by recipient"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or payment terms"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <InvoiceMandatoryFieldsChecklist validation={mandatoryFieldsValidation} />

      {/* Risk Check */}
      <InvoiceRiskCheckPanel riskCheck={riskCheck} />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Preview Invoice
        </Button>
      </div>
    </div>
  );
}
