import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
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
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

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
  const [filtersJson, setFiltersJson] = useState('');
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
        setFiltersJson(
          Object.keys(page.filters).length > 0 ? JSON.stringify(page.filters, null, 2) : ''
        );
      }
    }
  }, [pageData, isEditMode, isLoadingPage, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const parseFiltersJson = (): Record<string, unknown> | undefined | false => {
    const raw = filtersJson.trim();
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setFiltersJsonError(null);
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* fallthrough to error */
    }
    setFiltersJsonError(t('form.pageBuilderFiltersJsonInvalid'));
    return false;
  };

  const onSubmit = async (data: PageFormValues) => {
    const filters = parseFiltersJson();
    if (filters === false) {
      toast.error(t('form.pageBuilderFiltersJsonInvalid'));
      return;
    }

    const payload = {
      title: data.title.trim(),
      ...(data.slug?.trim() ? { slug: data.slug.trim() } : {}),
      ...(filters ? { filters } : {}),
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
      >
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
              />
            </Box>
          </Box>
        </Box>

        {/* ── Advanced: filters schema (optional JSON) ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:filter-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pageBuilderFiltersJsonLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Typography variant="body2" className="text-muted-foreground mb-3">
              {t('form.pageBuilderFiltersJsonHelper')}
            </Typography>
            <textarea
              value={filtersJson}
              onChange={(e) => {
                setFiltersJson(e.target.value);
                if (filtersJsonError) setFiltersJsonError(null);
              }}
              rows={5}
              dir="ltr"
              spellCheck={false}
              placeholder='{ "category_id": 5 }'
              className={`w-full px-3 py-2 border rounded-md bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                filtersJsonError ? 'border-destructive' : 'border-border'
              }`}
            />
            {filtersJsonError && (
              <Typography variant="caption" className="text-destructive mt-1 block">
                {filtersJsonError}
              </Typography>
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
