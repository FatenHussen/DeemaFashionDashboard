import type { ReactNode } from 'react';
import type { BadgeItem } from '@/pages/dashboard/badges/types/badge.types';

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
  let r = 0;
  let g = 0;
  let b = 0;

  if (raw.toLowerCase().startsWith('rgb')) {
    const m = raw.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3) {
      r = +m[0];
      g = +m[1];
      b = +m[2];
    }
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

function badgeDisplayName(badge: BadgeItem): string {
  return formatTranslated(badge.name as Parameters<typeof formatTranslated>[0]) || '—';
}

function BadgeArtwork({
  badge,
  isSelected,
  bgHex,
}: {
  badge: BadgeItem;
  isSelected: boolean;
  bgHex: string;
}) {
  const [broken, setBroken] = useState(false);
  const name = badgeDisplayName(badge);
  const initial = name.replace(/[—-]/g, '').trim().charAt(0) || '•';
  const showImage = Boolean(badge.image) && !broken;
  const fg = contrastColor(bgHex);

  return (
    <Box className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/30">
      {showImage ? (
        <img
          src={badge.image ?? ''}
          alt=""
          className="h-full w-full object-contain p-1"
          onError={() => setBroken(true)}
        />
      ) : (
        <Box
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: bgHex }}
        >
          <span className="text-sm font-semibold leading-none" style={{ color: fg }}>
            {initial}
          </span>
        </Box>
      )}
      {isSelected ? (
        <Box className="absolute inset-0 flex items-center justify-center bg-foreground/35">
          <Iconify icon="solar:check-circle-bold" width={18} className="text-white drop-shadow" />
        </Box>
      ) : null}
    </Box>
  );
}

function SelectionMark({ selected, multiple }: { selected: boolean; multiple: boolean }) {
  return (
    <Box
      className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${
        multiple ? 'rounded-md' : 'rounded-full'
      } ${
        selected
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/30 bg-background group-hover:border-primary/50'
      }`}
      aria-hidden
    >
      {selected ? (
        multiple ? (
          <Iconify icon="solar:check-read-linear" width={12} className="text-primary-foreground" />
        ) : (
          <Box className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )
      ) : null}
    </Box>
  );
}

function PositionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Box className="mb-3">
        <Typography variant="subtitle2" className="font-semibold leading-none text-foreground">
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function EmptyBadgesState({ message }: { message: string }) {
  return (
    <Box className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-muted-foreground">
      <Iconify icon="solar:medal-ribbons-star-line-duotone" width={28} className="opacity-40" />
      <span className="text-sm">{message}</span>
    </Box>
  );
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
        setAllBadges(Array.isArray(raw) ? raw : (raw?.items ?? []));
      } catch (e) {
        console.error('Failed to load badges:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [uiLanguage]);

  const topBadges = useMemo(() => allBadges.filter((b) => b.position === 'top'), [allBadges]);
  const bottomBadges = useMemo(
    () => allBadges.filter((b) => b.position === 'bottom'),
    [allBadges]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedIds: number[] = field.value || [];
        const topIds = topBadges.map((b) => b.id);

        function handleToggle(badge: BadgeItem) {
          const isSelected = selectedIds.includes(badge.id);

          if (badge.position === 'top') {
            const withoutOtherTops = selectedIds.filter((id) => !topIds.includes(id));
            field.onChange(isSelected ? withoutOtherTops : [...withoutOtherTops, badge.id]);
            return;
          }

          field.onChange(
            isSelected
              ? selectedIds.filter((id) => id !== badge.id)
              : [...selectedIds, badge.id]
          );
        }

        function renderBadgeRow(badge: BadgeItem, multiple: boolean) {
          const isSelected = selectedIds.includes(badge.id);
          const bgHex = resolveBgHex(badge.color);

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => handleToggle(badge)}
              aria-pressed={isSelected}
              className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/[0.07] shadow-sm'
                  : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <BadgeArtwork badge={badge} isSelected={isSelected} bgHex={bgHex} />

              <Box className="min-w-0 flex-1">
                <Box className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: bgHex }}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {badgeDisplayName(badge)}
                  </span>
                </Box>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {multiple ? t('form.badgeChoiceMultiple') : t('form.badgeChoiceSingle')}
                </span>
              </Box>

              <SelectionMark selected={isSelected} multiple={multiple} />
            </button>
          );
        }

        return (
          <Box className="space-y-5">
            {label ? (
              <Typography variant="body2" className="font-semibold text-foreground">
                {label}
              </Typography>
            ) : null}

            {helperText ? (
              <Typography
                variant="caption"
                className={`block text-muted-foreground ${label ? '-mt-3' : ''}`}
              >
                {helperText}
              </Typography>
            ) : null}

            {isLoading ? (
              <Box className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Box
                    key={i}
                    className="h-[68px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
                  />
                ))}
              </Box>
            ) : allBadges.length === 0 ? (
              <EmptyBadgesState message={t('form.noBadgesAvailable')} />
            ) : (
              <Box className="space-y-6">
                <PositionGroup title={t('form.badgePositionTop')}>
                  {topBadges.length === 0 ? (
                    <EmptyBadgesState message={t('form.noBadgesAvailable')} />
                  ) : (
                    <Box className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {topBadges.map((badge) => renderBadgeRow(badge, false))}
                    </Box>
                  )}
                </PositionGroup>

                <Box className="border-t border-border/60 pt-6">
                  <PositionGroup title={t('form.badgePositionBottom')}>
                    {bottomBadges.length === 0 ? (
                      <EmptyBadgesState message={t('form.noBadgesAvailable')} />
                    ) : (
                      <Box className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {bottomBadges.map((badge) => renderBadgeRow(badge, true))}
                      </Box>
                    )}
                  </PositionGroup>
                </Box>
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
}
