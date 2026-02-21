import type { ZodSchema } from 'zod';
import type { Row } from '@tanstack/react-table';

import { cn } from '@/utils/utils';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/shared/ui/dialogTable';
import { Eye, Trash, Pencil, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';

interface DataTableRowActionsProps<TData> {
  row: Row<TData> | any;
  schema: ZodSchema;
  viewDetails?: string | undefined | null;
  editItem?: string | undefined;
  onEdit?: (row: Row<TData>) => void;
  onDelete?: (id: number) => void;
  permissions?: {
    update: boolean;
    delete: boolean;
  };
  isDeleting?: boolean;
  isDeleteDialogOpen?: boolean;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  deletingId?: number | null;
}

export function DataTableRowActions<TData>({
  row,
  viewDetails,
  editItem,
  onEdit,
  onDelete,
  permissions,
  isDeleting = false,
  isDeleteDialogOpen = false,
  onDeleteConfirm,
  onDeleteCancel,
  deletingId,
}: DataTableRowActionsProps<TData>) {
  const navigate = useNavigate();

  const { t } = useTranslation('table');

  const showDialog = isDeleteDialogOpen && deletingId === row?.original?.id;

  // useEffect(() => {
  //   if (externalDeleteControl) {
  //     if (isDeleteDialogOpen && deleteItemRef.current === row?.original?.id) {
  //       setInternalDeleteDialogOpen(true);
  //     } else if (!isDeleteDialogOpen) {
  //       setInternalDeleteDialogOpen(false);
  //     }
  //   }
  // }, [isDeleteDialogOpen, externalDeleteControl, row?.original?.id]);

  const handleOpenDeleteDialog = () => {
    if (onDelete) {
      onDelete(row?.original?.id);
    }
  };

  // const handleDelete = () => {
  //   if (onDelete && deleteItemRef.current !== null) {
  //     onDelete(deleteItemRef.current);
  //     setDeleteConfirmOpen(false);
  //   }
  // };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div
        className={cn(
          'flex items-center justify-end ',
          viewDetails && 'cursor-pointer hover:bg-muted '
        )}
        // onClick={(e) => {
        //   if (viewDetails) {
        //     e.stopPropagation();
        //     navigate(viewDetails);
        //   }
        // }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
            className="w-[200px] bg-popover shadow-md border border-border z-[9999] text-popover-foreground"
          >
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>

            {/* <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.id);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />

            {viewDetails && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(viewDetails);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('viewDetails')}
              </DropdownMenuItem>
            )}

            {permissions?.update && (editItem || onEdit) && (
              <DropdownMenuItem
                className="hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit(row);
                  } else if (editItem) {
                    navigate(editItem);
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('editDetails')}
              </DropdownMenuItem>
            )}

            {permissions?.delete && (
              <DropdownMenuItem
                className="hover:bg-muted"
                // onClick={(e) => {
                //   e.stopPropagation();
                //   deleteItemRef.current = row?.original?.id;
                //   setDeleteConfirmOpen(true);
                // }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteDialog();
                }}
              >
                <Trash className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-500">{t('delete')}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showDialog && (
        <Dialog
          open={showDialog}
          // onOpenChange={(open) => open && setDeleteConfirmOpen(false)}
          onOpenChange={(open) => !open && onDeleteCancel && onDeleteCancel()}
        >
          <DialogContent className="bg-background text-foreground p-6 rounded-lg shadow-lg z-[9999]">
            <h2 className="text-lg font-bold">{t('confirmDelete')}</h2>
            <p>{t('areYouSure')}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outlined"
                //onClick={() => setDeleteConfirmOpen(false)}
                onClick={onDeleteCancel}
                disabled={isDeleting}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="contained"
                color="error"
                //onClick={handleDelete}
                onClick={onDeleteConfirm}
                disabled={isDeleting}
              >
                {/* {t("delete")} */}
                {isDeleting ? (
                  <>
                    <span className="mr-2">
                      <svg
                        className="animate-spin h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                    {t('deleting')}
                  </>
                ) : (
                  t('delete')
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
