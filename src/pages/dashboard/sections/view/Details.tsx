import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchSectionDetails } from '@/pages/dashboard/sections/hooks/useSections';
import { sectionTypeLabel } from '@/pages/dashboard/sections/utils/section-type-label';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

function resolveItemImageUrl(src: unknown): string | null {
  if (src == null || typeof src !== 'string') return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  const path = s.replace(/^\//, '');
  return base ? `${base}/${path}` : s;
}

const ITEM_DYNAMIC_EXCLUDED_KEYS = new Set([
  'id',
  'desc',
  'price',
  'is_favorite',
  'top_badges',
  'bottom_badges',
  'is_on_offer',
  'next_delivery_date',
  'image',
  'image_url',
  'thumbnail',
]);

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sectionResponse, isLoading, error } = useFetchSectionDetails(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !sectionResponse?.data) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.errorLoadingSlider')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.failedToLoadSliderInfo')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/sections')}>
            {t('form.backToSliders')}
          </Button>
        </Box>
      </Box>
    );
  }

  const section = sectionResponse.data;

  return (
    <>
      <title>{t('form.sliderDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        {/* Subtle background gradient */}
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        {/* Refined grid overlay */}
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/sections')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('form.backToSliders')}
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:list-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {formatTranslated(section.name)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.sliderDetailsHeading')}
                </Typography>
              </Box>
              {section.type !== 'api' && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/sections/update/${id}`)}
                  className="gap-2"
                >
                  <Iconify icon="solar:pen-bold" width={18} />
                  {t('form.editSection')}
                </Button>
              )}
            </Box>
          </Box>

          {/* Details Card */}
          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              {/* Basic Information */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  {t('form.sectionDetailsBasicInfo')}
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.name && typeof section.name === 'object' && !Array.isArray(section.name) ? (
                    <>
                      <Box className="space-y-2">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                          {t('form.sliderNameLabel')} (EN)
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Iconify icon="solar:list-bold" className="text-primary" width={18} />
                          <Typography variant="body1" className="font-semibold text-foreground">
                            {(section.name as any).en || '-'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="space-y-2">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                          {t('form.sliderNameLabel')} (AR)
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Iconify icon="solar:list-bold" className="text-primary" width={18} />
                          <Typography variant="body1" className="font-semibold text-foreground">
                            {(section.name as any).ar || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('form.sliderNameLabel')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:list-bold" className="text-primary" width={18} />
                        <Typography variant="body1" className="font-semibold text-foreground">
                          {formatTranslated(section.name)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      {t('typeLabel', { ns: 'common' })}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <div
                        className={`text-xs px-2 py-1 rounded-full w-fit ${
                          section.type === 'api'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}
                      >
                        {sectionTypeLabel(t, section.type)}
                      </div>
                    </Box>
                  </Box>

                  {section.id && (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('form.sliderIdLabel')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{section.id}</span>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {section.manual?.manual_model && (
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('form.manualModelLabel')}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Iconify icon="solar:settings-bold" className="text-primary" width={18} />
                        <Typography variant="body1" className="text-foreground">
                          {section.manual.manual_model}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>


              <Separator />

              {/* Items */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:checklist-bold" width={20} />
                  {t('form.sectionItemsHeading')}
                  {section.items && Array.isArray(section.items) && (
                    <Typography variant="body2" className="text-muted-foreground font-normal ml-2">
                      {t('form.sectionItemsCount', { count: section.items.length })}
                    </Typography>
                  )}
                </Typography>

                {section.items && Array.isArray(section.items) && section.items.length > 0 ? (
                  <Box className="space-y-3">
                    {section.items.map((item, index) => {
                      const imageSrc = resolveItemImageUrl(
                        item.image ?? item.image_url ?? item.thumbnail
                      );
                      const imageAlt =
                        typeof item.title === 'string'
                          ? item.title
                          : typeof item.name === 'string'
                            ? item.name
                            : t('form.sectionItemAltFallback', { id: item.id });

                      return (
                      <Box
                        key={item.id || index}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Box className="space-y-1">
                            <Typography variant="body2" className="text-muted-foreground text-xs">
                              {t('form.sectionItemIdLabel')}
                            </Typography>
                            <Typography variant="body1" className="font-semibold text-foreground">
                              {item.id}
                            </Typography>
                          </Box>
                          {imageSrc && (
                            <Box className="space-y-1 md:col-span-2">
                              <Typography variant="body2" className="text-muted-foreground text-xs">
                                {t('form.sectionItemImageLabel')}
                              </Typography>
                              <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="max-h-48 max-w-full rounded-lg border border-border/50 object-contain bg-muted/20"
                              />
                            </Box>
                          )}
                          {item.desc && (
                            <Box className="space-y-1">
                              <Typography variant="body2" className="text-muted-foreground text-xs">
                                {t('form.sectionItemDescriptionLabel')}
                              </Typography>
                              <Typography variant="body1" className="text-foreground">
                                {item.desc}
                              </Typography>
                            </Box>
                          )}
                          {item.price !== undefined && (
                            <Box className="space-y-1">
                              <Typography variant="body2" className="text-muted-foreground text-xs">
                                {t('form.sectionItemPriceLabel')}
                              </Typography>
                              <Typography variant="body1" className="text-foreground">
                                {item.price}
                              </Typography>
                            </Box>
                          )}
                          {/* Display any other properties */}
                          {Object.entries(item).map(([key, value]) => {
                            if (ITEM_DYNAMIC_EXCLUDED_KEYS.has(key)) {
                              return null;
                            }
                            const fieldKey = `form.itemField_${key}`;
                            const translated = t(fieldKey);
                            const label = translated !== fieldKey ? translated : key.replace(/_/g, ' ');
                            return (
                              <Box key={key} className="space-y-1">
                                <Typography
                                  variant="body2"
                                  className="text-muted-foreground text-xs capitalize"
                                >
                                  {label}
                                </Typography>
                                <Typography variant="body1" className="text-foreground break-all">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                    })}
                  </Box>
                ) : (
                  <Box className="text-center py-8">
                    <Iconify
                      icon="solar:checklist-bold"
                      className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('common.noItems')}
                    </Typography>
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
