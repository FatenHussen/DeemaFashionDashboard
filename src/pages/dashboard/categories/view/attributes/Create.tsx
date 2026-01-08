import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography, SimpleSelect, Button } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import {
  useFetchCategoryAttributeById,
  useCreateCategoryAttribute,
  useUpdateCategoryAttribute,
} from '@/pages/dashboard/categories/hooks/category-attribute';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';
import {
  CategoryAttributeSchema,
  type CategoryAttributeFormValues,
} from '@/pages/dashboard/categories/validation/category-attribute.validation';

// ----------------------------------------------------------------------

const metadata = { title: `Category Attribute ${CONFIG.appName}` };

const TYPE_OPTIONS = [
  { value: 'color', label: 'Color' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
];

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: categoryAttributeData, isLoading: isLoadingAttribute } =
    useFetchCategoryAttributeById(id || '');
  const { data: categoriesResponse } = useFetchCategories(1, 100); // Fetch all for category dropdown
  const createCategoryAttributeMutation = useCreateCategoryAttribute();
  const updateCategoryAttributeMutation = useUpdateCategoryAttribute();

  const defaultValues: CategoryAttributeFormValues = {
    category_id: 0,
    name: {
      en: '',
      ar: '',
    },
    type: '',
    values: [{ name: { en: '', ar: '' } }],
  };

  const methods = useForm<CategoryAttributeFormValues>({
    resolver: zodResolver(CategoryAttributeSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'values',
  });

  // Fetch category attribute data if in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      categoryAttributeData?.data &&
      !isLoadingAttribute &&
      categoriesResponse?.data?.items
    ) {
      const attribute = categoryAttributeData.data;
      // Find category by name (matching Arabic or English name)
      const foundCategory = categoriesResponse.data.items.find(
        (cat) => cat.name === attribute.category
      );
      reset({
        category_id: foundCategory?.id || 0,
        name: attribute.name,
        type: attribute.type,
        values:
          attribute.values.length > 0
            ? attribute.values.map((val) => ({
                name: val.name,
              }))
            : [{ name: { en: '', ar: '' } }],
      });
    }
  }, [
    categoryAttributeData,
    isEditMode,
    isLoadingAttribute,
    reset,
    categoriesResponse?.data?.items,
  ]);

  const isSubmitting =
    createCategoryAttributeMutation.isPending || updateCategoryAttributeMutation.isPending;
  const errorMessage =
    createCategoryAttributeMutation.error?.message ||
    updateCategoryAttributeMutation.error?.message ||
    null;

  const onSubmit = async (data: CategoryAttributeFormValues) => {
    try {
      const payload = {
        category_id: data.category_id,
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        type: data.type,
        values: data.values.map((val) => ({
          name: {
            en: val.name.en,
            ar: val.name.ar,
          },
        })),
      };

      if (isEditMode && id) {
        await updateCategoryAttributeMutation.mutateAsync({ id, data: payload });
        toast.success('Category attribute updated successfully');
        navigate('/categories/attributes');
      } else {
        await createCategoryAttributeMutation.mutateAsync(payload);
        toast.success('Category attribute created successfully');
        navigate('/categories/attributes');
      }
    } catch (error: any) {
      console.error('Error saving category attribute:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories/attributes');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure both Arabic and English names are provided for the attribute and all values.'
    : 'Fill in the category, attribute name, type, and values. Make sure both Arabic and English names are provided.';

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
          ? `Edit Category Attribute | ${metadata.title}`
          : `Create Category Attribute | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Category Attribute' : 'Create New Category Attribute'}
        description={
          isEditMode
            ? 'Update category attribute information'
            : 'Add a new category attribute to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingAttribute}
        loadingText="Loading category attribute data..."
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Attribute' : 'Create Attribute'}
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
                helperText={error?.message || 'Select the category for this attribute'}
                fullWidth
                className="transition-all duration-200"
              />
            )}
          />
        </Box>

        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Attribute Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder="e.g., اللون"
            helperText="Enter the attribute name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Attribute Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder="e.g., Color"
            helperText="Enter the attribute name in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* Type Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:settings-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Type
            </Typography>
          </Box>
          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SimpleSelect
                value={value || ''}
                onChange={onChange}
                options={TYPE_OPTIONS}
                placeholder="Select attribute type"
                error={!!error}
                helperText={error?.message || 'Select the type of attribute (color, square, circle)'}
                fullWidth
                className="transition-all duration-200"
              />
            )}
          />
        </Box>

        {/* Values Section */}
        <Box className="group">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:list-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Attribute Values
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => append({ name: { en: '', ar: '' } })}
              startIcon={<Iconify icon="solar:add-circle-bold" width={20} height={20} />}
            >
              Add Value
            </Button>
          </Box>

          {fields.map((field, index) => (
            <Box key={field.id} className="mb-4 p-4 border border-border/60 rounded-lg">
              <Box className="flex items-center justify-between mb-3">
                <Typography variant="body2" className="font-medium text-foreground">
                  Value {index + 1}
                </Typography>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => remove(index)}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />}
                  >
                    Remove
                  </Button>
                )}
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFTextField
                  name={`values.${index}.name.en`}
                  placeholder="e.g., Red"
                  label="English Name"
                  className="transition-all duration-200"
                />
                <RHFTextField
                  name={`values.${index}.name.ar`}
                  placeholder="e.g., أحمر"
                  label="Arabic Name"
                  className="transition-all duration-200"
                  dir="rtl"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CreateFormLayout>
    </>
  );
}

