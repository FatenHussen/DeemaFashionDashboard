import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { NOTIFICATION_TYPES } from '@/pages/dashboard/admin-notifications/types/notification.types';
import { useCreateAdminNotification } from '@/pages/dashboard/admin-notifications/hooks/notification';
import {
  NotificationSchema,
  type NotificationFormValues,
} from '@/pages/dashboard/admin-notifications/validation/notification.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Send Notification | Dashboard - ${CONFIG.appName}` };

export default function CreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const createMutation = useCreateAdminNotification();

  const methods = useForm<NotificationFormValues>({
    resolver: zodResolver(NotificationSchema) as any,
    defaultValues: {
      title: '',
      body: '',
      type: 'all',
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Notification sent successfully');
      navigate('/admin-notifications');
    } catch { return; }
  };

  const isSubmitting = createMutation.isPending;
  const mutationError =
    (createMutation.error as any)?.response?.data?.message ||
    (createMutation.error as any)?.message ||
    null;

  return (
    <>
      <title>{metadata.title}</title>

      <Box className="p-6">
        <Button
          variant="text"
          onClick={() => navigate('/admin-notifications')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          Back to Notifications
        </Button>

        <CreateFormLayout
          methods={methods as any}
          onSubmit={handleSubmit(onSubmit as any)}
          onCancel={() => navigate('/admin-notifications')}
          isSubmitting={isSubmitting}
          errorMessage={mutationError}
          title={t('form.sendNotification')}
          description={t('form.sendNotificationDesc')}
          isEditMode={false}
          maxWidth="2xl"
          submitLabel={t('form.sendNotificationSubmit')}
          submittingLabel="Sending..."
        >
          <Box className="col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Title <span className="text-destructive">*</span>
            </Typography>
            <RHFTextField name="title" placeholder={t('form.notificationTitlePlaceholder')} fullWidth />
          </Box>

          <Box className="col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Body <span className="text-destructive">*</span>
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
                    {NOTIFICATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
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
        </CreateFormLayout>
      </Box>
    </>
  );
}
