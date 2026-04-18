import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useRef, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller } from 'react-hook-form';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useFetchCities } from '@/pages/dashboard/locations/hooks/city';
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

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/95 via-background/90 to-primary/[0.04] p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <Box className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <Box className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
      <Box className="relative">
        <Box className="mb-5 flex items-center gap-3 border-b border-border/40 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm">
            <Iconify icon={icon} width={22} height={22} />
          </span>
          <Typography variant="subtitle1" className="font-semibold text-foreground">
            {title}
          </Typography>
        </Box>
        <Box className="space-y-5">{children}</Box>
      </Box>
    </Box>
  );
}

function FieldLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <Box className="mb-2 flex items-center gap-2">
      <Iconify icon={icon} className="shrink-0 text-primary" width={22} height={22} />
      <Typography variant="subtitle2" className="font-semibold text-foreground">
        {label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const shopIdsTouchedRef = useRef(false);

  const { data: driverResponse, isLoading: isLoadingDriver } = useFetchDriverById(id || '');
  const { data: citiesResponse } = useFetchCities(1, 200);
  const { data: shopsResponse } = useFetchShops(1, 200);
  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();

  const cities = (citiesResponse as any)?.data?.items ?? [];
  const cityOptions = cities.map((c: any) => ({
    value: c.id,
    label: formatTranslated(c.name),
  }));

  const shops = (shopsResponse as any)?.data?.items ?? [];
  const shopOptions = shops.map((s: any) => ({
    value: s.id,
    label: formatTranslated(s.name),
  }));

  const defaultValues: DriverFormValues = {
    name: '',
    phone: '',
    ...(isEditMode ? {} : { password: '' }),
    address: '',
    city_ids: [],
    shop_ids: [],
    rate_per_order: '',
    vehicle_name: '',
    vehicle_type: '',
    vehicle_number: '',
    image: null,
    vehicle_image: null,
  };

  const methods = useForm<DriverFormValues>({
    resolver: zodResolver(isEditMode ? DriverUpdateSchema : DriverCreateSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, control } = methods;
  const imageFile = watch('image');
  const vehicleImageFile = watch('vehicle_image');

  const imagePreviewUrl = useMemo(() => {
    if (imageFile instanceof File) return URL.createObjectURL(imageFile);
    if (isEditMode && driverResponse?.data?.image && !imageFile)
      return driverResponse.data.image as string;
    return null;
  }, [imageFile, isEditMode, driverResponse?.data?.image]);

  const vehicleImagePreviewUrl = useMemo(() => {
    if (vehicleImageFile instanceof File) return URL.createObjectURL(vehicleImageFile);
    if (isEditMode && driverResponse?.data?.vehicle_image && !vehicleImageFile)
      return driverResponse.data.vehicle_image as string;
    return null;
  }, [vehicleImageFile, isEditMode, driverResponse?.data?.vehicle_image]);

  useEffect(() => {
    if (imageFile instanceof File && imagePreviewUrl?.startsWith('blob:')) {
      return () => URL.revokeObjectURL(imagePreviewUrl);
    }
    return undefined;
  }, [imageFile, imagePreviewUrl]);

  useEffect(() => {
    if (vehicleImageFile instanceof File && vehicleImagePreviewUrl?.startsWith('blob:')) {
      return () => URL.revokeObjectURL(vehicleImagePreviewUrl);
    }
    return undefined;
  }, [vehicleImageFile, vehicleImagePreviewUrl]);

  useEffect(() => {
    if (isEditMode && driverResponse?.data && !isLoadingDriver) {
      const driver = driverResponse.data;
      const cityIds = driver.cities?.map((city) => ({ id: city.id })) || [];
      const shopIds = driver.shops?.map((shop) => ({ id: shop.id })) ?? [];
      shopIdsTouchedRef.current = false;
      reset({
        name: driver.name ?? '',
        phone: driver.phone ?? '',
        address: driver.address ?? '',
        city_ids: cityIds,
        shop_ids: shopIds,
        rate_per_order: driver.rate_per_order != null ? String(driver.rate_per_order) : '',
        vehicle_name: driver.vehicle_name ?? '',
        vehicle_type: driver.vehicle_type ?? '',
        vehicle_number: driver.vehicle_number ?? '',
        image: null,
        vehicle_image: null,
      });
    }
  }, [driverResponse, isEditMode, isLoadingDriver, reset]);

  const isSubmitting = createDriverMutation.isPending || updateDriverMutation.isPending;
  const errorMessage =
    createDriverMutation.error?.message || updateDriverMutation.error?.message || null;

  const onSubmit = async (data: DriverFormValues) => {
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city_ids: data.city_ids,
        ...(!isEditMode && data.password && { password: data.password }),
        ...(data.rate_per_order !== '' && data.rate_per_order != null && {
          rate_per_order: typeof data.rate_per_order === 'number' ? data.rate_per_order : Number(data.rate_per_order) || data.rate_per_order,
        }),
        vehicle_name: data.vehicle_name ?? '',
        vehicle_type: data.vehicle_type ?? '',
        vehicle_number: data.vehicle_number ?? '',
        ...(data.image instanceof File ? { image: data.image } : {}),
        ...(data.vehicle_image instanceof File ? { vehicle_image: data.vehicle_image } : {}),
        ...(!isEditMode && data.shop_ids && data.shop_ids.length > 0
          ? { shop_ids: data.shop_ids }
          : {}),
        ...(isEditMode && shopIdsTouchedRef.current ? { shop_ids: data.shop_ids ?? [] } : {}),
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
        maxWidth="7xl"
        formInnerClassName="relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateDriverSubmit') : t('form.createDriverSubmit')}
        submittingLabel={isEditMode ? t('form.updatingDriver') : t('form.creatingDriver')}
        icon={<Iconify icon="solar:delivery-bold" className="text-primary" width={26} height={26} />}
      >
        {/* Left column — profile */}
        <Box className="relative space-y-6">
          <FormSection title={t('form.userDetailsBasicInfo')} icon="solar:user-rounded-bold">
            <Box>
              <FieldLabel icon="solar:user-rounded-bold" label={t('form.fullName')} />
              <RHFTextField
                name="name"
                placeholder={t('form.namePlaceholder')}
                helperText={t('form.driverNameHelper')}
              />
            </Box>

            <Box>
              <FieldLabel icon="solar:phone-bold" label={t('columns.phone')} />
              <RHFTextField
                name="phone"
                type="tel"
                placeholder={t('form.mobilePlaceholder')}
                helperText={t('form.driverPhoneHelper')}
              />
            </Box>

            {!isEditMode && (
              <Box>
                <FieldLabel icon="solar:lock-password-outline" label={t('form.passwordLabel')} />
                <RHFTextField
                  name="password"
                  type="password"
                  placeholder={t('form.passwordPlaceholder')}
                  helperText={t('form.driverPasswordHelper')}
                />
              </Box>
            )}

            <Box>
              <FieldLabel icon="solar:gallery-add-bold" label={t('form.driverPhotoLabel')} />
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
                        (isEditMode ? t('form.imageHelperEdit') : t('form.imageHelper'))
                      }
                      fullWidth
                    />
                    {imagePreviewUrl && (
                      <Box className="mt-4 flex justify-center sm:justify-start">
                        <img
                          src={imagePreviewUrl}
                          alt={t('form.driverPhotoPreviewAlt')}
                          className="h-36 w-36 rounded-2xl border border-border/50 object-cover shadow-md ring-2 ring-primary/15"
                        />
                      </Box>
                    )}
                  </div>
                )}
              />
            </Box>
          </FormSection>

          <FormSection title={t('columns.address')} icon="solar:map-point-bold">
            <Box>
              <RHFTextField
                name="address"
                placeholder={t('form.namePlaceholder')}
                helperText={t('form.driverAddressHelper')}
              />
            </Box>
          </FormSection>
        </Box>

        {/* Right column — areas & vehicle */}
        <Box className="relative space-y-6">
          <FormSection title={t('form.driverAreasRequired')} icon="solar:map-point-bold">
            <Box>
              <FieldLabel icon="solar:map-point-bold" label={t('form.driverCitiesRequired')} />
              <Controller
                name="city_ids"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full">
                    <MultiSelect
                      options={cityOptions}
                      value={field.value?.map((c: { id: number }) => c.id) ?? []}
                      onChange={(ids) => {
                        const mapped = (ids as (string | number)[]).map((cityId) => ({
                          id: Number(cityId),
                        }));
                        field.onChange(mapped);
                      }}
                      placeholder={t('form.selectCities')}
                      isDisabled={cityOptions.length === 0}
                    />
                    {error?.message && (
                      <Typography variant="caption" className="mt-1 block text-destructive">
                        {error.message}
                      </Typography>
                    )}
                  </div>
                )}
              />
            </Box>

            <Box>
              <FieldLabel icon="solar:shop-bold" label={t('form.driverShopsOptional')} />
              <Controller
                name="shop_ids"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full">
                    <MultiSelect
                      options={shopOptions}
                      value={field.value?.map((s: { id: number }) => s.id) ?? []}
                      onChange={(ids) => {
                        shopIdsTouchedRef.current = true;
                        const mapped = (ids as (string | number)[]).map((sid) => ({
                          id: Number(sid),
                        }));
                        field.onChange(mapped);
                      }}
                      placeholder={t('form.driverShopsPlaceholder')}
                      isDisabled={shopOptions.length === 0}
                    />
                    {error?.message && (
                      <Typography variant="caption" className="mt-1 block text-destructive">
                        {error.message}
                      </Typography>
                    )}
                    <Typography variant="caption" className="mt-1 block text-muted-foreground">
                      {t('form.driverShopsHelper')}
                    </Typography>
                  </div>
                )}
              />
            </Box>

            <Box>
              <FieldLabel icon="solar:wallet-money-bold" label={t('form.driverRatePerOrderField')} />
              <RHFTextField
                name="rate_per_order"
                placeholder={t('form.driverCommissionRateExample')}
              />
            </Box>
          </FormSection>

          <FormSection title={t('columns.vehicleName')} icon="solar:delivery-bold">
            <Box className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Box className="sm:col-span-1">
                <FieldLabel icon="solar:delivery-bold" label={t('form.driverVehicleNameField')} />
                <RHFTextField
                  name="vehicle_name"
                  placeholder={t('form.vehicleNamePlaceholder')}
                  helperText={t('form.driverVehicleNameHelper')}
                />
              </Box>
              <Box className="sm:col-span-1">
                <FieldLabel icon="solar:box-bold" label={t('form.driverVehicleTypeField')} />
                <RHFTextField
                  name="vehicle_type"
                  placeholder={t('form.vehicleTypePlaceholder')}
                  helperText={t('form.driverVehicleTypeHelper')}
                />
              </Box>
            </Box>

            <Box>
              <FieldLabel icon="solar:card-recive-bold" label={t('form.driverVehicleNumberField')} />
              <RHFTextField
                name="vehicle_number"
                placeholder={t('form.vehiclePlatePlaceholder')}
              />
            </Box>

            <Box>
              <FieldLabel icon="solar:gallery-add-bold" label={t('form.driverVehicleImageLabel')} />
              <Controller
                name="vehicle_image"
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
                          ? t('form.driverVehicleImageHelperEdit')
                          : t('form.driverVehicleImageHelper'))
                      }
                      fullWidth
                    />
                    {vehicleImagePreviewUrl && (
                      <Box className="mt-4 flex justify-center sm:justify-start">
                        <img
                          src={vehicleImagePreviewUrl}
                          alt={t('form.driverVehicleImagePreviewAlt')}
                          className="h-36 w-36 rounded-2xl border border-border/50 object-cover shadow-md ring-2 ring-primary/15"
                        />
                      </Box>
                    )}
                  </div>
                )}
              />
            </Box>
          </FormSection>
        </Box>
      </CreateFormLayout>
    </>
  );
}
