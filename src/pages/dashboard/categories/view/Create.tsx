import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { buildParentPickerOptions } from '@/pages/dashboard/categories/utils/build-parent-picker-options';
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
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const queryParentId = useMemo(() => {
    const raw = searchParams.get('parent_id');
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const { data: flatForParent, dataUpdatedAt: flatParentDataUpdatedAt } = useQuery({
    queryKey: ['categories', 'flat-parent-picker'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const parentPickerRows = useMemo(
    () =>
      buildParentPickerOptions(flatForParent?.data?.items ?? [], {
        excludeCategoryId: isEditMode && id ? Number(id) : undefined,
      }),
    [flatForParent?.data?.items, id, isEditMode]
  );

  const parentCategoryFetcher = useCallback(
    (page: number, limit: number) => {
      const none = { id: 0, label: t('form.noParent') };
      const rows = parentPickerRows.map((r) => ({ id: r.id, label: r.label }));
      const allRows = [none, ...rows];
      const total = allRows.length;
      const lastPage = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const items = allRows.slice(start, start + limit);
      return Promise.resolve({
        data: {
          items,
          pagination: {
            current_page: page,
            last_page: lastPage,
            per_page: limit,
            total,
          },
        },
      });
    },
    [parentPickerRows, t]
  );

  // Hooks for fetching and mutations
  const { data: categoryData, isLoading: isLoadingCategory } = useFetchCategoryById(id || '');
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const defaultValues: CategoryFormValues = useMemo(
    () => ({
      name: {
        en: '',
        ar: '',
      },
      icon: null,
      parent_id: !isEditMode ? queryParentId : null,
      order: 0,
      is_active: true,
      is_restaurant: false,
    }),
    [isEditMode, queryParentId]
  );

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const iconValue = watch('icon');

  useEffect(() => {
    if (isEditMode) return;
    if (queryParentId != null && queryParentId > 0) {
      setValue('parent_id', queryParentId);
    }
  }, [isEditMode, queryParentId, setValue]);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode && categoryData?.data && !isLoadingCategory) {
      const category = categoryData.data;
      reset({
        name: category.name,
        icon: null, // Don't pre-fill file input
        parent_id: category.parent_id,
        order: (category as any).order ?? 0,
        is_active: Boolean((category as any).is_active),
        is_restaurant: Boolean((category as any).is_restaurant),
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
        icon: data.icon || null,
        parent_id: data.parent_id || null,
        order: data.order ?? 0,
        is_active: data.is_active,
        is_restaurant: data.is_restaurant,
      };

      if (isEditMode && id) {
        await updateCategoryMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.categoryUpdatedSuccess'));
        navigate('/categories');
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success(t('form.categoryCreatedSuccess'));
        navigate('/categories');
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  const infoText = isEditMode ? t('form.categoryFormInfoEdit') : t('form.categoryFormInfoCreate');

  const parentCategoryLabel =
    categoryData?.data?.parent &&
    (typeof categoryData.data.parent.name === 'object'
      ? formatTranslated(categoryData.data.parent.name)
      : categoryData.data.parent.name);

  return (
    <>
      <title>
        {`${isEditMode ? t('form.editCategory') : t('form.createCategory')} | ${t('form.categoryBrandedTitle', { app: CONFIG.appName })}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCategory') : t('form.createCategory')}
        description={isEditMode ? t('form.editCategoryDesc') : t('form.createCategoryDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingCategory}
        loadingText={t('form.loadingCategory')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateCategorySubmit') : t('form.createCategorySubmit')}
        submittingLabel={isEditMode ? t('form.updatingCategory') : t('form.creatingCategory')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
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
                placeholder={t('form.namePlaceholder')}
                helperText={t('form.categoryNameArHelper')}
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
                placeholder={t('form.categoryNameEnPlaceholder')}
                helperText={t('form.categoryNameEnHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Organization ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:diagram-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.parentCategorySection')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:diagram-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.parentCategorySection')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="parent_id"
                queryKey={[
                  'categories',
                  'infinite',
                  'parent-form',
                  flatParentDataUpdatedAt ?? 0,
                  isEditMode ? id : '',
                ]}
                fetcher={parentCategoryFetcher}
                placeholder={t('form.parentCategoryPlaceholder')}
                helperText={t('form.selectParentCategoryHelper')}
                initialLabel={parentCategoryLabel ?? undefined}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:sort-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.order')}
                </Typography>
              </Box>
              <RHFTextField
                name="order"
                type="number"
                placeholder={t('form.placeholderZero')}
                helperText={t('form.orderHelper')}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status Settings ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:shield-check-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('statusLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('active')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.isActiveHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />

            <Controller
              name="is_restaurant"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-orange-500/40 hover:bg-orange-500/[0.02] transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:shop-bold" className="text-orange-500" width={16} height={16} />
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('form.isRestaurant')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.isRestaurantHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryIconSection')}
            </Typography>
          </Box>
          <Box className="p-6">
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
                    helperText={error?.message || t('form.categoryIconUploadHelper')}
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {previewImage && (
                    <Box className="mt-5 flex items-center gap-4">
                      <Box className="relative">
                        <Box className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm" />
                        <img
                          src={previewImage}
                          alt={t('form.categoryIconPreviewAlt')}
                          className="relative w-24 h-24 object-cover rounded-xl border border-border/60 shadow-sm"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" className="font-medium text-foreground">
                          {t('form.categoryIconPreviewAlt')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.categoryIconUploadHelper')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
