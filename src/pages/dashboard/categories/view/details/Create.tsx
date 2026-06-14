import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, useFieldArray } from 'react-hook-form';
import { formatTranslated } from '@/utils/format-translated';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { MAX_CATEGORY_SUB_LEVELS } from '@/pages/dashboard/categories/utils/category-cascade-shared';
import { CategoryLeafCascadeFields } from '@/pages/dashboard/categories/components/category-leaf-cascade-fields';
import {
  CategoryDetailSchema,
  type CategoryDetailFormValues,
} from '@/pages/dashboard/categories/validation/category-detail.validation';
import {
  useCreateCategoryDetail,
  useUpdateCategoryDetail,
  useFetchCategoryDetailById,
} from '@/pages/dashboard/categories/hooks/category-detail';
import {
  ancestorsChainFromFlat,
  buildCategorySelectRows,
  paginateSelectRowsLocal,
} from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

type SubmitAction = 'back' | 'stay';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const submitActionRef = useRef<SubmitAction>('back');
  const isEditMode = !!id;

  const {
    data: flatForParent,
    dataUpdatedAt: flatParentDataUpdatedAt,
    isFetched: flatParentFetched,
  } = useQuery({
    queryKey: ['categories', 'flat-parent-picker'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const flatItems = flatForParent?.data?.items ?? [];

  // Hooks for fetching and mutations
  const { data: categoryDetailData, isLoading: isLoadingDetail } =
    useFetchCategoryDetailById(id || '');
  const createCategoryDetailMutation = useCreateCategoryDetail();
  const updateCategoryDetailMutation = useUpdateCategoryDetail();

  const hydrateLeafCategoryId = useMemo(() => {
    const cid = categoryDetailData?.data?.category?.id;
    if (!isEditMode || cid == null) return null;
    const n = Number(cid);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [isEditMode, categoryDetailData?.data?.category?.id]);

  const legacyCategoryCascade = useMemo(() => {
    if (!flatParentFetched || flatItems.length === 0) return false;
    if (hydrateLeafCategoryId == null || hydrateLeafCategoryId <= 0) return false;
    const chain = ancestorsChainFromFlat(flatItems, hydrateLeafCategoryId);
    return chain.length > MAX_CATEGORY_SUB_LEVELS + 1;
  }, [flatParentFetched, flatItems, hydrateLeafCategoryId]);

  const legacyFlatRows = useMemo(() => buildCategorySelectRows(flatItems), [flatItems]);

  const legacyCategoryFetcher = useCallback(
    (page: number, limit: number) => {
      const rows = legacyFlatRows.map((r) => ({
        id: r.id,
        label: r.label,
        depth: r.depth,
        hasChildren: r.hasChildren,
      }));
      return Promise.resolve(paginateSelectRowsLocal(rows, page, limit));
    },
    [legacyFlatRows]
  );

  const defaultValues: CategoryDetailFormValues = {
    category_id: 0,
    name: {
      en: '',
      ar: '',
    },
    value_options: [],
  };

  const methods = useForm<CategoryDetailFormValues>({
    resolver: zodResolver(CategoryDetailSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, setValue } = methods;

  const syncLeafCategory = useCallback(
    (leafId: number) => {
      setValue('category_id', leafId, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const { fields: valueOptionFields, append: appendValueOption, remove: removeValueOption } =
    useFieldArray({ control, name: 'value_options' });

  // Fetch category detail data if in edit mode
  useEffect(() => {
    if (isEditMode && categoryDetailData?.data && !isLoadingDetail) {
      const detail = categoryDetailData.data;
      const rawOpts = detail.value_options;
      const value_options =
        Array.isArray(rawOpts) && rawOpts.length > 0
          ? rawOpts.map((o) => ({
              en: typeof o?.en === 'string' ? o.en : '',
              ar: typeof o?.ar === 'string' ? o.ar : '',
            }))
          : [];
      reset({
        category_id: detail.category.id,
        name: detail.name,
        value_options,
      });
    }
  }, [categoryDetailData, isEditMode, isLoadingDetail, reset]);

  const isSubmitting =
    createCategoryDetailMutation.isPending || updateCategoryDetailMutation.isPending;
  const errorMessage =
    createCategoryDetailMutation.error?.message ||
    updateCategoryDetailMutation.error?.message ||
    null;

  const onSubmit = async (data: CategoryDetailFormValues) => {
    try {
      const value_options = (data.value_options ?? [])
        .filter((o) => o.en.trim() !== '' || o.ar.trim() !== '')
        .map((o) => ({ en: o.en.trim(), ar: o.ar.trim() }));

      const payload = {
        category_id: data.category_id,
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        value_options,
      };

      if (isEditMode && id) {
        await updateCategoryDetailMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.categoryDetailUpdatedSuccess'));
        if (submitActionRef.current === 'back') {
          navigate('/categories/details');
        }
      } else {
        await createCategoryDetailMutation.mutateAsync(payload);
        toast.success(t('form.categoryDetailCreatedSuccess'));
        if (submitActionRef.current === 'back') {
          navigate('/categories/details');
        }
      }
    } catch (error: any) {
      console.error('Error saving category detail:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories/details');
  };

  const infoText = isEditMode
    ? t('form.categoryDetailFormInfoEdit')
    : t('form.categoryDetailFormInfoCreate');

  return (
    <>
      <title>
        {`${isEditMode ? t('form.editCategoryDetail') : t('form.createCategoryDetail')} | ${t('form.categoryDetailBrandedTitle', { app: CONFIG.appName })}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editCategoryDetail') : t('form.createCategoryDetail')}
        description={
          isEditMode ? t('form.editCategoryDetailDesc') : t('form.createCategoryDetailDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingDetail}
        loadingText={t('form.loadingCategoryDetail')}
        infoText={infoText}
        submitLabel={
          isEditMode ? t('form.updateCategoryDetailSubmit') : t('form.createCategoryDetailSubmit')
        }
        secondarySubmitLabel={t('save')}
        submittingLabel={
          isEditMode ? t('form.updatingCategoryDetail') : t('form.creatingCategoryDetail')
        }
        secondarySubmittingLabel={
          isEditMode ? t('form.updatingCategoryDetail') : t('form.creatingCategoryDetail')
        }
        onSubmitButtonClick={() => {
          submitActionRef.current = 'back';
        }}
        onSecondarySubmitButtonClick={() => {
          submitActionRef.current = 'stay';
        }}
      >
        {/* ── Section: Category ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:diagram-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            {legacyCategoryCascade ? (
              <Box className="space-y-2">
                <Typography variant="caption" className="text-muted-foreground block">
                  {t('form.selectParentCategoryHelper')}
                </Typography>
                <RHFInfiniteSelect
                  name="category_id"
                  queryKey={[
                    'categories',
                    'infinite',
                    'category-detail-form',
                    'legacy-flat',
                    flatParentDataUpdatedAt ?? 0,
                    id ?? '',
                  ]}
                  fetcher={legacyCategoryFetcher}
                  placeholder={t('form.selectCategory')}
                  helperText={t('form.categoryDeepParentHint')}
                  initialLabel={
                    categoryDetailData?.data?.category?.name
                      ? formatTranslated(categoryDetailData.data.category.name)
                      : undefined
                  }
                />
              </Box>
            ) : (
              <CategoryLeafCascadeFields
                t={t}
                legacyMode={false}
                flatItems={flatItems}
                flatParentFetched={flatParentFetched}
                flatParentDataUpdatedAt={flatParentDataUpdatedAt ?? 0}
                hydrateLeafCategoryId={hydrateLeafCategoryId}
                hydrationKey={id ?? 'new-detail'}
                onEffectiveLeafChange={syncLeafCategory}
              />
            )}
          </Box>
        </Box>

        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-5-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')} / {t('form.nameEn')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:widget-5-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder={t('form.warrantyNameAr')}
                helperText={t('form.detailNameArHelper')}
                className="transition-all duration-200"
                dir="rtl"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:widget-5-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder={t('form.warrantyNameEn')}
                helperText={t('form.detailNameEnHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Preset values (value_options) ── Header kept visible: add-value control lives here */}
        <Box className="create-form-section-keep-header rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent flex-wrap">
            <Box className="flex items-center gap-3 min-w-0">
              <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:list-check-bold" className="text-emerald-600" width={15} />
              </Box>
              <Box className="min-w-0">
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.categoryDetailValueOptionsTitle')}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground block">
                  {t('form.categoryDetailValueOptionsDesc')}
                </Typography>
              </Box>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => appendValueOption({ en: '', ar: '' })}
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addValueOption')}
            </Button>
          </Box>
          <Box className="p-6 space-y-4">
            {valueOptionFields.length === 0 ? (
              <Typography variant="body2" className="text-muted-foreground">
                {t('form.categoryDetailValueOptionsEmptyAdmin')}
              </Typography>
            ) : (
              valueOptionFields.map((field, idx) => (
                <Box
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start p-4 rounded-xl border border-border/60 bg-muted/20"
                >
                  <Box className="group min-w-0">
                    <Box className="flex items-center gap-2 mb-2">
                      <Iconify icon="solar:letter-bold" className="text-primary" width={18} />
                      <Typography variant="caption" className="font-medium text-foreground">
                        {t('form.nameEn')}
                      </Typography>
                    </Box>
                    <RHFTextField
                      name={`value_options.${idx}.en`}
                      placeholder={t('form.valueOptionEnPlaceholder')}
                      className="transition-all duration-200"
                    />
                  </Box>
                  <Box className="group min-w-0">
                    <Box className="flex items-center gap-2 mb-2">
                      <Iconify icon="solar:letter-bold" className="text-primary" width={18} />
                      <Typography variant="caption" className="font-medium text-foreground">
                        {t('form.nameAr')}
                      </Typography>
                    </Box>
                    <RHFTextField
                      name={`value_options.${idx}.ar`}
                      placeholder={t('form.valueOptionArPlaceholder')}
                      className="transition-all duration-200"
                      dir="rtl"
                    />
                  </Box>
                  <Box className="flex items-end md:items-center justify-end md:pt-7">
                    <Button
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => removeValueOption(idx)}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-bold" width={18} className="md:mr-0" />
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
