import type { ReactNode } from 'react';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useUpdateComplaint, useFetchComplaintById } from '@/pages/dashboard/complaints/hooks/complaint';
import {
  ComplaintUpdateSchema,
  type ComplaintUpdateFormValues,
} from '@/pages/dashboard/complaints/validation/complaint.validation';
import {
  translateComplaintType,
  translateComplaintStatus,
  translateComplaintOrderStatus,
} from '@/pages/dashboard/complaints/utils/labels';

import i18n from 'src/lib/i18n';
import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

type FieldBoxProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function FieldBox({ label, children, className }: FieldBoxProps) {
  return (
    <Box className={className}>
      <Typography variant="caption" className="mb-1 block text-muted-foreground">
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: complaintResponse, isLoading, error } = useFetchComplaintById(id || '');
  const updateComplaintMutation = useUpdateComplaint();

  const complaint = complaintResponse?.data;

  const methods = useForm<ComplaintUpdateFormValues>({
    resolver: zodResolver(ComplaintUpdateSchema),
    defaultValues: {
      status: 'resolved',
      admin_response: '',
    },
  });

  const { handleSubmit, reset, control } = methods;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'ar' ? 'ar' : undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !complaint) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:danger-bold" className="h-5 w-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.complaintLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="mb-4 text-muted-foreground">
            {error instanceof Error ? error.message : t('form.complaintLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/complaints')}>
            {t('form.backToComplaints')}
          </Button>
        </Box>
      </Box>
    );
  }

  const isNew = complaint.status === 'new';
  const typeLabel = translateComplaintType(complaint.type, t);
  const statusLabel = translateComplaintStatus(complaint.status, t);

  const onSubmit = async (data: ComplaintUpdateFormValues) => {
    try {
      await updateComplaintMutation.mutateAsync({ id: id!, data });
      toast.success(t('form.complaintUpdatedSuccess'));
      reset();
    } catch {
      return;
    }
  };

  const statusVariant =
    complaint.status === 'new'
      ? 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
      : complaint.status === 'resolved'
        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
        : 'border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400';

  const statusStatAccent =
    complaint.status === 'new'
      ? 'from-amber-500/15 to-transparent border-amber-500/20'
      : complaint.status === 'resolved'
        ? 'from-emerald-500/15 to-transparent border-emerald-500/20'
        : 'from-red-500/15 to-transparent border-red-500/20';

  return (
    <>
      <title>{t('form.complaintDetailsDocumentTitle', { id: complaint.id, appName: CONFIG.appName })}</title>
      <Box className="relative w-full min-h-screen overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/25" />
        <Box className="pointer-events-none fixed top-0 right-0 h-[min(60vh,520px)] w-[min(90vw,640px)] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/[0.07] blur-[100px]" />
        <Box className="pointer-events-none fixed bottom-0 left-0 h-[min(50vh,420px)] w-[min(80vw,520px)] translate-y-1/4 -translate-x-1/4 rounded-full bg-violet-500/[0.06] blur-[90px]" />

        <Box className="relative w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Button
            variant="text"
            onClick={() => navigate('/complaints')}
            className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToComplaints')}
          </Button>

          {/* Hero */}
          <Box className="relative mb-8 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-lg shadow-primary/[0.04] ring-1 ring-border/40">
            <Box
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--border) / 0.45) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            <Box className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <Box className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            <Box className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8 lg:p-10">
              <Box className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <Box className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                  <Iconify icon="solar:chat-round-dots-bold" className="text-primary" width={40} height={40} />
                </Box>
                <Box className="min-w-0">
                  <Box className="mb-2 flex flex-wrap items-center gap-2">
                    <Typography variant="h4" className="font-bold tracking-tight text-foreground">
                      {t('form.complaintDetailTitle', { id: complaint.id })}
                    </Typography>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusVariant}`}
                    >
                      {statusLabel}
                    </span>
                  </Box>
                  <Typography variant="body1" className="font-medium text-foreground/90">
                    {t('form.complaintDetailSubtitle', { orderId: complaint.order_id, type: typeLabel })}
                  </Typography>
                  <Typography variant="body2" className="mt-1 truncate text-muted-foreground">
                    {complaint.user?.name} · {complaint.user?.email}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <Box className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Iconify icon="solar:bag-5-bold" width={18} className="text-primary" />
                  <Box>
                    <Typography variant="caption" className="block leading-none text-muted-foreground">
                      {t('columns.orderRef')}
                    </Typography>
                    <Typography variant="body2" className="font-semibold">#{complaint.order_id}</Typography>
                  </Box>
                </Box>
                <Box className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Iconify icon="solar:tag-bold" width={18} className="text-primary" />
                  <Box>
                    <Typography variant="caption" className="block leading-none text-muted-foreground">
                      {t('columns.type')}
                    </Typography>
                    <Typography variant="body2" className="max-w-[200px] truncate font-semibold sm:max-w-[260px]">
                      {typeLabel}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                icon: 'solar:flag-bold',
                label: t('columns.status'),
                value: statusLabel,
                accent: statusStatAccent,
              },
              {
                icon: 'solar:clipboard-list-bold',
                label: t('columns.type'),
                value: typeLabel,
                accent: 'from-violet-500/15 to-transparent border-violet-500/20',
              },
              {
                icon: 'solar:bag-5-bold',
                label: t('columns.orderRef'),
                value: `#${complaint.order_id}`,
                accent: 'from-sky-500/15 to-transparent border-sky-500/20',
              },
              {
                icon: 'solar:calendar-bold',
                label: t('columns.createdAt'),
                value: formatDateTime(complaint.created_at),
                accent: 'from-amber-500/15 to-transparent border-amber-500/20',
              },
              {
                icon: 'solar:user-bold',
                label: t('columns.user'),
                value: complaint.user?.name ?? '—',
                accent: 'from-primary/15 to-transparent border-primary/25',
              },
            ].map((stat) => (
              <Box
                key={stat.label}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${stat.accent} p-4 shadow-sm transition-shadow hover:shadow-md`}
              >
                <Box className="mb-3 flex items-center justify-between gap-2">
                  <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 ring-1 ring-border/50">
                    <Iconify icon={stat.icon} width={20} className="text-foreground/80" />
                  </Box>
                </Box>
                <Typography variant="caption" className="block text-muted-foreground">
                  {stat.label}
                </Typography>
                <Typography variant="subtitle2" className="mt-0.5 font-bold leading-snug tracking-tight break-words">
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box className={`grid gap-6 ${complaint.order ? 'xl:grid-cols-3' : ''}`}>
            {/* Complaint body */}
            <Box className={complaint.order ? 'xl:col-span-2' : ''}>
              <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
                <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                  <Box className="flex items-center gap-2">
                    <Iconify icon="solar:document-text-bold" width={20} className="text-primary" />
                    <Typography variant="h6" className="font-semibold">
                      {t('form.complaintInfoSection')}
                    </Typography>
                  </Box>
                </Box>
                <Box className="p-5">
                  <Box className="grid gap-4 sm:grid-cols-2">
                    <FieldBox label={t('columns.orderRef')}>
                      <Typography variant="body1" className="font-medium">
                        #{complaint.order_id}
                      </Typography>
                    </FieldBox>
                    <FieldBox label={t('columns.type')}>
                      <Typography variant="body1" className="font-medium">
                        {typeLabel}
                      </Typography>
                    </FieldBox>
                    <FieldBox label={t('columns.message')} className="sm:col-span-2">
                      <Box className="rounded-xl border border-border/50 bg-muted/20 p-4">
                        <Typography variant="body1" className="whitespace-pre-wrap font-medium leading-relaxed">
                          {complaint.message || '—'}
                        </Typography>
                      </Box>
                    </FieldBox>
                    <FieldBox label={t('columns.user')}>
                      <Typography variant="body1" className="font-medium">
                        {complaint.user?.name ?? '—'}
                      </Typography>
                      <Typography variant="body2" className="mt-0.5 text-muted-foreground">
                        {complaint.user?.email}
                      </Typography>
                      {complaint.user?.phone && (
                        <Typography variant="body2" className="text-muted-foreground">
                          {complaint.user.phone}
                        </Typography>
                      )}
                    </FieldBox>
                    <FieldBox label={t('columns.createdAt')}>
                      <Typography variant="body1" className="font-medium">
                        {formatDateTime(complaint.created_at)}
                      </Typography>
                    </FieldBox>
                  </Box>
                </Box>

                {complaint.admin_response && (
                  <>
                    <Separator />
                    <Box className="p-5">
                      <Typography variant="subtitle2" className="mb-2 font-semibold">
                        {t('form.complaintAdminResponseTitle')}
                      </Typography>
                      <Box className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                        <Typography variant="body1" className="text-muted-foreground whitespace-pre-wrap">
                          {complaint.admin_response}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {complaint.images && complaint.images.length > 0 && (
                  <>
                    <Separator />
                    <Box className="p-5">
                      <Typography variant="subtitle2" className="mb-3 font-semibold">
                        {t('form.complaintImagesSection')}
                      </Typography>
                      <Box className="flex flex-wrap gap-3">
                        {complaint.images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-xl border border-border/50 ring-1 ring-border/30 transition-shadow hover:shadow-md"
                          >
                            <img
                              src={img}
                              alt={t('form.complaintImageAlt', { index: idx + 1 })}
                              className="h-28 w-28 object-cover"
                            />
                          </a>
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                {isNew && (
                  <>
                    <Separator />
                    <Box className="p-5">
                      <Box className="mb-4 flex items-center gap-2">
                        <Iconify icon="solar:pen-new-square-bold" width={20} className="text-primary" />
                        <Typography variant="h6" className="font-semibold">
                          {t('form.complaintRespondTitle')}
                        </Typography>
                      </Box>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Box>
                          <label className="mb-2 block text-sm font-medium">{t('statusLabel')}</label>
                          <select
                            {...methods.register('status')}
                            className="h-11 w-full max-w-md rounded-2xl border border-input bg-background px-3 text-sm shadow-sm"
                          >
                            <option value="resolved">{t('statusResolved')}</option>
                            <option value="rejected">{t('statusRejected')}</option>
                          </select>
                        </Box>
                        <Box>
                          <label className="mb-2 block text-sm font-medium">
                            {t('form.complaintAdminResponseTitle')}
                          </label>
                          <Controller
                            name="admin_response"
                            control={control}
                            render={({ field, fieldState: { error: fieldError } }) => (
                              <div>
                                <textarea
                                  {...field}
                                  rows={4}
                                  placeholder={t('form.typeResponse')}
                                  className="min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
                                />
                                {fieldError?.message && (
                                  <p className="mt-1 text-xs text-destructive">{fieldError.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </Box>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={updateComplaintMutation.isPending}
                          className="mt-2"
                        >
                          {updateComplaintMutation.isPending ? t('submitting') : t('submitResponse')}
                        </Button>
                      </form>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Order snapshot */}
            {complaint.order && (
              <Box className="xl:col-span-1">
                <Box className="rounded-2xl border border-border/50 bg-card/70 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
                  <Box className="border-b border-border/40 bg-muted/30 px-5 py-4">
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:cart-large-2-bold" width={20} className="text-primary" />
                      <Typography variant="h6" className="font-semibold">
                        {t('form.complaintOrderDetailsSection')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="space-y-3 p-5 text-sm">
                    <Box className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t('columns.status')}</span>
                      <span className="font-medium">
                        {translateComplaintOrderStatus(complaint.order.status, t)}
                      </span>
                    </Box>
                    <Box className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t('columns.total')}</span>
                      <span className="font-medium">{complaint.order.total}</span>
                    </Box>
                    <Box className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t('columns.subtotal')}</span>
                      <span className="font-medium">{complaint.order.subtotal}</span>
                    </Box>
                    <Box className="flex justify-between gap-2 border-t border-border/40 pt-3">
                      <span className="text-muted-foreground">{t('columns.created')}</span>
                      <span className="text-end font-medium">
                        {formatDateTime(complaint.order.created_at)}
                      </span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
