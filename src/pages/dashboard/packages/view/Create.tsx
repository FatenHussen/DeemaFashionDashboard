import type { PackageData } from '@/pages/dashboard/packages/types/package.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  PackageSchema,
  type PackageFormValues,
} from '@/pages/dashboard/packages/validation/package.validation';
import {
  useCreatePackage,
  useUpdatePackage,
  useFetchPackageById,
} from '@/pages/dashboard/packages/hooks/package';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Package ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const packageFromState = location.state?.package as PackageData | undefined;
  const isEditMode = !!id;

  const { data: packageResponse, isLoading: isLoadingPackage } = useFetchPackageById(id || '');
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();

  const defaultValues: PackageFormValues = {
    name: { en: '', ar: '' },
    price: 0,
    duration_days: 1,
    monthly_orders_limit: 0,
    free_delivery_count: 0,
    discount_percentage: 0,
    points_bonus: 0,
    is_active: true,
  };

  const methods = useForm<PackageFormValues>({
    resolver: zodResolver(PackageSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (packageResponse?.data ?? packageFromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      reset({
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        price: source.price ?? 0,
        duration_days: source.duration_days ?? 1,
        monthly_orders_limit: source.monthly_orders_limit ?? 0,
        free_delivery_count: source.free_delivery_count ?? 0,
        discount_percentage: source.discount_percentage ?? 0,
        points_bonus: source.points_bonus ?? 0,
        is_active: source.is_active ?? true,
      });
    }
  }, [packageResponse?.data, packageFromState, isEditMode, reset]);

  const isSubmitting = createPackageMutation.isPending || updatePackageMutation.isPending;
  const errorMessage = createPackageMutation.error?.message || updatePackageMutation.error?.message || null;

  const onSubmit = async (data: PackageFormValues) => {
    try {
      const payload = { ...data } as any;
      if (isEditMode && id) {
        await updatePackageMutation.mutateAsync({ id, data: payload });
        toast.success('Package updated successfully');
      } else {
        await createPackageMutation.mutateAsync(payload);
        toast.success('Package created successfully');
      }
      navigate('/packages');
    } catch (error: any) {
      console.error('Error saving package:', error);
    }
  };

  const handleCancel = () => navigate('/packages');

  if (isEditMode && isLoadingPackage && !packageFromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Package | ${metadata.title}` : `Create Package | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Package' : 'Create New Package'}
        description={isEditMode ? 'Update package details' : 'Add a new subscription package'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingPackage}
        loadingText="Loading package..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Package' : 'Create Package'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (English)</Typography>
          <RHFTextField name="name.en" placeholder="Package name in English" fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (Arabic)</Typography>
          <RHFTextField name="name.ar" placeholder="اسم الباقة بالعربي" dir="rtl" fullWidth />
        </Box>

        {/* Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Price</Typography>
          <RHFTextField name="price" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Duration Days */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Duration (Days)</Typography>
          <RHFTextField name="duration_days" type="number" placeholder="30" fullWidth />
        </Box>

        {/* Monthly Orders Limit */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Monthly Orders Limit</Typography>
          <RHFTextField name="monthly_orders_limit" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Free Delivery Count */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Free Delivery Count</Typography>
          <RHFTextField name="free_delivery_count" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Discount Percentage */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Discount Percentage</Typography>
          <RHFTextField name="discount_percentage" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Points Bonus */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Points Bonus</Typography>
          <RHFTextField name="points_bonus" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Typography variant="body2">Active</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
