import type { Row, ColumnDef, HeaderContext } from '@tanstack/react-table';
import type { AdminToggleEntityType } from '@/api/admin-toggle-status.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAdminToggleStatus } from '@/hooks/use-admin-toggle-status';

import { DataTableColumnHeader } from './data-table-column-header';

function ToggleVisibilityColumnHeader<TData>({
  column,
}: HeaderContext<TData, unknown>) {
  const { t } = useTranslation('table');
  return <DataTableColumnHeader column={column} title={t('columns.visibility')} />;
}

interface ToggleCellProps {
  id: number;
  isActive: boolean;
  entityType: AdminToggleEntityType;
}

function ToggleCell({ id, isActive, entityType }: ToggleCellProps) {
  const { t } = useTranslation('table');
  const toggleMutation = useAdminToggleStatus();

  const isPending =
    toggleMutation.isPending &&
    toggleMutation.variables?.id != null &&
    String(toggleMutation.variables.id) === String(id) &&
    toggleMutation.variables.type === entityType;

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync({
        type: entityType,
        id,
        is_active: !isActive,
      });
      toast.success(t('toggleVisibilitySuccess'));
    } catch {
      /* error toast handled by axios interceptor */
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive ? 'bg-primary' : 'bg-muted-foreground/30',
        isPending ? 'opacity-50 cursor-wait' : '',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm transition-transform',
          isActive ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

function resolveIsActive(
  original: unknown,
  getIsActive?: (row: any) => boolean | undefined
): boolean {
  if (getIsActive) return getIsActive(original) ?? false;
  if (!original || typeof original !== 'object') return false;
  const v = (original as Record<string, unknown>).is_active;
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1') return true;
  return false;
}

interface CreateToggleColumnOptions<TData> {
  entityType: AdminToggleEntityType;
  getIsActive?: (row: TData) => boolean | undefined;
}

export function createToggleColumn<TData>({
  entityType,
  getIsActive,
}: CreateToggleColumnOptions<TData>): ColumnDef<TData> {
  return {
    id: 'toggle_active',
    accessorKey: 'is_active',
    header: ToggleVisibilityColumnHeader,
    cell: ({ row }: { row: Row<TData> }) => {
      const original = row.original as any;
      const id = original?.id as number;
      const isActive = resolveIsActive(original, getIsActive);

      if (id == null) return null;

      return <ToggleCell id={id} isActive={isActive} entityType={entityType} />;
    },
    enableSorting: false,
  };
}
