import type { ScheduleCreatePayload } from '@/pages/dashboard/schedules/types/schedule.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  ScheduleSchema,
  type ScheduleFormValues,
} from '@/pages/dashboard/schedules/validation/schedule.validation';
import {
  useCreateSchedule,
  useUpdateSchedule,
  useFetchScheduleById,
} from '@/pages/dashboard/schedules/hooks/schedule';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: scheduleResponse, isLoading: isLoadingSchedule } = useFetchScheduleById(id || '');
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();

  const defaultValues: ScheduleFormValues = {
    name: { en: '', ar: '' },
    interval_days: 1,
    is_active: true,
    discount_type: null,
    discount_value: null,
  };

  const methods = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const discountType = watch('discount_type');

  useEffect(() => {
    if (isEditMode && scheduleResponse?.data) {
      const d = scheduleResponse.data;
      const name =
        typeof d.name === 'object' && d.name !== null
          ? { en: (d.name as { en?: string }).en ?? '', ar: (d.name as { ar?: string }).ar ?? '' }
          : { en: typeof d.name === 'string' ? d.name : '', ar: typeof d.name === 'string' ? d.name : '' };
      reset({
        name,
        interval_days: d.interval_days || 1,
        is_active: !!d.is_active,
        discount_type: d.discount_type || null,
        discount_value: d.discount_value ?? null,
      });
    }
  }, [scheduleResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      const payload: ScheduleCreatePayload = {
        name: data.name,
        interval_days: data.interval_days,
        is_active: data.is_active,
        discount_type: data.discount_type || null,
        discount_value: data.discount_type ? (data.discount_value ?? null) : null,
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.scheduleUpdatedSuccess'));
        navigate('/schedules');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.scheduleCreatedSuccess'));
        navigate('/schedules');
      }
    } catch (error: any) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleCancel = () => navigate('/schedules');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.scheduleEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.scheduleCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editSchedule') : t('form.createSchedule')}
        description={
          isEditMode ? t('form.editScheduleDesc') : t('form.createScheduleDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingSchedule}
        loadingText={t('form.loadingSchedule')}
        submitLabel={isEditMode ? t('form.updateSchedule') : t('form.createScheduleSubmit')}
        submittingLabel={isEditMode ? t('form.updatingSchedule') : t('form.creatingSchedule')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:calendar-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameEn')} *
                </Typography>
              </Box>
              <RHFTextField name="name.en" placeholder={t('form.scheduleNameEnPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.nameAr')} *
                </Typography>
              </Box>
              <RHFTextField name="name.ar" placeholder={t('form.scheduleNameArPlaceholder')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:settings-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.intervalDays')} & {t('form.discountType')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:clock-circle-bold" className="text-violet-500" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.intervalDays')} *
                </Typography>
              </Box>
              <RHFTextField name="interval_days" type="number" placeholder={t('form.placeholderThree')} fullWidth />
              <Typography variant="caption" className="text-muted-foreground mt-1">
                {t('form.intervalDaysHelper')}
              </Typography>
            </Box>
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-price-bold" className="text-violet-500" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.discountType')}
                </Typography>
              </Box>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">{t('form.noDiscount')}</option>
                    <option value="percentage">{t('form.percentageDiscount')}</option>
                    <option value="fixed">{t('form.fixedDiscount')}</option>
                  </select>
                )}
              />
            </Box>
            {discountType && (
              <Box className="group md:col-span-2 md:max-w-sm">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:dollar-bold" className="text-violet-500" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.discountValue')}
                  </Typography>
                </Box>
                <RHFTextField
                  name="discount_value"
                  type="number"
                  placeholder={discountType === 'percentage' ? t('form.scheduleDiscountPlaceholderPercentage') : t('form.scheduleDiscountPlaceholderFixed')}
                  fullWidth min={0} max={discountType === 'percentage' ? 100 : undefined}
                />
                <Typography variant="caption" className="text-muted-foreground mt-1">
                  {discountType === 'percentage' ? t('form.percentageHelper') : t('form.fixedHelper')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('active')}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.scheduleActiveHelper')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
