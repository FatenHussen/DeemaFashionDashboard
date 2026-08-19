import type { ZodSchema } from 'zod';
import type { ReactNode } from 'react';
import type { Row } from '@tanstack/react-table';
import type { AdminToggleEntityType } from '@/api/admin-toggle-status.types';

import { cn } from '@/utils/utils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/shared/ui/dialogTable';
import { useAdminToggleStatus } from '@/hooks/use-admin-toggle-status';
import {
  Eye,
  Trash,
  Truck,
  EyeOff,
  Pencil,
  XCircle,
  KeyRound,
  FolderTree,
  CheckCircle2,
  MoreHorizontal,
} from 'lucide-react';
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
  /** Overrides the default "View details" label (e.g. "Open / Build" on category pages). */
  viewDetailsLabel?: string;
  /** Navigate to subcategories list for this row's category id. */
  subcategoriesPath?: (id: number) => string;
  /** When set, "View subcategories" calls this instead of navigating to `subcategoriesPath`. */
  onSubcategoriesClick?: (row: Row<TData>) => void;
  editItem?: string | undefined;
  onEdit?: (row: Row<TData>) => void;
  onDelete?: (id: number) => void;
  onUpdatePassword?: (row: Row<TData>) => void;
  /** e.g. assign an order to this driver (drivers table). */
  onAssignOrderToDriver?: (row: Row<TData>) => void;
  permissions?: {
    update: boolean;
    delete: boolean;
  };
  isDeleting?: boolean;
  isDeleteDialogOpen?: boolean;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  deletingId?: number | null;
  /** Extra consequence shown in the delete dialog (e.g. "also deletes the category's page"). */
  deleteWarning?: string;
  /** When set and status is pending, show Approve / Reject in the menu (e.g. products). */
  approvalStatus?: string | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  approvingId?: number | string | null;
  rejectingId?: number | string | null;
  /** Unified `POST /admin/toggle-status` when the row exposes `is_active` (or `getIsActive`). */
  adminToggleEntityType?: AdminToggleEntityType;
  getIsActive?: (row: TData) => boolean | undefined;
  /** Dedicated enable/disable (e.g. `POST .../disable` and `.../enable`) instead of unified toggle-status. */
  enableDisableHandlers?: {
    onDisable: (id: number) => void | Promise<void>;
    onEnable: (id: number) => void | Promise<void>;
    pendingId?: number | string | null;
    disableLabel: string;
    enableLabel: string;
  };
  /** Extra menu entries appended after the standard items (e.g. "Build page"). */
  extraActions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: (row: Row<TData>) => void;
  }>;
}

function resolveRowIsActive<TData>(
  original: unknown,
  getIsActive?: (row: TData) => boolean | undefined
): boolean | undefined {
  if (getIsActive) return getIsActive(original as TData);
  if (!original || typeof original !== 'object') return undefined;
  const v = (original as Record<string, unknown>).is_active;
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1') return true;
  if (v === 0 || v === '0') return false;
  return Boolean(v);
}

