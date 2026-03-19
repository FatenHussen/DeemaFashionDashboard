import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { apiRoutes, axiosInstance } from '@/api';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import {
  useCreateUserBasketSchedule,
  useUpdateUserBasketSchedule,
  useFetchUserBasketScheduleById,
} from '@/pages/dashboard/user-basket-schedules/hooks/user-basket-schedule';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `User Basket Schedule ${CONFIG.appName}` };

const usersFetcher = async (page: number = 1) => {
  const response = await axiosInstance.get(apiRoutes.user.list, { params: { page, per_page: 50 } });
  return response.data;
};

const basketsFetcher = async (page: number = 1) => {
  const response = await axiosInstance.get(apiRoutes.basket.list, { params: { page, per_page: 50 } });
  return response.data;
};

const schedulesFetcher = async (page: number = 1) => {
  const response = await axiosInstance.get(apiRoutes.schedule.list, { params: { page, per_page: 50 } });
  return response.data;
};

interface FormValues {
  user_id: number;
  basket_id: number;
  schedule_id: number;
  is_active: boolean;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailResponse, isLoading } = useFetchUserBasketScheduleById(id || '');
  const createMutation = useCreateUserBasketSchedule();
  const updateMutation = useUpdateUserBasketSchedule();

  const defaultValues: FormValues = {
    user_id: 0,
    basket_id: 0,
    schedule_id: 0,
    is_active: true,
  };

  const methods = useForm<FormValues>({ defaultValues });
  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && detailResponse?.data) {
      const d = detailResponse.data;
      reset({
        user_id: d.user?.id || 0,
        basket_id: d.basket?.id || 0,
        schedule_id: d.schedule?.id || 0,
        is_active: !!d.is_active,
      });
    }
  }, [detailResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.userBasketScheduleUpdatedSuccess'));
        navigate('/user-basket-schedules');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.userBasketScheduleCreatedSuccess'));
        navigate('/user-basket-schedules');
      }
    } catch (error: any) {
      console.error('Error saving user basket schedule:', error);
    }
  };

  const handleCancel = () => navigate('/user-basket-schedules');

  return (
    <>
      <title>
        {isEditMode ? `Edit | ${metadata.title}` : `Create | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editUserBasketSchedule') : t('form.createUserBasketSchedule')}
        description={
          isEditMode ? t('form.editUserBasketScheduleDesc') : t('form.createUserBasketScheduleDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoading}
        loadingText={t('form.loadingUserBasketSchedule')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateUserBasketSchedule') : t('form.createUserBasketScheduleSubmit')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        {/* User */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:user-rounded-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.selectUser')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="user_id"
            queryKey={['users', 'list-select']}
            fetcher={usersFetcher}
            placeholder={t('form.selectUser')}
          />
        </Box>

        {/* Basket */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.basketLabel')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="basket_id"
            queryKey={['baskets', 'list-select']}
            fetcher={basketsFetcher}
            placeholder={t('form.selectBasket')}
          />
        </Box>

        {/* Schedule */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.scheduleLabel')}
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="schedule_id"
            queryKey={['schedules', 'list-select']}
            fetcher={schedulesFetcher}
            placeholder={t('form.selectSchedule')}
          />
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
