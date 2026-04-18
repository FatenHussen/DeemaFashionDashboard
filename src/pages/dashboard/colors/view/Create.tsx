import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import {
  useCreateColor,
  useUpdateColor,
  useFetchColorById,
} from '@/pages/dashboard/colors/hooks/color';
import {
  ColorFormSchema,
  type ColorFormValues,
} from '@/pages/dashboard/colors/validation/color.validation';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchColorById(id || '');
  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();

  const defaultValues: ColorFormValues = {
    name: { en: '', ar: '' },
    hex: '#000000',
    is_active: true,
  };

  const methods = useForm<ColorFormValues>({
    resolver: zodResolver(ColorFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      const name = item.name;
      reset({
        name: {
          en: typeof name === 'object' ? (name as { en?: string }).en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? (name as { ar?: string }).ar ?? '' : String(name ?? ''),
        },
        hex: item.hex ?? '#000000',
        is_active: Boolean(item.is_active),
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  const onSubmit = async (data: ColorFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.colorUpdatedSuccess'));
        navigate('/colors');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.colorCreatedSuccess'));
        navigate('/colors');
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.colorEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.colorCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/colors')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editColor') : t('form.createColor')}
        description={isEditMode ? t('form.editColorDesc') : t('form.createColorDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingColor')}
        submitLabel={isEditMode ? t('form.updateColorSubmit') : t('form.createColorSubmit')}
        submittingLabel={isEditMode ? t('form.updatingColorSubmit') : t('form.creatingColorSubmit')}
      >
        {/* ── Section: Names & Color ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:palette-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')} & {t('form.colorHexLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
              <RHFTextField name="name.en" placeholder={t('form.colorNameEnPlaceholder')} helperText={t('form.colorNameEnHelper')} />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
              <RHFTextField name="name.ar" placeholder={t('form.colorNameArPlaceholder')} helperText={t('form.colorNameArHelper')} dir="rtl" />
            </Box>
            <Box className="md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:palette-bold" className="text-primary" width={16} />{t('form.colorHexLabel')}</Typography>
              <RHFColorPicker name="hex" helperText={t('form.colorHexHelper')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('active')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Controller name="is_active" control={control} render={({ field }) => (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
              </div>
            )} />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
