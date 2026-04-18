import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Separator } from 'src/shared/ui/separator';
import { useAuthContext } from 'src/pages/auth/hooks';
import { Iconify } from 'src/shared/components/iconify';
import { Box, Badge, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { formatPermissionLabel } from 'src/lib/format-permission-label';

// ----------------------------------------------------------------------

const metadata = { title: `Profile | Dashboard - ${CONFIG.appName}` };

type SessionUser = {
  id?: number;
  name?: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean | number | string;
  roles?: string[];
  permissions?: string[];
  created_at?: string;
};

function isActiveFlag(v: unknown): boolean {
  return v === true || v === 1 || v === '1';
}

function formatMemberSince(raw?: string): string {
  if (!raw) return '—';
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ----------------------------------------------------------------------

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const { t: tNav } = useTranslation('nav');
  const navigate = useNavigate();
  const { user, permissions: contextPermissions, loading, authenticated } = useAuthContext();

  const [permQuery, setPermQuery] = useState('');

  const sessionUser = user as SessionUser | null;

  const permissions = useMemo(() => {
    if (contextPermissions?.length) return contextPermissions;
    const fromUser = sessionUser?.permissions;
    return Array.isArray(fromUser) ? fromUser : [];
  }, [contextPermissions, sessionUser?.permissions]);

  const filteredPermissions = useMemo(() => {
    const q = permQuery.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      if (p.toLowerCase().includes(q)) return true;
      return formatPermissionLabel(p, t).toLowerCase().includes(q);
    });
  }, [permissions, permQuery, t]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authenticated || !sessionUser) {
    return (
      <>
        <title>{metadata.title}</title>
        <Box className="flex min-h-[400px] items-center justify-center px-4">
          <Box className="w-full max-w-md rounded-2xl border border-border/60 bg-background/80 p-8 text-center shadow-lg backdrop-blur-sm">
            <Iconify icon="solar:user-circle-bold" className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <Typography variant="h6" className="mb-2 font-semibold">
              {t('profileSessionRequired')}
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              {t('profileSessionHint')}
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  const active = isActiveFlag(sessionUser.is_active);
  const roles = Array.isArray(sessionUser.roles) ? sessionUser.roles : [];
  const initial = (sessionUser.name || sessionUser.email || '?').charAt(0).toUpperCase();

  return (
    <>
      <title>{metadata.title}</title>

      <Box className="relative w-full max-w-none px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        {/* Decorative background — full-bleed within main */}
        <Box
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem] opacity-90"
        >
          <Box className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/18 blur-3xl" />
          <Box className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
          <Box className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-sky-400/12 blur-3xl" />
          <Box className="absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full bg-violet-500/8 blur-3xl" />
        </Box>

        {/* Header */}
        <Box className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Box className="max-w-2xl">
            <Typography variant="overline" className="text-primary font-semibold tracking-widest">
              {t('profileKicker')}
            </Typography>
            <Typography variant="h4" className="mt-1 font-bold tracking-tight">
              {t('profileTitle')}
            </Typography>
            <Typography variant="body2" className="mt-2 text-muted-foreground">
              {t('profileSubtitle')}
            </Typography>
          </Box>
          <button
            type="button"
            onClick={() => navigate(paths.dashboard.settings)}
            className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border/40 bg-gradient-to-br from-background/90 to-muted/30 px-4 py-2.5 text-start shadow-sm backdrop-blur-sm transition-colors hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-auto sm:justify-start"
            aria-label={tNav('settings')}
          >
            <Iconify icon="solar:settings-minimalistic-bold" className="h-5 w-5 text-primary" />
            <Typography variant="caption" component="span" className="font-medium text-muted-foreground">
              {tNav('settings')}
            </Typography>
          </button>
        </Box>

        {/* Hero card */}
        <Box className="mb-8 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/40 shadow-xl ring-1 ring-primary/5">
          <Box className="relative p-8 sm:p-10 lg:p-12">
            <Box className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <Box className="flex items-center gap-5">
                <Box className="relative">
                  <Box className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl font-bold text-primary-foreground shadow-lg ring-4 ring-primary/15">
                    {initial}
                  </Box>
                  <Box
                    className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background shadow-md ${
                      active ? 'bg-emerald-500' : 'bg-muted-foreground'
                    }`}
                  >
                    <Iconify
                      icon={active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                      className="h-4 w-4 text-white"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h5" className="font-bold tracking-tight">
                    {sessionUser.name || '—'}
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-muted-foreground">
                    {sessionUser.email || '—'}
                  </Typography>
                  <Box className="mt-3 flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <Badge
                          key={role}
                          variant="standard"
                          className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary"
                        >
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('profileNoRoles')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="flex flex-col items-start gap-2 sm:items-end">
                <Badge
                  variant="standard"
                  className={`rounded-full px-4 py-1 text-sm font-medium ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {active ? t('profileStatusActive') : t('profileStatusInactive')}
                </Badge>
                <Typography variant="caption" className="max-w-[220px] text-end text-muted-foreground">
                  {t('profileNoTokenHint')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="grid gap-6 lg:grid-cols-2 xl:grid-cols-12 xl:gap-8">
          {/* Contact & account */}
          <Box className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-xl ring-1 ring-primary/5 backdrop-blur-sm sm:p-8 xl:col-span-7">
            <Box className="mb-4 flex items-center gap-2">
              <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Iconify icon="solar:user-id-bold" className="h-5 w-5 text-primary" />
              </Box>
              <Typography variant="h6" className="font-semibold">
                {t('profileSectionAccount')}
              </Typography>
            </Box>
            <Box className="space-y-4">
              <Row
                icon="solar:hashtag-circle-bold"
                label={t('profileUserId')}
                value={sessionUser.id != null ? `#${sessionUser.id}` : '—'}
              />
              <Separator />
              <Row
                icon="solar:letter-bold"
                label={t('profileEmail')}
                value={sessionUser.email || '—'}
              />
              <Separator />
              <Row
                icon="solar:phone-bold"
                label={t('profilePhone')}
                value={sessionUser.phone || '—'}
              />
              <Separator />
              <Row
                icon="solar:calendar-bold"
                label={t('profileMemberSince')}
                value={formatMemberSince(sessionUser.created_at)}
              />
            </Box>

            <Separator className="my-4" />
            <Typography variant="caption" className="mb-2 block font-medium text-muted-foreground">
              {t('profileAccountShortcuts')}
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                className="gap-1.5"
                onClick={() => navigate(paths.dashboard.categories)}
              >
                <Iconify icon="solar:widget-5-bold" width={14} />
                {tNav('categories')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                className="gap-1.5"
                onClick={() => navigate(paths.dashboard.products)}
              >
                <Iconify icon="solar:box-minimalistic-bold" width={14} />
                {tNav('products')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                className="gap-1.5"
                onClick={() => navigate(paths.dashboard.pageSections)}
              >
                <Iconify icon="solar:widget-add-bold" width={14} />
                {tNav('pageSections')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                className="gap-1.5"
                onClick={() => navigate(paths.dashboard.shop)}
              >
                <Iconify icon="solar:shop-bold" width={14} />
                {tNav('shop')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                className="gap-1.5"
                onClick={() => navigate(paths.dashboard.baskets)}
              >
                <Iconify icon="solar:cart-large-2-bold" width={14} />
                {tNav('baskets')}
              </Button>
            </Box>
          </Box>

          {/* Permissions */}
          <Box className="flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-xl ring-1 ring-primary/5 backdrop-blur-sm lg:min-h-[320px] sm:p-8 xl:col-span-5">
            <Box className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Box className="flex items-center gap-2">
                <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Iconify icon="solar:key-minimalistic-bold" className="h-5 w-5 text-primary" />
                </Box>
                <Typography variant="h6" className="font-semibold">
                  {t('profileSectionPermissions')}
                </Typography>
              </Box>
              <Badge variant="standard" className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {permissions.length}
              </Badge>
            </Box>

            <label className="mb-3 block">
              <span className="sr-only">{t('profilePermissionFilter')}</span>
              <Box className="relative">
                <Iconify
                  icon="solar:magnifer-linear"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  value={permQuery}
                  onChange={(e) => setPermQuery(e.target.value)}
                  placeholder={t('profilePermissionFilter')}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 py-2.5 pl-10 pr-3 text-sm outline-none ring-primary/30 transition-shadow focus:ring-2"
                />
              </Box>
            </label>

            <Box className="max-h-[280px] flex-1 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-3">
              {filteredPermissions.length > 0 ? (
                <Box className="flex flex-wrap gap-2">
                  {filteredPermissions.map((p) => (
                    <Typography
                      key={p}
                      component="span"
                      variant="caption"
                      title={p}
                      dir="auto"
                      className="inline-block max-w-[min(100%,20rem)] rounded-md border border-border/60 bg-background/90 px-2 py-1 text-[11px] font-medium leading-relaxed text-foreground"
                    >
                      {formatPermissionLabel(p, t)}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Box className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center">
                  <Iconify icon="solar:folder-with-files-bold" className="h-8 w-8 text-muted-foreground/50" />
                  <Typography variant="body2" className="text-muted-foreground">
                    {permQuery ? t('profilePermissionsEmptyFilter') : t('profilePermissionsEmpty')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <Box className="flex items-start justify-between gap-4 py-0.5">
      <Box className="flex min-w-0 items-center gap-3">
        <Iconify icon={icon} className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <Typography variant="body2" className="font-medium">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" className="max-w-[55%] break-words text-end text-muted-foreground">
        {value}
      </Typography>
    </Box>
  );
}
