import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  useRejectPromotionRequest,
  useApprovePromotionRequest,
  useFetchPromotionRequestById,
} from '@/pages/dashboard/promotion-requests/hooks/promotion-request';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Promotion Request | ${CONFIG.appName}` };

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState('');

  const { data: response, isLoading } = useFetchPromotionRequestById(id || '');
  const approveMutation = useApprovePromotionRequest();
  const rejectMutation = useRejectPromotionRequest();

  const item = response?.data;

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync({ id, note: note || undefined });
      toast.success(t('form.promotionRequestApprovedSuccess'));
      navigate('/promotion-requests');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!note.trim()) {
      toast.error(t('form.noteRequiredForRejection'));
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, note });
      toast.success(t('form.promotionRequestRejectedSuccess'));
      navigate('/promotion-requests');
    } catch (err: any) {
      console.error(err);
    }
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) return <LoadingScreen />;
  if (!item) return (
    <Box className="flex items-center justify-center min-h-[400px]">
      <Typography variant="h6" className="text-destructive">{t('form.requestNotFound')}</Typography>
    </Box>
  );

  const promotionName = typeof item.promotion?.name === 'string'
    ? item.promotion.name
    : item.promotion?.name?.en || item.promotion?.name?.ar || '—';

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="max-w-2xl mx-auto p-6">
        <Button variant="text" onClick={() => navigate('/promotion-requests')} className="mb-4">
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backLabel')}
        </Button>

        <Typography variant="h5" className="font-bold mb-6">
          {t('form.promotionRequestTitle', { id: item.id })}
        </Typography>

        <Box className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.user')}
              </Typography>
              <Typography variant="body1" className="font-semibold">{item.user?.name}</Typography>
              <Typography variant="body2" className="text-muted-foreground text-sm">{item.user?.email}</Typography>
              {item.user?.phone && (
                <Typography variant="body2" className="text-muted-foreground text-sm">{item.user.phone}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('form.promotionLabel')}
              </Typography>
              <Typography variant="body1" className="font-semibold">{promotionName}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.status')}
              </Typography>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                {item.status}
              </span>
            </Box>
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.createdAt')}
              </Typography>
              <Typography variant="body2">{item.created_at}</Typography>
            </Box>
            {item.note && (
              <Box className="col-span-2">
                <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                  {t('columns.message')}
                </Typography>
                <Typography variant="body2">{item.note}</Typography>
              </Box>
            )}
          </div>
        </Box>

        {item.status === 'pending' && (
          <Box className="mt-6 rounded-xl border border-border bg-card p-6">
            <Typography variant="subtitle2" className="font-semibold mb-4">{t('form.updateStatus')}</Typography>
            <Box className="mb-4">
              <Typography variant="body2" className="text-muted-foreground text-sm mb-1">
                {t('form.noteLabel')}
              </Typography>
              <textarea
                className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                rows={3}
                placeholder={t('form.notePlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Box>
            <Box className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
              >
                <Iconify icon="solar:check-circle-bold" width={16} />
                {t('form.approveRequest')}
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
              >
                <Iconify icon="solar:close-circle-bold" width={16} />
                {t('form.rejectRequest')}
              </button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
