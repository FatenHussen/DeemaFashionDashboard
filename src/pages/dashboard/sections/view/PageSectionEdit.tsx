import type {
  Page,
  SectionItem,
  FilterConfig,
  PageSectionLayout,
  PageSectionVariant,
  PageSectionUpdatePayload,
} from '../types/page-section.types';

import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isApiValidationError } from '@/api/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useRef, useMemo, useState, useEffect } from 'react';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchSectionDetails } from '@/pages/dashboard/sections/hooks/useSections';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';
import { filterFieldLabel } from '@/pages/dashboard/sections/utils/filter-field-label';
import { _PageBuilderApi } from '@/pages/dashboard/sections/api/page-builder.services';
import { contentTypeLabel } from '@/pages/dashboard/sections/utils/content-type-config';
import { useFetchPageBuilderPage } from '@/pages/dashboard/sections/hooks/usePageBuilder';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import { normalizeLayoutAndCardShape } from '@/pages/dashboard/sections/utils/section-layout';
import { DynamicFilterField } from '@/pages/dashboard/sections/components/dynamic-filter-field';
import { CategoryPageBanner } from '@/pages/dashboard/sections/components/category-page-banner';
import { normalizeFilterSchema } from '@/pages/dashboard/sections/utils/filter-config-normalize';
import {
  visiblePageShowWhenFilters,
} from '@/pages/dashboard/sections/utils/page-visibility-filters';
import { isCategoryCmsPage, resolveLinkedCategoryId } from '@/pages/dashboard/sections/utils/category-page';
import {
  PageSectionSchema,
  type PageSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-section.validation';
import {
  useFetchPages,
  useUpdatePageSection,
  useFetchPageSectionDetails,
  useFetchSectionsForDropdown,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const VISIBILITY_NULL_FILTER_KEYS = new Set(['type', 'shop_id', 'category_id', 'brand_id']);

const PAGE_SECTION_LAYOUTS: PageSectionLayout[] = ['slider', 'list', 'grid'];
const PAGE_SECTION_VARIANTS: PageSectionVariant[] = ['horizontal', 'vertical', 'square'];

function hydrateShowWhenValues(
  schema: Record<string, FilterConfig>,
  saved?: Record<string, any> | null
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(schema)) {
    const raw = saved?.[key];
    result[key] = raw === undefined || raw === null || raw === '' ? null : raw;
  }
  return result;
}

function buildShowWhenPayload(
  schema: Record<string, FilterConfig>,
  values: Record<string, any>
): Record<string, any> | undefined {
  const keys = Object.keys(schema);
  if (keys.length === 0) return undefined;

  const result: Record<string, any> = {};
  for (const key of keys) {
    const val = values[key];
    if (val === null) {
      result[key] = null;
    } else if (val !== undefined && val !== '') {
      result[key] = val;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Only the keys the linked section actually declares. The backend validates `filters`
 * against that section's own schema, so a leftover key from a previously selected
 * section comes back as a 422.
 */
function pickSchemaFilters(
  schema: Record<string, FilterConfig>,
  values: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(schema)) {
    const val = values[key];
    if (val !== undefined && val !== null && val !== '') result[key] = val;
  }
  return result;
}

function isSameRecord(a: Record<string, any>, b: Record<string, any>): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key, index) =>
      keysB[index] === key && JSON.stringify(a[key]) === JSON.stringify(b[key])
  );
}

/** Form paths a `422` field name can be mapped onto; anything else stays in the banner. */
const SERVER_ERROR_FORM_PATHS = new Set([
  'name',
  'name.en',
  'name.ar',
  'section_id',
  'position',
  'order',
  'layout',
  'variant',
  'background_color',
  'background_card_color',
]);

/** What the loaded record held, so the save can send only what the user changed. */
type PageSectionBaseline = {
  name: { en: string; ar: string };
  section_id: number;
  background_color: string;
  background_card_color: string;
  filters: Record<string, any>;
  show_when: Record<string, any>;
};

function FilterNoticeCallout({ text }: { text: string }) {
  return (
    <Box className="flex gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 mb-4">
      <Iconify icon="solar:info-circle-bold" className="text-primary shrink-0 mt-0.5" width={18} />
      <Typography variant="body2" className="text-muted-foreground leading-relaxed">
        {text}
      </Typography>
    </Box>
  );
}

function parsePageSectionLayout(value: unknown): PageSectionLayout {
  if (value === 'slider' || value === 'list' || value === 'grid') return value;
  return 'slider';
}

