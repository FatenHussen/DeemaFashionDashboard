import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, useFieldArray } from 'react-hook-form';
import { formatTranslated } from '@/utils/format-translated';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { useFetchCategories, useFetchCategoryById } from '@/pages/dashboard/categories/hooks/category';
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
import { Box, Button, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const rootCategoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit, parent_id: null }).then((r) => ({
    data: {
      items: r.data.items.map((cat) => ({ id: cat.id, label: cat.name })),
      pagination: r.data.pagination,
    },
  }));

type SubmitAction = 'back' | 'stay';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const submitActionRef = useRef<SubmitAction>('back');
  const isEditMode = !!id;
  const [mainCategoryId, setMainCategoryId] = useState(0);

  // Hooks for fetching and mutations
  const { data: categoryDetailData, isLoading: isLoadingDetail } =
    useFetchCategoryDetailById(id || '');
  const createCategoryDetailMutation = useCreateCategoryDetail();
  const updateCategoryDetailMutation = useUpdateCategoryDetail();

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

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const categoryId = watch('category_id');
  const categoryMetaId = categoryId && Number(categoryId) > 0 ? Number(categoryId) : 0;

  const { data: selectedCategoryResp } = useFetchCategoryById(categoryMetaId > 0 ? categoryMetaId : '');

  const { data: subcategoriesListResp, isLoading: isLoadingSubCats } = useFetchCategories(
    1,
    10,
    mainCategoryId > 0 ? { parent_id: mainCategoryId } : undefined,
    { enabled: mainCategoryId > 0 }
  );

  const hasChildCategories = useMemo(() => {
    if (mainCategoryId <= 0) return false;
    const items = subcategoriesListResp?.data?.items ?? [];
    const total = subcategoriesListResp?.data?.pagination?.total;
    if (typeof total === 'number') return total > 0;
    return items.length > 0;
  }, [mainCategoryId, subcategoriesListResp]);

  const mainCategoryInitialLabel = useMemo(() => {
    const category = selectedCategoryResp?.data;
    if (!isEditMode || !category) return undefined;
    if (category.parent_id && category.parent) {
      return formatTranslated(category.parent.name);
    }
    return formatTranslated(category.name);
  }, [isEditMode, selectedCategoryResp?.data]);

  const childCategoryFetcher = useCallback(
    (page: number, limit: number) =>
      _CategoryApi.getListCategoriesPaginated({
        page,
        per_page: limit,
        parent_id: mainCategoryId,
      }).then((r) => ({
        data: {
          items: r.data.items.map((cat) => ({ id: cat.id, label: cat.name })),
          pagination: r.data.pagination,
        },
      })),
    [mainCategoryId]
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

  useEffect(() => {
    if (!selectedCategoryResp?.data) return;
    const category = selectedCategoryResp.data;
    const parentId = category.parent_id != null && Number(category.parent_id) > 0 ? Number(category.parent_id) : 0;
    setMainCategoryId(parentId > 0 ? parentId : Number(category.id));
  }, [selectedCategoryResp?.data]);

  useEffect(() => {
    if (mainCategoryId <= 0 || isLoadingSubCats) return;
    if (!hasChildCategories) {
      setValue('category_id', mainCategoryId);
    }
  }, [mainCategoryId, hasChildCategories, isLoadingSubCats, setValue]);

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
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:diagram-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.productMainCategory')}
                </Typography>
              </Box>
              <InfiniteScrollSelect
                value={mainCategoryId}
                onChange={(val) => {
                  setMainCategoryId(val);
                  setValue('category_id', 0);
                }}
                queryKey={['categories', 'infinite', 'category-detail-form', 'roots']}
                fetcher={rootCategoryFetcher}
                placeholder={t('form.selectMainCategory')}
                initialLabel={mainCategoryInitialLabel}
              />
            </Box>
            {hasChildCategories ? (
              <Box className="group mt-4">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:diagram-up-bold" className="text-violet-500" width={20} height={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productSubcategory')}
                  </Typography>
                </Box>
                <RHFInfiniteSelect
                  name="category_id"
                  queryKey={[
                    'categories',
                    'infinite',
                    'category-detail-form',
                    'children',
                    mainCategoryId,
                  ]}
                  fetcher={childCategoryFetcher}
                  placeholder={t('form.selectSubcategory')}
                  helperText={t('form.categoryDetailHelper')}
                  disabled={!mainCategoryId}
                  initialLabel={
                    categoryDetailData?.data?.category?.name
                      ? formatTranslated(categoryDetailData.data.category.name)
                      : undefined
                  }
                />
              </Box>
            ) : mainCategoryId > 0 && !isLoadingSubCats ? (
              <Typography variant="caption" className="text-muted-foreground block mt-3">
                {t('form.productCategoryUsesMainOnly')}
              </Typography>
            ) : null}
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

        {/* ── Section: Preset values (value_options) ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
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
