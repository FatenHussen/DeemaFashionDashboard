import type { Control } from 'react-hook-form';
import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';
import type { GiftData, GiftTranslation, GiftCreateUpdatePayload } from '@/pages/dashboard/gifts/types/gift.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { compressImage } from '@/utils/compress-image';
import { formatTranslated } from '@/utils/format-translated';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useInfiniteSelect } from '@/shared/hooks/use-infinite-select';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { ShopVariantColorSwatch } from '@/shared/components/shop-variant-color-swatch';
import { resolveStorageImageUrl, shopVariantOptionImage, shopVariantOptionColorHex } from '@/utils/shop-variant-image';
import { useCreateGift, useUpdateGift, useFetchGiftById, useBulkCreateGifts } from '@/pages/dashboard/gifts/hooks/gift';
import {
  GiftSchema,
  type GiftFormMode,
  type GiftFormValues,
} from '@/pages/dashboard/gifts/validation/gift.validation';
import { buildCategorySelectRows, paginateSelectRowsLocal } from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/shared/components/iconify';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { Box, Tab, Tabs, Input, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const getTranslation = (val: GiftTranslation | string | undefined, lang: 'ar' | 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return lang === 'ar' ? val : '';
  return val[lang] || '';
};

function categoryInitialLabel(src: GiftData | undefined): string | undefined {
  if (!src) return undefined;
  const cat = (src as GiftData).category;
  if (!cat?.name) return undefined;
  return typeof cat.name === 'object'
    ? (cat.name as { en?: string; ar?: string })?.en || (cat.name as { en?: string; ar?: string })?.ar
    : String(cat.name);
}

// --------- Multi-select Product Variant Picker ----------

type VariantMultiPickerProps = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  error?: string;
  categoryFetcher: (page: number, limit: number) => Promise<unknown>;
};

