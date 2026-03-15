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

const metadata = { title: `Vendor User ${CONFIG.appName}` };

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
        is_active: Boolean(user.is_active ?? true),
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
        toast.success('Vendor user updated successfully');
        navigate('/vendor-users');
      } else {
        if (!data.password || data.password.length < 8) {
          toast.error('Password is required and must be at least 8 characters');
          return;
        }
        payload.password = data.password;
        await createMutation.mutateAsync(payload);
        toast.success('Vendor user created successfully');
        navigate('/vendor-users');
      }
    } catch (error: any) {
      console.error('Error saving vendor user:', error);
      toast.error(error?.message || 'Failed to save vendor user');
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
          ? `Edit Vendor User | ${metadata.title}`
          : `Create Vendor User | ${metadata.title}`}
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
          toast.error(msg || 'Please fix the form errors.');
        })}
        onCancel={() => navigate('/vendor-users')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Vendor User' : 'Create Vendor User'}
        description={
          isEditMode
            ? 'Update vendor user information and shop assignments'
            : 'Add a new user to a vendor account and assign shops'
        }
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingUser}
        loadingText={t('form.loadingVendorUser')}
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update User' : 'Create User'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        <Box className="space-y-4">
          {/* Name */}
          <RHFTextField name="name" label={t('form.fullName')} placeholder={t('form.namePlaceholder')} fullWidth />

          {/* Email */}
          <RHFTextField
            name="email"
            label={t('columns.email')}
            type="email"
            placeholder={t('form.userEmailPlaceholder')}
            fullWidth
          />

          {!isEditMode && (
            <RHFTextField
              name="password"
              label={t('form.passwordLabel')}
              type="password"
              placeholder={t('form.passwordMinPlaceholder')}
              fullWidth
            />
          )}

          {/* Vendor Selector */}
          <Box>
            <label className="mb-2 block text-sm font-medium">{t('columns.vendor')}</label>
            <RHFInfiniteSelect
              name="vendor_id"
              queryKey={['vendors', 'infinite', 'vendor-user-form']}
              fetcher={vendorFetcher}
              placeholder={t('form.selectVendor')}
              initialLabel={
                isEditMode && vendorUserData?.data?.vendor
                  ? formatTranslated(vendorUserData.data.vendor.name as any)
                  : undefined
              }
              onValueChange={() => methods.setValue('shop_ids', [])}
            />
          </Box>

          {/* Shop Multi-Select — shown only when a vendor is selected */}
          {selectedVendorId > 0 && (
            <Box>
              <label className="mb-2 block text-sm font-medium">
                Assign Shops
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (all shops must belong to the selected vendor)
                </span>
              </label>
              <Controller
                name="shop_ids"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <MultiSelect
                      options={shopOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder={
                        shops.length === 0 ? 'No shops available for this vendor' : 'Select shops...'
                      }
                      isDisabled={shops.length === 0}
                    />
                    {error?.message && (
                      <p className="mt-1 text-xs text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
              />
            </Box>
          )}

          {/* Is Active */}
          <Box className="rounded-lg border border-border p-4">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <Typography variant="subtitle2">Active</Typography>
                  <span className="text-xs text-muted-foreground">
                    (inactive users cannot log in)
                  </span>
                </label>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
