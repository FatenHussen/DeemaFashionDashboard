import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { MultiSelect } from '@/shared/ui/multi-select';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
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
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

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
    is_active: s.is_active ?? true,
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
    category_id: 0,
    name: { en: '', ar: '' },
    discount: 0,
    discount_type: 'percentage',
    delivery_price: 0,
    image: null,
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

  const { handleSubmit, reset, control, watch, getValues, setValue } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeScheduleRow,
  } = useFieldArray({ control, name: 'schedules' });
  const schedulesWatch = watch('schedules');
  const imageValue = watch('image');

  const { data: shopVariantListResponse } = useQuery({
    queryKey: ['shopProductVariant', 'scheduled-basket', 'multi-options'],
    queryFn: () => _ShopProductVariantApi.getList({ page: 1, per_page: 500 }),
  });

  const shopVariantMultiOptions = useMemo(() => {
    const items = shopVariantListResponse?.data?.items ?? [];
    return items.map((v) => ({ value: v.id, label: v.label }));
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

  const [fileImagePreview, setFileImagePreview] = useState<string | null>(null);
  useEffect(() => {
    if (!(imageValue instanceof File)) {
      setFileImagePreview(null);
      return undefined;
    }
    const u = URL.createObjectURL(imageValue);
    setFileImagePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [imageValue]);

  useEffect(() => {
    const source = isEditMode ? (scheduledBasketResponse?.data ?? scheduledBasketFromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      const combinedLines = [...(source.items ?? []), ...(source.extras ?? [])];
      reset({
        category_id: source.category?.id || 0,
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        discount: Number(source.discount) || 0,
        discount_type: source.discount_type || 'percentage',
        delivery_price: source.delivery_price || 0,
        image: null,
        items: combinedLines.length
          ? combinedLines.map(mapScheduledBasketLineItem)
          : [{ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 }],
        schedules: schedulesFromApi(source),
        is_active: (source as any).is_active !== undefined ? Boolean((source as any).is_active) : true,
        badges: badgesFormValueFromScheduledBasketResponse(source),
      });
    }
  }, [scheduledBasketResponse?.data, scheduledBasketFromState, isEditMode, reset]);

  const isSubmitting = createScheduledBasketMutation.isPending || updateScheduledBasketMutation.isPending;
  const errorMessage = createScheduledBasketMutation.error?.message || updateScheduledBasketMutation.error?.message || null;

  const onSubmit = async (data: ScheduledBasketFormValues) => {
    try {
      const payload: ScheduledBasketCreateUpdatePayload = {
        category_id: data.category_id,
        name: data.name,
        discount: data.discount,
        discount_type: data.discount_type,
        delivery_price: data.delivery_price,
        image: data.image,
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
        maxWidth="2xl"
        submitLabel={
          isEditMode ? t('form.updateScheduledBasket') : t('form.createScheduledBasketSubmit')
        }
        submittingLabel={
          isEditMode ? t('form.updatingScheduledBasket') : t('form.creatingScheduledBasket')
        }
      >
        {/* Category */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.categoryLabel')}</Typography>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <InfiniteScrollSelect
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val)}
                queryKey={['category', 'scheduled-basket']}
                fetcher={(page) =>
                  _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                    data: {
                      items:
                        page === 1
                          ? [
                              { id: 0, label: t('form.selectCategoryPlaceholder') },
                              ...res.data.items.map((c: any) => ({
                                id: c.id,
                                label: typeof c.name === 'object' ? c.name : c.name || '',
                              })),
                            ]
                          : res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' })),
                      pagination: res.data.pagination,
                    },
                  }))
                }
                placeholder={t('form.selectCategoryPlaceholder')}
                initialLabel={(() => {
                  const src = scheduledBasketResponse?.data ?? scheduledBasketFromState;
                  const cat = src?.category;
                  return cat?.name ? (typeof cat.name === 'object' ? (cat.name as any)?.en || (cat.name as any)?.ar : cat.name) : undefined;
                })()}
              />
            )}
          />
        </Box>

        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
          <RHFTextField name="name.en" placeholder={t('form.basketNameEn')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
          <RHFTextField name="name.ar" placeholder={t('form.basketNameAr')} dir="rtl" fullWidth />
        </Box>

        {/* Discount */}
        <Box className="flex flex-wrap gap-4">
          <Box className="min-w-[140px] flex-1">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountType')}</Typography>
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
          <Box className="min-w-[140px] flex-1">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountValue')}</Typography>
            <RHFTextField name="discount" type="number" placeholder={t('form.placeholderZero')} fullWidth />
          </Box>
        </Box>

        {/* Delivery Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.deliveryPrice')}</Typography>
          <RHFTextField name="delivery_price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Basket image (optional, multipart) */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.basketImage')}
            </Typography>
          </Box>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file || null);
                  }}
                  error={!!error}
                  helperText={error?.message || t('form.basketImageHelper')}
                  fullWidth
                />
                {(() => {
                  const displaySrc =
                    fileImagePreview ||
                    (!(imageValue instanceof File) &&
                      (scheduledBasketResponse?.data?.image || scheduledBasketFromState?.image));
                  return displaySrc ? (
                    <Box className="mt-4">
                      <img src={displaySrc} alt="" className="max-h-40 max-w-xs object-cover rounded-lg border border-border/60" />
                    </Box>
                  ) : null;
                })()}
              </div>
            )}
          />
        </Box>

        {/* Delivery schedules — `schedules[]` in API (title, number_of_days, discounts, is_default, …) */}
        <Box className="rounded-xl border border-border p-4 space-y-4">
          <Box className="mb-2 flex items-center justify-between gap-2">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.scheduleSection')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                appendSchedule({
                  title: { en: '', ar: '' },
                  number_of_days: 1,
                  discount_type: null,
                  discount_value: null,
                  is_active: true,
                  is_default: false,
                })
              }
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addSchedule')}
            </Button>
          </Box>

          {scheduleFields.map((scheduleField, index) => {
            const rowDiscountType = schedulesWatch?.[index]?.discount_type;
            return (
              <Box key={scheduleField.id} className="rounded-xl border border-border/50 p-4 space-y-4">
                <Box className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-muted-foreground">
                    {t('form.scheduledBasketScheduleHeading', { number: index + 1 })}
                  </Typography>
                  {scheduleFields.length > 1 && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => handleRemoveScheduleRow(index)}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </Button>
                  )}
                </Box>

                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                    {t('form.scheduleTitleEn')}
                  </Typography>
                  <RHFTextField name={`schedules.${index}.title.en`} placeholder={t('form.scheduleTitleEnPlaceholder')} fullWidth />
                </Box>

                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                    {t('form.scheduleTitleAr')}
                  </Typography>
                  <RHFTextField name={`schedules.${index}.title.ar`} placeholder={t('form.scheduleTitleArPlaceholder')} dir="rtl" fullWidth />
                </Box>

                <Box className="group">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                    {t('form.numberOfDays')}
                  </Typography>
                  <RHFTextField name={`schedules.${index}.number_of_days`} type="number" placeholder={t('form.placeholderOne')} fullWidth />
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    {t('form.numberOfDaysHelper')}
                  </Typography>
                </Box>

                <Box className="flex flex-wrap gap-4">
                  <Box className="min-w-[140px] flex-1">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                      {t('form.scheduleDiscountType')}
                    </Typography>
                    <Controller
                      name={`schedules.${index}.discount_type`}
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">{t('form.noDiscount')}</option>
                          <option value="percentage">{t('form.percentageDiscount')}</option>
                          <option value="fixed">{t('form.fixedDiscount')}</option>
                        </select>
                      )}
                    />
                  </Box>
                  {rowDiscountType ? (
                    <Box className="min-w-[140px] flex-1">
                      <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                        {t('form.scheduleDiscountValue')}
                      </Typography>
                      <RHFTextField
                        name={`schedules.${index}.discount_value`}
                        type="number"
                        placeholder={
                          rowDiscountType === 'percentage'
                            ? t('form.scheduleDiscountPlaceholderPercentage')
                            : t('form.scheduleDiscountPlaceholderFixed')
                        }
                        fullWidth
                      />
                    </Box>
                  ) : null}
                </Box>

                <Controller
                  name={`schedules.${index}.is_active`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                      />
                      <Box>
                        <Typography variant="subtitle2" className="font-semibold text-foreground">
                          {t('form.scheduleActive')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.scheduleActiveHelper')}
                        </Typography>
                      </Box>
                    </div>
                  )}
                />

                <Controller
                  name={`schedules.${index}.is_default`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Switch
                        checked={field.value}
                        onChange={(e) => {
                          const on = (e.target as HTMLInputElement).checked;
                          if (on) {
                            setScheduleAsDefault(index);
                          } else {
                            field.onChange(false);
                            window.setTimeout(() => {
                              const next = getValues('schedules');
                              if (next.length && !next.some((r) => r.is_default)) {
                                const other = next.findIndex((_, i) => i !== index);
                                if (other >= 0) setValue(`schedules.${other}.is_default`, true);
                              }
                            }, 0);
                          }
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" className="font-semibold text-foreground">
                          {t('form.scheduledBasketDetailScheduleDefault')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.scheduleDefaultHelper')}
                        </Typography>
                      </Box>
                    </div>
                  )}
                />
              </Box>
            );
          })}
        </Box>

        {/* Is Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Box>
                  <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.basketActiveHelper')}
                  </Typography>
                </Box>
              </div>
            )}
          />
        </Box>

        {/* Items */}
        <Box className="group">
          <Box className="mb-2 flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:box-bold" className="text-primary" width={24} height={24} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.basketItems')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              onClick={() => append({ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addItem')}
            </Button>
          </Box>
          {fields.map((field, index) => (
            <Box key={field.id} className="mb-4 rounded-xl border border-border/50 p-4 space-y-3">
              <Box className="flex items-center justify-between">
                <Typography variant="subtitle2" className="text-muted-foreground">
                  {t('form.scheduledBasketItemHeading', { number: index + 1 })}
                </Typography>
                {fields.length > 1 && (
                  <Button type="button" variant="text" onClick={() => remove(index)} className="text-destructive">
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </Button>
                )}
              </Box>

              <Box className="flex flex-wrap gap-3">
                <Box className="flex-1 min-w-[200px]">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.primaryVariant')}</Typography>
                  <Controller
                    name={`items.${index}.shop_product_variant_id`}
                    control={control}
                    render={({ field: f }) => (
                      <InfiniteScrollSelect
                        value={f.value || 0}
                        onChange={(variantId) => f.onChange(variantId)}
                        queryKey={['shopProductVariant', 'scheduled-basket', index]}
                        fetcher={(page) => _ShopProductVariantApi.getList({ page, per_page: 10 })}
                        placeholder={t('form.variantId')}
                      />
                    )}
                  />
                </Box>
                <Box className="w-24">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.quantity')}</Typography>
                  <RHFTextField name={`items.${index}.quantity`} placeholder={t('form.placeholderOne')} type="number" fullWidth />
                </Box>
                <Box className="w-24">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">
                    {t('form.minQuantity')}
                  </Typography>
                  <RHFTextField name={`items.${index}.min_quantity`} placeholder={t('form.placeholderZero')} type="number" fullWidth />
                </Box>
                <Box className="w-24">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">
                    {t('form.maxQuantity')}
                  </Typography>
                  <RHFTextField name={`items.${index}.max_quantity`} placeholder={t('form.placeholderZero')} type="number" fullWidth />
                </Box>
              </Box>

              <Box className="w-full">
                <Typography variant="caption" className="mb-1 text-muted-foreground">
                  {t('form.alternativeScheduledBaskets')}
                </Typography>
                <Controller
                  name={`items.${index}.shop_product_variant_ids`}
                  control={control}
                  render={({ field: f }) => {
                    const ids = Array.isArray(f.value) ? f.value.filter(Boolean).map(Number) : [];
                    const extraOpts = ids
                      .filter((v) => !shopVariantMultiOptions.some((o) => Number(o.value) === v))
                      .map((v) => ({ value: v, label: `#${v}` }));
                    const options = [...extraOpts, ...shopVariantMultiOptions];
                    return (
                      <MultiSelect
                        options={options}
                        value={ids}
                        onChange={(vals) => f.onChange((vals as (string | number)[]).map((x) => Number(x)))}
                        placeholder={t('form.alternativeScheduledBasketsPlaceholder')}
                        noOptionsMessage={t('noOptionsFound')}
                        fullWidth
                      />
                    );
                  }}
                />
              </Box>

              <Box className="flex flex-wrap gap-4">
                <Controller
                  name={`items.${index}.is_required`}
                  control={control}
                  render={({ field: f }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={f.value}
                        onChange={(e) => f.onChange((e.target as HTMLInputElement).checked)}
                      />
                      <Typography variant="body2">{t('form.isRequired')}</Typography>
                    </div>
                  )}
                />
                <Controller
                  name={`items.${index}.is_extra`}
                  control={control}
                  render={({ field: f }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={f.value}
                        onChange={(e) => f.onChange((e.target as HTMLInputElement).checked)}
                      />
                      <Typography variant="body2">{t('form.isExtra')}</Typography>
                    </div>
                  )}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Badges */}
        <Box className="border-t border-border pt-6">
          <RHFBadgeSelector name="badges" label={t('form.badgesLabel')} />
        </Box>
      </CreateFormLayout>
    </>
  );
}
