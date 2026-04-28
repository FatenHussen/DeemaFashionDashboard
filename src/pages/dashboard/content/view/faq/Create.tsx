import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { FAQ_TYPES } from '@/pages/dashboard/content/types/faq.types';
import { faqTypeLabel } from '@/pages/dashboard/content/utils/faq-type-label';
import { FaqSchema, type FaqFormValues } from '@/pages/dashboard/content/validation/faq.validation';
import {
  useCreateFaq,
  useUpdateFaq,
  useFetchFaqById,
} from '@/pages/dashboard/content/hooks/faq';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: faqResponse, isLoading } = useFetchFaqById(id || '');
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();

  const methods = useForm<FaqFormValues>({
    resolver: zodResolver(FaqSchema) as any,
    defaultValues: {
      question: { en: '', ar: '' },
      answer: { en: '', ar: '' },
      type: 'other',
    },
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && faqResponse?.data) {
      const faq = faqResponse.data;
      reset({
        question: { en: faq.question.en, ar: faq.question.ar },
        answer: { en: faq.answer.en, ar: faq.answer.ar },
        type: faq.type,
      });
    }
  }, [faqResponse, isEditMode, reset]);

  if (isEditMode && isLoading) return <LoadingScreen />;

  const onSubmit = async (data: FaqFormValues) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, data });
        toast.success(t('form.faqUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.faqCreatedSuccess'));
      }
      navigate('/faqs');
    } catch { return; }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error?.message || updateMutation.error?.message || null;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.faqEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.faqCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/faqs')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToFaqs')}
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/faqs')}
          isSubmitting={isSubmitting}
          errorMessage={mutationError}
          title={isEditMode ? t('form.editFaq') : t('form.createFaq')}
          description={isEditMode ? t('form.editFaqDesc') : t('form.createFaqDesc')}
          isEditMode={isEditMode}
          submitLabel={isEditMode ? t('form.updateFaqSubmit') : t('form.createFaqSubmit')}
          submittingLabel={isEditMode ? t('form.savingFaqSubmit') : t('form.creatingFaqSubmit')}
        >
          {/* ── Section: Type ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:tag-bold" className="text-primary" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.faqTypeLabel')}
              </Typography>
            </Box>
            <Box className="p-6">
              <Controller
                name="type"
                control={control}
                render={({ field, fieldState: { error: fieldError } }) => (
                  <Box>
                    <select {...field} className={`h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`}>
                      {FAQ_TYPES.map((type) => (<option key={type} value={type}>{faqTypeLabel(t, type)}</option>))}
                    </select>
                    {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                  </Box>
                )}
              />
            </Box>
          </Box>

          {/* ── Section: Question ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:question-circle-bold" className="text-violet-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.question')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelEnglishShort')} <span className="text-destructive">*</span></Typography>
                <RHFTextField name="question.en" placeholder={t('form.faqQuestionPlaceholder')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelArabicShort')} <span className="text-destructive">*</span></Typography>
                <RHFTextField name="question.ar" placeholder={t('form.faqQuestionArExample')} fullWidth />
              </Box>
            </Box>
          </Box>

          {/* ── Section: Answer ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:chat-round-dots-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.answer')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelEnglishShort')} <span className="text-destructive">*</span></Typography>
                <Controller name="answer.en" control={control} render={({ field, fieldState: { error: fieldError } }) => (
                  <Box>
                    <textarea {...field} rows={5} placeholder={t('form.enterAnswerEn')} className={`w-full resize-y rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`} />
                    {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                  </Box>
                )} />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.labelArabicShort')} <span className="text-destructive">*</span></Typography>
                <Controller name="answer.ar" control={control} render={({ field, fieldState: { error: fieldError } }) => (
                  <Box>
                    <textarea {...field} rows={5} dir="rtl" placeholder={t('form.faqAnswerArPlaceholder')} className={`w-full resize-y rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`} />
                    {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                  </Box>
                )} />
              </Box>
            </Box>
          </Box>
        </CreateFormLayout>
      </Box>
    </>
  );
}
