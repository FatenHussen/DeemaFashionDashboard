import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { MultiSelect } from '@/shared/ui/multi-select';
import { compressImage } from '@/utils/compress-image';
import { formatTranslated } from '@/utils/format-translated';
import { resolveBasketGalleryUrls } from '@/utils/basket-gallery';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import {
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';
import { resolveStorageImageUrl, shopVariantOptionImage, shopVariantOptionColorHex } from '@/utils/shop-variant-image';
import {
  ScheduledBasketSchema,
  type ScheduledBasketFormValues,
} from '@/pages/dashboard/baskets/validation/scheduled-basket.validation';
import {
  useCreateScheduledBasket,
  useUpdateScheduledBasket,
  useFetchScheduledBasketById,
} from '@/pages/dashboard/baskets/hooks/scheduled-basket';
import {
  type ScheduledBasketData,
  type ScheduledBasketItem,
  type ScheduledBasketCreateUpdatePayload,
  badgesFormValueFromScheduledBasketResponse,
} from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

const mainCategoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit, parent_id: 0 }).then((r) => ({
    data: {
      items: r.data.items.map((cat) => ({
        id: cat.id,
        label: formatTranslated(cat.name as Parameters<typeof formatTranslated>[0]),
      })),
      pagination: r.data.pagination,
    },
  }));

// ----------------------------------------------------------------------

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="text-destructive mt-1 block">
      {message}
    </Typography>
  );
}

const getTranslation = (val: any, lang: 'ar' | 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return lang === 'en' ? val : '';
  return val[lang] || '';
};

function mapScheduledBasketLineItem(it: ScheduledBasketItem) {
  const fromAlts = (it.alternatives ?? []).map((a) => a.shop_product_variant_id).filter(Boolean);
  const ids =
    it.shop_product_variant_ids && it.shop_product_variant_ids.length > 0
      ? it.shop_product_variant_ids
      : fromAlts;
  return {
    shop_product_variant_id: it.shop_product_variant_id,
    shop_product_variant_ids: ids,
    quantity: it.quantity,
    is_required: it.is_required ?? false,
    is_extra: it.is_extra ?? false,
    min_quantity: it.min_quantity ?? 0,
    max_quantity: it.max_quantity ?? 0,
  };
}

function scheduledBasketLineVariantInitialLabel(row: ScheduledBasketItem | undefined): string | undefined {
  if (!row) return undefined;
  const productName =
    row.product?.name != null
      ? typeof row.product.name === 'string'
        ? row.product.name
        : formatTranslated(row.product.name as Parameters<typeof formatTranslated>[0])
      : '';
  const variantStr = Array.isArray(row.variant)
    ? row.variant.map((value) => String(value)).filter(Boolean).join(' · ')
    : '';
  const parts = [productName, variantStr].filter(Boolean);
  if (parts.length) return parts.join(' — ');
  const spvid = row.shop_product_variant_id;
  if (spvid != null && Number(spvid) > 0) return `#${spvid}`;
  return undefined;
}

/** API may return `title` as string or { en, ar } */
function normalizeScheduleTitleFromApi(raw: unknown): { en: string; ar: string } {
  if (raw && typeof raw === 'object' && raw !== null) {
    const o = raw as { en?: string; ar?: string };
    if ('en' in o || 'ar' in o) {
      return { en: o.en ?? '', ar: o.ar ?? '' };
    }
  }
  const str = String(raw ?? '');
  return { en: str, ar: str };
}

