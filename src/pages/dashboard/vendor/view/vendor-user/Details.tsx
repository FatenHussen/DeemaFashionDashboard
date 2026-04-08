import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchVendorUserById } from '@/pages/dashboard/vendor/hooks/vendor-user';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchVendorUserById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">
            {t('form.vendorUserLoadErrorTitle')}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.vendorUserLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/vendor-users')}>
            {t('form.backToVendorUsers')}
          </Button>
        </Box>
      </Box>
    );
  }

  const isActive = Boolean(item.is_active);

  return (
    <>
      <title>{t('form.vendorUserDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/vendor-users')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> {t('form.backToVendorUsers')}
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:user-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {item.name}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {item.email}
                </Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  isActive ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                }`}
              >
                {isActive ? t('active') : t('inactive')}
              </span>
              <Button
                variant="contained"
                onClick={() => navigate(`/vendor-users/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} /> {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('form.vendorUserInformationTitle')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.name')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.email')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.email || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.vendor')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.vendor
                      ? formatTranslated(item.vendor.name as any)
                      : item.vendor_name
                        ? formatTranslated(item.vendor_name as any)
                        : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.status')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {isActive ? t('active') : t('inactive')}
                  </Typography>
                </Box>
                {(item.created_at || item.updated_at) && (
                  <Box className="sm:col-span-2 flex gap-6 pt-2 border-t border-border/30">
                    {item.created_at && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('columns.createdAt')}
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {new Date(item.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {item.updated_at && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('columns.updatedAt')}
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {new Date(item.updated_at).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {item.shops && item.shops.length > 0 && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">
                  {t('form.vendorUserAssignedShops', { count: item.shops.length })}
                </Typography>
                <Box className="space-y-3">
                  {item.shops.map((shop) => (
                    <Box
                      key={shop.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/30 bg-muted/20"
                    >
                      <Box>
                        <Typography variant="body1" className="font-medium">
                          {formatTranslated(shop.name as any)}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {shop.email || '-'}
                        </Typography>
                      </Box>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          shop.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                        }`}
                      >
                        {shop.is_active ? t('active') : t('inactive')}
                      </span>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
