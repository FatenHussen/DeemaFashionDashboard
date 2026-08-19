import type { SliderLibraryItem } from '../types/page-builder.types';

import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
import { useInfinitePageSliders } from '@/pages/dashboard/sections/hooks/usePageBuilder';
import {
  contentTypeLabel,
  SECTION_CONTENT_TYPES,
  API_EXTRA_CONTENT_TYPES,
} from '@/pages/dashboard/sections/utils/content-type-config';

import { Box, Input, Button, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

function sectionName(item: SliderLibraryItem): string {
  if (typeof item.name === 'string') return item.name;
  return formatTranslated(item.name as { en?: string; ar?: string }) || `#${item.id}`;
}

function ColorDot({ color }: { color?: string | null }) {
  if (!color) return null;
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded-md border border-border/60"
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * Search + filter + infinite list over every existing section
 * (`GET /pages/{id}/sliders`) with single selection.
 */
export function SliderLibraryPicker({
  pageId,
  selectedId,
  onSelect,
}: {
  pageId: number | string;
  selectedId: number | null;
  onSelect: (item: SliderLibraryItem) => void;
}) {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { infiniteQuery, allSliders } = useInfinitePageSliders(pageId, {
    per_page: 10,
    ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(typeFilter === 'manual' || typeFilter === 'api' ? { type: typeFilter } : {}),
  });

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

  return (
    <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
      <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-teal-500/[0.06] via-teal-500/[0.02] to-transparent">
        <Box className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
          <Iconify icon="solar:layers-bold" className="text-teal-500" width={15} />
        </Box>
        <Typography variant="subtitle2" className="font-semibold text-foreground flex-1">
          {t('form.pageBuilderLibraryHeading')}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() =>
            navigate(
              pageId ? `/sections/create?returnPage=${encodeURIComponent(String(pageId))}` : '/sections/create'
            )
          }
        >
          <Iconify icon="solar:add-circle-bold" width={16} className="me-1.5" />
          {t('form.pageBuilderLibraryCreateNew')}
        </Button>
      </Box>

      <Box className="p-6">
        <Typography variant="body2" className="text-muted-foreground mb-4">
          {t('form.pageBuilderLibraryCopiedNote')}
        </Typography>

        {/* Search + content type filter */}
        <Box className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="text"
            autoComplete="off"
            floatingLabel={false}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('form.pageBuilderLibrarySearch')}
            className="w-full"
          />
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="">{t('form.pageBuilderLibraryContentTypeAll')}</option>
            {[...SECTION_CONTENT_TYPES, ...API_EXTRA_CONTENT_TYPES].map((type) => (
              <option key={type} value={type}>
                {contentTypeLabel(t, type)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="">{t('form.sectionListTypeAll')}</option>
            <option value="manual">{sectionTypeLabel(t, 'manual')}</option>
            <option value="api">{sectionTypeLabel(t, 'api')}</option>
          </select>
        </Box>

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

        {infiniteQuery.isError && (
          <Box className="text-center p-8 border border-destructive/50 rounded-lg bg-destructive/5">
            <Iconify icon="solar:danger-bold" className="w-12 h-12 text-destructive mx-auto mb-2" />
            <Typography variant="body2" className="text-destructive">
              {t('form.pageBuilderLibraryError')}
            </Typography>
          </Box>
        )}

        {!infiniteQuery.isLoading && !infiniteQuery.isError && (
          <Box className="border rounded-lg overflow-hidden">
            {allSliders.length === 0 ? (
              <Box className="text-center p-8">
                <Iconify
                  icon="solar:inbox-line-bold"
                  className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.pageBuilderLibraryEmpty')}
                </Typography>
              </Box>
            ) : (
              <Box className="divide-y divide-border">
                {allSliders.map((section) => {
                  const isSelected = selectedId === section.id;
                  return (
                    <Box
                      key={section.id}
                      onClick={() => onSelect(section)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => onSelect(section)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <Box className="flex-1 min-w-0">
                        <Box className="flex flex-wrap items-center gap-2 mb-1">
                          <Typography variant="body1" className="font-semibold text-foreground">
                            {sectionName(section)}
                          </Typography>
                          <Box className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                            {t('form.itemIdBadgeShort', { id: section.id })}
                          </Box>
                        </Box>
                        <Box className="flex flex-wrap items-center gap-2">
                          {section.content_type && (
                            <span className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                              {t(`form.pageSectionFilterValues.${section.content_type}`, {
                                defaultValue: section.content_type,
                              })}
                            </span>
                          )}
                          {section.type && (
                            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {sectionTypeLabel(t, section.type)}
                            </span>
                          )}
                          {section.variant && (
                            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {t(`form.pageSectionVariant_${section.variant}`, {
                                defaultValue: section.variant,
                              })}
                            </span>
                          )}
                          {section.pages_count != null && section.pages_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                              <Iconify icon="solar:documents-bold" width={12} />
                              {t('form.pageBuilderLibraryPagesCount', {
                                count: section.pages_count,
                              })}
                            </span>
                          )}
                          <ColorDot color={section.background_color} />
                          <ColorDot color={section.background_card_color} />
                        </Box>
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