/** Map API schedules to form rows; drops legacy rows that only linked another basket by id. */
function schedulesFromApi(source: ScheduledBasketData): ScheduledBasketFormValues['schedules'] {
  const raw = source.schedules ?? [];
  const inline = raw.filter((s: any) => {
    const legacyLink = Number(s?.scheduled_basket_id) > 0 && s?.number_of_days == null;
    return !legacyLink;
  });
  const mapped: ScheduledBasketFormValues['schedules'] = inline.map((s: any) => ({
    title: normalizeScheduleTitleFromApi(s.title),
    number_of_days: s.number_of_days ?? 1,
    discount_type: s.discount_type ?? null,
    discount_value: s.discount_value ?? null,
    is_active: Boolean(s.is_active),
    is_default: Boolean(s.is_default),
  }));
  if (mapped.length === 0) {
    return [
      {
        title: { en: '', ar: '' },
        number_of_days: 1,
        discount_type: null,
        discount_value: null,
        is_active: true,
        is_default: true,
      },
    ];
  }
  if (!mapped.some((r) => r.is_default)) {
    mapped[0].is_default = true;
  }
  let seenDefault = false;
  return mapped.map((r) => {
    if (r.is_default) {
      if (seenDefault) return { ...r, is_default: false };
      seenDefault = true;
    }
    return r;
  });
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const scheduledBasketFromState = location.state?.scheduledBasket as ScheduledBasketData | undefined;
  const isEditMode = !!id;

  const { data: scheduledBasketResponse, isLoading: isLoadingScheduledBasket } = useFetchScheduledBasketById(id || '');
  const createScheduledBasketMutation = useCreateScheduledBasket();
  const updateScheduledBasketMutation = useUpdateScheduledBasket();

  const defaultValues: ScheduledBasketFormValues = {
    category_ids: [],
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    discount: 0,
    discount_type: 'percentage',
    delivery_price: 0,
    image: null,
    images: [],
    items: [{ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 }],
    schedules: [
      {
        title: { en: '', ar: '' },
        number_of_days: 1,
        discount_type: null,
        discount_value: null,
        is_active: true,
        is_default: true,
      },
    ],
    is_active: true,
    badges: [],
  };

  const methods = useForm<ScheduledBasketFormValues>({
    resolver: zodResolver(ScheduledBasketSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, getValues, setValue, formState: { errors } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeScheduleRow,
  } = useFieldArray({ control, name: 'schedules' });
  const schedulesWatch = watch('schedules');
  const imageValue = watch('image');
  const extraImageFiles = watch('images') ?? [];
  const categoryIds = watch('category_ids') ?? [];
  const [mainCategoryId, setMainCategoryId] = useState(0);
  const mainBasketDiscountType = watch('discount_type');

  const scheduledSource = scheduledBasketResponse?.data ?? scheduledBasketFromState;
  const existingGallery = useMemo(
    () => (isEditMode && scheduledSource ? resolveBasketGalleryUrls(scheduledSource) : []),
    [isEditMode, scheduledSource]
  );
  const [fileImagePreview, setFileImagePreview] = useState<string | null>(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  useEffect(() => {
    if (!(imageValue instanceof File)) {
      setFileImagePreview(null);
      return undefined;
    }
    const u = URL.createObjectURL(imageValue);
    setFileImagePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [imageValue]);
  const extraSig = extraImageFiles.map((f) => `${f.name}:${f.size}`).join('|');
  useEffect(() => {
    if (!extraImageFiles.length) {
      setExtraImagePreviews([]);
      return undefined;
    }
    const urls = extraImageFiles.map((f) => URL.createObjectURL(f));
    setExtraImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [extraSig]);

  const basketLeafCategoryId = useMemo(() => {
    if (!isEditMode || !scheduledSource) return 0;
    const src = scheduledSource;
    const raw =
      src.category_ids?.length ? src.category_ids : src.categories?.map((c) => c.id) ?? [];
    const legacy =
      typeof src.category === 'object' && src.category && 'id' in src.category
        ? [src.category.id]
        : [];
    const ids = raw.length ? raw : legacy;
    if (!ids.length) return 0;
    const n = ids.length > 1 ? ids[ids.length - 1] : ids[0];
    return Number(n) || 0;
  }, [isEditMode, scheduledSource]);

  const { data: basketLeafCategoryResp } = useFetchCategoryById(
    basketLeafCategoryId > 0 ? basketLeafCategoryId : ''
  );

  useEffect(() => {
    setMainCategoryId(0);
  }, [id]);

  useEffect(() => {
    if (!isEditMode || basketLeafCategoryId <= 0) return;
    const d = basketLeafCategoryResp?.data;
    if (!d || Number(d.id) !== basketLeafCategoryId) return;
    const pid = d.parent_id != null && Number(d.parent_id) > 0 ? Number(d.parent_id) : null;
    setMainCategoryId(pid ?? Number(d.id));
  }, [isEditMode, basketLeafCategoryId, basketLeafCategoryResp?.data]);

  const { data: subcategoriesListResp, isLoading: isLoadingSubCats } = useFetchCategories(
    1,
    10,
    mainCategoryId > 0 ? { parent_id: mainCategoryId } : undefined,
    { enabled: mainCategoryId > 0 }
  );

  const hasChildCategories = useMemo(() => {
    if (mainCategoryId <= 0) return false;
    const items = subcategoriesListResp?.data?.items ?? [];
    const total = subcategoriesListResp?.data?.pagination?.total;
    if (typeof total === 'number') return total > 0;
    return items.length > 0;
  }, [mainCategoryId, subcategoriesListResp]);

  const childCategoryFetcher = useMemo(
    () => (page: number, limit: number) =>
      _CategoryApi.getListCategoriesPaginated({
        page,
        per_page: limit,
        parent_id: mainCategoryId,
      }).then((r) => ({
        data: {
          items: r.data.items.map((cat) => ({
            id: cat.id,
            label: formatTranslated(cat.name as Parameters<typeof formatTranslated>[0]),
          })),
          pagination: r.data.pagination,
        },
      })),
    [mainCategoryId]
  );

  const mainCategoryInitialLabel = useMemo(() => {
    if (!isEditMode || basketLeafCategoryId <= 0 || !basketLeafCategoryResp?.data) return undefined;
    const d = basketLeafCategoryResp.data;
    if (Number(d.id) !== basketLeafCategoryId) return undefined;
    const pid = d.parent_id != null && Number(d.parent_id) > 0 ? Number(d.parent_id) : null;
    if (pid && d.parent) {
      return typeof d.parent.name === 'string'
        ? d.parent.name
        : formatTranslated(d.parent.name as Parameters<typeof formatTranslated>[0]);
    }
    return formatTranslated(d.name as Parameters<typeof formatTranslated>[0]);
  }, [isEditMode, basketLeafCategoryId, basketLeafCategoryResp?.data]);

  const leafCategoryInitialLabel = useMemo(() => {
    if (!isEditMode || !scheduledSource || basketLeafCategoryId <= 0) return undefined;
    const cat = scheduledSource.categories?.find((c) => Number(c.id) === basketLeafCategoryId);
    if (!cat?.name) return undefined;
    return formatTranslated(cat.name as Parameters<typeof formatTranslated>[0]);
  }, [isEditMode, scheduledSource, basketLeafCategoryId]);

  useEffect(() => {
    if (mainCategoryId <= 0 || isLoadingSubCats) return;
    if (!hasChildCategories) {
      setValue('category_ids', [mainCategoryId], { shouldValidate: true });
    }
  }, [mainCategoryId, hasChildCategories, isLoadingSubCats, setValue]);

  const { data: shopVariantListResponse } = useQuery({
    queryKey: ['shopProductVariant', 'scheduled-basket', 'multi-options', categoryIds.join(',')],
    queryFn: () =>
      categoryIds.length === 1
        ? _ShopProductVariantApi.getList({ page: 1, per_page: 500, category_id: categoryIds[0] })
        : categoryIds.length > 1
          ? _ShopProductVariantApi.getList({
              page: 1,
              per_page: 500,
              category_ids: categoryIds,
            })
          : Promise.resolve({
            status: true,
            message: '',
            data: {
              items: [],
              pagination: {
                current_page: 1,
                last_page: 1,
                per_page: 500,
                total: 0,
              },
            },
          }),
  });

  const shopVariantMultiOptions = useMemo(() => {
    const items = shopVariantListResponse?.data?.items ?? [];
    return items.map((v) => ({
      value: v.id,
      label: typeof v.label === 'string' ? v.label : formatTranslated(v.label as Parameters<typeof formatTranslated>[0]),
      imageUrl: shopVariantOptionImage(v),
      colorHex: shopVariantOptionColorHex(v),
    }));
  }, [shopVariantListResponse?.data?.items]);

  const handleRemoveScheduleRow = (index: number) => {
    const wasDefault = getValues(`schedules.${index}.is_default`);
    removeScheduleRow(index);
    window.setTimeout(() => {
      const next = getValues('schedules');
      if (next.length && wasDefault && !next.some((r) => r.is_default)) {
        setValue('schedules.0.is_default', true);
      }
    }, 0);
  };

  const setScheduleAsDefault = (index: number) => {
    const rows = getValues('schedules');
    rows.forEach((_, i) => {
      setValue(`schedules.${i}.is_default`, i === index);
    });
  };

  useEffect(() => {
    const source = isEditMode ? (scheduledBasketResponse?.data ?? scheduledBasketFromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      const combinedLines = [...(source.items ?? []), ...(source.extras ?? [])];
      const idsFromPivot =
        source.category_ids?.length ? source.category_ids : source.categories?.map((c) => c.id) ?? [];
      const legacyId =
        typeof source.category === 'object' && source.category && 'id' in source.category
          ? source.category.id
          : undefined;
      const rawIds =
        idsFromPivot.length > 0 ? idsFromPivot : legacyId != null ? [legacyId] : [];
      const leafNum =
        rawIds.length > 1 ? Number(rawIds[rawIds.length - 1]) : rawIds[0] != null ? Number(rawIds[0]) : 0;
      const category_ids = leafNum > 0 ? [leafNum] : [];

      reset({
        category_ids,
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        description: {
          en: getTranslation(source.description, 'en'),
          ar: getTranslation(source.description, 'ar'),
        },
        discount: Number(source.discount) || 0,
        discount_type: source.discount_type || 'percentage',
        delivery_price: source.delivery_price || 0,
        image: null,
        images: [],
        items: combinedLines.length
          ? combinedLines.map(mapScheduledBasketLineItem)
          : [{ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 }],
        schedules: schedulesFromApi(source),
        is_active: Boolean((source as any).is_active),
        badges: badgesFormValueFromScheduledBasketResponse(source),
      });
    }
  }, [scheduledBasketResponse?.data, scheduledBasketFromState, isEditMode, reset]);

  const isSubmitting = createScheduledBasketMutation.isPending || updateScheduledBasketMutation.isPending;
  const errorMessage = createScheduledBasketMutation.error?.message || updateScheduledBasketMutation.error?.message || null;

  const onSubmit = async (data: ScheduledBasketFormValues) => {
    try {
      const image =
        data.image instanceof File ? await compressImage(data.image) : data.image;
      const images = data.images?.length
        ? await Promise.all(
            data.images.map((f) => (f instanceof File ? compressImage(f) : f))
          )
        : undefined;
      const payload: ScheduledBasketCreateUpdatePayload = {
        category_ids: data.category_ids,
        category_id: data.category_ids[0],
        name: data.name,
        description: data.description,
        discount: data.discount,
        discount_type: data.discount_type,
        delivery_price: data.delivery_price,
        image,
        images,
        items: data.items,
        schedules: data.schedules.map((s) => ({
          title: s.title,
          number_of_days: s.number_of_days,
          discount_type: s.discount_type ?? null,
          discount_value: s.discount_value ?? null,
          is_active: s.is_active,
          is_default: s.is_default,
        })),
        is_active: data.is_active,
        badges: data.badges,
      };
      if (isEditMode && id) {
        await updateScheduledBasketMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.scheduledBasketUpdatedSuccess'));
      } else {
        await createScheduledBasketMutation.mutateAsync(payload);
        toast.success(t('form.scheduledBasketCreatedSuccess'));
      }
      navigate('/scheduled-baskets');
    } catch (error: any) {
      console.error('Error saving scheduled basket:', error);
    }
  };

  const handleCancel = () => navigate('/scheduled-baskets');

  if (isEditMode && isLoadingScheduledBasket && !scheduledBasketFromState) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.scheduledBasketEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.scheduledBasketCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editScheduledBasket') : t('form.createScheduledBasket')}
        description={
          isEditMode ? t('form.editScheduledBasketDesc') : t('form.createScheduledBasketDesc')
        }
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingScheduledBasket}
        loadingText={t('form.loadingScheduledBasket')}
        submitLabel={
          isEditMode ? t('form.updateScheduledBasket') : t('form.createScheduledBasketSubmit')
        }
        submittingLabel={
          isEditMode ? t('form.updatingScheduledBasket') : t('form.creatingScheduledBasket')
        }
      >
        {/* ── Section: Category & Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-5-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryLabel')} · {t('columns.name')} · {t('columns.description')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box className="group space-y-4">
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:folder-bold" className="text-violet-500" width={16} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productMainCategory')}
                  </Typography>
                </Box>
                <InfiniteScrollSelect
                  value={mainCategoryId}
                  onChange={(val) => {
                    setMainCategoryId(val);
                    setValue('category_ids', []);
                    setValue('items', [
                      {
                        shop_product_variant_id: 0,
                        quantity: 1,
                        shop_product_variant_ids: [],
                        is_required: false,
                        is_extra: false,
                        min_quantity: 0,
                        max_quantity: 0,
                      },
                    ]);
                  }}
                  queryKey={['categories', 'infinite', 'scheduled-basket-form', 'roots']}
                  fetcher={mainCategoryFetcher}
                  placeholder={t('form.selectMainCategory')}
                  initialLabel={mainCategoryInitialLabel}
                />
              </Box>
              {hasChildCategories ? (
                <Box className="group">
                  <Label className="text-sm font-medium mb-1 block text-foreground">
                    {t('form.productSubcategory')}
                  </Label>
                  <InfiniteScrollSelect
                    value={categoryIds[0] ?? 0}
                    onChange={(leafId) => {
                      const n = Number(leafId) || 0;
                      setValue('category_ids', n > 0 ? [n] : [], { shouldValidate: true });
                      setValue('items', [
                        {
                          shop_product_variant_id: 0,
                          quantity: 1,
                          shop_product_variant_ids: [],
                          is_required: false,
                          is_extra: false,
                          min_quantity: 0,
                          max_quantity: 0,
                        },
                      ]);
                    }}
                    queryKey={['categories', 'infinite', 'scheduled-basket-form', 'children', mainCategoryId]}
                    fetcher={childCategoryFetcher}
                    placeholder={t('form.selectSubcategory')}
                    initialLabel={leafCategoryInitialLabel}
                    disabled={!mainCategoryId}
                  />
                </Box>
              ) : mainCategoryId > 0 && !isLoadingSubCats ? (
                <Typography variant="caption" className="text-muted-foreground block">
                  {t('form.productCategoryUsesMainOnly')}
                </Typography>
              ) : null}
              {errors.category_ids?.message ? (
                <Typography variant="caption" className="text-destructive block">
                  {String(errors.category_ids.message)}
                </Typography>
              ) : null}
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box className="group">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:text-bold" className="text-violet-500" width={16} />
                  {t('form.nameEn')}
                </Typography>
                <RHFTextField name="name.en" placeholder={t('form.basketNameEn')} fullWidth />
              </Box>
              <Box className="group">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:text-bold" className="text-violet-500" width={16} />
                  {t('form.nameAr')}
                </Typography>
                <RHFTextField name="name.ar" placeholder={t('form.basketNameAr')} dir="rtl" fullWidth />
              </Box>
            </Box>

            <Box className="border-t border-border pt-5 mt-2 space-y-5">
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescAr')}
                  </Typography>
                </Box>
                <Controller
                  name="description.ar"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescArPlaceholder')}
                        dir="rtl"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              </Box>

              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescEn')}
                  </Typography>
                </Box>
                <Controller
                  name="description.en"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescPlaceholder')}
                        dir="ltr"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Pricing & Image ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.discountType')} · {t('form.deliveryPrice')} · {t('form.basketImage')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:percent-bold" className="text-amber-500" width={16} />
                {t('form.discountType')}
              </Typography>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="percentage">{t('form.percentageDiscount')}</option>
                    <option value="fixed">{t('form.fixedDiscount')}</option>
                  </select>
                )}
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={16} />
                {t('form.discountValue')}
              </Typography>
              <RHFTextField name="discount" type="number" placeholder={t('form.placeholderZero')} fullWidth min={0} max={mainBasketDiscountType === 'percentage' ? 100 : undefined} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:delivery-bold" className="text-amber-500" width={16} />
                {t('form.deliveryPrice')}
              </Typography>
              <RHFTextField name="delivery_price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box className="group md:col-span-2">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.basketImage')}</Typography>
              </Box>
              {isEditMode && existingGallery.length > 0 && (
                <Box className="mb-3 flex flex-wrap gap-2">
                  {existingGallery.map((u) => (
                    <img key={u} src={u} alt="" className="h-16 w-16 rounded-lg border border-border/60 object-cover" />
                  ))}
                </Box>
              )}
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                  <div className="w-full">
                    <Input
                      {...field}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={(e) => { const file = e.target.files?.[0]; onChange(file || null); }}
                      error={!!error}
                      helperText={error?.message || t('form.basketImageHelperPrimary')}
                      fullWidth
                    />
                    {(() => {
                      const displaySrc =
                        fileImagePreview ||
                        (!(value instanceof File) && isEditMode
                          ? scheduledBasketResponse?.data?.image || scheduledBasketFromState?.image || existingGallery[0]
                          : null);
                      return displaySrc ? (
                        <Box className="mt-3">
                          <Box className="relative inline-block">
                            <Box className="absolute -inset-1 rounded-xl bg-amber-500/20 blur-sm" />
                            <img src={displaySrc} alt="" className="relative max-h-32 max-w-xs object-cover rounded-xl border border-border/60 shadow-sm" />
                          </Box>
                        </Box>
                      ) : null;
                    })()}
                  </div>
                )}
              />
              <Typography variant="caption" className="mt-2 block text-muted-foreground">
                {t('form.basketAdditionalImagesLabel')}
              </Typography>
              <Controller
                name="images"
                control={control}
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                  <div className="w-full">
                    <Input
                      {...field}
                      value=""
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      multiple
                      onChange={(e) => onChange(e.target.files ? Array.from(e.target.files) : [])}
                      error={!!error}
                      helperText={error?.message || t('form.basketAdditionalImagesHelper')}
                      fullWidth
                    />
                    {extraImagePreviews.length > 0 && (
                      <Box className="mt-2 flex flex-wrap gap-2">
                        {extraImagePreviews.map((u, i) => (
                          <img key={`${u}-${i}`} src={u} alt="" className="h-16 w-16 rounded-lg border border-border/60 object-cover" />
                        ))}
                      </Box>
                    )}
                  </div>
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">{t('form.basketActiveHelper')}</Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ── Section: Delivery Schedules ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:calendar-bold" className="text-sky-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.scheduleSection')}</Typography>
            </Box>
            <Button type="button" variant="outlined" size="small"
              onClick={() => appendSchedule({ title: { en: '', ar: '' }, number_of_days: 1, discount_type: null, discount_value: null, is_active: true, is_default: false })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addSchedule')}
            </Button>
          </Box>
          <Box className="p-6 flex flex-col gap-4">
            {scheduleFields.map((scheduleField, index) => {
              const rowDiscountType = schedulesWatch?.[index]?.discount_type;
              return (
                <Box key={scheduleField.id} className="rounded-xl border border-border/40 bg-background/60 overflow-hidden">
                  <Box className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/30">
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.scheduledBasketScheduleHeading', { number: index + 1 })}
                    </Typography>
                    {scheduleFields.length > 1 && (
                      <Button type="button" variant="text" onClick={() => handleRemoveScheduleRow(index)} className="text-destructive">
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </Button>
                    )}
                  </Box>
                  <Box className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Box className="group">
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.scheduleTitleEn')}</Typography>
                      <RHFTextField name={`schedules.${index}.title.en`} placeholder={t('form.scheduleTitleEnPlaceholder')} fullWidth />
                    </Box>
                    <Box className="group">
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.scheduleTitleAr')}</Typography>
                      <RHFTextField name={`schedules.${index}.title.ar`} placeholder={t('form.scheduleTitleArPlaceholder')} dir="rtl" fullWidth />
                    </Box>
                    <Box className="group">
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.numberOfDays')}</Typography>
                      <RHFTextField name={`schedules.${index}.number_of_days`} type="number" placeholder={t('form.placeholderOne')} fullWidth />
                      <Typography variant="caption" className="text-muted-foreground mt-1">{t('form.numberOfDaysHelper')}</Typography>
                    </Box>
                    <Box className="group">
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.scheduleDiscountType')}</Typography>
                      <Controller
                        name={`schedules.${index}.discount_type`}
                        control={control}
                        render={({ field }) => (
                          <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">{t('form.noDiscount')}</option>
                            <option value="percentage">{t('form.percentageDiscount')}</option>
                            <option value="fixed">{t('form.fixedDiscount')}</option>
                          </select>
                        )}
                      />
                    </Box>
                    {rowDiscountType ? (
                      <Box className="group">
                        <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.scheduleDiscountValue')}</Typography>
                        <RHFTextField
                          name={`schedules.${index}.discount_value`}
                          type="number"
                          placeholder={rowDiscountType === 'percentage' ? t('form.scheduleDiscountPlaceholderPercentage') : t('form.scheduleDiscountPlaceholderFixed')}
                          fullWidth min={0} max={rowDiscountType === 'percentage' ? 100 : undefined}
                        />
                      </Box>
                    ) : null}
                    <Box className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Controller
                        name={`schedules.${index}.is_active`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                            <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                            <Box>
                              <Typography variant="subtitle2" className="font-semibold text-foreground text-sm">{t('form.scheduleActive')}</Typography>
                              <Typography variant="caption" className="text-muted-foreground">{t('form.scheduleActiveHelper')}</Typography>
                            </Box>
                          </div>
                        )}
                      />
                      <Controller
                        name={`schedules.${index}.is_default`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                            <Switch checked={field.value} onChange={(e) => {
                              const on = (e.target as HTMLInputElement).checked;
                              if (on) { setScheduleAsDefault(index); } else {
                                field.onChange(false);
                                window.setTimeout(() => {
                                  const next = getValues('schedules');
                                  if (next.length && !next.some((r) => r.is_default)) {
                                    const other = next.findIndex((_, i) => i !== index);
                                    if (other >= 0) setValue(`schedules.${other}.is_default`, true);
                                  }
                                }, 0);
                              }
                            }} />
                            <Box>
                              <Typography variant="subtitle2" className="font-semibold text-foreground text-sm">{t('form.scheduledBasketDetailScheduleDefault')}</Typography>
                              <Typography variant="caption" className="text-muted-foreground">{t('form.scheduleDefaultHelper')}</Typography>
                            </Box>
                          </div>
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Section: Items ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <Box className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:box-bold" className="text-rose-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.basketItems')}</Typography>
            </Box>
            <Button type="button" variant="outlined" size="small"
              onClick={() => append({ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addItem')}
            </Button>
          </Box>
          <Box className="p-6 flex flex-col gap-4">
            {fields.map((field, index) => (
              <Box key={field.id} className="rounded-xl border border-border/40 bg-background/60 overflow-hidden">
                <Box className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/30">
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.scheduledBasketItemHeading', { number: index + 1 })}
                  </Typography>
                  {fields.length > 1 && (
                    <Button type="button" variant="text" onClick={() => remove(index)} className="text-destructive">
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </Button>
                  )}
                </Box>
                <Box className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="md:col-span-2">
                    <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.primaryVariant')}</Typography>
                    <Controller
                      name={`items.${index}.shop_product_variant_id`}
                      control={control}
                      render={({ field: f }) => {
                        const src = scheduledBasketResponse?.data ?? scheduledBasketFromState;
                        const apiLines = [...(src?.items ?? []), ...(src?.extras ?? [])];
                        const lineFromApi = Array.isArray(apiLines) ? apiLines[index] : undefined;
                        return (
                          <InfiniteScrollSelect
                            value={Number(f.value) || 0}
                            onChange={(variantId) => f.onChange(Number(variantId) || 0)}
                            queryKey={['shopProductVariant', 'scheduled-basket', 'line', index, categoryIds.join(',')]}
                            fetcher={(page, limit) => {
                              const perPage = limit ?? 10;
                              if (!categoryIds.length) {
                                return Promise.resolve({ data: { items: page === 1 ? [{ id: 0, label: t('form.selectCategoryBeforeVariants') }] : [], pagination: { current_page: page, last_page: page, per_page: perPage, total: 0 } } });
                              }
                              if (categoryIds.length === 1) {
                                return _ShopProductVariantApi.getList({ page, per_page: perPage, category_id: categoryIds[0] });
                              }
                              return _ShopProductVariantApi.getList({
                                page,
                                per_page: perPage,
                                category_ids: categoryIds,
                              });
                            }}
                            placeholder={t('form.variantId')}
                            initialLabel={scheduledBasketLineVariantInitialLabel(lineFromApi)}
                            initialImage={resolveStorageImageUrl(
                              lineFromApi?.variant_image ?? lineFromApi?.product?.image
                            )}
                            getOptionImage={(item) => shopVariantOptionImage(item)}
                            getOptionColorHex={(item) => shopVariantOptionColorHex(item)}
                            disabled={categoryIds.length === 0}
                          />
                        );
                      }}
                    />
                  </Box>
                  <Box className="grid grid-cols-3 gap-3 md:col-span-2">
                    <Box>
                      <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.quantity')}</Typography>
                      <RHFTextField name={`items.${index}.quantity`} placeholder={t('form.placeholderOne')} type="number" fullWidth />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.minQuantity')}</Typography>
                      <RHFTextField name={`items.${index}.min_quantity`} placeholder={t('form.placeholderZero')} type="number" fullWidth />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.maxQuantity')}</Typography>
                      <RHFTextField name={`items.${index}.max_quantity`} placeholder={t('form.placeholderZero')} type="number" fullWidth />
                    </Box>
                  </Box>
                  <Box className="md:col-span-2">
                    <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.alternativeScheduledBaskets')}</Typography>
                    <Controller
                      name={`items.${index}.shop_product_variant_ids`}
                      control={control}
                      render={({ field: f }) => {
                        const ids = Array.isArray(f.value) ? f.value.filter(Boolean).map(Number) : [];
                        const extraOpts = ids.filter((v) => !shopVariantMultiOptions.some((o) => Number(o.value) === v)).map((v) => ({ value: v, label: `#${v}` }));
                        const options = [...extraOpts, ...shopVariantMultiOptions];
                        return (
                          <MultiSelect
                            options={options} value={ids}
                            onChange={(vals) => f.onChange((vals as (string | number)[]).map((x) => Number(x)))}
                            placeholder={categoryIds.length === 0 ? t('form.selectCategoryBeforeVariants') : t('form.alternativeScheduledBasketsPlaceholder')}
                            noOptionsMessage={t('noOptionsFound')} fullWidth isDisabled={categoryIds.length === 0}
                            showOptionImages
                          />
                        );
                      }}
                    />
                  </Box>
                  <Box className="md:col-span-2 flex flex-wrap gap-4">
                    <Controller name={`items.${index}.is_required`} control={control}
                      render={({ field: f }) => (
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 flex-1 min-w-[140px]">
                          <Switch checked={f.value} onChange={(e) => f.onChange((e.target as HTMLInputElement).checked)} />
                          <Typography variant="body2">{t('form.isRequired')}</Typography>
                        </div>
                      )}
                    />
                    <Controller name={`items.${index}.is_extra`} control={control}
                      render={({ field: f }) => (
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 flex-1 min-w-[140px]">
                          <Switch checked={f.value} onChange={(e) => f.onChange((e.target as HTMLInputElement).checked)} />
                          <Typography variant="body2">{t('form.isExtra')}</Typography>
                        </div>
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Section: Badges ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.badgesLabel')}</Typography>
          </Box>
          <Box className="p-6">
            <RHFBadgeSelector name="badges" label={t('form.badgesLabel')} />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
