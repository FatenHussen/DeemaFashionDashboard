import type { SubscriptionData } from '@/pages/dashboard/subscriptions/types/subscription.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  SubscriptionSchema,
  type SubscriptionFormValues,
} from '@/pages/dashboard/subscriptions/validation/subscription.validation';
import {
  useCreateSubscription,
  useUpdateSubscription,
  useFetchSubscriptionById,
} from '@/pages/dashboard/subscriptions/hooks/subscription';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

const metadata = { title: `Subscription ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.subscription as SubscriptionData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchSubscriptionById(id || '');
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();

  const defaultValues: SubscriptionFormValues = {
    user_id: 0,
    package_id: 0,
    start_date: '',
    end_date: '',
    status: 'active',
    is_active: true,
  };

  const methods = useForm<SubscriptionFormValues>({
    resolver: zodResolver(SubscriptionSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      reset({
        user_id: source.user_id || source.user?.id || 0,
        package_id: source.package_id || source.package?.id || 0,
        start_date: source.start_date || '',
        end_date: source.end_date || '',
        status: source.status || 'active',
        is_active: source.is_active ?? true,
      });
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: SubscriptionFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success('Subscription updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Subscription created successfully');
      }
      navigate('/subscriptions');
    } catch (error: any) {
      console.error('Error saving subscription:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Subscription | ${metadata.title}` : `Create Subscription | ${metadata.title}`}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/subscriptions')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Subscription' : 'Create New Subscription'}
        description={isEditMode ? 'Update subscription details' : 'Add a new subscription'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText="Loading subscription..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Subscription' : 'Create Subscription'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">User ID</Typography>
          <RHFTextField name="user_id" type="number" placeholder="User ID" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Package ID</Typography>
          <RHFTextField name="package_id" type="number" placeholder="Package ID" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Start Date</Typography>
          <RHFTextField name="start_date" type="date" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">End Date</Typography>
          <RHFTextField name="end_date" type="date" fullWidth />
        </Box>
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Status</Typography>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            )}
          />
        </Box>
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                <Typography variant="body2">Active</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
