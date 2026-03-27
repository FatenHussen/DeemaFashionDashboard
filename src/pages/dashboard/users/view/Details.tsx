import type { UserAddress } from '@/pages/dashboard/users/types/user.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchUserById } from '@/pages/dashboard/users/hooks/user';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: userResponse, isLoading, error } = useFetchUserById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !userResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.userLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.userLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/users')}>
            {t('form.backToUsers')}
          </Button>
        </Box>
      </Box>
    );
  }

  const user = userResponse.data;
  const aff = user.affiliate;
  const stats = user.markter_statistics;
  const addresses = user.addresses ?? [];

  return (
    <>
      <title>{t('form.userDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/users')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('form.backToUsers')}
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:user-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {user.name || t('form.userFallbackTitle', { id: user.id })}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.userIdChip', { id: user.id })}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/users/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                {t('form.editUserButton')}
              </Button>
            </Box>
          </Box>

          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              <Box>
                <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  {t('form.userDetailsBasicInfo')}
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('form.userDetailsUserId')}
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {user.id}
                    </Typography>
                  </Box>
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.name')}
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {user.name || '-'}
                    </Typography>
                  </Box>
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.email')}
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('columns.phone')}
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {user.phone || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {aff && (aff.is_affiliate || aff.affiliate_approved || aff.affiliate_id || aff.affiliate_rate) && (
                <>
                  <Separator />
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:users-group-rounded-bold" width={20} />
                      {t('form.userDetailsAffiliate')}
                    </Typography>
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Box className="space-y-2">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                          {t('form.affiliateIsAffiliate')}
                        </Typography>
                        <Typography variant="body1" className="text-foreground">
                          {aff.is_affiliate ? t('yes') : t('no')}
                        </Typography>
                      </Box>
                      <Box className="space-y-2">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                          {t('form.affiliateApproved')}
                        </Typography>
                        <Typography variant="body1" className="text-foreground">
                          {aff.affiliate_approved ? t('yes') : t('no')}
                        </Typography>
                      </Box>
                      {aff.affiliate_id != null && aff.affiliate_id !== '' && (
                        <Box className="space-y-2">
                          <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('form.affiliateIdLabel')}
                          </Typography>
                          <Typography variant="body1" className="text-foreground">
                            {String(aff.affiliate_id)}
                          </Typography>
                        </Box>
                      )}
                      {aff.affiliate_rate != null && aff.affiliate_rate !== '' && (
                        <Box className="space-y-2">
                          <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('form.affiliateRateLabel')}
                          </Typography>
                          <Typography variant="body1" className="text-foreground">
                            {String(aff.affiliate_rate)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {stats && (
                <>
                  <Separator />
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:chart-2-bold" width={20} />
                      {t('form.marketerStatistics')}
                    </Typography>
                    <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.total_orders != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statTotalOrders')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.total_orders}
                          </Typography>
                        </Box>
                      )}
                      {stats.delivered_orders != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statDeliveredOrders')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.delivered_orders}
                          </Typography>
                        </Box>
                      )}
                      {stats.total_sales != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statTotalSales')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.total_sales}
                          </Typography>
                        </Box>
                      )}
                      {stats.earned_commission != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statEarnedCommission')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.earned_commission}
                          </Typography>
                        </Box>
                      )}
                      {stats.pending_earnings != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statPendingEarnings')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.pending_earnings}
                          </Typography>
                        </Box>
                      )}
                      {stats.withdrawn != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statWithdrawn')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.withdrawn}
                          </Typography>
                        </Box>
                      )}
                      {stats.available_balance != null && (
                        <Box className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <Typography variant="caption" className="text-muted-foreground">
                            {t('form.statAvailableBalance')}
                          </Typography>
                          <Typography variant="h6" className="font-semibold mt-1">
                            {stats.available_balance}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {addresses.length > 0 && (
                <>
                  <Separator />
                  <Box>
                    <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Iconify icon="solar:map-point-bold" width={20} />
                      {t('form.userDetailsAddresses')}
                      <Typography variant="body2" className="text-muted-foreground font-normal ml-2">
                        {addresses.length === 1
                          ? t('form.userDetailsAddressCountOne', { count: addresses.length })
                          : t('form.userDetailsAddressCount', { count: addresses.length })}
                      </Typography>
                    </Typography>
                    <Box className="space-y-4">
                      {addresses.map((addr: UserAddress) => (
                        <Box
                          key={addr.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <Box className="flex items-start justify-between mb-3">
                            <Typography variant="subtitle2" className="font-semibold text-foreground">
                              {addr.label || t('form.addressNumberFallback', { id: addr.id })}
                            </Typography>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                {t('form.addressDefaultBadge')}
                              </span>
                            )}
                          </Box>
                          <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {addr.street_name && (
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:map-point-bold" className="text-primary flex-shrink-0" width={16} />
                                <span className="text-muted-foreground">{addr.street_name}</span>
                              </Box>
                            )}
                            {addr.building_number && (
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground">{t('form.addressBuildingLabel')}</Typography>
                                <Typography variant="body2">{addr.building_number}</Typography>
                              </Box>
                            )}
                            {addr.floor_apartment && (
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground">{t('form.addressFloorApartmentLabel')}</Typography>
                                <Typography variant="body2">{addr.floor_apartment}</Typography>
                              </Box>
                            )}
                            {addr.nearest_landmark && (
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground">{t('form.addressLandmarkLabel')}</Typography>
                                <Typography variant="body2">{addr.nearest_landmark}</Typography>
                              </Box>
                            )}
                            {addr.contact_phone && (
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:phone-bold" className="text-primary flex-shrink-0" width={16} />
                                <Typography variant="body2">{addr.contact_phone}</Typography>
                              </Box>
                            )}
                            {addr.lat != null && addr.lng != null && (
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground">{t('form.addressCoordinatesLabel')}</Typography>
                                <Typography variant="body2">{addr.lat}, {addr.lng}</Typography>
                              </Box>
                            )}
                          </Box>
                          {addr.area && (
                            <Box className="mt-3 pt-3 border-t border-border/50 space-y-1 text-sm text-muted-foreground">
                              <Box className="flex items-center gap-2">
                                <Iconify icon="solar:map-point-bold" className="text-primary" width={16} />
                                <span>{t('form.addressAreaLine', { name: formatTranslated(addr.area.name) })}</span>
                              </Box>
                              {addr.area.city && (
                                <Box className="flex items-center gap-2">
                                  <Iconify icon="solar:city-bold" className="text-primary" width={16} />
                                  <span>{t('form.addressCityLine', { name: formatTranslated(addr.area.city.name) })}</span>
                                </Box>
                              )}
                              {addr.area.city?.governorate && (
                                <Box className="flex items-center gap-2">
                                  <Iconify icon="solar:global-bold" className="text-primary" width={16} />
                                  <span>{t('form.addressGovernorateLine', { name: formatTranslated(addr.area.city.governorate.name) })}</span>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
