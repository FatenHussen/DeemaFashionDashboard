import type { MultiSelectOption } from '@/shared/ui/multi-select';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { mergeClasses } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Iconify } from '@/shared/components/iconify';
import { compressImage } from '@/utils/compress-image';
import { _UserApi } from '@/pages/dashboard/users/api/user.services';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { _DriverApi } from '@/pages/dashboard/driver/api/driver.services';
import { _VendorUserApi } from '@/pages/dashboard/vendor/api/vendor-user.services';
import { useCreateAdminNotification } from '@/pages/dashboard/admin-notifications/hooks/notification';
import {
  NotificationSchema,
  type NotificationFormValues,
} from '@/pages/dashboard/admin-notifications/validation/notification.validation';
import {
  NOTIFICATION_CHANNELS,
  type NotificationType,
  type NotificationChannel,
} from '@/pages/dashboard/admin-notifications/types/notification.types';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  fcm: 'text-orange-600 border-orange-400 bg-orange-50 dark:bg-orange-950/30',
  sms: 'text-blue-600 border-blue-400 bg-blue-50 dark:bg-blue-950/30',
  email: 'text-purple-600 border-purple-400 bg-purple-50 dark:bg-purple-950/30',
};

const AUDIENCE_KEYS: NotificationType[] = ['all', 'user', 'driver', 'vendor'];

const CHIP_RING: Record<string, string> = {
  all: 'ring-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  user: 'ring-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
  driver: 'ring-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
  vendor: 'ring-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
};

