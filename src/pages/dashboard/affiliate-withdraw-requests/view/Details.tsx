import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  useUpdateAffiliateWithdraw,
  useFetchAffiliateWithdrawById,
} from '@/pages/dashboard/affiliate-withdraw-requests/hooks/affiliate-withdraw';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

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

  const { data: response, isLoading } = useFetchAffiliateWithdrawById(id || '');
  const updateMutation = useUpdateAffiliateWithdraw();

  const item = response?.data;

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!id) return;
    if (status === 'rejected' && !note.trim()) {
      toast.error(t('form.noteRequiredForRejection'));
      return;
    }
    try {
      await updateMutation.mutateAsync({ id, data: { status, note: note || undefined } });
      toast.success(
        status === 'approved' ? t('form.requestApprovedSuccess') : t('form.requestRejectedSuccess')
      );
      navigate('/affiliate-withdraw-requests');
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!item) return (
    <Box className="flex items-center justify-center min-h-[400px]">
      <Typography variant="h6" className="text-destructive">{t('form.requestNotFound')}</Typography>
    </Box>
  );

  return (
    <>
      <title>{t('form.affiliateWithdrawDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="max-w-2xl mx-auto p-6">
        <Button variant="text" onClick={() => navigate('/affiliate-withdraw-requests')} className="mb-4">
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToAffiliateWithdrawRequests')}
        </Button>

        <Typography variant="h5" className="font-bold mb-6">
          {t('form.affiliateWithdrawRequestTitle', { id: item.id })}
        </Typography>

        <Box className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.affiliate')}
              </Typography>
              <Typography variant="body1" className="font-semibold">{item.affiliate?.name}</Typography>
              <Typography variant="body2" className="text-muted-foreground text-sm">{item.affiliate?.email}</Typography>
              <Typography variant="body2" className="text-muted-foreground text-sm">{item.affiliate?.phone}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.total')}
              </Typography>
              <Typography variant="h6" className="font-bold">{item.amount?.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">
                {t('columns.status')}
              </Typography>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                {t(`form.affiliateWithdrawStatus_${item.status}`, { defaultValue: item.status })}
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
                onClick={() => handleUpdateStatus('approved')}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
              >
                <Iconify icon="solar:check-circle-bold" width={16} />
                {t('form.approveRequest')}
              </button>
              <button
                onClick={() => handleUpdateStatus('rejected')}
                disabled={updateMutation.isPending}
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
