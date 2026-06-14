import type { FieldErrors } from 'react-hook-form';
import type { MultiSelectOption } from '@/shared/ui/multi-select';
import type { ProductData } from '@/pages/dashboard/products/types/product.types';
import type { PopupCampaignDetail, PopupCampaignUpsertPayload } from '../types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { RHFSelect } from '@/shared/components/hook-form/rhf-select';
import { useFetchRecipes } from '@/pages/dashboard/recipes/hooks/recipe';
import { RHFTextField } from '@/shared/components/hook-form/rhf-text-field';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { useFetchPromotions } from '@/pages/dashboard/promotions/hooks/promotion';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { getApiErrorMessage } from 'src/lib/get-api-error-message';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';

import {
  useCreatePopupCampaign,
  useUpdatePopupCampaign,
  useFetchPopupCampaignById,
} from '../hooks';
import {
  slugify,
  fromApiType,
  toApiStatus,
  fromApiStatus,
  fromApiTrigger,
  fromApiAudience,
  toApiAudienceType,
} from '../api/payload-map';
import {
  PopupCampaignCreateSchema,
  PopupCampaignUpdateSchema,
  type PopupCampaignCreateFormValues,
  type PopupCampaignUpdateFormValues,
} from '../validation';

// ----------------------------------------------------------------------

function toLoc(v: unknown): { en: string; ar: string } {
  if (v && typeof v === 'object' && v !== null) {
    const o = v as { en?: unknown; ar?: unknown };
    if ('en' in o || 'ar' in o) {
      return { en: o.en != null ? String(o.en) : '', ar: o.ar != null ? String(o.ar) : '' };
    }
  }
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v) as { en?: string; ar?: string };
      if (p && typeof p === 'object' && p !== null && ('en' in p || 'ar' in p)) {
        return { en: p.en != null ? String(p.en) : '', ar: p.ar != null ? String(p.ar) : '' };
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

function resolveProductListImageUrl(img: string | null | undefined): string | null {
  if (img == null || String(img).trim() === '') return null;
  const s = String(img).trim();
  return s.startsWith('http') ? s : `${CONFIG.serverUrl}/${s.replace(/^\//, '')}`;
}

/** Parses `product_ids`, `products: [{id}]`, etc. */
function parseIdArray(v: unknown): number[] {
  if (v == null) return [];
  if (!Array.isArray(v)) return [];
  const out: number[] = [];
  for (const x of v) {
    if (typeof x === 'number' && Number.isFinite(x) && x > 0) out.push(x);
    else if (x && typeof x === 'object' && 'id' in x) {
      const n = Number((x as { id: unknown }).id);
      if (Number.isFinite(n) && n > 0) out.push(n);
    } else {
      const n = Number(x);
      if (Number.isFinite(n) && n > 0) out.push(n);
    }
  }
  return [...new Set(out)];
}

function findFirstErrorFieldName(errors: unknown, prefix = ''): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const o = errors as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message.trim() !== '') {
    return prefix || null;
  }
  for (const key of Object.keys(o)) {
    if (key === 'ref') continue;
    const next = prefix ? `${prefix}.${key}` : key;
    const found = findFirstErrorFieldName(o[key], next);
    if (found) return found;
  }
  return null;
}

function resolveStorageUrl(path: string | null | undefined): string | null {
  if (path == null || String(path).trim() === '') return null;
  const s = String(path).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
  if (!base) return s.startsWith('/') ? s : `/${s}`;
  return `${base}/${s.replace(/^\//, '')}`;
}

function trimLocale(loc: { en: string; ar: string }): { en: string; ar: string } {
  return { en: (loc.en ?? '').trim(), ar: (loc.ar ?? '').trim() };
}

