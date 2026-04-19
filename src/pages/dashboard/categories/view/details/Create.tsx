import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
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
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const categoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((cat) => ({ id: cat.id, label: cat.name })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

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
  };

  const methods = useForm<CategoryDetailFormValues>({
    resolver: zodResolver(CategoryDetailSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Fetch category detail data if in edit mode
  useEffect(() => {
    if (isEditMode && categoryDetailData?.data && !isLoadingDetail) {
      const detail = categoryDetailData.data;
      reset({
        category_id: detail.category.id,
        name: detail.name,
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
      const payload = {
        category_id: data.category_id,
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
      };

      if (isEditMode && id) {
        await updateCategoryDetailMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.categoryDetailUpdatedSuccess'));
        navigate('/categories/details');
      } else {
        await createCategoryDetailMutation.mutateAsync(payload);
        toast.success(t('form.categoryDetailCreatedSuccess'));
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
        submittingLabel={
          isEditMode ? t('form.updatingCategoryDetail') : t('form.creatingCategoryDetail')
        }
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
                  {t('form.categoryLabel')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="category_id"
                queryKey={['categories', 'infinite', 'detail-form']}
                fetcher={categoryFetcher}
                placeholder={t('form.selectCategory')}
                helperText={t('form.categoryDetailHelper')}
                initialLabel={
                  categoryDetailData?.data?.category?.name
                    ? formatTranslated(categoryDetailData.data.category.name)
                    : undefined
                }
              />
            </Box>
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
      </CreateFormLayout>
    </>
  );
}
