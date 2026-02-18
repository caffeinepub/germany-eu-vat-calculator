import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { type ProductCategoryOption } from '../../lib/vat/productCategoryOptions';

interface ProductCategoryItemsPickerProps {
  options: ProductCategoryOption[];
  selectedValue: string;
  selectedExemptIdentifier?: string;
  onSelect: (option: ProductCategoryOption) => void;
}

export default function ProductCategoryItemsPicker({
  options,
  selectedValue,
  selectedExemptIdentifier,
  onSelect,
}: ProductCategoryItemsPickerProps) {
  // Determine if an option is selected
  const isSelected = (option: ProductCategoryOption): boolean => {
    // Match by label for display purposes
    if (option.exemptIdentifier) {
      return option.exemptIdentifier === selectedExemptIdentifier;
    }
    return option.value === selectedValue && !selectedExemptIdentifier;
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Product Category</Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option, index) => {
          const selected = isSelected(option);
          return (
            <Button
              key={`${option.value}-${option.label}-${index}`}
              type="button"
              variant={selected ? 'default' : 'outline'}
              className={`h-auto py-3 px-4 text-left justify-start relative ${
                selected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => onSelect(option)}
            >
              <span className="flex-1 text-sm font-medium">{option.label}</span>
              {selected && (
                <Check className="h-4 w-4 ml-2 flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