function buildPayload(
  data: PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues
): PopupCampaignUpsertPayload {
  const slug = (data.slug ?? '').trim() || slugify(data.title.en);
  const buttonUrl = (data.button_url ?? '').trim();
  const secondary = (data.secondary_button_text ?? '').trim();
  const packIds = (arr?: number[] | null) => {
    const ids = (arr ?? [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? ids : null;
  };
  return {
    title: trimLocale(data.title),
    slug,
    type: data.type,
    status: toApiStatus(data.status) as PopupCampaignUpsertPayload['status'],
    priority: Number(data.priority ?? 0),
    headline: trimLocale(data.headline),
    subheadline: trimLocale(data.subheadline),
    description: trimLocale(data.description),
    button_text: (data.button_text ?? '').trim(),
    button_url: buttonUrl || null,
    secondary_button_text: secondary || null,
    media_type: data.media_type,
    show_on_pages: data.show_on_pages ?? [],
    audience_type: toApiAudienceType(data.audience_type) as PopupCampaignUpsertPayload['audience_type'],
    trigger_type: data.trigger_type,
    trigger_value: data.trigger_value != null ? Number(data.trigger_value) : null,
    form_enabled: Boolean(data.form_enabled),
    form_fields: data.form_fields ?? [],
    product_ids: packIds(data.product_ids),
    shop_ids: packIds(data.shop_ids),
    recipe_ids: packIds(data.recipe_ids),
    promotion_ids: packIds(data.promotion_ids),
  };
}

/** Map API detail to update form. */
function mapDetailToFormValues(d: PopupCampaignDetail): PopupCampaignUpdateFormValues {
  const raw = d as unknown as Record<string, unknown>;
  const pages = toStringArray(d.show_on_pages ?? raw['show_on_pages']);
  const fields = toStringArray(
    d.form_fields ?? (raw['formFields'] as unknown) ?? (raw['form_fields'] as unknown)
  );
  const productIds = parseIdArray(
    raw.product_ids ?? d.product_ids ?? raw.products
  );
  const shopIds = parseIdArray(raw.shop_ids ?? d.shop_ids ?? raw.shops);
  const recipeIds = parseIdArray(raw.recipe_ids ?? d.recipe_ids ?? raw.recipes);
  const promotionIds = parseIdArray(raw.promotion_ids ?? d.promotion_ids ?? raw.promotions);
  const typeStr = String(raw.type ?? raw.campaign_type ?? raw.popup_type ?? d.type ?? 'modal');
  const statusStr = String(
    raw.status ?? raw.campaign_status ?? d.status ?? 'draft'
  );
  const mediaTypeStr = String(
    raw.media_type ?? raw.mediaType ?? d.media_type ?? 'image'
  );
  const _mediaSet = new Set<string>(['image', 'video', 'gif']);
  const mediaTypeNormalized = (
    _mediaSet.has(mediaTypeStr) ? mediaTypeStr : 'image'
  ) as PopupCampaignCreateFormValues['media_type'];
  return {
    title: toLoc(d.title),
    headline: toLoc(d.headline),
    subheadline: toLoc(d.subheadline),
    description: toLoc(d.description),
    slug: String(d.slug ?? raw.slug ?? '').trim() || slugify(toLoc(d.title).en),
    priority: Number(d.priority ?? 0),
    type: fromApiType(typeStr),
    status: fromApiStatus(statusStr) as PopupCampaignCreateFormValues['status'],
    button_text: String(d.button_text ?? ''),
    button_url: String(d.button_url ?? ''),
    secondary_button_text: String(d.secondary_button_text ?? ''),
    media_type: mediaTypeNormalized as PopupCampaignCreateFormValues['media_type'],
    media_path: String(d.media_path ?? ''),
    form_enabled: Boolean(d.form_enabled) || fields.length > 0,
    form_fields: fields,
    show_on_pages: pages,
    audience_type: fromApiAudience(String(d.audience_type ?? 'all_visitors')),
    trigger_type: fromApiTrigger(String(d.trigger_type ?? 'on_load')),
    trigger_value: d.trigger_value != null ? Number(d.trigger_value) : null,
    product_ids: productIds,
    shop_ids: shopIds,
    recipe_ids: recipeIds,
    promotion_ids: promotionIds,
    media_file: null,
  };
}

/**
 * `getById` returns `{ status, message, data }`, but the query layer may also surface a bare
 * resource object — support both so edit mode always receives a campaign.
 */
function extractPopupCampaignDetail(
  res: { status?: boolean; message?: string; data?: PopupCampaignDetail } | undefined | null
): PopupCampaignDetail | undefined {
  if (res == null) return undefined;
  if (res.data && typeof res.data === 'object' && res.data !== null && 'id' in (res.data as object)) {
    return res.data;
  }
  const top = res as unknown as Record<string, unknown>;
  if (
    (typeof top.id === 'number' || typeof top.id === 'string') &&
    (top.title != null || top.slug != null)
  ) {
    return res as unknown as PopupCampaignDetail;
  }
  return undefined;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formFieldsInput, setFormFieldsInput] = useState<string>('');
  const [filePreviewDataUrl, setFilePreviewDataUrl] = useState<string | null>(null);

  const {
    data: detailResponse,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useFetchPopupCampaignById(id, Boolean(isEditMode && id));
  const detail = useMemo(() => extractPopupCampaignDetail(detailResponse), [detailResponse]);

  const { data: pagesResponse, isLoading: isLoadingPages } = useFetchPages();
  const { data: productsResponse, isLoading: isLoadingProducts } = useFetchProducts({
    page: 1,
    limit: 500,
  });
  const { data: shopsResponse, isLoading: isLoadingShops } = useFetchShops(1, 500);
  const { data: recipesResponse, isLoading: isLoadingRecipes } = useFetchRecipes(1, 500);
  const { data: promotionsResponse, isLoading: isLoadingPromotions } = useFetchPromotions(1, 500);
  const createMutation = useCreatePopupCampaign();
  const updateMutation = useUpdatePopupCampaign();

  const pageOptions = useMemo(() => {
    const items = pagesResponse?.data ?? [];
    return items
      .filter((p) => typeof p?.slug === 'string' && p.slug.trim() !== '')
      .map((p) => ({ value: p.slug, label: cmsPageSelectLabel(p) }));
  }, [pagesResponse]);

  /** Keep slugs from saved campaign that are not in the CMS pages list (avoid dropping on edit). */
  const showOnPagesOptions = useMemo(() => {
    const known = new Set(pageOptions.map((o) => String(o.value)));
    const extra: { value: string; label: string }[] = [];
    if (isEditMode && detail) {
      for (const s of toStringArray(detail.show_on_pages)) {
        if (s && !known.has(s)) {
          known.add(s);
          extra.push({ value: s, label: s });
        }
      }
    }
    return extra.length ? [...pageOptions, ...extra] : pageOptions;
  }, [pageOptions, isEditMode, detail]);

  const productOptions: MultiSelectOption[] = useMemo(() => {
    const raw = productsResponse?.data as
      | { items?: ProductData[]; data?: ProductData[] }
      | undefined;
    const list = raw?.items ?? raw?.data ?? [];
    const byId = new Map<number, MultiSelectOption>();

    for (const p of list) {
      const img = p.thumbnail ?? p.image ?? (p.images?.[0] != null ? String(p.images[0]) : null);
      byId.set(p.id, {
        value: p.id,
        label:
          formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.productFallbackLabel', { id: p.id }),
        imageUrl: resolveProductListImageUrl(img),
      });
    }

    if (detail) {
      const r = detail as unknown as Record<string, unknown>;
      const extraIds = parseIdArray(r.product_ids ?? r.products);
      for (const pid of extraIds) {
        if (byId.has(pid)) continue;
        byId.set(pid, {
          value: pid,
          label: t('form.productFallbackLabel', { id: pid }),
          imageUrl: null,
        });
      }
    }

    return Array.from(byId.values());
  }, [productsResponse?.data, t, detail]);

  const shopOptions: MultiSelectOption[] = useMemo(() => {
    const shops =
      (shopsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const s of shops) {
      byId.set(s.id, {
        value: s.id,
        label:
          formatTranslated(s.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.shopFallbackLabel', { id: s.id }),
      });
    }
    if (detail) {
      const r = detail as unknown as Record<string, unknown>;
      const extraIds = parseIdArray(r.shop_ids ?? r.shops);
      for (const sid of extraIds) {
        if (byId.has(sid)) continue;
        byId.set(sid, {
          value: sid,
          label: t('form.shopFallbackLabel', { id: sid }),
        });
      }
    }
    return Array.from(byId.values());
  }, [shopsResponse?.data, t, detail]);

  const recipeOptions: MultiSelectOption[] = useMemo(() => {
    const items = recipesResponse?.data?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const r of items) {
      const label =
        typeof r.name === 'string'
          ? r.name
          : formatTranslated(r.name as Parameters<typeof formatTranslated>[0]);
      byId.set(r.id, {
        value: r.id,
        label: label || t('form.popupCampaignRecipeFallback', { id: r.id }),
      });
    }
    if (detail) {
      const raw = detail as unknown as Record<string, unknown>;
      const extraIds = parseIdArray(raw.recipe_ids ?? raw.recipes);
      for (const rid of extraIds) {
        if (byId.has(rid)) continue;
        byId.set(rid, {
          value: rid,
          label: t('form.popupCampaignRecipeFallback', { id: rid }),
        });
      }
    }
    return Array.from(byId.values());
  }, [recipesResponse?.data, t, detail]);

  const promotionOptions: MultiSelectOption[] = useMemo(() => {
    const items = promotionsResponse?.data?.items ?? [];
    const byId = new Map<number, MultiSelectOption>();
    for (const p of items) {
      const label =
        typeof p.name === 'string'
          ? p.name
          : formatTranslated(p.name as Parameters<typeof formatTranslated>[0]);
      byId.set(p.id, {
        value: p.id,
        label: label || t('form.popupCampaignPromotionFallback', { id: p.id }),
      });
    }
    if (detail) {
      const raw = detail as unknown as Record<string, unknown>;
      const extraIds = parseIdArray(raw.promotion_ids ?? raw.promotions);
      for (const pid of extraIds) {
        if (byId.has(pid)) continue;
        byId.set(pid, {
          value: pid,
          label: t('form.popupCampaignPromotionFallback', { id: pid }),
        });
      }
    }
    return Array.from(byId.values());
  }, [promotionsResponse?.data, t, detail]);

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
    product_ids: [] as number[],
    shop_ids: [] as number[],
    recipe_ids: [] as number[],
    promotion_ids: [] as number[],
  };

  const createDefaults: PopupCampaignCreateFormValues = {
    ...emptyDefaults,
    media_path: '',
    media_file: undefined as unknown as PopupCampaignCreateFormValues['media_file'],
  };

  const updateDefaults: PopupCampaignUpdateFormValues = {
    ...emptyDefaults,
    media_path: '',
    media_file: null,
  };

  const schema = isEditMode ? PopupCampaignUpdateSchema : PopupCampaignCreateSchema;

  const methods = useForm<PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: (isEditMode ? updateDefaults : createDefaults) as any,
  });

  const { handleSubmit, reset, control, watch, setValue, setFocus, getValues } = methods;
  const mediaType = watch('media_type');
  const mediaPath = watch('media_path');
  const mediaFile = watch('media_file');
  const triggerType = watch('trigger_type');
  const formEnabled = watch('form_enabled');

  const mediaAccept = useMemo(() => {
    if (mediaType === 'video') {
      return 'video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mkv';
    }
    if (mediaType === 'gif') {
      return 'image/gif,.gif';
    }
    return 'image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp';
  }, [mediaType]);

  useEffect(() => {
    if (!(mediaFile instanceof File)) {
      setFilePreviewDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFilePreviewDataUrl(reader.result as string);
    reader.readAsDataURL(mediaFile);
  }, [mediaFile]);

  /**
   * Apply API detail to the form. Do not use the `useForm({ values })` option here: in RHF 7.56+,
   * when `values` is deep-equal to the previous snapshot (new object reference, same data), the
   * effect falls through to `_resetDefaultValues()` and clears the form — Radix Selects and local
   * `formFieldsInput` then look empty on edit.
   */
  useLayoutEffect(() => {
    if (!isEditMode || !detail?.id) return;
    const next = mapDetailToFormValues(detail);
    reset(next, { keepDefaultValues: false });
    setFormFieldsInput((next.form_fields ?? []).join(', '));
  }, [isEditMode, detail, reset]);

  /** If the CMS only has one page, pre-select it so submit is not blocked on an easy-to-miss field. */
  useEffect(() => {
    if (isEditMode) return;
    if (isLoadingPages) return;
    const current = String(getValues('slug') ?? '').trim();
    if (current) return;
    if (pageOptions.length !== 1) return;
    setValue('slug', pageOptions[0].value, { shouldValidate: true, shouldDirty: true });
  }, [isEditMode, isLoadingPages, pageOptions, getValues, setValue]);

  const parseCsv = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (
    data: PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues
  ) => {
    try {
      const fields = buildPayload(data);
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          fields,
          mediaFile: data.media_file instanceof File ? data.media_file : undefined,
        });
        toast.success(t('form.popupCampaignUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync({
          fields,
          mediaFile: data.media_file as File,
        });
        toast.success(t('form.popupCampaignCreatedSuccess'));
      }
      navigate(paths.dashboard.popupCampaigns.root);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('form.popupCampaignSaveError')));
    }
  };

  const onValidationFailed = useCallback(
    (errors: FieldErrors<PopupCampaignCreateFormValues | PopupCampaignUpdateFormValues>) => {
      if (errors.slug) {
        toast.error(t('form.popupCampaignSlugRequiredToast'));
      } else if ('media_file' in errors && errors.media_file) {
        toast.error(t('form.popupCampaignMediaRequiredToast'));
      } else {
        toast.error(t('formValidationFailed'));
      }
      const name = findFirstErrorFieldName(errors);
      if (name) setFocus(name as any);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (name === 'slug') {
            document.getElementById('popup-campaign-field-slug')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            return;
          }
          const active = document.activeElement as HTMLElement | null;
          active?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        });
      });
    },
    [setFocus, t]
  );

  const handleCancel = () => navigate(paths.dashboard.popupCampaigns.root);

  const previewUrl =
    filePreviewDataUrl ??
    (mediaPath && String(mediaPath).trim() ? resolveStorageUrl(mediaPath) : null);

  if (isEditMode && id && isLoadingDetail) return <LoadingScreen />;

  if (isEditMode && id && !isLoadingDetail && (isDetailError || !detail?.id)) {
    return (
      <>
        <title>
          {t('form.popupCampaignFormTitleEdit')} | {CONFIG.appName}
        </title>
        <Box className="p-6 max-w-lg">
          <Typography variant="h6" className="mb-2">
            {t('form.popupCampaignEditNotFound')}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {t('form.popupCampaignEditNotFoundHint')}
          </Typography>
          <button
            type="button"
            className="text-primary underline text-sm"
            onClick={() => navigate(paths.dashboard.popupCampaigns.root)}
          >
            {t('form.popupCampaignBackToList')}
          </button>
        </Box>
      </>
    );
  }

  return (
    <>
      <title>
        {isEditMode
          ? `${t('form.popupCampaignFormTitleEdit')} | ${CONFIG.appName}`
          : `${t('form.popupCampaignFormTitleCreate')} | ${CONFIG.appName}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any, onValidationFailed)}
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
        submitLabel={isEditMode ? t('edit') : t('create')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        {/* ── Section: Core ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionCore')}
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
              <RHFTextField name="title.en" placeholder={t('form.popupCampaignTitleEnPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.bannerArabicTitleLabel')}
                </Typography>
              </Box>
              <RHFTextField name="title.ar" placeholder={t('form.bannerTitleArExample')} dir="rtl" fullWidth />
            </Box>

            <Box id="popup-campaign-field-slug" className="group scroll-mt-28">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignSlug')}
              </Typography>
              <RHFTextField
                name="slug"
                placeholder={t('form.popupCampaignSlugPlaceholder')}
                fullWidth
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.popupCampaignSlugHint')}
              </Typography>
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignPriority')}
              </Typography>
              <RHFTextField name="priority" type="number" placeholder="0" min={0} fullWidth />
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
        </Box>

        {/* ── Section: Content ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:text-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionContent')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignHeadlineEn')}
              </Typography>
              <RHFTextField name="headline.en" placeholder="" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignHeadlineAr')}
              </Typography>
              <RHFTextField name="headline.ar" placeholder="" dir="rtl" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignSubheadlineEn')}
              </Typography>
              <RHFTextField name="subheadline.en" placeholder="" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignSubheadlineAr')}
              </Typography>
              <RHFTextField name="subheadline.ar" placeholder="" dir="rtl" fullWidth />
            </Box>
            <Box className="group md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignDescriptionEn')}
              </Typography>
              <RHFTextField name="description.en" placeholder="" fullWidth />
            </Box>
            <Box className="group md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignDescriptionAr')}
              </Typography>
              <RHFTextField name="description.ar" placeholder="" dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Buttons ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:cursor-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionButtons')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignButtonText')}
              </Typography>
              <RHFTextField name="button_text" placeholder={t('popupCampaign.buttonTextPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignButtonUrl')}
              </Typography>
              <RHFTextField name="button_url" placeholder={t('popupCampaign.buttonUrlPlaceholder')} fullWidth />
            </Box>
            <Box className="group md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignSecondaryButton')}
              </Typography>
              <RHFTextField
                name="secondary_button_text"
                placeholder={t('popupCampaign.secondaryButtonPlaceholder')}
                fullWidth
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Placement ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionPlacement')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <RHFMultiSelect
                name="show_on_pages"
                options={showOnPagesOptions}
                placeholder={
                  isLoadingPages
                    ? t('form.popupCampaignSlugLoading')
                    : t('popupCampaign.showOnPagesPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingPages}
                isSearchable
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.popupCampaignShowOnPagesHint')}
              </Typography>
            </Box>
            <Box className="group md:col-span-2 border-t border-border/40 pt-6 mt-1">
              <Typography variant="subtitle1" className="mb-4 font-semibold text-foreground">
                {t('form.popupCampaignTargetSectionTitle')}
              </Typography>
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignTargetProducts')}
              </Typography>
              <RHFMultiSelect
                name="product_ids"
                options={productOptions}
                placeholder={
                  isLoadingProducts
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.popupCampaignTargetProductsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingProducts}
                isSearchable
                showOptionImages
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignTargetShops')}
              </Typography>
              <RHFMultiSelect
                name="shop_ids"
                options={shopOptions}
                placeholder={
                  isLoadingShops
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.popupCampaignTargetShopsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingShops}
                isSearchable
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignTargetRecipes')}
              </Typography>
              <RHFMultiSelect
                name="recipe_ids"
                options={recipeOptions}
                placeholder={
                  isLoadingRecipes
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.popupCampaignTargetRecipesPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingRecipes}
                isSearchable
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold">
                {t('form.popupCampaignTargetPromotions')}
              </Typography>
              <RHFMultiSelect
                name="promotion_ids"
                options={promotionOptions}
                placeholder={
                  isLoadingPromotions
                    ? t('form.popupCampaignSlugLoading')
                    : t('form.popupCampaignTargetPromotionsPlaceholder')
                }
                fullWidth
                isDisabled={isLoadingPromotions}
                isSearchable
              />
            </Box>
            <Box className="group md:col-span-2">
              <Typography variant="caption" className="text-muted-foreground block">
                {t('form.popupCampaignTargetResourcesHint')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Trigger ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:alarm-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionTrigger')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                fullWidth
              />
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {t('form.popupCampaignTriggerValueHint')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Lead form ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-indigo-500/[0.06] via-indigo-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:clipboard-list-bold" className="text-indigo-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionForm')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  placeholder={t('popupCampaign.formFieldsPlaceholder')}
                  fullWidth
                />
                <Typography variant="caption" className="text-muted-foreground mt-1 block">
                  {t('form.popupCampaignFormFieldsHint')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-bold" className="text-rose-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.popupCampaignSectionMedia')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                name="media_file"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={undefined}
                    type="file"
                    accept={mediaAccept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file ?? (isEditMode ? null : undefined));
                    }}
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ||
                      (isEditMode
                        ? t('form.popupCampaignMediaHelperEdit')
                        : t('form.popupCampaignMediaHelperCreate'))
                    }
                    fullWidth
                  />
                )}
              />
              {previewUrl && (mediaType === 'image' || mediaType === 'gif') && (
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
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
