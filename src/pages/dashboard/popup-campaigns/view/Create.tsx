import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { RHFSelect } from '@/shared/components/hook-form/rhf-select';
import { RHFTextField } from '@/shared/components/hook-form/rhf-text-field';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import {
  useCreatePopupCampaign,
  useUpdatePopupCampaign,
  useFetchPopupCampaignById,
} from '../hooks';
import {
  PopupCampaignCreateSchema,
  PopupCampaignUpdateSchema,
  type PopupCampaignCreateFormValues,
  type PopupCampaignUpdateFormValues,
} from '../validation';
import {
  slugify,
  fromApiType,
  toApiStatus,
  fromApiStatus,
  fromApiTrigger,
  fromApiAudience,
  encodeLocaleJson,
  toApiAudienceType,
} from '../api/payload-map';

// ----------------------------------------------------------------------

function toLoc(v: unknown): { en: string; ar: string } {
  if (v && typeof v === 'object' && v !== null && 'en' in v) {
    const o = v as { en?: string; ar?: string };
    return { en: o.en ?? '', ar: o.ar ?? '' };
  }
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v) as { en?: string; ar?: string };
      if (p && typeof p === 'object' && p !== null && 'en' in p) {
        return { en: p.en ?? '', ar: p.ar ?? '' };
      }
    } catch {
      /* plain string */
    }
    return { en: v, ar: v };
  }
  return { en: '', ar: '' };
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === 'string' && v.trim() !== '') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    } catch {
      /* comma-separated fallback */
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function resolveStorageUrl(path: string | null | undefined): string | null {
  if (path == null || String(path).trim() === '') return null;
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
  if (!base) return s.startsWith('/') ? s : `/${s}`;
  return `${base}/${s.replace(/^\//, '')}`;
}

function buildFormData(
  data: PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues,
  isUpdate: boolean,
  options?: { existingMediaPath?: string | null }
): FormData {
  const fd = new FormData();
  const slug = (data.slug ?? '').trim() || slugify(data.title.en);

  fd.append('title', encodeLocaleJson(data.title));
  fd.append('headline', encodeLocaleJson(data.headline));
  fd.append('subheadline', encodeLocaleJson(data.subheadline));
  fd.append('description', encodeLocaleJson(data.description));
  fd.append('slug', slug);
  fd.append('priority', String(data.priority ?? 0));

  fd.append('type', data.type);
  fd.append('status', toApiStatus(data.status));

  fd.append('button_text', (data.button_text ?? '').trim());
  const buttonUrl = (data.button_url ?? '').trim();
  if (buttonUrl) fd.append('button_url', buttonUrl);
  const secondary = (data.secondary_button_text ?? '').trim();
  if (secondary) fd.append('secondary_button_text', secondary);

  fd.append('media_type', data.media_type);

  (data.show_on_pages ?? []).forEach((p) => fd.append('show_on_pages[]', p));

  fd.append('audience_type', toApiAudienceType(data.audience_type));
  fd.append('trigger_type', data.trigger_type);
  if (data.trigger_value != null) {
    fd.append('trigger_value', String(data.trigger_value));
  }

  fd.append('form_enabled', data.form_enabled ? '1' : '0');
  (data.form_fields ?? []).forEach((f) => fd.append('form_fields[]', f));

  fd.append('show_every', String(data.show_every ?? 0));
  fd.append('max_impressions', String(data.max_impressions ?? 0));

  const file = 'media' in data && data.media instanceof File ? data.media : null;
  if (file) {
    fd.append('media', file);
    fd.append('media_path', '__pending_upload__');
  } else if (isUpdate && options?.existingMediaPath) {
    fd.append('media_path', String(options.existingMediaPath));
  }

  return fd;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOnPagesInput, setShowOnPagesInput] = useState<string>('');
  const [formFieldsInput, setFormFieldsInput] = useState<string>('');

  const { data: detailResponse, isLoading: isLoadingDetail } = useFetchPopupCampaignById(id || '');
  const createMutation = useCreatePopupCampaign();
  const updateMutation = useUpdatePopupCampaign();

  const typeOptions = useMemo(
    () =>
      [
        { value: 'modal', label: t('form.popupCampaignTypeModal') },
        { value: 'slide_in', label: t('form.popupCampaignTypeSlideIn') },
        { value: 'fullscreen', label: t('form.popupCampaignTypeFullscreen') },
      ] as const,
    [t]
  );

  const statusOptions = useMemo(
    () =>
      [
        { value: 'draft', label: t('form.popupCampaignStatusDraft') },
        { value: 'active', label: t('form.popupCampaignStatusActive') },
        { value: 'paused', label: t('form.popupCampaignStatusPaused') },
        { value: 'archived', label: t('form.popupCampaignStatusArchived') },
      ] as const,
    [t]
  );

  const mediaTypeOptions = useMemo(
    () =>
      [
        { value: 'image', label: t('form.popupCampaignMediaImage') },
        { value: 'video', label: t('form.popupCampaignMediaVideo') },
        { value: 'gif', label: t('form.popupCampaignMediaGif') },
      ] as const,
    [t]
  );

  const audienceOptions = useMemo(
    () =>
      [
        { value: 'all_visitors', label: t('form.popupCampaignAudienceAllVisitors') },
        { value: 'guests_only', label: t('form.popupCampaignAudienceGuestsOnly') },
        { value: 'logged_in_only', label: t('form.popupCampaignAudienceLoggedInOnly') },
        { value: 'new_visitors', label: t('form.popupCampaignAudienceNewVisitors') },
        { value: 'returning_visitors', label: t('form.popupCampaignAudienceReturningVisitors') },
      ] as const,
    [t]
  );

  const triggerOptions = useMemo(
    () =>
      [
        { value: 'on_load', label: t('form.popupCampaignTriggerOnLoad') },
        { value: 'delay', label: t('form.popupCampaignTriggerDelay') },
        { value: 'scroll', label: t('form.popupCampaignTriggerScroll') },
        { value: 'exit_intent', label: t('form.popupCampaignTriggerExitIntent') },
      ] as const,
    [t]
  );

  const emptyDefaults = {
    title: { en: '', ar: '' },
    headline: { en: '', ar: '' },
    subheadline: { en: '', ar: '' },
    description: { en: '', ar: '' },
    slug: '',
    priority: 0,
    type: 'modal' as const,
    status: 'draft' as const,
    button_text: '',
    button_url: '',
    secondary_button_text: '',
    media_type: 'image' as const,
    form_enabled: false,
    form_fields: [] as string[],
    show_on_pages: [] as string[],
    audience_type: 'all_visitors' as const,
    trigger_type: 'on_load' as const,
    trigger_value: null,
    show_every: 0,
    max_impressions: 0,
  };

  const createDefaults: PopupCampaignCreateFormValues = {
    ...emptyDefaults,
    media: null,
  };

  const updateDefaults: PopupCampaignUpdateFormValues = {
    ...emptyDefaults,
    media: null,
  };

  const schema = isEditMode ? PopupCampaignUpdateSchema : PopupCampaignCreateSchema;

  const methods = useForm<PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEditMode ? updateDefaults : createDefaults,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const mediaFile = watch('media');
  const mediaType = watch('media_type');
  const triggerType = watch('trigger_type');
  const formEnabled = watch('form_enabled');

  useEffect(() => {
    if (!isEditMode || !detailResponse?.data) return;
    const d = detailResponse.data;
    const pages = toStringArray(d.show_on_pages);
    const fields = toStringArray(d.form_fields);
    reset({
      title: toLoc(d.title),
      headline: toLoc(d.headline),
      subheadline: toLoc(d.subheadline),
      description: toLoc(d.description),
      slug: String(d.slug ?? '').trim() || slugify(toLoc(d.title).en),
      priority: Number(d.priority ?? 0),
      type: fromApiType(String(d.type ?? 'modal')),
      status: fromApiStatus(String(d.status ?? 'draft')) as PopupCampaignCreateFormValues['status'],
      button_text: String(d.button_text ?? ''),
      button_url: String(d.button_url ?? ''),
      secondary_button_text: String(d.secondary_button_text ?? ''),
      media_type: String(d.media_type ?? 'image') as PopupCampaignCreateFormValues['media_type'],
      media: null,
      form_enabled: Boolean(d.form_enabled),
      form_fields: fields,
      show_on_pages: pages,
      audience_type: fromApiAudience(String(d.audience_type ?? 'all_visitors')),
      trigger_type: fromApiTrigger(String(d.trigger_type ?? 'on_load')),
      trigger_value: d.trigger_value != null ? Number(d.trigger_value) : null,
      show_every: Number(d.show_every ?? 0),
      max_impressions: Number(d.max_impressions ?? 0),
    });
    setShowOnPagesInput(pages.join(', '));
    setFormFieldsInput(fields.join(', '));
    setPreviewUrl(resolveStorageUrl(d.media_path as string | null | undefined));
  }, [isEditMode, detailResponse, reset]);

  useEffect(() => {
    if (mediaFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(mediaFile);
    } else if (!isEditMode && !mediaFile) {
      setPreviewUrl(null);
    } else if (isEditMode && !mediaFile && detailResponse?.data?.media_path) {
      setPreviewUrl(resolveStorageUrl(detailResponse.data.media_path));
    }
  }, [mediaFile, isEditMode, detailResponse?.data?.media_path]);

  const parseCsv = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  if (isEditMode && isLoadingDetail) return <LoadingScreen />;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (
    data: PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues
  ) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          formData: buildFormData(data as PopupCampaignUpdateFormValues, true, {
            existingMediaPath: detailResponse?.data?.media_path,
          }),
        });
        toast.success(t('form.popupCampaignUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(
          buildFormData(data as PopupCampaignCreateFormValues, false)
        );
        toast.success(t('form.popupCampaignCreatedSuccess'));
      }
      navigate(paths.dashboard.popupCampaigns.root);
    } catch {
      /* handled by axios */
    }
  };

  const handleCancel = () => navigate(paths.dashboard.popupCampaigns.root);

  const fileAccept =
    mediaType === 'video' ? 'video/*' : mediaType === 'gif' ? 'image/gif' : 'image/*';

  return (
    <>
      <title>
        {isEditMode
          ? `${t('form.popupCampaignFormTitleEdit')} | ${CONFIG.appName}`
          : `${t('form.popupCampaignFormTitleCreate')} | ${CONFIG.appName}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={
          isEditMode ? t('form.popupCampaignFormTitleEdit') : t('form.popupCampaignFormTitleCreate')
        }
        description={
          isEditMode
            ? t('form.popupCampaignFormDescEdit')
            : t('form.popupCampaignFormDescCreate')
        }
        isEditMode={isEditMode}
        maxWidth="5xl"
        submitLabel={isEditMode ? t('edit') : t('create')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        <Typography variant="overline" className="text-muted-foreground block mb-3">
          {t('form.popupCampaignSectionCore')}
        </Typography>
        <Box className="grid gap-6 md:grid-cols-2">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.bannerEnglishTitleLabel')}
              </Typography>
            </Box>
            <RHFTextField name="title.en" placeholder={t('form.popupCampaignTitleEnPlaceholder')} />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.bannerArabicTitleLabel')}
              </Typography>
            </Box>
            <RHFTextField name="title.ar" placeholder={t('form.bannerTitleArExample')} dir="rtl" />
          </Box>

          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignSlug')}
            </Typography>
            <RHFTextField name="slug" placeholder={t('form.popupCampaignSlugPlaceholder')} />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.popupCampaignSlugHint')}
            </Typography>
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignPriority')}
            </Typography>
            <RHFTextField name="priority" type="number" placeholder="0" min={0} />
          </Box>

          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignCampaignType')}
            </Typography>
            <RHFSelect name="type" options={[...typeOptions]} placeholder="" />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.popupCampaignTypeHint')}
            </Typography>
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('columns.status')}
            </Typography>
            <RHFSelect name="status" options={[...statusOptions]} placeholder="" />
          </Box>
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionContent')}
        </Typography>
        <Box className="grid gap-6 md:grid-cols-2">
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignHeadlineEn')}
            </Typography>
            <RHFTextField name="headline.en" placeholder="" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignHeadlineAr')}
            </Typography>
            <RHFTextField name="headline.ar" placeholder="" dir="rtl" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignSubheadlineEn')}
            </Typography>
            <RHFTextField name="subheadline.en" placeholder="" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignSubheadlineAr')}
            </Typography>
            <RHFTextField name="subheadline.ar" placeholder="" dir="rtl" />
          </Box>
          <Box className="group md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignDescriptionEn')}
            </Typography>
            <RHFTextField name="description.en" placeholder="" />
          </Box>
          <Box className="group md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignDescriptionAr')}
            </Typography>
            <RHFTextField name="description.ar" placeholder="" dir="rtl" />
          </Box>
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionButtons')}
        </Typography>
        <Box className="grid gap-4 md:grid-cols-2">
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignButtonText')}
            </Typography>
            <RHFTextField name="button_text" placeholder="Shop Now" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignButtonUrl')}
            </Typography>
            <RHFTextField name="button_url" placeholder="https://example.com" />
          </Box>
          <Box className="group md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignSecondaryButton')}
            </Typography>
            <RHFTextField name="secondary_button_text" placeholder="Learn More" />
          </Box>
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionPlacement')}
        </Typography>
        <Box className="mt-2 grid gap-6 md:grid-cols-2">
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignAudience')}
            </Typography>
            <RHFSelect name="audience_type" options={[...audienceOptions]} placeholder="" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignShowOnPages')}
            </Typography>
            <Input
              value={showOnPagesInput}
              onChange={(e) => {
                const v = e.target.value;
                setShowOnPagesInput(v);
                setValue('show_on_pages', parseCsv(v), { shouldValidate: true });
              }}
              placeholder="home, category, product"
              fullWidth
            />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.popupCampaignShowOnPagesHint')}
            </Typography>
          </Box>
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionTrigger')}
        </Typography>
        <Box className="grid gap-4 md:grid-cols-2">
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignTriggerType')}
            </Typography>
            <RHFSelect name="trigger_type" options={[...triggerOptions]} placeholder="" />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignTriggerValue')}
            </Typography>
            <RHFTextField
              name="trigger_value"
              type="number"
              placeholder="0"
              min={0}
              disabled={triggerType === 'on_load' || triggerType === 'exit_intent'}
            />
            <Typography variant="caption" className="text-muted-foreground mt-1 block">
              {t('form.popupCampaignTriggerValueHint')}
            </Typography>
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignShowEvery')}
            </Typography>
            <RHFTextField name="show_every" type="number" placeholder="0" min={0} />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignMaxImpressions')}
            </Typography>
            <RHFTextField name="max_impressions" type="number" placeholder="0" min={0} />
          </Box>
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionForm')}
        </Typography>
        <Box className="grid gap-4 md:grid-cols-2">
          <Box className="group md:col-span-2">
            <Controller
              name="form_enabled"
              control={control}
              render={({ field }) => (
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Typography variant="subtitle2" className="font-semibold">
                    {t('form.popupCampaignFormEnabled')}
                  </Typography>
                </label>
              )}
            />
          </Box>
          {formEnabled && (
            <Box className="group md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignFormFields')}
              </Typography>
              <Input
                value={formFieldsInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormFieldsInput(v);
                  setValue('form_fields', parseCsv(v), { shouldValidate: true });
                }}
                placeholder="name, email, phone"
                fullWidth
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.popupCampaignFormFieldsHint')}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="overline" className="text-muted-foreground block mt-8 mb-3">
          {t('form.popupCampaignSectionMedia')}
        </Typography>
        <Box className="grid gap-4 md:grid-cols-2">
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignMediaType')}
            </Typography>
            <RHFSelect name="media_type" options={[...mediaTypeOptions]} placeholder="" />
          </Box>
          <Box className="group md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold">
              {t('form.popupCampaignMediaFile')}
            </Typography>
            <Controller
              name="media"
              control={control}
              render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                <div className="w-full">
                  <Input
                    {...field}
                    type="file"
                    accept={fileAccept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file || null);
                    }}
                    error={!!error}
                    helperText={
                      error?.message ||
                      (isEditMode
                        ? t('form.popupCampaignMediaHelperEdit')
                        : t('form.popupCampaignMediaHelperCreate'))
                    }
                    fullWidth
                  />
                  {previewUrl && mediaType === 'image' && (
                    <Box className="mt-4">
                      <img
                        src={previewUrl}
                        alt=""
                        className="max-h-48 rounded-lg border border-border/60 object-contain"
                      />
                    </Box>
                  )}
                  {previewUrl && mediaType === 'gif' && (
                    <Box className="mt-4">
                      <img
                        src={previewUrl}
                        alt=""
                        className="max-h-48 rounded-lg border border-border/60 object-contain"
                      />
                    </Box>
                  )}
                  {previewUrl && mediaType === 'video' && (
                    <Box className="mt-4">
                      <video
                        src={previewUrl}
                        className="max-h-56 w-full max-w-md rounded-lg border border-border/60"
                        controls
                        muted
                      />
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
