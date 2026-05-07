import type { SectionItem, FilterConfig, PageSectionVariant } from '../types/page-section.types';

import { axiosInstance } from '@/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchSectionDetails } from '@/pages/dashboard/sections/hooks/useSections';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { _PageSectionApi } from '@/pages/dashboard/sections/api/page-section.services';
import {
  PageSectionSchema,
  type PageSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-section.validation';
import {
  useCreatePageSection,
  useUpdatePageSection,
  useFetchPageSectionDetails,
  useFetchSectionsForDropdown,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Typography, SimpleSelect } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { InfiniteScrollSelect } from 'src/shared/components/infinite-scroll-select';

// ----------------------------------------------------------------------

const PAGE_SECTION_VARIANTS: PageSectionVariant[] = ['vertical', 'horizontal', 'square'];

function parsePageSectionVariant(value: unknown): PageSectionVariant {
  if (value === 'vertical' || value === 'horizontal' || value === 'square') return value;
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
  const items = (r.data ?? []).map((p: any) => ({ id: p.id, label: p.title }));
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

  const { data: pageSectionData, isLoading: isLoadingPageSection } = useFetchPageSectionDetails(
    id || ''
  );
  const { data: sectionsData } = useFetchSectionsForDropdown();
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
      if (ps.show_when && typeof ps.show_when === 'object' && !Array.isArray(ps.show_when)) {
        setShowWhenValues(ps.show_when);
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
        show_when: Object.keys(showWhenValues).length > 0 ? showWhenValues : undefined,
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
        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageSectionFormSectionLabel')} & {t('form.pageSectionFormPageLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:widget-bold" className="text-violet-500" width={20} height={20} />
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

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-bold" className="text-violet-500" width={20} height={20} />
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
                initialLabel={
                  (pageSectionData?.data as any)?.page_title ??
                  (pageSectionData?.data as any)?.page?.title
                }
              />
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

        {/* ── Section: Query Filters ── */}
        {sectionIdForDetails && Object.keys(sectionFilters).length > 0 && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:filter-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageSectionFormQueryFiltersTitle')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* ── Section: Show When Filters ── */}
        {sectionIdForDetails && Object.keys(sectionFilters).length > 0 && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:filter-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageSectionFormShowWhenTitle')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(sectionFilters).map(([filterKey, filterConfig]) => (
                <DynamicFilterField
                  key={`show_when_${filterKey}`}
                  filterKey={filterKey}
                  filterConfig={filterConfig}
                  value={showWhenValues[filterKey]}
                  onChange={(value) => handleShowWhenChange(filterKey, value)}
                />
              ))}
            </Box>
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}

function formatFilterItemLabel(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function DynamicFilterField({
  filterKey,
  filterConfig,
  value,
  onChange,
}: {
  filterKey: string;
  filterConfig: FilterConfig;
  value: any;
  onChange: (value: any) => void;
}) {
  const { t } = useTranslation('table');
  const label = formatFilterItemLabel(filterKey);
  const nameForPlaceholder = filterKey.replace(/_/g, ' ');

  if (filterConfig.type === 'number') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('form.filterEnterPlaceholder', { name: nameForPlaceholder })}
        />
      </Box>
    );
  }

  if (
    filterConfig.type === 'select' &&
    Array.isArray(filterConfig.items) &&
    filterConfig.items.length > 0
  ) {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <SimpleSelect
          fullWidth
          value={value != null && value !== '' ? String(value) : ''}
          onChange={(v) => onChange(v === '' ? undefined : v)}
          placeholder={t('form.filterSelectPlaceholder', { name: nameForPlaceholder })}
          options={filterConfig.items.map((item) => ({
            value: item,
            label: formatFilterItemLabel(item),
          }))}
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

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <InfiniteScrollSelect
          value={value || 0}
          onChange={(val) => onChange(val || undefined)}
          queryKey={['filter-data', url, 'infinite']}
          fetcher={fetcher}
          placeholder={t('form.filterSelectPlaceholder', { name: nameForPlaceholder })}
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
          placeholder={t('form.filterEnterPlaceholder', { name: nameForPlaceholder })}
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
        placeholder={t('form.filterEnterPlaceholder', { name: nameForPlaceholder })}
      />
    </Box>
  );
}
