import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchVendorPackageById } from '@/pages/dashboard/vendor/hooks/vendor-package';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Vendor Package Details | Dashboard - ${CONFIG.appName}` };

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" className="text-muted-foreground">{label}</Typography>
      <Typography variant="body1" className="font-medium">{value ?? '-'}</Typography>
    </Box>
  );
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchVendorPackageById(id || '');

  const pkg = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !pkg) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            Error Loading Vendor Package
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/vendor-packages')}>
            Back to Vendor Packages
          </Button>
        </Box>
      </Box>
    );
  }

  const nameStr =
    typeof pkg.name === 'object'
      ? (pkg.name as any)?.en || (pkg.name as any)?.ar || '-'
      : String(pkg.name || '-');

  const descStr =
    typeof pkg.description === 'object'
      ? (pkg.description as any)?.en || (pkg.description as any)?.ar || '-'
      : String(pkg.description || '-');

  const boolFields = [
    ['Featured', pkg.is_featured],
    ['Premium Badge', pkg.has_premium_badge],
    ['Banner Ad', pkg.has_banner_ad],
    ['Sales Reports', pkg.has_sales_reports],
    ['Analytics', pkg.has_analytics],
    ['Can Set Prep Time', pkg.can_set_prep_time],
    ['Custom Shipping', pkg.custom_shipping_options],
    ['Vendor Delivery', pkg.has_vendor_delivery],
    ['Activation Fee Waived', pkg.activation_fee_waived],
  ] as const;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="relative mx-auto max-w-4xl">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/vendor-packages')}
              className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Vendor
              Packages
            </Button>
            <Box className="mb-2 flex items-center gap-4">
              <Box className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Iconify icon="solar:box-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="mb-1 font-bold text-foreground">
                  {nameStr}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Price: {pkg.price} - {pkg.duration_days} days - Max {pkg.max_products} products
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/vendor-packages/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          <Box className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                Package Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <DetailRow label={t('columns.price')} value={pkg.price} />
                <DetailRow label={t('columns.durationDays')} value={pkg.duration_days} />
                <DetailRow label={t('columns.maxProducts')} value={pkg.max_products} />
                <DetailRow label={t('form.commissionRatePercent')} value={pkg.commission_rate} />
                <DetailRow label={t('form.commissionPerOrder')} value={pkg.commission_per_order} />
                <DetailRow
                  label={t('columns.status')}
                  value={
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        pkg.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  }
                />
                <DetailRow label={t('form.searchPriority')} value={pkg.search_priority} />
                <DetailRow label={t('form.maxCampaigns')} value={pkg.max_campaigns} />
                <DetailRow label={t('form.reportLevel')} value={pkg.report_level} />
                <DetailRow label={t('form.activeSubscriptions')} value={pkg.active_subscriptions_count} />
                <DetailRow label={t('columns.createdAt')} value={pkg.created_at ? new Date(pkg.created_at).toLocaleString() : '-'} />
                <DetailRow label={t('columns.updatedAt')} value={pkg.updated_at ? new Date(pkg.updated_at).toLocaleString() : '-'} />
              </Box>

              {descStr && (
                <Box className="mt-4">
                  <Typography variant="caption" className="text-muted-foreground">
                    Description
                  </Typography>
                  <Typography variant="body1" className="mt-1 font-medium">
                    {descStr}
                  </Typography>
                </Box>
              )}

              <Typography variant="subtitle2" className="mt-6 mb-2 font-semibold">
                Features
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {boolFields.map(([label, val]) => (
                  <span
                    key={label}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                      val ? 'border-green-500/30 bg-green-500/10 text-green-600' : 'border-muted bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {label}: {val ? 'Yes' : 'No'}
                  </span>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
