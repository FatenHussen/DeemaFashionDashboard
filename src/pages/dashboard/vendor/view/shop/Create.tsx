import type { ShopData, DaySchedule, WorkingHours } from '@/pages/dashboard/vendor/types/shop.types';

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
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

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

const SHOP_DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type ShopDayKey = (typeof SHOP_DAY_KEYS)[number];

const DEFAULT_WORKING_HOURS_TEMPLATE: ShopFormValues['working_hours'] = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { closed: true },
  saturday: { open: '10:00', close: '16:00' },
  sunday: { open: '10:00', close: '16:00' },
};

function parseOpenCloseRange(value: string): { open: string; close: string } | null {
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!m) return null;
  return { open: m[1], close: m[2] };
}

/** e.g. API `{ "sat-sun": "08:00-20:00" }` → saturday/sunday schedules */
const COMPACT_WORKING_HOUR_KEYS: Record<string, ShopDayKey[]> = {
  'sat-sun': ['saturday', 'sunday'],
  sat_sun: ['saturday', 'sunday'],
  'mon-fri': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  mon_fri: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
};

/** Maps API `working_hours` (per-day objects and/or compact string keys) into our per-day shape. */
function normalizeApiWorkingHoursForForm(raw: unknown): WorkingHours | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const out: Partial<Record<ShopDayKey, DaySchedule>> = {};

  for (const day of SHOP_DAY_KEYS) {
    const s = r[day];
    if (s != null && typeof s === 'object') {
      out[day] = s as DaySchedule;
    }
  }

  for (const [key, val] of Object.entries(r)) {
    if (SHOP_DAY_KEYS.includes(key as ShopDayKey)) continue;
    if (typeof val !== 'string') continue;
    const range = parseOpenCloseRange(val);
    if (!range) continue;
    const days = COMPACT_WORKING_HOUR_KEYS[key.toLowerCase()];
    if (!days) continue;
    for (const d of days) {
      if (out[d]) continue;
      out[d] = { open: range.open, close: range.close, closed: false };
    }
  }

  return Object.keys(out).length > 0 ? (out as WorkingHours) : undefined;
}

/** Merge API partial week with defaults so every day has a defined schedule (avoids broken edit UI). */
function mergeWorkingHours(
  api: WorkingHours | undefined,
  defaults: ShopFormValues['working_hours']
): ShopFormValues['working_hours'] {
  return SHOP_DAY_KEYS.reduce((acc, day) => {
    const s = api?.[day];
    const def = defaults[day];
    if (s && typeof s === 'object') {
      const c = s.closed;
      const closed =
        c === true ||
        c === 1 ||
        c === '1' ||
        String(c).toLowerCase() === 'true';
      acc[day] = closed
        ? { closed: true, open: undefined, close: undefined }
        : {
            closed: false,
            open: s.open ?? def?.open ?? '09:00',
            close: s.close ?? def?.close ?? '18:00',
          };
    } else {
      acc[day] = def ?? { open: '09:00', close: '18:00' };
    }
    return acc;
  }, {} as ShopFormValues['working_hours']);
}

