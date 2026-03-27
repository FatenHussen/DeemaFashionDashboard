import type { BannerItem } from '@/pages/dashboard/banners/types/banner.types';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  useCreateBanner,
  useUpdateBanner,
  useFetchBannerById,
} from '@/pages/dashboard/banners/hooks/banner';
import {
  BannerUpdateSchema,
  type BannerUpdateFormValues,
} from '@/pages/dashboard/banners/validation/banner.validation';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bannerFromState = location.state?.banner as BannerItem | undefined;
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchBannerById(id || '');
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();

  const defaultValues: BannerUpdateFormValues = {
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    image: null,
    link: '',
  };

  const methods = useForm<BannerUpdateFormValues>({
    resolver: zodResolver(BannerUpdateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const imageFile = watch('image');

  // Load banner data from state or API when in edit mode
  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? bannerFromState) : null;
    if (source) {
      setPreviewImage(source.image_url || null);
      const desc = source.description;
      const descObj = typeof desc === 'object' && desc !== null && !Array.isArray(desc)
        ? (desc as { en?: string; ar?: string })
        : null;
      const titleObj = typeof source.title === 'object' && source.title !== null
        ? (source.title as { en?: string; ar?: string })
        : null;
      const titleStr = typeof source.title === 'string' ? source.title : '';
      reset({
        title: {
          en: titleObj?.en ?? titleStr,
          ar: titleObj?.ar ?? titleStr,
        },
        description: {
          en: descObj?.en ?? '',
          ar: descObj?.ar ?? '',
        },
        image: null,
        link: source.link ?? '',
      });
    }
  }, [detailsResponse?.data, bannerFromState, isEditMode, reset]);

  // Update preview when image file changes
  useEffect(() => {
    const currentImageUrl = detailsResponse?.data?.image_url || bannerFromState?.image_url;
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else if (!imageFile && !isEditMode) {
      setPreviewImage(null);
    } else if (isEditMode && !imageFile && currentImageUrl) {
      setPreviewImage(currentImageUrl);
    }
  }, [imageFile, isEditMode, detailsResponse?.data?.image_url, bannerFromState?.image_url]);

  const isSubmitting = createBannerMutation.isPending || updateBannerMutation.isPending;
  const errorMessage =
    createBannerMutation.error?.message || updateBannerMutation.error?.message || null;

  const onSubmit = async (data: BannerUpdateFormValues) => {
    try {
      const payload = {
        title: { en: data.title.en, ar: data.title.ar },
        description: { en: data.description.en, ar: data.description.ar },
        image: data.image instanceof File ? data.image : null,
        link: data.link,
      };

      if (isEditMode && id) {
        await updateBannerMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.bannerUpdatedSuccess'));
        navigate('/sections/banners');
      } else {
        if (!(payload.image instanceof File)) {
          toast.error(t('form.imageRequiredForNew'));
          return;
        }
        await createBannerMutation.mutateAsync(payload);
        toast.success(t('form.bannerCreatedSuccess'));
        navigate('/sections/banners');
      }
    } catch (error: any) {
      console.error('Error saving banner:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections/banners');
  };

  const infoText = isEditMode ? t('form.bannerFormInfoEdit') : t('form.bannerFormInfoCreate');

  if (isEditMode && isLoadingDetails && !bannerFromState) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.bannerEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.bannerCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editBanner') : t('form.createBanner')}
        description={isEditMode ? t('form.editBannerDesc') : t('form.createBannerDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingBanner')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateBannerSubmit') : t('form.createBannerSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBanner') : t('form.creatingBanner')}
      >
        {/* English Title */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.bannerEnglishTitleLabel')}
            </Typography>
          </Box>
          <RHFTextField
            name="title.en"
            placeholder={t('form.bannerTitleEnPlaceholder')}
            helperText={t('form.bannerTitleEnHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Arabic Title */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.bannerArabicTitleLabel')}
            </Typography>
          </Box>
          <RHFTextField
            name="title.ar"
            placeholder={t('form.bannerTitleArExample')}
            helperText={t('form.bannerTitleArHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Description English */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.descriptionEn')}
            </Typography>
          </Box>
          <RHFTextField
            name="description.en"
            placeholder={t('form.optionalDescription')}
            helperText={t('form.bannerDescHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Description Arabic */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.descriptionAr')}
            </Typography>
          </Box>
          <RHFTextField
            name="description.ar"
            placeholder={t('form.optionalDescription')}
            helperText={t('form.bannerDescHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Image Upload */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {isEditMode ? t('form.bannerImageLabel') : t('form.bannerImageLabelRequired')}
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
                  helperText={error?.message || (isEditMode ? t('form.imageHelperEdit') : t('form.imageHelper'))}
                  fullWidth
                  className="transition-all duration-200"
                />
                {previewImage && (
                  <Box className="mt-4">
                    <img
                      src={previewImage}
                      alt={t('form.bannerPreviewAlt')}
                      className="w-full max-w-md h-32 object-cover rounded-lg border border-border/60"
                    />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        {/* Link */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:link-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.linkLabelShort')}
            </Typography>
          </Box>
          <RHFTextField
            name="link"
            placeholder={t('form.linkPlaceholder')}
            helperText={t('form.linkHelper')}
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
