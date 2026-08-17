import type { ItemIdEntry } from '../types/section.types';
import type { Page, FilterConfig } from '../types/page-section.types';
import type { UnifiedSectionCreatePayload } from '../types/page-builder.types';

import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchPages } from '@/pages/dashboard/sections/hooks/usePageSections';
import { useAddSectionToPage } from '@/pages/dashboard/sections/hooks/usePageBuilder';
import { useFetchSectionItemTypes } from '@/pages/dashboard/sections/hooks/useManualItems';
import { cmsPageSelectLabel } from '@/pages/dashboard/sections/utils/cms-page-select-label';
import { DynamicFilterField } from '@/pages/dashboard/sections/components/dynamic-filter-field';
import {
  apiMethodOptions,
  API_METHOD_FILTERS,
} from '@/pages/dashboard/sections/utils/api-method-config';
import {
  isGifManualModel,
  ManualItemsPicker,
} from '@/pages/dashboard/sections/components/manual-items-picker';
import {
  UnifiedSectionSchema,
  type UnifiedSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-builder.validation';

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

function cleanFilters(values: Record<string, any>): Record<string, any> | undefined {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(values)) {
    if (val !== undefined && val !== null && val !== '') {
      result[key] = val;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function TypeCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl border p-5 text-start transition-all ${
        active
          ? 'border-primary/60 bg-primary/[0.06] shadow-sm ring-2 ring-primary/20'
          : 'border-border/50 bg-card/50 hover:border-border hover:shadow-sm'
      }`}
    >
      <Box className="flex items-center gap-3 mb-2">
        <Box
          className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
            active
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted/50 border-border/50 text-muted-foreground'
          }`}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Typography variant="subtitle1" className="font-bold text-foreground">
          {title}
        </Typography>
        {active && (
          <Iconify icon="solar:check-circle-bold" className="text-primary ms-auto" width={22} />
        )}
      </Box>
      <Typography variant="body2" className="text-muted-foreground">
        {description}
      </Typography>
    </button>
  );
}

