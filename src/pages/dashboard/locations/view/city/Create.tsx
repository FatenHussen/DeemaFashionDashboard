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
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateCity') : t('form.createCitySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCity') : t('form.creatingCity')}
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
            placeholder={t('form.cityNameAr')}
            helperText={t('form.cityNameArHelper')}
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
            placeholder={t('form.cityNameEn')}
            helperText={t('form.cityNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Governorate Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.governorate')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="governorate_id"
            queryKey={['governorates', 'infinite', 'city-form']}
            fetcher={governorateFetcher}
            placeholder={t('form.selectGovernorate')}
            helperText={t('form.cityGovernorateHelper')}
            initialLabel={cityData?.governorate?.name}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
