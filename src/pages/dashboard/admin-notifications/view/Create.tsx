import { toast } from 'react-toastify';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { notificationTypeLabel } from '@/pages/dashboard/admin-notifications/utils/type-labels';
import { useCreateAdminNotification } from '@/pages/dashboard/admin-notifications/hooks/notification';
import {
  NotificationSchema,
  type NotificationFormValues,
} from '@/pages/dashboard/admin-notifications/validation/notification.validation';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
} from '@/pages/dashboard/admin-notifications/types/notification.types';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  fcm: 'Push (FCM)',
  sms: 'SMS',
  email: 'Email',
};

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  fcm: 'text-orange-600 border-orange-400 bg-orange-50 dark:bg-orange-950/30',
  sms: 'text-blue-600 border-blue-400 bg-blue-50 dark:bg-blue-950/30',
  email: 'text-purple-600 border-purple-400 bg-purple-50 dark:bg-purple-950/30',
};

// ----------------------------------------------------------------------

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
      channels: ['fcm'],
      target_page: '',
      emoji: '',
      media: null,
    },
  });

  const { handleSubmit, control, watch, setValue } = methods;

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const watchedChannels = watch('channels');

  const toggleChannel = (ch: NotificationChannel, currentChannels: NotificationChannel[]) => {
    if (currentChannels.includes(ch)) {
      setValue('channels', currentChannels.filter((c) => c !== ch), { shouldValidate: true });
    } else {
      setValue('channels', [...currentChannels, ch], { shouldValidate: true });
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue('media', file, { shouldValidate: true });
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    setValue('media', null, { shouldValidate: true });
    setMediaPreview(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      await createMutation.mutateAsync(data as any);
      toast.success(t('form.notificationSentSuccess'));
      navigate('/admin-notifications');
    } catch {
      return;
    }
  };

  const isSubmitting = createMutation.isPending;
  const mutationError =
    (createMutation.error as any)?.response?.data?.message ||
    (createMutation.error as any)?.message ||
    null;

  return (
    <>
      <title>{t('form.adminNotificationCreateDocumentTitle', { appName: CONFIG.appName })}</title>

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
          title={t('form.sendNotification')}
          description={t('form.sendNotificationDesc')}
          isEditMode={false}
          isLoading={false}
          submitLabel={t('form.sendNotificationSubmit')}
          submittingLabel={t('form.sending')}
        >
          {/* ── Section: Content ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:bell-bold" className="text-primary" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.titleLabel')} & {t('form.bodyLabel')}
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.titleLabel')} <span className="text-destructive">*</span></Typography>
                <RHFTextField name="title" placeholder={t('form.notificationTitlePlaceholder')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.bodyLabel')} <span className="text-destructive">*</span></Typography>
                <Controller name="body" control={control} render={({ field, fieldState: { error: fieldError } }) => (
                  <Box>
                    <textarea {...field} rows={4} placeholder={t('form.enterNotificationMessage')} className={`w-full rounded-md border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`} />
                    {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                  </Box>
                )} />
              </Box>
            </Box>
          </Box>

          {/* ── Section: Audience & Channels ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:users-group-rounded-bold" className="text-violet-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.type')} & {t('form.notificationChannelsLabel')}
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-5">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.type')} <span className="text-destructive">*</span></Typography>
                  <Controller name="type" control={control} render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <select {...field} className={`h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldError ? 'border-destructive' : 'border-input'}`}>
                        {NOTIFICATION_TYPES.map((type) => (<option key={type} value={type}>{notificationTypeLabel(type, t)}</option>))}
                      </select>
                      {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                    </Box>
                  )} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.notificationEmojiLabel')}</Typography>
                  <RHFTextField name="emoji" placeholder={t('form.notificationEmojiPlaceholder')} fullWidth maxLength={10} />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.notificationChannelsLabel')} <span className="text-destructive">*</span></Typography>
                <Controller name="channels" control={control} render={({ field, fieldState: { error: fieldError } }) => (
                  <Box>
                    <div className="flex flex-wrap gap-3">
                      {NOTIFICATION_CHANNELS.map((ch) => {
                        const isSelected = field.value?.includes(ch);
                        return (
                          <button key={ch} type="button" onClick={() => toggleChannel(ch, field.value ?? [])} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${isSelected ? CHANNEL_COLORS[ch] : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted'}`}>
                            {isSelected && <Iconify icon="solar:check-circle-bold" width={16} className="shrink-0" />}
                            {CHANNEL_LABELS[ch]}
                          </button>
                        );
                      })}
                    </div>
                    {fieldError && <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>}
                  </Box>
                )} />
              </Box>
            </Box>
          </Box>

          {/* ── Section: Target Page & Media ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.notificationTargetPageLabel')} & {t('form.notificationMediaLabel')}
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.notificationTargetPageLabel')}</Typography>
                <RHFTextField name="target_page" placeholder={t('form.notificationTargetPagePlaceholder')} fullWidth />
                <p className="mt-1 text-xs text-muted-foreground">{t('form.notificationTargetPageHint')}</p>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.notificationMediaLabel')}</Typography>
                <input ref={mediaInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleMediaChange} />
                {mediaPreview ? (
                  <div className="relative inline-block">
                    <img src={mediaPreview} alt="media preview" className="h-32 w-auto rounded-lg border border-border object-cover" />
                    <button type="button" onClick={clearMedia} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/80">
                      <Iconify icon="solar:close-circle-bold" width={16} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => mediaInputRef.current?.click()} className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40">
                    <Iconify icon="solar:gallery-add-bold" width={28} />
                    <span className="text-sm">{t('form.notificationMediaUploadHint')}</span>
                  </button>
                )}
              </Box>
            </Box>
          </Box>
        </CreateFormLayout>
      </Box>
    </>
  );
}
