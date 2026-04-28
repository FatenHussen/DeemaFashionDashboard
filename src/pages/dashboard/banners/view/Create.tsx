import type { BannerItem } from '@/pages/dashboard/banners/types/banner.types';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { compressImage } from '@/utils/compress-image';
import { useParams, useNavigate, useLocation } from 'react-router';
import { stripBilingualDescriptionForForm } from '@/utils/optional-bilingual-api-placeholder';
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

/** Map API ISO datetime to `datetime-local` input value (local wall time). */
function apiDateTimeToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bannerFromState = location.state?.banner as BannerItem | undefined;
  const isEditMode = !!id;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchBannerById(id || '');
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();

  const defaultValues: BannerUpdateFormValues = {
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    image: null,
    link: '',
    expires_at: '',
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
      setPreviewUrl(source.image_url || null);
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
          en: stripBilingualDescriptionForForm(descObj?.en ?? ''),
          ar: stripBilingualDescriptionForForm(descObj?.ar ?? ''),
        },
        image: null,
        link: source.link ?? '',
        expires_at: apiDateTimeToLocalInput(source.expires_at ?? null),
      });
    }
  }, [detailsResponse?.data, bannerFromState, isEditMode, reset]);

  // Update preview when image file changes
  useEffect(() => {
    const currentImageUrl = detailsResponse?.data?.image_url || bannerFromState?.image_url;
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else if (!imageFile && !isEditMode) {
      setPreviewUrl(null);
    } else if (isEditMode && !imageFile && currentImageUrl) {
      setPreviewUrl(currentImageUrl);
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
        image:
          data.image instanceof File ? await compressImage(data.image) : null,
        link: data.link,
        expires_at: data.expires_at?.trim() ?? '',
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

  const isVideoPreview = Boolean(
    (imageFile instanceof File && imageFile.type.startsWith('video/')) ||
      (previewUrl &&
        typeof previewUrl === 'string' &&
        (previewUrl.startsWith('data:video/') ||
          /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(previewUrl)))
  );

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
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateBannerSubmit') : t('form.createBannerSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBanner') : t('form.creatingBanner')}
      >
        {/* ── Section: Titles ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:letter-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.bannerEnglishTitleLabel')} / {t('form.bannerArabicTitleLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
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
          </Box>
        </Box>

        {/* ── Section: Descriptions ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:document-text-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.descriptionEn')} / {t('form.descriptionAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-violet-500" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-violet-500" width={20} height={20} />
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
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {isEditMode ? t('form.bannerImageLabel') : t('form.bannerImageLabelRequired')}
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
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file || null);
                    }}
                    error={!!error}
                    helperText={
                      error?.message ||
                      (isEditMode ? t('form.bannerMediaHelperEdit') : t('form.bannerMediaHelper'))
                    }
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {previewUrl && (
                    <Box className="mt-5">
                      <Box className="relative inline-block">
                        <Box className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-sm" />
                        {isVideoPreview ? (
                          <video
                            src={previewUrl}
                            controls
                            muted
                            playsInline
                            className="relative w-full max-w-lg max-h-56 rounded-xl border border-border/60 bg-black shadow-sm"
                            aria-label={t('form.bannerPreviewAlt')}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={t('form.bannerPreviewAlt')}
                            className="relative w-full max-w-lg h-40 object-cover rounded-xl border border-border/60 shadow-sm"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ── Section: Settings ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:link-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.linkLabelShort')} & {t('form.bannerExpiresAtLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:link-bold" className="text-sky-500" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-date-bold" className="text-sky-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.bannerExpiresAtLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="expires_at"
                type="datetime-local"
                helperText={t('form.bannerExpiresAtHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
