import { useNavigate } from 'react-router';
import { Box, Typography } from '@/shared/ui';
import { Iconify } from '@/shared/components/iconify';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Reports | Dashboard - ${CONFIG.appName}` };

const tableContainerClass =
  'w-full border border-border/30 bg-background overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300';

const REPORTS = [
  {
    title: 'Sales Report',
    description: 'Total orders, revenue, delivery fees, and discounts',
    icon: 'solar:cart-large-2-bold',
    path: paths.dashboard.reports + '/sales',
  },
  {
    title: 'Product Movement',
    description: 'Top/least selling products and inactive products',
    icon: 'solar:box-bold',
    path: paths.dashboard.reports + '/product-movement',
  },
  {
    title: 'Vendor Performance',
    description: 'Vendor sales, orders, rating, and satisfaction',
    icon: 'solar:shop-2-bold',
    path: paths.dashboard.reports + '/vendor-performance',
  },
  {
    title: 'Driver Performance',
    description: 'Driver orders, earnings, delivery time, ratings',
    icon: 'solar:delivery-bold',
    path: paths.dashboard.reports + '/driver-performance',
  },
  {
    title: 'Sales by Location',
    description: 'Revenue by governorate and city',
    icon: 'solar:map-point-bold',
    path: paths.dashboard.reports + '/sales-by-location',
  },
  {
    title: 'Sales by Category',
    description: 'Revenue and quantity by product category',
    icon: 'solar:widget-5-bold',
    path: paths.dashboard.reports + '/sales-by-category',
  },
];

export default function ReportsIndexPage() {
  const navigate = useNavigate();

  return (
    <>
      <title>{metadata.title}</title>
      <div className="flex w-full flex-col">
        <div className="mx-6 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 shadow-sm rtl:flex-row-reverse">
          <Box className="flex items-center gap-3">
            <Box className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Iconify icon="solar:document-bold" className="text-primary" width={22} height={22} />
            </Box>
            <Box>
              <Typography variant="h6" className="font-semibold">
                Reports
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                View and export reports with date filters
              </Typography>
            </Box>
          </Box>
        </div>

        <div className="w-full space-y-4 transition-opacity duration-500 p-6">
          <Box className="grid gap-4 sm:grid-cols-2">
            {REPORTS.map((report) => (
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
                    <Typography variant="caption" className="text-primary mt-2 inline-flex items-center gap-1 font-medium">
                      View report
                      <Iconify icon="solar:arrow-right-bold" width={14} />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </div>
      </div>
    </>
  );
}
