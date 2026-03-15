import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchPageSectionDetails } from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Page Section Details | Dashboard - ${CONFIG.appName}` };

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="space-y-1">
      <Typography variant="body2" className="text-muted-foreground font-medium">
        {label}
      </Typography>
      <Typography variant="body1" className="text-foreground">
        {value ?? 'N/A'}
      </Typography>
    </Box>
  );
}

export default function PageSectionDetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pageSectionResponse, isLoading, error } = useFetchPageSectionDetails(id || '');

  const pageSection = pageSectionResponse?.data;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !pageSection) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Page Section
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load page section information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/sections/page-sections')}>
            Back to Page Sections
          </Button>
        </Box>
      </Box>
    );
  }

  const nameStr = formatTranslated(
    pageSection.name as Parameters<typeof formatTranslated>[0]
  );

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/sections/page-sections')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Page Sections
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:gallery-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {nameStr || `Page Section #${pageSection.id}`}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  ID: {pageSection.id}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/sections/page-sections/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Page Section Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <DetailRow label={t('columns.id')} value={pageSection.id} />
                <DetailRow label={t('columns.name')} value={nameStr} />
                <DetailRow
                  label={t('columns.position')}
                  value={
                    (pageSection as any).position ? (
                      <span
                        className={`text-xs px-2 py-1 rounded-full uppercase ${
                          (pageSection as any).position === 'before'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {(pageSection as any).position}
                      </span>
                    ) : (
                      'N/A'
                    )
                  }
                />
                <DetailRow label={t('columns.order')} value={(pageSection as any).order} />
                <DetailRow label={t('form.displayTypeId')} value={(pageSection as any).display_type_id} />
                <DetailRow label={t('form.backgroundColor')} value={(pageSection as any).background_color} />
                <DetailRow
                  label={t('form.backgroundCardColor')}
                  value={
                    (pageSection as any).background_card_color ??
                    (pageSection as any).background_crad_color
                  }
                />
                {(pageSection as any).filters != null && (
                  <Box className="sm:col-span-2">
                    <DetailRow
                      label={t('form.filters')}
                      value={
                        <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-40">
                          {JSON.stringify((pageSection as any).filters, null, 2)}
                        </pre>
                      }
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
