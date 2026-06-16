import type { Page, SectionItem, FilterConfig, PageSectionVariant } from '../types/page-section.types';

import { axiosInstance } from '@/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFetchSectionDetails } from '@/pages/dashboard/sections/hooks/useSections';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { _PageSectionApi } from '@/pages/dashboard/sections/api/page-section.services';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import {
  filterFieldLabel,
  filterOptionLabel,
} from '@/pages/dashboard/sections/utils/filter-field-label';
import {
  PageSectionSchema,
  type PageSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-section.validation';
import {
  useFetchPages,
  useCreatePageSection,
  useUpdatePageSection,
  useFetchPageSectionDetails,
  useFetchSectionsForDropdown,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography, SimpleSelect } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { InfiniteScrollSelect } from 'src/shared/components/infinite-scroll-select';

// ----------------------------------------------------------------------

const FILTER_NULL_SENTINEL = '__NULL__';

const VISIBILITY_NULL_FILTER_KEYS = new Set(['type', 'shop_id', 'category_id', 'brand_id']);

const PAGE_SECTION_VARIANTS: PageSectionVariant[] = ['vertical', 'square'];

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

function parsePageSectionVariant(value: unknown): PageSectionVariant {
  if (value === 'vertical' || value === 'square') return value;
  /** Legacy API value — normalize so the form only submits allowed variants. */
  if (value === 'horizontal') return 'vertical';
  return 'vertical';
}

const sectionFetcher = (page: number, limit: number) =>
  _PageSectionApi.getSections(page, limit).then((r) => ({
    data: {
      items: (r.data?.items ?? []).map((s: any) => ({ id: s.id, label: s.name })),
      pagination:
        r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
    },
  }));

const pageFetcher = async () => {
  const r = await _PageSectionApi.getPages();
  const items = (r.data ?? []).map((p: Page) => ({
    id: p.id,
    label: cmsPageSelectLabel(p),
  }));
  return {
    data: {
      items,
      pagination: { current_page: 1, last_page: 1, per_page: items.length, total: items.length },
    },
  };
};


export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionItem | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showWhenValues, setShowWhenValues] = useState<Record<string, any>>({});
  const showWhenHydratedForPageRef = useRef<number | null>(null);
  const showWhenSchemaRef = useRef<string>('');
  const editShowWhenAppliedRef = useRef<string | null>(null);

  const { data: pageSectionData, isLoading: isLoadingPageSection } = useFetchPageSectionDetails(
    id || ''
  );
  const { data: sectionsData } = useFetchSectionsForDropdown();
  const { data: pagesData } = useFetchPages();
  const createPageSectionMutation = useCreatePageSection();
  const updatePageSectionMutation = useUpdatePageSection();

  const defaultValues = {
    name: {
      ar: '',
      en: '',
    },
    section_id: '',
    page_id: '',
    position: 'after' as const,
    variant: 'vertical' as PageSectionVariant,
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

  const { handleSubmit, reset, watch } = methods;

  const watchedSectionId = watch('section_id');
  const sectionIdForDetails =
    typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
  const { data: sectionDetailsData } = useFetchSectionDetails(sectionIdForDetails || '');

  const watchedPageId = watch('page_id');
  const pageIdForLookup =
    typeof watchedPageId === 'string' ? parseInt(watchedPageId, 10) : Number(watchedPageId);

  // Update selected section when section_id changes
  useEffect(() => {
    const sectionId =
      typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
    if (!sectionId || !sectionsData?.data?.items) {
      setSelectedSection(null);
      setSelectedSectionId(null);
      return;
    }
    const section = sectionsData.data.items.find((s: SectionItem) => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
      setSelectedSectionId(sectionId);
    } else {
      setSelectedSection(null);
      setSelectedSectionId(null);
    }
  }, [watchedSectionId, sectionsData]);

  useEffect(() => {
    if (isEditMode && pageSectionData?.data && !isLoadingPageSection) {
      const pageSection = pageSectionData.data;
      const ps = pageSection as any;
      const nameObj =
        typeof pageSection.name === 'object' &&
        pageSection.name &&
        !Array.isArray(pageSection.name)
          ? (pageSection.name as { en?: string; ar?: string })
          : null;
      const nameStr = typeof pageSection.name === 'string' ? pageSection.name : '';
      reset({
        name: {
          en: nameObj?.en ?? nameStr,
          ar: nameObj?.ar ?? nameStr,
        },
        section_id: ps.section_id ?? ps.section?.id ?? '',
        page_id: ps.page_id ?? ps.page?.id ?? '',
        position: pageSection.position ?? 'after',
        variant: parsePageSectionVariant(ps.variant),
        order: pageSection.order ?? 1,
        background_color: pageSection.background_color || '',
        background_card_color: pageSection.background_card_color || '',
        filters: {},
        show_when: {},
      });
      if (ps.filters && typeof ps.filters === 'object' && !Array.isArray(ps.filters)) {
        setFilterValues(ps.filters);
      }
    }
  }, [pageSectionData, isEditMode, isLoadingPageSection, reset]);

  const isSubmitting = createPageSectionMutation.isPending || updatePageSectionMutation.isPending;
  const errorMessage =
    createPageSectionMutation.error?.message || updatePageSectionMutation.error?.message || null;

  const onSubmit = async (data: PageSectionFormValues) => {
    // console.log(filterValues);

    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        section_id:
          typeof data.section_id === 'string' ? parseInt(data.section_id) : data.section_id,
        page_id: typeof data.page_id === 'string' ? parseInt(data.page_id) : data.page_id,
        position: data.position,
        variant: data.variant,
        order: typeof data.order === 'string' ? parseInt(data.order) : data.order,
        background_color: data.background_color || undefined,
        background_card_color: data.background_card_color || undefined,
        filters: Object.keys(filterValues).length > 0 ? filterValues : undefined,
        show_when: buildShowWhenPayload(pageFilters, showWhenValues),
      };

      if (isEditMode && id) {
        await updatePageSectionMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.pageSectionUpdatedSuccess'));
        navigate('/sections/page-sections');
      } else {
        await createPageSectionMutation.mutateAsync(payload);
        toast.success(t('form.pageSectionCreatedSuccess'));
        navigate('/sections/page-sections');
      }
    } catch (error: any) {
      console.error('Error saving page section:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections/page-sections');
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

  const variantOptions = useMemo(
    () =>
      PAGE_SECTION_VARIANTS.map((v) => ({
        value: v,
        label: t(`form.pageSectionVariant_${v}`),
      })),
    [t]
  );

  const infoText = isEditMode ? t('form.pageSectionFormInfoEdit') : t('form.pageSectionFormInfoCreate');

  // Prefer full section details: API sections expose filters under `api.filters`.
  const sectionFilters = useMemo(() => {
    const data = sectionDetailsData?.data as any;
    const fromApi = data?.api?.filters;
    if (fromApi && typeof fromApi === 'object' && !Array.isArray(fromApi)) {
      return fromApi as Record<string, FilterConfig>;
    }
    const fromList = selectedSection?.filters;
    if (fromList && typeof fromList === 'object' && !Array.isArray(fromList)) {
      return fromList as Record<string, FilterConfig>;
    }
    return {};
  }, [sectionDetailsData, selectedSection]);

  // Show When schema comes from the selected page's embedded `filters`.
  const pageFilters = useMemo(() => {
    if (!pageIdForLookup) return {};
    const page = (pagesData?.data ?? []).find((p: Page) => p.id === pageIdForLookup);
    const filters = page?.filters;
    if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
      return filters as Record<string, FilterConfig>;
    }
    return {};
  }, [pagesData, pageIdForLookup]);

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
      isEditMode &&
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
  }, [
    pageIdForLookup,
    pageFilters,
    isEditMode,
    id,
    pageSectionData,
    isLoadingPageSection,
  ]);

  const handleResetVisibilityFilters = () => {
    setShowWhenValues(hydrateShowWhenValues(pageFilters, {}));
    if (pageIdForLookup) {
      showWhenHydratedForPageRef.current = pageIdForLookup;
      showWhenSchemaRef.current = Object.keys(pageFilters).sort().join(',');
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.editPageSectionDocumentTitle', { appName: CONFIG.appName })
          : t('form.createPageSectionDocumentTitle', { appName: CONFIG.appName })}
      </title>

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
        title={isEditMode ? t('form.editPageSection') : t('form.createPageSection')}
        description={isEditMode ? t('form.editPageSectionDesc') : t('form.createPageSectionDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingPageSection}
        loadingText={t('form.loadingPageSection')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updatePageSectionSubmit') : t('form.createPageSectionSubmit')}
        submittingLabel={isEditMode ? t('form.updatingPageSection') : t('form.creatingPageSection')}
      >
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
                  queryKey={['pageSection', 'sections', 'infinite']}
                  fetcher={sectionFetcher}
                  placeholder={t('form.selectSection')}
                  helperText={t('form.selectSectionHelper')}
                  initialLabel={
                    sectionsData?.data?.items?.find(
                      (s: SectionItem) =>
                        s.id === Number((pageSectionData?.data as any)?.section_id ?? 0)
                    )?.name
                  }
                />
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
                    {Object.entries(sectionFilters).map(([filterKey, filterConfig]) => (
                      <DynamicFilterField
                        key={filterKey}
                        filterKey={filterKey}
                        filterConfig={filterConfig}
                        value={filterValues[filterKey]}
                        onChange={(value) => handleFilterChange(filterKey, value)}
                      />
                    ))}
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
                <RHFInfiniteSelect
                  name="page_id"
                  queryKey={['pageSection', 'pages', 'infinite']}
                  fetcher={() => pageFetcher()}
                  placeholder={t('form.selectPage')}
                  helperText={t('form.selectPageHelper')}
                  initialLabel={cmsPageSelectLabel({
                    title:
                      (pageSectionData?.data as any)?.page_title ??
                      (pageSectionData?.data as any)?.page?.title,
                    slug: String((pageSectionData?.data as any)?.page?.slug ?? '').trim(),
                    id: (() => {
                      const raw =
                        (pageSectionData?.data as any)?.page_id ??
                        (pageSectionData?.data as any)?.page?.id;
                      const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
                      return Number.isFinite(n) ? n : undefined;
                    })(),
                  })}
                />
              </Box>

              {pageIdForLookup && Object.keys(pageFilters).length > 0 && (
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
                  <FilterNoticeCallout text={t('form.pageSliderVisibilityFiltersNotice')} />
                  <Box className="grid grid-cols-1 gap-5">
                    {Object.entries(pageFilters).map(([filterKey, filterConfig]) => (
                      <DynamicFilterField
                        key={`show_when_${filterKey}`}
                        filterKey={filterKey}
                        filterConfig={filterConfig}
                        value={showWhenValues[filterKey]}
                        onChange={(value) => handleShowWhenChange(filterKey, value)}
                        allowNullOption={VISIBILITY_NULL_FILTER_KEYS.has(filterKey)}
                      />
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
              {t('form.pageSectionFormVariantLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
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

function DynamicFilterField({
  filterKey,
  filterConfig,
  value,
  onChange,
  allowNullOption = false,
}: {
  filterKey: string;
  filterConfig: FilterConfig;
  value: any;
  onChange: (value: any) => void;
  allowNullOption?: boolean;
}) {
  const { t } = useTranslation('table');
  const label = filterFieldLabel(t, filterKey);
  const nullOptionLabel = t('form.pageSliderFilterAllNoFilter');
  const isNullValue = allowNullOption && (value === null || value === undefined);

  if (filterConfig.type === 'number') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <input
          type="number"
          value={isNullValue ? '' : value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('form.filterEnterPlaceholder', { name: label })}
        />
      </Box>
    );
  }

  if (
    filterConfig.type === 'select' &&
    Array.isArray(filterConfig.items) &&
    filterConfig.items.length > 0
  ) {
    const options = [
      ...(allowNullOption
        ? [{ value: FILTER_NULL_SENTINEL, label: nullOptionLabel }]
        : []),
      ...filterConfig.items.map((item) => ({
        value: item,
        label: filterOptionLabel(t, String(item)),
      })),
    ];

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <SimpleSelect
          fullWidth
          value={
            isNullValue
              ? FILTER_NULL_SENTINEL
              : value != null && value !== ''
                ? String(value)
                : ''
          }
          onChange={(v) => {
            if (allowNullOption && v === FILTER_NULL_SENTINEL) {
              onChange(null);
              return;
            }
            onChange(v === '' ? undefined : v);
          }}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          options={options}
        />
      </Box>
    );
  }

  if (filterConfig.type === 'select' && filterConfig.url) {
    const url = filterConfig.url;
    const fetcher = (page: number, limit: number) =>
      axiosInstance.get(url, { params: { page, limit } }).then((r) => {
        const responseData = r.data?.data;
        const items = responseData?.items ?? (Array.isArray(responseData) ? responseData : []);
        const pagination = responseData?.pagination ?? {
          current_page: 1,
          last_page: 1,
          per_page: items.length,
          total: items.length,
        };
        return {
          data: {
            items: items.map((item: any) => ({
              id: item.id,
              label:
                item.name ||
                item.title ||
                t('form.filterItemFallbackLabel', { id: item.id }),
            })),
            pagination,
          },
        };
      });

    const numericValue =
      !isNullValue && value != null && value !== '' ? Number(value) : 0;

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <InfiniteScrollSelect
          value={numericValue}
          onChange={(val) => onChange(val > 0 ? val : undefined)}
          queryKey={['filter-data', url, 'infinite']}
          fetcher={fetcher}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          nullOptionLabel={allowNullOption ? nullOptionLabel : undefined}
          isNullValue={isNullValue}
          onSelectNull={allowNullOption ? () => onChange(null) : undefined}
        />
      </Box>
    );
  }

  if (filterConfig.type === 'text') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <input
          type="text"
          value={value != null && value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('form.filterEnterPlaceholder', { name: label })}
        />
      </Box>
    );
  }

  return (
    <Box className="group">
      <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
        {label}
      </Typography>
      <input
        type="text"
        value={value != null && value !== undefined ? String(value) : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={t('form.filterEnterPlaceholder', { name: label })}
      />
    </Box>
  );
}
