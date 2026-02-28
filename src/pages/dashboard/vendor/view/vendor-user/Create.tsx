import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

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

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: vendorUserData, isLoading: isLoadingUser } = useFetchVendorUserById(id || '');
  const { data: vendorsResponse } = useFetchVendors(1, 1000);
  const createMutation = useCreateVendorUser();
  const updateMutation = useUpdateVendorUser();

  const vendors = (vendorsResponse?.data?.items || []) as any[];

  const methods = useForm<VendorUserFormValues>({
    resolver: zodResolver(VendorUserSchema),
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
        password: '',
        vendor_id: user.vendor_id,
        is_active: user.is_active,
        shop_ids: user.shops?.map((s: any) => s.id) || [],
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
        if (data.password) payload.password = data.password;
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
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
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
        loadingText="Loading vendor user data..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update User' : 'Create User'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        <Box className="space-y-4">
          {/* Name */}
          <RHFTextField name="name" label="Full Name" placeholder="Ahmed Mohammed" fullWidth />

          {/* Email */}
          <RHFTextField
            name="email"
            label="Email"
            type="email"
            placeholder="user@example.com"
            fullWidth
          />

          {/* Password */}
          <RHFTextField
            name="password"
            label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            placeholder="Min 8 characters"
            fullWidth
          />

          {/* Vendor Selector */}
          <Box>
            <label className="mb-2 block text-sm font-medium">Vendor</label>
            <Controller
              name="vendor_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <select
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value, 10) || 0);
                      methods.setValue('shop_ids', []);
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value={0}>Select vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {formatTranslated(v.name)}
                      </option>
                    ))}
                  </select>
                  {error?.message && (
                    <p className="mt-1 text-xs text-destructive">{error.message}</p>
                  )}
                </div>
              )}
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
