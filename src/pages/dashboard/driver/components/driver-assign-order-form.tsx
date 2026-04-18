import type { TFunction } from 'i18next';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { useMemo, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { useForm, FormProvider } from 'react-hook-form';
import { RHFSelect } from '@/shared/components/hook-form/rhf-select';
import { useAssignDriver, useFetchOrdersToAssign } from '@/pages/dashboard/orders/hooks/order';

import { Box, Typography } from 'src/shared/ui';
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from 'src/shared/ui/select';

// ----------------------------------------------------------------------

type FormValues = {
  order_id: string;
};

export type DriverAssignOrderFormProps = {
  driverId: number;
  t: TFunction<'table'>;
  onAssigned?: () => void;
  showViewOrderButton?: boolean;
  disabled?: boolean;
};

export function DriverAssignOrderForm({
  driverId,
  t,
  onAssigned,
  showViewOrderButton = true,
  disabled = false,
}: DriverAssignOrderFormProps) {
  const navigate = useNavigate();
  const assignDriverMutation = useAssignDriver();

  const [filterByCoverage, setFilterByCoverage] = useState(true);
  const [statusScope, setStatusScope] = useState<'all' | 'pending' | 'preparing'>('all');
  const [instantOnly, setInstantOnly] = useState(true);

  const statusParam = statusScope === 'all' ? undefined : statusScope;

  const { data: toAssignRes, isLoading: ordersLoading } = useFetchOrdersToAssign(
    driverId,
    {
      filterByDriverCoverage: filterByCoverage,
      status: statusParam,
      isInstantDelivery: instantOnly,
    },
    true
  );

  const orders = toAssignRes?.data ?? [];
  const orderOptions = useMemo(
    () => orders.map((o) => ({ value: String(o.id), label: o.value })),
    [orders]
  );

  const form = useForm<FormValues>({
    defaultValues: { order_id: '' },
  });

  const { handleSubmit, reset, watch } = form;
  const selectedOrderId = watch('order_id');

  useEffect(() => {
    const ids = new Set(orders.map((o) => String(o.id)));
    if (selectedOrderId && !ids.has(selectedOrderId)) {
      reset({ order_id: '' });
    }
  }, [orders, selectedOrderId, reset]);

  const busy = assignDriverMutation.isPending || disabled;

  const onSubmit = handleSubmit(async (values) => {
    const oid = Number(values.order_id);
    if (!oid) return;
    try {
      await assignDriverMutation.mutateAsync({
        id: oid,
        data: { driver_id: driverId },
        refreshDriverId: driverId,
      });
      toast.success(t('form.driverOrderAssignedToDriverSuccess'));
      reset({ order_id: '' });
      onAssigned?.();
    } catch {
      /* global error toast */
    }
  });

  return (
    <Box>
      <Box className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
        <Switch
          checked={filterByCoverage}
          onChange={(e) => setFilterByCoverage(e.target.checked)}
          disabled={busy}
          label={t('form.driverAssignOrderCoverageLabel')}
        />
        <Typography variant="caption" className="block text-muted-foreground">
          {t('form.driverAssignOrderCoverageHelper')}
        </Typography>

        <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Typography variant="body2" className="shrink-0 text-muted-foreground">
            {t('form.driverAssignOrderStatusLabel')}
          </Typography>
          <Select
            value={statusScope}
            onValueChange={(v) => setStatusScope(v as 'all' | 'pending' | 'preparing')}
            disabled={busy}
          >
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('form.driverAssignOrderStatusPendingPreparing')}</SelectItem>
              <SelectItem value="pending">{t('form.driverAssignOrderStatusPending')}</SelectItem>
              <SelectItem value="preparing">{t('form.driverAssignOrderStatusPreparing')}</SelectItem>
            </SelectContent>
          </Select>
        </Box>

        <Switch
          checked={instantOnly}
          onChange={(e) => setInstantOnly(e.target.checked)}
          disabled={busy}
          label={t('form.driverAssignOrderInstantLabel')}
        />
      </Box>

      {ordersLoading ? (
        <Box className="flex items-center gap-2 text-muted-foreground">
          <Iconify icon="solar:refresh-bold" className="h-5 w-5 animate-spin" />
          <Typography variant="body2">{t('form.driverAssignOrderLoading')}</Typography>
        </Box>
      ) : orderOptions.length === 0 ? (
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.driverAssignOrderEmpty')}
        </Typography>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Box className="min-w-0 flex-1">
              <RHFSelect
                name="order_id"
                options={orderOptions}
                placeholder={t('form.driverAssignOrderSelectPlaceholder')}
                disabled={busy}
              />
            </Box>
            <Box className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant="contained"
                disabled={busy || !selectedOrderId}
                className="gap-2"
              >
                <Iconify icon="solar:user-check-bold" width={18} />
                {busy ? t('updating') : t('form.driverAssignOrderAssignButton')}
              </Button>
              {showViewOrderButton ? (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={busy || !selectedOrderId}
                  onClick={() => navigate(`/orders/${selectedOrderId}`)}
                >
                  {t('form.driverAssignOrderViewOrder')}
                </Button>
              ) : null}
            </Box>
          </form>
        </FormProvider>
      )}
    </Box>
  );
}
