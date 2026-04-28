import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { ServiceSchema, type ServiceFormValues } from '../../validation/service.validation';
import { useCreateService, useUpdateService, useFetchServiceById } from '../../hooks/service';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: serviceResponse, isLoading: isLoadingService } = useFetchServiceById(id || '');
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const defaultValues: ServiceFormValues = {
    name: {
      en: '',
      ar: '',
    },
  };

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && serviceResponse?.data) {
      const service = serviceResponse.data;
      const name = service.name;
      reset({
        name: {
          en: typeof name === 'object' ? name.en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? name.ar ?? '' : String(name ?? ''),
        },
      });
    }
  }, [isEditMode, serviceResponse, reset]);

  if (isEditMode && isLoadingService) return <LoadingScreen />;

  const isSubmitting = createServiceMutation.isPending || updateServiceMutation.isPending;
  const errorMessage =
    createServiceMutation.error?.message || updateServiceMutation.error?.message || null;

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
      };

      if (isEditMode && id) {
        await updateServiceMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.serviceUpdatedSuccess'));
        navigate('/services');
      } else {
        await createServiceMutation.mutateAsync(payload);
        toast.success(t('form.serviceCreatedSuccess'));
        navigate('/services');
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
    }
  };

  const handleCancel = () => {
    navigate('/services');
  };

  const infoText = isEditMode ? t('form.serviceFormInfoEdit') : t('form.serviceFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.serviceEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.serviceCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editService') : t('form.createService')}
        description={isEditMode ? t('form.editServiceDesc') : t('form.createServiceDesc')}
        isEditMode={isEditMode}
        isLoading={false}
        loadingText={t('form.loadingService')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateServiceSubmit') : t('form.createServiceSubmit')}
        submittingLabel={isEditMode ? t('form.updatingServiceSubmit') : t('form.creatingServiceSubmit')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:service-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.serviceNameEn')} helperText={t('form.serviceNameEnHelper')} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.serviceNameAr')} helperText={t('form.serviceNameArHelper')} dir="rtl" />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
