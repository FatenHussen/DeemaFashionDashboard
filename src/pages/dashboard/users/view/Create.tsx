import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  UserCreateSchema,
  type UserCreateFormValues,
} from '@/pages/dashboard/users/validation/user.validation';
import { useCreateUser } from '@/pages/dashboard/users/hooks/user';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';

import { Box, Typography } from 'src/shared/ui';
import { CONFIG } from 'src/global-config';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `User ${CONFIG.appName}` };

export default function CreatePage() {
  const navigate = useNavigate();
  const { data: areasResponse } = useFetchAreas();
  const areas = areasResponse?.data?.items || [];
  const createUserMutation = useCreateUser();

  const defaultValues: UserCreateFormValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    area_id: 0,
    make_affiliate: false,
    affiliate_id: undefined,
    affiliate_rate: undefined,
  };

  const methods = useForm<UserCreateFormValues>({
    resolver: zodResolver(UserCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, control, watch } = methods;
  const makeAffiliate = watch('make_affiliate');

  const isSubmitting = createUserMutation.isPending;
  const errorMessage = createUserMutation.error?.message || null;

  const onSubmit = async (data: UserCreateFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        password_confirmation: data.password_confirmation,
        area_id: data.area_id,
      };
      if (data.make_affiliate && data.affiliate_id && data.affiliate_rate !== undefined) {
        payload.affiliate_id = data.affiliate_id;
        payload.affiliate_rate = data.affiliate_rate;
      }
      await createUserMutation.mutateAsync(payload);
      toast.success('User created successfully');
      navigate('/users');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user');
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <>
      <title>Create User | {metadata.title}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title="Create New User"
        description="Add a new user. Optionally make them an affiliate."
        maxWidth="2xl"
      >
        <Box className="space-y-4">
          <RHFTextField name="name" label="Name" placeholder="Ahmed Ali" fullWidth />
          <RHFTextField name="email" label="Email" type="email" placeholder="user@example.com" fullWidth />
          <RHFTextField name="phone" label="Phone" placeholder="+201234567896" fullWidth />
          <RHFTextField name="password" label="Password" type="password" fullWidth />
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

          <Box className="rounded-lg border border-border p-4">
            <Controller
              name="make_affiliate"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <Typography variant="subtitle2">Make affiliate on creation</Typography>
                </label>
              )}
            />

            {makeAffiliate && (
              <Box className="mt-4 flex flex-col gap-4 sm:flex-row">
                <Box className="flex-1">
                  <Typography variant="caption" className="mb-1 block">
                    Affiliate ID
                  </Typography>
                  <RHFTextField name="affiliate_id" type="number" placeholder="56" fullWidth />
                </Box>
                <Box className="flex-1">
                  <Typography variant="caption" className="mb-1 block">
                    Affiliate Rate %
                  </Typography>
                  <RHFTextField name="affiliate_rate" type="number" placeholder="15" fullWidth />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