/** Maps GET admin/shops/:id into full form state (used with RHF `values` so contact fields stay in sync when the step mounts). */
function buildShopFormValuesFromApi(shop: ShopData): ShopFormValues {
  const toBilingual = (val: unknown): { ar: string; en: string } => {
    if (val == null) return { ar: '', en: '' };
    if (typeof val === 'string') return { ar: val, en: val };
    if (Array.isArray(val)) {
      if (val.length === 0) return { ar: '', en: '' };
      return { ar: String(val[0] ?? ''), en: String(val[1] ?? '') };
    }
    if (val && typeof val === 'object' && ('ar' in val || 'en' in val)) {
      const o = val as { ar?: unknown; en?: unknown };
      return { ar: String(o.ar ?? ''), en: String(o.en ?? '') };
    }
    return { ar: '', en: '' };
  };

  const nameValue = toBilingual(shop.name);
  const descriptionValue = toBilingual(shop.description);
  const addressValue = toBilingual(shop.address);

  const rawServices = shop.services ?? shop.service_ids ?? [];
  const serviceIds = rawServices
    .map((s: { id?: number } | number) =>
      typeof s === 'object' && s?.id != null ? { id: Number(s.id) } : { id: Number(s) }
    )
    .filter((s) => Number.isFinite(s.id) && s.id > 0);

  const badgeRows = (shop.badges ?? []).filter(
    (b: { id?: number }) => b != null && typeof b.id === 'number' && Number.isFinite(b.id)
  );

  return {
    vendor_id: Number(shop.vendor_id ?? shop.vendor?.id ?? 0),
    logo: null,
    name: nameValue,
    description: descriptionValue,
    address: addressValue,
    lat: Number(shop.lat ?? shop.area?.lat ?? 0),
    lng: Number(shop.lng ?? shop.area?.lng ?? 0),
    phone: shop.phone != null && String(shop.phone).trim() !== '' ? String(shop.phone) : '',
    mobile: shop.mobile != null ? String(shop.mobile) : '',
    email: shop.email != null ? String(shop.email) : '',
    working_hours: mergeWorkingHours(
      normalizeApiWorkingHoursForForm(shop.working_hours),
      DEFAULT_WORKING_HOURS_TEMPLATE
    ),
    is_active: shop.is_active,
    area_id: Number(shop.area?.id ?? shop.area_id ?? 0),
    service_ids: serviceIds,
    badges: badgeRows.length
      ? badgeRows.map((b: any) => ({
          id: b.id,
          position: (b.postion || b.position || 'top') as 'top' | 'bottom',
        }))
      : [],
  };
}

