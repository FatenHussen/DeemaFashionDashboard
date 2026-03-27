import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchCurrencyById } from '@/pages/dashboard/currencies/hooks/currency';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchCurrencyById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">{t('form.currencyLoadErrorTitle')}</Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.currencyLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/currencies')}>{t('form.backToCurrencies')}</Button>
        </Box>
      </Box>
    );
  }

  const nameStr = typeof item.name === 'object' ? (item.name as any)?.en || (item.name as any)?.ar || '-' : String(item.name || '-');

  return (
    <>
      <title>{t('form.currencyDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/currencies')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> {t('form.backToCurrencies')}
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {item.symbol}
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">{nameStr}</Typography>
                <Typography variant="body2" className="text-muted-foreground"><code className="px-1.5 py-0.5 rounded bg-muted">{item.code}</code></Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/currencies/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">{t('form.currencyInformationSection')}</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box><Typography variant="caption" className="text-muted-foreground">{t('columns.code')}</Typography><Typography variant="body1" className="font-medium font-mono">{item.code}</Typography></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">{t('form.currencySymbolLabel')}</Typography><Typography variant="body1" className="font-medium text-lg">{item.symbol}</Typography></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">{t('form.currencyExchangeRateLabel')}</Typography><Typography variant="body1" className="font-medium font-mono">{item.exchange_rate}</Typography></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">{t('columns.default')}</Typography><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_default ? 'bg-blue-500/20 text-blue-600' : 'bg-muted text-muted-foreground'}`}>{item.is_default ? t('yes') : t('no')}</span></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">{t('columns.status')}</Typography><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>{item.is_active ? t('active') : t('inactive')}</span></Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
