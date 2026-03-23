import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { _BadgeApi } from 'src/pages/dashboard/badges/api/badge.services';
import type { BadgeItem } from '@/pages/dashboard/badges/types/badge.types';
import { Iconify } from '@/shared/components/iconify';

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
  const { control } = useFormContext();
  const [allBadges, setAllBadges] = useState<BadgeItem[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const response = await _BadgeApi.getListBadges({ per_page: 100 });
        setAllBadges(response.data.items);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setIsLoadingBadges(false);
      }
    };

    loadBadges();
  }, []);

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
              {t('loading')}...
            </Typography>
          ) : allBadges.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No badges available
            </Typography>
          ) : (
            <Box className="space-y-3">
              {allBadges.map((badge) => {
                const isSelected = selectedBadges.some((b: BadgeWithPosition) => b.id === badge.id);
                const selectedBadge = selectedBadges.find((b: BadgeWithPosition) => b.id === badge.id);

                return (
                  <Box
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([
                            ...selectedBadges,
                            { id: badge.id, position: 'top' as const },
                          ]);
                        } else {
                          field.onChange(
                            selectedBadges.filter((b: BadgeWithPosition) => b.id !== badge.id)
                          );
                        }
                      }}
                      className="mt-1"
                    />

                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-center gap-2 mb-1">
                        <Badge
                          color="default"
                          style={{
                            backgroundColor: badge.color,
                            color: getContrastColor(badge.color),
                          }}
                        >
                          {typeof badge.name === 'string' ? badge.name : badge.name.en}
                        </Badge>
                      </Box>
                    </Box>

                    {isSelected && (
                      <Box className="flex items-center gap-2">
                        <select
                          value={selectedBadge?.position || 'top'}
                          onChange={(e) => {
                            const newValue = selectedBadges.map((b: BadgeWithPosition) =>
                              b.id === badge.id ? { ...b, position: e.target.value as 'top' | 'bottom' } : b
                            );
                            field.onChange(newValue);
                          }}
                          className="h-8 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </Box>
                    )}
                  </Box>
                );
              })}
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

                  return (
                    <Box key={badge.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                      <Badge
                        color="default"
                        style={{
                          backgroundColor: badgeData.color,
                          color: getContrastColor(badgeData.color),
                          fontSize: '11px',
                        }}
                      >
                        {typeof badgeData.name === 'string' ? badgeData.name : badgeData.name.en}
                      </Badge>
                      <span className="text-muted-foreground">({badge.position})</span>
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

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
