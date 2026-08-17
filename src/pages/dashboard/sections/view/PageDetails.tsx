import type { TFunction } from 'i18next';
import type { DragEndEvent } from '@dnd-kit/core';
import type { FilterConfig } from '../types/page-section.types';
import type {
  PagePreviewPage,
  PagePreviewSection,
  PagePreviewQueryParams,
} from '../types/page-preview.types';

import { toast } from 'react-toastify';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { Dialog, DialogContent } from '@/shared/ui/dialogTable';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import { useSensor, DndContext, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { PagePreviewFilters } from '@/pages/dashboard/sections/components/page-preview-filters';
import { arrayMove , useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  filtersToSearchParams,
  parsePagePreviewParams,
  buildPagePreviewFilters,
} from '@/pages/dashboard/sections/utils/page-preview-params';
import {
  useFetchPages,
  useFetchPagePreview,
  useDeletePageSection,
  useReorderPageSections,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

function resolveItemImageUrl(src: unknown): string | null {
  if (src == null || typeof src !== 'string') return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  const path = s.replace(/^\//, '');
  return base ? `${base}/${path}` : s;
}

function getItemTitle(item: Record<string, unknown>): string {
  const nested =
    item.item && typeof item.item === 'object' && !Array.isArray(item.item)
      ? (item.item as Record<string, unknown>)
      : null;
  const title = item.title ?? item.name ?? nested?.title ?? nested?.name;
  return title != null && String(title).trim() !== '' ? String(title) : '—';
}

function getItemImage(item: Record<string, unknown>): string | null {
  const nested =
    item.item && typeof item.item === 'object' && !Array.isArray(item.item)
      ? (item.item as Record<string, unknown>)
      : null;
  return resolveItemImageUrl(item.image ?? nested?.image);
}

function variantLabel(t: TFunction<'table'>, variant?: string) {
  if (!variant) return '—';
  const key = `form.pageSectionVariant_${variant}` as const;
  const translated = t(key);
  return translated !== key ? translated : variant;
}

function sectionTypeStyles(type: PagePreviewSection['type']) {
  return type === 'api'
    ? 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300'
    : 'bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300';
}

function MetaChip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Iconify icon={icon} width={14} />
      {children}
    </span>
  );
}

function ItemThumb({ item }: { item: Record<string, unknown> }) {
  const imageSrc = getItemImage(item);
  const title = getItemTitle(item);

  return (
    <div className="flex w-28 shrink-0 flex-col gap-1.5 rounded-xl border border-border/50 bg-background p-2 shadow-sm">
      <div className="flex h-16 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
        ) : (
          <Iconify icon="solar:gallery-minimalistic-bold" className="text-muted-foreground/40" width={22} />
        )}
      </div>
      <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-foreground">
        {title}
      </span>
    </div>
  );
}

