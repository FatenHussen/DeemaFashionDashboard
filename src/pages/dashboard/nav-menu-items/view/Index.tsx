import type { SortableEntity } from '@/shared/ui/table-data/sort-items-dialog';
import type { NavMenuItem, NavMenuItemType } from '../types';

import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { navMenuItemColumns } from '@/columns/one/nav-menu-items/one';
import { SortItemsDialog } from '@/shared/ui/table-data/sort-items-dialog';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { NAV_MENU_ITEM_TYPES } from '../types';
import { navMenuTypeLabel, navMenuItemTitle, navMenuTargetLabel } from '../utils/nav-menu-labels';
import {
  NAV_MENU_ITEM_CREATE_ANY,
  NAV_MENU_ITEM_DELETE_ANY,
  NAV_MENU_ITEM_UPDATE_ANY,
} from '../permissions';
import {
  useFetchNavMenuItems,
  useDeleteNavMenuItem,
  useReorderNavMenuItems,
  useToggleNavMenuItemActive,
} from '../hooks';

// ----------------------------------------------------------------------

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const filterSelectClass =
  'w-full h-10 rounded-lg border border-border/60 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors';

/** `order` asc, ids as tie-breaker — same order the storefront renders. */
function byOrder(a: NavMenuItem, b: NavMenuItem) {
  return (Number(a.order) || 0) - (Number(b.order) || 0) || a.id - b.id;
}

export default function Page() {
  const { t } = useTranslation('table');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | NavMenuItemType>('');
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('');

  // The bar is a short, fully ordered list — fetch it whole and filter in place.
  const { data: response, isLoading, isError, error } = useFetchNavMenuItems();

  const deleteMutation = useDeleteNavMenuItem();
  const reorderMutation = useReorderNavMenuItems();
  const toggleMutation = useToggleNavMenuItemActive();

  const allItems = useMemo(
    () => [...(response?.data?.items ?? [])].sort(byOrder),
    [response?.data?.items]
  );

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (isActiveFilter === '1' && !item.is_active) return false;
      if (isActiveFilter === '0' && item.is_active) return false;
      if (!term) return true;
      const haystack = [navMenuItemTitle(item), navMenuTargetLabel(item, t), item.type]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [allItems, search, typeFilter, isActiveFilter, t]);

  const sortItems: SortableEntity[] = useMemo(
    () =>
      allItems.map((item) => ({
        id: item.id,
        label: navMenuItemTitle(item) || `#${item.id}`,
        image: item.icon ?? null,
      })),
    [allItems]
  );

  const { canAny } = usePermissions();
  const canCreate = canAny([...NAV_MENU_ITEM_CREATE_ANY]);
  const canUpdate = canAny([...NAV_MENU_ITEM_UPDATE_ANY]);
  const canDelete = canAny([...NAV_MENU_ITEM_DELETE_ANY]);

  const handleSortSave = async (orderedIds: number[]) => {
    try {
      await reorderMutation.mutateAsync(orderedIds);
      toast.success(t('orderUpdatedSuccess'));
      setIsSortOpen(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, t('orderUpdatedError')));
    }
  };

  const onToggleActive = async (id: number, nextValue: boolean) => {
    setTogglingId(id);
    try {
      await toggleMutation.mutateAsync({ id, isActive: nextValue });
      toast.success(nextValue ? t('form.navMenuShownSuccess') : t('form.navMenuHiddenSuccess'));
    } catch {
      /* axios interceptor already surfaced the failure */
    } finally {
      setTogglingId(null);
    }
  };

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteCancel = () => setDeletingId(null);
  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('deleteSuccess'));
      setDeletingId(null);
    } catch {
      /* keep the dialog open so the user can retry */
    }
  };

  const activeFilterCount = (typeFilter ? 1 : 0) + (isActiveFilter ? 1 : 0);

  const onFilterReset = () => {
    setTypeFilter('');
    setIsActiveFilter('');
  };

  return (
    <>
      <title>{t('form.navMenuIndexDocumentTitle', { appName: CONFIG.appName })}</title>

      {isError ? (
        <div className="mx-3 mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-4 md:mx-6">
          {getApiErrorMessage(error, t('form.navMenuLoadErrorFallback'))}
        </div>
      ) : null}

      <DataTable
        tableTop={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('form.navMenuIndexHint')}
            </p>
            {canUpdate ? (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setIsSortOpen(true)}
                disabled={allItems.length < 2}
                className="shrink-0"
              >
                <Iconify icon="lucide:arrow-up-down" width={16} className="me-1.5" />
                {t('reorder')}
              </Button>
            ) : null}
          </div>
        }
        tableName={t('tableNames.navMenuItem')}
        columns={navMenuItemColumns({
          permissions: {
            update: canUpdate,
            delete: canDelete,
          },
          t,
          onDelete,
          isDeleting: deleteMutation.isPending,
          isDeleteDialogOpen: deletingId !== null,
          onDeleteConfirm,
          onDeleteCancel,
          deletingId,
          onToggleActive,
          togglingId,
        })}
        data={items}
        createPath={paths.dashboard.navMenuItems.create}
        hasDetails
        detailsLink="/sections/nav-menu-items/update"
        permissions={{
          create: canCreate,
          update: canUpdate,
          delete: canDelete,
        }}
        isLoading={isLoading}
        onSearchChange={setSearch}
        searchPlaceholder={t('search')}
        filterSidebar={
          <div className="flex flex-col gap-5">
            <FilterGroup label={t('columns.type')}>
              <select
                className={filterSelectClass}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as '' | NavMenuItemType)}
              >
                <option value="">{t('all')}</option>
                {NAV_MENU_ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {navMenuTypeLabel(type, t)}
                  </option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label={t('statusLabel')}>
              <select
                className={filterSelectClass}
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value as '' | '1' | '0')}
              >
                <option value="">{t('all')}</option>
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </FilterGroup>
          </div>
        }
        activeFilterCount={activeFilterCount}
        onFilterReset={onFilterReset}
        columnTranslations={{
          order: t('columns.order'),
          icon: t('columns.image'),
          title: t('columns.title'),
          type: t('columns.type'),
          destination: t('form.navMenuColDestination'),
          status: t('columns.status'),
          actions: t('columns.action'),
        }}
      />

      <SortItemsDialog
        open={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        items={sortItems}
        title={t('form.navMenuReorderTitle')}
        description={t('form.navMenuReorderDescription')}
        onSave={handleSortSave}
        isSubmitting={reorderMutation.isPending}
        isLoading={isLoading}
      />
    </>
  );
}
