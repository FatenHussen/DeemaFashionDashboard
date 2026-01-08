import type { RecycleBinType } from '@/types/recycleBin/recycleBin';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

interface DataTableRecycleFilterButtonProps {
  onFilterChange?: (type: RecycleBinType) => void;
  currentFilter?: RecycleBinType;
}

const DataTableRecycleFilterButton = ({
  onFilterChange,
  currentFilter = 'Sales',
}: DataTableRecycleFilterButtonProps) => {
  const { t } = useTranslation('table');
  const [selectedType, setSelectedType] = useState<RecycleBinType>(currentFilter);
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = (type: RecycleBinType) => {
    setSelectedType(type);

    // Notify parent component if callback provided
    if (onFilterChange) {
      onFilterChange(type);
    }

    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedType('Sales');
    if (onFilterChange) {
      onFilterChange('Sales');
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outlined"
          size="small"
          className="h-8 lg:flex text-foreground border-border mr-[0.25rem]"
        >
          <Filter className="h-4 w-4" />
          <span>{t('filterByType')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleTypeChange('OrderRequest')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('orderRequest')}</span>
              {selectedType === 'OrderRequest' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('SalesOrder')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('salesOrder')}</span>
              {selectedType === 'SalesOrder' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('DeliveryNotes')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('deliveryNotes')}</span>
              {selectedType === 'DeliveryNotes' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('Quotations')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('quotations')}</span>
              {selectedType === 'Quotations' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('Sales')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('sales')}</span>
              {selectedType === 'Sales' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('SalesReturn')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('salesReturn')}</span>
              {selectedType === 'SalesReturn' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('Expenses')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('expenses')}</span>
              {selectedType === 'Expenses' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('PurchaseRequisition')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('purchaseRequisition')}</span>
              {selectedType === 'PurchaseRequisition' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('PurchaseOrder')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('purchaseOrder')}</span>
              {selectedType === 'PurchaseOrder' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('PurchasesReturn')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('purchasesReturn')}</span>
              {selectedType === 'PurchasesReturn' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('Purchases')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('purchases')}</span>
              {selectedType === 'Purchases' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleTypeChange('RecivingItems')}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t('recivingItems')}</span>
              {selectedType === 'RecivingItems' && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('JobCards')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('jobCards')}</span>
              {selectedType === 'JobCards' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('customer')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('customer')}</span>
              {selectedType === 'customer' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('vendor')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('vendor')}</span>
              {selectedType === 'vendor' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleTypeChange('employee')} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{t('employee')}</span>
              {selectedType === 'employee' && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleReset}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('resetFilter')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableRecycleFilterButton;
