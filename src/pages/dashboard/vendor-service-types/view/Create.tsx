import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { VendorServiceTypeSchema, type VendorServiceTypeFormValues } from '../validation';
import {
  useCreateVendorServiceType,
  useUpdateVendorServiceType,
  useFetchVendorServiceTypeById,
} from '../hooks';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailResponse, isLoading: isLoadingDetail } = useFetchVendorServiceTypeById(
    id || ''
  );
  const createMutation = useCreateVendorServiceType();
  const updateMutation = useUpdateVendorServiceType();

  const defaultValues: VendorServiceTypeFormValues = {
    name: { en: '', ar: '' },
    is_active: true,
  };

  const methods = useForm<VendorServiceTypeFormValues>({
    resolver: zodResolver(VendorServiceTypeSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && detailResponse?.data) {
      const item = detailResponse.data;
      const name = item.name;
      reset({
        name: {
          en: typeof name === 'object' ? name.en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? name.ar ?? '' : String(name ?? ''),
        },
        is_active: item.is_active ?? true,
      });
    }
  }, [isEditMode, detailResponse, reset]);

  if (isEditMode && isLoadingDetail) return <LoadingScreen />;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: VendorServiceTypeFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.vendorServiceTypeUpdatedSuccess'));
        navigate('/vendor-service-types');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.vendorServiceTypeCreatedSuccess'));
        navigate('/vendor-service-types');
      }
    } catch (error: any) {
      console.error('Error saving vendor service type:', error);
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.vendorServiceTypeEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.vendorServiceTypeCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/vendor-service-types')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={
          isEditMode ? t('form.editVendorServiceType') : t('form.createVendorServiceType')
        }
        description={
          isEditMode
            ? t('form.editVendorServiceTypeDesc')
            : t('form.createVendorServiceTypeDesc')
        }
        isEditMode={isEditMode}
        isLoading={false}
        submitLabel={
          isEditMode ? t('form.updateVendorServiceTypeSubmit') : t('form.createVendorServiceTypeSubmit')
        }
        submittingLabel={
          isEditMode
            ? t('form.updatingVendorServiceTypeSubmit')
            : t('form.creatingVendorServiceTypeSubmit')
        }
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:widget-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.vendorServiceTypeNameEn')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:widget-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.vendorServiceTypeNameAr')} dir="rtl" />
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
              control={methods.control}
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
