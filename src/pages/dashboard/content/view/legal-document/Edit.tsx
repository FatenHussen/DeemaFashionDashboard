import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import {
  useUpdateLegalDocument,
  useFetchLegalDocumentById,
} from '@/pages/dashboard/content/hooks/legal-document';
import {
  LegalDocumentSchema,
  type LegalDocumentFormValues,
} from '@/pages/dashboard/content/validation/legal-document.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="mt-1 block text-destructive">
      {message}
    </Typography>
  );
}

export default function EditPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useFetchLegalDocumentById(id || '');
  const updateMutation = useUpdateLegalDocument();

  const methods = useForm<LegalDocumentFormValues>({
    resolver: zodResolver(LegalDocumentSchema) as any,
    defaultValues: {
      title: { en: '', ar: '' },
      content: { en: '', ar: '' },
    },
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (response?.data) {
      const doc = response.data;
      reset({
        title: { en: doc.title.en, ar: doc.title.ar },
        content: { en: doc.content.en, ar: doc.content.ar },
      });
    }
  }, [response, reset]);

  if (isLoading) return <LoadingScreen />;

  if (error || !response?.data) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:danger-bold" className="h-5 w-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.legalDocumentLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : t('form.legalDocumentLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/legal-documents')}>
            {t('form.backToLegalDocuments')}
          </Button>
        </Box>
      </Box>
    );
  }

  const doc = response.data;
  const displayTitle = formatTranslated(doc.title, doc.key);

  const onSubmit = async (data: LegalDocumentFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      toast.success(t('form.legalDocUpdatedSuccess'));
      navigate('/legal-documents');
    } catch { return; }
  };

  return (
    <>
      <title>{t('form.legalDocumentEditDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/legal-documents')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToLegalDocuments')}
        </Button>

        {/* Document info badge */}
        <Box className="mb-6 flex items-center gap-3">
          <Box className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
          </Box>
          <Box>
            <Typography variant="h5" className="font-bold">
              {displayTitle}
            </Typography>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {doc.key}
            </span>
          </Box>
        </Box>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/legal-documents')}
          isSubmitting={updateMutation.isPending}
          errorMessage={updateMutation.error?.message || null}
          title={t('form.editLegalDocument')}
          description={t('form.updateTitleContent')}
          isEditMode
          submitLabel={t('form.saveChanges')}
          submittingLabel={t('form.savingLegalDocumentSubmit')}
        >
          {/* ── Section: Title ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:document-text-bold" className="text-primary" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.legalDocumentSectionTitle')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelEnglishShort')}</Typography>
                <RHFTextField name="title.en" placeholder={t('form.legalTitleEn')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelArabicShort')}</Typography>
                <RHFTextField name="title.ar" placeholder={t('form.legalTitleAr')} fullWidth />
              </Box>
            </Box>
          </Box>

          {/* ── Section: Content ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:align-left-bold" className="text-violet-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.legalDocumentSectionContent')}
              </Typography>
            </Box>
            <Box className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 md:gap-6">
              <Box className="group min-w-0">
                <Box className="mb-2 flex items-center gap-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescEn')}
                  </Typography>
                </Box>
                <Controller
                  name="content.en"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescPlaceholder')}
                        dir="ltr"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={fieldError?.message} />
                    </div>
                  )}
                />
              </Box>
              <Box className="group min-w-0">
                <Box className="mb-2 flex items-center gap-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescAr')}
                  </Typography>
                </Box>
                <Controller
                  name="content.ar"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescArPlaceholder')}
                        dir="rtl"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={fieldError?.message} />
                    </div>
                  )}
                />
              </Box>
            </Box>
          </Box>
        </CreateFormLayout>
      </Box>
    </>
  );
}
