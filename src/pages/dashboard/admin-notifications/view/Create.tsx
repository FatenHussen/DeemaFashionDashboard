import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { notificationTypeLabel } from '@/pages/dashboard/admin-notifications/utils/type-labels';
import { NOTIFICATION_TYPES } from '@/pages/dashboard/admin-notifications/types/notification.types';
import {
  NotificationSchema,
  type NotificationFormValues,
} from '@/pages/dashboard/admin-notifications/validation/notification.validation';
import {
  useCreateAdminNotification,
  useUpdateAdminNotification,
  useFetchAdminNotificationById,
} from '@/pages/dashboard/admin-notifications/hooks/notification';

import { CONFIG } from 'src/global-config';
import { Switch } from 'src/shared/ui/switch';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const createMutation = useCreateAdminNotification();
  const updateMutation = useUpdateAdminNotification();
  const { data: detailsResponse, isLoading: isLoadingDetails, error: detailsError } =
    useFetchAdminNotificationById(id || '');

  const methods = useForm<NotificationFormValues>({
    resolver: zodResolver(NotificationSchema) as any,
    defaultValues: {
      title: '',
      body: '',
      type: 'all',
      is_fixed: false,
    },
  });

  const { handleSubmit, control, reset } = methods;

  useEffect(() => {
    if (!isEditMode || !detailsResponse?.data) return;
    const item = detailsResponse.data;
    reset({
      title: formatTranslated(item.title as Parameters<typeof formatTranslated>[0], ''),
      body: formatTranslated(item.body as Parameters<typeof formatTranslated>[0], ''),
      type: item.type,
      is_fixed: Boolean(item.is_fixed),
    });
  }, [detailsResponse?.data, isEditMode, reset]);

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.notificationUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.notificationSentSuccess'));
      }
      navigate('/admin-notifications');
    } catch {
      return;
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError =
    (isEditMode ? (updateMutation.error as any) : (createMutation.error as any))?.response?.data
      ?.message ||
    (isEditMode ? (updateMutation.error as any) : (createMutation.error as any))?.message ||
    null;

  const docTitle = isEditMode
    ? t('form.adminNotificationEditDocumentTitle', { appName: CONFIG.appName })
    : t('form.adminNotificationCreateDocumentTitle', { appName: CONFIG.appName });

  if (isEditMode && isLoadingDetails) {
    return <LoadingScreen />;
  }

  if (isEditMode && (detailsError || !detailsResponse?.data)) {
    return (
      <Box className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <Typography variant="h6" className="text-destructive">
          {t('form.notificationLoadErrorTitle')}
        </Typography>
        <Typography variant="body2" className="text-muted-foreground text-center max-w-md">
          {detailsError instanceof Error ? detailsError.message : t('form.notificationLoadErrorFallback')}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/admin-notifications')}>
          {t('form.backToNotifications')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <title>{docTitle}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/admin-notifications')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToNotifications')}
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/admin-notifications')}
          isSubmitting={isSubmitting}
          errorMessage={mutationError}
          title={isEditMode ? t('form.editNotification') : t('form.sendNotification')}
          description={isEditMode ? t('form.editNotificationDesc') : t('form.sendNotificationDesc')}
          isEditMode={isEditMode}
          isLoading={false}
          maxWidth="2xl"
          submitLabel={
            isEditMode ? t('form.updateNotificationSubmit') : t('form.sendNotificationSubmit')
          }
          submittingLabel={isEditMode ? t('updating') : t('form.sending')}
        >
          <Box className="col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.titleLabel')} <span className="text-destructive">*</span>
            </Typography>
            <RHFTextField name="title" placeholder={t('form.notificationTitlePlaceholder')} fullWidth />
          </Box>

          <Box className="col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.bodyLabel')} <span className="text-destructive">*</span>
            </Typography>
            <Controller
              name="body"
              control={control}
              render={({ field, fieldState: { error: fieldError } }) => (
                <Box>
                  <textarea
                    {...field}
                    rows={4}
                    placeholder={t('form.enterNotificationMessage')}
                    className={`w-full rounded-md border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary ${
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

          <Box className="col-span-2">
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
                    className={`h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldError ? 'border-destructive' : 'border-input'
                    }`}
                  >
                    {NOTIFICATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {notificationTypeLabel(type, t)}
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

          <Box className="col-span-2">
            <Controller
              name="is_fixed"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  label={t('form.notificationIsFixedLabel')}
                  helperText={t('form.notificationIsFixedHelper')}
                />
              )}
            />
          </Box>
        </CreateFormLayout>
      </Box>
    </>
  );
}
