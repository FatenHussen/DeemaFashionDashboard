import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { compressImage } from '@/utils/compress-image';
import { formatTranslated } from '@/utils/format-translated';
import { resolveBasketGalleryUrls } from '@/utils/basket-gallery';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { _ScheduleApi } from '@/pages/dashboard/schedules/api/schedule.services';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import { schedulePrimaryImageUrl } from '@/pages/dashboard/schedules/utils/schedule-media';
import {
  useFetchSchedules,
  useFetchScheduleById,
} from '@/pages/dashboard/schedules/hooks/schedule';
import {
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';
import {
  ScheduledBasketItemCard,
  emptyScheduledBasketLineItem,
} from '@/pages/dashboard/baskets/components/scheduled-basket-item-card';
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
  scheduleNameLabel,
  scheduleSelectLabel,
  formatScheduleDiscount,
  resolveScheduledBasketScheduleId,
} from '@/pages/dashboard/baskets/utils/scheduled-basket-schedule';
import {
  type ScheduledBasketData,
  type ScheduledBasketItem,
  type ScheduledBasketCreateUpdatePayload,
  badgesFormValueFromScheduledBasketResponse,
} from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { paths } from 'src/routes/paths';

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

function StepBadge({ step }: { step: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
      {step}
    </span>
  );
}

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
    min_quantity: it.min_quantity && it.min_quantity > 0 ? it.min_quantity : undefined,
    max_quantity: it.max_quantity && it.max_quantity > 0 ? it.max_quantity : undefined,
  };
}

