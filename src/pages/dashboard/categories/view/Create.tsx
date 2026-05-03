import type { CategoryData, CategoryListResponse } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { compressImage } from '@/utils/compress-image';
import { useQuery, useQueries } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  CategorySchema,
  type CategoryFormValues,
} from '@/pages/dashboard/categories/validation/category.validation';
import {
  useCreateCategory,
  useUpdateCategory,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';
import {
  categoryListTotal,
  MAX_CATEGORY_SUB_LEVELS,
  leafCategoryIdFromCascade,
} from '@/pages/dashboard/categories/utils/category-cascade-shared';
import {
  ancestorsChainFromFlat,
  paginateSelectRowsLocal,
  buildParentPickerOptions,
  collectSelfAndDescendantIds,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

function parentIdFromCascade(mainCategoryId: number, subSelections: number[]): number | null {
  if (mainCategoryId <= 0) return null;
  return leafCategoryIdFromCascade(mainCategoryId, subSelections);
}

function categoryListLabel(cat: Pick<CategoryData, 'name'>): string {
  return typeof cat.name === 'object' && cat.name !== null
    ? formatTranslated(cat.name as { en?: string; ar?: string })
    : String(cat.name ?? '');
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const queryParentId = useMemo(() => {
    const raw = searchParams.get('parent_id');
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const {
    data: flatForParent,
    dataUpdatedAt: flatParentDataUpdatedAt,
    isFetched: flatParentFetched,
  } = useQuery({
    queryKey: ['categories', 'flat-parent-picker'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const flatItems = flatForParent?.data?.items ?? [];

  const { data: categoryData, isLoading: isLoadingCategory } = useFetchCategoryById(id || '');

  const legacyParentPicker = useMemo(() => {
    if (!flatParentFetched || flatItems.length === 0) return false;
    let targetPid: number | null = null;
    if (isEditMode && categoryData?.data?.parent_id != null && Number(categoryData.data.parent_id) > 0) {
      targetPid = Number(categoryData.data.parent_id);
    } else if (!isEditMode && queryParentId != null && queryParentId > 0) {
      targetPid = queryParentId;
    }
    if (targetPid == null) return false;
    const chain = ancestorsChainFromFlat(flatItems, targetPid);
    return chain.length > MAX_CATEGORY_SUB_LEVELS + 1;
  }, [
    flatParentFetched,
    flatItems,
    isEditMode,
    categoryData?.data?.parent_id,
    queryParentId,
  ]);

  const parentPickerRows = useMemo(
    () =>
      legacyParentPicker
        ? buildParentPickerOptions(flatItems, {
            excludeCategoryId: isEditMode && id ? Number(id) : undefined,
          })
        : [],
    [flatItems, id, isEditMode, legacyParentPicker]
  );

  const parentCategoryFetcher = useCallback(
    (page: number, limit: number) => {
      const none = { id: 0, label: t('form.noParent'), depth: 0, hasChildren: false };
      const rows = parentPickerRows.map((r) => ({
        id: r.id,
        label: r.label,
        depth: r.depth,
        hasChildren: r.hasChildren,
      }));
      const allRows = [none, ...rows];
      const total = allRows.length;
      const lastPage = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const items = allRows.slice(start, start + limit);
      return Promise.resolve({
        data: {
          items,
          pagination: {
            current_page: page,
            last_page: lastPage,
            per_page: limit,
            total,
          },
        },
      });
    },
    [parentPickerRows, t]
  );

  const excludedIds = useMemo(
    () => collectSelfAndDescendantIds(flatItems, isEditMode && id ? Number(id) : 0),
    [flatItems, id, isEditMode]
  );

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
      const noneRow = { id: 0, label: t('form.noParent') };
      return paginateSelectRowsLocal([noneRow, ...roots], page, limit);
    },
    [excludedIds, t]
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
        queryKey: ['categories', 'children-probe', 'sub-level', level, parentId],
        queryFn: () =>
          _CategoryApi.getListCategoriesPaginated({
            page: 1,
            per_page: 1,
            parent_id: parentId,
          }),
        enabled: !legacyParentPicker && parentId > 0,
      };
    }),
  });

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const defaultValues: CategoryFormValues = useMemo(
    () => ({
      name: {
        en: '',
        ar: '',
      },
      icon: null,
      parent_id: null,
      order: 0,
      is_active: true,
      is_restaurant: false,
    }),
    [isEditMode]
  );

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const iconValue = watch('icon');

  useEffect(() => {
    cascadeHydratedKeyRef.current = '';
    setCascadeHydrated(false);
  }, [id]);

  useEffect(() => {
    if (legacyParentPicker) {
      setCascadeHydrated(true);
      return;
    }

    const ready =
      flatParentFetched &&
      (!isEditMode || (!isLoadingCategory && !!categoryData?.data));

    if (!ready) {
      setCascadeHydrated(false);
      return;
    }

    const hydrateKey = `${id ?? 'new'}|${isEditMode ? String(categoryData?.data?.parent_id ?? '') : String(queryParentId ?? '')}`;

    const items = flatItems;

    if (isEditMode && categoryData?.data) {
      const pid = categoryData.data.parent_id;
      if (pid != null && Number(pid) > 0 && items.length === 0) {
        setCascadeHydrated(false);
        return;
      }
      if (
        pid != null &&
        Number(pid) > 0 &&
        items.length > 0 &&
        ancestorsChainFromFlat(items, Number(pid)).length === 0
      ) {
        setCascadeHydrated(false);
        return;
      }
    } else if (!isEditMode && queryParentId != null && queryParentId > 0 && items.length === 0) {
      setCascadeHydrated(false);
      return;
    } else if (
      !isEditMode &&
      queryParentId != null &&
      queryParentId > 0 &&
      items.length > 0 &&
      ancestorsChainFromFlat(items, queryParentId).length === 0
    ) {
      setCascadeHydrated(false);
      return;
    }

    if (cascadeHydratedKeyRef.current === hydrateKey) {
      setCascadeHydrated(true);
      return;
    }
    cascadeHydratedKeyRef.current = hydrateKey;

    if (isEditMode && categoryData?.data) {
      const pid = categoryData.data.parent_id;
      if (pid == null || Number(pid) <= 0) {
        setMainCategoryId(0);
        setSubSelections([]);
      } else {
        const chain = ancestorsChainFromFlat(items, Number(pid));
        if (chain.length >= 1) {
          setMainCategoryId(chain[0].id);
          const tailIds = chain.slice(1).map((c) => c.id);
          setSubSelections(tailIds.slice(0, MAX_CATEGORY_SUB_LEVELS));
        }
      }
    } else if (queryParentId != null && queryParentId > 0 && items.length > 0) {
      const chain = ancestorsChainFromFlat(items, queryParentId);
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
    legacyParentPicker,
    flatParentFetched,
    flatItems,
    isEditMode,
    isLoadingCategory,
    categoryData?.data,
    categoryData?.data?.parent_id,
    queryParentId,
    id,
  ]);

  useEffect(() => {
    if (legacyParentPicker || !cascadeHydrated) return;
    setValue('parent_id', parentIdFromCascade(mainCategoryId, subSelections));
  }, [
    legacyParentPicker,
    cascadeHydrated,
    mainCategoryId,
    subSelections,
    setValue,
  ]);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode && categoryData?.data && !isLoadingCategory) {
      const category = categoryData.data;
      reset({
        name: category.name,
        icon: null, // Don't pre-fill file input
        parent_id: category.parent_id,
        order: (category as any).order ?? 0,
        is_active: Boolean((category as any).is_active),
        is_restaurant: Boolean((category as any).is_restaurant),
      });

      // Set preview image if icon exists
      if (category.icon) {
        setPreviewImage(category.icon);
      }
    }
  }, [categoryData, isEditMode, isLoadingCategory, reset]);

  // Update preview when icon changes
  useEffect(() => {
    if (iconValue && iconValue instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(iconValue);
    } else if (!iconValue) {
      setPreviewImage(null);
    }
  }, [iconValue]);

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const errorMessage =
    createCategoryMutation.error?.message || updateCategoryMutation.error?.message || null;

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const icon =
        data.icon instanceof File ? await compressImage(data.icon) : data.icon || null;
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        icon,
        parent_id: data.parent_id || null,
        order: data.order ?? 0,
        is_active: data.is_active,
        is_restaurant: data.is_restaurant,
      };

      if (isEditMode && id) {
        await updateCategoryMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.categoryUpdatedSuccess'));
        navigate('/categories');
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success(t('form.categoryCreatedSuccess'));
        navigate('/categories');
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  const infoText = isEditMode ? t('form.categoryFormInfoEdit') : t('form.categoryFormInfoCreate');

  const cascadeEditLabels = useMemo(() => {
    if (legacyParentPicker || !isEditMode || !categoryData?.data?.parent_id) {
      return { main: undefined as string | undefined, subs: [] as (string | undefined)[] };
    }
    const pid = Number(categoryData.data.parent_id);
    if (!(pid > 0) || flatItems.length === 0) {
      return { main: undefined, subs: [] };
    }
    const chain = ancestorsChainFromFlat(flatItems, pid);
    if (chain.length > MAX_CATEGORY_SUB_LEVELS + 1) {
      return { main: undefined, subs: [] };
    }
    return {
      main: chain[0] ? categoryListLabel(chain[0]) : undefined,
      subs: chain.slice(1).map((c) => categoryListLabel(c)),
    };
  }, [legacyParentPicker, isEditMode, categoryData?.data?.parent_id, flatItems]);

  const parentCategoryLabel =
    categoryData?.data?.parent &&
    (typeof categoryData.data.parent.name === 'object'
      ? formatTranslated(categoryData.data.parent.name)
      : categoryData.data.parent.name);

  return (
    <>
      <title>
        {`${isEditMode ? t('form.editCategory') : t('form.createCategory')} | ${t('form.categoryBrandedTitle', { app: CONFIG.appName })}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCategory') : t('form.createCategory')}
        description={isEditMode ? t('form.editCategoryDesc') : t('form.createCategoryDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingCategory}
        loadingText={t('form.loadingCategory')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateCategorySubmit') : t('form.createCategorySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCategory') : t('form.creatingCategory')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')} / {t('form.nameEn')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder={t('form.namePlaceholder')}
                helperText={t('form.categoryNameArHelper')}
                className="transition-all duration-200"
                dir="rtl"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder={t('form.categoryNameEnPlaceholder')}
                helperText={t('form.categoryNameEnHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Organization ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:diagram-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.parentCategorySection')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group md:col-span-2 space-y-5">
              <Typography variant="caption" className="text-muted-foreground block">
                {legacyParentPicker
                  ? t('form.selectParentCategoryHelper')
                  : t('form.categoryHierarchyCascadeHelper')}
              </Typography>

              {legacyParentPicker ? (
                <Box className="space-y-2">
                  <Box className="flex items-center gap-2 mb-2">
                    <Iconify icon="solar:diagram-bold" className="text-violet-500" width={20} height={20} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.parentCategoryPlaceholder')}
                    </Typography>
                  </Box>
                  <RHFInfiniteSelect
                    name="parent_id"
                    queryKey={[
                      'categories',
                      'infinite',
                      'parent-form',
                      flatParentDataUpdatedAt ?? 0,
                      isEditMode ? id : '',
                      'legacy-deep',
                    ]}
                    fetcher={parentCategoryFetcher}
                    placeholder={t('form.parentCategoryPlaceholder')}
                    helperText={t('form.categoryDeepParentHint')}
                    initialLabel={parentCategoryLabel ?? undefined}
                  />
                </Box>
              ) : (
                <>
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
                        'category-create',
                        'roots',
                        flatParentDataUpdatedAt ?? 0,
                        isEditMode ? id : '',
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
                    const showLevel =
                      mainCategoryId > 0 && parentId > 0 && total > 0;
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
                            'category-create',
                            'sub',
                            level,
                            parentId,
                            excludedIds.size,
                          ]}
                          fetcher={fetcher}
                          placeholder={t('form.productSubcategory')}
                          initialLabel={cascadeEditLabels.subs[level]}
                        />
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>

            <Box className="group md:col-span-2 md:max-w-md">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:sort-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.categoryDisplayOrder')}
                </Typography>
              </Box>
              <RHFTextField
                name="order"
                type="number"
                placeholder={t('form.placeholderZero')}
                helperText={t('form.orderHelper')}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status Settings ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:shield-check-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('statusLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('active')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.isActiveHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />

            <Controller
              name="is_restaurant"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-orange-500/40 hover:bg-orange-500/[0.02] transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:shop-bold" className="text-orange-500" width={16} height={16} />
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('form.isRestaurant')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.isRestaurantHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryIconSection')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="icon"
              control={control}
              render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                <div className="w-full">
                  <Input
                    {...field}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file || null);
                    }}
                    error={!!error}
                    helperText={error?.message || t('form.categoryIconUploadHelper')}
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {previewImage && (
                    <Box className="mt-5 flex items-center gap-4">
                      <Box className="relative">
                        <Box className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm" />
                        <img
                          src={previewImage}
                          alt={t('form.categoryIconPreviewAlt')}
                          className="relative w-24 h-24 object-cover rounded-xl border border-border/60 shadow-sm"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" className="font-medium text-foreground">
                          {t('form.categoryIconPreviewAlt')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.categoryIconUploadHelper')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
