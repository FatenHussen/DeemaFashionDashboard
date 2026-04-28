import type { Resolver } from 'react-hook-form';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { _CityApi } from '@/pages/dashboard/locations/api/city.services';
import {
  AreaSchema,
  type AreaFormValues,
} from '@/pages/dashboard/locations/validation/area.validation';
import {
  useCreateArea,
  useUpdateArea,
  useFetchAreaById,
} from '@/pages/dashboard/locations/hooks/area';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { MapPicker, MAP_DEFAULT_CENTER } from 'src/shared/components/map/map-picker';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

// Cities API loads all at once — fake single-page pagination
const cityFetcher = (_page: number, _limit: number) =>
  _CityApi.getListCities().then((r) => ({
    data: {
      items: r.data.items.map((city) => ({ id: city.id, label: formatTranslated(city.name) })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Hooks for fetching and mutations
  const { data: areaData, isLoading: isLoadingArea } = useFetchAreaById(id || '');
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();

  const defaultValues: AreaFormValues = {
    name: {
      en: '',
      ar: '',
    },
    city_id: 0,
    lat: String(MAP_DEFAULT_CENTER[0]),
    lng: String(MAP_DEFAULT_CENTER[1]),
    base_fee: '',
  };

  const methods = useForm<AreaFormValues>({
    resolver: zodResolver(AreaSchema) as Resolver<AreaFormValues>,
    defaultValues,
  });

  const { handleSubmit, reset, setValue, watch } = methods;
  const watchedLat = watch('lat');
  const watchedLng = watch('lng');

  // Fetch area data if in edit mode
  useEffect(() => {
    if (isEditMode && areaData && !isLoadingArea) {
      const nameValue = areaData.name;

      const baseFee =
        areaData.base_fee != null ? String(areaData.base_fee) : '';

      const hasCoords = areaData.lat != null && areaData.lng != null && !Number.isNaN(Number(areaData.lat)) && !Number.isNaN(Number(areaData.lng));
      const latVal = hasCoords ? String(areaData.lat) : String(MAP_DEFAULT_CENTER[0]);
      const lngVal = hasCoords ? String(areaData.lng) : String(MAP_DEFAULT_CENTER[1]);

      reset({
        name: nameValue,
        city_id: areaData.city?.id || 0,
        lat: latVal,
        lng: lngVal,
        base_fee: baseFee,
      });
    }
  }, [areaData, isEditMode, isLoadingArea, reset]);

  const isSubmitting = createAreaMutation.isPending || updateAreaMutation.isPending;
  const errorMessage =
    createAreaMutation.error?.message || updateAreaMutation.error?.message || null;

  const onSubmit = async (data: AreaFormValues) => {
    try {
      const numLat = data.lat ? parseFloat(data.lat) : NaN;
      const numLng = data.lng ? parseFloat(data.lng) : NaN;
      const hasValidCoords = !Number.isNaN(numLat) && !Number.isNaN(numLng);

      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        city_id: data.city_id,
        lat: hasValidCoords ? numLat : MAP_DEFAULT_CENTER[0],
        lng: hasValidCoords ? numLng : MAP_DEFAULT_CENTER[1],
        base_fee: data.base_fee ?? '',
      };

      if (isEditMode && id) {
        await updateAreaMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.areaUpdatedSuccess'));
        navigate('/locations/area');
      } else {
        await createAreaMutation.mutateAsync(payload);
        toast.success(t('form.areaCreatedSuccess'));
        navigate('/locations/area');
      }
    } catch (error: any) {
      console.error('Error saving area:', error);
    }
  };

  const handleCancel = () => {
    navigate('/locations/area');
  };

  const infoText = isEditMode ? t('form.areaFormInfoEdit') : t('form.areaFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.areaEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.areaCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editArea') : t('form.createArea')}
        description={isEditMode ? t('form.editAreaDesc') : t('form.createAreaDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingArea}
        loadingText={t('form.loadingArea')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateArea') : t('form.createAreaSubmit')}
        submittingLabel={isEditMode ? t('form.updatingArea') : t('form.creatingArea')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:flag-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:flag-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.areaNameEn')} helperText={t('form.areaNameEnHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:flag-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.areaNameAr')} helperText={t('form.areaNameArHelper')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:city-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.city')} & {t('form.baseFee')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:city-bold" className="text-violet-500" width={16} />
                {t('columns.city')}
              </Typography>
              <RHFInfiniteSelect
                name="city_id"
                queryKey={['cities', 'infinite', 'area-form']}
                fetcher={cityFetcher}
                placeholder={t('form.selectCity')}
                helperText={t('form.areaCityHelper')}
                initialLabel={areaData?.city?.name}
              />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:dollar-bold" className="text-violet-500" width={16} />
                {t('form.baseFee')}
              </Typography>
              <RHFTextField name="base_fee" placeholder={t('form.baseFee')} helperText={t('form.areaBaseFeeHelper')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Map Location ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:map-point-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.areaMapLocationLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <MapPicker
              lat={watchedLat ?? ''}
              lng={watchedLng ?? ''}
              onChange={(latVal, lngVal) => {
                setValue('lat', latVal, { shouldDirty: true });
                setValue('lng', lngVal, { shouldDirty: true });
              }}
              height="320px"
            />
            <Typography variant="caption" className="text-muted-foreground mt-2 block">
              {t('form.areaMapClickHelper')}
            </Typography>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
