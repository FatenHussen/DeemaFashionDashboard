import type { ZodSchema } from 'zod';
import type { Row } from '@tanstack/react-table';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { RotateCcw, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/ui/dialogTable';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

interface DataTableRecycleRowActionsProps<TData> {
  row: Row<TData> | any;
  schema?: ZodSchema;
  viewDetails?: string | undefined | null;
  editItem?: string | undefined;
  onViewDetails?: (id: number, transactionType?: string) => void;
  permissions?: {
    update: boolean;
    delete: boolean;
    restore?: boolean;
  };
  transactionType?: string;
}

export function DataTableRecycleRowActions<TData>({
  row,
  permissions,
  transactionType,
}: DataTableRecycleRowActionsProps<TData>) {
  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const actionItemRef = useRef<{ id: number | null; type?: string }>({ id: null });
  const { t } = useTranslation('table');

  const handleRestore = () => {
    // Restore functionality removed
    setRestoreConfirmOpen(false);
    actionItemRef.current = { id: null };
  };

  const isRestoring = false;

  // Get transaction type from props or row data
  const getTransactionType = () => transactionType || row.original?.transaction_type;

  return (
    <>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isRestoring}>
            <Button
              variant="text"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-transparent "
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            className="w-[200px] bg-popover shadow-md border border-border z-[9999] text-popover-foreground"
          >
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Restore Option - Always shown for recycle bin */}
            {permissions?.restore !== false && ( // Default to true if not specified
              <DropdownMenuItem
                className="hover:bg-muted text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  actionItemRef.current = {
                    id: row?.original?.id,
                    type: getTransactionType(),
                  };
                  setRestoreConfirmOpen(true);
                }}
                disabled={isRestoring}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>{t('restore')}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <DialogContent className="bg-background text-foreground p-6 rounded-lg shadow-lg z-[9999]">
          <h2 className="font-medium">{t('confirmRestore')}</h2>
          <p className="text-sm">{t('areYouSureRestore')}</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outlined"
              onClick={() => setRestoreConfirmOpen(false)}
              disabled={isRestoring}
              className="text-sm"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleRestore}
              className="text-sm"
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('restoring')}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('restore')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
