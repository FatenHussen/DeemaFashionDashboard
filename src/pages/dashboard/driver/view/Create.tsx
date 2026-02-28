import { toast } from 'react-toastify';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller } from 'react-hook-form';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import {
  DriverCreateSchema,
  DriverUpdateSchema,
  type DriverFormValues,
} from '@/pages/dashboard/driver/validation/driver.validation';
import {
  useCreateDriver,
  useUpdateDriver,
  useFetchDriverById,
} from '@/pages/dashboard/driver/hooks/driver';

import { CONFIG } from 'src/global-config';
import { Box, Typography, Input } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Driver ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedAreas, setSelectedAreas] = useState<Array<{ id: number }>>([]);

  // Hooks for fetching and mutations
  const { data: driverResponse, isLoading: isLoadingDriver } = useFetchDriverById(id || '');
  const { data: areasResponse } = useFetchAreas(1, 200);
  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();

  const areas = (areasResponse as any)?.data?.items ?? [];
  const areaOptions = areas.map((a: any) => ({
    value: a.id,
    label: formatTranslated(a.name),
  }));

  const defaultValues: DriverFormValues = {
    name: '',
    phone: '',
    password: '',
    address: '',
    area_ids: [],
    rate_per_order: '',
    vehicle_type: '',
    vehicle_number: '',
    image: null,
  };

  const methods = useForm<DriverFormValues>({
    resolver: zodResolver(isEditMode ? DriverUpdateSchema : DriverCreateSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;
  const imageFile = watch('image');

  const imagePreviewUrl = useMemo(() => {
    if (imageFile instanceof File) return URL.createObjectURL(imageFile);
    if (isEditMode && driverResponse?.data?.image && !imageFile)
      return driverResponse.data.image as string;
    return null;
  }, [imageFile, isEditMode, driverResponse?.data?.image]);

  useEffect(() => {
    if (imageFile instanceof File && imagePreviewUrl?.startsWith('blob:')) {
      return () => URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imageFile, imagePreviewUrl]);

  // Fetch driver data if in edit mode
  useEffect(() => {
    if (isEditMode && driverResponse?.data && !isLoadingDriver) {
      const driver = driverResponse.data;
      const areaIds = driver.areas?.map((area) => ({ id: area.id })) || [];
      setSelectedAreas(areaIds);
      reset({
        name: driver.name ?? '',
        phone: driver.phone ?? '',
        password: '',
        address: driver.address ?? '',
        area_ids: areaIds,
        rate_per_order: driver.rate_per_order != null ? String(driver.rate_per_order) : '',
        vehicle_type: driver.vehicle_type ?? '',
        vehicle_number: driver.vehicle_number ?? '',
        image: null,
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
        ...(!isEditMode ? { password: data.password || '' } : (data.password?.trim() ? { password: data.password } : {})),
        ...(data.rate_per_order !== '' && data.rate_per_order != null && {
          rate_per_order: typeof data.rate_per_order === 'number' ? data.rate_per_order : Number(data.rate_per_order) || data.rate_per_order,
        }),
        ...(data.vehicle_type && { vehicle_type: data.vehicle_type }),
        vehicle_number: data.vehicle_number ?? '',
        image:
          data.image instanceof File
            ? data.image
            : isEditMode && driverResponse?.data?.image
              ? driverResponse.data.image
              : undefined,
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
                : 'Must be at least 8 characters long'
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

        {/* Driver Image Upload */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Driver Photo
            </Typography>
          </Box>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file || null);
                  }}
                  error={!!error}
                  helperText={
                    error?.message ||
                    (isEditMode
                      ? 'Leave empty to keep current photo'
                      : 'Upload driver photo (optional, max 2MB)')
                  }
                  fullWidth
                  className="transition-all duration-200"
                />
                {imagePreviewUrl && (
                  <Box className="mt-4">
                    <img
                      src={imagePreviewUrl}
                      alt="Driver photo preview"
                      className="w-24 h-24 rounded-xl object-cover border border-border/60"
                    />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        {/* Areas Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:map-point-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Areas *
            </Typography>
          </Box>
          <Controller
            name="area_ids"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="w-full">
                <MultiSelect
                  options={areaOptions}
                  value={field.value?.map((a: { id: number }) => a.id) ?? []}
                  onChange={(ids) => {
                    const areaIds = (ids as (string | number)[]).map((id) => ({ id: Number(id) }));
                    field.onChange(areaIds);
                    setSelectedAreas(areaIds);
                  }}
                  placeholder="Select areas..."
                  isDisabled={areaOptions.length === 0}
                />
                {error?.message && (
                  <Typography variant="caption" className="text-destructive mt-1 block">
                    {error.message}
                  </Typography>
                )}
              </div>
            )}
          />
        </Box>

        {/* Rate per Order */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:wallet-money-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Rate per Order
            </Typography>
          </Box>
          <RHFTextField
            name="rate_per_order"
            placeholder="e.g., 5.00"
            className="transition-all duration-200"
          />
        </Box>

        {/* Vehicle Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:delivery-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Vehicle Type
            </Typography>
          </Box>
          <RHFTextField
            name="vehicle_type"
            placeholder="e.g., Motorcycle, Car"
            className="transition-all duration-200"
          />
        </Box>

        {/* Vehicle Number */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:card-recive-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Vehicle Number
            </Typography>
          </Box>
          <RHFTextField
            name="vehicle_number"
            placeholder="e.g., ABC-1234"
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}

