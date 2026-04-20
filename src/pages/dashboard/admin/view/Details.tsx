import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchAdminById } from '@/pages/dashboard/admin/hooks/admin';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: admin, isLoading, error } = useFetchAdminById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !admin) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.adminLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.adminLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/admin')}>
            {t('form.backToAdmins')}
          </Button>
        </Box>
      </Box>
    );
  }

  const roleLabels = (admin.roles ?? []).map((r) =>
    typeof r === 'object' && r && 'name' in r ? (r as { name: string }).name : String(r)
  );
  const cities = admin.cities ?? [];
  const cityCount = admin.city_ids?.length ?? cities.length;
  const isActive = Boolean(admin.is_active);

  return (
    <>
      <title>{t('form.adminDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen w-full overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-muted/40" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </Box>

        <Box className="relative w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Button
            variant="text"
            onClick={() => navigate('/admin')}
            className="mb-5 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToAdmins')}
          </Button>

          <Box className="relative mb-8 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg backdrop-blur-sm">
            <Box className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/[0.06] to-transparent" />
            <Box className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
            <Box className="pointer-events-none absolute right-1/4 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

            <Box className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8 lg:p-10">
              <Box className="flex min-w-0 flex-1 items-start gap-4 md:gap-6">
                <Box className="relative shrink-0">
                  <Box className="absolute inset-0 rounded-2xl bg-primary/25 blur-lg" />
                  <Box className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 shadow-sm md:h-24 md:w-24">
                    <Iconify icon="solar:user-speak-rounded-bold" className="text-primary" width={40} height={40} />
                  </Box>
                </Box>
                <Box className="min-w-0 flex-1 space-y-2">
                  <Box className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur ${
                        isActive
                          ? 'border-emerald-300/60 bg-emerald-50/70 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'border-red-300/60 bg-red-50/70 text-red-700 dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
                      />
                      {isActive ? t('active') : t('inactive')}
                    </span>
                    <span aria-hidden className="text-base">
                      ✨
                    </span>
                  </Box>
                  <Typography variant="h4" className="break-words font-bold text-foreground md:text-3xl">
                    {admin.name}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground max-w-2xl">
                    {t('form.adminDetailsSubtitle')}
                  </Typography>
                  <Box className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                      <Iconify icon="solar:letter-bold" width={14} className="text-primary" />
                      {admin.email}
                    </span>
                    {admin.phone && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                        <Iconify icon="solar:phone-bold" width={14} className="text-primary" />
                        {admin.phone}
                      </span>
                    )}
                    {admin.id != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                        <Iconify icon="solar:hashtag-bold" width={14} className="text-primary" />
                        {admin.id}
                      </span>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <Box className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                  <Box className="rounded-xl border border-border/50 bg-background/70 px-4 py-3 text-center backdrop-blur">
                    <Typography variant="h5" className="font-bold text-primary">
                      {roleLabels.length}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('columns.roles')}
                    </Typography>
                  </Box>
                  <Box className="rounded-xl border border-border/50 bg-background/70 px-4 py-3 text-center backdrop-blur">
                    <Typography variant="h5" className="font-bold text-emerald-600 dark:text-emerald-400">
                      {cityCount}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('columns.city')}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/admin/update/${id}`)}
                  className="h-11 gap-2 self-stretch sm:self-auto md:self-stretch lg:self-auto"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('form.editAdmin')}
                </Button>
              </Box>
            </Box>
          </Box>

          <Box className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
            <Box className="space-y-4 xl:col-span-4">
              <Typography variant="subtitle2" className="flex items-center gap-2 font-semibold">
                <Iconify icon="solar:info-circle-bold" width={18} className="text-primary" />
                {t('form.adminBasicInformationSection')}
              </Typography>
              <Box className="space-y-3">
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('form.fullName')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:user-rounded-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="font-semibold text-foreground">
                      {admin.name}
                    </Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('form.emailAddress')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:letter-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="break-all text-foreground">{admin.email}</Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('columns.phone')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:phone-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="text-foreground">
                      {admin.phone || '—'}
                    </Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('columns.createdAt')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:calendar-date-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="text-foreground">{admin.created_at}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className="min-w-0 xl:col-span-8 space-y-8">
              <Box>
                <Typography variant="subtitle2" className="mb-4 flex flex-wrap items-center gap-2 font-semibold">
                  <Iconify icon="solar:shield-user-bold" width={18} className="text-primary" />
                  {t('form.adminRolesAccessSection')}
                  <Typography variant="caption" className="font-normal text-muted-foreground">
                    {t('form.adminDetailsRolesCount', { count: roleLabels.length })}
                  </Typography>
                </Typography>
                {roleLabels.length > 0 ? (
                  <Box className="flex flex-wrap gap-2">
                    {roleLabels.map((label, i) => (
                      <span
                        key={`${label}-${i}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        <Iconify icon="solar:shield-check-bold" width={14} />
                        {label}
                      </span>
                    ))}
                  </Box>
                ) : (
                  <Box className="rounded-xl border border-dashed border-border py-10 text-center">
                    <Iconify
                      icon="solar:shield-user-bold"
                      className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('form.adminNoRoles')}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" className="mb-4 flex flex-wrap items-center gap-2 font-semibold">
                  <Iconify icon="solar:city-bold" width={18} className="text-emerald-600 dark:text-emerald-400" />
                  {t('form.adminCitiesAccessSection')}
                  <Typography variant="caption" className="font-normal text-muted-foreground">
                    {t('form.adminDetailsCitiesCount', { count: cityCount })}
                  </Typography>
                </Typography>
                {cities.length > 0 ? (
                  <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cities.map((c) => (
                      <Box
                        key={c.id}
                        className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur-sm ring-1 ring-emerald-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Box className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <Box className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">
                            📍
                          </span>
                          <Typography variant="body2" className="font-semibold text-foreground">
                            {formatTranslated(c.name)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : cityCount > 0 && admin.city_ids && admin.city_ids.length > 0 ? (
                  <Box className="flex flex-wrap gap-2">
                    {admin.city_ids.map((cid) => (
                      <span
                        key={cid}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-200"
                      >
                        <Iconify icon="solar:hashtag-bold" width={14} />
                        {cid}
                      </span>
                    ))}
                  </Box>
                ) : (
                  <Box className="rounded-xl border border-dashed border-border py-10 text-center">
                    <Iconify
                      icon="solar:city-bold"
                      className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('form.adminNoCities')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
