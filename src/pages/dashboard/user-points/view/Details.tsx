import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  UserPointsAddDeductSchema,
  type UserPointsAddDeductFormValues,
} from '@/pages/dashboard/user-points/validation/user-points.validation';
import {
  useAddPoints,
  useDeductPoints,
  useFetchUserPointsById,
  useFetchUserPointsTransactions,
} from '@/pages/dashboard/user-points/hooks/user-points';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `User Points Details | Dashboard - ${CONFIG.appName}` };

const TX_STATUSES = ['', 'earned', 'redeemed'] as const;
const TX_SOURCES = ['', 'order_completion', 'first_order', 'product_review', 'user_registration', 'admin_adjustment'] as const;

export default function DetailsPage() {
  const { t } = useTranslation('table');
  // Route is: details/:id  →  read "id" not "userId"
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Transaction filters state
  const [txPage, setTxPage] = useState(1);
  const [txStatus, setTxStatus] = useState('');
  const [txSource, setTxSource] = useState('');
  const [txFromDate, setTxFromDate] = useState('');
  const [txToDate, setTxToDate] = useState('');

  const { data: detailsResponse, isLoading, error } = useFetchUserPointsById(id || '');
  const { data: transactionsResponse, isLoading: isTxLoading } = useFetchUserPointsTransactions(
    id || '',
    txPage,
    20,
    {
      status: txStatus || undefined,
      source: txSource || undefined,
      from_date: txFromDate || undefined,
      to_date: txToDate || undefined,
    }
  );

  const addPointsMutation = useAddPoints();
  const deductPointsMutation = useDeductPoints();
  const [activeForm, setActiveForm] = useState<'add' | 'deduct' | null>(null);

  const details = detailsResponse?.data;
  const transactions = transactionsResponse?.data?.items ?? details?.recent_transactions ?? [];
  const txPagination = transactionsResponse?.data?.pagination;

  const addMethods = useForm<UserPointsAddDeductFormValues>({
    resolver: zodResolver(UserPointsAddDeductSchema) as any,
    defaultValues: { points: 0, reason: '' },
  });

  const deductMethods = useForm<UserPointsAddDeductFormValues>({
    resolver: zodResolver(UserPointsAddDeductSchema) as any,
    defaultValues: { points: 0, reason: '' },
  });

  if (isLoading) return <LoadingScreen />;

  if (error || !details) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">Error Loading User Points</Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load user points information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/user-points')}>Back to User Points</Button>
        </Box>
      </Box>
    );
  }

  const handleAddPoints = async (data: UserPointsAddDeductFormValues) => {
    try {
      await addPointsMutation.mutateAsync({ userId: id!, data: { points: data.points, reason: data.reason } });
      toast.success('Points added successfully');
      addMethods.reset();
      setActiveForm(null);
    } catch { return; }
  };

  const handleDeductPoints = async (data: UserPointsAddDeductFormValues) => {
    try {
      await deductPointsMutation.mutateAsync({ userId: id!, data: { points: data.points, reason: data.reason } });
      toast.success('Points deducted successfully');
      deductMethods.reset();
      setActiveForm(null);
    } catch { return; }
  };

  const resetTxFilters = () => {
    setTxStatus('');
    setTxSource('');
    setTxFromDate('');
    setTxToDate('');
    setTxPage(1);
  };

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">

          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/user-points')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to User Points
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:wallet-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {details.user?.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {details.user?.email}
                  {details.user?.phone && ` · ${details.user.phone}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[
              { label: 'Balance', value: details.wallet?.balance ?? 0, color: 'text-primary', sub: details.wallet?.expire_at ? `Exp: ${new Date(details.wallet.expire_at).toLocaleDateString()}` : undefined },
              { label: 'Total Earned', value: details.statistics?.total_earned ?? 0, color: 'text-green-600' },
              { label: 'Total Redeemed', value: details.statistics?.total_redeemed ?? 0, color: 'text-orange-600' },
              { label: 'Transactions', value: details.statistics?.total_transactions ?? 0, color: 'text-foreground', sub: details.statistics?.pending_transactions ? `${details.statistics.pending_transactions} pending` : undefined },
            ].map(({ label, value, color, sub }) => (
              <Box key={label} className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm p-4">
                <Typography variant="caption" className="text-muted-foreground">{label}</Typography>
                <Typography variant="h4" className={`font-bold ${color}`}>{value}</Typography>
                {sub && <Typography variant="caption" className="text-muted-foreground/70 text-xs mt-1 block">{sub}</Typography>}
              </Box>
            ))}
          </Box>

          {/* Manage Points */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-6">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">Manage Points</Typography>
              <Box className="flex gap-3 mb-4">
                <Button
                  variant={activeForm === 'add' ? 'contained' : 'outlined'}
                  onClick={() => setActiveForm(activeForm === 'add' ? null : 'add')}
                  className="gap-2"
                >
                  <Iconify icon="solar:add-circle-bold" width={18} />
                  Add Points
                </Button>
                <Button
                  variant={activeForm === 'deduct' ? 'contained' : 'outlined'}
                  onClick={() => setActiveForm(activeForm === 'deduct' ? null : 'deduct')}
                  className="gap-2"
                >
                  <Iconify icon="solar:minus-circle-bold" width={18} />
                  Deduct Points
                </Button>
              </Box>

              {activeForm === 'add' && (
                <CreateFormLayout
                  methods={addMethods as any}
                  onSubmit={addMethods.handleSubmit(handleAddPoints as any)}
                  onCancel={() => { setActiveForm(null); addMethods.reset(); }}
                  isSubmitting={addPointsMutation.isPending}
                  errorMessage={addPointsMutation.error?.message || null}
                  title={t('form.addPoints')} description={t('form.addPointsDesc')}
                  isEditMode={false} maxWidth="xl" submitLabel={t('form.addPointsSubmit')} submittingLabel={t('form.addingPoints')}
                >
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Points</Typography>
                    <RHFTextField name="points" type="number" placeholder="100" fullWidth />
                  </Box>
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                      Reason <span className="text-destructive">*</span>
                    </Typography>
                    <RHFTextField name="reason" placeholder={t('form.reasonBonusPlaceholder')} fullWidth />
                  </Box>
                </CreateFormLayout>
              )}

              {activeForm === 'deduct' && (
                <CreateFormLayout
                  methods={deductMethods as any}
                  onSubmit={deductMethods.handleSubmit(handleDeductPoints as any)}
                  onCancel={() => { setActiveForm(null); deductMethods.reset(); }}
                  isSubmitting={deductPointsMutation.isPending}
                  errorMessage={deductPointsMutation.error?.message || null}
                  title={t('form.deductPoints')} description={t('form.deductPointsDesc')}
                  isEditMode={false} maxWidth="xl" submitLabel={t('form.deductPointsSubmit')} submittingLabel={t('form.deducting')}
                >
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Points</Typography>
                    <RHFTextField name="points" type="number" placeholder="50" fullWidth />
                  </Box>
                  <Box className="group">
                    <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                      Reason <span className="text-destructive">*</span>
                    </Typography>
                    <RHFTextField name="reason" placeholder={t('form.reasonCorrectionPlaceholder')} fullWidth />
                  </Box>
                </CreateFormLayout>
              )}
            </Box>
          </Box>

          {/* Transactions */}
          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">Transactions</Typography>
                {(txStatus || txSource || txFromDate || txToDate) && (
                  <Button variant="text" onClick={resetTxFilters} className="text-xs text-muted-foreground gap-1">
                    <Iconify icon="solar:close-circle-bold" width={14} />
                    Clear filters
                  </Button>
                )}
              </Box>

              {/* Transaction Filters */}
              <Box className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-muted/20 rounded-lg border border-border/30">
                {/* Status filter */}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block">Status</Typography>
                  <select
                    value={txStatus}
                    onChange={(e) => { setTxStatus(e.target.value); setTxPage(1); }}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="">All statuses</option>
                    <option value="earned">Earned</option>
                    <option value="redeemed">Redeemed</option>
                  </select>
                </Box>

                {/* Source filter */}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block">Source</Typography>
                  <select
                    value={txSource}
                    onChange={(e) => { setTxSource(e.target.value); setTxPage(1); }}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="">All sources</option>
                    {TX_SOURCES.filter(Boolean).map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </Box>

                {/* From date */}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block">From date</Typography>
                  <input
                    type="date"
                    value={txFromDate}
                    onChange={(e) => { setTxFromDate(e.target.value); setTxPage(1); }}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  />
                </Box>

                {/* To date */}
                <Box>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block">To date</Typography>
                  <input
                    type="date"
                    value={txToDate}
                    onChange={(e) => { setTxToDate(e.target.value); setTxPage(1); }}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  />
                </Box>
              </Box>

              {/* Transactions list */}
              {isTxLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Iconify icon="svg-spinners:ring-resize" width={20} />
                  <span className="text-sm">Loading transactions...</span>
                </div>
              ) : transactions.length === 0 ? (
                <Typography variant="body2" className="text-muted-foreground text-center py-6">
                  No transactions found.
                </Typography>
              ) : (
                <Box className="space-y-3">
                  {transactions.map((tx) => {
                    const isEarned = tx.status === 'earned';
                    return (
                      <Box
                        key={tx.id}
                        className="flex items-start justify-between p-3 rounded-lg border border-border/30 bg-background/50 gap-3"
                      >
                        <Box className="flex items-start gap-3">
                          <Box className={`mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isEarned ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <Iconify
                              icon={isEarned ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
                              width={16}
                              className={isEarned ? 'text-green-600' : 'text-red-600'}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" className="font-medium">
                              {tx.rule?.title ?? tx.source}
                            </Typography>
                            {tx.reason && (
                              <Typography variant="caption" className="text-muted-foreground block">{tx.reason}</Typography>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                {tx.source.replace(/_/g, ' ')}
                              </span>
                              {tx.reference_type && (
                                <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                  {tx.reference_type} #{tx.reference_id}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleString()}
                              </span>
                            </div>
                            {tx.expires_at && (
                              <Typography variant="caption" className="text-muted-foreground/60 text-xs mt-0.5 block">
                                Exp: {new Date(tx.expires_at).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          className={`font-bold shrink-0 ${isEarned ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isEarned ? '+' : '-'}{tx.points} pts
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Pagination */}
              {txPagination && txPagination.last_page > 1 && (
                <Box className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                  <Typography variant="caption" className="text-muted-foreground">
                    Page {txPagination.current_page} of {txPagination.last_page} · {txPagination.total} total
                  </Typography>
                  <Box className="flex gap-2">
                    <Button
                      variant="outlined"
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage <= 1}
                      className="text-xs h-7 px-2"
                    >
                      <Iconify icon="solar:arrow-left-bold" width={14} />
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setTxPage((p) => Math.min(txPagination.last_page, p + 1))}
                      disabled={txPage >= txPagination.last_page}
                      className="text-xs h-7 px-2"
                    >
                      <Iconify icon="solar:arrow-right-bold" width={14} />
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
