import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { compressImage } from '@/utils/compress-image';
import {
  BadgeSchema,
  type BadgeFormValues,
} from '@/pages/dashboard/badges/validation/badge.validation';
import {
  useCreateBadge,
  useUpdateBadge,
  useFetchBadgeById,
} from '@/pages/dashboard/badges/hooks/badge';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

type BadgeMode = 'text' | 'image' | 'gif';

const IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png';
const GIF_ACCEPT = 'image/gif';

function detectModeFromFile(url: string | null | undefined): BadgeMode | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.endsWith('.gif') || lower.includes('image/gif')) return 'gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) return 'image';
  return 'image';
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [badgeMode, setBadgeMode] = useState<BadgeMode>('text');

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchBadgeById(id || '');
  const createMutation = useCreateBadge();
  const updateMutation = useUpdateBadge();

  const defaultValues: BadgeFormValues = {
    name: { en: '', ar: '' },
    color: '',
    position: 'top',
    image: null,
  };

  const methods = useForm<BadgeFormValues>({
    resolver: zodResolver(BadgeSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const imageFile = watch('image');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      const name = item.name;
      const nameEn = typeof name === 'object' ? (name as any)?.en ?? '' : String(name ?? '');
      const nameAr = typeof name === 'object' ? (name as any)?.ar ?? '' : String(name ?? '');
      const hasText = !!(nameEn || nameAr || item.color);
      const fileMode = detectModeFromFile(item.image);

      if (fileMode && !hasText) {
        setBadgeMode(fileMode);
        setPreviewImage(item.image || null);
      } else {
        setBadgeMode('text');
        setPreviewImage(null);
      }

      reset({
        name: { en: nameEn, ar: nameAr },
        color: item.color ?? '',
        position: item.position ?? 'top',
        image: null,
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  useEffect(() => {
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  function switchMode(mode: BadgeMode) {
    if (mode === badgeMode) return;
    setBadgeMode(mode);
    if (mode === 'text') {
      setValue('image', null);
      setPreviewImage(null);
    } else {
      setValue('name', { en: '', ar: '' });
      setValue('color', '');
      if (mode !== badgeMode) {
        setValue('image', null);
        setPreviewImage(null);
      }
    }
  }

  const onSubmit = async (data: BadgeFormValues) => {
    try {
      const payload: any = { position: data.position };

      if (badgeMode === 'text') {
        if (data.name?.en || data.name?.ar) payload.name = data.name;
        if (data.color) payload.color = data.color;
      } else {
        if (data.image instanceof File) payload.image = await compressImage(data.image);
      }

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.badgeUpdatedSuccess'));
        navigate('/badges');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.badgeCreatedSuccess'));
        navigate('/badges');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  const isTextMode = badgeMode === 'text';
  const isFileMode = badgeMode === 'image' || badgeMode === 'gif';

  const TABS: { key: BadgeMode; icon: string; label: string; desc: string; color: string }[] = [
    {
      key: 'text',
      icon: 'solar:text-bold-duotone',
      label: t('form.badgeModeText'),
      desc: t('form.badgeModeTextDesc'),
      color: 'text-blue-500',
    },
    {
      key: 'image',
      icon: 'solar:gallery-bold-duotone',
      label: t('form.badgeModeImage'),
      desc: t('form.badgeModeImageDesc'),
      color: 'text-emerald-500',
    },
    {
      key: 'gif',
      icon: 'solar:play-circle-bold-duotone',
      label: t('form.badgeModeGif'),
      desc: t('form.badgeModeGifDesc'),
      color: 'text-purple-500',
    },
  ];

  return (
    <>
      <title>
        {isEditMode
          ? t('form.badgeEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.badgeCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/badges')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editBadge') : t('form.createBadge')}
        description={isEditMode ? t('form.editBadgeDesc') : t('form.createBadgeDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingBadge')}
        submitLabel={isEditMode ? t('form.updateBadgeSubmit') : t('form.createBadgeSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBadgeSubmit') : t('form.creatingBadgeSubmit')}
      >
        {/* ── Section: Position ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:sort-vertical-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.badgePositionLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Controller name="position" control={control} render={({ field, fieldState }) => (
              <Box className="space-y-2">
                <Box className="flex gap-3">
                  {(['top', 'bottom'] as const).map((pos) => (
                    <button key={pos} type="button" onClick={() => field.onChange(pos)} className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${field.value === pos ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30' : 'border-border bg-background text-muted-foreground hover:bg-muted/50'}`}>
                      <Box className="flex items-center justify-center gap-2">
                        <Iconify icon={pos === 'top' ? 'solar:arrow-to-top-left-bold-duotone' : 'solar:arrow-to-down-right-bold-duotone'} width={18} />
                        {pos === 'top' ? t('form.badgePositionTop') : t('form.badgePositionBottom')}
                      </Box>
                    </button>
                  ))}
                </Box>
                {fieldState.error && <Typography variant="caption" className="text-destructive">{fieldState.error.message}</Typography>}
                <Typography variant="caption" className="text-muted-foreground">{t('form.badgePositionHelper')}</Typography>
              </Box>
            )} />
          </Box>
        </Box>

        {/* ── Section: Badge Mode ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:widget-2-bold-duotone" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.badgeModeLabel')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Box className="grid grid-cols-3 rounded-xl bg-muted/60 p-1 gap-1">
              {TABS.map((tab) => {
                const isActive = badgeMode === tab.key;
                return (
                  <button key={tab.key} type="button" onClick={() => switchMode(tab.key)} className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Iconify icon={tab.icon} width={22} className={isActive ? tab.color : ''} />
                    <span className="leading-tight font-semibold">{tab.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{tab.desc}</span>
                  </button>
                );
              })}
            </Box>

            {isTextMode && (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
                  <RHFTextField name="name.en" placeholder={t('form.badgeNameEnPlaceholder')} helperText={t('form.badgeNameEnHelper')} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
                  <RHFTextField name="name.ar" placeholder={t('form.badgeNameArPlaceholder')} helperText={t('form.badgeNameArHelper')} dir="rtl" />
                </Box>
                <Box className="md:col-span-2">
                  <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:palette-bold" className="text-violet-500" width={16} />{t('form.colorLabel')}</Typography>
                  <RHFColorPicker name="color" helperText={t('form.colorHelper')} />
                </Box>
              </Box>
            )}

            {badgeMode === 'image' && (
              <Box className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:gallery-add-bold" className="text-emerald-500" width={16} />{t('form.badgeModeImage')}</Typography>
                <Controller name="image" control={control} render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                  <div className="w-full space-y-3">
                    <Box className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
                      <Iconify icon="solar:info-circle-bold" width={15} /><span>{t('form.badgeImageHint')}</span>
                    </Box>
                    <Input {...field} value={undefined} type="file" accept={IMAGE_ACCEPT} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; onChange(file || null); }} error={!!error} helperText={error?.message || t('form.badgeImageHelper')} fullWidth />
                    {previewImage && (
                      <Box className="relative inline-block">
                        <img src={previewImage} alt={t('form.badgeImagePreviewAlt')} className="w-24 h-24 object-cover rounded-xl border border-border shadow-sm" />
                        <button type="button" onClick={() => { setPreviewImage(null); onChange(null); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors"><Iconify icon="solar:close-bold" width={12} /></button>
                      </Box>
                    )}
                  </div>
                )} />
              </Box>
            )}

            {badgeMode === 'gif' && (
              <Box className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5"><Iconify icon="solar:play-circle-bold-duotone" className="text-purple-500" width={16} />{t('form.badgeModeGif')}</Typography>
                <Controller name="image" control={control} render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                  <div className="w-full space-y-3">
                    <Box className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 text-xs">
                      <Iconify icon="solar:info-circle-bold" width={15} /><span>{t('form.badgeGifHint')}</span>
                    </Box>
                    <Input {...field} value={undefined} type="file" accept={GIF_ACCEPT} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; onChange(file || null); }} error={!!error} helperText={error?.message || t('form.badgeGifHelper')} fullWidth />
                    {previewImage && (
                      <Box className="relative inline-block">
                        <Box className="rounded-xl border border-border shadow-sm overflow-hidden bg-muted/30"><img src={previewImage} alt={t('form.badgeImagePreviewAlt')} className="w-28 h-28 object-contain" /></Box>
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-purple-500/90 text-white text-[9px] font-bold uppercase tracking-wider">{t('gifBadge')}</span>
                        <button type="button" onClick={() => { setPreviewImage(null); onChange(null); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors"><Iconify icon="solar:close-bold" width={12} /></button>
                      </Box>
                    )}
                  </div>
                )} />
              </Box>
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
