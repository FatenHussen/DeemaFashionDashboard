import type { PromotionType } from '@/pages/dashboard/promotions/types/promotion.types';

import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchPromotionById } from '@/pages/dashboard/promotions/hooks/promotion';
import {
  PROMOTION_TYPE_COLORS,
  PROMOTION_TYPE_LABEL_KEYS,
} from '@/pages/dashboard/promotions/utils/promotion-fields';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Box>
      <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-1">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

function giftDescriptionText(raw: unknown, lang: 'en' | 'ar'): string | null {
  if (raw && typeof raw === 'object') {
    const value = (raw as { en?: unknown; ar?: unknown })[lang];
    return typeof value === 'string' && value.trim() ? value : null;
  }
  if (typeof raw === 'string' && raw.trim()) return raw;
  return null;
}

export default function DetailsPage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading } = useFetchPromotionById(id || '');

  const promotionTypeLabel = (type: string) => {
    const key = PROMOTION_TYPE_LABEL_KEYS[type as PromotionType];
    return key ? t(key) : type;
  };

  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (!item) return (
    <Box className="flex items-center justify-center min-h-[400px]">
      <Typography variant="h6" className="text-destructive">{t('noData')}</Typography>
    </Box>
  );

  const pageSlugs: string[] = Array.isArray(item.page_slugs) ? item.page_slugs : [];
  const isPoints = item.type === 'spend_x_get_points';
  const pointsValue = item.reward_points ?? item.discount_value;
  const giftEn = giftDescriptionText(item.gift_description, 'en');
  const giftAr = giftDescriptionText(item.gift_description, 'ar');

  return (
    <>
      <title>{t('form.promotionDetailsDocumentTitle', { appName: CONFIG.appName })}</title>
      <Box className="w-full p-6">
        <Button variant="text" onClick={() => navigate('/promotions')} className="mb-4">
          <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
          {t('form.backToPromotions')}
        </Button>

        <Box className="flex items-start justify-between mb-6">
          <Box>
            <Typography variant="h5" className="font-bold">{item.name?.en}</Typography>
            <Typography variant="body2" className="text-muted-foreground">{item.description?.en}</Typography>
          </Box>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${PROMOTION_TYPE_COLORS[item.type] ?? 'bg-muted text-muted-foreground'}`}>
            {promotionTypeLabel(item.type)}
          </span>
        </Box>

        <Box className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-6">
            <DetailRow label={t('form.nameEn')} value={item.name?.en} />
            <DetailRow label={t('form.nameAr')} value={item.name?.ar} />
            <DetailRow label={t('form.descriptionEn')} value={item.description?.en} />
            <DetailRow label={t('form.descriptionAr')} value={item.description?.ar} />
            <DetailRow label={t('columns.status')} value={
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                {item.is_active ? t('active') : t('inactive')}
              </span>
            } />
            <DetailRow label={t('form.startAt')} value={item.starts_at} />
            <DetailRow label={t('form.endAt')} value={item.ends_at} />
            {!isPoints && item.discount_value != null && (
              <DetailRow
                label={t('form.discountValueLabel')}
                value={`${item.discount_value}${item.discount_type === 'percentage' ? '%' : ''}`}
              />
            )}
            {isPoints && pointsValue != null && (
              <DetailRow label={t('form.pointsAmountLabel')} value={pointsValue} />
            )}
            {item.min_spend != null && <DetailRow label={t('form.minSpendLabel')} value={item.min_spend} />}
            <DetailRow label={t('form.giftDescriptionEn')} value={giftEn} />
            <DetailRow label={t('form.giftDescriptionAr')} value={giftAr} />
            {item.buy_quantity != null && <DetailRow label={t('form.buyQuantityLabel')} value={item.buy_quantity} />}
            {item.get_quantity != null && <DetailRow label={t('form.getQuantityLabel')} value={item.get_quantity} />}
            {item.gift_product_ids != null && item.gift_product_ids.length > 0 && (
              <DetailRow
                label={t('form.giftProductIdsLabel')}
                value={t('form.giftProductIdsCount', { count: item.gift_product_ids.length })}
              />
            )}
            <DetailRow
              label={t('form.positionLabel')}
              value={
                item.position === 'top'
                  ? t('form.promotionPositionTop')
                  : item.position === 'bottom'
                    ? t('form.promotionPositionBottom')
                    : item.position != null
                      ? String(item.position)
                      : null
              }
            />
            <Box className="col-span-2">
              <Typography variant="body2" className="text-muted-foreground text-xs uppercase mb-2">
                {t('form.pageSlugsLabel')}
              </Typography>
              {pageSlugs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pageSlugs.map((slug) => (
                    <span
                      key={slug}
                      className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium"
                    >
                      {slug}
                    </span>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" className="text-muted-foreground italic">
                  {t('form.pageSlugsGlobal')}
                </Typography>
              )}
            </Box>
          </div>
        </Box>

        <Box className="flex gap-3 mt-6">
          <Button onClick={() => navigate(`/promotions/update/${id}`)}>
            <Iconify icon="solar:pen-bold" width={16} className="mr-2" />
            {t('editDetails')}
          </Button>
        </Box>
      </Box>
    </>
  );
}
