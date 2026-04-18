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
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.complaintLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
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

  const onSubmit = async (data: ComplaintUpdateFormValues) => {
    try {
      await updateComplaintMutation.mutateAsync({ id: id!, data });
      toast.success(t('form.complaintUpdatedSuccess'));
      reset();
    } catch { return; }
  };

  const statusVariant =
    complaint.status === 'new'
      ? 'bg-amber-500/20 text-amber-600'
      : complaint.status === 'resolved'
        ? 'bg-green-500/20 text-green-600'
        : 'bg-red-500/20 text-red-600';

  return (
    <>
      <title>{t('form.complaintDetailsDocumentTitle', { id: complaint.id, appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative w-full">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/complaints')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('form.backToComplaints')}
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:chat-round-dots-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {t('form.complaintDetailTitle', { id: complaint.id })}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.complaintDetailSubtitle', { orderId: complaint.order_id, type: typeLabel })}
                </Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusVariant}`}
              >
                {translateComplaintStatus(complaint.status, t)}
              </span>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('form.complaintInfoSection')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.orderRef')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    #{complaint.order_id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.type')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {typeLabel}
                  </Typography>
                </Box>
                <Box className="sm:col-span-2">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.message')}
                  </Typography>
                  <Typography variant="body1" className="font-medium mt-1">
                    {complaint.message || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.user')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {complaint.user?.name ?? '-'}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {complaint.user?.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.createdAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formatDateTime(complaint.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {complaint.admin_response && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    {t('form.complaintAdminResponseTitle')}
                  </Typography>
                  <Typography variant="body1" className="text-muted-foreground">
                    {complaint.admin_response}
                  </Typography>
                </Box>
              </>
            )}

            {complaint.images && complaint.images.length > 0 && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    {t('form.complaintImagesSection')}
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {complaint.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img}
                          alt={t('form.complaintImageAlt', { index: idx + 1 })}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </a>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            {complaint.order && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    {t('form.complaintOrderDetailsSection')}
                  </Typography>
                  <Box className="grid gap-2 sm:grid-cols-2 text-sm">
                    <Box>
                      <span className="text-muted-foreground">{t('columns.status')}:</span>{' '}
                      {translateComplaintOrderStatus(complaint.order.status, t)}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">{t('columns.total')}:</span>{' '}
                      {complaint.order.total}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">{t('columns.subtotal')}:</span>{' '}
                      {complaint.order.subtotal}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">{t('columns.created')}:</span>{' '}
                      {formatDateTime(complaint.order.created_at)}
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {isNew && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    {t('form.complaintRespondTitle')}
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Box>
                      <label className="mb-2 block text-sm font-medium">{t('statusLabel')}</label>
                      <select
                        {...methods.register('status')}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
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
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                            />
                            {fieldError?.message && (
                              <p className="mt-1 text-xs text-destructive">
                                {fieldError.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateComplaintMutation.isPending}
                    >
                      {updateComplaintMutation.isPending ? t('submitting') : t('submitResponse')}
                    </Button>
                  </form>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
