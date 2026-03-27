import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

import {
  useRejectSellerRegistration,
  useApproveSellerRegistration,
  useFetchSellerRegistrationById,
} from '../../hooks/seller-registration';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-foreground">{value || '—'}</span>
    </div>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [commissionRate, setCommissionRate] = useState('');
  const [contractMonths, setContractMonths] = useState('');

  const { data: response, isLoading, error } = useFetchSellerRegistrationById(id || '');
  const approveMutation = useApproveSellerRegistration();
  const rejectMutation = useRejectSellerRegistration();

  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.sellerRegLoadErrorTitle')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/seller-registrations')}>
            {t('form.backToSellerRegistrations')}
          </Button>
        </Box>
      </Box>
    );
  }

  const isPending = item.status === 'pending';

  const sellerRegStatusKey: Record<string, 'form.sellerRegStatusPending' | 'form.sellerRegStatusApproved' | 'form.sellerRegStatusRejected'> = {
    pending: 'form.sellerRegStatusPending',
    approved: 'form.sellerRegStatusApproved',
    rejected: 'form.sellerRegStatusRejected',
  };
  const statusLabelKey = sellerRegStatusKey[item.status];

  const handleApprove = async () => {
    try {
      const payload: Record<string, number> = {};
      if (commissionRate) payload.commission_rate = parseFloat(commissionRate);
      if (contractMonths) payload.contract_duration_months = parseInt(contractMonths, 10);

      await approveMutation.mutateAsync({ id: item.id, payload });
      toast.success(t('form.sellerRegApprovedToast'));
      navigate('/seller-registrations');
    } catch { return; }
  };

  const handleReject = async () => {
    if (!window.confirm(t('form.sellerRegRejectConfirm'))) return;
    try {
      await rejectMutation.mutateAsync(item.id);
      toast.success(t('form.sellerRegRejectedToast'));
      navigate('/seller-registrations');
    } catch { return; }
  };

  return (
    <>
      <title>{t('form.sellerRegDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="min-h-screen bg-background p-6">
        <Box className="mx-auto max-w-3xl">
          {/* Back button */}
          <Button
            variant="text"
            onClick={() => navigate('/seller-registrations')}
            className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToSellerRegistrations')}
          </Button>

          {/* Header card */}
          <Box className="mb-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.store_name}
                  className="h-16 w-16 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Iconify icon="solar:shop-bold" className="text-primary" width={32} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Typography variant="h5" className="font-bold text-foreground">
                    {item.store_name}
                  </Typography>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[item.status] ?? STATUS_COLORS.pending
                    }`}
                  >
                    {statusLabelKey ? t(statusLabelKey) : item.status}
                  </span>
                </div>
                <Typography variant="body2" className="text-muted-foreground mt-1">
                  {item.seller_name} — {item.email}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {t('form.sellerRegRegisteredAt', {
                    date: new Date(item.registered_at).toLocaleString(),
                  })}
                </Typography>
              </div>
            </div>
          </Box>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Details */}
            <Box className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                {t('form.sellerRegRegistrationDetails')}
              </Typography>
              <InfoRow label={t('form.sellerName')} value={item.seller_name} />
              <InfoRow label={t('columns.email')} value={item.email} />
              <InfoRow label={t('form.storeName')} value={item.store_name} />
              <InfoRow label={t('columns.address')} value={item.address} />
              <InfoRow label={t('form.country')} value={item.country} />
              <InfoRow
                label={t('columns.governorate')}
                value={
                  typeof item.governorate === 'object' && item.governorate
                    ? (item.governorate as { name?: string }).name
                    : item.governorate
                }
              />
              <InfoRow
                label={t('columns.city')}
                value={
                  typeof item.city === 'object' && item.city
                    ? (item.city as { name?: string }).name
                    : item.city
                }
              />
            </Box>

            {/* Commercial Register */}
            <Box className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                {t('form.sellerRegCommercialRegister')}
              </Typography>
              <InfoRow
                label={t('form.registerNumber')}
                value={item.commercial_register_number}
              />
              <InfoRow
                label={t('form.registerDate')}
                value={
                  item.commercial_register_date
                    ? new Date(item.commercial_register_date).toLocaleDateString()
                    : null
                }
              />
            </Box>
          </div>

          {/* Approve / Reject section — only for pending */}
          {isPending && (
            <Box className="mt-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                {t('form.sellerRegReviewSection')}
              </Typography>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('form.sellerRegCommissionRateOptional')}
                    <span className="text-muted-foreground font-normal ml-1 text-xs">
                      {t('form.optionalTag')}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder={t('form.sellerRegCommissionPlaceholder')}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('form.sellerRegContractMonthsOptional')}
                    <span className="text-muted-foreground font-normal ml-1 text-xs">
                      {t('form.optionalTag')}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={contractMonths}
                    onChange={(e) => setContractMonths(e.target.value)}
                    placeholder={t('form.sellerRegContractMonthsPlaceholder')}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Iconify icon="solar:check-circle-bold" width={18} className="mr-2" />
                  {approveMutation.isPending ? t('form.sellerRegApproving') : t('form.sellerRegApproveButton')}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <Iconify icon="solar:close-circle-bold" width={18} className="mr-2" />
                  {rejectMutation.isPending ? t('form.sellerRegRejecting') : t('form.sellerRegRejectButton')}
                </Button>
              </div>

              <Typography variant="caption" className="mt-3 block text-muted-foreground">
                {t('form.sellerRegApproveHint', { email: item.email })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
