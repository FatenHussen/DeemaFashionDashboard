import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller } from 'react-hook-form';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import {
  useCreateDriver,
  useUpdateDriver,
  useFetchDriverById,
} from '@/pages/dashboard/driver/hooks/driver';
import {
  DriverCreateSchema,
  DriverUpdateSchema,
  type DriverFormValues,
} from '@/pages/dashboard/driver/validation/driver.validation';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
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
    ...(isEditMode ? {} : { password: '' }),
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
    return undefined;
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
        ...(!isEditMode && data.password && { password: data.password }),
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
        toast.success(t('form.driverUpdatedSuccess'));
        navigate('/driver');
      } else {
        await createDriverMutation.mutateAsync(payload);
        toast.success(t('form.driverCreatedSuccess'));
        navigate('/driver');
      }
    } catch (error: any) {
      console.error('Error saving driver:', error);
    }
  };

  const handleCancel = () => {
    navigate('/driver');
  };

  const infoText = isEditMode ? t('form.driverFormInfoEdit') : t('form.driverFormInfoCreate');

  // TODO: Add area selection component here
  // For now, using a simple text input for area_ids
  // You'll need to implement a proper area selector component

  return (
    <>
      <title>
        {isEditMode
          ? t('form.driverEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.driverCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editDriver') : t('form.createDriver')}
        description={isEditMode ? t('form.driverEditPageDesc') : t('form.driverCreatePageDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingDriver}
        loadingText={t('form.loadingDriver')}
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateDriverSubmit') : t('form.createDriverSubmit')}
        submittingLabel={isEditMode ? t('form.updatingDriver') : t('form.creatingDriver')}
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
              {t('form.fullName')}
            </Typography>
          </Box>
          <RHFTextField
            name="name"
            placeholder={t('form.namePlaceholder')}
            helperText={t('form.driverNameHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Phone Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:phone-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.phone')}
            </Typography>
          </Box>
          <RHFTextField
            name="phone"
            type="tel"
            placeholder={t('form.mobilePlaceholder')}
            helperText={t('form.driverPhoneHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {!isEditMode && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:lock-password-outline"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.passwordLabel')}
              </Typography>
            </Box>
            <RHFTextField
              name="password"
              type="password"
              placeholder={t('form.passwordPlaceholder')}
              helperText={t('form.driverPasswordHelper')}
              className="transition-all duration-200"
            />
          </Box>
        )}

        {/* Address Field with Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:map-point-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.address')}
            </Typography>
          </Box>
          <RHFTextField
            name="address"
            placeholder={t('form.namePlaceholder')}
            helperText={t('form.driverAddressHelper')}
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
              {t('form.driverPhotoLabel')}
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
                      ? t('form.imageHelperEdit')
                      : t('form.imageHelper'))
                  }
                  fullWidth
                  className="transition-all duration-200"
                />
                {imagePreviewUrl && (
                  <Box className="mt-4">
                    <img
                      src={imagePreviewUrl}
                      alt={t('form.driverPhotoPreviewAlt')}
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
              {t('form.driverAreasRequired')}
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
                    const mappedAreas = (ids as (string | number)[]).map((areaId) => ({
                      id: Number(areaId),
                    }));
                    field.onChange(mappedAreas);
                    setSelectedAreas(mappedAreas);
                  }}
                  placeholder={t('form.selectAreas')}
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
              {t('form.driverRatePerOrderField')}
            </Typography>
          </Box>
          <RHFTextField
            name="rate_per_order"
            placeholder={t('form.driverCommissionRateExample')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Vehicle Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:delivery-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.driverVehicleTypeField')}
            </Typography>
          </Box>
          <RHFTextField
            name="vehicle_type"
            placeholder={t('form.vehicleTypePlaceholder')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Vehicle Number */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:card-recive-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.driverVehicleNumberField')}
            </Typography>
          </Box>
          <RHFTextField
            name="vehicle_number"
            placeholder={t('form.vehiclePlatePlaceholder')}
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}