export function DataTableRowActions<TData>({
  row,
  viewDetails,
  viewDetailsLabel,
  subcategoriesPath,
  onSubcategoriesClick,
  editItem,
  onEdit,
  onDelete,
  onUpdatePassword,
  onAssignOrderToDriver,
  permissions,
  isDeleting = false,
  isDeleteDialogOpen = false,
  onDeleteConfirm,
  onDeleteCancel,
  deletingId,
  deleteWarning,
  approvalStatus,
  onApprove,
  onReject,
  approvingId,
  rejectingId,
  adminToggleEntityType,
  getIsActive,
  enableDisableHandlers,
  extraActions,
}: DataTableRowActionsProps<TData>) {
  const navigate = useNavigate();
  const toggleStatusMutation = useAdminToggleStatus();

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

  const rowId = row?.original?.id as number | undefined;
  const isPendingApproval =
    String(approvalStatus ?? '').toLowerCase() === 'pending' &&
    onApprove &&
    onReject &&
    rowId != null;
  const isApprovingRow =
    approvingId != null && rowId != null && String(approvingId) === String(rowId);
  const isRejectingRow =
    rejectingId != null && rowId != null && String(rejectingId) === String(rowId);

  const rowActive = resolveRowIsActive<TData>(row?.original, getIsActive);
  const showDedicatedEnableDisable = Boolean(
    permissions?.update &&
      enableDisableHandlers &&
      rowId != null &&
      rowActive !== undefined
  );
  const showAdminToggle =
    Boolean(
      !showDedicatedEnableDisable &&
        permissions?.update &&
        adminToggleEntityType &&
        rowId != null &&
        rowActive !== undefined
    );
  const isDedicatedTogglingRow =
    enableDisableHandlers?.pendingId != null &&
    rowId != null &&
    String(enableDisableHandlers.pendingId) === String(rowId);
  const isTogglingRow =
    toggleStatusMutation.isPending &&
    toggleStatusMutation.variables?.id != null &&
    rowId != null &&
    String(toggleStatusMutation.variables.id) === String(rowId) &&
    toggleStatusMutation.variables.type === adminToggleEntityType;

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
              variant="outlined"
              color="inherit"
              size="medium"
              className="!h-10 !min-w-10 !w-10 !shrink-0 !p-0 rounded-lg border-border/90 bg-transparent text-foreground hover:bg-muted/40 data-[state=open]:bg-muted/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-5 w-5 text-foreground" strokeWidth={2.25} />
              <span className="sr-only">{t('actions')}</span>
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
                {viewDetailsLabel ?? t('viewDetails')}
              </DropdownMenuItem>
            )}

            {(onSubcategoriesClick || subcategoriesPath) && rowId != null && (
              <DropdownMenuItem
                className="hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSubcategoriesClick) {
                    onSubcategoriesClick(row);
                  } else if (subcategoriesPath) {
                    navigate(subcategoriesPath(rowId));
                  }
                }}
              >
                <FolderTree className="mr-2 h-4 w-4" />
                {t('viewSubcategories')}
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

            {permissions?.update && onUpdatePassword && (
              <DropdownMenuItem
                className="hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePassword(row);
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {t('updatePassword')}
              </DropdownMenuItem>
            )}

            {onAssignOrderToDriver && (
              <DropdownMenuItem
                className="hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignOrderToDriver(row);
                }}
              >
                <Truck className="mr-2 h-4 w-4" />
                {t('assignOrderToDriver')}
              </DropdownMenuItem>
            )}

            {extraActions?.map((action) => (
              <DropdownMenuItem
                key={action.key}
                className="hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}

            {showDedicatedEnableDisable && enableDisableHandlers && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-muted"
                  disabled={isDedicatedTogglingRow}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (rowId == null || rowActive === undefined) return;
                    try {
                      if (rowActive) {
                        await enableDisableHandlers.onDisable(rowId);
                      } else {
                        await enableDisableHandlers.onEnable(rowId);
                      }
                      toast.success(t('userBasketScheduleStatusUpdated'));
                    } catch {
                      /* error toast from axios interceptor */
                    }
                  }}
                >
                  {rowActive ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      {enableDisableHandlers.disableLabel}
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      {enableDisableHandlers.enableLabel}
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}

            {showAdminToggle && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-muted"
                  disabled={isTogglingRow}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (rowId == null || adminToggleEntityType == null || rowActive === undefined) return;
                    try {
                      await toggleStatusMutation.mutateAsync({
                        type: adminToggleEntityType,
                        id: rowId,
                        is_active: !rowActive,
                      });
                      toast.success(t('toggleVisibilitySuccess'));
                    } catch {
                      /* error toast from axios interceptor */
                    }
                  }}
                >
                  {rowActive ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      {t('toggleHide')}
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('toggleShow')}
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}

            {permissions?.update && isPendingApproval && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-muted"
                  disabled={isApprovingRow || isRejectingRow}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(rowId);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  <span className="text-green-700">{t('approve')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-muted"
                  disabled={isApprovingRow || isRejectingRow}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(rowId);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">{t('reject')}</span>
                </DropdownMenuItem>
              </>
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
            {deleteWarning && (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                {deleteWarning}
              </p>
            )}
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
