import type { PackageData } from '@/pages/dashboard/packages/types/package.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  PackageSchema,
  type PackageFormValues,
} from '@/pages/dashboard/packages/validation/package.validation';
import {
  useCreatePackage,
  useUpdatePackage,
  useFetchPackageById,
} from '@/pages/dashboard/packages/hooks/package';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const packageFromState = location.state?.package as PackageData | undefined;
  const isEditMode = !!id;

  const { data: packageResponse, isLoading: isLoadingPackage } = useFetchPackageById(id || '');
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();

  const defaultValues: PackageFormValues = {
    name: { en: '', ar: '' },
    price: 0,
    duration_days: 1,
    monthly_orders_limit: 0,
    free_delivery_count: 0,
    discount_percentage: 0,
    points_bonus: 0,
    is_active: true,
  };

  const methods = useForm<PackageFormValues>({
    resolver: zodResolver(PackageSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (packageResponse?.data ?? packageFromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      reset({
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        price: source.price ?? 0,
        duration_days: source.duration_days ?? 1,
        monthly_orders_limit: source.monthly_orders_limit ?? 0,
        free_delivery_count: source.free_delivery_count ?? 0,
        discount_percentage: source.discount_percentage ?? 0,
        points_bonus: source.points_bonus ?? 0,
        is_active: source.is_active ?? true,
      });
    }
  }, [packageResponse?.data, packageFromState, isEditMode, reset]);

  const isSubmitting = createPackageMutation.isPending || updatePackageMutation.isPending;
  const errorMessage = createPackageMutation.error?.message || updatePackageMutation.error?.message || null;

  const onSubmit = async (data: PackageFormValues) => {
    try {
      const payload = { ...data } as any;
      if (isEditMode && id) {
        await updatePackageMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.packageUpdatedSuccess'));
      } else {
        await createPackageMutation.mutateAsync(payload);
        toast.success(t('form.packageCreatedSuccess'));
      }
      navigate('/packages');
    } catch (error: any) {
      console.error('Error saving package:', error);
    }
  };

  const handleCancel = () => navigate('/packages');

  if (isEditMode && isLoadingPackage && !packageFromState) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.packageEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.packageCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editPackage') : t('form.createPackage')}
        description={isEditMode ? t('form.packageEditPageDesc') : t('form.packageCreatePageDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingPackage}
        loadingText={t('form.loadingPackage')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.packageSubmitUpdate') : t('form.packageSubmitCreate')}
        submittingLabel={isEditMode ? t('form.updatingPackage') : t('form.creatingPackage')}
      >
        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldNameEnglish')}</Typography>
          <RHFTextField name="name.en" placeholder={t('form.packageNameEnPlaceholder')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldNameArabic')}</Typography>
          <RHFTextField name="name.ar" placeholder={t('form.packageNameArShort')} dir="rtl" fullWidth />
        </Box>

        {/* Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldPrice')}</Typography>
          <RHFTextField name="price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Duration Days */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldDurationDays')}</Typography>
          <RHFTextField name="duration_days" type="number" placeholder={t('form.placeholderThirty')} fullWidth />
        </Box>

        {/* Monthly Orders Limit */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldMonthlyOrdersLimit')}</Typography>
          <RHFTextField name="monthly_orders_limit" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Free Delivery Count */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldFreeDeliveryCount')}</Typography>
          <RHFTextField name="free_delivery_count" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Discount Percentage */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldDiscountPercentage')}</Typography>
          <RHFTextField name="discount_percentage" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Points Bonus */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldPointsBonus')}</Typography>
          <RHFTextField name="points_bonus" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Typography variant="body2">{t('active')}</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
