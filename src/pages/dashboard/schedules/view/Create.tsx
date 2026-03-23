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

const metadata = { title: `Schedule ${CONFIG.appName}` };

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
      reset({
        name: typeof d.name === 'object' ? d.name : { en: '', ar: '' },
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
      const payload = {
        ...data,
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
        {isEditMode ? `Edit Schedule | ${metadata.title}` : `Create Schedule | ${metadata.title}`}
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
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateSchedule') : t('form.createScheduleSubmit')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        {/* Name EN */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} *
            </Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.scheduleNameEnPlaceholder')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')} *
            </Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.scheduleNameArPlaceholder')} dir="rtl" fullWidth />
        </Box>

        {/* Interval Days */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:clock-circle-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.intervalDays')} *
            </Typography>
          </Box>
          <RHFTextField name="interval_days" type="number" placeholder="3" fullWidth />
          <Typography variant="caption" className="text-muted-foreground mt-1">
            {t('form.intervalDaysHelper')}
          </Typography>
        </Box>

        {/* Discount Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:tag-price-bold" className="text-primary" width={24} height={24} />
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

        {/* Discount Value - only show when discount_type is selected */}
        {discountType && (
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:dollar-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.discountValue')}
              </Typography>
            </Box>
            <RHFTextField
              name="discount_value"
              type="number"
              placeholder={discountType === 'percentage' ? '10' : '5'}
              fullWidth
            />
            <Typography variant="caption" className="text-muted-foreground mt-1">
              {discountType === 'percentage' ? t('form.percentageHelper') : t('form.fixedHelper')}
            </Typography>
          </Box>
        )}

        {/* Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
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
      </CreateFormLayout>
    </>
  );
}
