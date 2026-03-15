import type { DaySchedule } from '@/pages/dashboard/vendor/types/shop.types';

import { toast } from 'react-toastify';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { MultiSelect } from '@/shared/ui/multi-select';
import { formatTranslated } from '@/utils/format-translated';
import { MapPicker } from '@/shared/components/map/map-picker';
import { _AreaApi } from '@/pages/dashboard/locations/api/area.services';
import { useFetchServices } from '@/pages/dashboard/vendor/hooks/service';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
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
import { Box, Input, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { StepperFormLayout } from 'src/shared/components/forms/stepper-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const metadata = { title: `Shop ${CONFIG.appName}` };

const vendorFetcher = (page: number, limit: number) =>
  _VendorApi.getListVendor({ page, limit }).then((r) => ({
    data: {
      items: r.data.items.map((vendor) => ({ id: vendor.id, label: vendor.name })),
      pagination: r.data.pagination,
    },
  }));

// Areas API loads all at once — fake single-page pagination
const areaFetcherForShop = (_page: number, _limit: number) =>
  _AreaApi.getListAreas().then((r) => ({
    data: {
      items: r.data.items.map((area) => ({ id: area.id, label: area.name })),
      pagination: r.data.pagination,
    },
  }));

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
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: shopData, isLoading: isLoadingShop } = useFetchShopById(id || '');
  const { data: servicesResponse } = useFetchServices(1, 200);
  const createShopMutation = useCreateShop();
  const updateShopMutation = useUpdateShop();

  const services = (servicesResponse as any)?.data?.items ?? [];
  const serviceOptions = services.map((s: any) => ({
    value: s.id,
    label: formatTranslated(s.name),
  }));

  const defaultValues: ShopFormValues = {
    vendor_id: 0,
    logo: null,
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
  const logoFile = watch('logo');

  const logoPreviewUrl = useMemo(() => {
    if (logoFile instanceof File) return URL.createObjectURL(logoFile);
    if (isEditMode && shopData?.data?.logo_url && !logoFile)
      return shopData.data.logo_url as string;
    return null;
  }, [logoFile, isEditMode, shopData?.data?.logo_url]);

  useEffect(() => {
    if (logoFile instanceof File && logoPreviewUrl?.startsWith('blob:')) {
      return () => URL.revokeObjectURL(logoPreviewUrl);
    }
    return undefined;
  }, [logoFile, logoPreviewUrl]);

  // Fetch shop data if in edit mode (GET admin/shops/:id)
  useEffect(() => {
    const shop = shopData?.data;
    if (isEditMode && shop && !isLoadingShop) {
      const toBilingual = (val: unknown): { ar: string; en: string } => {
        if (typeof val === 'string') return { ar: val, en: val };
        if (Array.isArray(val)) return { ar: String(val?.[0] ?? ''), en: String(val?.[1] ?? '') };
        if (val && typeof val === 'object' && 'ar' in val && 'en' in val)
          return { ar: String((val as { ar: unknown; en: unknown }).ar ?? ''), en: String((val as { ar: unknown; en: unknown }).en ?? '') };
        return { ar: '', en: '' };
      };

      const nameValue = toBilingual(shop.name);
      const descriptionValue = toBilingual(shop.description);
      const addressValue = toBilingual(shop.address);

      const rawServices = shop.services ?? shop.service_ids ?? [];
      const serviceIds = rawServices.map((s: { id?: number } | number) =>
        typeof s === 'object' && s?.id != null ? { id: s.id } : { id: Number(s) }
      );

      reset({
        vendor_id: shop.vendor_id ?? shop.vendor?.id ?? 0,
        logo: null,
        name: nameValue,
        description: descriptionValue,
        address: addressValue,
        lat: Number(shop.lat ?? shop.area?.lat ?? 0),
        lng: Number(shop.lng ?? shop.area?.lng ?? 0),
        phone: shop.phone ?? '',
        mobile: shop.mobile ?? '',
        email: shop.email ?? '',
        working_hours: shop.working_hours ?? defaultValues.working_hours,
        is_active: shop.is_active,
        area_id: shop.area?.id ?? shop.area_id ?? 0,
        service_ids: serviceIds,
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
        logo:
          data.logo instanceof File
            ? data.logo
            : isEditMode && shopData?.data?.logo_url
              ? shopData.data.logo_url
              : undefined,
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
        await updateShopMutation.mutateAsync({ id, data: payload as any });
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
              label={t('form.openTime')}
              className="transition-all duration-200"
            />
            <RHFTextField
              name={`working_hours.${day}.close`}
              type="time"
              label={t('form.closeTime')}
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
            <RHFInfiniteSelect
              name="vendor_id"
              queryKey={['vendors', 'infinite', 'shop-form']}
              fetcher={vendorFetcher}
              placeholder={t('form.selectVendor')}
              helperText={t('form.selectVendorHelper')}
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
                {t('form.storeNameAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.ar"
                placeholder={t('form.storeNameAr')}
                helperText={t('form.shopNameArHelper')}
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
                {t('form.storeNameEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="name.en"
                placeholder={t('form.storeNameEn')}
                helperText={t('form.shopNameEnHelper')}
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
                {t('form.descriptionAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="description.ar"
                placeholder={t('form.storeDescAr')}
                helperText={t('form.shopDescArHelper')}
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
                {t('form.descriptionEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="description.en"
                placeholder={t('form.storeDescEn')}
                helperText={t('form.shopDescEnHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>

          {/* Shop Logo Upload */}
          <Box className="group">
            <Box className="flex items-center gap-2.5 mb-3">
              <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:gallery-add-bold"
                  className="text-primary"
                  width={16}
                  height={16}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Shop Logo
              </Typography>
            </Box>
            <Controller
              name="logo"
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
                        ? 'Leave empty to keep current logo'
                        : 'Upload a shop logo (optional, max 2MB)')
                    }
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {logoPreviewUrl && (
                    <Box className="mt-4">
                      <img
                        src={logoPreviewUrl}
                        alt="Shop logo preview"
                        className="w-24 h-24 rounded-xl object-cover border border-border/60"
                      />
                    </Box>
                  )}
                </div>
              )}
            />
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
                {t('form.addressAr')}
                </Typography>
              </Box>
              <RHFTextField
                name="address.ar"
                placeholder={t('form.addressPlaceholderAr')}
                helperText={t('form.shopAddressArHelper')}
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
                {t('form.addressEn')}
                </Typography>
              </Box>
              <RHFTextField
                name="address.en"
                placeholder={t('form.addressPlaceholderEn')}
                helperText={t('form.shopAddressEnHelper')}
                className="transition-all duration-200"
              />
            </Box>
          </Box>

          {/* Map Picker - Select location by clicking on the map */}
          <Box className="group">
            <Box className="flex items-center gap-2.5 mb-3">
              <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:map-point-bold"
                  className="text-primary"
                  width={16}
                  height={16}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Location
              </Typography>
            </Box>
            <Typography variant="caption" className="text-muted-foreground block mb-2">
              Click on the map to set the shop location
            </Typography>
            <MapPicker
              lat={String(watch('lat') ?? '')}
              lng={String(watch('lng') ?? '')}
              onChange={(latStr, lngStr) => {
                const latNum = parseFloat(latStr);
                const lngNum = parseFloat(lngStr);
                if (!Number.isNaN(latNum)) methods.setValue('lat', latNum);
                if (!Number.isNaN(lngNum)) methods.setValue('lng', lngNum);
              }}
              height="320px"
              className="w-full"
            />
            <Box className="mt-3 grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="caption" className="text-muted-foreground">
                  Latitude
                </Typography>
                <Typography variant="body2" className="font-mono font-medium">
                  {watch('lat') ?? '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-muted-foreground">
                  Longitude
                </Typography>
                <Typography variant="body2" className="font-mono font-medium">
                  {watch('lng') ?? '-'}
                </Typography>
              </Box>
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
                {t('columns.phone')}
                </Typography>
              </Box>
              <RHFTextField
                name="phone"
                placeholder={t('form.phonePlaceholder')}
                helperText={t('form.shopPhoneHelper')}
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
                {t('form.mobileLabel')}
                </Typography>
              </Box>
              <RHFTextField
                name="mobile"
                placeholder={t('form.mobilePlaceholder')}
                helperText={t('form.shopMobileHelper')}
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
                {t('columns.email')}
                </Typography>
              </Box>
              <RHFTextField
                name="email"
                type="email"
                placeholder={t('form.emailPlaceholder')}
                helperText={t('form.shopEmailHelper')}
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
                {t('areaLabel')}
                </Typography>
              </Box>
              <RHFInfiniteSelect
                name="area_id"
                queryKey={['areas', 'infinite', 'shop-form']}
                fetcher={areaFetcherForShop}
                placeholder={t('form.selectArea')}
                helperText={t('form.selectAreaHelper')}
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
                  Services
                </Typography>
              </Box>
              <Controller
                name="service_ids"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full">
                    <MultiSelect
                      options={serviceOptions}
                      value={field.value?.map((s) => s.id) ?? []}
                      onChange={(ids) =>
                        field.onChange(
                          (ids as (string | number)[]).map((sid) => ({ id: Number(sid) }))
                        )
                      }
                      placeholder={t('form.selectServices')}
                      isDisabled={serviceOptions.length === 0}
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
        onSubmit={handleSubmit(
          (data) => {
            console.log('[Shop] Submit OK', data);
            onSubmit(data);
          },
          (errors) => {
            console.log('[Shop] Validation failed', errors);
            const getFirstMessage = (obj: unknown): string | null => {
              if (!obj || typeof obj !== 'object') return null;
              const o = obj as Record<string, unknown>;
              if (typeof o.message === 'string') return o.message;
              for (const v of Object.values(o)) {
                const m = getFirstMessage(v);
                if (m) return m;
              }
              return null;
            };
            const msg = getFirstMessage(errors);
            if (msg) toast.error(msg);
          }
        )}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Shop' : 'Create New Shop'}
        description={
          isEditMode ? 'Update shop information and working hours' : 'Add a new shop to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingShop}
        loadingText={t('form.loadingShop')}
        maxWidth="4xl"
        steps={steps}
        submitLabel={isEditMode ? 'Update Shop' : 'Create Shop'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      />
    </>
  );
}
