import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { _GovernorateApi } from '@/pages/dashboard/locations/api/governorate.services';
import {
  CitySchema,
  type CityFormValues,
} from '@/pages/dashboard/locations/validation/city.validation';
import {
  useCreateCity,
  useUpdateCity,
  useFetchCityById,
} from '@/pages/dashboard/locations/hooks/city';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const governorateFetcher = (page: number, limit: number) =>
  _GovernorateApi.getListGovernorates({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((gov) => ({ id: gov.id, label: gov.name })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: cityData, isLoading: isLoadingCity } = useFetchCityById(id || '');
  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();

  const defaultValues: CityFormValues = {
    name: {
      en: '',
      ar: '',
    },
    governorate_id: 0,
  };

  const methods = useForm<CityFormValues>({
    resolver: zodResolver(CitySchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Fetch city data if in edit mode
  useEffect(() => {
    if (isEditMode && cityData && !isLoadingCity) {
      reset({
        name: cityData.name,
        governorate_id: cityData.governorate?.id || 0,
      });
    }
  }, [cityData, isEditMode, isLoadingCity, reset]);

  const isSubmitting = createCityMutation.isPending || updateCityMutation.isPending;
  const errorMessage =
    createCityMutation.error?.message || updateCityMutation.error?.message || null;

  const onSubmit = async (data: CityFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        governorate_id: data.governorate_id,
      };

      if (isEditMode && id) {
        await updateCityMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.cityUpdatedSuccess'));
        navigate('/locations/city');
      } else {
        await createCityMutation.mutateAsync(payload);
        toast.success(t('form.cityCreatedSuccess'));
        navigate('/locations/city');
      }
    } catch (error: any) {
      console.error('Error saving city:', error);
    }
  };

  const handleCancel = () => {
    navigate('/locations/city');
  };

  const infoText = isEditMode ? t('form.cityFormInfoEdit') : t('form.cityFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.cityEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.cityCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCity') : t('form.createCity')}
        description={isEditMode ? t('form.editCityDesc') : t('form.createCityDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingCity}
        loadingText={t('form.loadingCity')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateCity') : t('form.createCitySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCity') : t('form.creatingCity')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:city-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:flag-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.cityNameEn')} helperText={t('form.cityNameEnHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:flag-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.cityNameAr')} helperText={t('form.cityNameArHelper')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.governorate')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:map-point-bold" className="text-violet-500" width={16} />
                {t('columns.governorate')}
              </Typography>
              <RHFInfiniteSelect
                name="governorate_id"
                queryKey={['governorates', 'infinite', 'city-form']}
                fetcher={governorateFetcher}
                placeholder={t('form.selectGovernorate')}
                helperText={t('form.cityGovernorateHelper')}
                initialLabel={cityData?.governorate?.name}
              />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
