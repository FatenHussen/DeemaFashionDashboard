import type { ExportFormat } from '../api/report.services';

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useLocalizationStore } from 'src/store/useLocalizationStore';

import { _ReportApi } from '../api/report.services';
import { ReportExportButtons } from '../components/report-export-buttons';

// ----------------------------------------------------------------------

const tableContainerClass =
  'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

export default function ReportsIndexPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('table');
  const { direction } = useLocalizationStore();

  useEffect(() => {
    document.title = `${t('reports.browserIndex')} | ${CONFIG.appName}`;
  }, [t, i18n.language]);

  const reportCards = useMemo(
    () =>
      [
        {
          title: t('reports.cardSalesTitle'),
          description: t('reports.cardSalesDesc'),
          icon: 'solar:cart-large-2-bold',
          path: `${paths.dashboard.reports}/sales`,
          exportReport: (format: ExportFormat) =>
            _ReportApi.exportSalesReport(format, undefined),
        },
        {
          title: t('reports.cardProductMovementTitle'),
          description: t('reports.cardProductMovementDesc'),
          icon: 'solar:box-bold',
          path: `${paths.dashboard.reports}/product-movement`,
          exportReport: (format: ExportFormat) =>
            _ReportApi.exportProductMovementReport(format, undefined),
        },
        {
          title: t('reports.cardVendorTitle'),
          description: t('reports.cardVendorDesc'),
          icon: 'solar:shop-2-bold',
          path: `${paths.dashboard.reports}/vendor-performance`,
        },
        {
          title: t('reports.cardDriverTitle'),
          description: t('reports.cardDriverDesc'),
          icon: 'solar:delivery-bold',
          path: `${paths.dashboard.reports}/driver-performance`,
        },
        {
          title: t('reports.cardSalesByLocationTitle'),
          description: t('reports.cardSalesByLocationDesc'),
          icon: 'solar:map-point-bold',
          path: `${paths.dashboard.reports}/sales-by-location`,
        },
        {
          title: t('reports.cardSalesByCategoryTitle'),
          description: t('reports.cardSalesByCategoryDesc'),
          icon: 'solar:widget-5-bold',
          path: `${paths.dashboard.reports}/sales-by-category`,
        },
      ] as const satisfies ReadonlyArray<{
        title: string;
        description: string;
        icon: string;
        path: string;
        exportReport?: (format: ExportFormat) => Promise<void>;
      }>,
    [t, i18n.language]
  );

  return (
    <div className="flex w-full flex-col" dir={direction}>
      <div
        className="mx-6 mt-4 mb-4 flex w-full min-w-0 flex-wrap items-center justify-start gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 text-start shadow-sm"
      >
        <Box className="flex min-w-0 max-w-full items-center gap-3">
          <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Iconify icon="solar:document-bold" className="text-primary" width={22} height={22} />
          </Box>
          <Box className="min-w-0">
            <Typography variant="h6" className="font-semibold">
              {t('reports.pageTitle')}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('reports.pageSubtitle')}
            </Typography>
          </Box>
        </Box>
      </div>

      <div className="w-full space-y-4 transition-opacity duration-500 p-6">
        <Box className="grid gap-4 sm:grid-cols-2">
          {reportCards.map((report) => (
            <Box
              key={report.path}
              onClick={() => navigate(report.path)}
              className={`${tableContainerClass} p-5 cursor-pointer hover:border-primary/40 transition-all`}
            >
              <Box className="flex items-start gap-4">
                <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Iconify icon={report.icon} className="text-primary" width={20} height={20} />
                </Box>
                <Box className="flex-1 min-w-0">
                  <Typography variant="subtitle1" className="font-semibold mb-1">
                    {report.title}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {report.description}
                  </Typography>
                  <Box className="mt-3 flex flex-col gap-2 border-t border-border/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Typography
                      variant="caption"
                      className="text-primary inline-flex items-center gap-1 font-medium"
                    >
                      {t('reports.viewReport')}
                      <Iconify icon="solar:arrow-right-bold" width={14} className="rtl:rotate-180" />
                    </Typography>
                    {'exportReport' in report && report.exportReport ? (
                      <Box
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-wrap gap-2"
                      >
                        <ReportExportButtons onExport={report.exportReport} />
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </div>
    </div>
  );
}
