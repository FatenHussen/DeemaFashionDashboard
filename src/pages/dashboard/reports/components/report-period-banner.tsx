import { useMemo } from 'react';
import { Box, Typography } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { type UiLang, fDateLocalized } from '@/utils/format-time';

// ----------------------------------------------------------------------

type ReportPeriodBannerProps = {
  appliedFrom: string;
  appliedTo: string;
  lang: UiLang;
};

export function ReportPeriodBanner({ appliedFrom, appliedTo, lang }: ReportPeriodBannerProps) {
  const { t } = useTranslation('table');

  const rangeLabel = useMemo(() => {
    const fmt = (d?: string) => {
      const s = d?.trim();
      if (!s) return '';
      return fDateLocalized(s, lang);
    };
    const from = fmt(appliedFrom);
    const to = fmt(appliedTo);
    if (from && to) return t('reports.rangeBoth', { from, to });
    if (from) return t('reports.rangeFromOnly', { from });
    if (to) return t('reports.rangeToOnly', { to });
    return t('reports.rangeAll');
  }, [appliedFrom, appliedTo, t, lang]);

  return (
    <Box className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/[0.06] via-card to-card px-5 py-4 shadow-sm">
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box className="flex items-center gap-2">
          <Iconify icon="solar:calendar-bold" className="text-primary" width={18} />
          <Typography variant="subtitle2" className="font-semibold text-foreground">
            {t('reports.reportPeriod')}
          </Typography>
        </Box>
        <Typography variant="body2" className="font-semibold text-foreground tabular-nums">
          {rangeLabel}
        </Typography>
      </Box>
    </Box>
  );
}
