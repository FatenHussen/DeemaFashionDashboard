import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { CategoryPageBanner } from '@/pages/dashboard/sections/components/category-page-banner';
import {
  isCategoryCmsPage,
  canEditPageMetadata,
} from '@/pages/dashboard/sections/utils/category-page';
import {
  PageSchema,
  type PageFormValues,
} from '@/pages/dashboard/sections/validation/page-builder.validation';
import {
  useCreatePage,
  useUpdatePage,
  useFetchPageBuilderPage,
} from '@/pages/dashboard/sections/hooks/usePageBuilder';

import { CONFIG } from 'src/global-config';
import { Box, Button, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { filterFieldLabel } from '../utils/filter-field-label';

// ----------------------------------------------------------------------

type FiltersMap = Record<string, unknown>;

/**
 * Page variables an admin can switch on without knowing the JSON schema behind
 * them. Each one becomes a "show this section only when …" field on the section
 * form of this page (`show_when`), rendered by `DynamicFilterField`.
 */
const PAGE_VARIABLE_PRESETS: { key: string; icon: string; config: FiltersMap }[] = [
  {
    key: 'category_id',
    icon: 'solar:widget-5-bold',
    config: { type: 'select', url: '/admin/categories' },
  },
  { key: 'brand_id', icon: 'solar:crown-bold', config: { type: 'select', url: '/admin/brands' } },
  { key: 'shop_id', icon: 'solar:shop-bold', config: { type: 'select', url: '/admin/shops' } },
];

const PRESET_KEYS = new Set(PAGE_VARIABLE_PRESETS.map((preset) => preset.key));

function titleToEditableString(title: unknown): string {
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && !Array.isArray(title)) {
    const obj = title as { ar?: string; en?: string };
    return obj.ar || obj.en || '';
  }
  return '';
}

