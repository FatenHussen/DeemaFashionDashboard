import type { FormEvent } from 'react';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { _SettingApi } from '@/pages/dashboard/settings/api/setting.services';
import { useFetchSettingsGroup } from '@/pages/dashboard/settings/hooks/setting';

import { Button } from 'src/shared/ui/button';
import { Box, Input, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export const DELIVERY_SETTING_KEYS = [
  'tikmart_min_order_amount',
  'tikmart_delivery_min_hours',
  'tikmart_delivery_max_hours',
] as const;

export type DeliverySettingKey = (typeof DELIVERY_SETTING_KEYS)[number];

const DELIVERY_SETTING_DEFAULTS: Record<DeliverySettingKey, string> = {
  tikmart_min_order_amount: '0',
  tikmart_delivery_min_hours: '24',
  tikmart_delivery_max_hours: '48',
};

function collectDeliveryValues(payload: unknown): Map<string, string> {
  const into = new Map<string, string>();
  walk(payload, into, 0);
  return into;
}

function walk(node: unknown, into: Map<string, string>, depth: number) {
  if (depth > 5 || node == null) return;
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, into, depth + 1));
    return;
  }
  if (typeof node !== 'object') return;

  const record = node as Record<string, unknown>;
  if (typeof record.key === 'string' && 'value' in record) {
    into.set(record.key, record.value == null ? '' : String(record.value));
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === 'status' || key === 'message' || key === 'pagination') continue;
    if ((DELIVERY_SETTING_KEYS as readonly string[]).includes(key)) {
      if (value && typeof value === 'object' && 'value' in (value as object)) {
        const nested = (value as { value: unknown }).value;
        into.set(key, nested == null ? '' : String(nested));
      } else if (
        value == null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        into.set(key, value == null ? '' : String(value));
      }
      continue;
    }
    if (key === 'data' || key === 'items' || key === 'settings' || key === 'group') {
      walk(value, into, depth + 1);
    }
  }
}

function parseNonNegative(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function settingText(map: Map<string, string>, key: DeliverySettingKey): string {
  const raw = map.get(key);
  if (raw == null || raw.trim() === '') return DELIVERY_SETTING_DEFAULTS[key];
  return raw.trim();
}

// ----------------------------------------------------------------------

export function DeliverySettingsPanel() {
  const { t } = useTranslation('table');
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useFetchSettingsGroup('delivery');
  const [saving, setSaving] = useState(false);
  const [minOrder, setMinOrder] = useState(DELIVERY_SETTING_DEFAULTS.tikmart_min_order_amount);
  const [minHours, setMinHours] = useState(DELIVERY_SETTING_DEFAULTS.tikmart_delivery_min_hours);
  const [maxHours, setMaxHours] = useState(DELIVERY_SETTING_DEFAULTS.tikmart_delivery_max_hours);
  const [error, setError] = useState<string | null>(null);

  const serverValues = useMemo(() => collectDeliveryValues(data), [data]);
  const serverSignature = DELIVERY_SETTING_KEYS.map(
    (key) => `${key}:${serverValues.get(key) ?? ''}`
  ).join('|');

  useEffect(() => {
    if (!data) return;
    setMinOrder(settingText(serverValues, 'tikmart_min_order_amount'));
    setMinHours(settingText(serverValues, 'tikmart_delivery_min_hours'));
    setMaxHours(settingText(serverValues, 'tikmart_delivery_max_hours'));
    setError(null);
    // Hydrate only when the group payload changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSignature]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const nextMinOrder = parseNonNegative(minOrder);
    const nextMinHours = parseNonNegative(minHours);
    const nextMaxHours = parseNonNegative(maxHours);

    if (nextMinOrder == null) {
      setError(t('form.deliverySettingsInvalidMinOrder'));
      return;
    }
    if (nextMinHours == null || nextMaxHours == null) {
      setError(t('form.deliverySettingsInvalidHours'));
      return;
    }
    if (nextMaxHours < nextMinHours) {
      setError(t('form.deliverySettingsMaxBeforeMin'));
      return;
    }

    const next: Record<DeliverySettingKey, string> = {
      tikmart_min_order_amount: String(nextMinOrder),
      tikmart_delivery_min_hours: String(nextMinHours),
      tikmart_delivery_max_hours: String(nextMaxHours),
    };

    const changed = DELIVERY_SETTING_KEYS.filter((key) => {
      const current = settingText(serverValues, key);
      return String(parseNonNegative(current) ?? current) !== next[key];
    });

    if (changed.length === 0) {
      toast.info(t('form.deliverySettingsNoChanges'));
      return;
    }

    setSaving(true);
    try {
      for (const key of changed) {
        await _SettingApi.updateSystemSetting(key, next[key]);
      }
      await queryClient.invalidateQueries({ queryKey: ['setting'] });
      toast.success(t('form.deliverySettingsSaveSuccess'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('form.settingsUpdateFailed');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Typography variant="body2" className="text-muted-foreground">
        {t('loading')}
      </Typography>
    );
  }

  if (isError) {
    return (
      <Box className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <Typography variant="body2" className="text-destructive">
          {t('form.deliverySettingsFailedToLoad')}
        </Typography>
      </Box>
    );
  }

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-4">
      <Box className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.deliverySettingsHint')}
        </Typography>
      </Box>

      <Box className="grid gap-4 lg:grid-cols-3">
        <NumberField
          label={t('form.tikmartMinOrderAmount')}
          hint={t('form.tikmartMinOrderAmountHint')}
          value={minOrder}
          disabled={saving}
          onChange={setMinOrder}
        />
        <NumberField
          label={t('form.tikmartDeliveryMinHours')}
          hint={t('form.tikmartDeliveryHoursHint')}
          value={minHours}
          disabled={saving}
          onChange={setMinHours}
        />
        <NumberField
          label={t('form.tikmartDeliveryMaxHours')}
          hint={t('form.tikmartDeliveryMaxHint')}
          value={maxHours}
          disabled={saving}
          onChange={setMaxHours}
        />
      </Box>

      {error ? (
        <Typography variant="body2" className="text-destructive">
          {error}
        </Typography>
      ) : null}

      <Box className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" variant="contained" disabled={saving} className="min-w-[160px]">
          {saving ? t('updating') : t('form.saveChanges')}
        </Button>
      </Box>
    </form>
  );
}

function NumberField({
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
