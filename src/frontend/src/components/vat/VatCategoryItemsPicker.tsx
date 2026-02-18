import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { type VatCategory, VAT_CATEGORY_LABELS } from '../../lib/vat/vatCategoryRateRules';

interface VatCategoryItemsPickerProps {
  categories: VatCategory[];
  selectedValue: VatCategory;
  onSelect: (category: VatCategory) => void;
}

export default function VatCategoryItemsPicker({
  categories,
  selectedValue,
  onSelect,
}: VatCategoryItemsPickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">VAT Category</Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {categories.map((category) => {
          const selected = category === selectedValue;
          return (
            <Button
              key={category}
              type="button"
              variant={selected ? 'default' : 'outline'}
              className={`h-auto py-3 px-4 text-left justify-start relative ${
                selected ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => onSelect(category)}
            >
              <span className="flex-1 text-sm font-medium">
                {VAT_CATEGORY_LABELS[category]}
              </span>
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
