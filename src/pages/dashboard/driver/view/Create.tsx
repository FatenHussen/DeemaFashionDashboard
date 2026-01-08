import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { CONFIG } from 'src/global-config';

import { Box, Typography, Input } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Iconify } from '@/shared/components/iconify';
import { Controller } from 'react-hook-form';
import {
  useFetchDriverById,
  useCreateDriver,
  useUpdateDriver,
} from '@/pages/dashboard/driver/hooks/driver';
import {
  DriverSchema,
  type DriverFormValues,
} from '@/pages/dashboard/driver/validation/driver.validation';
import type { DriverDetailsResponse } from '@/pages/dashboard/driver/types/driver.types';

// ----------------------------------------------------------------------

const metadata = { title: `Driver ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedAreas, setSelectedAreas] = useState<Array<{ id: number }>>([]);

  // Hooks for fetching and mutations
  const { data: driverResponse, isLoading: isLoadingDriver } = useFetchDriverById(id || '');
  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();

  const defaultValues: DriverFormValues = {
    name: '',
    phone: '',
    password: '',
    address: '',
    area_ids: [],
  };

  const methods = useForm<DriverFormValues>({
    resolver: zodResolver(DriverSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;

  // Fetch driver data if in edit mode
  useEffect(() => {
    if (isEditMode && driverResponse?.data && !isLoadingDriver) {
      const driver = driverResponse.data;
      const areaIds = driver.areas?.map((area) => ({ id: area.id })) || [];
      setSelectedAreas(areaIds);
      reset({
        name: '', // Name is not in the response, might need to fetch separately
        phone: driver.phone,
        password: '', // Don't pre-fill password
        address: driver.address,
        area_ids: areaIds,
      });
    }
  }, [driverResponse, isEditMode, isLoadingDriver, reset]);

  // Watch area_ids to sync with selectedAreas
  const areaIds = watch('area_ids');

  useEffect(() => {
    if (areaIds) {
      setSelectedAreas(areaIds);
    }
  }, [areaIds]);

  const isSubmitting = createDriverMutation.isPending || updateDriverMutation.isPending;
  const errorMessage =
    createDriverMutation.error?.message || updateDriverMutation.error?.message || null;

  const onSubmit = async (data: DriverFormValues) => {
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        area_ids: selectedAreas,
        ...(data.password && data.password.trim() !== '' && { password: data.password }),
      };

      if (isEditMode && id) {
        await updateDriverMutation.mutateAsync({ id, data: payload });
        toast.success('Driver updated successfully');
        navigate('/driver');
      } else {
        await createDriverMutation.mutateAsync(payload);
        toast.success('Driver created successfully');
        navigate('/driver');
      }
    } catch (error: any) {
      console.error('Error saving driver:', error);
    }
  };

  const handleCancel = () => {
    navigate('/driver');
  };

  const infoText = isEditMode
    ? 'You can update any field. Leave password blank to keep the current one.'
    : 'Make sure to use a strong password and valid information for the driver account.';

  // TODO: Add area selection component here
  // For now, using a simple text input for area_ids
  // You'll need to implement a proper area selector component

  return (
    <>
      <title>
        {isEditMode ? `Edit Driver | ${metadata.title}` : `Create Driver | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Driver Account' : 'Create New Driver'}
        description={
          isEditMode
            ? 'Update driver information and assigned areas'
            : 'Add a new driver to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingDriver}
        loadingText="Loading driver data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Driver' : 'Create Driver'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:user-rounded-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Full Name
            </Typography>
          </Box>
          <RHFTextField
            name="name"
            placeholder="e.g., John Doe"
            helperText="Enter the complete name of the driver"
            className="transition-all duration-200"
          />
        </Box>

        {/* Phone Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:phone-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Phone
            </Typography>
          </Box>
          <RHFTextField
            name="phone"
            type="tel"
            placeholder="e.g., +1234567890"
            helperText="A valid phone number is required"
            className="transition-all duration-200"
          />
        </Box>

        {/* Password Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:lock-password-outline"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {isEditMode ? 'New Password (Optional)' : 'Password'}
            </Typography>
          </Box>
          <RHFTextField
            name="password"
            type="password"
            placeholder={
              isEditMode ? 'Leave blank to keep current password' : 'Enter secure password'
            }
            helperText={
              isEditMode
                ? 'Only fill this if you want to change the password'
                : 'Must be at least 6 characters long'
            }
            className="transition-all duration-200"
          />
        </Box>

        {/* Address Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:map-point-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Address
            </Typography>
          </Box>
          <RHFTextField
            name="address"
            placeholder="e.g., 123 Main Street, City"
            helperText="Enter the driver's address"
            className="transition-all duration-200"
          />
        </Box>

        {/* Area IDs Field */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:map-point-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Area IDs
            </Typography>
          </Box>
          <Controller
            name="area_ids"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  placeholder="e.g., 1,2,3"
                  value={field.value?.map((a: { id: number }) => a.id).join(',') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const ids = value
                        .split(',')
                        .map((id) => id.trim())
                        .filter((id) => id)
                        .map((id) => ({ id: Number(id) }));
                      field.onChange(ids);
                      setSelectedAreas(ids);
                    } else {
                      field.onChange([]);
                      setSelectedAreas([]);
                    }
                  }}
                  error={!!error}
                  helperText={
                    error?.message || 'Enter area IDs separated by commas (e.g., 1,2,3)'
                  }
                  fullWidth
                  className="transition-all duration-200"
                />
                {selectedAreas.length > 0 && (
                  <Box className="mt-2 flex flex-wrap gap-2">
                    {selectedAreas.map((area, index) => (
                      <Box
                        key={index}
                        className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                      >
                        Area ID: {area.id}
                      </Box>
                    ))}
                  </Box>
                )}
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}

