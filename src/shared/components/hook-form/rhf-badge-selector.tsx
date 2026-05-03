import type { BadgeItem } from '@/pages/dashboard/badges/types/badge.types';

import { Badge } from '@/shared/ui/badge';
import { Box, Typography } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { Controller, useFormContext } from 'react-hook-form';
import { formatTranslated } from '@/utils/format-translated';
import { useMemo, Fragment, useState, useEffect } from 'react';

import { useLocalizationStore } from 'src/store/useLocalizationStore';
import { _BadgeApi } from 'src/pages/dashboard/badges/api/badge.services';

const SEMANTIC_BADGE_HEX: Record<string, string> = {
  success: '#16a34a',
  warning: '#ca8a04',
  danger: '#dc2626',
  error: '#dc2626',
  info: '#2563eb',
  primary: '#2563eb',
  secondary: '#52525b',
  default: '#71717a',
};

function resolveBgHex(color: string | undefined | null): string {
  const raw = (color ?? '').trim();
  if (!raw) return SEMANTIC_BADGE_HEX.default;
  const lower = raw.toLowerCase();
  if (lower.startsWith('#') || lower.startsWith('rgb')) return raw;
  return SEMANTIC_BADGE_HEX[lower] ?? SEMANTIC_BADGE_HEX.default;
}

