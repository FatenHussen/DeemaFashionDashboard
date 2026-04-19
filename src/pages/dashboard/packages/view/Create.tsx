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
import { Iconify } from 'src/shared/components/iconify';
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
        is_active: Boolean(source.is_active),
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
        submitLabel={isEditMode ? t('form.packageSubmitUpdate') : t('form.packageSubmitCreate')}
        submittingLabel={isEditMode ? t('form.updatingPackage') : t('form.creatingPackage')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:box-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.packageFieldNameEnglish')} / {t('form.packageFieldNameArabic')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldNameEnglish')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.packageNameEnPlaceholder')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldNameArabic')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.packageNameArShort')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Pricing & Duration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.packageFieldPrice')} & {t('form.packageFieldDurationDays')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldPrice')}</Typography>
              <RHFTextField name="price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldDurationDays')}</Typography>
              <RHFTextField name="duration_days" type="number" placeholder={t('form.placeholderThirty')} fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Limits & Bonuses ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.packageFieldMonthlyOrdersLimit')} & {t('form.packageFieldPointsBonus')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldMonthlyOrdersLimit')}</Typography>
              <RHFTextField name="monthly_orders_limit" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldFreeDeliveryCount')}</Typography>
              <RHFTextField name="free_delivery_count" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldDiscountPercentage')}</Typography>
              <RHFTextField name="discount_percentage" type="number" placeholder={t('form.placeholderZero')} fullWidth min={0} max={100} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.packageFieldPointsBonus')}</Typography>
              <RHFTextField name="points_bonus" type="number" placeholder={t('form.placeholderZero')} fullWidth />
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
                  <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
