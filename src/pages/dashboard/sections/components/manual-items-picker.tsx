import type { DragEndEvent } from '@dnd-kit/core';
import type { ItemIdEntry } from '../types/section.types';

import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useInfiniteManualItems } from '@/pages/dashboard/sections/hooks/useManualItems';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensor, DndContext, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';

import { Box, Input, Button, Typography } from 'src/shared/ui';
import { SortableItem } from 'src/shared/ui/table-data/sortable-item';

// ----------------------------------------------------------------------

/** Backend `manual_model` key for GIF sections (compare case-insensitively). */
function isGifManualModel(manualModel: string | undefined | null): boolean {
  return (manualModel ?? '').trim().toLowerCase() === 'gif';
}

function defaultLinkForManualItem(manualModel: string, itemId: number): string {
  return isGifManualModel(manualModel) ? '' : `/item/${itemId}`;
}

/**
 * Search + infinite list + checkbox selection + drag ordering + per-item link
 * for a manual section's items. Selection state lives in the parent.
 */
export function ManualItemsPicker({
  manualModel,
  orderedItems,
  setOrderedItems,
}: {
  manualModel: string;
  orderedItems: ItemIdEntry[];
  setOrderedItems: React.Dispatch<React.SetStateAction<ItemIdEntry[]>>;
}) {
  const { t } = useTranslation('table');
  const [searchTerm, setSearchTerm] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Pointer only: KeyboardSensor steals keys for inputs inside sortables.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { infiniteQuery, allItems } = useInfiniteManualItems(manualModel || null, {
    limit: 10,
    search: searchTerm,
  });

  const selectedIds = useMemo(() => new Set(orderedItems.map((e) => e.item_id)), [orderedItems]);

  const itemLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of allItems as { id: number; name?: string; title?: string }[]) {
      map.set(row.id, row.name || row.title || '');
    }
    return map;
  }, [allItems]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          infiniteQuery.hasNextPage &&
          !infiniteQuery.isFetchingNextPage
        ) {
          infiniteQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [infiniteQuery]);

  const handleItemsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.item_id === active.id);
      const newIndex = prev.findIndex((x) => x.item_id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((entry, idx) => ({
        ...entry,
        order: idx + 1,
      }));
    });
  };

  const handleToggleItem = (itemId: number) => {
    setOrderedItems((prev) => {
      const exists = prev.some((p) => p.item_id === itemId);
      if (exists) {
        return prev.filter((p) => p.item_id !== itemId).map((e, idx) => ({ ...e, order: idx + 1 }));
      }
      return [
        ...prev,
        {
          item_id: itemId,
          link: defaultLinkForManualItem(manualModel, itemId),
          order: prev.length + 1,
        },
      ];
    });
  };

  const handleSelectAll = () => {
    if (!allItems.length) return;
    setOrderedItems(
      (allItems as { id: number }[]).map((item, index) => ({
        item_id: item.id,
        link: defaultLinkForManualItem(manualModel, item.id),
        order: index + 1,
      }))
    );
  };

  const handleItemLinkChange = (itemId: number, link: string) => {
    setOrderedItems((prev) => prev.map((e) => (e.item_id === itemId ? { ...e, link } : e)));
  };

  const handleClearAll = () => {
    setOrderedItems([]);
  };

  return (
    <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
      <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
        <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Iconify icon="solar:checklist-bold" className="text-amber-500" width={15} />
        </Box>
        <Typography variant="subtitle2" className="font-semibold text-foreground flex-1">
          {t('form.selectItemsHeading')}
          {orderedItems.length > 0 && (
            <Typography component="span" variant="body2" className="text-muted-foreground ml-2">
              {t('form.itemsSelectedCount', { count: orderedItems.length })}
            </Typography>
          )}
        </Typography>
        <Box className="flex gap-2 shrink-0">
          <Button
            type="button"
            onClick={handleSelectAll}
            variant="outlined"
            size="small"
            disabled={!allItems.length}
          >
            {t('form.selectAllItems')}
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            variant="outlined"
            size="small"
            disabled={orderedItems.length === 0}
          >
            {t('form.clearAllItems')}
          </Button>
        </Box>
      </Box>
      <Box className="p-6">
        {orderedItems.length > 0 && (
          <Box className="mb-4 p-4 border rounded-lg bg-muted/20 space-y-2">
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.sectionItemsOrderHeading')}
            </Typography>
            <Typography variant="body2" className="text-muted-foreground text-sm">
              {t('form.sectionItemsOrderHelper')}
            </Typography>
            <Typography variant="body2" className="text-muted-foreground text-sm">
              {t('form.sectionItemLinkHint')}
            </Typography>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemsDragEnd}
            >
              <SortableContext
                items={orderedItems.map((e) => e.item_id)}
                strategy={verticalListSortingStrategy}
              >
                <Box className="flex flex-col gap-2 mt-2">
                  {orderedItems.map((entry, index) => {
                    const label =
                      itemLabelById.get(entry.item_id)?.trim() ||
                      t('form.itemNumberFallback', { id: entry.item_id });
                    return (
                      <SortableItem key={entry.item_id} id={entry.item_id}>
                        <Box className="flex min-w-0 flex-1 flex-col gap-2">
                          <Box className="flex min-w-0 flex-1 items-center gap-3">
                            <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                              {index + 1}
                            </Box>
                            <Box className="min-w-0 flex-1">
                              <Typography variant="body2" className="font-medium truncate">
                                {label}
                              </Typography>
                              <Typography variant="caption" className="text-muted-foreground">
                                {t('form.itemIdBadgeShort', { id: entry.item_id })}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            className="relative z-10 w-full max-w-full"
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClickCapture={(e) => e.stopPropagation()}
                            onKeyDownCapture={(e) => e.stopPropagation()}
                          >
                            <Typography
                              variant="caption"
                              className="mb-1 block text-muted-foreground"
                            >
                              {t('form.sectionItemLinkLabel')}
                            </Typography>
                            <Input
                              type="text"
                              inputMode="url"
                              autoComplete="off"
                              floatingLabel={false}
                              fullWidth
                              value={entry.link ?? ''}
                              onChange={(e) => handleItemLinkChange(entry.item_id, e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder={t('form.sectionItemLinkPlaceholder')}
                              className="w-full"
                            />
                          </Box>
                        </Box>
                      </SortableItem>
                    );
                  })}
                </Box>
              </SortableContext>
            </DndContext>
          </Box>
        )}

        {/* Search Input */}
        <Box className="mb-4">
          <Input
            type="text"
            autoComplete="off"
            floatingLabel={false}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('form.searchItems')}
            className="w-full"
          />
        </Box>

        {/* Loading State */}
        {infiniteQuery.isLoading && (
          <Box className="text-center p-8 border border-dashed rounded-lg">
            <Iconify
              icon="solar:refresh-circle-bold"
              className="w-12 h-12 text-primary mx-auto mb-2 animate-spin"
            />
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.loadingItems')}
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {infiniteQuery.isError && (
          <Box className="text-center p-8 border border-destructive/50 rounded-lg bg-destructive/5">
            <Iconify icon="solar:danger-bold" className="w-12 h-12 text-destructive mx-auto mb-2" />
            <Typography variant="body2" className="text-destructive">
              {t('form.itemsLoadError')}
            </Typography>
          </Box>
        )}

        {/* Items List */}
        {!infiniteQuery.isLoading && !infiniteQuery.isError && (
          <Box className="border rounded-lg overflow-hidden">
            {allItems.length === 0 ? (
              <Box className="text-center p-8">
                <Iconify
                  icon="solar:inbox-line-bold"
                  className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.noItemsFoundShort')}
                </Typography>
              </Box>
            ) : (
              <Box className="divide-y divide-border">
                {allItems.map((item: any) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <Box
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <Box className="flex-1 min-w-0">
                        <Box className="flex items-center gap-2 mb-1">
                          <Typography variant="body1" className="font-semibold text-foreground">
                            {item.name ||
                              item.title ||
                              t('form.itemNumberFallback', { id: item.id })}
                          </Typography>
                          <Box className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                            {t('form.itemIdBadgeShort', { id: item.id })}
                          </Box>
                        </Box>
                        {item.desc && (
                          <Typography
                            variant="body2"
                            className="text-muted-foreground text-sm line-clamp-1"
                          >
                            {item.desc}
                          </Typography>
                        )}
                      </Box>
                      {isSelected && (
                        <Iconify
                          icon="solar:check-circle-bold"
                          className="text-primary shrink-0"
                          width={24}
                          height={24}
                        />
                      )}
                    </Box>
                  );
                })}
                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="py-2 text-center">
                  {infiniteQuery.isFetchingNextPage && (
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('form.loadingMoreItems')}
                    </Typography>
                  )}
                </div>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export { isGifManualModel };
