import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  GovernorateSchema,
  type GovernorateFormValues,
} from '@/pages/dashboard/locations/validation/governorate.validation';
import {
  useCreateGovernorate,
  useUpdateGovernorate,
  useFetchGovernorateById,
} from '@/pages/dashboard/locations/hooks/governorate';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: governorateData, isLoading: isLoadingGovernorate } = useFetchGovernorateById(
    id || ''
  );
  const createGovernorateMutation = useCreateGovernorate();
  const updateGovernorateMutation = useUpdateGovernorate();

  const defaultValues: GovernorateFormValues = {
    name: {
      en: '',
      ar: '',
    },
  };

  const methods = useForm<GovernorateFormValues>({
    resolver: zodResolver(GovernorateSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && governorateData && !isLoadingGovernorate) {
      const nameValue =
        typeof governorateData.name === 'string'
          ? { ar: governorateData.name, en: governorateData.name }
          : governorateData.name;

      reset({
        name: nameValue,
      });
    }
  }, [governorateData, isEditMode, isLoadingGovernorate, reset]);

  const isSubmitting = createGovernorateMutation.isPending || updateGovernorateMutation.isPending;
  const errorMessage =
    createGovernorateMutation.error?.message || updateGovernorateMutation.error?.message || null;

  const onSubmit = async (data: GovernorateFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
      };

      if (isEditMode && id) {
        await updateGovernorateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.governorateUpdatedSuccess'));
        navigate('/locations');
      } else {
        await createGovernorateMutation.mutateAsync(payload);
        toast.success(t('form.governorateCreatedSuccess'));
        navigate('/locations');
      }
    } catch (error: any) {
      console.error('Error saving governorate:', error);
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  const infoText = isEditMode
    ? t('form.governorateEditInfo')
    : t('form.governorateCreateInfo');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.governorateEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.governorateCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editGovernorate') : t('form.createGovernorate')}
        description={
          isEditMode ? t('form.editGovernorateDesc') : t('form.createGovernorateDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingGovernorate}
        loadingText={t('form.loadingGovernorate')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateGovernorate') : t('form.createGovernorateSubmit')}
        submittingLabel={isEditMode ? t('form.updatingGovernorate') : t('form.creatingGovernorate')}
      >
        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.govPlaceholderAr')}
            helperText={t('form.govNameArHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder={t('form.govPlaceholderEn')}
            helperText={t('form.govNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
