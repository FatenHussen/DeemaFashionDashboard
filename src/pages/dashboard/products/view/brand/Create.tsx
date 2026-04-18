import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _CityApi } from '@/pages/dashboard/locations/api/city.services';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { _GovernorateApi } from '@/pages/dashboard/locations/api/governorate.services';
import {
  BrandSchema,
  type BrandFormValues,
} from '@/pages/dashboard/products/validation/brand.validation';
import {
  useCreateBrand,
  useUpdateBrand,
  useFetchBrandById,
} from '@/pages/dashboard/products/hooks/brand';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const governorateFetcher = (page: number, limit: number) =>
  _GovernorateApi.getListGovernorates({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((gov) => ({ id: gov.id, label: gov.name })),
      pagination: r.data.pagination,
    },
  }));

const cityFetcher = (page: number, limit: number) =>
  _CityApi.getListCities({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((city) => ({
        id: city.id,
        label: formatTranslated(city.name as Parameters<typeof formatTranslated>[0]),
      })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Hooks for fetching and mutations
  const { data: brandResponse, isLoading: isLoadingBrand } = useFetchBrandById(id || '');
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const defaultValues: BrandFormValues = {
    name: {
      en: '',
      ar: '',
    },
    image: null,
    category_id: 0,
    governorate_id: 0,
    city_id: 0,
  };

  const methods = useForm<BrandFormValues>({
    resolver: zodResolver(BrandSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const imageFile = watch('image');

  // Fetch brand data if in edit mode
  useEffect(() => {
    if (isEditMode && brandResponse?.data && !isLoadingBrand) {
      const brand = brandResponse.data;
      const img = brand.image;
      const imageUrl = img
        ? String(img).startsWith('http')
          ? img
          : `${CONFIG.serverUrl}/${String(img).replace(/^\//, '')}`
        : null;
      setPreviewImage(imageUrl);
      const nameValue =
        typeof brand.name === 'object' && brand.name !== null && 'en' in brand.name
          ? { en: (brand.name as { en?: string }).en ?? '', ar: (brand.name as { ar?: string }).ar ?? '' }
          : { en: typeof brand.name === 'string' ? brand.name : '', ar: typeof brand.name === 'string' ? brand.name : '' };
      reset({
        name: nameValue,
        image: null, // Don't pre-fill file input
        category_id: Number(brand.category?.id ?? brand.category_id ?? 0) || 0,
        governorate_id: Number(brand.governorate?.id ?? brand.governorate_id ?? 0) || 0,
        city_id: Number(brand.city?.id ?? brand.city_id ?? 0) || 0,
      });
    }
  }, [brandResponse, isEditMode, isLoadingBrand, reset]);

  // Update preview when image file changes
  useEffect(() => {
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else if (!imageFile && !isEditMode) {
      setPreviewImage(null);
    }
  }, [imageFile, isEditMode]);

  const isSubmitting = createBrandMutation.isPending || updateBrandMutation.isPending;
  const errorMessage =
    createBrandMutation.error?.message || updateBrandMutation.error?.message || null;

  const onSubmit = async (data: BrandFormValues) => {
    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        image: data.image instanceof File ? data.image : undefined,
        category_id: data.category_id,
        governorate_id: data.governorate_id,
        city_id: data.city_id,
      };

      if (isEditMode && id) {
        await updateBrandMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.brandUpdatedSuccess'));
        navigate('/products/brands');
      } else {
        await createBrandMutation.mutateAsync(payload);
        toast.success(t('form.brandCreatedSuccess'));
        navigate('/products/brands');
      }
    } catch (error: any) {
      console.error('Error saving brand:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products/brands');
  };

  const infoText = isEditMode ? t('form.brandFormInfoEdit') : t('form.brandFormInfoCreate');

  return (
    <>
      <title>
        {`${isEditMode ? t('form.editBrand') : t('form.createBrand')} | ${t('form.brandBrandedTitle', { app: CONFIG.appName })}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editBrand') : t('form.createBrand')}
        description={isEditMode ? t('form.editBrandDesc') : t('form.createBrandDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingBrand}
        loadingText={t('form.loadingBrand')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateBrandSubmit') : t('form.createBrandSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBrand') : t('form.creatingBrand')}
      >
        {/* ── Section: Category ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-5-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.categoryLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:widget-5-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.categoryLabel')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="category_id"
                queryKey={['category', 'infinite', 'brand-form']}
                fetcher={(page, limit) =>
                  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit }).then((r) => {
                    const mapped = r.data.items.map((c) => ({
                      id: c.id,
                      label: formatTranslated(c.name as Parameters<typeof formatTranslated>[0]),
                    }));
                    return {
                      data: {
                        items:
                          page === 1
                            ? [{ id: 0, label: t('form.selectCategoryPlaceholder') }, ...mapped]
                            : mapped,
                        pagination: r.data.pagination,
                      },
                    };
                  })
                }
                placeholder={t('form.selectCategory')}
                helperText={t('form.brandCategoryHelper')}
                initialLabel={
                  brandResponse?.data?.category?.name
                    ? formatTranslated(
                        brandResponse.data.category.name as Parameters<typeof formatTranslated>[0]
                      )
                    : undefined
                }
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Location ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.governorate')} & {t('columns.city')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:map-point-bold" className="text-sky-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('columns.governorate')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="governorate_id"
                queryKey={['governorates', 'infinite', 'brand-form']}
                fetcher={governorateFetcher}
                placeholder={t('form.selectGovernorate')}
                helperText={t('form.brandGovernorateHelper')}
                initialLabel={brandResponse?.data?.governorate?.name}
                onValueChange={() => {
                  setValue('city_id', 0);
                }}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:city-bold" className="text-sky-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('columns.city')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="city_id"
                queryKey={['cities', 'infinite', 'brand-form']}
                fetcher={cityFetcher}
                placeholder={t('form.selectCity')}
                helperText={t('form.brandCityHelper')}
                initialLabel={
                  brandResponse?.data?.city?.name
                    ? formatTranslated(
                        brandResponse.data.city.name as Parameters<typeof formatTranslated>[0]
                      )
                    : undefined
                }
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:letter-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder={t('form.brandPlaceholder')}
                helperText={t('form.brandNameEnHelper')}
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder={t('form.brandNameArExample')}
                helperText={t('form.brandNameArHelper')}
                className="transition-all duration-200"
                dir="rtl"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.brandImageSection')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="image"
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
                    helperText={error?.message || t('form.brandImageUploadHelper')}
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {previewImage && (
                    <Box className="mt-5 flex items-center gap-4">
                      <Box className="relative">
                        <Box className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm" />
                        <img
                          src={previewImage}
                          alt={t('form.brandImagePreviewAlt')}
                          className="relative w-24 h-24 object-cover rounded-xl border border-border/60 shadow-sm"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" className="font-medium text-foreground">
                          {t('form.brandImagePreviewAlt')}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('form.brandImageUploadHelper')}
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
