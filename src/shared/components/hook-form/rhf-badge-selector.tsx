import type { BadgeItem } from '@/pages/dashboard/badges/types/badge.types';

import { Badge } from '@/shared/ui/badge';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/shared/ui/checkbox';
import { Iconify } from '@/shared/components/iconify';
import { Box, Tab, Tabs, Typography } from '@/shared/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { formatTranslated } from '@/utils/format-translated';

import { useLocalizationStore } from 'src/store/useLocalizationStore';
import { _BadgeApi } from 'src/pages/dashboard/badges/api/badge.services';

/** API often sends MUI-style tokens; CSS backgroundColor only accepts real colors. */
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

function toggleBadgeSelection(
  selectedBadges: BadgeWithPosition[],
  badgeId: number,
  tabPosition: 'top' | 'bottom',
  checked: boolean
): BadgeWithPosition[] {
  if (checked) {
    const existing = selectedBadges.find((b) => b.id === badgeId);
    if (existing) {
      if (existing.position === tabPosition) return selectedBadges;
      return selectedBadges.map((b) =>
        b.id === badgeId ? { ...b, position: tabPosition } : b
      );
    }
    return [...selectedBadges, { id: badgeId, position: tabPosition }];
  }
  return selectedBadges.filter((b) => !(b.id === badgeId && b.position === tabPosition));
}

function resolveBadgeBackgroundHex(color: string | undefined | null): string {
  const raw = (color ?? '').trim();
  if (!raw) return SEMANTIC_BADGE_HEX.default;
  const lower = raw.toLowerCase();
  if (lower.startsWith('#')) return raw;
  if (lower.startsWith('rgb')) return raw;
  return SEMANTIC_BADGE_HEX[lower] ?? SEMANTIC_BADGE_HEX.default;
}

// Badge with position
export interface BadgeWithPosition {
  id: number;
  position: 'top' | 'bottom';
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
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);
  const [badgeTab, setBadgeTab] = useState<'top' | 'bottom'>('top');

  useEffect(() => {
    const loadBadges = async () => {
      setIsLoadingBadges(true);
      try {
        const response = await _BadgeApi.getListBadges({ per_page: 100 });
        const raw = response.data as { items?: BadgeItem[] } | BadgeItem[];
        const items = Array.isArray(raw) ? raw : raw?.items ?? [];
        setAllBadges(items);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setIsLoadingBadges(false);
      }
    };

    loadBadges();
  }, [uiLanguage]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedBadges = field.value || [];
        return (
        <Box className="space-y-4">
          {label && (
            <Typography variant="body2" className="font-semibold text-foreground">
              {label}
            </Typography>
          )}

          {isLoadingBadges ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('loading')}
            </Typography>
          ) : allBadges.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noBadgesAvailable')}
            </Typography>
          ) : (
            <Box className="space-y-4">
              <Tabs
                value={badgeTab}
                onChange={(v) => setBadgeTab(v as 'top' | 'bottom')}
                className="w-full"
              >
                <Tab value="top" label={t('form.badgePositionTop')} />
                <Tab value="bottom" label={t('form.badgePositionBottom')} />
              </Tabs>

              <Box className="space-y-3">
                {allBadges.map((badge) => {
                  const isSelectedForTab = selectedBadges.some(
                    (b: BadgeWithPosition) => b.id === badge.id && b.position === badgeTab
                  );
                  const bgHex = resolveBadgeBackgroundHex(badge.color);

                  return (
                    <Box
                      key={badge.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={isSelectedForTab}
                        onChange={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          field.onChange(
                            toggleBadgeSelection(selectedBadges, badge.id, badgeTab, checked)
                          );
                        }}
                        className="mt-1"
                      />

                      <Box className="flex-1 min-w-0">
                        <Box className="flex items-center gap-2 mb-1">
                          <Badge
                            color="default"
                            className="rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: bgHex,
                              color: getContrastColor(bgHex),
                            }}
                          >
                            {formatTranslated(badge.name as Parameters<typeof formatTranslated>[0])}
                          </Badge>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {helperText && (
            <Typography variant="caption" className="text-muted-foreground">
              {helperText}
            </Typography>
          )}

          {selectedBadges.length > 0 && (
            <Box className="pt-2 border-t border-border">
              <Typography variant="caption" className="text-muted-foreground block mb-2">
                {t('selected')}: {selectedBadges.length}
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {selectedBadges.map((badge: BadgeWithPosition) => {
                  const badgeData = allBadges.find((b) => b.id === badge.id);
                  if (!badgeData) return null;

                  const summaryBg = resolveBadgeBackgroundHex(badgeData.color);

                  return (
                    <Box key={badge.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                      <Badge
                        color="default"
                        className="rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: summaryBg,
                          color: getContrastColor(summaryBg),
                        }}
                      >
                        {formatTranslated(badgeData.name as Parameters<typeof formatTranslated>[0])}
                      </Badge>
                      <span className="text-muted-foreground">
                        (
                        {badge.position === 'top'
                          ? t('form.badgePositionShortTop')
                          : t('form.badgePositionShortBottom')}
                        )
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(selectedBadges.filter((b: BadgeWithPosition) => b.id !== badge.id));
                        }}
                        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Iconify icon="solar:close-bold" width={12} height={12} />
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

// Helper function to determine text color based on background (expects #rrggbb or rgb())
function getContrastColor(cssColor: string): string {
  const raw = cssColor.trim();
  if (raw.toLowerCase().startsWith('rgb')) {
    const m = raw.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3) {
      const r = Number(m[0]);
      const g = Number(m[1]);
      const b = Number(m[2]);
      if (!Number.isNaN(r + g + b)) {
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
      }
    }
    return '#000000';
  }
  const hex = raw.replace('#', '');
  if (hex.length < 6) return '#000000';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#000000';
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
