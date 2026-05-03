import type { CategoryData, CategoryListResponse } from '@/pages/dashboard/categories/types/category.types';

import { useQueries } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import {
  ancestorsChainFromFlat,
  paginateSelectRowsLocal,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';
import {
  categoryListTotal,
  MAX_CATEGORY_SUB_LEVELS,
  leafCategoryIdFromCascade,
} from '@/pages/dashboard/categories/utils/category-cascade-shared';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

function categoryListLabel(cat: Pick<CategoryData, 'name'>): string {
  return typeof cat.name === 'object' && cat.name !== null
    ? formatTranslated(cat.name as { en?: string; ar?: string })
    : String(cat.name ?? '');
}

export type CategoryLeafCascadeFieldsProps = {
  t: (key: string, opts?: Record<string, unknown>) => string;
  legacyMode: boolean;
  flatItems: CategoryData[];
  flatParentFetched: boolean;
  flatParentDataUpdatedAt: number;
  excludedIds?: Set<number>;
  /** Rebuild cascade when this leaf id is known (e.g. edit). Use null when creating. */
  hydrateLeafCategoryId: number | null;
  /** e.g. route id or attribute id — resets internal hydrate bookkeeping */
  hydrationKey: string;
  onEffectiveLeafChange: (leafId: number) => void;
};

export function CategoryLeafCascadeFields({
  t,
  legacyMode,
  flatItems,
  flatParentFetched,
  flatParentDataUpdatedAt,
  excludedIds = new Set<number>(),
  hydrateLeafCategoryId,
  hydrationKey,
  onEffectiveLeafChange,
}: CategoryLeafCascadeFieldsProps) {
  const [mainCategoryId, setMainCategoryId] = useState(0);
  const [subSelections, setSubSelections] = useState<number[]>([]);
  const [cascadeHydrated, setCascadeHydrated] = useState(false);
  const cascadeHydratedKeyRef = useRef<string>('');

  const rootCascadeFetcher = useCallback(
    async (page: number, limit: number) => {
      const r = await _CategoryApi.getListCategoriesPaginated({
        page: 1,
        per_page: 500,
        parent_id: null,
      });
      const roots = r.data.items
        .filter((cat) => !excludedIds.has(cat.id))
        .map((cat) => ({
          id: cat.id,
          label: categoryListLabel(cat),
        }));
      return paginateSelectRowsLocal(roots, page, limit);
    },
    [excludedIds]
  );

  const subCascadeFetchers = useMemo(
    () =>
      Array.from({ length: MAX_CATEGORY_SUB_LEVELS }, (_, levelIndex) => async (page: number, limit: number) => {
          const parentId =
            levelIndex === 0 ? mainCategoryId : subSelections[levelIndex - 1] ?? 0;
          const directRow = {
            id: 0,
            label:
              levelIndex === 0
                ? t('form.categoryDirectUnderMain')
                : t('form.categoryDirectUnderParent'),
          };
          if (parentId <= 0) {
            return paginateSelectRowsLocal([directRow], page, limit);
          }
          const r = await _CategoryApi.getListCategoriesPaginated({
            page: 1,
            per_page: 500,
            parent_id: parentId,
          });
          const rows = r.data.items
            .filter((cat) => !excludedIds.has(cat.id))
            .map((cat) => ({
              id: cat.id,
              label: categoryListLabel(cat),
            }));
          return paginateSelectRowsLocal([directRow, ...rows], page, limit);
        }),
    [mainCategoryId, subSelections, excludedIds, t]
  );

  const subChildrenProbes = useQueries({
    queries: Array.from({ length: MAX_CATEGORY_SUB_LEVELS }, (_, level) => {
      const parentId =
        level === 0 ? mainCategoryId : subSelections[level - 1] ?? 0;
      return {
        queryKey: ['categories', 'children-probe', 'leaf-cascade', level, parentId],
        queryFn: () =>
          _CategoryApi.getListCategoriesPaginated({
            page: 1,
            per_page: 1,
            parent_id: parentId,
          }),
        enabled: !legacyMode && parentId > 0,
      };
    }),
  });

  useEffect(() => {
    cascadeHydratedKeyRef.current = '';
    setCascadeHydrated(false);
  }, [hydrationKey]);

  useEffect(() => {
    if (legacyMode) {
      setCascadeHydrated(true);
      return;
    }

    if (!flatParentFetched) {
      setCascadeHydrated(false);
      return;
    }

    const hydrateKey =
      hydrateLeafCategoryId != null && hydrateLeafCategoryId > 0
        ? `${hydrationKey}|leaf:${hydrateLeafCategoryId}`
        : `${hydrationKey}|leaf:new`;

    const items = flatItems;

    if (
      hydrateLeafCategoryId != null &&
      hydrateLeafCategoryId > 0 &&
      items.length === 0
    ) {
      setCascadeHydrated(false);
      return;
    }
    if (
      hydrateLeafCategoryId != null &&
      hydrateLeafCategoryId > 0 &&
      items.length > 0 &&
      ancestorsChainFromFlat(items, hydrateLeafCategoryId).length === 0
    ) {
      setCascadeHydrated(false);
      return;
    }

    if (cascadeHydratedKeyRef.current === hydrateKey) {
      setCascadeHydrated(true);
      return;
    }
    cascadeHydratedKeyRef.current = hydrateKey;

    if (hydrateLeafCategoryId != null && hydrateLeafCategoryId > 0 && items.length > 0) {
      const chain = ancestorsChainFromFlat(items, hydrateLeafCategoryId);
      if (chain.length >= 1) {
        setMainCategoryId(chain[0].id);
        const tailIds = chain.slice(1).map((c) => c.id);
        setSubSelections(tailIds.slice(0, MAX_CATEGORY_SUB_LEVELS));
      }
    } else {
      setMainCategoryId(0);
      setSubSelections([]);
    }

    setCascadeHydrated(true);
  }, [
    legacyMode,
    flatParentFetched,
    flatItems,
    hydrateLeafCategoryId,
    hydrationKey,
  ]);

  const onLeafRef = useRef(onEffectiveLeafChange);
  onLeafRef.current = onEffectiveLeafChange;

  useEffect(() => {
    if (legacyMode || !cascadeHydrated) return;
    onLeafRef.current(leafCategoryIdFromCascade(mainCategoryId, subSelections));
  }, [legacyMode, cascadeHydrated, mainCategoryId, subSelections]);

  const cascadeEditLabels = useMemo(() => {
    if (
      hydrateLeafCategoryId == null ||
      hydrateLeafCategoryId <= 0 ||
      flatItems.length === 0
    ) {
      return { main: undefined as string | undefined, subs: [] as (string | undefined)[] };
    }
    const chain = ancestorsChainFromFlat(flatItems, hydrateLeafCategoryId);
    if (chain.length > MAX_CATEGORY_SUB_LEVELS + 1) {
      return { main: undefined, subs: [] };
    }
    return {
      main: chain[0] ? categoryListLabel(chain[0]) : undefined,
      subs: chain.slice(1).map((c) => categoryListLabel(c)),
    };
  }, [hydrateLeafCategoryId, flatItems]);

  if (legacyMode) {
    return null;
  }

  return (
    <Box className="space-y-5">
      <Typography variant="caption" className="text-muted-foreground block">
        {t('form.categoryHierarchyCascadeHelper')}
      </Typography>

      <Box>
        <Box className="flex items-center gap-2 mb-2">
          <Iconify icon="solar:diagram-bold" className="text-violet-500" width={20} height={20} />
          <Typography variant="subtitle2" className="font-semibold text-foreground">
            {t('form.productMainCategory')}
          </Typography>
        </Box>
        <InfiniteScrollSelect
          value={mainCategoryId}
          onChange={(val) => {
            setMainCategoryId(val);
            setSubSelections([]);
          }}
          queryKey={[
            'categories',
            'infinite',
            'leaf-cascade',
            'roots',
            flatParentDataUpdatedAt ?? 0,
            hydrationKey,
            excludedIds.size,
          ]}
          fetcher={rootCascadeFetcher}
          placeholder={t('form.selectMainCategory')}
          initialLabel={cascadeEditLabels.main}
        />
      </Box>

      {Array.from({ length: MAX_CATEGORY_SUB_LEVELS }, (_, level) => {
        const parentId =
          level === 0 ? mainCategoryId : subSelections[level - 1] ?? 0;
        const total = categoryListTotal(
          subChildrenProbes[level]?.data as CategoryListResponse | undefined
        );
        const showLevel = mainCategoryId > 0 && parentId > 0 && total > 0;
        if (!showLevel) return null;

        const fetcher = subCascadeFetchers[level];
        return (
          <Box key={level}>
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:diagram-up-bold" className="text-violet-500" width={20} height={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.categorySubOptionalLevel', { n: level + 1 })}
              </Typography>
            </Box>
            <InfiniteScrollSelect
              value={subSelections[level] ?? 0}
              onChange={(val) => {
                setSubSelections((prev) => [...prev.slice(0, level), val]);
              }}
              queryKey={[
                'categories',
                'infinite',
                'leaf-cascade',
                'sub',
                level,
                parentId,
                hydrationKey,
                excludedIds.size,
              ]}
              fetcher={fetcher}
              placeholder={t('form.productSubcategory')}
              initialLabel={cascadeEditLabels.subs[level]}
            />
          </Box>
        );
      })}
    </Box>
  );
}
