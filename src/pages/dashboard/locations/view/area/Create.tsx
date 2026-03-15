import type { Resolver } from 'react-hook-form';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { _CityApi } from '@/pages/dashboard/locations/api/city.services';
import {
  AreaSchema,
  type AreaFormValues,
} from '@/pages/dashboard/locations/validation/area.validation';
import {
  useCreateArea,
  useUpdateArea,
  useFetchAreaById,
} from '@/pages/dashboard/locations/hooks/area';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { MapPicker, MAP_DEFAULT_CENTER } from 'src/shared/components/map/map-picker';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const metadata = { title: `Area ${CONFIG.appName}` };

// Cities API loads all at once — fake single-page pagination
const cityFetcher = (_page: number, _limit: number) =>
  _CityApi.getListCities().then((r) => ({
    data: {
      items: r.data.items.map((city) => ({ id: city.id, label: city.name })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: areaData, isLoading: isLoadingArea } = useFetchAreaById(id || '');
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();

  const defaultValues: AreaFormValues = {
    name: {
      en: '',
      ar: '',
    },
    city_id: 0,
    lat: String(MAP_DEFAULT_CENTER[0]),
    lng: String(MAP_DEFAULT_CENTER[1]),
    base_fee: '',
  };

  const methods = useForm<AreaFormValues>({
    resolver: zodResolver(AreaSchema) as Resolver<AreaFormValues>,
    defaultValues,
  });

  const { handleSubmit, reset, setValue, watch } = methods;
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');

  // Fetch area data if in edit mode
  useEffect(() => {
    if (isEditMode && areaData && !isLoadingArea) {
      // API returns name as string or {ar, en}
      const rawName = areaData.name as string | { ar?: string; en?: string };
      const nameValue =
        typeof rawName === 'string'
          ? { ar: rawName, en: rawName }
          : { ar: rawName?.ar ?? '', en: rawName?.en ?? '' };

      const baseFee =
        areaData.base_fee != null ? String(areaData.base_fee) : '';

      const hasCoords = areaData.lat != null && areaData.lng != null && !Number.isNaN(Number(areaData.lat)) && !Number.isNaN(Number(areaData.lng));
      const latVal = hasCoords ? String(areaData.lat) : String(MAP_DEFAULT_CENTER[0]);
      const lngVal = hasCoords ? String(areaData.lng) : String(MAP_DEFAULT_CENTER[1]);

      reset({
        name: nameValue,
        city_id: areaData.city?.id || 0,
        lat: latVal,
        lng: lngVal,
        base_fee: baseFee,
      });
    }
  }, [areaData, isEditMode, isLoadingArea, reset]);

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;
  const errorMessage =
    createAreaMutation.error?.message || updateAreaMutation.error?.message || null;

  const onSubmit = async (data: AreaFormValues) => {
    try {
      const numLat = data.lat ? parseFloat(data.lat) : NaN;
      const numLng = data.lng ? parseFloat(data.lng) : NaN;
      const hasValidCoords = !Number.isNaN(numLat) && !Number.isNaN(numLng);

      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        city_id: data.city_id,
        lat: hasValidCoords ? numLat : MAP_DEFAULT_CENTER[0],
        lng: hasValidCoords ? numLng : MAP_DEFAULT_CENTER[1],
        base_fee: data.base_fee ?? '',
      };

      if (isEditMode && id) {
        await updateAreaMutation.mutateAsync({ id, data: payload });
        toast.success('Area updated successfully');
        navigate('/locations/area');
      } else {
        await createAreaMutation.mutateAsync(payload);
        toast.success('Area created successfully');
        navigate('/locations/area');
      }
    } catch (error: any) {
      console.error('Error saving area:', error);
    }
  };

  const handleCancel = () => {
    navigate('/locations/area');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names are provided and a city is selected.'
    : 'Fill in both Arabic and English names and select a city to create a new area.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Area | ${metadata.title}` : `Create Area | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Area' : 'Create New Area'}
        description={isEditMode ? 'Update area information' : 'Add a new area to your system'}
        isEditMode={isEditMode}
        isLoading={isLoadingArea}
        loadingText={t('form.loadingArea')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Area' : 'Create Area'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
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
            placeholder={t('form.areaNameAr')}
            helperText={t('form.areaNameArHelper')}
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
            placeholder={t('form.areaNameEn')}
            helperText={t('form.areaNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* City Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.city')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="city_id"
            queryKey={['cities', 'infinite', 'area-form']}
            fetcher={cityFetcher}
            placeholder={t('form.selectCity')}
            helperText={t('form.areaCityHelper')}
            initialLabel={areaData?.city?.name}
          />
        </Box>

        {/* Map - Pick Location */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:map-point-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Location
            </Typography>
          </Box>
          <MapPicker
            lat={watchedLat ?? ''}
            lng={watchedLng ?? ''}
            onChange={(latVal, lngVal) => {
              setValue('lat', latVal, { shouldDirty: true });
              setValue('lng', lngVal, { shouldDirty: true });
            }}
            height="280px"
          />
          <Typography variant="caption" className="text-muted-foreground mt-1 block">
            Click on the map to set the area location
          </Typography>
        </Box>

        {/* Base Fee */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:dollar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.baseFee')}
            </Typography>
          </Box>
          <RHFTextField
            name="base_fee"
            placeholder={t('form.baseFee')}
            helperText={t('form.areaBaseFeeHelper')}
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
