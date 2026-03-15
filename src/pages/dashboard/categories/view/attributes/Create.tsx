import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  CategoryAttributeSchema,
  type CategoryAttributeFormValues,
} from '@/pages/dashboard/categories/validation/category-attribute.validation';
import {
  useCreateCategoryAttribute,
  useUpdateCategoryAttribute,
  useFetchCategoryAttributeById,
} from '@/pages/dashboard/categories/hooks/category-attribute';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography, SimpleSelect } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Category Attribute ${CONFIG.appName}` };

const categoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit }).then((r) => ({
    data: {
      items: (r.data?.items ?? []).map((cat) => ({
        id: cat.id,
        label: typeof cat.name === 'object' ? formatTranslated(cat.name) : cat.name,
      })),
      pagination: r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
    },
  }));

const TYPE_OPTIONS = [
  { value: 'color', label: 'Color' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
];

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: categoryAttributeData, isLoading: isLoadingAttribute } =
    useFetchCategoryAttributeById(id || '');
  const { data: categoriesResponse } = useFetchCategories(1, 500); // For edit mode: resolve category_id from name
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
    if (isEditMode && categoryAttributeData?.data && !isLoadingAttribute) {
      const attribute = categoryAttributeData.data;
      let categoryId = 0;
      if (categoriesResponse?.data?.items?.length) {
        const foundCategory = categoriesResponse.data.items.find((cat: any) => {
          const catName = typeof cat.name === 'object' ? formatTranslated(cat.name) : cat.name;
          return catName === attribute.category;
        });
        categoryId = foundCategory?.id ?? 0;
      }
      reset({
        category_id: categoryId,
        name: attribute.name,
        type: attribute.type,
        values:
          attribute.values?.length > 0
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
        loadingText={t('form.loadingCategoryAttribute')}
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
              {t('form.categoryLabel')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="category_id"
            queryKey={['categories', 'infinite', 'attribute-form']}
            fetcher={categoryFetcher}
            placeholder={t('form.selectCategory')}
            helperText={t('form.attributeCategoryHelper')}
            initialLabel={categoryAttributeData?.data?.category}
          />
        </Box>

        {/* Name Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.colorNameAr')}
            helperText={t('form.attributeNameArHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Name Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder={t('form.colorNameEn')}
            helperText={t('form.attributeNameEnHelper')}
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
                placeholder={t('form.selectAttributeType')}
                error={!!error}
                helperText={
                  error?.message || 'Select the type of attribute (color, square, circle)'
                }
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
              className="flex items-center gap-2"
            >
              <Iconify icon="solar:add-circle-bold" width={20} height={20} />
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
                    className="flex items-center gap-2"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
                    Remove
                  </Button>
                )}
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFTextField
                  name={`values.${index}.name.en`}
                  placeholder={t('form.valueEn')}
                  label={t('form.nameEn')}
                  className="transition-all duration-200"
                />
                <RHFTextField
                  name={`values.${index}.name.ar`}
                  placeholder={t('form.valueAr')}
                  label={t('form.nameAr')}
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
