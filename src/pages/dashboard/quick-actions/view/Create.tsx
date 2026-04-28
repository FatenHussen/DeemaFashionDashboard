import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { compressImage } from '@/utils/compress-image';
import { _PageSectionApi } from '@/pages/dashboard/sections/api/page-section.services';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Input, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import {
  useCreateQuickAction,
  useUpdateQuickAction,
  useFetchQuickActionById,
} from '../hooks';
import {
  QuickActionCreateSchema,
  QuickActionUpdateSchema,
  type QuickActionCreateFormValues,
  type QuickActionUpdateFormValues,
} from '../validation';

// ----------------------------------------------------------------------

function buildCreateFormData(data: QuickActionCreateFormValues): FormData {
  const fd = new FormData();
  fd.append('title[en]', data.title.en);
  fd.append('title[ar]', data.title.ar);
  fd.append('page_id', data.page_id);
  fd.append('icon', data.icon as File);
  if (data.order !== undefined && data.order !== null) {
    fd.append('order', String(data.order));
  }
  fd.append('is_active', data.is_active ? '1' : '0');
  return fd;
}

function buildUpdateFormData(data: QuickActionUpdateFormValues): FormData {
  const fd = new FormData();
  fd.append('title[en]', data.title.en);
  fd.append('title[ar]', data.title.ar);
  fd.append('page_id', data.page_id);
  if (data.icon instanceof File) {
    fd.append('icon', data.icon);
  }
  if (data.order !== undefined && data.order !== null) {
    fd.append('order', String(data.order));
  }
  fd.append('is_active', data.is_active ? '1' : '0');
  return fd;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);

  const { data: pagesRes } = useQuery({
    queryKey: ['sections', 'pages', 'quick-actions'],
    queryFn: () => _PageSectionApi.getPages(),
  });

  const { data: detailResponse, isLoading: isLoadingDetail } = useFetchQuickActionById(id || '');
  const createMutation = useCreateQuickAction();
  const updateMutation = useUpdateQuickAction();

  const pageOptions =
    (pagesRes?.data ?? []).map((p) => ({
      value: String(p.id),
      label: typeof p.title === 'string' ? p.title : String(p.id),
    })) || [];

  const createDefaults: QuickActionCreateFormValues = {
    title: { en: '', ar: '' },
    page_id: '',
    icon: null,
    order: 0,
    is_active: true,
  };

  const updateDefaults: QuickActionUpdateFormValues = {
    title: { en: '', ar: '' },
    page_id: '',
    icon: null,
    order: 0,
    is_active: true,
  };

  const schema = isEditMode ? QuickActionUpdateSchema : QuickActionCreateSchema;

  const methods = useForm<QuickActionCreateFormValues | QuickActionUpdateFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEditMode ? updateDefaults : createDefaults,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const iconFile = watch('icon');

  useEffect(() => {
    if (!isEditMode || !detailResponse?.data) return;
    const d = detailResponse.data;
    const title = d.title;
    reset({
      title: {
        en: title?.en ?? '',
        ar: title?.ar ?? '',
      },
      page_id: String(d.page_id),
      icon: null,
      order: d.order ?? 0,
      is_active: d.is_active ?? true,
    });
    setPreviewIcon(d.icon || null);
  }, [isEditMode, detailResponse, reset]);

  useEffect(() => {
    if (iconFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewIcon(reader.result as string);
      reader.readAsDataURL(iconFile);
    } else if (!isEditMode && !iconFile) {
      setPreviewIcon(null);
    } else if (isEditMode && !iconFile && detailResponse?.data?.icon) {
      setPreviewIcon(detailResponse.data.icon);
    }
  }, [iconFile, isEditMode, detailResponse?.data?.icon]);

  if (isEditMode && isLoadingDetail) return <LoadingScreen />;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: QuickActionCreateFormValues | QuickActionUpdateFormValues) => {
    try {
      const icon =
        data.icon instanceof File ? await compressImage(data.icon) : data.icon;
      const withIcon = { ...data, icon } as
        | QuickActionCreateFormValues
        | QuickActionUpdateFormValues;
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          formData: buildUpdateFormData(withIcon as QuickActionUpdateFormValues),
        });
        toast.success(t('form.quickActionUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(
          buildCreateFormData(withIcon as QuickActionCreateFormValues)
        );
        toast.success(t('form.quickActionCreatedSuccess'));
      }
      navigate(paths.dashboard.quickActions.root);
    } catch {
      /* toast from axios interceptor if any */
    }
  };

  const handleCancel = () => navigate(paths.dashboard.quickActions.root);

  return (
    <>
      <title>
        {isEditMode
          ? `${t('form.quickActionFormTitleEdit')} | ${CONFIG.appName}`
          : `${t('form.quickActionFormTitleCreate')} | ${CONFIG.appName}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.quickActionFormTitleEdit') : t('form.quickActionFormTitleCreate')}
        description={
          isEditMode
            ? `${t('form.quickActionFormDescEdit')} ${t('form.quickActionCustomizationHint')}`
            : `${t('form.quickActionFormDescCreate')} ${t('form.quickActionCustomizationHint')}`
        }
        isEditMode={isEditMode}
        submitLabel={isEditMode ? t('edit') : t('create')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        {/* ── Section: Titles ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:letter-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.bannerEnglishTitleLabel')} / {t('form.bannerArabicTitleLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.bannerEnglishTitleLabel')}
                </Typography>
              </Box>
              <RHFTextField name="title.en" placeholder={t('form.bannerTitleEnPlaceholder')} />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:letter-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.bannerArabicTitleLabel')}
                </Typography>
              </Box>
              <RHFTextField name="title.ar" placeholder={t('form.bannerTitleArExample')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Page & Order ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:document-text-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.quickActionFormPageLabel')} & {t('form.quickActionFormOrderLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.quickActionFormPageLabel')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground mb-2 block leading-relaxed">
                {t('form.quickActionPageSourceHelper')}
              </Typography>
              <RHFSelect
                name="page_id"
                options={pageOptions}
                placeholder={t('form.quickActionFormPagePlaceholder')}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:sort-vertical-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.quickActionFormOrderLabel')}
                </Typography>
              </Box>
              <RHFTextField name="order" type="number" placeholder="0" />
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
              {t('form.quickActionFormIconLabel')} & {t('columns.status')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.quickActionFormIconLabel')}
                </Typography>
              </Box>
              <Controller
                name="icon"
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
                        (isEditMode ? t('form.quickActionFormIconHelperEdit') : t('form.quickActionFormIconHelper'))
                      }
                      fullWidth
                      className="transition-all duration-200"
                    />
                    {previewIcon && (
                      <Box className="mt-4 flex items-center gap-3">
                        <Box className="relative">
                          <Box className="absolute -inset-1 rounded-xl bg-amber-500/20 blur-sm" />
                          <img
                            src={previewIcon}
                            alt=""
                            className="relative h-16 w-16 object-cover rounded-xl border border-border/60 shadow-sm"
                          />
                        </Box>
                      </Box>
                    )}
                  </div>
                )}
              />
            </Box>

            <Box className="flex items-start pt-7">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-colors w-full">
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                    />
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('columns.status')}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('columns.active')}
                      </Typography>
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
