import type {
  ScheduledBasketCreateUpdatePayload,
  ScheduledBasketData,
  ScheduledBasketItem,
} from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import {
  ScheduledBasketSchema,
  type ScheduledBasketFormValues,
} from '@/pages/dashboard/baskets/validation/scheduled-basket.validation';
import {
  useCreateScheduledBasket,
  useUpdateScheduledBasket,
  useFetchScheduledBasketById,
} from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { CONFIG } from 'src/global-config';
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

const metadata = { title: `Scheduled Basket ${CONFIG.appName}` };

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
    schedule: {
      title: { en: '', ar: '' },
      number_of_days: 1,
      discount_type: null,
      discount_value: null,
      is_active: true,
    },
    is_active: true,
    badges: [],
  };

  const methods = useForm<ScheduledBasketFormValues>({
    resolver: zodResolver(ScheduledBasketSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const scheduleDiscountType = watch('schedule.discount_type');
  const imageValue = watch('image');

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
      const firstSchedule = source.schedules?.[0];
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
        schedule: firstSchedule
          ? {
              title: typeof firstSchedule.title === 'object' ? firstSchedule.title : { en: String(firstSchedule.title || ''), ar: '' },
              number_of_days: firstSchedule.number_of_days || 1,
              discount_type: firstSchedule.discount_type || null,
              discount_value: firstSchedule.discount_value ?? null,
              is_active: firstSchedule.is_active ?? true,
            }
          : {
              title: { en: '', ar: '' },
              number_of_days: 1,
              discount_type: null,
              discount_value: null,
              is_active: true,
            },
        is_active: source.is_active ?? true,
        badges: (source as any).badges?.length
          ? (source as any).badges.map((b: any) => ({
              id: b.id,
              position: b.position || b.postion || 'top',
            }))
          : [],
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
        schedule: {
          title: data.schedule.title,
          number_of_days: data.schedule.number_of_days,
          discount_type: data.schedule.discount_type ?? null,
          discount_value: data.schedule.discount_value ?? null,
          is_active: data.schedule.is_active,
        },
        is_active: data.is_active,
        badges: data.badges,
      };
      if (isEditMode && id) {
        await updateScheduledBasketMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.scheduledBasketUpdatedSuccess') || 'Scheduled basket updated successfully');
      } else {
        await createScheduledBasketMutation.mutateAsync(payload);
        toast.success(t('form.scheduledBasketCreatedSuccess') || 'Scheduled basket created successfully');
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
      <title>{isEditMode ? `Edit Scheduled Basket | ${metadata.title}` : `Create Scheduled Basket | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editScheduledBasket') || 'Edit Scheduled Basket' : t('form.createScheduledBasket') || 'Create New Scheduled Basket'}
        description={isEditMode ? t('form.editScheduledBasketDesc') || 'Update scheduled basket details' : t('form.createScheduledBasketDesc') || 'Add a new scheduled basket with products'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingScheduledBasket}
        loadingText={t('form.loadingScheduledBasket')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateScheduledBasket') || 'Update Scheduled Basket' : t('form.createScheduledBasketSubmit') || 'Create Scheduled Basket'}
        submittingLabel={isEditMode ? t('updating') || 'Updating...' : t('form.creating') || 'Creating...'}
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
                          ? [{ id: 0, label: 'Select category...' }, ...res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' }))]
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
            <RHFTextField name="discount" type="number" placeholder="0" fullWidth />
          </Box>
        </Box>

        {/* Delivery Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.deliveryPrice')}</Typography>
          <RHFTextField name="delivery_price" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Basket image (optional, multipart) */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.basketImage') || 'Basket image'}
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
                  helperText={error?.message || (t('form.basketImageHelper') as string) || 'JPEG, PNG, GIF — max 2MB on server'}
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

        {/* Schedule Section */}
        <Box className="rounded-xl border border-border p-4 space-y-4">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="h6" className="font-semibold text-foreground">{t('form.scheduleSection') || 'Schedule'}</Typography>
          </Box>

          {/* Schedule Title EN */}
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.scheduleTitleEn') || 'Schedule Title (EN)'}</Typography>
            <RHFTextField name="schedule.title.en" placeholder={t('form.scheduleTitleEnPlaceholder') || 'Schedule title in English'} fullWidth />
          </Box>

          {/* Schedule Title AR */}
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.scheduleTitleAr') || 'Schedule Title (AR)'}</Typography>
            <RHFTextField name="schedule.title.ar" placeholder={t('form.scheduleTitleArPlaceholder') || 'Schedule title in Arabic'} dir="rtl" fullWidth />
          </Box>

          {/* Number of Days */}
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.numberOfDays') || 'Number of Days'}</Typography>
            <RHFTextField name="schedule.number_of_days" type="number" placeholder="1" fullWidth />
            <Typography variant="caption" className="text-muted-foreground mt-1">
              {t('form.numberOfDaysHelper') || 'The interval in days for this schedule'}
            </Typography>
          </Box>

          {/* Schedule Discount */}
          <Box className="flex flex-wrap gap-4">
            <Box className="min-w-[140px] flex-1">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.scheduleDiscountType') || 'Schedule Discount Type'}</Typography>
              <Controller
                name="schedule.discount_type"
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
            {scheduleDiscountType && (
              <Box className="min-w-[140px] flex-1">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.scheduleDiscountValue') || 'Schedule Discount Value'}</Typography>
                <RHFTextField name="schedule.discount_value" type="number" placeholder={scheduleDiscountType === 'percentage' ? '10' : '5'} fullWidth />
              </Box>
            )}
          </Box>

          {/* Schedule Active */}
          <Controller
            name="schedule.is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Box>
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.scheduleActive') || 'Schedule Active'}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.scheduleActiveHelper') || 'Enable or disable this schedule'}
                  </Typography>
                </Box>
              </div>
            )}
          />
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
                    {t('form.basketActiveHelper') || 'Enable or disable this basket'}
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
              <Typography variant="h6" className="font-semibold text-foreground">{t('form.basketItems') || 'Basket Items'}</Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              onClick={() => append({ shop_product_variant_id: 0, quantity: 1, shop_product_variant_ids: [], is_required: false, is_extra: false, min_quantity: 0, max_quantity: 0 })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addItem') || 'Add Item'}
            </Button>
          </Box>
          {fields.map((field, index) => (
            <Box key={field.id} className="mb-4 rounded-xl border border-border/50 p-4 space-y-3">
              <Box className="flex items-center justify-between">
                <Typography variant="subtitle2" className="text-muted-foreground">
                  {t('form.item') || 'Item'} #{index + 1}
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
                  <RHFTextField name={`items.${index}.quantity`} placeholder="1" type="number" fullWidth />
                </Box>
                <Box className="w-24">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.minQuantity') || 'Min Qty'}</Typography>
                  <RHFTextField name={`items.${index}.min_quantity`} placeholder="0" type="number" fullWidth />
                </Box>
                <Box className="w-24">
                  <Typography variant="caption" className="mb-1 text-muted-foreground">{t('form.maxQuantity') || 'Max Qty'}</Typography>
                  <RHFTextField name={`items.${index}.max_quantity`} placeholder="0" type="number" fullWidth />
                </Box>
              </Box>

              <Box className="w-full">
                <Typography variant="caption" className="mb-1 text-muted-foreground">
                  {t('form.alternativeVariantIds')}
                </Typography>
                <Controller
                  name={`items.${index}.shop_product_variant_ids`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      value={Array.isArray(field.value) ? field.value.filter(Boolean).join(', ') : ''}
                      onChange={(e) => {
                        const nums = e.target.value
                          .split(/[,،\s]+/)
                          .map((s) => parseInt(s.trim(), 10))
                          .filter((n) => !Number.isNaN(n) && n > 0);
                        field.onChange(nums);
                      }}
                      placeholder={t('form.alternativeVariantIdsPlaceholder') as string}
                      fullWidth
                    />
                  )}
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
                      <Typography variant="body2">{t('form.isRequired') || 'Required'}</Typography>
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
                      <Typography variant="body2">{t('form.isExtra') || 'Extra'}</Typography>
                    </div>
                  )}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Badges */}
        <Box className="border-t border-border pt-6">
          <RHFBadgeSelector name="badges" />
        </Box>
      </CreateFormLayout>
    </>
  );
}
