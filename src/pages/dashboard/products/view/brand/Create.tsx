import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
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
  };

  const methods = useForm<BrandFormValues>({
    resolver: zodResolver(BrandSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
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
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateBrandSubmit') : t('form.createBrandSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBrand') : t('form.creatingBrand')}
      >
        {/* English Name Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
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

        {/* Arabic Name Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
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

        {/* Image Upload Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.brandImageSection')}
            </Typography>
          </Box>
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
                  <Box className="mt-4">
                    <img
                      src={previewImage}
                      alt={t('form.brandImagePreviewAlt')}
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