export default function PageAddSection() {
  const { t } = useTranslation('table');
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const [orderedItems, setOrderedItems] = useState<ItemIdEntry[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showWhenValues, setShowWhenValues] = useState<Record<string, any>>({});

  const { data: pagesData } = useFetchPages();
  const itemTypesQuery = useFetchSectionItemTypes();
  const addSectionMutation = useAddSectionToPage();

  const page = useMemo(
    () => (pagesData?.data ?? []).find((p: Page) => String(p.id) === String(pageId ?? '')),
    [pagesData, pageId]
  );

  const pageFilters = useMemo(() => {
    const filters = page?.filters;
    if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
      return filters as Record<string, FilterConfig>;
    }
    return {};
  }, [page]);

  const methods = useForm<UnifiedSectionFormValues>({
    resolver: zodResolver(UnifiedSectionSchema),
    defaultValues: {
      type: 'api',
      name: { ar: '', en: '' },
      manual_model: '',
      api_method: '',
      position: 'after',
      variant: 'horizontal',
      order: '',
      background_color: '',
      background_card_color: '',
    },
  });

  const { handleSubmit, watch, setValue } = methods;

  const watchedType = watch('type');
  const watchedManualModel = watch('manual_model') ?? '';
  const watchedApiMethod = watch('api_method') ?? '';

  const apiFilterSchema = useMemo(
    () =>
      (API_METHOD_FILTERS as Record<string, Record<string, FilterConfig>>)[watchedApiMethod] ?? {},
    [watchedApiMethod]
  );

  const manualModelOptions = itemTypesQuery.data?.data
    ? Object.entries(itemTypesQuery.data.data)
        .filter(([_, value]) => !Array.isArray(value))
        .map(([key]) => ({
          value: key,
          label: t(`form.pageSectionFilterValues.${key}`, {
            defaultValue: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
          }),
        }))
    : [];

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

  const handleTypeChange = (type: 'manual' | 'api') => {
    setValue('type', type, { shouldValidate: true });
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleShowWhenChange = (filterKey: string, value: any) => {
    setShowWhenValues((prev) => ({ ...prev, [filterKey]: value }));
  };

  const onSubmit = async (data: UnifiedSectionFormValues) => {
    if (!pageId) return;

    if (data.type === 'manual' && orderedItems.length === 0) {
      toast.error(t('form.pageBuilderItemsRequired'));
      return;
    }

    const nameEn = data.name.en.trim();
    const nameAr = data.name.ar.trim();
    const hasName = nameEn !== '' || nameAr !== '';

    const orderNumber = data.order === '' || data.order == null ? undefined : Number(data.order);

    const payload: UnifiedSectionCreatePayload = {
      type: data.type,
      ...(hasName ? { name: { en: nameEn || nameAr, ar: nameAr || nameEn } } : {}),
      position: data.position,
      variant: data.variant,
      ...(orderNumber != null && Number.isFinite(orderNumber) && orderNumber >= 1
        ? { order: orderNumber }
        : {}),
      ...(data.background_color ? { background_color: data.background_color } : {}),
      ...(data.background_card_color ? { background_card_color: data.background_card_color } : {}),
      ...(data.type === 'manual'
        ? {
            manual_model: data.manual_model,
            item_ids: orderedItems.map((entry, index) => {
              const trimmed = entry.link?.trim() ?? '';
              return {
                item_id: entry.item_id,
                order: index,
                link: isGifManualModel(data.manual_model)
                  ? trimmed === ''
                    ? null
                    : trimmed
                  : trimmed || `/item/${entry.item_id}`,
              };
            }),
          }
        : {
            api_method: data.api_method,
            ...(cleanFilters(filterValues) ? { filters: cleanFilters(filterValues) } : {}),
          }),
      ...(buildShowWhenPayload(pageFilters, showWhenValues)
        ? { show_when: buildShowWhenPayload(pageFilters, showWhenValues) }
        : {}),
    };

    try {
      await addSectionMutation.mutateAsync({ pageId, data: payload });
      toast.success(t('form.pageBuilderSectionAddedSuccess'));
      navigate(`/sections/pages/details/${pageId}`);
    } catch (error) {
      console.error('Error adding section to page:', error);
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
        {/* ── Content source ── */}
        <Box className="flex flex-col sm:flex-row gap-4">
          <TypeCard
            active={watchedType === 'api'}
            icon="solar:server-square-bold"
            title={t('form.pageBuilderTypeApiTitle')}
            description={t('form.pageBuilderTypeApiDesc')}
            onClick={() => handleTypeChange('api')}
          />
          <TypeCard
            active={watchedType === 'manual'}
            icon="solar:hand-stars-bold"
            title={t('form.pageBuilderTypeManualTitle')}
            description={t('form.pageBuilderTypeManualDesc')}
            onClick={() => handleTypeChange('manual')}
          />
        </Box>

        {/* ── API content ── */}
        {watchedType === 'api' && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-blue-500/[0.06] via-blue-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:server-square-bold" className="text-blue-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pageBuilderApiMethodLabel')}
              </Typography>
            </Box>
            <Box className="p-6">
              <RHFSelect
                name="api_method"
                options={apiMethodOptions(t)}
                placeholder={t('form.pageBuilderApiMethodPlaceholder')}
                helperText={t('form.pageBuilderApiMethodHelper')}
                className="transition-all duration-200"
              />

              {watchedApiMethod && Object.keys(apiFilterSchema).length > 0 && (
                <Box className="mt-5 border-t border-border/40 pt-5 bg-muted/20 -mx-6 px-6 pb-1">
                  <Box className="flex items-center gap-2 mb-3">
                    <Iconify icon="solar:feed-bold" className="text-blue-500" width={18} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.pageSliderContentFiltersTitle')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="text-muted-foreground mb-4">
                    {t('form.pageBuilderApiFiltersNotice')}
                  </Typography>
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Object.entries(apiFilterSchema).map(([filterKey, filterConfig]) => (
                      <DynamicFilterField
                        key={`${watchedApiMethod}_${filterKey}`}
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
        )}

        {/* ── Manual content ── */}
        {watchedType === 'manual' && (
          <>
            <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
              <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
                <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Iconify icon="solar:widget-bold" className="text-violet-500" width={15} />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.manualModelLabel')}
                </Typography>
              </Box>
              <Box className="p-6">
                <RHFSelect
                  name="manual_model"
                  options={manualModelOptions}
                  placeholder={t('form.selectModelType')}
                  helperText={t('form.manualModelHelperCreate')}
                  className="transition-all duration-200"
                />
              </Box>
            </Box>

            {watchedManualModel ? (
              <ManualItemsPicker
                manualModel={watchedManualModel}
                orderedItems={orderedItems}
                setOrderedItems={setOrderedItems}
              />
            ) : (
              <Box className="rounded-2xl border border-border/50 border-dashed bg-card/30 p-10 text-center shadow-sm">
                <Box className="h-14 w-14 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center mx-auto mb-3">
                  <Iconify icon="solar:widget-bold" className="w-7 h-7 text-muted-foreground/50" />
                </Box>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.selectManualModelFirst')}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* ── Names (optional) ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:text-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageBuilderSectionNameHeading')}
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
                helperText={t('form.pageBuilderSectionNameOptionalHelper')}
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
                helperText={t('form.pageBuilderSectionNameOptionalHelper')}
                className="transition-all duration-200"
                dir="rtl"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Layout ── */}
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
              {t('form.pageSectionFormPositionLabel')} · {t('form.pageSectionFormOrderLabel')} ·{' '}
              {t('form.pageSectionFormVariantLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
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
          </Box>
        </Box>

        {/* ── Appearance ── */}
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

        {/* ── Conditional visibility (show_when) ── */}
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
