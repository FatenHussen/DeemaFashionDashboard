import type { Page, FilterConfig } from '../types/page-section.types';
import type { SliderLibraryItem, UnifiedSectionCreatePayload } from '../types/page-builder.types';

import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import { DynamicFilterField } from '@/pages/dashboard/sections/components/dynamic-filter-field';
import { CategoryPageBanner } from '@/pages/dashboard/sections/components/category-page-banner';
import { SliderLibraryPicker } from '@/pages/dashboard/sections/components/slider-library-picker';
import {
  useAddSectionToPage,
  useFetchPageBuilderPage,
} from '@/pages/dashboard/sections/hooks/usePageBuilder';
import {
  UnifiedSectionSchema,
  type UnifiedSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-builder.validation';
import { isBannerContentType } from '@/pages/dashboard/sections/utils/content-type-config';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const VISIBILITY_NULL_FILTER_KEYS = new Set(['type', 'shop_id', 'category_id', 'brand_id']);

const VARIANTS = ['horizontal', 'vertical', 'square'] as const;

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

export default function PageAddSection() {
  const { t } = useTranslation('table');
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const [showWhenValues, setShowWhenValues] = useState<Record<string, any>>({});
  const [selectedSection, setSelectedSection] = useState<SliderLibraryItem | null>(null);

  const { data: pagesData } = useFetchPages();
  const { data: pageDetailsData } = useFetchPageBuilderPage(pageId || '');
  const addSectionMutation = useAddSectionToPage();

  const page = useMemo(
    () =>
      (pageDetailsData?.data as Page | undefined) ??
      (pagesData?.data ?? []).find((p: Page) => String(p.id) === String(pageId ?? '')),
    [pageDetailsData, pagesData, pageId]
  );

  const pageFilters = useMemo(() => {
    const filters = page?.filters;
    if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
      return filters as Record<string, FilterConfig>;
    }
    return {};
  }, [page]);

  const hasBannerSectionOnPage = useMemo(() => {
    const sections = (pageDetailsData?.data as any)?.sections ?? [];
    return Array.isArray(sections)
      ? sections.some((s: any) => isBannerContentType(s?.content_type))
      : false;
  }, [pageDetailsData]);

  const isBannerSection = isBannerContentType(selectedSection?.content_type);

  const methods = useForm<UnifiedSectionFormValues>({
    resolver: zodResolver(UnifiedSectionSchema),
    defaultValues: {
      position: 'after',
      variant: 'horizontal',
      order: '',
      background_color: '',
      background_card_color: '',
    },
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (!selectedSection) return;
    setValue('background_color', selectedSection.background_color ?? '');
    setValue('background_card_color', selectedSection.background_card_color ?? '');
    if (isBannerContentType(selectedSection.content_type)) {
      setValue('variant', 'horizontal');
      return;
    }
    const nextVariant = (VARIANTS as readonly string[]).includes(selectedSection.variant ?? '')
      ? (selectedSection.variant as (typeof VARIANTS)[number])
      : 'horizontal';
    setValue('variant', nextVariant);
  }, [selectedSection, setValue]);

  const positionOptions = useMemo(
    () => [
      { value: 'before', label: t('form.positionBefore') },
      { value: 'after', label: t('form.positionAfter') },
    ],
    [t]
  );

  const variantOptions = useMemo(
    () =>
      VARIANTS.map((v) => ({
        value: v,
        label: t(`form.pageSectionVariant_${v}`),
      })),
    [t]
  );

  const handleShowWhenChange = (filterKey: string, value: any) => {
    setShowWhenValues((prev) => ({ ...prev, [filterKey]: value }));
  };

  const onSubmit = async (data: UnifiedSectionFormValues) => {
    if (!pageId) return;

    if (!selectedSection) {
      toast.error(t('form.pageBuilderLibraryRequired'));
      return;
    }

    const orderNumber = data.order === '' || data.order == null ? undefined : Number(data.order);

    const payload: UnifiedSectionCreatePayload = {
      section_id: selectedSection.id,
      position: data.position,
      ...(data.variant && !isBannerSection ? { variant: data.variant } : {}),
      ...(data.background_color ? { background_color: data.background_color } : {}),
      ...(data.background_card_color ? { background_card_color: data.background_card_color } : {}),
      ...(orderNumber != null && Number.isFinite(orderNumber) && orderNumber >= 1
        ? { order: orderNumber }
        : {}),
      ...(buildShowWhenPayload(pageFilters, showWhenValues)
        ? { show_when: buildShowWhenPayload(pageFilters, showWhenValues) }
        : {}),
    };

    try {
      await addSectionMutation.mutateAsync({ pageId, data: payload });
      toast.success(t('form.pageBuilderSectionAddedSuccess'));
      navigate(`/sections/pages/details/${pageId}`);
    } catch (error) {
      console.error('Error linking section to page:', error);
    }
  };

  const handleCancel = () => {
    navigate(pageId ? `/sections/pages/details/${pageId}` : '/sections/pages');
  };

  const pageLabel = page ? cmsPageSelectLabel(page) : (pageId ?? '');

  return (
    <>
      <title>{t('form.pageBuilderAddSectionDocumentTitle', { appName: CONFIG.appName })}</title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit, (errors) => {
          const firstError = Object.values(errors)[0] as any;
          const message = firstError?.message || t('pleaseFixValidationErrors');
          toast.error(message);
        })}
        onCancel={handleCancel}
        isSubmitting={addSectionMutation.isPending}
        errorMessage={addSectionMutation.error?.message || null}
        title={t('form.pageBuilderAddSectionTitle', { page: pageLabel })}
        description={t('form.pageBuilderAddSectionDesc')}
        isEditMode={false}
        isLoading={false}
        loadingText=""
        infoText={t('form.pageBuilderAddSectionInfo')}
        submitLabel={t('form.pageBuilderAddSectionSubmit')}
        submittingLabel={t('form.creatingPageSection')}
      >
        <CategoryPageBanner page={pageDetailsData?.data} />

        <SliderLibraryPicker
          pageId={pageId ?? ''}
          selectedId={selectedSection?.id ?? null}
          onSelect={setSelectedSection}
        />

        {isBannerSection && (
          <Box className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <Box className="flex items-start gap-3">
              <Iconify icon="solar:gallery-bold" className="mt-0.5 shrink-0 text-amber-700" width={18} />
              <Typography variant="body2" className="min-w-0 flex-1 text-muted-foreground">
                {t('form.pageBuilderBannerPickHelper')}
              </Typography>
            </Box>
          </Box>
        )}

        {isBannerSection && hasBannerSectionOnPage && (
            <Box className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
              <Box className="flex items-start gap-3">
                <Iconify icon="solar:info-circle-bold" className="mt-0.5 shrink-0 text-amber-700" width={18} />
                <Typography variant="body2" className="min-w-0 flex-1 text-muted-foreground">
                  {t('form.pageBuilderBannerExistingWarning')}
                </Typography>
              </Box>
            </Box>
          )}

        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify
                icon="solar:align-vertical-spacing-bold"
                className="text-emerald-500"
                width={15}
              />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {isBannerSection
                ? `${t('form.pageSectionFormPositionLabel')} · ${t('form.pageSectionFormOrderLabel')}`
                : `${t('form.pageSectionFormPositionLabel')} · ${t('form.pageSectionFormOrderLabel')} · ${t('form.pageSectionFormVariantLabel')}`}
            </Typography>
          </Box>
          <Box className="p-6">
            <Typography variant="body2" className="text-muted-foreground mb-4">
              {t('form.pageBuilderLibraryCopiedNote')}
            </Typography>
            <Box className={`grid grid-cols-1 gap-5 ${isBannerSection ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify
                    icon="solar:align-vertical-spacing-bold"
                    className="text-emerald-500"
                    width={20}
                    height={20}
                  />
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
                  <Iconify
                    icon="solar:sort-bold"
                    className="text-emerald-500"
                    width={20}
                    height={20}
                  />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.pageSectionFormOrderLabel')}
                  </Typography>
                </Box>
                <RHFTextField
                  name="order"
                  type="number"
                  placeholder={t('form.displayOrderPlaceholder')}
                  helperText={t('form.pageBuilderOrderOptionalHelper')}
                  className="transition-all duration-200"
                />
              </Box>

              {!isBannerSection && (
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify
                    icon="solar:box-minimalistic-bold"
                    className="text-emerald-500"
                    width={20}
                    height={20}
                  />
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
              )}
            </Box>
          </Box>
        </Box>

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
                <Iconify
                  icon="solar:pallete-bold"
                  className="text-rose-500"
                  width={20}
                  height={20}
                />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormBackgroundColorOptional')}
                </Typography>
              </Box>
              <RHFColorPicker name="background_color" helperText={t('form.bgColorHelper')} />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify
                  icon="solar:pallete-2-bold"
                  className="text-rose-500"
                  width={20}
                  height={20}
                />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageSectionFormBackgroundCardColorOptional')}
                </Typography>
              </Box>
              <RHFColorPicker
                name="background_card_color"
                helperText={t('form.bgCardColorHelper')}
              />
            </Box>
          </Box>
        </Box>

        {Object.keys(pageFilters).length > 0 && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-indigo-500/[0.06] via-indigo-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:eye-bold" className="text-indigo-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageSliderVisibilityFiltersTitle')}
              </Typography>
            </Box>
            <Box className="p-6">
              <Typography variant="body2" className="text-muted-foreground mb-4">
                {t('form.pageSectionFormShowWhenHint')}
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}
