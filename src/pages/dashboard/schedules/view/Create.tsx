import type { ScheduleCreatePayload } from '@/pages/dashboard/schedules/types/schedule.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { compressImage } from '@/utils/compress-image';
import { formatTranslated } from '@/utils/format-translated';
import { stripBilingualDescriptionForForm } from '@/utils/optional-bilingual-api-placeholder';
import {
  ScheduleSchema,
  type ScheduleFormValues,
} from '@/pages/dashboard/schedules/validation/schedule.validation';
import {
  useCreateSchedule,
  useUpdateSchedule,
  useFetchScheduleById,
} from '@/pages/dashboard/schedules/hooks/schedule';
import {
  bilingualFromApi,
  splitScheduleMedia,
  type ScheduleMediaItem,
  badgesFormValueFromSchedule,
} from '@/pages/dashboard/schedules/utils/schedule-media';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/jpg,image/gif,image/webp';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: scheduleResponse, isLoading: isLoadingSchedule } = useFetchScheduleById(id || '');
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [primaryMediaId, setPrimaryMediaId] = useState<number | undefined>();
  const [existingExtras, setExistingExtras] = useState<ScheduleMediaItem[]>([]);
  const [fileImagePreview, setFileImagePreview] = useState<string | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);

  const defaultValues: ScheduleFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    interval_days: 1,
    is_active: true,
    discount_type: null,
    discount_value: null,
    image: null,
    images: [],
    deleted_image_ids: [],
    badges: [],
  };

  const methods = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const discountType = watch('discount_type');
  const imageValue = watch('image');
  const extraFiles = watch('images');
  const cardName = watch('name');
  const cardDescription = watch('description');
  const cardDays = watch('interval_days');
  const cardDiscountValue = watch('discount_value');
  const cardActive = watch('is_active');
  const cardBadges = watch('badges') ?? [];

  useEffect(() => {
    if (isEditMode && scheduleResponse?.data) {
      const d = scheduleResponse.data;
      const { primary, extras } = splitScheduleMedia(d);
      reset({
        name: bilingualFromApi(d.name),
        description: {
          en: stripBilingualDescriptionForForm(bilingualFromApi(d.description).en),
          ar: stripBilingualDescriptionForForm(bilingualFromApi(d.description).ar),
        },
        interval_days: d.interval_days || 1,
        is_active: !!d.is_active,
        discount_type: d.discount_type || null,
        discount_value: d.discount_value ?? null,
        image: null,
        images: [],
        deleted_image_ids: [],
        badges: badgesFormValueFromSchedule(d),
      });
      setPrimaryPreview(primary?.url ?? null);
      setPrimaryMediaId(primary?.id);
      setExistingExtras(extras);
    }
  }, [scheduleResponse, isEditMode, reset]);

  useEffect(() => {
    if (!(imageValue instanceof File)) {
      setFileImagePreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageValue);
    setFileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageValue]);

  useEffect(() => {
    const files = extraFiles ?? [];
    if (!files.length) {
      setExtraPreviews([]);
      return undefined;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setExtraPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [extraFiles]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      const image = data.image instanceof File ? await compressImage(data.image) : null;
      const images = data.images?.length
        ? await Promise.all(data.images.map((f) => (f instanceof File ? compressImage(f) : f)))
        : [];
      const payload: ScheduleCreatePayload = {
        name: data.name,
        description: data.description,
        interval_days: data.interval_days,
        is_active: data.is_active,
        discount_type: data.discount_type || null,
        discount_value: data.discount_type ? (data.discount_value ?? null) : null,
        image,
        images: images.filter((f): f is File => f instanceof File),
        deleted_image_ids: isEditMode ? (data.deleted_image_ids ?? []) : undefined,
        badges: data.badges ?? [],
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.scheduleUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.scheduleCreatedSuccess'));
      }
      navigate('/schedules');
    } catch (error: unknown) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleCancel = () => navigate('/schedules');

  const markDeleted = (mediaId: number | undefined) => {
    if (mediaId == null) return;
    const current = watch('deleted_image_ids') ?? [];
    if (!current.includes(mediaId)) {
      setValue('deleted_image_ids', [...current, mediaId], { shouldDirty: true });
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.scheduleEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.scheduleCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editSchedule') : t('form.createSchedule')}
        description={isEditMode ? t('form.editScheduleDesc') : t('form.createScheduleDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingSchedule}
        loadingText={t('form.loadingSchedule')}
        submitLabel={isEditMode ? t('form.updateSchedule') : t('form.createScheduleSubmit')}
        submittingLabel={isEditMode ? t('form.updatingSchedule') : t('form.creatingSchedule')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:calendar-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameEn')} *
                </Typography>
              </Box>
              <RHFTextField name="name.en" placeholder={t('form.scheduleNameEnPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameAr')} *
                </Typography>
              </Box>
              <RHFTextField name="name.ar" placeholder={t('form.scheduleNameArPlaceholder')} dir="rtl" fullWidth />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.descriptionEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="description.en"
                placeholder={t('form.scheduleDescEnPlaceholder')}
                helperText={t('form.scheduleDescHelper')}
                fullWidth
              />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.descriptionAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="description.ar"
                placeholder={t('form.scheduleDescArPlaceholder')}
                helperText={t('form.scheduleDescHelper')}
                dir="rtl"
                fullWidth
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:settings-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.intervalDays')} & {t('form.discountType')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:clock-circle-bold" className="text-violet-500" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.intervalDays')} *
                </Typography>
              </Box>
              <RHFTextField name="interval_days" type="number" placeholder={t('form.placeholderThree')} fullWidth />
              <Typography variant="caption" className="text-muted-foreground mt-1">
                {t('form.intervalDaysHelper')}
              </Typography>
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-price-bold" className="text-violet-500" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.discountType')}
                </Typography>
              </Box>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">{t('form.noDiscount')}</option>
                    <option value="percentage">{t('form.percentageDiscount')}</option>
                    <option value="fixed">{t('form.fixedDiscount')}</option>
                  </select>
                )}
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.scheduleFullBasketDiscountHelper')}
              </Typography>
            </Box>
            {discountType && (
              <Box className="group md:col-span-2 md:max-w-sm">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:dollar-bold" className="text-violet-500" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.discountValue')}
                  </Typography>
                </Box>
                <RHFTextField
                  name="discount_value"
                  type="number"
                  placeholder={
                    discountType === 'percentage'
                      ? t('form.scheduleDiscountPlaceholderPercentage')
                      : t('form.scheduleDiscountPlaceholderFixed')
                  }
                  fullWidth
                  min={0}
                  max={discountType === 'percentage' ? 100 : undefined}
                />
                <Typography variant="caption" className="text-muted-foreground mt-1">
                  {discountType === 'percentage' ? t('form.percentageHelper') : t('form.fixedHelper')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Card images ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduleCardImage')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                    {t('form.scheduleCardImage')}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground mb-3 block">
                    {t('form.scheduleCardImageHelper')}
                  </Typography>
                  {(fileImagePreview || primaryPreview) && (
                    <Box className="mb-3 relative inline-block">
                      <img
                        src={fileImagePreview || primaryPreview || ''}
                        alt=""
                        className="h-28 w-28 rounded-full object-cover border border-border/60"
                      />
                      {isEditMode && primaryPreview && !(value instanceof File) && primaryMediaId != null ? (
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                          aria-label={t('form.removeImageAria')}
                          onClick={() => {
                            markDeleted(primaryMediaId);
                            setPrimaryPreview(null);
                            setPrimaryMediaId(undefined);
                          }}
                        >
                          <Iconify icon="solar:close-circle-bold" width={14} />
                        </button>
                      ) : null}
                    </Box>
                  )}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center gap-1 text-muted-foreground"
                  >
                    <Iconify icon="solar:gallery-add-bold" width={20} />
                    <span className="text-sm">{t('form.recipeClickToUploadImage')}</span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      onChange(file);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}
            />

            <Controller
              name="images"
              control={control}
              render={({ field: { onChange, value } }) => {
                const files = (Array.isArray(value) ? value : []) as File[];
                return (
                  <div>
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                      {t('form.scheduleExtraImage')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground mb-3 block">
                      {t('form.scheduleExtraImageHelper')}
                    </Typography>
                    {(existingExtras.length > 0 || extraPreviews.length > 0) && (
                      <Box className="mb-3 flex flex-wrap gap-2">
                        {existingExtras.map((img, i) => (
                          <div key={img.id ?? `extra-${i}`} className="relative h-16 w-16">
                            <img src={img.url} alt="" className="h-16 w-16 rounded-full object-cover border border-border/60" />
                          {img.id != null ? (
                            <button
                              type="button"
                              className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                              aria-label={t('form.removeImageAria')}
                              onClick={() => {
                                markDeleted(img.id);
                                setExistingExtras((prev) => prev.filter((_, idx) => idx !== i));
                              }}
                            >
                              <Iconify icon="solar:close-circle-bold" width={12} />
                            </button>
                          ) : null}
                          </div>
                        ))}
                        {extraPreviews.map((src, idx) => (
                          <div key={`new-${idx}`} className="relative h-16 w-16">
                            <img src={src} alt="" className="h-16 w-16 rounded-full object-cover border border-border/60" />
                            <button
                              type="button"
                              className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                              aria-label={t('form.removeImageAria')}
                              onClick={() => {
                                onChange(files.filter((_, i) => i !== idx));
                              }}
                            >
                              <Iconify icon="solar:close-circle-bold" width={12} />
                            </button>
                          </div>
                        ))}
                      </Box>
                    )}
                    <button
                      type="button"
                      onClick={() => extraInputRef.current?.click()}
                      className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center gap-1 text-muted-foreground"
                    >
                      <Iconify icon="solar:gallery-add-bold" width={20} />
                      <span className="text-sm">{t('form.recipeClickToUploadImages')}</span>
                    </button>
                    <input
                      ref={extraInputRef}
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        if (picked.length) {
                          onChange([...files, ...picked]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                );
              }}
            />
          </Box>
        </Box>

        {/* ── Section: Badges ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.badgesLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <RHFBadgeSelector
              name="badges"
              withPosition
              helperText={t('form.scheduleBadgesHelper')}
            />
          </Box>
        </Box>

        {/* ── Section: User card preview ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-fuchsia-500/[0.06] via-fuchsia-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:smartphone-bold" className="text-fuchsia-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduleUserCardPreview')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col items-center text-center gap-3">
            <Typography variant="caption" className="text-muted-foreground">
              {t('form.scheduleUserCardPreviewHelper')}
            </Typography>
            <Box className="relative">
              {fileImagePreview || primaryPreview ? (
                <img
                  src={fileImagePreview || primaryPreview || ''}
                  alt=""
                  className="h-28 w-28 rounded-full object-cover border-2 border-border/60 shadow-sm"
                />
              ) : (
                <Box className="h-28 w-28 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <Iconify icon="solar:gallery-bold" className="text-muted-foreground" width={28} />
                </Box>
              )}
              {cardBadges.some((b) => b.position === 'top') ? (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {t('form.badgePositionTop')}
                </span>
              ) : null}
              {cardBadges.some((b) => b.position === 'bottom') ? (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  {t('form.badgePositionBottom')}
                </span>
              ) : null}
            </Box>
            <Box>
              <Typography variant="subtitle1" className="font-semibold text-foreground">
                {formatTranslated(cardName, t('form.scheduleNameEnPlaceholder'))}
              </Typography>
              <Typography variant="body2" className="text-muted-foreground max-w-sm">
                {formatTranslated(cardDescription ?? '', '') || t('form.optionalDescription')}
              </Typography>
            </Box>
            <Box className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="rounded-full bg-muted px-2.5 py-1">
                {cardDays || 1} {t('days')}
              </span>
              {discountType && cardDiscountValue != null ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {discountType === 'percentage' ? `${cardDiscountValue}%` : cardDiscountValue}
                </span>
              ) : null}
              {!cardActive ? (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {t('form.scheduleUserCardHidden')}
                </span>
              ) : null}
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('active')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.scheduleActiveHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
