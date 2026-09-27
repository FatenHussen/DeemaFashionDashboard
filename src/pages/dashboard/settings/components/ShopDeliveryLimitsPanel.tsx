import type { FormEvent } from 'react';
import type { ShopData, ShopDeliveryLimitsPayload } from '@/pages/dashboard/vendor/types/shop.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { _ShopApi } from '@/pages/dashboard/vendor/api/shop.services';
import { useUpdateShopDeliveryLimits } from '@/pages/dashboard/vendor/hooks/shop';
import {
  isPlatformDefaultShop,
  normalizeShopTypeFromApi,
} from '@/pages/dashboard/vendor/types/shop.types';

import { Button } from 'src/shared/ui/button';
import { SimpleSelect } from 'src/shared/ui/select';
import { Box, Input, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

async function fetchDeliveryLimitShops(): Promise<ShopData[]> {
  const collected: ShopData[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await _ShopApi.getListShop({ page, per_page: 100 });
    collected.push(...(response.data?.items ?? []));
    lastPage = response.data?.pagination?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage && page <= 20);

  return collected.filter((shop) => {
    if (isPlatformDefaultShop(shop)) return false;
    const type = normalizeShopTypeFromApi(shop);
    return type === 'store' || type === 'restaurant';
  });
}

function metricText(value: unknown): string {
  if (value == null || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : '';
}

function metricNumber(value: unknown): number | null {
  const text = metricText(value);
  if (!text) return null;
  return Number(text);
}

function parseOptionalNonNegative(
  raw: string
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

// ----------------------------------------------------------------------

export function ShopDeliveryLimitsPanel() {
  const { t } = useTranslation('table');
  const updateLimits = useUpdateShopDeliveryLimits();
  const { data: shops = [], isLoading, isError } = useQuery({
    queryKey: ['shop', 'delivery-limits-picker'],
    queryFn: fetchDeliveryLimitShops,
  });

  const [search, setSearch] = useState('');
  const [shopId, setShopId] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [minHours, setMinHours] = useState('');
  const [maxHours, setMaxHours] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return shops;
    return shops.filter((shop) => formatTranslated(shop.name, '').toLowerCase().includes(query));
  }, [shops, search]);

  const selected = shops.find((shop) => String(shop.id) === shopId) ?? null;
  const selectedSignature = selected
    ? `${selected.id}:${metricText(selected.min_order_amount)}:${metricText(selected.delivery_min_hours)}:${metricText(selected.delivery_max_hours)}`
    : '';

  useEffect(() => {
    if (!selected) {
      setMinOrder('');
      setMinHours('');
      setMaxHours('');
      setError(null);
      return;
    }
    setMinOrder(metricText(selected.min_order_amount));
    setMinHours(metricText(selected.delivery_min_hours));
    setMaxHours(metricText(selected.delivery_max_hours));
    setError(null);
    // Hydrate when the chosen shop or its saved limits change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSignature]);

  const optionShops = useMemo(() => {
    if (!selected || filtered.some((shop) => shop.id === selected.id)) return filtered;
    return [selected, ...filtered];
  }, [filtered, selected]);

  const options = optionShops.map((shop) => {
    const type = normalizeShopTypeFromApi(shop);
    const typeLabel =
      type === 'restaurant' ? t('form.shopTypeRestaurant') : t('form.shopTypeStore');
    return {
      value: String(shop.id),
      label: `${formatTranslated(shop.name)} — ${typeLabel}`,
    };
  });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selected || isPlatformDefaultShop(selected)) {
      setError(t('form.deliveryShopLimitsPickFirst'));
      return;
    }
    if (normalizeShopTypeFromApi(selected) === 'service_provider') {
      setError(t('form.deliveryShopLimitsPickFirst'));
      return;
    }

    const nextMinOrder = parseOptionalNonNegative(minOrder);
    const nextMinHours = parseOptionalNonNegative(minHours);
    const nextMaxHours = parseOptionalNonNegative(maxHours);

    if (!nextMinOrder.ok) {
      setError(t('form.deliverySettingsInvalidMinOrder'));
      return;
    }
    if (!nextMinHours.ok || !nextMaxHours.ok) {
      setError(t('form.deliverySettingsInvalidHours'));
      return;
    }

    const storedMin = metricNumber(selected.delivery_min_hours);
    const storedMax = metricNumber(selected.delivery_max_hours);

    if (
      nextMinHours.value != null &&
      nextMaxHours.value != null &&
      nextMaxHours.value < nextMinHours.value
    ) {
      setError(t('form.deliverySettingsMaxBeforeMin'));
      return;
    }

    const payload: ShopDeliveryLimitsPayload = {};
    if (nextMinOrder.value !== metricNumber(selected.min_order_amount)) {
      payload.min_order_amount = nextMinOrder.value;
    }
    if (nextMinHours.value !== storedMin) payload.delivery_min_hours = nextMinHours.value;
    if (nextMaxHours.value !== storedMax) payload.delivery_max_hours = nextMaxHours.value;

    if (Object.keys(payload).length === 0) {
      toast.info(t('form.deliverySettingsNoChanges'));
      return;
    }

    try {
      await updateLimits.mutateAsync({ id: selected.id, data: payload });
      toast.success(t('form.deliveryShopLimitsSaveSuccess'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('form.settingsUpdateFailed')));
    }
  };

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-4">
      <Box>
        <Typography variant="h6" className="font-semibold">
          {t('form.deliveryShopLimitsTitle')}
        </Typography>
        <Typography variant="body2" className="mt-1 text-muted-foreground">
          {t('form.deliveryShopLimitsHint')}
        </Typography>
      </Box>

      {isLoading ? (
        <Typography variant="body2" className="text-muted-foreground">
          {t('loading')}
        </Typography>
      ) : null}

      {isError ? (
        <Box className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <Typography variant="body2" className="text-destructive">
            {t('form.deliveryShopLimitsFailed')}
          </Typography>
        </Box>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Box className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Input
              type="search"
              value={search}
              placeholder={t('form.deliveryShopLimitsSearch')}
              onChange={(event) => setSearch(event.target.value)}
            />
            <SimpleSelect
              fullWidth
              label={t('form.deliveryShopLimitsSelect')}
              value={shopId}
              placeholder={t('form.deliveryShopLimitsPlaceholder')}
              options={options}
              onChange={(value) => setShopId(String(value))}
              disabled={options.length === 0 && !shopId}
            />
          </Box>

          {shops.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.deliveryShopLimitsEmpty')}
            </Typography>
          ) : null}

          {filtered.length === 0 && shops.length > 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.deliveryShopLimitsEmpty')}
            </Typography>
          ) : null}

          <Box className="grid gap-4 lg:grid-cols-3">
            <LimitField
              label={t('form.shopMinOrderAmount')}
              hint={t('form.shopMinOrderAmountHelper')}
              value={minOrder}
              disabled={!selected || updateLimits.isPending}
              onChange={setMinOrder}
            />
            <LimitField
              label={t('form.shopDeliveryMinHours')}
              hint={t('form.shopDeliveryHoursHelper')}
              value={minHours}
              disabled={!selected || updateLimits.isPending}
              onChange={setMinHours}
            />
            <LimitField
              label={t('form.shopDeliveryMaxHours')}
              hint={t('form.shopDeliveryMaxHelper')}
              value={maxHours}
              disabled={!selected || updateLimits.isPending}
              onChange={setMaxHours}
            />
          </Box>

          {error ? (
            <Typography variant="body2" className="text-destructive">
              {error}
            </Typography>
          ) : null}

          <Box className="flex justify-end border-t border-border/60 pt-4">
            <Button
              type="submit"
              variant="contained"
              disabled={!selected || updateLimits.isPending}
              className="min-w-[160px]"
            >
              {updateLimits.isPending ? t('updating') : t('form.saveChanges')}
            </Button>
          </Box>
        </>
      ) : null}
    </form>
  );
}

function LimitField({
  label,
  hint,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Box className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <Typography variant="subtitle2" className="font-semibold">
        {label}
      </Typography>
      <Input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-sm"
      />
      <Typography variant="caption" className="block text-muted-foreground">
        {hint}
      </Typography>
    </Box>
  );
}