const CHIP_IDLE =
  'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/35 hover:bg-primary/[0.06]';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();

  const { data: usersRes } = useQuery({
    queryKey: ['adminNotificationForm', 'user-options'],
    queryFn: () => _UserApi.getListUsers({ page: 1, per_page: 200 }),
    staleTime: 60_000,
  });
  const { data: driversRes } = useQuery({
    queryKey: ['adminNotificationForm', 'driver-options'],
    queryFn: () => _DriverApi.getListDrivers({ page: 1, per_page: 200 }),
    staleTime: 60_000,
  });
  const { data: vendorUsersRes } = useQuery({
    queryKey: ['adminNotificationForm', 'vendor-user-options'],
    queryFn: () => _VendorUserApi.getList({ page: 1, per_page: 200 }),
    staleTime: 60_000,
  });

  const userOptions: MultiSelectOption[] = useMemo(
    () =>
      (usersRes?.data?.items ?? []).map((u) => ({
        value: u.id,
        label: u.name ? `${u.name} (#${u.id})` : `User #${u.id}`,
      })),
    [usersRes]
  );
  const driverOptions: MultiSelectOption[] = useMemo(
    () =>
      (driversRes?.data?.items ?? []).map((d) => ({
        value: d.id,
        label: d.name || d.phone,
      })),
    [driversRes]
  );
  const vendorUserOptions: MultiSelectOption[] = useMemo(
    () =>
      (vendorUsersRes?.data?.items ?? []).map((v) => ({
        value: v.id,
        label: v.name ? `${v.name} (#${v.id})` : `${v.email} (#${v.id})`,
      })),
    [vendorUsersRes]
  );

  const createMutation = useCreateAdminNotification();

  const methods = useForm<NotificationFormValues>({
    resolver: zodResolver(NotificationSchema) as any,
    defaultValues: {
      title: '',
      body: '',
      types: ['all'],
      channels: ['fcm'],
      emoji: '',
      media: null,
      driver_ids: [],
      user_ids: [],
      vendor_ids: [],
    },
  });

  const { handleSubmit, control, watch, setValue } = methods;
  const watchedTypes = watch('types') as NotificationType[] | undefined;

  useEffect(() => {
    if (watchedTypes?.includes('all')) {
      setValue('driver_ids', []);
      setValue('user_ids', []);
      setValue('vendor_ids', []);
    } else {
      if (!watchedTypes?.includes('driver')) setValue('driver_ids', []);
      if (!watchedTypes?.includes('user')) setValue('user_ids', []);
      if (!watchedTypes?.includes('vendor')) setValue('vendor_ids', []);
    }
  }, [watchedTypes, setValue]);

  const audienceLabel = useCallback(
    (key: NotificationType) => {
      if (key === 'all') return t('form.notificationAudienceAll');
      if (key === 'user') return t('form.notificationAudienceUser');
      if (key === 'driver') return t('form.notificationAudienceDriver');
      if (key === 'vendor') return t('form.notificationAudienceVendor');
      return key;
    },
    [t]
  );

  const CHANNEL_LABELS: Record<NotificationChannel, string> = {
    fcm: t('form.notificationChannelFcm'),
    sms: t('form.notificationChannelSms'),
    email: t('form.notificationChannelEmail'),
  };

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

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
      const payload = {
        ...data,
        media:
          data.media instanceof File ? await compressImage(data.media) : data.media,
      };
      await createMutation.mutateAsync(payload);
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

  const isAllAudience = watchedTypes?.includes('all') ?? true;

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
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
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
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.titleLabel')} <span className="text-destructive">*</span>
                </Typography>
                <RHFTextField
                  name="title"
                  placeholder={t('form.notificationTitlePlaceholder')}
                  fullWidth
                />
              </Box>
              <Box>
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
            </Box>
          </Box>

          {/* ── Section: Audiences & Channels ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Iconify
                  icon="solar:users-group-rounded-bold"
                  className="text-violet-500"
                  width={15}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.notificationAudiencesLabel')} & {t('form.notificationChannelsLabel')}
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.notificationAudiencesLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Typography>
                <p className="text-xs text-muted-foreground mb-3">{t('form.notificationAudiencesHint')}</p>
                <Controller
                  name="types"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => {
                    const cur = (field.value ?? ['all']) as NotificationType[];
                    const toggle = (key: NotificationType) => {
                      if (key === 'all') {
                        field.onChange(['all']);
                        return;
                      }
                      const withoutAll = cur.filter((x) => x !== 'all');
                      const has = withoutAll.includes(key);
                      const next = has
                        ? withoutAll.filter((x) => x !== key)
                        : [...withoutAll, key];
                      field.onChange(next.length > 0 ? next : (['all'] as NotificationType[]));
                    };
                    return (
                      <Box>
                        <div className="flex flex-wrap gap-2">
                          {AUDIENCE_KEYS.map((key) => {
                            const isOn =
                              key === 'all'
                                ? cur.includes('all')
                                : cur.includes(key) && !cur.includes('all');
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggle(key)}
                                className={mergeClasses([
                                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                  isOn ? `ring-2 ${CHIP_RING[key] ?? CHIP_RING.all}` : CHIP_IDLE,
                                  isOn ? 'shadow-sm' : '',
                                ])}
                              >
                                {key === 'all' ? (
                                  <Iconify
                                    icon="solar:users-group-rounded-bold"
                                    width={14}
                                    className="opacity-80"
                                  />
                                ) : null}
                                {key === 'user' && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                )}
                                {key === 'driver' && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                )}
                                {key === 'vendor' && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                )}
                                {audienceLabel(key)}
                              </button>
                            );
                          })}
                        </div>
                        {fieldError && <p className="mt-2 text-xs text-destructive">{fieldError.message}</p>}
                      </Box>
                    );
                  }}
                />
              </Box>

              {!isAllAudience ? (
                <Box className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
                  <Typography variant="subtitle2" className="mb-1 font-semibold text-foreground">
                    {t('form.notificationTargetIdsSection')}
                  </Typography>
                  <p className="text-xs text-muted-foreground mb-4">{t('form.notificationTargetIdsHint')}</p>
                  <Box className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {watchedTypes?.includes('driver') ? (
                      <Box>
                        <Typography variant="caption" className="mb-1.5 font-medium text-foreground block">
                          {t('form.notificationDriverIdsLabel')}
                        </Typography>
                        <RHFMultiSelect
                          name="driver_ids"
                          options={driverOptions}
                          placeholder={t('select')}
                          isSearchable
                        />
                      </Box>
                    ) : null}
                    {watchedTypes?.includes('user') ? (
                      <Box>
                        <Typography variant="caption" className="mb-1.5 font-medium text-foreground block">
                          {t('form.notificationUserIdsLabel')}
                        </Typography>
                        <RHFMultiSelect
                          name="user_ids"
                          options={userOptions}
                          placeholder={t('select')}
                          isSearchable
                        />
                      </Box>
                    ) : null}
                    {watchedTypes?.includes('vendor') ? (
                      <Box>
                        <Typography variant="caption" className="mb-1.5 font-medium text-foreground block">
                          {t('form.notificationVendorUserIdsLabel')}
                        </Typography>
                        <RHFMultiSelect
                          name="vendor_ids"
                          options={vendorUserOptions}
                          placeholder={t('select')}
                          isSearchable
                        />
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ) : null}

              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.notificationEmojiLabel')}
                </Typography>
                <RHFTextField
                  name="emoji"
                  placeholder={t('form.notificationEmojiPlaceholder')}
                  fullWidth
                  maxLength={10}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.notificationChannelsLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Typography>
                <Controller
                  name="channels"
                  control={control}
                  render={({ field, fieldState: { error: fieldError } }) => (
                    <Box>
                      <div className="flex flex-wrap gap-3">
                        {NOTIFICATION_CHANNELS.map((ch) => {
                          const isSelected = field.value?.includes(ch);
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => toggleChannel(ch, field.value ?? [])}
                              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                isSelected
                                  ? CHANNEL_COLORS[ch]
                                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted'
                              }`}
                            >
                              {isSelected && (
                                <Iconify icon="solar:check-circle-bold" width={16} className="shrink-0" />
                              )}
                              {CHANNEL_LABELS[ch]}
                            </button>
                          );
                        })}
                      </div>
                      {fieldError && (
                        <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                      )}
                    </Box>
                  )}
                />
              </Box>
            </Box>
          </Box>

          {/* ── Section: Media ── */}
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.notificationMediaLabel')}
              </Typography>
            </Box>
            <Box className="p-6 flex flex-col gap-5">
              <Box>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleMediaChange}
                />
                {mediaPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={mediaPreview}
                      alt={t('form.notificationMediaPreviewAlt')}
                      className="h-32 w-auto rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearMedia}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/80"
                    >
                      <Iconify icon="solar:close-circle-bold" width={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
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
