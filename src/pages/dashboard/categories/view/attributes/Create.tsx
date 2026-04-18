import { toast } from 'react-toastify';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useForm, useWatch, Controller, useFieldArray } from 'react-hook-form';
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

function hexForDisplay(value: string | undefined) {
  const raw = value?.trim().replace(/\s/g, '') ?? '';
  if (!raw) return '';
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const typeOptions = useMemo(
    () => [
      { value: 'color', label: t('form.attributeTypeColor') },
      { value: 'square', label: t('form.attributeTypeSquare') },
      { value: 'circle', label: t('form.attributeTypeCircle') },
    ],
    [t]
  );

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

  const { handleSubmit, reset, control, setValue } = methods;
  const attributeType = useWatch({ control, name: 'type' });
  const watchedValues = useWatch({ control, name: 'values' });
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
          attribute.type === 'color'
            ? []
            : attribute.values?.length > 0
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

  useEffect(() => {
    if (attributeType === 'color') {
      if (!isEditMode && watchedValues.length > 0) {
        setValue('values', [], { shouldValidate: true, shouldDirty: true });
      }
      return;
    }

    if (watchedValues.length === 0) {
      setValue('values', [{ name: { en: '', ar: '' } }], { shouldValidate: true });
    }
  }, [attributeType, watchedValues, setValue, isEditMode]);

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
        ...(data.type !== 'color'
          ? {
              values: data.values.map((val) => ({
                name: {
                  en: val.name.en,
                  ar: val.name.ar,
                },
              })),
            }
          : {}),
      };

      if (isEditMode && id) {
        await updateCategoryAttributeMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.categoryAttributeUpdatedSuccess'));
        navigate('/categories/attributes');
      } else {
        await createCategoryAttributeMutation.mutateAsync(payload);
        toast.success(t('form.categoryAttributeCreatedSuccess'));
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
    ? t('form.categoryAttributeFormInfoEdit')
    : t('form.categoryAttributeFormInfoCreate');

  return (
    <>
      <title>
        {`${isEditMode ? t('form.editCategoryAttribute') : t('form.createCategoryAttribute')} | ${t('form.categoryAttributeBrandedTitle', { app: CONFIG.appName })}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCategoryAttribute') : t('form.createCategoryAttribute')}
        description={
          isEditMode ? t('form.editCategoryAttributeDesc') : t('form.createCategoryAttributeDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingAttribute}
        loadingText={t('form.loadingCategoryAttribute')}
        infoText={infoText}
        submitLabel={
          isEditMode ? t('form.updateCategoryAttributeSubmit') : t('form.createCategoryAttributeSubmit')
        }
        submittingLabel={
          isEditMode ? t('form.updatingCategoryAttribute') : t('form.creatingCategoryAttribute')
        }
      >
        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:settings-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryLabel')} & {t('form.attributeTypeLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:diagram-bold" className="text-violet-500" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:settings-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.attributeTypeLabel')}
                </Typography>
              </Box>
              <Controller
                name="type"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <SimpleSelect
                    value={value || ''}
                    onChange={onChange}
                    options={typeOptions}
                    placeholder={t('form.selectAttributeType')}
                    error={!!error}
                    helperText={error?.message || t('form.attributeTypeHelperText')}
                    fullWidth
                    className="transition-all duration-200"
                  />
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')} / {t('form.nameEn')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-bold" className="text-primary" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-bold" className="text-primary" width={20} height={20} />
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
          </Box>
        </Box>

        {/* ── Section: Color Values (edit mode only) ── */}
        {isEditMode && attributeType === 'color' && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:palette-bold" className="text-rose-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.attributeValuesSection')}
              </Typography>
            </Box>
            <Box className="p-6">
              <Typography variant="caption" className="text-muted-foreground block mb-4">
                {t('form.attributeColorValuesReadOnlyHint')}
              </Typography>
              <Box className="flex flex-wrap gap-3 p-4 border border-border/60 rounded-xl bg-muted/20">
                {(categoryAttributeData?.data?.values ?? []).map((val) => {
                  const hex = hexForDisplay(val.name?.en || val.name?.ar);
                  return (
                    <Box
                      key={val.id ?? `${hex}-${val.name?.en}-${val.name?.ar}`}
                      className="flex flex-col items-center gap-1"
                      title={hex}
                    >
                      <Box
                        className="h-10 w-10 shrink-0 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: hex || undefined }}
                      />
                      <Typography variant="caption" className="text-muted-foreground max-w-[4.5rem] truncate">
                        {hex || '—'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Section: Attribute Values ── */}
        {attributeType !== 'color' && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="flex items-center gap-3">
                <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Iconify icon="solar:list-bold" className="text-amber-500" width={15} />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.attributeValuesSection')}
                </Typography>
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => append({ name: { en: '', ar: '' } })}
                className="flex items-center gap-2"
              >
                <Iconify icon="solar:add-circle-bold" width={18} height={18} />
                {t('form.addAttributeValue')}
              </Button>
            </Box>
            <Box className="p-6 flex flex-col gap-4">
              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  className="rounded-xl border border-border/50 bg-background/60 overflow-hidden"
                >
                  <Box className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                    <Typography variant="body2" className="font-medium text-foreground">
                      {t('form.attributeValueIndex', { n: index + 1 })}
                    </Typography>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => remove(index)}
                        className="flex items-center gap-1.5"
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={14} height={14} />
                        {t('form.removeAttributeValue')}
                      </Button>
                    )}
                  </Box>
                  <Box className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}
