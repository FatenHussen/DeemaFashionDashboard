import type { LocalizedField } from '@/pages/dashboard/recipes/types/recipe.types';

import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { useFetchRecipeById } from '@/pages/dashboard/recipes/hooks/recipe';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = CONFIG.serverUrl.replace(/\/$/, '');
  return `${base}/${String(path).replace(/^\//, '')}`;
}

function formatStepField(field: LocalizedField | undefined): string {
  if (field == null) return '—';
  return formatTranslated(field as Parameters<typeof formatTranslated>[0]);
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchRecipeById(id || '');
  const item = response?.data;
  const { can } = usePermissions();
  const canUpdate = can('recipe.update');

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-lg">
          <Typography variant="h6" className="mb-2 text-destructive">
            {t('form.recipeDetailLoadErrorTitle')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/recipes')}>
            {t('form.recipeDetailBack')}
          </Button>
        </Box>
      </Box>
    );
  }

  const nameStr = formatTranslated(item.name);
  const descStr = item.description ? formatTranslated(item.description) : '';
  const imageSrc = resolveMediaUrl(item.image);

  return (
    <>
      <title>{`${nameStr} | ${CONFIG.appName}`}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative mx-auto max-w-4xl">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/recipes')}
              className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> {t('form.recipeDetailBack')}
            </Button>

            <Box className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm">
              {imageSrc ? (
                <img src={imageSrc} alt="" className="h-48 w-full object-cover md:h-64" />
              ) : (
                <Box className="flex h-48 items-center justify-center bg-muted/40 md:h-64">
                  <Iconify icon="solar:gallery-bold" width={48} className="text-muted-foreground" />
                </Box>
              )}
            </Box>

            <Box className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <Box className="flex flex-1 items-start gap-4">
                <Box className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Iconify icon="solar:chef-hat-bold" className="text-primary" width={32} height={32} />
                </Box>
                <Box>
                  <Typography variant="h4" className="mb-1 font-bold text-foreground">
                    {nameStr}
                  </Typography>
                  {descStr ? (
                    <Typography variant="body2" className="text-muted-foreground">
                      {descStr}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
              {canUpdate && id ? (
                <Button variant="contained" onClick={() => navigate(`/recipes/update/${id}`)} className="gap-2 shrink-0">
                  <Iconify icon="solar:pen-bold" width={18} /> {t('editDetails')}
                </Button>
              ) : null}
            </Box>

            {item.video_url ? (
              <Box className="mt-4">
                <Typography variant="caption" className="text-muted-foreground">
                  {t('form.videoUrl')}
                </Typography>
                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {item.video_url}
                </a>
              </Box>
            ) : null}
          </Box>

          <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <Box className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">
                {t('form.recipeDetailSummary')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.rating')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.rating != null ? `${item.rating} ★` : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.orders')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.orders_count ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.discount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.discount != null && item.discount !== '' ? String(item.discount) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.recipePrepareTime')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.prepare_time || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.recipeServes')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.serves != null && item.serves !== '' ? String(item.serves) : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.createdAt')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {item.totals ? (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.recipePricingTotals')}
                </Typography>
                <Box className="grid gap-4 sm:grid-cols-3">
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.recipeTotalBeforeDiscount')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.totals.total_before_discount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.recipeTotalAfterDiscount')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.totals.total_after_discount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.recipeDiscountValue')}
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {item.totals.discount_value}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : null}

          {item.steps && item.steps.length > 0 ? (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.recipeStepsSectionTitle')}
                </Typography>
                <Box className="space-y-3">
                  {item.steps.map((step) => (
                    <Box key={step.step_number} className="rounded-lg border border-border/40 p-4">
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.recipeStepNumber', { number: step.step_number })}
                      </Typography>
                      <Typography variant="body1" className="mt-1">
                        {formatStepField(step.instruction)}
                      </Typography>
                      <Box className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {t('form.recipeTimeLabel')}: {formatStepField(step.time_minutes)}
                        </span>
                        <span>
                          {t('form.recipeHeatLevelLabel')}: {formatStepField(step.heat_level)}
                        </span>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}

          {item.items && item.items.length > 0 ? (
            <Box className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  {t('form.recipeItemsSectionTitle')}
                </Typography>
                <Box className="space-y-6">
                  {item.items.map((recipeItem, idx) => (
                    <Box
                      key={`${recipeItem.main_item?.shop_product_variant_id ?? idx}-${idx}`}
                      className="rounded-xl border border-border/50 bg-background/60 p-4"
                    >
                      <Box className="flex flex-wrap items-start justify-between gap-2">
                        <Box>
                          <Typography variant="subtitle1" className="font-semibold text-foreground">
                            {recipeItem.main_item?.name ?? '—'}
                          </Typography>
                          {recipeItem.main_item?.variant?.length ? (
                            <Typography variant="caption" className="text-muted-foreground">
                              {recipeItem.main_item.variant.join(' · ')}
                            </Typography>
                          ) : null}
                        </Box>
                        <Typography variant="body2" className="font-medium">
                          {recipeItem.main_item?.price_formatted != null
                            ? recipeItem.main_item.price_formatted
                            : recipeItem.main_item?.price != null
                              ? String(recipeItem.main_item.price)
                              : '—'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="mt-2 block text-muted-foreground">
                        {t('form.recipeItemTerms')}: {t('form.recipeDefaultQty')}{' '}
                        {recipeItem.terms?.default_quantity ?? '—'} · {t('form.recipeMinQty')}{' '}
                        {recipeItem.terms?.min_quantity ?? '—'} · {t('form.recipeMaxQty')}{' '}
                        {recipeItem.terms?.max_quantity ?? '—'} ·{' '}
                        {recipeItem.terms?.is_required ? t('form.recipeRequiredToggle') : t('form.recipeNotRequired')}
                        {recipeItem.terms?.switchable_category_id != null
                          ? ` · ${t('form.recipeSwitchableCategoryOptional')} #${recipeItem.terms.switchable_category_id}`
                          : ''}
                      </Typography>
                      {recipeItem.alternatives && recipeItem.alternatives.length > 0 ? (
                        <Box className="mt-3 border-t border-border/40 pt-3">
                          <Typography variant="caption" className="mb-2 block font-medium text-muted-foreground">
                            {t('form.recipeAlternatives')}
                          </Typography>
                          <Box className="space-y-2">
                            {recipeItem.alternatives.map((alt) => (
                              <Box
                                key={alt.shop_product_variant_id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span>
                                  {alt.name}
                                  {alt.variant?.length ? ` (${alt.variant.join(', ')})` : ''}
                                </span>
                                <span className="text-muted-foreground">
                                  {alt.price_formatted ?? alt.price}
                                </span>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ) : null}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
}
