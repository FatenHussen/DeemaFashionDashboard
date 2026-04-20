import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchDeliveryDistanceRangeById } from '@/pages/dashboard/delivery-distance-ranges/hooks/delivery-distance-range';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canUpdate = can('deliverydistancerange.update');

  const { data: response, isLoading, error } = useFetchDeliveryDistanceRangeById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            {t('form.deliveryDistanceRangeLoadErrorTitle')}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.deliveryDistanceRangeLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/delivery-distance-ranges')}>
            {t('form.deliveryDistanceRangeBackToList')}
          </Button>
        </Box>
      </Box>
    );
  }

  const maxLabel =
    item.max_distance === null ? t('form.deliveryDistanceRangeMaxInfinity') : String(item.max_distance);

  return (
    <>
      <title>{t('form.deliveryDistanceRangeDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative w-full">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/delivery-distance-ranges')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />{' '}
              {t('form.deliveryDistanceRangeBackToList')}
            </Button>
            <Box className="flex items-center gap-4 mb-2 flex-wrap">
              <Box className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:routing-2-bold" className="text-primary" width={28} height={28} />
              </Box>
              <Box className="flex-1 min-w-0">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {t('form.deliveryDistanceRangeDetailHeading', {
                    min: item.min_distance,
                    max: maxLabel,
                  })}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground font-mono">
                  #{item.id}
                </Typography>
              </Box>
              {canUpdate && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/delivery-distance-ranges/update/${id}`)}
                  className="gap-2"
                >
                  <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
                </Button>
              )}
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('form.deliveryDistanceRangeInformationSection')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.minDistance')}
                  </Typography>
                  <Typography variant="body1" className="font-medium font-mono">
                    {item.min_distance}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.maxDistance')}
                  </Typography>
                  <Typography variant="body1" className="font-medium font-mono">
                    {maxLabel}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.multiplier')}
                  </Typography>
                  <Typography variant="body1" className="font-medium text-primary">
                    {item.multiplier}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.createdAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.created_at}
                  </Typography>
                </Box>
              </Box>
              <Box className="mt-6 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <Typography variant="caption" className="text-muted-foreground">
                  {t('form.deliveryDistanceRangeRuleHint')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
