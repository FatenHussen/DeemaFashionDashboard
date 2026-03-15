import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  CategorySchema,
  type CategoryFormValues,
} from '@/pages/dashboard/categories/validation/category.validation';
import {
  useCreateCategory,
  useUpdateCategory,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Category ${CONFIG.appName}` };

const parentCategoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit, parent_id: 0 }).then((r) => {
    const items = (r.data?.items ?? []).map((cat) => ({
      id: cat.id,
      label: typeof cat.name === 'object' ? formatTranslated(cat.name) : String(cat.name ?? ''),
    }));
    return {
      data: {
        items: page === 1 ? [{ id: 0, label: 'No parent' }, ...items] : items,
        pagination:
          r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
      },
    };
  });

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Hooks for fetching and mutations
  const { data: categoryData, isLoading: isLoadingCategory } = useFetchCategoryById(id || '');
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

  const parentCategoryLabel =
    categoryData?.data?.parent &&
    (typeof categoryData.data.parent.name === 'object'
      ? formatTranslated(categoryData.data.parent.name)
      : categoryData.data.parent.name);

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
        description={
          isEditMode ? 'Update category information' : 'Add a new category to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingCategory}
        loadingText={t('form.loadingCategory')}
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
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.namePlaceholder')}
            helperText={t('form.categoryNameArHelper')}
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
            placeholder={t('form.namePlaceholder')}
            helperText={t('form.categoryNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Description Field - Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.descriptionAr')}
            </Typography>
          </Box>
          <Controller
            name="description.ar"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="w-full">
                <textarea
                  {...field}
                  placeholder="e.g., أجهزة وإكسسوارات"
                  dir="rtl"
                  rows={3}
                  className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-input focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {error?.message ?? 'Enter the category description in Arabic'}
                </p>
              </div>
            )}
          />
        </Box>

        {/* Description Field - English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.descriptionEn')}
            </Typography>
          </Box>
          <Controller
            name="description.en"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="w-full">
                <textarea
                  {...field}
                  placeholder={t('form.devicesGadgetsPlaceholder')}
                  rows={3}
                  className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-input focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {error?.message ?? 'Enter the category description in English'}
                </p>
              </div>
            )}
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
          <RHFInfiniteSelect
            name="parent_id"
            queryKey={['categories', 'infinite', 'parent-form']}
            fetcher={parentCategoryFetcher}
            placeholder={t('form.parentCategoryPlaceholder')}
            helperText={t('form.selectParentCategoryHelper')}
            initialLabel={parentCategoryLabel ?? undefined}
          />
        </Box>

        {/* Icon Upload Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
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
