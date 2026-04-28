import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchRoleById } from '@/pages/dashboard/roles/hooks/role';
import {
  translatePermissionName,
  translatePermissionResource,
} from '@/pages/dashboard/roles/utils/permission-label';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const RESOURCE_PALETTE = [
  { ring: 'ring-sky-400/80 dark:ring-sky-600/60', bar: 'from-sky-700 to-blue-700', soft: 'bg-sky-500/30', text: 'text-foreground', emoji: '🛡️' },
  { ring: 'ring-emerald-400/80 dark:ring-emerald-600/60', bar: 'from-emerald-700 to-teal-700', soft: 'bg-emerald-500/30', text: 'text-foreground', emoji: '🌿' },
  { ring: 'ring-violet-400/80 dark:ring-violet-600/60', bar: 'from-violet-700 to-fuchsia-700', soft: 'bg-violet-500/30', text: 'text-foreground', emoji: '✨' },
  { ring: 'ring-amber-400/80 dark:ring-amber-600/60', bar: 'from-amber-700 to-orange-700', soft: 'bg-amber-500/30', text: 'text-foreground', emoji: '🔆' },
  { ring: 'ring-rose-400/80 dark:ring-rose-600/60', bar: 'from-rose-700 to-pink-700', soft: 'bg-rose-500/30', text: 'text-foreground', emoji: '💗' },
  { ring: 'ring-cyan-400/80 dark:ring-cyan-600/60', bar: 'from-cyan-700 to-sky-700', soft: 'bg-cyan-500/30', text: 'text-foreground', emoji: '💧' },
  { ring: 'ring-indigo-400/80 dark:ring-indigo-600/60', bar: 'from-indigo-700 to-violet-700', soft: 'bg-indigo-500/30', text: 'text-foreground', emoji: '🪄' },
  { ring: 'ring-lime-400/80 dark:ring-lime-600/60', bar: 'from-lime-700 to-green-700', soft: 'bg-lime-500/30', text: 'text-foreground', emoji: '🌱' },
];

function paletteFor(resource: string) {
  let h = 0;
  for (let i = 0; i < resource.length; i += 1) {
    const next = h * 31 + resource.charCodeAt(i);
    h = next % 0x1_0000_0000;
    if (h < 0) h += 0x1_0000_0000;
  }
  return RESOURCE_PALETTE[h % RESOURCE_PALETTE.length];
}

