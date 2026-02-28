import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
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

const metadata = { title: `Seller Registration Details | Dashboard - ${CONFIG.appName}` };

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
            Error Loading Registration
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/seller-registrations')}>
            Back to Registrations
          </Button>
        </Box>
      </Box>
    );
  }

  const isPending = item.status === 'pending';

  const handleApprove = async () => {
    try {
      const payload: Record<string, number> = {};
      if (commissionRate) payload.commission_rate = parseFloat(commissionRate);
      if (contractMonths) payload.contract_duration_months = parseInt(contractMonths, 10);

      await approveMutation.mutateAsync({ id: item.id, payload });
      toast.success('Registration approved and credentials sent via email');
      navigate('/seller-registrations');
    } catch {}
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this seller registration?')) return;
    try {
      await rejectMutation.mutateAsync(item.id);
      toast.success('Registration rejected');
      navigate('/seller-registrations');
    } catch {}
  };

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="min-h-screen bg-background p-6">
        <Box className="mx-auto max-w-3xl">
          {/* Back button */}
          <Button
            variant="text"
            onClick={() => navigate('/seller-registrations')}
            className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            Back to Registrations
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
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <Typography variant="body2" className="text-muted-foreground mt-1">
                  {item.seller_name} — {item.email}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Registered: {new Date(item.registered_at).toLocaleString()}
                </Typography>
              </div>
            </div>
          </Box>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Details */}
            <Box className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                Registration Details
              </Typography>
              <InfoRow label="Seller Name" value={item.seller_name} />
              <InfoRow label="Email" value={item.email} />
              <InfoRow label="Store Name" value={item.store_name} />
              <InfoRow label="Address" value={item.address} />
              <InfoRow label="Country" value={item.country} />
              <InfoRow label="Governorate" value={item.governorate?.name} />
              <InfoRow label="City" value={item.city?.name} />
            </Box>

            {/* Commercial Register */}
            <Box className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <Typography variant="subtitle1" className="font-semibold mb-4 text-foreground">
                Commercial Register
              </Typography>
              <InfoRow
                label="Register Number"
                value={item.commercial_register_number}
              />
              <InfoRow
                label="Register Date"
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
                Review Registration
              </Typography>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Commission Rate (%)
                    <span className="text-muted-foreground font-normal ml-1 text-xs">optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="e.g. 10.5"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Contract Duration (months)
                    <span className="text-muted-foreground font-normal ml-1 text-xs">optional</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={contractMonths}
                    onChange={(e) => setContractMonths(e.target.value)}
                    placeholder="e.g. 12"
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
                  {approveMutation.isPending ? 'Approving...' : 'Approve Registration'}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <Iconify icon="solar:close-circle-bold" width={18} className="mr-2" />
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Registration'}
                </Button>
              </div>

              <Typography variant="caption" className="mt-3 block text-muted-foreground">
                Approving will create a Vendor account, a Shop, and a VendorUser, then send login
                credentials to <strong>{item.email}</strong> via email.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
