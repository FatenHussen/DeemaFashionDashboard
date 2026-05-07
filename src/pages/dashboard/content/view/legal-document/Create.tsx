import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import { useCreateLegalDocument } from '@/pages/dashboard/content/hooks/legal-document';
import {
  LegalDocumentCreateSchema,
  type LegalDocumentCreateFormValues,
} from '@/pages/dashboard/content/validation/legal-document.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="mt-1 block text-destructive">
      {message}
    </Typography>
  );
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const createMutation = useCreateLegalDocument();

  const methods = useForm<LegalDocumentCreateFormValues>({
    resolver: zodResolver(LegalDocumentCreateSchema) as any,
    defaultValues: {
      key: '',
      title: { en: '', ar: '' },
      content: { en: '', ar: '' },
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: LegalDocumentCreateFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(t('form.legalDocCreatedSuccess'));
      navigate('/legal-documents');
    } catch {
      return;
    }
  };

  return (
    <>
      <title>{t('form.legalDocumentCreateDocumentTitle', { appName: CONFIG.appName })}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/legal-documents')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToLegalDocuments')}
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/legal-documents')}
          isSubmitting={createMutation.isPending}
          errorMessage={createMutation.error?.message || null}
          title={t('form.createLegalDocument')}
          description={t('form.createLegalDocumentDesc')}
          submitLabel={t('form.createLegalDocumentSubmit')}
          submittingLabel={t('form.creatingLegalDocumentSubmit')}
        >
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:key-bold" className="text-primary" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.key')}
              </Typography>
            </Box>
            <Box className="p-6">
              <RHFTextField name="key" placeholder={t('form.legalDocumentKeyPlaceholder')} fullWidth />
            </Box>
          </Box>

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
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.labelEnglishShort')}
                </Typography>
                <RHFTextField name="title.en" placeholder={t('form.legalTitleEn')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.labelArabicShort')}
                </Typography>
                <RHFTextField name="title.ar" placeholder={t('form.legalTitleAr')} fullWidth />
              </Box>
            </Box>
          </Box>

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
