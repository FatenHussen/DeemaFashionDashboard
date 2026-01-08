import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography, SimpleSelect, Input } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchCategoryById,
  useCreateCategory,
  useUpdateCategory,
} from '@/pages/dashboard/categories/hooks/category';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';
import {
  CategorySchema,
  type CategoryFormValues,
} from '@/pages/dashboard/categories/validation/category.validation';

// ----------------------------------------------------------------------

const metadata = { title: `Category ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Hooks for fetching and mutations
  const { data: categoryData, isLoading: isLoadingCategory } = useFetchCategoryById(id || '');
  const { data: categoriesResponse } = useFetchCategories(1, 100); // Fetch all for parent dropdown
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const defaultValues: CategoryFormValues = {
    name: {
      en: '',
      ar: '',
    },
    description: {
      en: '',
      ar: '',
    },
    icon: null,
    parent_id: null,
  };

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const iconValue = watch('icon');

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode && categoryData?.data && !isLoadingCategory) {
      const category = categoryData.data;
      reset({
        name: category.name,
        description: category.description,
        icon: null, // Don't pre-fill file input
        parent_id: category.parent_id,
      });
      
      // Set preview image if icon exists
      if (category.icon) {
        setPreviewImage(category.icon);
      }
    }
  }, [categoryData, isEditMode, isLoadingCategory, reset]);

  // Update preview when icon changes
  useEffect(() => {
    if (iconValue && iconValue instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(iconValue);
    } else if (!iconValue) {
      setPreviewImage(null);
    }
  }, [iconValue]);

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const errorMessage =
    createCategoryMutation.error?.message || updateCategoryMutation.error?.message || null;

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        description: {
          en: data.description.en,
          ar: data.description.ar,
        },
        icon: data.icon || null,
        parent_id: data.parent_id || null,
      };

      if (isEditMode && id) {
        await updateCategoryMutation.mutateAsync({ id, data: payload });
        toast.success('Category updated successfully');
        navigate('/categories');
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success('Category created successfully');
        navigate('/categories');
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names and descriptions are provided.'
    : 'Fill in both Arabic and English names and descriptions to create a new category. You can optionally select a parent category and upload an icon.';

  // Prepare parent category options (only categories without parents)
  const parentOptions =
    categoriesResponse?.data?.items
      .filter((cat) => cat.parent_id === null)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })) || [];

  return (
    <>
      <title>
        {isEditMode ? `Edit Category | ${metadata.title}` : `Create Category | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Category' : 'Create New Category'}
        description={isEditMode ? 'Update category information' : 'Add a new category to your system'}
        isEditMode={isEditMode}
        isLoading={isLoadingCategory}
        loadingText="Loading category data..."
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Category' : 'Create Category'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder="e.g., إلكترونيات"
            helperText="Enter the category name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder="e.g., Electronics"
            helperText="Enter the category name in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* Description Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Description (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="description.ar"
            placeholder="e.g., أجهزة وإكسسوارات"
            helperText="Enter the category description in Arabic"
            className="transition-all duration-200"
            dir="rtl"
            multiline
            rows={3}
          />
        </Box>

        {/* Description Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Description (English)
            </Typography>
          </Box>
          <RHFTextField
            name="description.en"
            placeholder="e.g., Devices and gadgets"
            helperText="Enter the category description in English"
            className="transition-all duration-200"
            multiline
            rows={3}
          />
        </Box>

        {/* Parent Category Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:diagram-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Parent Category (Optional)
            </Typography>
          </Box>
          <Controller
            name="parent_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SimpleSelect
                value={value || ''}
                onChange={(val) => onChange(val ? Number(val) : null)}
                options={parentOptions}
                placeholder="Select a parent category (optional)"
                error={!!error}
                helperText={error?.message || 'Select a parent category if this is a subcategory'}
                fullWidth
                className="transition-all duration-200"
              />
            )}
          />
        </Box>

        {/* Icon Upload Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Category Icon (Optional)
            </Typography>
          </Box>
          <Controller
            name="icon"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file || null);
                  }}
                  error={!!error}
                  helperText={error?.message || 'Upload a category icon image'}
                  fullWidth
                  className="transition-all duration-200"
                />
                {previewImage && (
                  <Box className="mt-4">
                    <img
                      src={previewImage}
                      alt="Category icon preview"
                      className="w-32 h-32 object-cover rounded-lg border border-border/60"
                    />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}

