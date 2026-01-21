import type { DaySchedule } from '@/pages/dashboard/vendor/types/shop.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchVendors } from '@/pages/dashboard/vendor/hooks/vendor';
import {
  ShopSchema,
  type ShopFormValues,
} from '@/pages/dashboard/vendor/validation/shop.validation';
import {
  useCreateShop,
  useUpdateShop,
  useFetchShopById,
} from '@/pages/dashboard/vendor/hooks/shop';

import { CONFIG } from 'src/global-config';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { Box, Input, Checkbox, Typography, SimpleSelect } from 'src/shared/ui';
import { StepperFormLayout } from 'src/shared/components/forms/stepper-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Shop ${CONFIG.appName}` };

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: shopData, isLoading: isLoadingShop } = useFetchShopById(id || '');
  const { data: vendorsResponse } = useFetchVendors();
  const createShopMutation = useCreateShop();
  const updateShopMutation = useUpdateShop();

  // Prepare vendor options
  const vendorOptions =
    vendorsResponse?.data?.items.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
    })) || [];

  const defaultValues: ShopFormValues = {
    vendor_id: 0,
    name: {
      ar: '',
      en: '',
    },
    description: {
      ar: '',
      en: '',
    },
    address: {
      ar: '',
      en: '',
    },
    lat: 0,
    lng: 0,
    phone: '',
    mobile: '',
    email: '',
    working_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { closed: true },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
    is_active: true,
    area_id: 0,
    service_ids: [],
  };

  const methods = useForm<ShopFormValues>({
    resolver: zodResolver(ShopSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;

  // Fetch shop data if in edit mode
  useEffect(() => {
    if (isEditMode && shopData && !isLoadingShop) {
      // Note: API might return name as string, but form expects {ar, en}
      const nameValue =
        typeof shopData.name === 'string'
          ? { ar: shopData.name, en: shopData.name }
          : shopData.name || { ar: '', en: '' };

      const descriptionValue =
        typeof shopData.description === 'string'
          ? { ar: shopData.description, en: shopData.description }
          : shopData.description || { ar: '', en: '' };

      const addressValue =
        typeof shopData.address === 'string'
          ? { ar: shopData.address, en: shopData.address }
          : shopData.address || { ar: '', en: '' };

      reset({
        vendor_id: shopData.vendor_id,
        name: nameValue,
        description: descriptionValue,
        address: addressValue,
        lat: shopData.lat || 0,
        lng: shopData.lng || 0,
        phone: shopData.phone || '',
        mobile: shopData.mobile || '',
        email: shopData.email || '',
        working_hours: shopData.working_hours || defaultValues.working_hours,
        is_active: shopData.is_active,
        area_id: shopData.area_id || 0,
        service_ids: shopData.service_ids || [],
      });
    }
  }, [shopData, isEditMode, isLoadingShop, reset]);

  const isSubmitting = createShopMutation.isPending || updateShopMutation.isPending;
  const errorMessage =
    createShopMutation.error?.message || updateShopMutation.error?.message || null;

  const onSubmit = async (data: ShopFormValues) => {
    try {
      const payload = {
        vendor_id: data.vendor_id,
        name: {
          ar: data.name.ar,
          en: data.name.en,
        },
        description: {
          ar: data.description.ar,
          en: data.description.en,
        },
        address: {
          ar: data.address.ar,
          en: data.address.en,
        },
        lat: data.lat,
        lng: data.lng,
        phone: data.phone,
        mobile: data.mobile,
        email: data.email,
        working_hours: data.working_hours,
        is_active: data.is_active,
        area_id: data.area_id,
        service_ids: data.service_ids,
      };

      if (isEditMode && id) {
        await updateShopMutation.mutateAsync({ id, data: payload });
        toast.success('Shop updated successfully');
        navigate('/shop');
      } else {
        await createShopMutation.mutateAsync(payload);
        toast.success('Shop created successfully');
        navigate('/shop');
      }
    } catch (error: any) {
      console.error('Error saving shop:', error);
    }
  };

  const handleCancel = () => {
    navigate('/shop');
  };

  const infoText = isEditMode
    ? 'You can update any field. Make sure all required fields are filled.'
    : 'Fill in all required fields to create a new shop. Working hours and location details are important for customers.';

  // Working Hours Component
  const WorkingHoursField = ({ day }: { day: (typeof DAYS_OF_WEEK)[number]['key'] }) => {
    const daySchedule = watch(`working_hours.${day}`) as DaySchedule | undefined;
    const isClosed = daySchedule?.closed || false;

    return (
      <Box className="group relative p-5 border border-border/60 rounded-xl bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center gap-2.5">
            <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Iconify
                icon="solar:clock-circle-bold"
                className="text-primary"
                width={16}
                height={16}
              />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {DAYS_OF_WEEK.find((d) => d.key === day)?.label}
            </Typography>
          </Box>
          <Controller
            name={`working_hours.${day}.closed`}
            control={control}
            render={({ field }) => (
              <Box className="flex items-center gap-2">
                <Box
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    field.value
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                  }`}
                >
                  <Checkbox
                    checked={field.value || false}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      if (e.target.checked) {
                        methods.setValue(`working_hours.${day}.open`, undefined);
                        methods.setValue(`working_hours.${day}.close`, undefined);
                      } else {
                        methods.setValue(`working_hours.${day}.open`, '09:00');
                        methods.setValue(`working_hours.${day}.close`, '18:00');
                      }
                    }}
                    label={
                      <span
                        className={`text-xs font-medium ${field.value ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}
                      >
                        {field.value ? 'Closed' : 'Open'}
                      </span>
                    }
                  />
                </Box>
              </Box>
            )}
          />
        </Box>
        {!isClosed && (
          <Box className="grid grid-cols-2 gap-3">
            <RHFTextField
              name={`working_hours.${day}.open`}
              type="time"
              label="Open Time"
              className="transition-all duration-200"
            />
            <RHFTextField
              name={`working_hours.${day}.close`}
              type="time"
              label="Close Time"
              className="transition-all duration-200"
            />
          </Box>
        )}
        {isClosed && (
          <Box className="py-2 text-center">
            <Typography variant="caption" className="text-muted-foreground italic">
              Shop is closed on this day
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Define steps for the stepper
  const steps = [
    {
      label: 'Basic Information',
      description: 'Shop name and details',
      icon: 'solar:case-minimalistic-bold',
      content: (
        <Box className="space-y-6">
          {/* Vendor Selection */}
          <Box className="group">
            <Box className="flex items-center gap-2.5 mb-3">
              <Box className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center">
                <Iconify
                  icon="solar:case-minimalistic-bold"
                  className="text-muted-foreground"
                  width={16}
                  height={16}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Vendor
              </Typography>
            </Box>
            <Controller
              name="vendor_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SimpleSelect
                  value={field.value}
                  onChange={(value) => field.onChange(Number(value))}
                  options={vendorOptions}
                  placeholder="Select a vendor"
                  error={!!error}
                  helperText={error?.message || 'Select the vendor that owns this shop'}
                  fullWidth
                />
              )}
            />
          </Box>

          {/* Shop Name - Bilingual */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:case-minimalistic-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Shop Name (Arabic)
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder="e.g., متجر تجريبي"
                helperText="Enter the shop name in Arabic"
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:case-minimalistic-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Shop Name (English)
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder="e.g., Test Store"
                helperText="Enter the shop name in English"
                className="transition-all duration-200"
              />
            </Box>
          </Box>

          {/* Description - Bilingual */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:notes-bold-duotone"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Description (Arabic)
                </Typography>
              </Box>
              <RHFTextField
                name="description.ar"
                placeholder="e.g., متجر تجريبي لبيع المواد الغذائية"
                helperText="Enter the shop description in Arabic"
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:notes-bold-duotone"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Description (English)
                </Typography>
              </Box>
              <RHFTextField
                name="description.en"
                placeholder="e.g., Test store for groceries"
                helperText="Enter the shop description in English"
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Location',
      description: 'Address and coordinates',
      icon: 'solar:case-minimalistic-bold',
      content: (
        <Box className="space-y-6">
          {/* Address - Bilingual */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:case-minimalistic-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Address (Arabic)
                </Typography>
              </Box>
              <RHFTextField
                name="address.ar"
                placeholder="e.g., دمشق - المزة"
                helperText="Enter the shop address in Arabic"
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:case-minimalistic-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Address (English)
                </Typography>
              </Box>
              <RHFTextField
                name="address.en"
                placeholder="e.g., Damascus - Mazzeh"
                helperText="Enter the shop address in English"
                className="transition-all duration-200"
              />
            </Box>
          </Box>

          {/* Coordinates */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:settings-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Latitude
                </Typography>
              </Box>
              <RHFTextField
                name="lat"
                type="number"
                placeholder="e.g., 33.5138"
                helperText="Enter the latitude coordinate"
                className="transition-all duration-200"
              />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:settings-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Longitude
                </Typography>
              </Box>
              <RHFTextField
                name="lng"
                type="number"
                placeholder="e.g., 36.2765"
                helperText="Enter the longitude coordinate"
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Contact',
      description: 'Phone and email',
      icon: 'solar:phone-bold',
      content: (
        <Box className="space-y-6">
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:phone-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Phone
                </Typography>
              </Box>
              <RHFTextField
                name="phone"
                placeholder="e.g., 0111234567"
                helperText="Enter the shop phone number"
                className="transition-all duration-200"
              />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:smartphone-2-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Mobile
                </Typography>
              </Box>
              <RHFTextField
                name="mobile"
                placeholder="e.g., +963944000222"
                helperText="Enter the shop mobile number"
                className="transition-all duration-200"
              />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:letter-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Email
                </Typography>
              </Box>
              <RHFTextField
                name="email"
                type="email"
                placeholder="e.g., teststore@example.com"
                helperText="Enter the shop email address"
                className="transition-all duration-200"
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Working Hours',
      description: 'Schedule and availability',
      icon: 'solar:clock-circle-bold',
      content: (
        <Box className="space-y-6">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <WorkingHoursField key={day.key} day={day.key} />
            ))}
          </Box>
        </Box>
      ),
    },
    {
      label: 'Settings',
      description: 'Additional configuration',
      icon: 'solar:settings-bold',
      content: (
        <Box className="space-y-6">
          {/* Area ID & Service IDs */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:case-minimalistic-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Area ID
                </Typography>
              </Box>
              <RHFTextField
                name="area_id"
                type="number"
                placeholder="e.g., 1"
                helperText="Enter the area ID"
                className="transition-all duration-200"
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2.5 mb-3">
                <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:settings-bold"
                    className="text-primary"
                    width={16}
                    height={16}
                  />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Service IDs
                </Typography>
              </Box>
              <Controller
                name="service_ids"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full">
                    <Input
                      placeholder="e.g., 1,2"
                      value={field.value?.map((s) => s.id).join(',') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const ids = value
                            .split(',')
                            .map((areaId) => areaId.trim())
                            .filter((areaId) => areaId)
                            .map((areaId) => ({ id: Number(areaId) }));
                          field.onChange(ids);
                        } else {
                          field.onChange([]);
                        }
                      }}
                      error={!!error}
                      helperText={
                        error?.message || 'Enter service IDs separated by commas (e.g., 1,2)'
                      }
                      fullWidth
                      className="transition-all duration-200"
                    />
                  </div>
                )}
              />
            </Box>
          </Box>

          {/* Active Status */}
          <Box className="group pt-2">
            <Box className="flex items-center gap-2.5 mb-3">
              <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:check-circle-bold"
                  className="text-primary"
                  width={16}
                  height={16}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Active Status
              </Typography>
            </Box>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Box className="p-4 rounded-lg border border-border/60 bg-card/30 hover:bg-card/50 transition-colors">
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    label={
                      <span className="text-sm font-medium text-foreground">
                        Mark shop as active
                      </span>
                    }
                  />
                </Box>
              )}
            />
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <>
      <title>
        {isEditMode ? `Edit Shop | ${metadata.title}` : `Create Shop | ${metadata.title}`}
      </title>

      <StepperFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Shop' : 'Create New Shop'}
        description={
          isEditMode ? 'Update shop information and working hours' : 'Add a new shop to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingShop}
        loadingText="Loading shop data..."
        maxWidth="4xl"
        steps={steps}
        submitLabel={isEditMode ? 'Update Shop' : 'Create Shop'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
       />
    </>
  );
}
