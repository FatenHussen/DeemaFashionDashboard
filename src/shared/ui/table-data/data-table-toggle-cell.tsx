import type { Row, ColumnDef, HeaderContext } from '@tanstack/react-table';
import type { AdminToggleEntityType } from '@/api/admin-toggle-status.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { readRecordActiveFlag } from '@/utils/parse-record-is-active';
import { useAdminToggleStatus } from '@/hooks/use-admin-toggle-status';

import { DataTableColumnHeader } from './data-table-column-header';

function ToggleVisibilityColumnHeader<TData>({
  column,
}: HeaderContext<TData, unknown>) {
  const { t } = useTranslation('table');
  return (
    <DataTableColumnHeader
      column={column}
      title={t('columns.visibility')}
      className="text-center"
    />
  );
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
    <div className="flex w-full items-center justify-start">
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
          'relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-border/40 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive ? 'bg-primary' : 'bg-muted-foreground/35',
          isPending ? 'cursor-wait opacity-50' : '',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-all duration-200',
            isActive ? 'end-0.5' : 'start-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function resolveIsActive(
  original: unknown,
  getIsActive?: (row: any) => boolean | undefined
): boolean {
  if (getIsActive) return getIsActive(original) ?? false;
  if (!original || typeof original !== 'object') return false;
  const record = original as Record<string, unknown>;
  const parsed = readRecordActiveFlag(record);
  if (parsed !== undefined) return parsed;
  const legacy = record.is_active;
  if (typeof legacy === 'boolean') return legacy;
  if (legacy === 1 || legacy === '1') return true;
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
    meta: {
      headerClassName: 'text-center',
      cellClassName: 'text-center',
    },
    cell: ({ row }: { row: Row<TData> }) => {
      const original = row.original as any;
      const id = original?.id as number;
      const isActive = resolveIsActive(original, getIsActive);

      if (id == null) return null;

      return <ToggleCell  id={id} isActive={isActive} entityType={entityType} />;
    },
    enableSorting: false,
  };
}
