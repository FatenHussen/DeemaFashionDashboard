import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
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

const metadata = { title: `Government ${CONFIG.appName}` };

export default function CreatePage() {
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
        toast.success('Governorate updated successfully');
        navigate('/locations');
      } else {
        await createGovernorateMutation.mutateAsync(payload);
        toast.success('Governorate created successfully');
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
    ? 'You can update any field. Make sure both Arabic and English names are provided.'
    : 'Fill in both Arabic and English names to create a new governorate.';

  return (
    <>
      <title>
        {isEditMode
          ? `Edit Government | ${metadata.title}`
          : `Create Government | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Governorate' : 'Create New Governorate'}
        description={
          isEditMode ? 'Update governorate information' : 'Add a new governorate to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingGovernorate}
        loadingText="Loading governorate data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Governorate' : 'Create Governorate'}
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
            placeholder="e.g., دمشق"
            helperText="Enter the governorate name in Arabic"
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
            placeholder="e.g., Damascus"
            helperText="Enter the governorate name in English"
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
