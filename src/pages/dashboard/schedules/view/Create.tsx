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

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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
    day: '',
    start_time: '',
    end_time: '',
    is_active: true,
  };

  const methods = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && scheduleResponse?.data) {
      const d = scheduleResponse.data;
      reset({
        name: typeof d.name === 'object' ? d.name : { en: '', ar: '' },
        day: d.day || '',
        start_time: d.start_time || '',
        end_time: d.end_time || '',
        is_active: !!d.is_active,
      });
    }
  }, [scheduleResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.scheduleUpdatedSuccess'));
        navigate('/schedules');
      } else {
        await createMutation.mutateAsync(data);
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
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.scheduleNameEnPlaceholder')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.scheduleNameArPlaceholder')} dir="rtl" fullWidth />
        </Box>

        {/* Day */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-date-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.dayLabel')}
            </Typography>
          </Box>
          <Controller
            name="day"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t('form.selectDay')}</option>
                {DAYS.map((day) => (
                  <option key={day} value={day} className="capitalize">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            )}
          />
        </Box>

        {/* Start Time & End Time */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:clock-circle-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.startTime')}
              </Typography>
            </Box>
            <RHFTextField name="start_time" type="time" fullWidth />
          </Box>
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:clock-circle-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.endTime')}
              </Typography>
            </Box>
            <RHFTextField name="end_time" type="time" fullWidth />
          </Box>
        </Box>

        {/* Active */}
        <Box className="group">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Typography variant="body2">{t('active')}</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