function VariantMultiPicker({ selectedIds, onChange, t, error, categoryFetcher }: VariantMultiPickerProps) {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const { allItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSelect(
      ['shopProductVariant', 'bulk', categoryId ?? 'all'],
      (page, limit) =>
        _ShopProductVariantApi
          .getList({
            page,
            per_page: limit,
            ...(categoryId != null && categoryId > 0 ? { category_id: categoryId } : {}),
          })
          .then((res) => ({
            data: { items: res.data.items ?? [], pagination: res.data.pagination },
          })),
      20
    );

  const { labelMap, imageById, colorHexById } = useMemo(() => {
    const labels = new Map<number, string>();
    const images = new Map<number, string>();
    const colors = new Map<number, string>();
    allItems.forEach((item) => {
      labels.set(item.id, formatTranslated((item as any).label));
      const url = shopVariantOptionImage(item);
      if (url) images.set(item.id, url);
      const hex = shopVariantOptionColorHex(item);
      if (hex) colors.set(item.id, hex);
    });
    return { labelMap: labels, imageById: images, colorHexById: colors };
  }, [allItems]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) {
      return undefined;
    }
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 80 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filtered = search
    ? allItems.filter((item) => {
        const label = formatTranslated((item as any).label, '');
        return label.toLowerCase().includes(search.toLowerCase());
      })
    : allItems;

  const toggleItem = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id]
    );
  };

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.includes(i.id));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filtered.map((i) => i.id));
      onChange(selectedIds.filter((id) => !visibleIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filtered.map((i) => i.id)]);
      onChange([...newIds]);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 overflow-hidden bg-background/30">
      {/* Category filter */}
      <div className="px-3 py-2.5 border-b border-border/50 bg-muted/10">
        <Typography variant="caption" className="mb-1.5 block text-muted-foreground font-medium">
          {t('form.giftFilterByCategory')}
        </Typography>
        <InfiniteScrollSelect
          value={categoryId ?? 0}
          onChange={(val) => {
            setCategoryId(val === 0 ? undefined : val);
            setSearch('');
          }}
          queryKey={['category', 'gift-bulk-hier']}
          fetcher={categoryFetcher}
          pageSize={15}
          placeholder={t('form.allCategories')}
        />
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border/50">
        <div className="relative">
          <Iconify
            icon="solar:magnifer-linear"
            width={16}
            className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('form.searchVariants')}
            className="w-full h-9 rounded-lg ps-8 pe-3 text-sm border border-border/50 bg-background/50 placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all"
          />
        </div>
      </div>

      {/* Select all + count */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between bg-muted/5">
        <button
          type="button"
          onClick={toggleAllVisible}
          disabled={filtered.length === 0}
          className="text-xs font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
        >
          {allVisibleSelected ? t('form.deselectAllVisible') : t('form.selectAllVisible')}
        </button>
        {selectedIds.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {t('form.selectedCount', { count: selectedIds.length })}
          </span>
        )}
      </div>

      {/* Variants list */}
      <div ref={listRef} className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Iconify icon="svg-spinners:ring-resize" width={18} />
            {t('loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('form.noVariantsFound')}
          </div>
        ) : (
          filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            const rowImg = shopVariantOptionImage(item);
            const rowHex = shopVariantOptionColorHex(item);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-border/10 last:border-b-0 ${
                  checked ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0"
                />
                {rowHex ? <ShopVariantColorSwatch hex={rowHex} size="lg" /> : null}
                {rowImg ? (
                  <img
                    src={rowImg}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-md border border-border/50 object-cover bg-muted"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30">
                    <Iconify icon="solar:gallery-minimalistic-bold" width={16} className="text-muted-foreground/60" />
                  </span>
                )}
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${checked ? 'font-medium text-foreground' : 'text-foreground/80'}`}
                >
                  {formatTranslated((item as any).label)}
                </span>
              </label>
            );
          })
        )}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground">
            <Iconify icon="svg-spinners:ring-resize" width={14} />
            {t('loadingMore')}
          </div>
        )}
      </div>

      {/* Selected items chips */}
      {selectedIds.length > 0 && (
        <div className="px-3 py-2.5 border-t border-border/50 bg-muted/5">
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {colorHexById.get(id) ? (
                  <ShopVariantColorSwatch hex={colorHexById.get(id)!} size="sm" />
                ) : null}
                {imageById.get(id) ? (
                  <img
                    src={imageById.get(id)}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded object-cover border border-primary/20"
                  />
                ) : null}
                <span className="max-w-32 truncate">{labelMap.get(id) || `#${id}`}</span>
                <button
                  type="button"
                  onClick={() => toggleItem(id)}
                  className="shrink-0 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <Iconify icon="solar:close-circle-bold" width={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 border-t border-destructive/30 bg-destructive/5">
          <Typography variant="caption" className="text-destructive">
            {error}
          </Typography>
        </div>
      )}
    </div>
  );
}

// --------- Shared Fields ----------

type SharedFieldsProps = {
  t: (key: string, options?: Record<string, unknown>) => string;
  control: Control<GiftFormValues>;
  detailsResponse?: { data?: GiftData };
  fromState?: GiftData;
  hideCategoryField?: boolean;
  categoryFetcher: (page: number, limit: number) => Promise<unknown>;
};

function GiftSharedFields({ t, control, detailsResponse, fromState, hideCategoryField, categoryFetcher }: SharedFieldsProps) {
  const src = detailsResponse?.data ?? fromState;

  return (
    <>
      <Box className="flex flex-wrap gap-4">
        <Box className="min-w-35 flex-1">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('columns.pointsRequired')}
          </Typography>
          <RHFTextField name="points_required" type="number" placeholder={t('form.placeholderThousand')} fullWidth />
        </Box>
        <Box className="min-w-35 flex-1">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('columns.stock')}
          </Typography>
          <RHFTextField name="stock_quantity" type="number" placeholder={t('form.placeholderFifty')} fullWidth />
        </Box>
      </Box>

      {!hideCategoryField && (
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.categoryLabel')} ({t('form.fieldOptional')})
          </Typography>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <InfiniteScrollSelect
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val === 0 ? undefined : val)}
                queryKey={['category', 'gift-hier']}
                fetcher={categoryFetcher}
                pageSize={15}
                placeholder={t('form.noCategory')}
                initialLabel={categoryInitialLabel(src)}
              />
            )}
          />
        </Box>
      )}

      <Box className="group">
        <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
          {t('form.giftTermsConditions')}
        </Typography>
        <div className="flex flex-col gap-2">
          <RHFTextField name="terms_conditions.ar" placeholder={t('form.giftTermsAr')} dir="rtl" fullWidth />
          <RHFTextField name="terms_conditions.en" placeholder={t('form.termsEnPlaceholder')} fullWidth />
        </div>
      </Box>
    </>
  );
}

