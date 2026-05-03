import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { CONTACT_METHOD_TYPES } from '@/pages/dashboard/contact-methods/types/contact-method.types';
import { contactMethodTypeLabel } from '@/pages/dashboard/contact-methods/utils/contact-method-type-label';
import {
  ContactMethodFormSchema,
  type ContactMethodFormValues,
} from '@/pages/dashboard/contact-methods/validation/contact-method.validation';
import {
  useCreateContactMethod,
  useUpdateContactMethod,
  useFetchContactMethodById,
} from '@/pages/dashboard/contact-methods/hooks/contact-method';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const { data: detailsResponse, isLoading } = useFetchContactMethodById(id || '');
  const createMutation = useCreateContactMethod();
  const updateMutation = useUpdateContactMethod();

  const methods = useForm<ContactMethodFormValues>({
    resolver: zodResolver(ContactMethodFormSchema) as any,
    defaultValues: {
      type: 'number',
      value: '',
      icon: undefined,
    },
  });

  const { handleSubmit, reset, control, watch } = methods;
  const iconFile = watch('icon');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      reset({
        type: item.type,
        value: item.value,
        icon: undefined,
      });
      setIconPreview(item.icon || null);
    }
  }, [detailsResponse, isEditMode, reset]);

  useEffect(() => {
    if (iconFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(iconFile);
    }
  }, [iconFile]);

  const onSubmit = async (data: ContactMethodFormValues) => {
    try {
      const payload = {
        type: data.type,
        value: data.value,
        icon: data.icon instanceof File ? data.icon : undefined,
      };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.contactMethodUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.contactMethodCreatedSuccess'));
      }
      navigate('/contact-methods');
    } catch {
      return;
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError =
    createMutation.error?.message || updateMutation.error?.message || null;

  if (isEditMode && isLoading) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.contactMethodEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.contactMethodCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/contact-methods')}
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToContactMethods')}
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/contact-methods')}
          isSubmitting={isSubmitting}
          errorMessage={mutationError}
          title={isEditMode ? t('form.editContactMethod') : t('form.createContactMethod')}
          description={
            isEditMode ? t('form.editContactMethodDesc') : t('form.createContactMethodDesc')
          }
          isEditMode={isEditMode}
          submitLabel={isEditMode ? t('form.updateContactMethodSubmit') : t('form.createContactMethodSubmit')}
          submittingLabel={
            isEditMode ? t('form.savingContactMethodSubmit') : t('form.creatingContactMethodSubmit')
          }
        >
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent px-6 py-4">
              <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Iconify icon="solar:chat-round-dots-bold" className="text-primary" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.contactMethodSectionMain')}
              </Typography>
            </Box>
            <Box className="grid gap-5 p-6 sm:grid-cols-1 md:grid-cols-2">
              <Box className="md:col-span-2">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('columns.type')} <span className="text-destructive">*</span>
                </Typography>
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <select
                        {...field}
                        className={`h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`}
                      >
                        {CONTACT_METHOD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {contactMethodTypeLabel(t, type)}
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
              <Box className="md:col-span-2">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('columns.value')} <span className="text-destructive">*</span>
                </Typography>
                <RHFTextField
                  name="value"
                  placeholder={t('form.contactMethodValuePlaceholder')}
                  fullWidth
                />
              </Box>
              <Box className="md:col-span-2">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.contactMethodIconLabel')}
                </Typography>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <Box>
                      {/*
                        File inputs must stay uncontrolled: never pass `value` from RHF (browser throws InvalidStateError).
                      */}
                      <input
                        key={isEditMode ? `icon-${id}` : 'icon-new'}
                        ref={ref}
                        name={name}
                        onBlur={onBlur}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                        className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file ?? undefined);
                        }}
                      />
                      <Typography variant="caption" className="mt-1 block text-muted-foreground">
                        {t('form.contactMethodIconHint')}
                      </Typography>
                    </Box>
                  )}
                />
                {iconPreview ? (
                  <Box className="mt-3">
                    <img
                      src={iconPreview}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        </CreateFormLayout>
      </Box>
    </>
  );
}
