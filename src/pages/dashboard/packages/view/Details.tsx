import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchPackageById } from '@/pages/dashboard/packages/hooks/package';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: packageResponse, isLoading, error } = useFetchPackageById(id || '');

  const pkg = packageResponse?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !pkg) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">{t('form.packageLoadErrorTitle')}</Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {t('form.packageLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/packages')}>{t('form.backToPackages')}</Button>
        </Box>
      </Box>
    );
  }

  const nameStr = typeof pkg.name === 'object' ? (pkg.name as any)?.en || (pkg.name as any)?.ar || '-' : String(pkg.name || '-');

  return (
    <>
      <title>{t('form.packageDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative w-full">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/packages')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> {t('form.backToPackages')}
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:box-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">{nameStr}</Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.packageDetailsPriceDays', { price: pkg.price, days: pkg.duration_days })}
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/packages/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">{t('form.packageInformationTitle')}</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldPrice')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.price}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldDurationDays')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.duration_days}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldMonthlyOrdersLimit')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.monthly_orders_limit}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldFreeDeliveryCount')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.free_delivery_count}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldDiscountPercentage')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.discount_percentage}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('form.packageFieldPointsBonus')}</Typography>
                  <Typography variant="body1" className="font-medium">{pkg.points_bonus}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.status')}</Typography>
                  <Typography variant="body1" className="font-medium">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        pkg.is_active
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}
                    >
                      {pkg.is_active ? t('active') : t('inactive')}
                    </span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">{t('columns.createdAt')}</Typography>
                  <Typography variant="body1" className="font-medium">
                    {pkg.created_at ? new Date(pkg.created_at).toLocaleString() : '-'}
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
