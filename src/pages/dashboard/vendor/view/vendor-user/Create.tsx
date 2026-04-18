import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Iconify } from 'src/shared/components/iconify';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

import {
  VendorUserSchema,
  type VendorUserFormValues,
} from '../../validation/vendor-user.validation';
import {
  useCreateVendorUser,
  useUpdateVendorUser,
  useFetchShopsByVendor,
  useFetchVendorUserById,
} from '../../hooks/vendor-user';

// ----------------------------------------------------------------------

const vendorFetcher = (page: number, limit: number) =>
  _VendorApi.getListVendor({ page, limit }).then((r) => ({
    data: {
      items: r.data.items.map((vendor) => ({ id: vendor.id, label: vendor.name })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: vendorUserData, isLoading: isLoadingUser } = useFetchVendorUserById(id || '');
  const createMutation = useCreateVendorUser();
  const updateMutation = useUpdateVendorUser();

  const methods = useForm<VendorUserFormValues>({
    resolver: zodResolver(VendorUserSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      vendor_id: 0,
      is_active: true,
      shop_ids: [],
    },
  });

  const { handleSubmit, control, watch, reset } = methods;
  const selectedVendorId = watch('vendor_id');

  const { data: shopsResponse } = useFetchShopsByVendor(
    selectedVendorId > 0 ? selectedVendorId : undefined
  );
  const shops = (shopsResponse?.data?.items || []) as any[];

  useEffect(() => {
    if (isEditMode && vendorUserData?.data) {
      const user = vendorUserData.data;
      reset({
        name: user.name,
        email: user.email,
        vendor_id: Number(user.vendor_id) || 0,
        is_active: Boolean(user.is_active),
        shop_ids: (user.shops?.map((s: any) => Number(s.id)) || []).filter((n) => !Number.isNaN(n)),
      });
    }
  }, [isEditMode, vendorUserData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: VendorUserFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        vendor_id: data.vendor_id,
        is_active: data.is_active,
        shop_ids: data.shop_ids || [],
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.vendorUserUpdatedSuccess'));
        navigate('/vendor-users');
      } else {
        if (!data.password || data.password.length < 8) {
          toast.error(t('form.passwordRequiredMin8'));
          return;
        }
        payload.password = data.password;
        await createMutation.mutateAsync(payload);
        toast.success(t('form.vendorUserCreatedSuccess'));
        navigate('/vendor-users');
      }
    } catch (error: any) {
      console.error('Error saving vendor user:', error);
      toast.error(error?.message || t('form.vendorUserSaveFailed'));
    }
  };

  const shopOptions = shops.map((shop) => ({
    value: shop.id as number,
    label: formatTranslated(shop.name),
  }));

  return (
    <>
      <title>
        {isEditMode
          ? t('form.vendorUserEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.vendorUserCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any, (errors) => {
          console.error('[Vendor User Form] Validation errors:', errors);
          const getFirstMsg = (obj: any): string | null => {
            if (!obj) return null;
            if (typeof obj?.message === 'string') return obj.message;
            if (typeof obj === 'object') {
              for (const v of Object.values(obj)) {
                const m = getFirstMsg(v);
                if (m) return m;
              }
            }
            return null;
          };
          const msg = getFirstMsg(errors);
          console.error('[Vendor User Form] First error:', msg);
          toast.error(msg || t('form.fixFormErrors'));
        })}
        onCancel={() => navigate('/vendor-users')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editVendorUserTitle') : t('form.createVendorUserTitle')}
        description={isEditMode ? t('form.editVendorUserDesc') : t('form.createVendorUserDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingUser}
        loadingText={t('form.loadingVendorUser')}
        submitLabel={isEditMode ? t('form.updateVendorUserSubmit') : t('form.createVendorUserSubmit')}
        submittingLabel={isEditMode ? t('form.updatingVendorUser') : t('form.creatingVendorUser')}
      >
        {/* ── Section: Account Info ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:user-rounded-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.userDetailsBasicInfo')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.fullName')}</Typography>
              <RHFTextField name="name" placeholder={t('form.namePlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.email')}</Typography>
              <RHFTextField name="email" type="email" placeholder={t('form.userEmailPlaceholder')} fullWidth />
            </Box>
            {!isEditMode && (
              <Box className="group md:col-span-2">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.passwordLabel')}</Typography>
                <RHFTextField name="password" type="password" placeholder={t('form.passwordMinPlaceholder')} fullWidth />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Vendor & Shops ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:case-minimalistic-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.vendor')} & {t('form.assignShopsLabel')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.vendor')}</Typography>
              <RHFInfiniteSelect
                name="vendor_id"
                queryKey={['vendors', 'infinite', 'vendor-user-form']}
                fetcher={vendorFetcher}
                placeholder={t('form.selectVendor')}
                initialLabel={isEditMode && vendorUserData?.data?.vendor ? formatTranslated(vendorUserData.data.vendor.name as any) : undefined}
                onValueChange={() => methods.setValue('shop_ids', [])}
              />
            </Box>
            {selectedVendorId > 0 && (
              <Box className="group">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                  {t('form.assignShopsLabel')}
                  <span className="text-muted-foreground font-normal ml-1 text-xs">{t('form.assignShopsHelper')}</span>
                </Typography>
                <Controller
                  name="shop_ids"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <MultiSelect
                        options={shopOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder={shops.length === 0 ? t('form.vendorUserNoShopsForVendor') : t('form.vendorUserSelectShopsPlaceholder')}
                        isDisabled={shops.length === 0}
                      />
                      {error?.message && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
                    </div>
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer select-none p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="rounded accent-primary h-4 w-4" />
                  <Box>
                    <Typography variant="subtitle2">{t('active')}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">{t('form.vendorUserActiveHint')}</Typography>
                  </Box>
                </label>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
