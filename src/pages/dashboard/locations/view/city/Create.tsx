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
  useFetchCityById,
  useCreateCity,
  useUpdateCity,
} from '@/pages/dashboard/locations/hooks/city';
import { useFetchGovernorates } from '@/pages/dashboard/locations/hooks/governorate';
import {
  CitySchema,
  type CityFormValues,
} from '@/pages/dashboard/locations/validation/city.validation';

// ----------------------------------------------------------------------

const metadata = { title: `City ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: cityData, isLoading: isLoadingCity } = useFetchCityById(id || '');
  const { data: governoratesResponse } = useFetchGovernorates();
  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();

  console.log(governoratesResponse);

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

  const { handleSubmit, reset, control } = methods;

  // Fetch city data if in edit mode
  useEffect(() => {
    if (isEditMode && cityData && !isLoadingCity) {
      // API returns name as string, but form expects {ar, en}
      const nameValue =
        typeof cityData.name === 'string'
          ? { ar: cityData.name, en: cityData.name }
          : cityData.name;

      reset({
        name: nameValue,
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
        toast.success('City updated successfully');
        navigate('/locations/city');
      } else {
        await createCityMutation.mutateAsync(payload);
        toast.success('City created successfully');
        navigate('/locations/city');
      }
    } catch (error: any) {
      console.error('Error saving city:', error);
    }
  };

  const handleCancel = () => {
    navigate('/locations/city');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names are provided and a governorate is selected.'
    : 'Fill in both Arabic and English names and select a governorate to create a new city.';

  // Prepare governorate options
  const governorateOptions =
    governoratesResponse?.data?.items.map((gov) => ({
      value: gov.id,
      label: gov.name,
    })) || [];

  return (
    <>
      <title>
        {isEditMode ? `Edit City | ${metadata.title}` : `Create City | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit City' : 'Create New City'}
        description={isEditMode ? 'Update city information' : 'Add a new city to your system'}
        isEditMode={isEditMode}
        isLoading={isLoadingCity}
        loadingText="Loading city data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update City' : 'Create City'}
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
            placeholder="e.g., مدينة دمشق"
            helperText="Enter the city name in Arabic"
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
            placeholder="e.g., Damascus City"
            helperText="Enter the city name in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* Governorate Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:flag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Governorate
            </Typography>
          </Box>
          <Controller
            name="governorate_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SimpleSelect
                value={value || ''}
                onChange={(val) => onChange(Number(val))}
                options={governorateOptions}
                placeholder="Select a governorate"
                error={!!error}
                helperText={error?.message || 'Select the governorate for this city'}
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
