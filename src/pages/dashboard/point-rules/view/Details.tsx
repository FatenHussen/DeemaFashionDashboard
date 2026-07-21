import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchPointRuleById } from '@/pages/dashboard/point-rules/hooks/point-rule';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

function titleDisplay(title: string | { en?: string; ar?: string } | undefined): string {
  if (title == null) return '—';
  if (typeof title === 'object') return title.en || title.ar || '—';
  return String(title);
}

export default function PointRuleDetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canUpdate = can('pointrule.update');

  const { data: response, isLoading, error } = useFetchPointRuleById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;

  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            {t('form.pointRuleDetailsLoadErrorTitle')}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {t('form.pointRuleDetailsLoadErrorDesc')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/point-rules')}>
            {t('form.backToPointRules')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <title>{t('form.pointRuleDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative w-full">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/point-rules')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />{' '}
              {t('form.backToPointRules')}
            </Button>
            <Box className="flex items-center gap-4 mb-2 flex-wrap">
              <Box className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:star-bold" className="text-primary" width={28} height={28} />
              </Box>
              <Box className="flex-1 min-w-0">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {titleDisplay(item.title)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground font-mono">
                  {item.code}
                </Typography>
              </Box>
              {canUpdate && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/point-rules/update/${id}`)}
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
                {t('form.pointRuleInformationSection')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.nameEn')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {typeof item.title === 'object' && item.title !== null
                      ? item.title.en || '—'
                      : titleDisplay(item.title)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.nameAr')}
                  </Typography>
                  <Typography variant="body1" className="font-medium" dir="rtl">
                    {typeof item.title === 'object' && item.title !== null
                      ? item.title.ar || '—'
                      : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.code')}
                  </Typography>
                  <Typography variant="body1" className="font-medium font-mono">
                    {item.code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.pointsLabel')}
                  </Typography>
                  <Typography variant="body1" className="font-medium text-primary">
                    {item.value}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.minOrderAmount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.min_order_amount != null ? String(item.min_order_amount) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.expiresAfterDays')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {t('form.pointRuleDetailExpiresLine', { count: item.expires_after_days })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.status')}
                  </Typography>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {item.is_active ? t('active') : t('inactive')}
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