function contrastColor(cssColor: string): string {
  const raw = cssColor.trim();
  let r = 0, g = 0, b = 0;

  if (raw.toLowerCase().startsWith('rgb')) {
    const m = raw.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
  } else {
    const hex = raw.replace('#', '');
    if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  if (Number.isNaN(r + g + b)) return '#000000';
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
}

interface RHFBadgeSelectorProps {
  name: string;
  label?: string;
  helperText?: string;
}

export function RHFBadgeSelector({ name, label, helperText }: RHFBadgeSelectorProps) {
  const { t } = useTranslation('table');
  const uiLanguage = useLocalizationStore((s) => s.language);
  const { control } = useFormContext();
  const [allBadges, setAllBadges] = useState<BadgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await _BadgeApi.getListBadges({ per_page: 100 });
        const raw = res.data as { items?: BadgeItem[] } | BadgeItem[];
        setAllBadges(Array.isArray(raw) ? raw : raw?.items ?? []);
      } catch (e) {
        console.error('Failed to load badges:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [uiLanguage]);

  const topBadges = useMemo(() => allBadges.filter((b) => b.position === 'top'), [allBadges]);
  const bottomBadges = useMemo(() => allBadges.filter((b) => b.position === 'bottom'), [allBadges]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedIds: number[] = field.value || [];

        const topIds = allBadges.filter((b) => b.position === 'top');
        const selectedTopCount = selectedIds.filter((id) => topIds.some((b) => b.id === id)).length;
        const selectedBottomCount = selectedIds.filter((id) => bottomBadges.some((b) => b.id === id)).length;

        function handleToggle(badge: BadgeItem) {
          const isSelected = selectedIds.includes(badge.id);

          if (badge.position === 'top') {
            const otherTopIds = topIds.map((b) => b.id);
            const withoutOtherTops = selectedIds.filter((id) => !otherTopIds.includes(id));
            field.onChange(isSelected ? withoutOtherTops : [...withoutOtherTops, badge.id]);
          } else {
            field.onChange(
              isSelected
                ? selectedIds.filter((id) => id !== badge.id)
                : [...selectedIds, badge.id]
            );
          }
        }

        function renderBadgeRow(badge: BadgeItem, isTopPosition: boolean) {
          const isSelected = selectedIds.includes(badge.id);
          const bgHex = resolveBgHex(badge.color);

          return (
            <button
              type="button"
              onClick={() => handleToggle(badge)}
              className={`group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                  : 'border-border bg-background hover:border-primary/35 hover:bg-muted/45'
              }`}
            >
              {badge.image ? (
                <Box className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-sm">
                  <img src={badge.image} alt="" className="h-full w-full object-cover" />
                  {isSelected && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-primary/35">
                      <Iconify icon="solar:check-circle-bold" width={20} className="text-white drop-shadow-md" />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ backgroundColor: bgHex }}
                >
                  {isSelected ? (
                    <Iconify icon="solar:check-circle-bold" width={20} style={{ color: contrastColor(bgHex) }} />
                  ) : (
                    <Box className="h-3 w-3 rounded-full opacity-70" style={{ backgroundColor: contrastColor(bgHex) }} />
                  )}
                </Box>
              )}

              <Box className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {formatTranslated(badge.name as Parameters<typeof formatTranslated>[0]) || '—'}
                </span>
                {badge.color && (
                  <span className="font-mono text-[10px] text-muted-foreground">{badge.color}</span>
                )}
              </Box>

              {isTopPosition ? (
                <Box
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/35 group-hover:border-primary/55'
                  }`}
                >
                  {isSelected && <Box className="h-2 w-2 rounded-full bg-white" />}
                </Box>
              ) : (
                <Box
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/35 group-hover:border-primary/55'
                  }`}
                >
                  {isSelected && <Iconify icon="solar:check-read-linear" width={13} className="text-white" />}
                </Box>
              )}
            </button>
          );
        }

        return (
          <Box className="space-y-4">
            {label && (
              <Typography variant="body2" className="font-semibold text-foreground">
                {label}
              </Typography>
            )}

            {isLoading ? (
              <Box className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
                <Iconify icon="svg-spinners:ring-resize" width={20} />
                <span className="text-sm">{t('loading')}</span>
              </Box>
            ) : allBadges.length === 0 ? (
              <Box className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Iconify icon="solar:medal-ribbons-star-line-duotone" width={36} className="opacity-40" />
                <span className="text-sm">{t('form.noBadgesAvailable')}</span>
              </Box>
            ) : (
              <Box className="flex flex-col gap-6">
                {/* Upper badges — single selection */}
                <Box className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-sm dark:bg-card/25">
                  <Box className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-sky-500/[0.08] via-transparent to-transparent px-4 py-3.5 sm:px-5 dark:from-sky-500/12">
                    <Box className="flex min-w-0 items-center gap-3">
                      <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/15">
                        <Iconify
                          icon="solar:arrow-to-top-left-bold-duotone"
                          width={22}
                          className="text-sky-600 dark:text-sky-400"
                        />
                      </Box>
                      <Box className="min-w-0">
                        <Typography variant="subtitle2" className="font-semibold leading-tight text-foreground">
                          {t('form.badgePositionTop')}
                        </Typography>
                        <Typography variant="caption" className="mt-0.5 block text-muted-foreground">
                          {t('form.badgeTopSelectOne')}
                        </Typography>
                      </Box>
                    </Box>
                    <span className="shrink-0 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold tabular-nums text-muted-foreground shadow-sm">
                      {selectedTopCount}/{topBadges.length}
                    </span>
                  </Box>
                  <Box className="p-4 sm:p-5">
                    {topBadges.length === 0 ? (
                      <Box className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                        <Iconify icon="solar:widget-2-line-duotone" width={34} className="opacity-35" />
                        <span className="text-sm">{t('form.noBadgesAvailable')}</span>
                      </Box>
                    ) : (
                      <Box className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {topBadges.map((badge) => (
                          <Fragment key={badge.id}>{renderBadgeRow(badge, true)}</Fragment>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Lower badges — multiple selection */}
                <Box className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-sm dark:bg-card/25">
                  <Box className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-transparent px-4 py-3.5 sm:px-5 dark:from-amber-500/12">
                    <Box className="flex min-w-0 items-center gap-3">
                      <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/15">
                        <Iconify
                          icon="solar:arrow-to-down-right-bold-duotone"
                          width={22}
                          className="text-amber-600 dark:text-amber-400"
                        />
                      </Box>
                      <Box className="min-w-0">
                        <Typography variant="subtitle2" className="font-semibold leading-tight text-foreground">
                          {t('form.badgePositionBottom')}
                        </Typography>
                        <Typography variant="caption" className="mt-0.5 block text-muted-foreground">
                          {t('form.badgeBottomSelectMany')}
                        </Typography>
                      </Box>
                    </Box>
                    <span className="shrink-0 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold tabular-nums text-muted-foreground shadow-sm">
                      {selectedBottomCount}/{bottomBadges.length}
                    </span>
                  </Box>
                  <Box className="p-4 sm:p-5">
                    {bottomBadges.length === 0 ? (
                      <Box className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                        <Iconify icon="solar:widget-2-line-duotone" width={34} className="opacity-35" />
                        <span className="text-sm">{t('form.noBadgesAvailable')}</span>
                      </Box>
                    ) : (
                      <Box className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {bottomBadges.map((badge) => (
                          <Fragment key={badge.id}>{renderBadgeRow(badge, false)}</Fragment>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {helperText && (
              <Typography variant="caption" className="text-muted-foreground">
                {helperText}
              </Typography>
            )}

            {/* ── Selected summary chips ─────────────────── */}
            {selectedIds.length > 0 && (
              <Box className="pt-3 border-t border-border/60">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:medal-ribbons-star-bold-duotone" width={16} className="text-primary" />
                  <Typography variant="caption" className="text-muted-foreground font-medium">
                    {t('selected')} ({selectedIds.length})
                  </Typography>
                </Box>
                <Box className="flex flex-wrap gap-1.5">
                  {selectedIds.map((badgeId: number) => {
                    const bd = allBadges.find((b) => b.id === badgeId);
                    if (!bd) return null;
                    const bg = resolveBgHex(bd.color);
                    const isTop = bd.position === 'top';

                    return (
                      <Box
                        key={badgeId}
                        className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 bg-muted/80 border border-border/50"
                      >
                        <Badge
                          color="default"
                          className="rounded-full px-1.5 py-0 text-[10px] font-semibold leading-4"
                          style={{ backgroundColor: bg, color: contrastColor(bg) }}
                        >
                          {formatTranslated(bd.name as Parameters<typeof formatTranslated>[0])}
                        </Badge>
                        <span className={`text-[9px] font-medium ${
                          isTop
                            ? 'text-blue-500 dark:text-blue-400'
                            : 'text-amber-500 dark:text-amber-400'
                        }`}>
                          {isTop ? t('form.badgePositionShortTop') : t('form.badgePositionShortBottom')}
                        </span>
                        <button
                          type="button"
                          onClick={() => field.onChange(selectedIds.filter((id: number) => id !== badgeId))}
                          className="text-muted-foreground/60 hover:text-destructive transition-colors"
                        >
                          <Iconify icon="solar:close-circle-bold" width={14} />
                        </button>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
}