export default function PageCreate() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [filters, setFilters] = useState<FiltersMap>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedJson, setAdvancedJson] = useState('');
  const [advancedDirty, setAdvancedDirty] = useState(false);
  const [filtersJsonError, setFiltersJsonError] = useState<string | null>(null);

  const { data: pageData, isLoading: isLoadingPage } = useFetchPageBuilderPage(id || '');
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();

  const methods = useForm<PageFormValues>({
    resolver: zodResolver(PageSchema),
    defaultValues: { title: '', slug: '' },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && pageData?.data && !isLoadingPage) {
      const page = pageData.data;
      reset({
        title: titleToEditableString(page.title),
        slug: page.slug ?? '',
      });
      if (page.filters && typeof page.filters === 'object' && !Array.isArray(page.filters)) {
        setFilters(page.filters as FiltersMap);
        setAdvancedDirty(false);
      }
    }
  }, [pageData, isEditMode, isLoadingPage, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  /** Auto-generated category page: title/slug follow the category, only sections are editable. */
  const isCategoryPage = isEditMode && isCategoryCmsPage(pageData?.data);
  /** `false` on category pages — the update endpoint rejects them (422). */
  const canEditMetadata = isEditMode ? canEditPageMetadata(pageData?.data) : true;
  /**
   * The update endpoint throws on a category page before it looks at any field, so `filters`
   * is refused just like title/slug. Lock the whole form instead of offering a save that 422s.
   */
  const isPageLocked = isEditMode && !canEditMetadata;

  /** Keys the backend defined that have no switch here — kept as-is on save. */
  const customKeys = useMemo(
    () => Object.keys(filters).filter((key) => !PRESET_KEYS.has(key)),
    [filters]
  );

  const filtersAsJson = useMemo(
    () => (Object.keys(filters).length > 0 ? JSON.stringify(filters, null, 2) : ''),
    [filters]
  );

  const advancedValue = advancedDirty ? advancedJson : filtersAsJson;

  const togglePresetVariable = (key: string, config: FiltersMap) => {
    if (isPageLocked) return;
    setFilters((prev) => {
      const next = { ...prev };
      if (key in next) {
        delete next[key];
      } else {
        next[key] = config;
      }
      return next;
    });
    setAdvancedDirty(false);
    setFiltersJsonError(null);
  };

  /** Parse the advanced editor; `false` means invalid (blocks submit). */
  const parseAdvancedJson = (): FiltersMap | undefined | false => {
    const raw = advancedJson.trim();
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setFiltersJsonError(null);
        return parsed as FiltersMap;
      }
    } catch {
      /* fallthrough to error */
    }
    setFiltersJsonError(t('form.pageBuilderFiltersJsonInvalid'));
    return false;
  };

  const applyAdvancedJson = () => {
    const parsed = parseAdvancedJson();
    if (parsed === false) {
      toast.error(t('form.pageBuilderFiltersJsonInvalid'));
      return;
    }
    setFilters(parsed ?? {});
    setAdvancedDirty(false);
  };

  const onSubmit = async (data: PageFormValues) => {
    // Category pages reject every edit server-side — never fire a request that can only fail.
    if (isPageLocked) return;
    // Unapplied edits in the advanced editor still count — never silently drop them.
    let effectiveFilters: FiltersMap = filters;
    if (advancedDirty) {
      const parsed = parseAdvancedJson();
      if (parsed === false) {
        toast.error(t('form.pageBuilderFiltersJsonInvalid'));
        setAdvancedOpen(true);
        return;
      }
      effectiveFilters = parsed ?? {};
      setFilters(effectiveFilters);
      setAdvancedDirty(false);
    }

    const hasFilters = Object.keys(effectiveFilters).length > 0;
    const payload = {
      title: data.title.trim(),
      ...(data.slug?.trim() ? { slug: data.slug.trim() } : {}),
      // Send `{}` on edit so clearing every variable actually clears it server-side.
      ...(hasFilters || isEditMode ? { filters: effectiveFilters } : {}),
    };

    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.pageBuilderPageUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.pageBuilderPageCreatedSuccess'));
      }
      navigate('/sections/pages');
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections/pages');
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.pageBuilderEditPageDocumentTitle', { appName: CONFIG.appName })
          : t('form.pageBuilderCreatePageDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.pageBuilderEditPage') : t('form.pageBuilderCreatePage')}
        description={
          isEditMode ? t('form.pageBuilderEditPageDesc') : t('form.pageBuilderCreatePageDesc')
        }
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingPage}
        loadingText={t('form.pageBuilderLoadingPage')}
        infoText={
          isEditMode ? t('form.pageSectionFormInfoEdit') : t('form.pageSectionFormInfoCreate')
        }
        submitLabel={
          isEditMode ? t('form.pageBuilderUpdatePageSubmit') : t('form.pageBuilderCreatePageSubmit')
        }
        submittingLabel={isEditMode ? t('form.updatingPageSection') : t('form.creatingPageSection')}
        submitDisabled={isPageLocked}
      >
        {isCategoryPage && (
          <CategoryPageBanner page={pageData?.data} locked={isPageLocked} />
        )}

        {/* ── Basics ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:document-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageBuilderPageBasicsHeading')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:text-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageBuilderPageTitleLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="title"
                placeholder={t('form.pageBuilderPageTitlePlaceholder')}
                helperText={t('form.pageBuilderPageTitleHelper')}
                className="transition-all duration-200"
                disabled={!canEditMetadata}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:link-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.pageBuilderPageSlugLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="slug"
                placeholder={t('form.pageBuilderPageSlugPlaceholder')}
                helperText={t('form.pageBuilderPageSlugHelper')}
                className="transition-all duration-200"
                dir="ltr"
                disabled={!canEditMetadata}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Page variables: switches that unlock per-section visibility conditions ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:filter-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageBuilderPageVariablesHeading')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Box className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 mb-5">
              <Typography variant="body2" className="font-semibold text-foreground">
                {t('form.pageBuilderPageVariablesHelper')}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground block mt-1">
                {t('form.pageBuilderPageVariablesHelperWhen')}
              </Typography>
            </Box>

            <Box className="grid grid-cols-1 gap-3">
              {PAGE_VARIABLE_PRESETS.map(({ key, icon, config }) => {
                const enabled = key in filters;

                return (
                  <Box
                    key={key}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                      enabled
                        ? 'border-violet-500/40 bg-violet-500/[0.04]'
                        : 'border-border/60 bg-background'
                    }`}
                  >
                    <Box className="mt-0.5 shrink-0">
                      <Switch
                        checked={enabled}
                        disabled={isPageLocked}
                        onChange={() => togglePresetVariable(key, config)}
                      />
                    </Box>
                    <Box className="min-w-0">
                      <Box className="flex items-center gap-2">
                        <Iconify
                          icon={icon}
                          width={16}
                          className={enabled ? 'text-violet-500' : 'text-muted-foreground'}
                        />
                        <Typography
                          variant="subtitle2"
                          className="font-semibold text-foreground truncate"
                        >
                          {t(`form.pageBuilderPageVariableLabels.${key}`)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="text-muted-foreground block mt-1">
                        {t(`form.pageBuilderPageVariableExamples.${key}`)}
                      </Typography>
                      {enabled && (
                        <Typography
                          variant="caption"
                          className="text-emerald-600 dark:text-emerald-400 block mt-2 font-medium"
                        >
                          {t('form.pageBuilderPageVariableEnabledNote', {
                            name: filterFieldLabel(t, key),
                          })}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Box className="flex items-start gap-2 mt-4">
              <Iconify
                icon={
                  Object.keys(filters).length === 0
                    ? 'solar:check-circle-bold'
                    : 'solar:eye-bold'
                }
                width={16}
                className="text-muted-foreground shrink-0 mt-0.5"
              />
              <Typography variant="caption" className="text-muted-foreground">
                {Object.keys(filters).length === 0
                  ? t('form.pageBuilderPageVariablesStatusNone')
                  : t('form.pageBuilderPageVariablesStatusSome', {
                      list: Object.keys(filters)
                        .map((key) => filterFieldLabel(t, key))
                        .join('، '),
                    })}
              </Typography>
            </Box>

            {customKeys.length > 0 && (
              <Box className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-4">
                <Typography variant="subtitle2" className="font-semibold text-foreground mb-1">
                  {t('form.pageBuilderPageVariablesCustomTitle')}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground block mb-3">
                  {t('form.pageBuilderPageVariablesCustomNote')}
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {customKeys.map((key) => (
                    <Box
                      key={key}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                    >
                      {filterFieldLabel(t, key)}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box className="mt-5 border-t border-border/40 pt-4">
              <Button
                type="button"
                variant="text"
                color="secondary"
                size="small"
                onClick={() => setAdvancedOpen((open) => !open)}
              >
                <Iconify
                  icon={advancedOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                  width={14}
                  className="me-1.5"
                />
                {t('form.pageBuilderFiltersAdvancedToggle')}
              </Button>

              {advancedOpen && (
                <Box className="mt-3">
                  <Typography variant="caption" className="text-muted-foreground block mb-2">
                    {t('form.pageBuilderFiltersAdvancedHelper')}
                  </Typography>
                  <textarea
                    value={advancedValue}
                    onChange={(e) => {
                      setAdvancedJson(e.target.value);
                      setAdvancedDirty(true);
                      if (filtersJsonError) setFiltersJsonError(null);
                    }}
                    rows={6}
                    dir="ltr"
                    spellCheck={false}
                    disabled={isPageLocked}
                    placeholder='{ "category_id": { "type": "select", "url": "/admin/categories" } }'
                    className={`w-full px-3 py-2 border rounded-md bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${
                      filtersJsonError ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {filtersJsonError && (
                    <Typography variant="caption" className="text-destructive mt-1 block">
                      {filtersJsonError}
                    </Typography>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    className="mt-2"
                    disabled={!advancedDirty || isPageLocked}
                    onClick={applyAdvancedJson}
                  >
                    {t('form.pageBuilderFiltersAdvancedApply')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
