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
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { useFetchVendorServiceTypes } from '../../vendor-service-types/hooks';
import { VendorServiceSchema, type VendorServiceFormValues } from '../validation';
import {
  useCreateVendorService,
  useUpdateVendorService,
  useFetchVendorServiceById,
} from '../hooks';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailResponse, isLoading: isLoadingDetail } = useFetchVendorServiceById(id || '');
  const createMutation = useCreateVendorService();
  const updateMutation = useUpdateVendorService();

  const { data: typesResponse } = useFetchVendorServiceTypes(1, 100);
  const typeOptions =
    typesResponse?.data?.items?.map((item) => ({
      value: String(item.id),
      label:
        typeof item.name === 'object'
          ? item.name.en ?? item.name.ar ?? String(item.id)
          : String(item.name),
    })) || [];

  const defaultValues: VendorServiceFormValues = {
    vendor_service_type_id: 0,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    is_active: true,
  };

  const methods = useForm<VendorServiceFormValues>({
    resolver: zodResolver(VendorServiceSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && detailResponse?.data) {
      const item = detailResponse.data;
      const name = item.name;
      const desc = item.description;
      reset({
        vendor_service_type_id: item.vendor_service_type_id ?? 0,
        name: {
          en: typeof name === 'object' ? name.en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? name.ar ?? '' : String(name ?? ''),
        },
        description: {
          en: typeof desc === 'object' && desc != null ? (desc as any).en ?? '' : '',
          ar: typeof desc === 'object' && desc != null ? (desc as any).ar ?? '' : '',
        },
        is_active: item.is_active ?? true,
      });
    }
  }, [isEditMode, detailResponse, reset]);

  if (isEditMode && isLoadingDetail) return <LoadingScreen />;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: VendorServiceFormValues) => {
    try {
      const payload = {
        ...data,
        vendor_service_type_id: Number(data.vendor_service_type_id),
      };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.vendorServiceUpdatedSuccess'));
        navigate('/vendor-services');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.vendorServiceCreatedSuccess'));
        navigate('/vendor-services');
      }
    } catch (error: any) {
      console.error('Error saving vendor service:', error);
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? `Edit Vendor Service | Dashboard - ${CONFIG.appName}`
          : `Create Vendor Service | Dashboard - ${CONFIG.appName}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/vendor-services')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editVendorService') : t('form.createVendorService')}
        description={
          isEditMode ? t('form.editVendorServiceDesc') : t('form.createVendorServiceDesc')
        }
        isEditMode={isEditMode}
        isLoading={false}
        submitLabel={
          isEditMode ? t('form.updateVendorServiceSubmit') : t('form.createVendorServiceSubmit')
        }
        submittingLabel={
          isEditMode
            ? t('form.updatingVendorServiceSubmit')
            : t('form.creatingVendorServiceSubmit')
        }
      >
        {/* ── Section: Type ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorServiceType')}</Typography>
          </Box>
          <Box className="p-6">
            <RHFSelect name="vendor_service_type_id" options={typeOptions} placeholder={t('form.vendorServiceTypePlaceholder')} />
          </Box>
        </Box>

        {/* ── Section: Names & Descriptions ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:course-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.name')} & {t('columns.description')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:course-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.vendorServiceNameEn')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:course-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.vendorServiceNameAr')} dir="rtl" />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:text-bold" className="text-primary" width={16} />
                {t('form.descriptionEn')}
              </Typography>
              <RHFTextField name="description.en" placeholder={t('form.vendorServiceDescriptionEn')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:text-bold" className="text-primary" width={16} />
                {t('form.descriptionAr')}
              </Typography>
              <RHFTextField name="description.ar" placeholder={t('form.vendorServiceDescriptionAr')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
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