const scheduleCatalogFetcher = (page: number, limit: number) =>
  _ScheduleApi.getList({ page, per_page: limit, is_active: true }).then((r) => ({
    data: {
      items: r.data.items.map((s) => ({
        id: s.id,
        label: scheduleSelectLabel(s),
      })),
      pagination: r.data.pagination,
    },
  }));

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
    schedule_id: 0,
    has_custom_discount: false,
    discount: undefined,
    discount_type: 'percentage',
    delivery_price: 0,
    image: null,
    images: [],
    items: [emptyScheduledBasketLineItem()],
    is_active: true,
    badges: [],
  };

  const methods = useForm<ScheduledBasketFormValues>({
    resolver: zodResolver(ScheduledBasketSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue, formState: { errors } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const imageValue = watch('image');
  const extraImageFiles = watch('images') ?? [];
  const categoryIds = watch('category_ids') ?? [];
  const scheduleId = Number(watch('schedule_id') || 0);
  const hasCustomDiscount = Boolean(watch('has_custom_discount'));
  const [mainCategoryId, setMainCategoryId] = useState(0);
  const mainBasketDiscountType = watch('discount_type');
  const { data: catalogScheduleResponse } = useFetchScheduleById(scheduleId > 0 ? scheduleId : '');
  const catalogSchedule = catalogScheduleResponse?.data;
  const { data: activeSchedulesCheck } = useFetchSchedules({ page: 1, per_page: 1, is_active: true });
  const hasActiveSchedules =
    (activeSchedulesCheck?.data?.pagination?.total ?? activeSchedulesCheck?.data?.items?.length ?? 0) > 0;
  const selectedScheduleImage = catalogSchedule ? schedulePrimaryImageUrl(catalogSchedule) : null;

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
      const hasCustom = Boolean(source.has_custom_discount);

      reset({
        category_ids,
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        description: {
          en: getTranslation(source.description, 'en'),
          ar: getTranslation(source.description, 'ar'),
        },
        schedule_id: resolveScheduledBasketScheduleId(source),
        has_custom_discount: hasCustom,
        discount: hasCustom ? Number(source.discount) || 0 : undefined,
        discount_type: source.discount_type || 'percentage',
        delivery_price: source.delivery_price || 0,
        image: null,
        images: [],
        items: combinedLines.length
          ? combinedLines.map(mapScheduledBasketLineItem)
          : [emptyScheduledBasketLineItem()],
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
        schedule_id: data.schedule_id,
        delivery_price: data.delivery_price,
        image,
        images,
        items: data.items.map((item) => ({
          ...item,
          shop_product_variant_ids: (item.shop_product_variant_ids ?? []).filter(
            (variantId) => variantId > 0 && variantId !== item.shop_product_variant_id
          ),
          min_quantity: item.min_quantity && item.min_quantity > 0 ? item.min_quantity : undefined,
          max_quantity: item.max_quantity && item.max_quantity > 0 ? item.max_quantity : undefined,
        })),
        is_active: data.is_active,
        badges: data.badges,
      };
      if (data.has_custom_discount) {
        payload.discount = data.discount ?? 0;
        payload.discount_type = data.discount_type ?? 'percentage';
      } else if (isEditMode) {
        payload.discount = null;
        payload.discount_type = null;
      }
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
        {/* ── 1. Schedule category ── */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <StepBadge step={1} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.scheduledBasketStepSchedule')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => window.open(`${paths.dashboard.schedules}/create`, '_blank')}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.openSchedulesCatalog')}
            </Button>
          </Box>
          <Box className="p-6 space-y-5">
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.catalogScheduleHelper')}
            </Typography>
            {!hasActiveSchedules && activeSchedulesCheck ? (
              <Box className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                {t('form.scheduledBasketNoSchedules')}
              </Box>
            ) : null}
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">
                {t('form.scheduleLabel')} *
              </Typography>
              <Controller
                name="schedule_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <InfiniteScrollSelect
                      value={Number(field.value) || 0}
                      onChange={(val) => field.onChange(Number(val) || 0)}
                      queryKey={['schedules', 'infinite', 'scheduled-basket-form', 'active']}
                      fetcher={scheduleCatalogFetcher}
                      placeholder={t('form.selectScheduleCategory')}
                      initialLabel={
                        scheduledSource?.schedule
                          ? scheduleSelectLabel(scheduledSource.schedule)
                          : catalogSchedule
                            ? scheduleSelectLabel(catalogSchedule)
                            : undefined
                      }
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
            {catalogSchedule ? (
              <Box className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-4">
                {selectedScheduleImage ? (
                  <img
                    src={selectedScheduleImage}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover border border-border/60 shrink-0"
                  />
                ) : (
                  <Box className="h-16 w-16 rounded-full bg-muted border border-border/60 shrink-0 flex items-center justify-center">
                    <Iconify icon="solar:calendar-bold" className="text-sky-500" width={28} />
                  </Box>
                )}
                <Box className="min-w-0 flex-1">
                  <Typography variant="subtitle1" className="font-semibold">
                    {scheduleNameLabel(catalogSchedule.name)}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {t('form.scheduledBasketRepeatEvery', { count: catalogSchedule.interval_days })}
                    {formatScheduleDiscount(catalogSchedule)
                      ? ` · ${t('form.scheduleInheritedDiscount')}: ${formatScheduleDiscount(catalogSchedule)}`
                      : ''}
                  </Typography>
                </Box>
              </Box>
            ) : null}
            <Controller
              name="has_custom_discount"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground text-sm">
                      {t('form.scheduleCustomDiscount')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.scheduleCustomDiscountHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
            {hasCustomDiscount ? (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">
                    {t('form.discountType')}
                  </Typography>
                  <Controller
                    name="discount_type"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <select
                          value={field.value ?? 'percentage'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="percentage">{t('form.percentageDiscount')}</option>
                          <option value="fixed">{t('form.fixedDiscount')}</option>
                        </select>
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                </Box>
                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">
                    {t('form.discountValue')}
                  </Typography>
                  <RHFTextField
                    name="discount"
                    type="number"
                    placeholder={t('form.placeholderZero')}
                    fullWidth
                    min={0}
                    max={mainBasketDiscountType === 'percentage' ? 100 : undefined}
                  />
                </Box>
              </Box>
            ) : (
              <Typography variant="caption" className="text-muted-foreground block">
                {t('form.inheritScheduleDiscount')}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── 2. Category & Names ── */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <StepBadge step={2} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduledBasketStepDetails')}
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
                    setValue('items', [emptyScheduledBasketLineItem()]);
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
                      setValue('items', [emptyScheduledBasketLineItem()]);
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
          </Box>
        </Box>

        {/* ── 3. Pricing & Image ── */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <StepBadge step={3} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduledBasketStepMedia')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
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
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
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

        {/* ── 4. Items ── */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <StepBadge step={4} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.scheduledBasketStepItems')}
              </Typography>
            </Box>
            <Button type="button" variant="outlined" size="small"
              onClick={() => append(emptyScheduledBasketLineItem())}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addItem')}
            </Button>
          </Box>
          <Box className="p-6 flex flex-col gap-4">
            {fields.map((field, index) => {
              const src = scheduledBasketResponse?.data ?? scheduledBasketFromState;
              const apiLines = [...(src?.items ?? []), ...(src?.extras ?? [])];
              const lineFromApi = Array.isArray(apiLines) ? apiLines[index] : undefined;
              return (
                <ScheduledBasketItemCard
                  key={field.id}
                  index={index}
                  control={control}
                  categoryIds={categoryIds}
                  lineFromApi={lineFromApi}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(index)}
                  t={t}
                />
              );
            })}
          </Box>
        </Box>

        {/* ── 5. Description, visibility, badges ── */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <StepBadge step={5} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduledBasketStepExtra')}
            </Typography>
          </Box>
          <Box className="p-6 space-y-5">
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
                      height={200}
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
                      height={200}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('active')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.basketActiveHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
            <RHFBadgeSelector name="badges" label={t('form.badgesLabel')} />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
