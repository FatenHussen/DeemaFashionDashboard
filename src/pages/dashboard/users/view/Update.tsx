import type { UserItem } from '@/pages/dashboard/users/types/user.types';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import {
  useUpdateUser,
  useFetchUserById,
  useConvertToAffiliate,
} from '@/pages/dashboard/users/hooks/user';
import {
  UserUpdateSchema,
  type UserUpdateFormValues,
  UserConvertAffiliateSchema,
  type UserConvertAffiliateFormValues,
} from '@/pages/dashboard/users/validation/user.validation';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Edit User ${CONFIG.appName}` };

export default function UpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userFromState = location.state?.user as UserItem | undefined;

  const [showConvertAffiliate, setShowConvertAffiliate] = useState(false);

  const { data: userResponse, isLoading: isLoadingUser } = useFetchUserById(id || '');
  const { data: areasResponse } = useFetchAreas();
  const updateUserMutation = useUpdateUser();
  const convertAffiliateMutation = useConvertToAffiliate();

  const user = userResponse?.data;
  const areas = areasResponse?.data?.items || [];

  const sourceUser = user ?? userFromState;
  const aff = sourceUser?.affiliate;
  const isAffiliate = aff?.is_affiliate ?? false;
  const isApprovedAffiliate =
    isAffiliate &&
    (aff?.affiliate_approved ?? false) &&
    (aff?.affiliate_id != null && aff?.affiliate_id !== '') &&
    (aff?.affiliate_rate != null && aff?.affiliate_rate !== '');
  const showConvertAffiliateSection = isAffiliate && !isApprovedAffiliate;

  const defaultValues: UserUpdateFormValues = {
    name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    area_id: 0,
  };

  const methods = useForm<UserUpdateFormValues>({
    resolver: zodResolver(UserUpdateSchema) as any,
    defaultValues,
  });

  const convertMethods = useForm<UserConvertAffiliateFormValues>({
    resolver: zodResolver(UserConvertAffiliateSchema),
    defaultValues: { affiliate_id: 0, affiliate_rate: 0 },
  });

  const { handleSubmit, reset, control } = methods;
  const { handleSubmit: handleConvertSubmit, control: convertControl } = convertMethods;

  useEffect(() => {
    if (sourceUser) {
      reset({
        name: sourceUser.name || '',
        last_name: (sourceUser as any).last_name ?? '',
        email: sourceUser.email || '',
        phone: sourceUser.phone || '',
        password: '',
        password_confirmation: '',
        area_id: (sourceUser as any).area_id ?? 0,
      });
    }
  }, [sourceUser, reset]);

  const isSubmitting = updateUserMutation.isPending || convertAffiliateMutation.isPending;
  const errorMessage =
    updateUserMutation.error?.message || convertAffiliateMutation.error?.message || null;

  const onSubmit = async (data: UserUpdateFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        last_name: data.last_name || '',
        email: data.email,
        phone: data.phone || '',
        area_id: data.area_id,
      };
      if (data.password) {
        payload.password = data.password;
        payload.password_confirmation = data.password_confirmation;
      }
      await updateUserMutation.mutateAsync({ id: id!, data: payload });
      toast.success('User updated successfully');
    } catch {}
  };

  const onConvertSubmit = async (data: UserConvertAffiliateFormValues) => {
    try {
      await convertAffiliateMutation.mutateAsync({
        id: id!,
        data: {
          affiliate_id: data.affiliate_id,
          affiliate_rate: data.affiliate_rate,
        },
      });
      toast.success('User converted to affiliate successfully');
      setShowConvertAffiliate(false);
      convertMethods.reset();
    } catch {}
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoadingUser && !userFromState) {
    return <LoadingScreen />;
  }
  if (!sourceUser) {
    if (!userFromState) {
      toast.error('User not found. Please edit from the list.');
      navigate('/users');
    }
    return null;
  }

  return (
    <>
      <title>Edit User | {metadata.title}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title="Edit User"
        description="Update user information"
        isEditMode
        maxWidth="2xl"
      >
        <Box className="space-y-4">
          <RHFTextField name="name" label="First Name" fullWidth />
          <RHFTextField name="last_name" label="Last Name" fullWidth />
          <RHFTextField name="email" label="Email" type="email" fullWidth />
          <RHFTextField name="phone" label="Phone" fullWidth />
          <RHFTextField
            name="password"
            label="Password (leave empty to keep)"
            type="password"
            fullWidth
          />
          <RHFTextField
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            fullWidth
          />

          <Box>
            <label className="mb-2 block text-sm font-medium">Area</label>
            <Controller
              name="area_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <select
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value={0}>Select area</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
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

          {showConvertAffiliateSection && (
            <Box className="rounded-lg border border-border p-4">
              {!showConvertAffiliate ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowConvertAffiliate(true)}
                  className="gap-2"
                >
                  <Iconify icon="solar:user-add-bold" width={18} />
                  Convert to Affiliate
                </Button>
              ) : (
                <Box>
                  <Typography variant="subtitle2" className="mb-2">
                    Set Affiliate Details
                  </Typography>
                  <div className="space-y-4">
                    <Box className="flex flex-col gap-4 sm:flex-row">
                      <Box className="flex-1">
                        <Typography variant="caption" className="mb-1 block">
                          Affiliate ID
                        </Typography>
                        <Controller
                          name="affiliate_id"
                          control={convertControl}
                          render={({ field, fieldState: { error } }) => (
                            <div>
                              <input
                                {...field}
                                type="number"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              />
                              {error?.message && (
                                <p className="mt-1 text-xs text-destructive">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="caption" className="mb-1 block">
                          Affiliate Rate %
                        </Typography>
                        <Controller
                          name="affiliate_rate"
                          control={convertControl}
                          render={({ field, fieldState: { error } }) => (
                            <div>
                              <input
                                {...field}
                                type="number"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              />
                              {error?.message && (
                                <p className="mt-1 text-xs text-destructive">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </Box>
                    </Box>
                    <Box className="flex items-end gap-2">
                      <Button
                        type="button"
                        variant="contained"
                        disabled={convertAffiliateMutation.isPending}
                        onClick={() => handleConvertSubmit(onConvertSubmit)()}
                      >
                        {convertAffiliateMutation.isPending ? 'Submitting...' : 'Convert'}
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setShowConvertAffiliate(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </div>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </CreateFormLayout>
    </>
  );
}
