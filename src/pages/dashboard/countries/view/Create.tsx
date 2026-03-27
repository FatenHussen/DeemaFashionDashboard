import type { CountryItem } from '@/pages/dashboard/countries/types/country.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  CountrySchema,
  type CountryFormValues,
} from '@/pages/dashboard/countries/validation/country.validation';
import {
  useCreateCountry,
  useUpdateCountry,
  useFetchCountryById,
} from '@/pages/dashboard/countries/hooks/country';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

function countryNameToForm(name: CountryItem['name']): { en: string; ar: string } {
  if (name != null && typeof name === 'object' && !Array.isArray(name)) {
    const o = name as { en?: string; ar?: string };
    return {
      en: String(o.en ?? ''),
      ar: String(o.ar ?? ''),
    };
  }
  const s = name == null ? '' : String(name);
  return { en: s, ar: s };
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: countryResponse, isLoading: isLoadingCountry } = useFetchCountryById(id || '');
  const createMutation = useCreateCountry();
  const updateMutation = useUpdateCountry();

  const defaultValues: CountryFormValues = {
    name: { en: '', ar: '' },
    code: '',
    is_active: true,
  };

  const methods = useForm<CountryFormValues>({
    resolver: zodResolver(CountrySchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && countryResponse?.data) {
      const d = countryResponse.data;
      reset({
        name: countryNameToForm(d.name),
        code: d.code ?? '',
        is_active: true,
      });
    }
  }, [countryResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: CountryFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.countryUpdatedSuccess'));
        navigate('/countries');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.countryCreatedSuccess'));
        navigate('/countries');
      }
    } catch (error: any) {
      console.error('Error saving country:', error);
    }
  };

  const handleCancel = () => navigate('/countries');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.countryEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.countryCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCountry') : t('form.createCountry')}
        description={
          isEditMode
            ? t('form.editCountryDesc')
            : t('form.createCountryDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingCountry}
        loadingText={t('form.loadingCountry')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateCountry') : t('form.createCountrySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCountry') : t('form.creatingCountry')}
      >
        {/* Name EN */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:earth-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.countryNameEnPlaceholder')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:earth-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.countryNameArPlaceholder')} dir="rtl" fullWidth />
        </Box>

        {/* Code */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:code-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.countryCode')}
            </Typography>
          </Box>
          <RHFTextField name="code" placeholder={t('form.countryCodePlaceholder')} helperText={t('form.countryCodeHelper')} fullWidth />
        </Box>
      </CreateFormLayout>
    </>
  );
}