/** Field groups validated before advancing each step (aligned with `steps` order). */
const SHOP_STEP_VALIDATION_FIELDS: string[][] = [
  ['vendor_id', 'name', 'description', 'logo', 'badges'],
  ['address', 'lat', 'lng'],
  ['phone', 'mobile', 'email'],
  ['working_hours'],
  ['area_id', 'service_ids', 'is_active'],
];

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

  const shopRecord = shopData?.data;
  const vendorSelectLabel =
    isEditMode && shopRecord?.vendor ? formatTranslated(shopRecord.vendor.name) : undefined;
  const areaSelectLabel =
    isEditMode && shopRecord?.area ? formatTranslated(shopRecord.area.name) : undefined;

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
    working_hours: structuredClone(DEFAULT_WORKING_HOURS_TEMPLATE),
    is_active: true,
    area_id: 0,
    service_ids: [],
    badges: [],
  };

  const editFormValues = useMemo(() => {
    if (!isEditMode || isLoadingShop || !shopRecord) return undefined;
    return buildShopFormValuesFromApi(shopRecord);
  }, [isEditMode, isLoadingShop, shopRecord]);

  const methods = useForm<ShopFormValues>({
    resolver: zodResolver(ShopSchema),
    defaultValues,
    ...(editFormValues !== undefined ? { values: editFormValues } : {}),
  });

  const { handleSubmit, control, watch } = methods;
  const logoFile = watch('logo');

  const logoPreviewUrl = useMemo(() => {
    if (logoFile instanceof File) return URL.createObjectURL(logoFile);
    const raw = shopData?.data?.logo_url;
    if (isEditMode && raw && !logoFile) {
      const s = String(raw).trim();
      if (s.startsWith('http://') || s.startsWith('https://')) return s;
      const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
      return base ? `${base}/${s.replace(/^\//, '')}` : s;
    }
    return null;
  }, [logoFile, isEditMode, shopData?.data?.logo_url]);

  useEffect(() => {
    if (logoFile instanceof File && logoPreviewUrl?.startsWith('blob:')) {
      return () => URL.revokeObjectURL(logoPreviewUrl);
    }
    return undefined;
  }, [logoFile, logoPreviewUrl]);

  const isSubmitting = createShopMutation.isPending || updateShopMutation.isPending;
  const errorMessage =
    createShopMutation.error?.message || updateShopMutation.error?.message || null;

  const onSubmit = async (data: ShopFormValues) => {
    try {
      const payload = {
        vendor_id: data.vendor_id,
        logo: data.logo instanceof File ? data.logo : undefined,
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
        badges: data.badges,
      };

      if (isEditMode && id) {
        await updateShopMutation.mutateAsync({ id, data: payload as any });
        toast.success(t('form.shopUpdatedSuccess'));
        navigate('/shop');
      } else {
        await createShopMutation.mutateAsync(payload);
        toast.success(t('form.shopCreatedSuccess'));
        navigate('/shop');
      }
    } catch (error: any) {
      console.error('Error saving shop:', error);
    }
  };

  const handleCancel = () => {
    navigate('/shop');
  };

  // Working Hours Component
  const WorkingHoursField = ({ day }: { day: ShopDayKey }) => {
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
              {t(`form.weekday_${day}`)}
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
                        {field.value ? t('form.shopDayClosed') : t('form.shopDayOpen')}
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
              {t('form.shopClosedOnDayHint')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Define steps for the stepper
  const steps = [
    {
      label: t('form.shopStepBasicLabel'),
      description: t('form.shopStepBasicDesc'),
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
                {t('form.shopVendorFieldLabel')}
              </Typography>
            </Box>
            <RHFInfiniteSelect
              name="vendor_id"
              queryKey={['vendors', 'infinite', 'shop-form']}
              fetcher={vendorFetcher}
              placeholder={t('form.selectVendor')}
              helperText={t('form.selectVendorHelper')}
              initialLabel={vendorSelectLabel}
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
                {t('form.shopLogoField')}
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
                      (isEditMode ? t('form.shopLogoHelperEdit') : t('form.shopLogoHelperCreate'))
                    }
                    fullWidth
                    className="transition-all duration-200"
                  />
                  {logoPreviewUrl && (
                    <Box className="mt-4">
                      <img
                        src={logoPreviewUrl}
                        alt={t('form.shopLogoPreviewAlt')}
                        className="w-24 h-24 rounded-xl object-cover border border-border/60"
                      />
                    </Box>
                  )}
                </div>
              )}
            />
          </Box>

          {/* Badges */}
          <Box className="group">
            <Box className="flex items-center gap-2.5 mb-3">
              <Box className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:star-bold"
                  className="text-primary"
                  width={16}
                  height={16}
                />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.shopBadgesSection')}
              </Typography>
            </Box>
            <RHFBadgeSelector
              name="badges"
              helperText={t('form.badgesHelperShop')}
            />
          </Box>
        </Box>
      ),
    },
    {
      label: t('form.shopStepLocationLabel'),
      description: t('form.shopStepLocationDesc'),
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
                {t('form.shopLocationOnMap')}
              </Typography>
            </Box>
            <Typography variant="caption" className="text-muted-foreground block mb-2">
              {t('form.shopMapClickHelper')}
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
                  {t('form.latitudeLabel')}
                </Typography>
                <Typography variant="body2" className="font-mono font-medium">
                  {watch('lat') ?? '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-muted-foreground">
                  {t('form.longitudeLabel')}
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
      label: t('form.shopStepContactLabel'),
      description: t('form.shopStepContactDesc'),
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
                autoComplete="tel"
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
                autoComplete="tel"
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
      label: t('form.shopStepHoursLabel'),
      description: t('form.shopStepHoursDesc'),
      icon: 'solar:clock-circle-bold',
      content: (
        <Box className="space-y-6">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHOP_DAY_KEYS.map((dayKey) => (
              <WorkingHoursField key={dayKey} day={dayKey} />
            ))}
          </Box>
        </Box>
      ),
    },
    {
      label: t('form.shopStepSettingsLabel'),
      description: t('form.shopStepSettingsDesc'),
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
                initialLabel={areaSelectLabel}
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
                  {t('form.shopServicesSection')}
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
                {t('form.shopActiveStatusSection')}
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
                        {t('form.markShopActiveLabel')}
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
        {isEditMode
          ? t('form.shopEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.shopCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <StepperFormLayout
        methods={methods}
        onSubmit={handleSubmit(
          (data) => {
            onSubmit(data);
          },
          (errors) => {
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
        title={isEditMode ? t('form.editShop') : t('form.createShop')}
        description={isEditMode ? t('form.editShopDesc') : t('form.createShopDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingShop}
        loadingText={t('form.loadingShop')}
        maxWidth="4xl"
        steps={steps}
        stepValidationFields={SHOP_STEP_VALIDATION_FIELDS}
        reviewHint={t('reviewBeforeSubmit')}
        submitLabel={isEditMode ? t('form.updateShopSubmit') : t('form.createShopSubmit')}
        submittingLabel={isEditMode ? t('form.updatingShop') : t('form.creatingShop')}
      />
    </>
  );
}
