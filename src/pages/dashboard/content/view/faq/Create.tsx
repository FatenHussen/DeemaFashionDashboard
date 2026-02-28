import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { FAQ_TYPES } from '@/pages/dashboard/content/types/faq.types';
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

const metadata = (isEdit: boolean) => ({
  title: `${isEdit ? 'Edit' : 'Create'} FAQ | Dashboard - ${CONFIG.appName}`,
});

export default function CreatePage() {
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
        toast.success('FAQ updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('FAQ created successfully');
      }
      navigate('/faqs');
    } catch {}
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error?.message || updateMutation.error?.message || null;

  return (
    <>
      <title>{metadata(isEditMode).title}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/faqs')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          Back to FAQs
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/faqs')}
          isSubmitting={isSubmitting}
          errorMessage={mutationError}
          title={isEditMode ? 'Edit FAQ' : 'Create FAQ'}
          description={
            isEditMode
              ? 'Update the question and answer in both languages'
              : 'Add a new FAQ with question and answer in both languages'
          }
          isEditMode={isEditMode}
          maxWidth="2xl"
          submitLabel={isEditMode ? 'Save Changes' : 'Create FAQ'}
          submittingLabel={isEditMode ? 'Saving...' : 'Creating...'}
        >
          {/* Type */}
          <Box className="col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Type <span className="text-destructive">*</span>
            </Typography>
            <Controller
              name="type"
              control={control}
              render={({ field, fieldState: { error: fieldError } }) => (
                <Box>
                  <select
                    {...field}
                    className={`h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldError ? 'border-destructive' : 'border-input'
                    }`}
                  >
                    {FAQ_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === 'stores&drivers' ? 'Stores & Drivers' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {fieldError && (
                    <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                  )}
                </Box>
              )}
            />
          </Box>

          {/* Question */}
          <Box className="col-span-2">
            <Typography variant="subtitle1" className="mb-3 font-semibold">
              Question
            </Typography>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                  English <span className="text-destructive">*</span>
                </Typography>
                <RHFTextField name="question.en" placeholder="e.g. How can I place an order?" fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                  Arabic <span className="text-destructive">*</span>
                </Typography>
                <RHFTextField name="question.ar" placeholder="مثال: كيف يمكنني تقديم طلب؟" fullWidth />
              </Box>
            </Box>
          </Box>

          {/* Answer */}
          <Box className="col-span-2">
            <Typography variant="subtitle1" className="mb-3 font-semibold">
              Answer
            </Typography>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* English */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                  English <span className="text-destructive">*</span>
                </Typography>
                <Controller
                  name="answer.en"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <textarea
                        {...field}
                        rows={5}
                        placeholder="Enter answer in English..."
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

              {/* Arabic */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                  Arabic <span className="text-destructive">*</span>
                </Typography>
                <Controller
                  name="answer.ar"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <textarea
                        {...field}
                        rows={5}
                        dir="rtl"
                        placeholder="أدخل الإجابة بالعربية..."
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
