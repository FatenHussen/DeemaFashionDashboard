import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller } from 'react-hook-form';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';
import {
  CategoryDetailSchema,
  type CategoryDetailFormValues,
} from '@/pages/dashboard/categories/validation/category-detail.validation';
import {
  useCreateCategoryDetail,
  useUpdateCategoryDetail,
  useFetchCategoryDetailById,
} from '@/pages/dashboard/categories/hooks/category-detail';

import { CONFIG } from 'src/global-config';
import { Box, Typography, SimpleSelect } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Category Detail ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: categoryDetailData, isLoading: isLoadingDetail } =
    useFetchCategoryDetailById(id || '');
  const { data: categoriesResponse } = useFetchCategories(1, 100); // Fetch all for category dropdown
  const createCategoryDetailMutation = useCreateCategoryDetail();
  const updateCategoryDetailMutation = useUpdateCategoryDetail();

  const defaultValues: CategoryDetailFormValues = {
    category_id: 0,
    name: {
      en: '',
      ar: '',
    },
  };

  const methods = useForm<CategoryDetailFormValues>({
    resolver: zodResolver(CategoryDetailSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  // Fetch category detail data if in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      categoryDetailData?.data &&
      !isLoadingDetail &&
      categoriesResponse?.data?.items
    ) {
      const detail = categoryDetailData.data;
      reset({
        category_id: detail.category.id,
        name: detail.name,
      });
    }
  }, [categoryDetailData, isEditMode, isLoadingDetail, reset, categoriesResponse?.data?.items]);

  const isSubmitting =
    createCategoryDetailMutation.isPending || updateCategoryDetailMutation.isPending;
  const errorMessage =
    createCategoryDetailMutation.error?.message ||
    updateCategoryDetailMutation.error?.message ||
    null;

  const onSubmit = async (data: CategoryDetailFormValues) => {
    try {
      const payload = {
        category_id: data.category_id,
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
      };

      if (isEditMode && id) {
        await updateCategoryDetailMutation.mutateAsync({ id, data: payload });
        toast.success('Category detail updated successfully');
        navigate('/categories/details');
      } else {
        await createCategoryDetailMutation.mutateAsync(payload);
        toast.success('Category detail created successfully');
        navigate('/categories/details');
      }
    } catch (error: any) {
      console.error('Error saving category detail:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories/details');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names are provided.'
    : 'Fill in the category and detail name. Make sure both Arabic and English names are provided.';

  // Prepare category options
  const categoryOptions =
    categoriesResponse?.data?.items.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || [];

  return (
    <>
      <title>
        {isEditMode
          ? `Edit Category Detail | ${metadata.title}`
          : `Create Category Detail | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Category Detail' : 'Create New Category Detail'}
        description={
          isEditMode
            ? 'Update category detail information'
            : 'Add a new category detail to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingDetail}
        loadingText="Loading category detail data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Detail' : 'Create Detail'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Category Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:diagram-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Category
            </Typography>
          </Box>
          <Controller
            name="category_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SimpleSelect
                value={value || ''}
                onChange={(val) => onChange(val ? Number(val) : 0)}
                options={categoryOptions}
                placeholder="Select a category"
                error={!!error}
                helperText={error?.message || 'Select the category for this detail'}
                fullWidth
                className="transition-all duration-200"
              />
            )}
          />
        </Box>

        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-5-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Detail Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder="e.g., الضمان"
            helperText="Enter the detail name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-5-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Detail Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder="e.g., Warranty"
            helperText="Enter the detail name in English"
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