function PreviewItemCard({
  item,
  index,
  t,
}: {
  item: Record<string, unknown>;
  index: number;
  t: TFunction<'table'>;
}) {
  const imageSrc = getItemImage(item);
  const title = getItemTitle(item);
  const price =
    item.price_formatted != null
      ? String(item.price_formatted)
      : item.price != null
        ? String(item.price)
        : null;

  return (
    <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/30">
          {imageSrc ? (
            <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
          ) : (
            <Iconify icon="solar:box-minimalistic-bold" className="text-muted-foreground/50" width={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            {t('form.pagePreviewItemIndex', { index: index + 1 })}
            {item.id != null ? ` · #${String(item.id)}` : ''}
          </p>
          {price && (
            <p className="mt-1 text-sm font-medium text-primary">{price}</p>
          )}
        </div>
      </div>
      {typeof item.link === 'string' && item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Iconify icon="solar:link-bold" width={14} />
          <span className="truncate">{item.link}</span>
        </a>
      )}
    </div>
  );
}

function SortablePreviewSection({
  section,
  index,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  section: PagePreviewSection;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  t: TFunction<'table'>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const previewItems = section.items.slice(0, 4);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all ${
        isDragging
          ? 'z-10 scale-[1.01] border-primary/40 shadow-lg ring-2 ring-primary/20'
          : 'border-border/50 hover:border-border hover:shadow-md'
      }`}
    >
      <div
        className="relative px-4 py-4 sm:px-5"
        style={{ backgroundColor: section.background_color ?? undefined }}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-xl border border-border/60 bg-background/90 text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-primary active:cursor-grabbing"
            aria-label={t('form.pagePreviewDragHandle')}
          >
            <Iconify icon="lucide:grip-vertical" width={18} />
          </button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            {index + 1}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="min-w-0 flex-1 text-start"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h6" className="font-bold text-foreground">
                {section.name}
              </Typography>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${sectionTypeStyles(section.type)}`}
              >
                {sectionTypeLabel(t, section.type)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <MetaChip icon="solar:sort-bold">
                {t('form.pageSectionFormOrderLabel')}: {section.order}
              </MetaChip>
              <MetaChip icon="solar:align-vertical-spacing-bold">
                {section.position}
              </MetaChip>
              <MetaChip icon="solar:box-minimalistic-bold">
                {variantLabel(t, section.variant)}
              </MetaChip>
              <MetaChip icon="solar:widget-bold">
                {section.items.length} {t('columns.items')}
              </MetaChip>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                aria-label={t('edit')}
              >
                <Iconify icon="solar:pen-bold" width={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                aria-label={t('delete')}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onToggle}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Iconify
                icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                width={18}
              />
            </button>
          </div>
        </div>

        {!expanded && previewItems.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 ps-14">
            {previewItems.map((item, itemIndex) => (
              <ItemThumb key={`${section.id}-thumb-${itemIndex}`} item={item} />
            ))}
            {section.items.length > 4 && (
              <div className="flex w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/60 text-xs text-muted-foreground">
                +{section.items.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-border/40 bg-background/95 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {section.display_type_id != null && (
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.pageSectionFormDisplayTypeLabel')}
                </p>
                <p className="mt-1 font-semibold text-foreground">{section.display_type_id}</p>
              </div>
            )}
            {section.action?.page_slug && (
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.pagePreviewActionPage')}
                </p>
                <p className="mt-1 font-semibold text-foreground">{section.action.page_slug}</p>
              </div>
            )}
            {section.see_more?.page_slug && (
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.pagePreviewSeeMorePage')}
                </p>
                <p className="mt-1 font-semibold text-foreground">{section.see_more.page_slug}</p>
              </div>
            )}
            {section.background_card_color && (
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('form.pageSectionFormBackgroundCardColorOptional')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-md border border-border/60"
                    style={{ backgroundColor: section.background_card_color }}
                  />
                  <code className="text-xs text-muted-foreground">{section.background_card_color}</code>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Iconify icon="solar:checklist-bold" className="text-amber-500" width={18} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.sectionItemsHeading')}
              </Typography>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {section.items.length}
              </span>
            </div>

            {section.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item, itemIndex) => (
                  <PreviewItemCard
                    key={`${section.id}-item-${String(item.id ?? itemIndex)}`}
                    item={item}
                    index={itemIndex}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 py-10 text-center">
                <Iconify
                  icon="solar:box-minimalistic-bold"
                  className="mx-auto mb-2 text-muted-foreground/40"
                  width={32}
                />
                <Typography variant="body2" className="text-muted-foreground">
                  {t('common.noItems')}
                </Typography>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageDetails() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const numericId = id && /^\d+$/.test(String(id).trim()) ? String(id).trim() : '';

  const [activeFilters, setActiveFilters] = useState<PagePreviewQueryParams>(() =>
    parsePagePreviewParams(searchParams)
  );
  const prevPageIdRef = useRef(numericId);

  const { data: pagesData } = useFetchPages();
  const { data: previewResponse, isLoading, isFetching, error } = useFetchPagePreview(
    numericId,
    activeFilters
  );
  const reorderMutation = useReorderPageSections();
  const deleteSectionMutation = useDeletePageSection();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [orderedSections, setOrderedSections] = useState<PagePreviewSection[]>([]);
  const [baselineIds, setBaselineIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const syncFromPreview = useCallback((sections: PagePreviewSection[]) => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    setOrderedSections(sorted);
    setBaselineIds(sorted.map((s) => s.id));
    setExpandedIds(new Set(sorted.length > 0 ? [sorted[0].id] : []));
  }, []);

  useEffect(() => {
    if (previewResponse?.data?.sections) {
      syncFromPreview(previewResponse.data.sections);
    }
  }, [previewResponse, syncFromPreview]);

  const orderedIds = useMemo(() => orderedSections.map((s) => s.id), [orderedSections]);
  const isDirty = useMemo(() => {
    if (orderedIds.length !== baselineIds.length) return true;
    return orderedIds.some((sectionId, idx) => sectionId !== baselineIds[idx]);
  }, [orderedIds, baselineIds]);

  const totalItems = useMemo(
    () => orderedSections.reduce((sum, section) => sum + section.items.length, 0),
    [orderedSections]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedSections((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === Number(active.id));
      const newIdx = prev.findIndex((s) => s.id === Number(over.id));
      if (oldIdx < 0 || newIdx < 0) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const handleResetOrder = () => {
    if (!previewResponse?.data?.sections) return;
    syncFromPreview(previewResponse.data.sections);
  };

  const handleSaveOrder = async () => {
    if (!numericId || !isDirty || reorderMutation.isPending) return;

    const sections = orderedSections.map((row, index) => ({
      id: row.id,
      order: index + 1,
      position: row.position,
    }));

    try {
      await reorderMutation.mutateAsync({
        pageId: numericId,
        sections,
      });
      setBaselineIds(orderedIds);
      toast.success(t('form.pagePreviewOrderSaved'));
    } catch (err) {
      console.error('Failed to reorder page sections:', err);
      toast.error(t('form.pagePreviewOrderFailed'));
    }
  };

  const toggleExpanded = (sectionId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleAddSection = () => {
    navigate(`/sections/pages/${numericId}/sections/create`);
  };

  const handleEditSection = (sectionId: number) => {
    navigate(`/sections/page-sections/update/${sectionId}`);
  };

  const handleDeleteSectionConfirm = async () => {
    if (!deletingSectionId) return;
    try {
      await deleteSectionMutation.mutateAsync(deletingSectionId);
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'pagePreview'] });
      queryClient.invalidateQueries({ queryKey: ['pageBuilder'] });
      toast.success(t('deleteSuccess'));
      setDeletingSectionId(null);
    } catch (err) {
      console.error('Failed to delete page section:', err);
      toast.error(t('form.pageBuilderSectionDeleteFailed'));
    }
  };

  useEffect(() => {
    if (prevPageIdRef.current === numericId) return;
    prevPageIdRef.current = numericId;
    setActiveFilters({});
    setSearchParams({}, { replace: true });
  }, [numericId, setSearchParams]);

  useEffect(() => {
    setSearchParams(filtersToSearchParams(activeFilters), { replace: true });
  }, [activeFilters, setSearchParams]);

  const handleFilterChange = useCallback((key: string, value: string | number | undefined) => {
    setActiveFilters((prev) => buildPagePreviewFilters(prev, key, value));
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const pageFilterSchema = useMemo(() => {
    const fromPreview = previewResponse?.data?.page?.filters;
    if (fromPreview && typeof fromPreview === 'object' && !Array.isArray(fromPreview)) {
      return fromPreview as Record<string, FilterConfig>;
    }

    const pageFromList = (pagesData?.data ?? []).find((p) => String(p.id) === numericId);
    const fromList = pageFromList?.filters;
    if (fromList && typeof fromList === 'object' && !Array.isArray(fromList)) {
      return fromList as Record<string, FilterConfig>;
    }

    return null;
  }, [previewResponse?.data?.page?.filters, pagesData, numericId]);

  if (!numericId) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.pagePreviewInvalidId')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/sections/pages')}>
            {t('form.backToPages')}
          </Button>
        </Box>
      </Box>
    );
  }

  if (isLoading && !previewResponse) {
    return <LoadingScreen />;
  }

  if (error || !previewResponse?.data) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-lg">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:danger-bold" className="h-5 w-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.pagePreviewErrorLoadingTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : t('form.pagePreviewErrorLoadingFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/sections/pages')}>
            {t('form.backToPages')}
          </Button>
        </Box>
      </Box>
    );
  }

  const page: PagePreviewPage = previewResponse.data.page;

  return (
    <>
      <title>{t('form.pagePreviewDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="relative min-h-screen overflow-hidden bg-background pb-24">
        <Box className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/[0.07] via-background to-background" />

        <Box className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Button
            variant="text"
            onClick={() => navigate('/sections/pages')}
            className="-ml-2 mb-5 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToPages')}
          </Button>

          {/* Hero */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-violet-500/10 via-background to-blue-500/5 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 shadow-sm">
                <Iconify icon="solar:smartphone-2-bold" className="text-violet-600" width={34} />
              </div>
              <div className="min-w-0 flex-1">
                <Typography variant="h4" className="mb-2 font-bold text-foreground">
                  {cmsPageSelectLabel(page)}
                </Typography>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 font-mono text-xs text-muted-foreground">
                    /{page.slug}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    ID {page.id}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{orderedSections.length}</p>
                  <p className="text-xs text-muted-foreground">{t('form.pagePreviewSectionsHeading')}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">{t('columns.items')}</p>
                </div>
              </div>
            </div>
            {can('pagesection.create') && (
              <div className="mt-5 flex justify-end">
                <Button variant="contained" onClick={handleAddSection} className="gap-2">
                  <Iconify icon="solar:widget-add-bold" width={18} />
                  {t('form.pageBuilderAddSectionButton')}
                </Button>
              </div>
            )}
          </div>

          {pageFilterSchema && Object.keys(pageFilterSchema).length > 0 && (
            <PagePreviewFilters
              filters={pageFilterSchema}
              values={activeFilters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              isFetching={isFetching}
            />
          )}

          {/* Drag hint */}
          {orderedSections.length > 1 && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
              <Iconify icon="lucide:grip-vertical" className="mt-0.5 shrink-0 text-amber-600" width={18} />
              <div>
                <p className="text-sm font-medium text-foreground">{t('form.pagePreviewDragHint')}</p>
                <p className="text-xs text-muted-foreground">{t('form.pagePreviewDragHintSub')}</p>
              </div>
            </div>
          )}

          {orderedSections.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {orderedSections.map((section, index) => (
                    <SortablePreviewSection
                      key={section.id}
                      section={section}
                      index={index}
                      expanded={expandedIds.has(section.id)}
                      onToggle={() => toggleExpanded(section.id)}
                      onEdit={
                        can('pagesection.update') ? () => handleEditSection(section.id) : undefined
                      }
                      onDelete={
                        can('pagesection.delete')
                          ? () => setDeletingSectionId(section.id)
                          : undefined
                      }
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/60 py-16 text-center">
              <Iconify
                icon="solar:widget-add-bold"
                className="mx-auto mb-3 text-muted-foreground/40"
                width={40}
              />
              <Typography variant="body1" className="text-muted-foreground">
                {t('form.pagePreviewNoSections')}
              </Typography>
              {can('pagesection.create') && (
                <Button variant="contained" onClick={handleAddSection} className="mt-4 gap-2">
                  <Iconify icon="solar:widget-add-bold" width={18} />
                  {t('form.pageBuilderAddSectionButton')}
                </Button>
              )}
            </div>
          )}
        </Box>

        {/* Delete section confirmation */}
        {deletingSectionId !== null && (
          <Dialog
            open={deletingSectionId !== null}
            onOpenChange={(open) => !open && setDeletingSectionId(null)}
          >
            <DialogContent className="bg-background text-foreground p-6 rounded-lg shadow-lg z-[9999]">
              <h2 className="text-lg font-bold">{t('confirmDelete')}</h2>
              <p>{t('areYouSure')}</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outlined"
                  onClick={() => setDeletingSectionId(null)}
                  disabled={deleteSectionMutation.isPending}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSectionConfirm}
                  disabled={deleteSectionMutation.isPending}
                >
                  {deleteSectionMutation.isPending ? t('deleting') : t('delete')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Sticky save bar */}
        {isDirty && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Iconify icon="solar:info-circle-bold" width={18} className="text-amber-500" />
                {t('form.pagePreviewUnsavedChanges')}
              </div>
              <div className="flex gap-2">
                <Button variant="outlined" onClick={handleResetOrder} disabled={reorderMutation.isPending}>
                  {t('form.pagePreviewResetOrder')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveOrder}
                  disabled={reorderMutation.isPending}
                  className="gap-2"
                >
                  <Iconify icon="solar:diskette-bold" width={18} />
                  {reorderMutation.isPending ? t('form.pagePreviewSavingOrder') : t('form.pagePreviewSaveOrder')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </>
  );
}
