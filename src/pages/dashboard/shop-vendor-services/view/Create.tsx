import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { useFetchShops } from '../../vendor/hooks/shop';
import { useFetchVendorServices } from '../../vendor-services/hooks';
import {
  useCreateShopVendorService,
  useUpdateShopVendorService,
  useFetchShopVendorServiceById,
} from '../hooks';
import {
  ShopVendorServiceCreateSchema,
  ShopVendorServiceUpdateSchema,
  type ShopVendorServiceCreateFormValues,
  type ShopVendorServiceUpdateFormValues,
} from '../validation';

// ----------------------------------------------------------------------

type FormValues = ShopVendorServiceCreateFormValues | ShopVendorServiceUpdateFormValues;

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailResponse, isLoading: isLoadingDetail } = useFetchShopVendorServiceById(
    id || ''
  );
  const createMutation = useCreateShopVendorService();
  const updateMutation = useUpdateShopVendorService();

  const { data: shopsData } = useFetchShops(1, 100);
  const { data: vendorServicesData } = useFetchVendorServices(1, 100);

  const shopOptions =
    shopsData?.data?.items?.map((s) => ({
      value: String(s.id),
      label:
        typeof s.name === 'object'
          ? (s.name as any).en ?? (s.name as any).ar ?? String(s.id)
          : String(s.name),
    })) || [];

  const vendorServiceOptions =
    vendorServicesData?.data?.items?.map((vs) => ({
      value: String(vs.id),
      label:
        typeof vs.name === 'object'
          ? (vs.name as any).en ?? (vs.name as any).ar ?? String(vs.id)
          : String(vs.name),
    })) || [];

  const priceUnitOptions = [
    { value: 'per hour', label: t('form.perHour') },
    { value: 'per visit', label: t('form.perVisit') },
    { value: 'per day', label: t('form.perDay') },
    { value: 'fixed', label: t('form.fixed') },
  ];

  const schema = isEditMode ? ShopVendorServiceUpdateSchema : ShopVendorServiceCreateSchema;

  const createDefaults: ShopVendorServiceCreateFormValues = {
    shop_id: 0,
    vendor_service_id: 0,
    price: 0,
    price_unit: 'per hour',
    duration_minutes: 60,
    is_active: true,
  };

  const updateDefaults: ShopVendorServiceUpdateFormValues = {
    price: 0,
    price_unit: 'per hour',
    duration_minutes: 60,
    is_active: true,
  };

  const methods = useForm<any>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEditMode ? updateDefaults : createDefaults,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && detailResponse?.data) {
      const item = detailResponse.data;
      reset({
        price: item.price ?? 0,
        price_unit: item.price_unit ?? 'per hour',
        duration_minutes: item.duration_minutes ?? 60,
        is_active: item.is_active ?? true,
      });
    }
  }, [isEditMode, detailResponse, reset]);

  if (isEditMode && isLoadingDetail) return <LoadingScreen />;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        const payload = {
          price: Number(data.price),
          price_unit: data.price_unit,
          duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : undefined,
          is_active: data.is_active,
        };
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.shopVendorServiceUpdatedSuccess'));
        navigate('/shop-vendor-services');
      } else {
        const payload = {
          shop_id: Number(data.shop_id),
          vendor_service_id: Number(data.vendor_service_id),
          price: Number(data.price),
          price_unit: data.price_unit,
          duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : undefined,
          is_active: data.is_active,
        };
        await createMutation.mutateAsync(payload);
        toast.success(t('form.shopVendorServiceCreatedSuccess'));
        navigate('/shop-vendor-services');
      }
    } catch (error: any) {
      console.error('Error saving shop vendor service:', error);
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.shopVendorServiceEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.shopVendorServiceCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/shop-vendor-services')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={
          isEditMode
            ? t('form.editShopVendorService')
            : t('form.createShopVendorService')
        }
        description={
          isEditMode
            ? t('form.editShopVendorServiceDesc')
            : t('form.createShopVendorServiceDesc')
        }
        isEditMode={isEditMode}
        isLoading={false}
        submitLabel={
          isEditMode
            ? t('form.updateShopVendorServiceSubmit')
            : t('form.createShopVendorServiceSubmit')
        }
        submittingLabel={
          isEditMode
            ? t('form.updatingShopVendorServiceSubmit')
            : t('form.creatingShopVendorServiceSubmit')
        }
      >
        {/* ── Section: Assignment (create only) ── */}
        {!isEditMode && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:case-minimalistic-bold" className="text-violet-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.shop')} & {t('columns.vendorService')}
              </Typography>
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box className="group">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:case-minimalistic-bold" className="text-violet-500" width={16} />
                  {t('columns.shop')}
                </Typography>
                <RHFSelect name="shop_id" options={shopOptions} placeholder={t('form.selectShopPlaceholder')} />
              </Box>
              <Box className="group">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:course-bold" className="text-violet-500" width={16} />
                  {t('columns.vendorService')}
                </Typography>
                <RHFSelect name="vendor_service_id" options={vendorServiceOptions} placeholder={t('form.selectVendorService')} />
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Section: Pricing ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.price')} & {t('columns.duration')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:tag-price-bold" className="text-amber-500" width={16} />
                {t('columns.price')}
              </Typography>
              <RHFTextField name="price" type="number" placeholder={t('form.pricePlaceholder')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:tag-bold" className="text-amber-500" width={16} />
                {t('form.priceUnit')}
              </Typography>
              <RHFSelect name="price_unit" options={priceUnitOptions} placeholder={t('form.priceUnitPlaceholder')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:clock-circle-bold" className="text-amber-500" width={16} />
                {t('columns.duration')} {t('form.durationMinutesShort')}
              </Typography>
              <RHFTextField name="duration_minutes" type="number" placeholder={t('form.durationPlaceholder')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={methods.control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
