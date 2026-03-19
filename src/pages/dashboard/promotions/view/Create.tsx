import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import {
  PromotionSchema,
  type PromotionFormValues,
} from '@/pages/dashboard/promotions/validation/promotion.validation';
import {
  useCreatePromotion,
  useUpdatePromotion,
  useFetchPromotionById,
} from '@/pages/dashboard/promotions/hooks/promotion';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

const metadata = { title: `Promotion | ${CONFIG.appName}` };

const PROMOTION_TYPES = [
  { value: 'simple_discount', label: 'Simple Discount' },
  { value: 'spend_x_discount', label: 'Spend X Discount' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount' },
];

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchPromotionById(id || '');
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  const defaultValues: PromotionFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    type: 'simple_discount',
    is_active: true,
    starts_at: '',
    ends_at: '',
    min_spend: null,
    buy_quantity: null,
    get_quantity: null,
    discount_value: null,
    discount_type: null,
  };

  const methods = useForm<PromotionFormValues>({
    resolver: zodResolver(PromotionSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;
  const selectedType = watch('type');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      reset({
        name: { en: item.name?.en ?? '', ar: item.name?.ar ?? '' },
        description: { en: item.description?.en ?? '', ar: item.description?.ar ?? '' },
        type: item.type,
        is_active: item.is_active,
        starts_at: item.starts_at?.substring(0, 10) ?? '',
        ends_at: item.ends_at?.substring(0, 10) ?? '',
        min_spend: item.min_spend ?? null,
        buy_quantity: item.buy_quantity ?? null,
        get_quantity: item.get_quantity ?? null,
        discount_value: item.discount_value ?? null,
        discount_type: item.discount_type ?? null,
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        type: data.type,
        is_active: data.is_active,
      };
      if (data.starts_at) payload.starts_at = data.starts_at;
      if (data.ends_at) payload.ends_at = data.ends_at;
      if (data.discount_value != null) payload.discount_value = data.discount_value;
      if (data.discount_type) payload.discount_type = data.discount_type;
      if (data.min_spend != null) payload.min_spend = data.min_spend;
      if (data.buy_quantity != null) payload.buy_quantity = data.buy_quantity;
      if (data.get_quantity != null) payload.get_quantity = data.get_quantity;

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.promotionUpdatedSuccess'));
        navigate('/promotions');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.promotionCreatedSuccess'));
        navigate('/promotions');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Promotion | ${metadata.title}` : `Create Promotion | ${metadata.title}`}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/promotions')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editPromotion') : t('form.createPromotion')}
        description={isEditMode ? t('form.editPromotionDesc') : t('form.createPromotionDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingPromotion')}
        submitLabel={isEditMode ? t('updating') : t('form.createPromotion')}
        submittingLabel={isEditMode ? t('updating') : t('create')}
      >
        {/* Name EN */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.nameEn')}</Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.promotionNameEnPlaceholder')} helperText={t('form.promotionNameEnHelper')} />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.nameAr')}</Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.promotionNameArPlaceholder')} dir="rtl" />
        </Box>

        {/* Description EN */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.descriptionEn')}</Typography>
          </Box>
          <RHFTextField name="description.en" placeholder={t('form.promotionDescEnPlaceholder')} />
        </Box>

        {/* Description AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.descriptionAr')}</Typography>
          </Box>
          <RHFTextField name="description.ar" placeholder={t('form.promotionDescArPlaceholder')} dir="rtl" />
        </Box>

        {/* Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.promotionType')}</Typography>
          </Box>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {PROMOTION_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            )}
          />
        </Box>

        {/* Discount Value */}
        {(selectedType === 'simple_discount' || selectedType === 'spend_x_discount') && (
          <>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:percent-bold" className="text-primary" width={24} />
                <Typography variant="subtitle2" className="font-semibold">{t('form.discountValueLabel')}</Typography>
              </Box>
              <RHFTextField name="discount_value" type="number" placeholder={t('form.discountValuePlaceholder')} helperText={t('form.discountValueHelper')} />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-price-bold" className="text-primary" width={24} />
                <Typography variant="subtitle2" className="font-semibold">{t('form.discountTypeLabel')}</Typography>
              </Box>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ''}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t('form.selectDiscountType')}</option>
                    {DISCOUNT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                )}
              />
            </Box>
          </>
        )}

        {/* Min Spend */}
        {selectedType === 'spend_x_discount' && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:cart-bold" className="text-primary" width={24} />
              <Typography variant="subtitle2" className="font-semibold">{t('form.minSpendLabel')}</Typography>
            </Box>
            <RHFTextField name="min_spend" type="number" placeholder={t('form.minSpendPlaceholder')} helperText={t('form.minSpendHelper')} />
          </Box>
        )}

        {/* Buy/Get quantities */}
        {selectedType === 'buy_x_get_y' && (
          <>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:bag-bold" className="text-primary" width={24} />
                <Typography variant="subtitle2" className="font-semibold">{t('form.buyQuantityLabel')}</Typography>
              </Box>
              <RHFTextField name="buy_quantity" type="number" placeholder={t('form.buyQuantityPlaceholder')} helperText={t('form.buyQuantityHelper')} />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:gift-bold" className="text-primary" width={24} />
                <Typography variant="subtitle2" className="font-semibold">{t('form.getQuantityLabel')}</Typography>
              </Box>
              <RHFTextField name="get_quantity" type="number" placeholder={t('form.getQuantityPlaceholder')} helperText={t('form.getQuantityHelper')} />
            </Box>
          </>
        )}

        {/* Dates */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.startDateOptional')}</Typography>
          </Box>
          <RHFTextField name="starts_at" type="date" />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.endDateOptional')}</Typography>
          </Box>
          <RHFTextField name="ends_at" type="date" helperText={t('form.endDateHelper')} />
        </Box>
      </CreateFormLayout>
    </>
  );
}
