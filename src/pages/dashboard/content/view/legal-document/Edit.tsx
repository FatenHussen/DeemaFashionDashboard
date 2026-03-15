import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
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

const metadata = { title: `Edit Legal Document | Dashboard - ${CONFIG.appName}` };

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
              Error Loading Document
            </Typography>
          </Box>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load legal document'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/legal-documents')}>
            Back to Legal Documents
          </Button>
        </Box>
      </Box>
    );
  }

  const doc = response.data;

  const onSubmit = async (data: LegalDocumentFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      toast.success('Legal document updated successfully');
      navigate('/legal-documents');
    } catch { return; }
  };

  return (
    <>
      <title>{metadata.title}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/legal-documents')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          Back to Legal Documents
        </Button>

        {/* Document info badge */}
        <Box className="mb-6 flex items-center gap-3">
          <Box className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
          </Box>
          <Box>
            <Typography variant="h5" className="font-bold">
              {doc.title.en || doc.title.ar}
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
          maxWidth="2xl"
          submitLabel={t('form.saveChanges')}
          submittingLabel="Saving..."
        >
          {/* Title */}
          <Box className="col-span-2">
            <Typography variant="subtitle1" className="mb-3 font-semibold">
              Title
            </Typography>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-muted-foreground text-xs">
                  English
                </Typography>
                <RHFTextField name="title.en" placeholder={t('form.legalTitleEn')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-muted-foreground text-xs">
                  Arabic
                </Typography>
                <RHFTextField name="title.ar" placeholder={t('form.legalTitleAr')} fullWidth />
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Box className="col-span-2">
            <Typography variant="subtitle1" className="mb-3 font-semibold">
              Content
            </Typography>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* English content */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-muted-foreground text-xs">
                  English
                </Typography>
                <Controller
                  name="content.en"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <textarea
                        {...field}
                        rows={10}
                        placeholder={t('form.legalContentPlaceholder')}
                        className={`w-full resize-y rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldError ? 'border-destructive' : 'border-input'
                        }`}
                      />
                      {fieldError && (
                        <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                      )}
                    </Box>
                  )}
                />
              </Box>

              {/* Arabic content */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-muted-foreground text-xs">
                  Arabic
                </Typography>
                <Controller
                  name="content.ar"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <textarea
                        {...field}
                        rows={10}
                        dir="rtl"
                        placeholder="أدخل المحتوى بالعربية..."
                        className={`w-full resize-y rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                          fieldError ? 'border-destructive' : 'border-input'
                        }`}
                      />
                      {fieldError && (
                        <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                      )}
                    </Box>
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
