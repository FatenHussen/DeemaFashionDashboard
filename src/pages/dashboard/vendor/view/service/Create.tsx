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

const metadata = { title: `Service ${CONFIG.appName}` };

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
        toast.success('Service updated successfully');
        navigate('/services');
      } else {
        await createServiceMutation.mutateAsync(payload);
        toast.success('Service created successfully');
        navigate('/services');
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
    }
  };

  const handleCancel = () => {
    navigate('/services');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names are provided.'
    : 'Fill in the service name. Make sure both Arabic and English names are provided.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Service | ${metadata.title}` : `Create Service | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Service' : 'Create New Service'}
        description={isEditMode ? 'Update service information' : 'Add a new service to your system'}
        isEditMode={isEditMode}
        isLoading={false}
        loadingText={t('form.loadingService')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Service' : 'Create Service'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:service-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.serviceNameAr')}
            helperText={t('form.serviceNameArHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:service-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder={t('form.serviceNameEn')}
            helperText={t('form.serviceNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
