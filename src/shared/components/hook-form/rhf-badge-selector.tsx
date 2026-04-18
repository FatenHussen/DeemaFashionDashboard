import type { BadgeItem } from '@/pages/dashboard/badges/types/badge.types';

import { Badge } from '@/shared/ui/badge';
import { Box, Typography } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { Controller, useFormContext } from 'react-hook-form';
import { formatTranslated } from '@/utils/format-translated';

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
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');

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
  const visibleBadges = activeTab === 'top' ? topBadges : bottomBadges;

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
              <>
                {/* ── Tab bar ───────────────────────────────── */}
                <Box className="flex rounded-xl bg-muted/60 p-1 gap-1">
                  {(['top', 'bottom'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    const count = tab === 'top' ? selectedTopCount : selectedBottomCount;
                    const total = tab === 'top' ? topBadges.length : bottomBadges.length;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Iconify
                          icon={tab === 'top' ? 'solar:arrow-to-top-left-bold-duotone' : 'solar:arrow-to-down-right-bold-duotone'}
                          width={18}
                          className={isActive ? (tab === 'top' ? 'text-blue-500' : 'text-amber-500') : ''}
                        />
                        <span>{tab === 'top' ? t('form.badgePositionTop') : t('form.badgePositionBottom')}</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {count}/{total}
                        </span>
                      </button>
                    );
                  })}
                </Box>

                {/* ── Helper hint ────────────────────────────── */}
                <Box className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  activeTab === 'top'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                }`}>
                  <Iconify
                    icon={activeTab === 'top' ? 'solar:info-circle-bold' : 'solar:layers-bold'}
                    width={15}
                  />
                  <span>
                    {activeTab === 'top'
                      ? t('form.badgeTopSelectOne')
                      : t('form.badgeBottomSelectMany')}
                  </span>
                </Box>

                {/* ── Badge grid ─────────────────────────────── */}
                {visibleBadges.length === 0 ? (
                  <Box className="py-6 text-center text-sm text-muted-foreground">
                    {t('form.noBadgesAvailable')}
                  </Box>
                ) : (
                  <Box className="grid gap-2 sm:grid-cols-2">
                    {visibleBadges.map((badge) => {
                      const isSelected = selectedIds.includes(badge.id);
                      const bgHex = resolveBgHex(badge.color);

                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => handleToggle(badge)}
                          className={`group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border bg-background hover:border-primary/30 hover:bg-muted/40'
                          }`}
                        >
                          {/* Badge visual */}
                          {badge.image ? (
                            <Box className="shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-border/60 shadow-sm relative">
                              <img src={badge.image} alt="" className="w-full h-full object-cover" />
                              {isSelected && (
                                <Box className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                  <Iconify icon="solar:check-circle-bold" width={18} className="text-white drop-shadow" />
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Box
                              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: bgHex }}
                            >
                              {isSelected ? (
                                <Iconify icon="solar:check-circle-bold" width={18} style={{ color: contrastColor(bgHex) }} />
                              ) : (
                                <Box
                                  className="w-3 h-3 rounded-full opacity-60"
                                  style={{ backgroundColor: contrastColor(bgHex) }}
                                />
                              )}
                            </Box>
                          )}

                          {/* Name */}
                          <Box className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-foreground truncate">
                              {formatTranslated(badge.name as Parameters<typeof formatTranslated>[0]) || '—'}
                            </span>
                            {badge.color && (
                              <span className="text-[10px] text-muted-foreground font-mono">{badge.color}</span>
                            )}
                          </Box>

                          {/* Selection indicator */}
                          {activeTab === 'top' ? (
                            <Box className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30 group-hover:border-primary/50'
                            }`}>
                              {isSelected && (
                                <Box className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </Box>
                          ) : (
                            <Box className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30 group-hover:border-primary/50'
                            }`}>
                              {isSelected && (
                                <Iconify icon="solar:check-read-linear" width={13} className="text-white" />
                              )}
                            </Box>
                          )}
                        </button>
                      );
                    })}
                  </Box>
                )}
              </>
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
