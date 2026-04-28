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
        submitLabel={isEditMode ? t('form.updateCountry') : t('form.createCountrySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCountry') : t('form.creatingCountry')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:earth-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:earth-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.countryNameEnPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:earth-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.countryNameArPlaceholder')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Country Code ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:code-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.countryCode')}
            </Typography>
          </Box>
          <Box className="p-6 md:max-w-sm">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:code-bold" className="text-violet-500" width={16} />
                {t('form.countryCode')}
              </Typography>
              <RHFTextField name="code" placeholder={t('form.countryCodePlaceholder')} helperText={t('form.countryCodeHelper')} fullWidth />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
