import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { compressImage } from '@/utils/compress-image';
import {
  SaleCountryFormSchema,
  type SaleCountryFormValues,
} from '@/pages/dashboard/sale-countries/validation/sale-country.validation';
import {
  useCreateSaleCountry,
  useUpdateSaleCountry,
  useFetchSaleCountryById,
} from '@/pages/dashboard/sale-countries/hooks/sale-country';

import { CONFIG } from 'src/global-config';
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchSaleCountryById(id || '');
  const createMutation = useCreateSaleCountry();
  const updateMutation = useUpdateSaleCountry();

  const defaultValues: SaleCountryFormValues = {
    name: { en: '', ar: '' },
    icon: null,
    is_active: true,
  };

  const methods = useForm<SaleCountryFormValues>({
    resolver: zodResolver(SaleCountryFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const iconFile = watch('icon');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      setPreviewIcon(item.icon || null);
      const name = item.name;
      reset({
        name: {
          en: typeof name === 'object' ? (name as any).en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? (name as any).ar ?? '' : String(name ?? ''),
        },
        icon: null,
        is_active: Boolean(item.is_active),
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  useEffect(() => {
    if (iconFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewIcon(reader.result as string);
      reader.readAsDataURL(iconFile);
    }
  }, [iconFile]);

  const onSubmit = async (data: SaleCountryFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            name: data.name,
            icon: data.icon instanceof File ? await compressImage(data.icon) : undefined,
            is_active: data.is_active,
          },
        });
        toast.success(t('form.saleCountryUpdatedSuccess'));
        navigate('/sale-countries');
      } else {
        if (!(data.icon instanceof File)) {
          toast.error(t('form.saleCountryIconRequired'));
          return;
        }
        await createMutation.mutateAsync({
          name: data.name,
          icon: await compressImage(data.icon),
          is_active: data.is_active,
        });
        toast.success(t('form.saleCountryCreatedSuccess'));
        navigate('/sale-countries');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.saleCountryEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.saleCountryCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/sale-countries')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editSaleCountry') : t('form.createSaleCountry')}
        description={isEditMode ? t('form.editSaleCountryDesc') : t('form.createSaleCountryDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingSaleCountry')}
        submitLabel={isEditMode ? t('form.updateSaleCountrySubmit') : t('form.createSaleCountrySubmit')}
        submittingLabel={
          isEditMode ? t('form.updatingSaleCountrySubmit') : t('form.creatingSaleCountrySubmit')
        }
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:earth-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:letter-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.saleCountryNameEnPlaceholder')} helperText={t('form.saleCountryNameEnHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:letter-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.saleCountryNameArPlaceholder')} helperText={t('form.saleCountryNameArHelper')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Icon & Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.saleCountryIconLabel')} & {t('active')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={16} />
                {isEditMode ? t('form.saleCountryIconLabel') : t('form.saleCountryIconLabelRequired')}
              </Typography>
              <Controller
                name="icon"
                control={control}
                render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                  <div className="w-full">
                    <Input
                      {...field}
                      value={undefined}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        onChange(file || null);
                      }}
                      error={!!error}
                      helperText={error?.message || (isEditMode ? t('form.saleCountryIconHelperEdit') : t('form.saleCountryIconHelper'))}
                      fullWidth
                    />
                    {previewIcon && (
                      <Box className="mt-3">
                        <Box className="relative inline-block">
                          <Box className="absolute -inset-1 rounded-xl bg-amber-500/20 blur-sm" />
                          <img src={previewIcon} alt={t('form.saleCountryIconPreviewAlt')} className="relative w-16 h-16 object-cover rounded-xl border border-border/60 shadow-sm" />
                        </Box>
                      </Box>
                    )}
                  </div>
                )}
              />
            </Box>
            <Box className="group flex flex-col justify-center">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-amber-500/40 transition-colors">
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                    />
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                      <Typography variant="caption" className="text-muted-foreground">{t('form.saleCountryIconHelperEdit')}</Typography>
                    </Box>
                  </div>
                )}
              />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
