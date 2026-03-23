import type { SubscriptionPackageDetail } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useTranslation } from 'react-i18next';
import { useFetchSubscriptionById } from '@/pages/dashboard/subscriptions/hooks/subscription';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Subscription Details | Dashboard - ${CONFIG.appName}` };

const pkgName = (p?: SubscriptionPackageDetail | null): string => {
  if (!p?.name) return '';
  if (typeof p.name === 'string') return p.name;
  return p.name.en || p.name.ar || '';
};

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchSubscriptionById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            {t('subscriptionDetailsError')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/subscriptions')}>
            {t('subscriptionBackToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const name = pkgName(item.package);

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/subscriptions')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />{' '}
              {t('subscriptionBackToList')}
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:card-recive-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {t('subscriptionDetailTitle', { id: item.id })}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {item.user?.name || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-6">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('subscriptionSectionUser')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.name')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.user?.name ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.email')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.user?.email ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.phone')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.user?.phone ?? '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-6">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('subscriptionSectionPackage')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.name')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {name || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.price')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.price != null ? Number(item.package.price).toFixed(2) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.durationDays')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.duration_days ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.monthlyOrders')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.monthly_orders_limit ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('subscriptionPackageFreeDelivery')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.free_delivery_count ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.discountPercent')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.discount_percentage ?? '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('subscriptionPackagePointsBonus')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.package?.points_bonus ?? '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('subscriptionSectionSubscription')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.status')}
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {item.status}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.active')}
                  </Typography>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {item.is_active ? t('active') : t('inactive')}
                  </span>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.startDate')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.start_date ? new Date(item.start_date).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.endDate')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.end_date ? new Date(item.end_date).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.remainingOrders')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.remaining_orders === null || item.remaining_orders === undefined
                      ? '∞'
                      : item.remaining_orders}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.remainingFreeDeliveries')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.remaining_free_deliveries === null || item.remaining_free_deliveries === undefined
                      ? '—'
                      : item.remaining_free_deliveries}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.daysRemaining')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.days_remaining === null || item.days_remaining === undefined
                      ? '—'
                      : item.days_remaining}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.created')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.updatedAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
