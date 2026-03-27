import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchCouponById } from '@/pages/dashboard/coupons/hooks/coupon';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: couponResponse, isLoading, error } = useFetchCouponById(id || '');

  const coupon = couponResponse?.data;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !coupon) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              {t('form.couponLoadErrorTitle')}
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : t('form.couponLoadErrorFallback')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/coupons')}>
            {t('form.backToCoupons')}
          </Button>
        </Box>
      </Box>
    );
  }

  const discountText =
    coupon.discount?.type === 'percentage'
      ? `${coupon.discount?.value ?? 0}%`
      : t('form.couponDiscountFixed', { value: coupon.discount?.value ?? 0 });

  const nameStr = typeof coupon.name === 'object' && coupon.name !== null
    ? (coupon.name as { en?: string; ar?: string }).en ?? (coupon.name as any)?.ar ?? '-'
    : String(coupon.name ?? '-');

  return (
    <>
      <title>{t('form.couponDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/coupons')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              {t('form.backToCoupons')}
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:tag-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {nameStr}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  <code className="px-1.5 py-0.5 rounded bg-muted">{coupon.code}</code>
                  {' · '}
                  {discountText}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/coupons/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                {t('edit')}
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                {t('form.couponInformationSection')}
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.code')}
                  </Typography>
                  <Typography variant="body1" className="font-medium font-mono">
                    {coupon.code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.discount')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {discountText}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.start')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {coupon.start_at
                      ? new Date(coupon.start_at).toLocaleString()
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.end')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {coupon.end_at
                      ? new Date(coupon.end_at).toLocaleString()
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('form.couponUsedMax')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {coupon.used_count ?? 0} / {coupon.max_uses ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t('columns.status')}
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.is_expired
                          ? 'bg-muted text-muted-foreground'
                          : coupon.is_active
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                      }`}
                    >
                      {coupon.is_expired
                        ? t('expired')
                        : coupon.is_active
                          ? t('active')
                          : t('inactive')}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {(coupon.products?.length > 0 ||
              coupon.vendors?.length > 0 ||
              coupon.categories?.length > 0) && (
              <>
                <Separator />
                <Box className="p-6">
                  {coupon.products?.length > 0 && (
                    <Box className="mb-4">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        {t('form.couponTypeProducts')}
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {coupon.products.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            {formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
                              t('form.productFallbackLabel', { id: p.id })}
                          </span>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {coupon.vendors?.length > 0 && (
                    <Box className="mb-4">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        {t('form.couponTypeVendors')}
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {coupon.vendors.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            {formatTranslated(v.name as Parameters<typeof formatTranslated>[0]) ||
                              t('form.vendorFallbackLabel', { id: v.id })}
                          </span>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {coupon.categories?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        {t('tableNames.category')}
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {coupon.categories.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            {formatTranslated(c.name as Parameters<typeof formatTranslated>[0]) ||
                              t('form.categoryFallbackLabel', { id: c.id })}
                          </span>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
