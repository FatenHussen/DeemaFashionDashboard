import type { Resolver } from 'react-hook-form';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchCities } from '@/pages/dashboard/locations/hooks/city';
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
import { Box, Typography, SimpleSelect } from 'src/shared/ui';
import { MapPicker, MAP_DEFAULT_CENTER } from 'src/shared/components/map/map-picker';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Area ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: areaData, isLoading: isLoadingArea } = useFetchAreaById(id || '');
  const { data: citiesResponse } = useFetchCities();
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

  const { handleSubmit, reset, control, setValue, watch } = methods;
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

  // Prepare city options
  const cityOptions =
    citiesResponse?.data?.items.map((city) => ({
      value: city.id,
      label: city.name,
    })) || [];

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
        loadingText="Loading area data..."
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
              Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder="e.g., المزة"
            helperText="Enter the area name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder="e.g., Mezzeh"
            helperText="Enter the area name in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* City Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              City
            </Typography>
          </Box>
          <Controller
            name="city_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SimpleSelect
                value={value || ''}
                onChange={(val) => onChange(Number(val))}
                options={cityOptions}
                placeholder="Select a city"
                error={!!error}
                helperText={error?.message || 'Select the city for this area'}
                fullWidth
                className="transition-all duration-200"
              />
            )}
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
              Base Fee
            </Typography>
          </Box>
          <RHFTextField
            name="base_fee"
            placeholder="e.g., 700"
            helperText="Enter the base delivery fee"
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
