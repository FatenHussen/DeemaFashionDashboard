import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography, SimpleSelect } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchAreaById,
  useCreateArea,
  useUpdateArea,
} from '@/pages/dashboard/locations/hooks/area';
import { useFetchCities } from '@/pages/dashboard/locations/hooks/city';
import {
  AreaSchema,
  type AreaFormValues,
} from '@/pages/dashboard/locations/validation/area.validation';

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
  };

  const methods = useForm<AreaFormValues>({
    resolver: zodResolver(AreaSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  // Fetch area data if in edit mode
  useEffect(() => {
    if (isEditMode && areaData && !isLoadingArea) {
      // API returns name as string, but form expects {ar, en}
      const nameValue =
        typeof areaData.name === 'string'
          ? { ar: areaData.name, en: areaData.name }
          : areaData.name;

      reset({
        name: nameValue,
        city_id: areaData.city?.id || 0,
      });
    }
  }, [areaData, isEditMode, isLoadingArea, reset]);

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;
  const errorMessage =
    createAreaMutation.error?.message || updateAreaMutation.error?.message || null;

  const onSubmit = async (data: AreaFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        city_id: data.city_id,
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
      </CreateFormLayout>
    </>
  );
}