// --------- Main Page ----------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.gift as GiftData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchGiftById(id || '');
  const createMutation = useCreateGift();
  const updateMutation = useUpdateGift();
  const bulkCreateMutation = useBulkCreateGifts();

  const defaultValues: GiftFormValues = {
    giftMode: 'tikmool',
    name: { ar: '', en: '' },
    description: { ar: '', en: '' },
    image: null,
    points_required: 1,
    stock_quantity: 0,
    is_active: true,
    category_id: undefined,
    shop_product_variant_ids: [],
    terms_conditions: { ar: '', en: '' },
  };

  const methods = useForm<GiftFormValues>({
    resolver: zodResolver(GiftSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;

  const { data: giftCategoriesTreeResp } = useQuery({
    queryKey: ['categories', 'gift-form-tree'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const giftBulkCategoryRows = useMemo(
    () =>
      buildCategorySelectRows((giftCategoriesTreeResp?.data?.items ?? []) as CategoryData[], {
        leading: { id: 0, label: t('form.allCategories') },
      }),
    [giftCategoriesTreeResp?.data?.items, t]
  );

  const giftFormCategoryRows = useMemo(
    () =>
      buildCategorySelectRows((giftCategoriesTreeResp?.data?.items ?? []) as CategoryData[], {
        leading: { id: 0, label: t('form.noCategory') },
      }),
    [giftCategoriesTreeResp?.data?.items, t]
  );

  const giftBulkCategoryFetcher = useCallback(
    (page: number, limit: number) =>
      Promise.resolve(paginateSelectRowsLocal(giftBulkCategoryRows, page, limit)),
    [giftBulkCategoryRows]
  );

  const giftFormCategoryFetcher = useCallback(
    (page: number, limit: number) =>
      Promise.resolve(paginateSelectRowsLocal(giftFormCategoryRows, page, limit)),
    [giftFormCategoryRows]
  );

  const giftMode = watch('giftMode');
  const imageField = watch('image');
  const giftSourceForImage = detailsResponse?.data ?? fromState;
  const existingGiftImageUrl =
    giftMode === 'external' && giftSourceForImage?.image
      ? String(giftSourceForImage.image)
      : null;

  const [newGiftImagePreview, setNewGiftImagePreview] = useState<string | null>(null);
  useEffect(() => {
    if (imageField instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setNewGiftImagePreview(reader.result as string);
      reader.readAsDataURL(imageField);
    } else {
      setNewGiftImagePreview(null);
    }
  }, [imageField]);

  const giftImageDisplaySrc = newGiftImagePreview ?? existingGiftImageUrl;

  const handleGiftModeChange = useCallback(
    (next: GiftFormMode) => {
      setValue('giftMode', next, { shouldValidate: true });
      if (next === 'external') {
        setValue('shop_product_variant_ids', []);
      } else {
        setValue('name', { ar: '', en: '' });
        setValue('description', { ar: '', en: '' });
        setValue('image', null);
      }
    },
    [setValue]
  );

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      const variantId = (source as GiftData & { shop_product_variant_id?: number | null }).shop_product_variant_id;
      const mode: GiftFormMode =
        variantId != null && variantId > 0 ? 'tikmool' : 'external';
      reset({
        giftMode: mode,
        name: { ar: getTranslation(source.name, 'ar'), en: getTranslation(source.name, 'en') },
        description: {
          ar: getTranslation(source.description, 'ar'),
          en: getTranslation(source.description, 'en'),
        },
        image: null,
        points_required: source.points_required || 1,
        stock_quantity: source.stock_quantity || 0,
        is_active: Boolean(source.is_active),
        category_id: source.category_id || (source as GiftData & { category?: { id: number } }).category?.id,
        shop_product_variant_ids: variantId ? [variantId] : [],
        terms_conditions: {
          ar: getTranslation(source.terms_conditions, 'ar'),
          en: getTranslation(source.terms_conditions, 'en'),
        },
      });
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || bulkCreateMutation.isPending;
  const errorMessage =
    createMutation.error?.message ||
    updateMutation.error?.message ||
    bulkCreateMutation.error?.message ||
    null;

  const buildPayload = (data: GiftFormValues): GiftCreateUpdatePayload => {
    const { giftMode: mode, shop_product_variant_ids, ...rest } = data;
    const base: GiftCreateUpdatePayload = {
      name: rest.name,
      description: rest.description,
      image: mode === 'external' ? rest.image : undefined,
      points_required: rest.points_required,
      stock_quantity: rest.stock_quantity,
      is_active: rest.is_active,
      category_id: rest.category_id,
      terms_conditions: rest.terms_conditions,
      shop_product_variant_id:
        mode === 'tikmool' && shop_product_variant_ids.length > 0
          ? shop_product_variant_ids[0]
          : null,
    };

    if (mode === 'tikmool') {
      base.name = {
        ar: rest.name.ar?.trim() || t('form.giftTikmoolDefaultNameAr'),
        en: rest.name.en?.trim() || t('form.giftTikmoolDefaultNameEn'),
      };
      const hasDesc = !!(rest.description?.ar?.trim() || rest.description?.en?.trim());
      base.description = hasDesc ? rest.description : undefined;
    }

    return base;
  };

  const onSubmit = async (data: GiftFormValues) => {
    try {
      const dataWithImage =
        data.image instanceof File
          ? { ...data, image: await compressImage(data.image) }
          : data;
      if (isEditMode && id) {
        const payload = buildPayload(dataWithImage);
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.giftUpdatedToast'));
      } else if (data.giftMode === 'tikmool' && data.shop_product_variant_ids.length > 0) {
        await bulkCreateMutation.mutateAsync({
          shop_product_variant_ids: data.shop_product_variant_ids,
          points_required: data.points_required,
          stock_quantity: data.stock_quantity,
          is_active: data.is_active,
          terms_conditions: data.terms_conditions,
        });
        toast.success(
          t('form.giftBulkCreatedToast', { count: data.shop_product_variant_ids.length })
        );
      } else {
        const payload = buildPayload(dataWithImage);
        await createMutation.mutateAsync(payload);
        toast.success(t('form.giftCreatedToast'));
      }
      navigate('/gifts');
    } catch (error: unknown) {
      console.error('Error saving gift:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  const variantFetcher = (page: number, limit: number) =>
    _ShopProductVariantApi.getList({ page, per_page: limit }).then((res) => ({
      data: {
        items: res.data.items ?? [],
        pagination: res.data.pagination,
      },
    }));

  const variantInitialLabel = (() => {
    const src = detailsResponse?.data ?? fromState;
    const vid = (src as GiftData & { shop_product_variant_id?: number })?.shop_product_variant_id;
    return vid ? t('form.giftVariantInitialLabel', { id: vid }) : undefined;
  })();

  const variantInitialImage = (() => {
    const src = detailsResponse?.data ?? fromState;
    if (!src) return undefined;
    const g = src as GiftData;
    return resolveStorageImageUrl(g.variant_image ?? g.image);
  })();

  return (
    <>
      <title>
        {isEditMode
          ? t('form.giftEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.giftCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/gifts')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.giftEditTitle') : t('form.giftCreateTitle')}
        description={isEditMode ? t('form.giftEditDesc') : t('form.giftCreateDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingGift')}
        submitLabel={isEditMode ? t('form.giftSubmitUpdate') : t('form.giftSubmitCreate')}
        submittingLabel={isEditMode ? t('form.giftSubmitUpdating') : t('form.giftSubmitCreating')}
      >
        {/* ── Section: Gift Mode ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gift-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.giftTabTikmool')} / {t('form.giftTabExternal')}</Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-6">
            <Box className="w-full">
              <Tabs value={giftMode} onChange={(v) => handleGiftModeChange(v as GiftFormMode)} className="w-full">
                <Tab value="tikmool" label={t('form.giftTabTikmool')} />
                <Tab value="external" label={t('form.giftTabExternal')} />
              </Tabs>
            </Box>

            {giftMode === 'tikmool' && (
              <Box className="flex flex-col gap-5">
                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.giftShopProductVariant')}</Typography>
                  {!isEditMode && (
                    <Typography variant="caption" className="mb-3 block text-muted-foreground">{t('form.giftBulkCreateDesc')}</Typography>
                  )}
                  {isEditMode ? (
                    <Controller
                      name="shop_product_variant_ids"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <InfiniteScrollSelect
                            value={field.value?.[0] ?? 0}
                            onChange={(val) => field.onChange(val ? [val] : [])}
                            queryKey={['shopProductVariant', 'gift', 'tikmool']}
                            fetcher={variantFetcher}
                            placeholder={t('form.selectProductVariant')}
                            initialLabel={variantInitialLabel}
                            initialImage={variantInitialImage}
                            getOptionImage={(item) => shopVariantOptionImage(item)}
                            getOptionColorHex={(item) => shopVariantOptionColorHex(item)}
                            pageSize={15}
                          />
                          {fieldState.error && <Typography variant="caption" className="mt-1 text-destructive">{(fieldState.error as any).message || (fieldState.error as any).root?.message}</Typography>}
                        </>
                      )}
                    />
                  ) : (
                    <Controller
                      name="shop_product_variant_ids"
                      control={control}
                      render={({ field, fieldState }) => (
                        <VariantMultiPicker
                          selectedIds={field.value ?? []}
                          onChange={field.onChange}
                          t={t}
                          error={(fieldState.error as any)?.message || (fieldState.error as any)?.root?.message}
                          categoryFetcher={giftBulkCategoryFetcher}
                        />
                      )}
                    />
                  )}
                </Box>
                <GiftSharedFields
                  t={t}
                  control={control}
                  detailsResponse={detailsResponse}
                  fromState={fromState}
                  hideCategoryField={!isEditMode}
                  categoryFetcher={giftFormCategoryFetcher}
                />
              </Box>
            )}

            {giftMode === 'external' && (
              <Box className="flex flex-col gap-5">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
                    <RHFTextField name="name.en" placeholder={t('form.namePlaceholder')} fullWidth />
                  </Box>
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
                    <RHFTextField name="name.ar" placeholder={t('form.descriptionArPlaceholder')} dir="rtl" fullWidth />
                  </Box>
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.descriptionEn')}</Typography>
                    <RHFTextField name="description.en" placeholder={t('form.descriptionEnPlaceholder')} fullWidth />
                  </Box>
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.descriptionAr')}</Typography>
                    <RHFTextField name="description.ar" placeholder={t('form.descriptionArPlaceholder')} dir="rtl" fullWidth />
                  </Box>
                </Box>

                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                    {t('form.giftImageLabel')} ({t('form.fieldOptional')})
                  </Typography>
                  <Controller
                    name="image"
                    control={control}
                    render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                      <div className="w-full">
                        <Input
                          {...field}
                          type="file"
                          accept="image/*"
                          value={undefined}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file ?? null);
                          }}
                          error={!!error}
                          helperText={error?.message || t('form.giftImageUploadHelper')}
                          fullWidth
                          className="transition-all duration-200"
                        />
                        {giftImageDisplaySrc && (
                          <Box className="mt-5 flex items-center gap-4">
                            <Box className="relative">
                              <Box className="absolute -inset-1 rounded-2xl bg-primary/15 blur-sm" />
                              <img
                                src={giftImageDisplaySrc}
                                alt={t('form.giftImagePreviewAlt')}
                                className="relative h-28 w-28 object-cover rounded-xl border border-border/60 shadow-sm"
                              />
                            </Box>
                            {imageField instanceof File && (
                              <button
                                type="button"
                                onClick={() => onChange(null)}
                                className="text-sm font-medium text-destructive hover:text-destructive/80"
                              >
                                {t('form.giftImageClearNew')}
                              </button>
                            )}
                          </Box>
                        )}
                      </div>
                    )}
                  />
                </Box>

                <GiftSharedFields
                  t={t}
                  control={control}
                  detailsResponse={detailsResponse}
                  fromState={fromState}
                  categoryFetcher={giftFormCategoryFetcher}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('columns.active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">{t('columns.active')}</Typography>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