function actionStyle(name: string): { chip: string; icon: string } {
  const action = (name.split('.')[1] || '').toLowerCase();
  if (action.includes('view') || action.includes('read') || action.includes('list') || action.includes('show'))
    return { chip: 'border-sky-700 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-white', icon: 'solar:eye-bold' };
  if (action.includes('create') || action.includes('add') || action.includes('store'))
    return { chip: 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-white', icon: 'solar:add-circle-bold' };
  if (action.includes('update') || action.includes('edit'))
    return { chip: 'border-amber-700 bg-amber-700 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-white', icon: 'solar:pen-bold' };
  if (action.includes('delete') || action.includes('destroy') || action.includes('remove'))
    return { chip: 'border-rose-700 bg-rose-700 text-white dark:border-rose-500 dark:bg-rose-500 dark:text-white', icon: 'solar:trash-bin-trash-bold' };
  return { chip: 'border-violet-700 bg-violet-700 text-white dark:border-violet-500 dark:bg-violet-500 dark:text-white', icon: 'solar:bolt-bold' };
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roleResponse, isLoading, error } = useFetchRoleById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !roleResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.roleLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.roleLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/role')}>
            {t('form.backToRoles')}
          </Button>
        </Box>
      </Box>
    );
  }

  const role = roleResponse.data;

  // Group permissions by resource
  const groupedPermissions: Record<string, typeof role.permissions> = {};
  if (role.permissions && Array.isArray(role.permissions)) {
    role.permissions.forEach((permission) => {
      const [resource] = permission.name.split('.');
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      groupedPermissions[resource].push(permission);
    });
  }

  const permCount = role.permissions?.length ?? 0;

  return (
    <>
      <title>{t('form.roleDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen w-full overflow-hidden bg-background">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-muted/40" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </Box>

        <Box className="relative w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Button
            variant="text"
            onClick={() => navigate('/role')}
            className="mb-5 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
            {t('form.backToRoles')}
          </Button>

          {/* Hero — full width */}
          <Box className="relative mb-8 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg backdrop-blur-sm">
            <Box className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/[0.06] to-transparent" />
            <Box className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
            <Box className="pointer-events-none absolute right-1/4 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

            <Box className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8 lg:p-10">
              <Box className="flex min-w-0 flex-1 items-start gap-4 md:gap-6">
                <Box className="relative shrink-0">
                  <Box className="absolute inset-0 rounded-2xl bg-primary/25 blur-lg" />
                  <Box className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 shadow-sm md:h-24 md:w-24">
                    <Iconify icon="solar:user-id-bold" className="text-primary" width={40} height={40} />
                  </Box>
                </Box>
                <Box className="min-w-0 flex-1 space-y-2">
                  <Box className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t('form.role', { defaultValue: 'Role' })}
                    </span>
                    <span aria-hidden className="text-base">👋</span>
                  </Box>
                  <Typography
                    variant="h4"
                    className="break-words font-bold capitalize text-foreground md:text-3xl"
                  >
                    {role.name}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground max-w-2xl">
                    {t('form.roleDetailsSubtitle')}
                  </Typography>
                  <Box className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                      <Iconify icon="solar:shield-check-bold" width={14} className="text-primary" />
                      {role.guard_name}
                    </span>
                    {role.id != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                        <Iconify icon="solar:hashtag-bold" width={14} className="text-primary" />
                        {role.id}
                      </span>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <Box className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                  <Box className="rounded-xl border border-border/50 bg-background/70 px-4 py-3 text-center backdrop-blur">
                    <Typography variant="h5" className="font-bold text-primary">
                      {permCount}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.rolePermissionsSection')}
                    </Typography>
                  </Box>
                  <Box className="rounded-xl border border-border/50 bg-background/70 px-4 py-3 text-center backdrop-blur">
                    <Typography
                      variant="caption"
                      className="line-clamp-2 font-medium leading-snug text-foreground"
                    >
                      {role.created_at}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('columns.createdAt')}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/role/update/${id}`)}
                  className="h-11 gap-2 self-stretch sm:self-auto md:self-stretch lg:self-auto"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('form.editRole')}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Two columns — metadata + permissions grid */}
          <Box className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
            <Box className="space-y-4 xl:col-span-4">
              <Typography variant="subtitle2" className="flex items-center gap-2 font-semibold">
                <Iconify icon="solar:info-circle-bold" width={18} className="text-primary" />
                {t('form.roleBasicInformationSection')}
              </Typography>
              <Box className="space-y-3">
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('columns.roleName')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:user-id-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="font-semibold capitalize text-foreground">
                      {role.name}
                    </Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('columns.guard')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:shield-check-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="text-foreground">{role.guard_name}</Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                  <Typography variant="caption" className="font-medium text-muted-foreground">
                    {t('columns.createdAt')}
                  </Typography>
                  <Box className="mt-1 flex items-center gap-2">
                    <Iconify icon="solar:calendar-date-bold" className="text-primary" width={18} />
                    <Typography variant="body1" className="text-foreground">{role.created_at}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className="min-w-0 xl:col-span-8">
              <Typography variant="subtitle2" className="mb-4 flex flex-wrap items-center gap-2 font-semibold">
                <Iconify icon="solar:lock-password-bold" width={18} className="text-primary" />
                {t('form.rolePermissionsSection')}
                {role.permissions && Array.isArray(role.permissions) && (
                  <Typography variant="caption" className="font-normal text-muted-foreground">
                    {t('form.roleDetailsPermissionsCount', { count: role.permissions.length })}
                  </Typography>
                )}
              </Typography>

              {role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const palette = paletteFor(resource);
                    return (
                      <Box
                        key={resource}
                        className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur-sm ring-1 ${palette.ring} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
                      >
                        <Box
                          className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.bar}`}
                        />
                        <Box className="mb-3 flex items-center justify-between gap-3">
                          <Box className="flex min-w-0 items-center gap-2">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${palette.soft} text-base`}
                              aria-hidden
                            >
                              {palette.emoji}
                            </span>
                            <Typography
                              variant="subtitle2"
                              className={`truncate font-semibold capitalize ${palette.text}`}
                            >
                              {translatePermissionResource(resource, t)}
                            </Typography>
                          </Box>
                          <span className="shrink-0 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {(perms ?? []).length}
                          </span>
                        </Box>
                        <Box className="flex flex-wrap gap-1.5">
                          {(perms ?? []).map((permission) => {
                            const a = actionStyle(permission.name);
                            return (
                              <span
                                key={permission.id}
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium ${a.chip}`}
                              >
                                <Iconify icon={a.icon} width={12} />
                                {translatePermissionName(permission.name, t)}
                              </span>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box className="rounded-xl border border-dashed border-border py-14 text-center">
                  <Iconify
                    icon="solar:lock-password-outline"
                    className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50"
                  />
                  <Typography variant="body2" className="text-muted-foreground">
                    {t('noPermissions')}
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

