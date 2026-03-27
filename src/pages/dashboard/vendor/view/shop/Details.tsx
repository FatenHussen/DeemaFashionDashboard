import type { DaySchedule } from '@/pages/dashboard/vendor/types/shop.types';

import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShopById } from '@/pages/dashboard/vendor/hooks/shop';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Shop Details | Dashboard - ${CONFIG.appName}` };

function formatWorkingHoursDay(schedule: string | DaySchedule | undefined): string {
  if (schedule == null) return '-';
  if (typeof schedule === 'string') return schedule || '-';
  const c = schedule.closed;
  const isClosed = c === true || c === 1 || c === '1' || c === 'true';
  if (isClosed) return 'Closed';
  if (schedule.open && schedule.close) return `${schedule.open} - ${schedule.close}`;
  return '-';
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchShopById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">Error Loading Shop</Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load shop information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/shop')}>Back to Shops</Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/shop')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Shops
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              {item.logo_url ? (
                <img src={item.logo_url} alt={formatTranslated(item.name)} className="w-16 h-16 rounded-xl object-cover border border-border/50" />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={32} height={32} />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">{formatTranslated(item.name)}</Typography>
                {item.description && <Typography variant="body2" className="text-muted-foreground">{formatTranslated(item.description)}</Typography>}
              </Box>
              <Box className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.is_open_now ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {item.is_open_now ? 'Open Now' : 'Closed'}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.is_active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </Box>
              <Button variant="contained" onClick={() => navigate(`/shop/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          {item.badges && item.badges.length > 0 && (
            <Box className="flex flex-wrap gap-2 mb-4">
              {item.badges.map((badge) => {
                const colorClasses: Record<string, string> = {
                  success: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                  warning: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
                  danger: 'bg-red-500/20 text-red-700 border-red-500/30',
                  primary: 'bg-primary/20 text-primary border-primary/30',
                };
                const cls =
                  (badge.color != null ? colorClasses[badge.color] : undefined) ||
                  'bg-muted text-muted-foreground border-border/50';
                return (
                  <span
                    key={badge.name}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${cls}`}
                  >
                    {badge.name}
                  </span>
                );
              })}
            </Box>
          )}

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">Shop Information</Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Vendor</Typography>
                  <Typography variant="body1" className="font-medium">{formatTranslated(item.vendor?.name) || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Rating</Typography>
                  <Box className="flex items-center gap-1">
                    <Iconify icon="eva:star-fill" className="text-amber-500" width={16} />
                    <Typography variant="body1" className="font-medium">
                      {item.average_rating?.toFixed(1) ?? '0.0'} ({item.ratings_count ?? 0} reviews)
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Email</Typography>
                  <Typography variant="body1" className="font-medium">{item.email || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Phone</Typography>
                  <Typography variant="body1" className="font-medium">{item.phone || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Mobile</Typography>
                  <Typography variant="body1" className="font-medium">{item.mobile || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">Address</Typography>
                  <Typography variant="body1" className="font-medium">{formatTranslated(item.address) || '-'}</Typography>
                </Box>
                {item.area && (
                  <>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">Area</Typography>
                      <Typography variant="body1" className="font-medium">
                        {formatTranslated(item.area.name) || '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground">Location Path</Typography>
                      <Typography variant="body1" className="font-medium">
                        {[
                          formatTranslated(item.area.city?.governorate?.name),
                          formatTranslated(item.area.city?.name),
                          formatTranslated(item.area.name),
                        ]
                          .filter(Boolean)
                          .join(' / ') || '-'}
                      </Typography>
                    </Box>
                    {item.area.base_fee != null && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">Base Fee</Typography>
                        <Typography variant="body1" className="font-medium">{item.area.base_fee}</Typography>
                      </Box>
                    )}
                  </>
                )}
                {item.services && item.services.length > 0 && (
                  <Box className="sm:col-span-2">
                    <Typography variant="caption" className="text-muted-foreground">Services</Typography>
                    <Box className="flex flex-wrap gap-1 mt-1">
                      {item.services.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium"
                        >
                          {formatTranslated(s.name) || `#${s.id}`}
                        </span>
                      ))}
                    </Box>
                  </Box>
                )}
                {(item.created_at || item.updated_at) && (
                  <Box className="sm:col-span-2 flex gap-6 pt-2 border-t border-border/30">
                    {item.created_at && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">Created</Typography>
                        <Typography variant="body2" className="font-medium">
                          {new Date(item.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {item.updated_at && (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground">Updated</Typography>
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

          {item.working_hours && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">Working Hours</Typography>
                <Box className="grid gap-3">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                    const schedule = item.working_hours?.[day];
                    return (
                      <Box key={day} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                        <Typography variant="body2" className="capitalize font-medium">{day}</Typography>
                        <Typography variant="body2" className="text-muted-foreground">
                          {formatWorkingHoursDay(schedule)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}

          {(item.lat ?? item.lng ?? item.area?.lat ?? item.area?.lng) && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">Location Coordinates</Typography>
                <Box className="grid gap-4 sm:grid-cols-2">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">Latitude</Typography>
                    <Typography variant="body1" className="font-medium font-mono">
                      {item.lat ?? item.area?.lat ?? '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">Longitude</Typography>
                    <Typography variant="body1" className="font-medium font-mono">
                      {item.lng ?? item.area?.lng ?? '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