function parsePageSectionVariant(value: unknown): PageSectionVariant {
  if (value === 'horizontal' || value === 'vertical' || value === 'square') return value;
  return 'horizontal';
}

export default function PageSectionEditPage() {
  const { t } = useTranslation('table');
  const { can } = usePermissions();
  /** Both ids come from the route `pages/:pageId/sections/update/:id` — the page is never picked here. */
  const { id, pageId } = useParams<{ id?: string; pageId?: string }>();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<SectionItem | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showWhenValues, setShowWhenValues] = useState<Record<string, any>>({});
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const baselineRef = useRef<PageSectionBaseline | null>(null);
  /** Which section the values in `filterValues` belong to, so a section swap can drop them. */
  const filtersSectionIdRef = useRef<number | null>(null);
  const showWhenHydratedForPageRef = useRef<number | null>(null);
  const showWhenSchemaRef = useRef<string>('');
  const editShowWhenAppliedRef = useRef<string | null>(null);

  const { data: pageSectionData, isLoading: isLoadingPageSection } = useFetchPageSectionDetails(
    id || ''
  );
  const { data: sectionsData } = useFetchSectionsForDropdown();
  const { data: pagesData } = useFetchPages();
  const updatePageSectionMutation = useUpdatePageSection();
  const { data: pageBuilderDetails } = useFetchPageBuilderPage(pageId || '');

  const defaultValues = {
    name: {
      ar: '',
      en: '',
    },
    section_id: '',
    position: 'after' as const,
    layout: 'slider' as PageSectionLayout,
    variant: 'horizontal' as PageSectionVariant,
    order: 1,
    background_color: '',
    background_card_color: '',
    filters: {},
    show_when: {},
  };

  const methods = useForm<PageSectionFormValues>({
    resolver: zodResolver(PageSectionSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, setError, clearErrors } = methods;

  const watchedSectionId = watch('section_id');
  const sectionIdForDetails =
    typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
  const { data: sectionDetailsData } = useFetchSectionDetails(sectionIdForDetails || '');

  const pageIdForLookup = useMemo(() => {
    const fromRoute = parseInt(String(pageId ?? ''), 10);
    if (Number.isFinite(fromRoute) && fromRoute > 0) return fromRoute;
    const ps = pageSectionData?.data as any;
    const fromRecord = parseInt(String(ps?.page_id ?? ps?.page?.id ?? ''), 10);
    return Number.isFinite(fromRecord) && fromRecord > 0 ? fromRecord : 0;
  }, [pageId, pageSectionData]);

  const pageBackPath = pageIdForLookup
    ? `/sections/pages/details/${pageIdForLookup}`
    : '/sections/pages';

  // Update selected section when section_id changes
  useEffect(() => {
    const sectionId =
      typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
    if (!sectionId || !sectionsData?.data?.items) {
      setSelectedSection(null);
      return;
    }
    const section = sectionsData.data.items.find((s: SectionItem) => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
    } else {
      setSelectedSection(null);
    }
  }, [watchedSectionId, sectionsData]);

  useEffect(() => {
    if (pageSectionData?.data && !isLoadingPageSection) {
      const pageSection = pageSectionData.data;
      const ps = pageSection as any;
      const nameObj =
        typeof pageSection.name === 'object' &&
        pageSection.name &&
        !Array.isArray(pageSection.name)
          ? (pageSection.name as { en?: string; ar?: string })
          : null;
      const nameStr = typeof pageSection.name === 'string' ? pageSection.name : '';
      const { layout, variant } = normalizeLayoutAndCardShape({
        layout: ps.layout,
        variant: ps.variant,
      });
      reset({
        name: {
          en: nameObj?.en ?? nameStr,
          ar: nameObj?.ar ?? nameStr,
        },
        section_id: ps.section_id ?? ps.section?.id ?? '',
        position: pageSection.position ?? 'after',
        layout: parsePageSectionLayout(layout),
        variant: parsePageSectionVariant(variant),
        order: pageSection.order ?? 1,
        background_color: pageSection.background_color || '',
        background_card_color: pageSection.background_card_color || '',
        filters: {},
        show_when: {},
      });
      const savedFilters =
        ps.filters && typeof ps.filters === 'object' && !Array.isArray(ps.filters)
          ? (ps.filters as Record<string, any>)
          : {};
      const savedShowWhen =
        ps.show_when && typeof ps.show_when === 'object' && !Array.isArray(ps.show_when)
          ? (ps.show_when as Record<string, any>)
          : {};
      setFilterValues(savedFilters);
      filtersSectionIdRef.current = Number(ps.section_id ?? ps.section?.id ?? 0) || null;
      baselineRef.current = {
        name: { en: nameObj?.en ?? nameStr, ar: nameObj?.ar ?? nameStr },
        section_id: Number(ps.section_id ?? ps.section?.id ?? 0),
        background_color: pageSection.background_color || '',
        background_card_color: pageSection.background_card_color || '',
        filters: savedFilters,
        show_when: savedShowWhen,
      };
    }
  }, [pageSectionData, isLoadingPageSection, reset]);

  // Filters belong to one section's schema. Picking a different section invalidates them.
  useEffect(() => {
    const nextSectionId = Number.isFinite(sectionIdForDetails) ? sectionIdForDetails : 0;
    if (!nextSectionId || filtersSectionIdRef.current === null) return;
    if (filtersSectionIdRef.current === nextSectionId) return;
    filtersSectionIdRef.current = nextSectionId;
    setFilterValues({});
  }, [sectionIdForDetails]);

  // Avoid stale server errors when filters schema changes (section swap).
  useEffect(() => {
    setServerFieldErrors({});
  }, [watchedSectionId]);

  const isSubmitting = updatePageSectionMutation.isPending;
  const errorMessage = updatePageSectionMutation.error?.message || null;

  /** Drops a `422` body onto the fields that caused it; the rest stays in the form banner. */
  const applyServerFieldErrors = (error: unknown) => {
    if (!isApiValidationError(error)) return;
    const collected: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      const message = messages.join(' ');
      collected[field] = message;
      if (SERVER_ERROR_FORM_PATHS.has(field)) {
        setError(field as any, { type: 'server', message });
      }
    }
    setServerFieldErrors(collected);
  };

  const onSubmit = async (data: PageSectionFormValues) => {
    if (!id) return;

    clearErrors();
    setServerFieldErrors({});

    const baseline = baselineRef.current;
    const nextName = { en: data.name.en, ar: data.name.ar };
    const nextSectionId =
      typeof data.section_id === 'string' ? parseInt(data.section_id, 10) : Number(data.section_id);
    const nextOrder = typeof data.order === 'string' ? parseInt(data.order, 10) : Number(data.order);
    const nextBackgroundColor = data.background_color ?? '';
    const nextBackgroundCardColor = data.background_card_color ?? '';
    // Only keys the linked section declares, so a swapped section can't leak stale filters.
    const nextFilters = pickSchemaFilters(sectionFilters, filterValues);
    const nextShowWhen =
      buildShowWhenPayload(
        visiblePageShowWhenFilters(pageFilters, isCategoryCmsPage(pageBuilderDetails?.data)),
        showWhenValues
      ) ?? {};

    // Layout fields are always sent; everything else only when the user changed it.
    // `page_id` is read-only server-side, so it is never part of the body.
    // `display_type_id` is owned by the backend (from content type) — never send it.
    const payload: PageSectionUpdatePayload = {
      position: data.position,
      layout: data.layout ?? 'slider',
      variant: data.variant,
    };

    if (Number.isFinite(nextOrder)) {
      payload.order = nextOrder;
    }
    if (baseline?.name.en !== nextName.en || baseline?.name.ar !== nextName.ar) {
      payload.name = nextName;
    }
    if (
      Number.isFinite(nextSectionId) &&
      nextSectionId > 0 &&
      nextSectionId !== baseline?.section_id
    ) {
      payload.section_id = nextSectionId;
    }
    if (nextBackgroundColor !== (baseline?.background_color ?? '')) {
      payload.background_color = nextBackgroundColor;
    }
    if (nextBackgroundCardColor !== (baseline?.background_card_color ?? '')) {
      payload.background_card_color = nextBackgroundCardColor;
    }
    if (!isSameRecord(nextFilters, baseline?.filters ?? {})) {
      payload.filters = nextFilters;
    }
    if (!isSameRecord(nextShowWhen, baseline?.show_when ?? {})) {
      payload.show_when = nextShowWhen;
    }

    try {
      await updatePageSectionMutation.mutateAsync({ id, data: payload });
      toast.success(t('form.pageSectionUpdatedSuccess'));
      // The mutation invalidates the page preview and the page-builder caches, so the
      // page we go back to re-fetches and shows the section as it now renders.
      navigate(pageBackPath);
    } catch (error: any) {
      applyServerFieldErrors(error);
      console.error('Error saving page section:', error);
    }
  };

  const handleCancel = () => {
    navigate(pageBackPath);
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const handleShowWhenChange = (filterKey: string, value: any) => {
    setShowWhenValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const positionOptions = useMemo(
    () => [
      { value: 'before', label: t('form.positionBefore') },
      { value: 'after', label: t('form.positionAfter') },
    ],
    [t]
  );

  const layoutOptions = useMemo(
    () =>
      PAGE_SECTION_LAYOUTS.map((v) => ({
        value: v,
        label: t(`form.pageSectionLayout_${v}`),
      })),
    [t]
  );

  const variantOptions = useMemo(
    () =>
      PAGE_SECTION_VARIANTS.map((v) => ({
        value: v,
        label: t(`form.pageSectionVariant_${v}`),
      })),
    [t]
  );

  const infoText = t('form.pageSectionFormInfoEdit');

  // Prefer full section details: API sections expose filters under `api.filters`.
  const sectionFilters = useMemo(() => {
    const data = sectionDetailsData?.data as any;
    const fromApi = data?.api?.filters;
    let raw: Record<string, FilterConfig> = {};
    if (fromApi && typeof fromApi === 'object' && !Array.isArray(fromApi)) {
      raw = fromApi as Record<string, FilterConfig>;
    } else {
      const fromList = selectedSection?.filters;
      if (fromList && typeof fromList === 'object' && !Array.isArray(fromList)) {
        raw = fromList as Record<string, FilterConfig>;
      }
    }
    return normalizeFilterSchema(raw);
  }, [sectionDetailsData, selectedSection]);

  const currentPageLabel = useMemo(() => {
    if (pageBuilderDetails?.data) return cmsPageSelectLabel(pageBuilderDetails.data);
    const page = (pagesData?.data ?? []).find((p: Page) => p.id === pageIdForLookup);
    if (page) return cmsPageSelectLabel(page);
    const ps = pageSectionData?.data as any;
    return cmsPageSelectLabel({
      title: ps?.page_title ?? ps?.page?.title,
      slug: String(ps?.page?.slug ?? '').trim(),
      id: pageIdForLookup || undefined,
    });
  }, [pageBuilderDetails, pagesData, pageIdForLookup, pageSectionData]);

  // Read-only facts about the linked section: the backend owns them, the form only shows them.
  const linkedSectionName = useMemo(() => {
    const ps = pageSectionData?.data as any;
    const fromList = sectionsData?.data?.items?.find(
      (s: SectionItem) => s.id === Number(ps?.section_id ?? 0)
    )?.name;
    return (
      formatTranslated((sectionDetailsData?.data as any)?.name, '') ||
      formatTranslated(ps?.section_name, '') ||
      formatTranslated(fromList, '')
    );
  }, [pageSectionData, sectionDetailsData, sectionsData]);

  const linkedContentType =
    (sectionDetailsData?.data as any)?.content_type ??
    (pageSectionData?.data as any)?.content_type ??
    '';

  const linkedSectionType =
    (sectionDetailsData?.data as any)?.type ?? selectedSection?.type ?? '';

  /**
   * Same source the "add section" screen picks from: every existing section, scoped to
   * this page (`GET /pages/{page}/sliders`). Swapping it here re-points the slot at a
   * different section without touching the section itself.
   */
  const sliderFetcher = useMemo(
    () => (page: number, limit: number) =>
      _PageBuilderApi.getPageSliders(pageIdForLookup, { page, per_page: limit }).then((r) => ({
        data: {
          items: (r.data?.items ?? []).map((item) => ({
            id: item.id,
            label: formatTranslated(item.name, `#${item.id}`),
          })),
          pagination:
            r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
        },
      })),
    [pageIdForLookup]
  );

  const isCategoryPage = isCategoryCmsPage(pageBuilderDetails?.data);
  const linkedCategoryId = resolveLinkedCategoryId(pageBuilderDetails?.data);
  const linkedCategoryName = currentPageLabel || undefined;

  // Show When schema comes from the owning page's embedded `filters`.
  const pageFilters = useMemo(() => {
    const fromBuilder = pageBuilderDetails?.data?.filters;
    let raw: Record<string, FilterConfig> = {};
    if (fromBuilder && typeof fromBuilder === 'object' && !Array.isArray(fromBuilder)) {
      raw = fromBuilder as Record<string, FilterConfig>;
    } else if (pageIdForLookup) {
      const page = (pagesData?.data ?? []).find((p: Page) => p.id === pageIdForLookup);
      const filters = page?.filters;
      if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
        raw = filters as Record<string, FilterConfig>;
      }
    }
    return normalizeFilterSchema(raw);
  }, [pageBuilderDetails, pagesData, pageIdForLookup]);

  const orderedSectionFilterEntries = useMemo(() => {
    const entries = Object.entries(sectionFilters);
    return entries.sort(([a], [b]) => filterFieldLabel(t, a).localeCompare(filterFieldLabel(t, b)));
  }, [sectionFilters, t]);

  const orderedPageFilterEntries = useMemo(() => {
    const entries = Object.entries(visiblePageShowWhenFilters(pageFilters, isCategoryPage));
    return entries.sort(([a], [b]) => filterFieldLabel(t, a).localeCompare(filterFieldLabel(t, b)));
  }, [pageFilters, isCategoryPage, t]);

  // On category pages the linked category is implicit — lock content filter to it.
  useEffect(() => {
    if (!isCategoryPage || !linkedCategoryId || !sectionFilters.category_id) return;
    setFilterValues((prev) => {
      if (prev.category_id === linkedCategoryId) return prev;
      return { ...prev, category_id: linkedCategoryId };
    });
  }, [isCategoryPage, linkedCategoryId, sectionFilters.category_id, sectionIdForDetails]);

  // Initialize or hydrate visibility filters for the selected page.
  useEffect(() => {
    if (!pageIdForLookup || Object.keys(pageFilters).length === 0) {
      setShowWhenValues({});
      showWhenHydratedForPageRef.current = null;
      showWhenSchemaRef.current = '';
      return;
    }

    const schemaSignature = Object.keys(pageFilters).sort().join(',');
    const pageAlreadyHydrated =
      showWhenHydratedForPageRef.current === pageIdForLookup &&
      showWhenSchemaRef.current === schemaSignature;

    if (pageAlreadyHydrated) {
      return;
    }

    const savedShowWhen =
      id &&
      editShowWhenAppliedRef.current !== id &&
      pageSectionData?.data &&
      !isLoadingPageSection
        ? (pageSectionData.data as any).show_when
        : null;

    if (
      savedShowWhen &&
      typeof savedShowWhen === 'object' &&
      !Array.isArray(savedShowWhen)
    ) {
      setShowWhenValues(hydrateShowWhenValues(pageFilters, savedShowWhen));
      editShowWhenAppliedRef.current = id ?? null;
    } else {
      setShowWhenValues(hydrateShowWhenValues(pageFilters, {}));
    }

    showWhenHydratedForPageRef.current = pageIdForLookup;
    showWhenSchemaRef.current = schemaSignature;
  }, [pageIdForLookup, pageFilters, id, pageSectionData, isLoadingPageSection]);

  const handleResetVisibilityFilters = () => {
    setShowWhenValues(hydrateShowWhenValues(pageFilters, {}));
    if (pageIdForLookup) {
      showWhenHydratedForPageRef.current = pageIdForLookup;
      showWhenSchemaRef.current = Object.keys(pageFilters).sort().join(',');
    }
  };

  return (
    <>
      <title>{t('form.editPageSectionDocumentTitle', { appName: CONFIG.appName })}</title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('PageSection form validation errors:', errors);
          const firstError = Object.values(errors)[0] as any;
          const message =
            firstError?.message ||
            firstError?.en?.message ||
            firstError?.ar?.message ||
            t('pleaseFixValidationErrors');
          toast.error(message);
        })}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.editPageSection')}
        description={
          isCategoryPage
            ? t('form.editPageSectionDescCategory')
            : t('form.editPageSectionDesc')
        }
        isEditMode
        isLoading={isLoadingPageSection}
        loadingText={t('form.loadingPageSection')}
        infoText={infoText}
        submitLabel={t('form.updatePageSectionSubmit')}
        submittingLabel={t('form.updatingPageSection')}
      >
        <CategoryPageBanner page={pageBuilderDetails?.data} />
        <FilterNoticeCallout text={t('form.pageSectionEditPlacementNotice')} />
        {sectionIdForDetails > 0 && can('section.update') && (
          <Box className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Box className="flex items-start gap-2.5 min-w-0">
              <Iconify icon="solar:box-bold" className="text-primary shrink-0 mt-0.5" width={18} />
              <Typography variant="body2" className="text-muted-foreground leading-relaxed">
                {linkedSectionType === 'manual'
                  ? t('form.pageSectionEditManualContentHint')
                  : t('form.pageSectionEditApiContentHint')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="contained"
              size="small"
              className="shrink-0 gap-2 self-start"
              onClick={() => navigate(`/sections/update/${sectionIdForDetails}`)}
            >
              <Iconify icon="solar:pen-bold" width={16} />
              {t('form.pageSectionEditOpenSectionContent')}
            </Button>
          </Box>
        )}
        {isCategoryPage && (
          <FilterNoticeCallout text={t('form.pageBuilderPageSectionEditLocalNotice')} />
        )}

        {/* ── Section & Page (each with inline filters) ── */}
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section card + content filters */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:widget-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageSectionFormSectionLabel')}
              </Typography>
            </Box>
            <Box className="p-6">
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:widget-bold" className="text-amber-500" width={20} height={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.pageSectionFormSectionLabel')}
                  </Typography>
                </Box>
                <RHFInfiniteSelect
                  name="section_id"
                  queryKey={['pageBuilder', 'sliders', pageIdForLookup, 'infinite']}
                  fetcher={sliderFetcher}
                  placeholder={t('form.selectSection')}
                  helperText={t('form.selectSectionHelper')}
                  initialLabel={linkedSectionName || undefined}
                />
                {serverFieldErrors.section_id && (
                  <Typography variant="caption" className="mt-1 block text-destructive">
                    {serverFieldErrors.section_id}
                  </Typography>
                )}

                {(linkedContentType || linkedSectionType) && (
                  <Box className="mt-3 flex flex-wrap items-center gap-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.sectionContentTypeLabel')}
                    </Typography>
                    {linkedContentType && (
                      <span className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        {contentTypeLabel(t, linkedContentType)}
                      </span>
                    )}
                    {linkedSectionType && (
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {sectionTypeLabel(t, linkedSectionType)}
                      </span>
                    )}
                  </Box>
                )}
              </Box>

              {sectionIdForDetails && Object.keys(sectionFilters).length > 0 && (
                <Box className="mt-5 border-t border-border/40 pt-5 bg-muted/20 -mx-6 px-6 pb-1">
                  <Box className="flex items-center gap-2 mb-3">
                    <Iconify icon="solar:feed-bold" className="text-amber-500" width={18} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.pageSliderContentFiltersTitle')}
                    </Typography>
                  </Box>
                  <FilterNoticeCallout text={t('form.pageSliderContentFiltersNotice')} />
                  <Box className="grid grid-cols-1 gap-5">
                        {orderedSectionFilterEntries.map(([filterKey, filterConfig]) => {
                          const lockCategoryOnPage =
                            isCategoryPage &&
                            filterKey === 'category_id' &&
                            linkedCategoryId != null;

                          return (
                          <Box key={filterKey}>
                            <DynamicFilterField
                              filterKey={filterKey}
                              filterConfig={filterConfig}
                              value={
                                lockCategoryOnPage ? linkedCategoryId : filterValues[filterKey]
                              }
                              onChange={(value) => handleFilterChange(filterKey, value)}
                              readOnly={lockCategoryOnPage}
                              initialLabel={
                                lockCategoryOnPage ? linkedCategoryName : undefined
                              }
                              helperText={
                                lockCategoryOnPage
                                  ? t('form.pageSectionEditCategoryFilterLocked')
                                  : undefined
                              }
                            />
                            {serverFieldErrors[`filters.${filterKey}`] && (
                              <Typography variant="caption" className="mt-1 block text-destructive">
                                {serverFieldErrors[`filters.${filterKey}`]}
                              </Typography>
                            )}
                          </Box>
                          );
                        })}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Page card + visibility filters */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-indigo-500/[0.06] via-indigo-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:document-bold" className="text-indigo-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageSectionFormPageLabel')}
              </Typography>
            </Box>
            <Box className="p-6">
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:document-bold" className="text-indigo-500" width={20} height={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.pageSectionFormPageLabel')}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 mb-4">
                  <Typography variant="body2" className="font-semibold text-foreground">
                    {currentPageLabel || '-'}
                  </Typography>
                </Box>
                <FilterNoticeCallout text={t('form.pageSliderPageFixedNotice')} />
              </Box>

              {pageIdForLookup > 0 && orderedPageFilterEntries.length > 0 && (
                <Box className="mt-5 border-t border-border/40 pt-5 bg-muted/20 -mx-6 px-6 pb-1">
                  <Box className="flex items-center justify-between gap-3 mb-3">
                    <Box className="flex items-center gap-2 min-w-0">
                      <Iconify icon="solar:eye-bold" className="text-indigo-500 shrink-0" width={18} />
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('form.pageSliderVisibilityFiltersTitle')}
                      </Typography>
                    </Box>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      className="shrink-0"
                      onClick={handleResetVisibilityFilters}
                    >
                      <Iconify icon="solar:restart-bold" width={14} className="me-1.5" />
                      {t('form.pageSliderResetVisibilityFilters')}
                    </Button>
                  </Box>
                  <FilterNoticeCallout
                    text={
                      isCategoryPage
                        ? t('form.pageSectionEditVisibilityCategoryNotice')
                        : t('form.pageSliderVisibilityFiltersNotice')
                    }
                  />
                  <Box className="grid grid-cols-1 gap-5">
                        {orderedPageFilterEntries.map(([filterKey, filterConfig]) => (
                          <Box key={`show_when_${filterKey}`}>
                            <DynamicFilterField
                              filterKey={filterKey}
                              filterConfig={filterConfig}
                              value={showWhenValues[filterKey]}
                              onChange={(value) => handleShowWhenChange(filterKey, value)}
                              allowNullOption={VISIBILITY_NULL_FILTER_KEYS.has(filterKey)}
                            />
                            {serverFieldErrors[`show_when.${filterKey}`] && (
                              <Typography variant="caption" className="mt-1 block text-destructive">
                                {serverFieldErrors[`show_when.${filterKey}`]}
                              </Typography>
                            )}
                          </Box>
                        ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:text-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.sectionNameEnglishLabel')} / {t('form.sectionNameArabicLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:text-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.sectionNameEnglishLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder={t('form.sectionNameEnPlaceholder')}
                helperText={t('form.sectionNameEnHelper')}
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:text-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.sectionNameArabicLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder={t('form.sectionNameArPlaceholder')}
                helperText={t('form.sectionNameArHelper')}
                className="transition-all duration-200"
                dir="rtl"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Layout ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:align-vertical-spacing-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageSectionFormPositionLabel')} · {t('form.pageSectionFormOrderLabel')} ·{' '}
              {t('form.pageSectionFormLayoutLabel')} · {t('form.pageSectionFormVariantLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:align-vertical-spacing-bold" className="text-emerald-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormPositionLabel')}
                </Typography>
              </Box>
              <RHFSelect
                name="position"
                options={positionOptions}
                placeholder={t('form.selectPosition')}
                helperText={t('form.selectPositionHelper')}
                className="transition-all duration-200"
              />
              <FilterNoticeCallout text={t('form.pageSliderPositionAnchorNotice')} />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:sort-bold" className="text-emerald-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormOrderLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="order"
                type="number"
                placeholder={t('form.displayOrderPlaceholder')}
                helperText={t('form.displayOrderHelper')}
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:slider-horizontal-bold" className="text-emerald-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormLayoutLabel')}
                </Typography>
              </Box>
              <RHFSelect
                name="layout"
                options={layoutOptions}
                placeholder={t('form.selectLayout')}
                helperText={t('form.pageSectionLayoutHelper')}
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:box-minimalistic-bold" className="text-emerald-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormVariantLabel')}
                </Typography>
              </Box>
              <RHFSelect
                name="variant"
                options={variantOptions}
                placeholder={t('form.selectVariant')}
                helperText={t('form.pageSectionVariantHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Appearance ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:pallete-bold" className="text-rose-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageSectionFormBackgroundColorOptional')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:pallete-bold" className="text-rose-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormBackgroundColorOptional')}
                </Typography>
              </Box>
              <RHFColorPicker name="background_color" helperText={t('form.bgColorHelper')} />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:pallete-2-bold" className="text-rose-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormBackgroundCardColorOptional')}
                </Typography>
              </Box>
              <RHFColorPicker name="background_card_color" helperText={t('form.bgCardColorHelper')} />
            </Box>
          </Box>
        </Box>

      </CreateFormLayout>
    </>
  );
}
