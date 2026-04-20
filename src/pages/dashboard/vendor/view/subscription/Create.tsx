import { z } from 'zod';
import { toast } from 'react-toastify';
import { paths } from '@/routes/paths';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatTranslated } from '@/utils/format-translated';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _VendorPackageApi } from '@/pages/dashboard/vendor/api/vendor-package.services';
import { useCreateVendorSubscription } from '@/pages/dashboard/vendor/hooks/vendor-subscription';
import {
  VENDOR_SUBSCRIPTION_STATUSES,
  type VendorSubscriptionStatus,
} from '@/pages/dashboard/vendor/types/vendor-subscription.types';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const vendorFetcher = (page: number, limit: number) =>
  _VendorApi.getListVendor({ page, limit }).then((r) => ({
    data: {
      items: r.data.items.map((vendor) => ({
        id: vendor.id,
        label: formatTranslated(vendor.name, `#${vendor.id}`),
      })),
      pagination: r.data.pagination,
    },
  }));

const vendorPackageFetcher = (page: number, limit: number) =>
  _VendorPackageApi.getList({ page, per_page: limit, sort_field: 'id', sort_order: 'desc' }).then(
    (r) => ({
      data: {
        items: r.data.items.map((pkg) => ({
          id: pkg.id,
          label: formatTranslated(pkg.name, `#${pkg.id}`),
        })),
        pagination: r.data.pagination,
      },
    })
  );

// ----------------------------------------------------------------------

function defaultDateRange() {
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { starts_at: iso(start), ends_at: iso(end) };
}

const VendorSubscriptionCreateSchema = z
  .object({
    vendor_id: z.coerce.number().int().positive(),
    vendor_package_id: z.coerce.number().int().positive(),
    starts_at: z.string().min(1),
    ends_at: z.string().min(1),
    auto_renew: z.boolean(),
    status: z.enum(VENDOR_SUBSCRIPTION_STATUSES),
    notes: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.ends_at).getTime() >= new Date(data.starts_at).getTime(),
    { message: 'endsBeforeStarts', path: ['ends_at'] }
  );

type FormValues = z.infer<typeof VendorSubscriptionCreateSchema>;

const defaults: FormValues = {
  ...defaultDateRange(),
  vendor_id: 0,
  vendor_package_id: 0,
  auto_renew: false,
  status: 'active',
  notes: '',
};

export default function VendorSubscriptionCreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const createMutation = useCreateVendorSubscription();

  const methods = useForm<FormValues>({
    resolver: zodResolver(VendorSubscriptionCreateSchema) as any,
    defaultValues: defaults,
  });

  const { handleSubmit, control } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync({
        vendor_id: data.vendor_id,
        vendor_package_id: data.vendor_package_id,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        auto_renew: data.auto_renew,
        status: data.status as VendorSubscriptionStatus,
        notes: data.notes?.trim() ? data.notes.trim() : undefined,
      });
      toast.success(t('form.vendorSubscriptionCreatedSuccess'));
      navigate(paths.dashboard.vendorSubscriptions);
    } catch {
      return;
    }
  };

  const isSubmitting = createMutation.isPending;
  const errorMessage =
    (createMutation.error as any)?.response?.data?.message ||
    (createMutation.error as any)?.message ||
    null;

  return (
    <>
      <title>{t('form.vendorSubscriptionCreateDocumentTitle', { appName: CONFIG.appName })}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate(paths.dashboard.vendorSubscriptions)}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.createVendorSubscription')}
        description={t('form.createVendorSubscriptionDesc')}
        submitLabel={t('form.createVendorSubscriptionSubmit')}
        submittingLabel={t('form.creatingVendorSubscription')}
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('columns.vendor')}
            </Typography>
            <RHFInfiniteSelect
              name="vendor_id"
              queryKey={['vendors', 'infinite', 'vendor-subscription-create']}
              fetcher={vendorFetcher}
              placeholder={t('form.selectVendor')}
            />
          </Box>
          <Box className="md:col-span-2">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('columns.package')}
            </Typography>
            <RHFInfiniteSelect
              name="vendor_package_id"
              queryKey={['vendor-packages', 'infinite', 'vendor-subscription-create']}
              fetcher={vendorPackageFetcher}
              placeholder={t('form.selectVendorPackage')}
            />
          </Box>
          <RHFTextField name="starts_at" type="date" label={t('vendorSubscriptionStartsAt')} fullWidth />
          <RHFTextField name="ends_at" type="date" label={t('vendorSubscriptionEndsAt')} fullWidth />
          <Box className="md:col-span-2 flex items-center justify-between rounded-lg border p-3">
            <Typography variant="body2">{t('columns.autoRenew')}</Typography>
            <Controller
              name="auto_renew"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
              )}
            />
          </Box>
          <Box className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t('columns.status')}
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {VENDOR_SUBSCRIPTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            />
          </Box>
          <Box className="md:col-span-2">
            <RHFTextField name="notes" label={t('form.vendorSubscriptionNotes')} fullWidth />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
