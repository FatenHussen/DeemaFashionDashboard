import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateUser } from '@/pages/dashboard/users/hooks/user';
import { _AreaApi } from '@/pages/dashboard/locations/api/area.services';
import {
  UserCreateSchema,
  type UserCreateFormValues,
} from '@/pages/dashboard/users/validation/user.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

// Areas API loads all at once — fake single-page pagination
const areaFetcher = (_page: number, _limit: number) =>
  _AreaApi.getListAreas().then((r) => ({
    data: {
      items: r.data.items.map((area) => ({ id: area.id, label: area.name })),
      pagination: r.data.pagination,
    },
  }));

export default function CreatePage() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();

  const defaultValues: UserCreateFormValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    area_id: 0,
    make_affiliate: false,
    affiliate_id: undefined,
    affiliate_rate: undefined,
  };

  const methods = useForm<UserCreateFormValues>({
    resolver: zodResolver(UserCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, control, watch } = methods;
  const makeAffiliate = watch('make_affiliate');

  const isSubmitting = createUserMutation.isPending;
  const errorMessage = createUserMutation.error?.message || null;

  const onSubmit = async (data: UserCreateFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        last_name: '',
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        password_confirmation: data.password_confirmation,
        area_id: data.area_id,
      };
      if (data.make_affiliate && data.affiliate_id && data.affiliate_rate !== undefined) {
        payload.affiliate_id = data.affiliate_id;
        payload.affiliate_rate = data.affiliate_rate;
      }
      await createUserMutation.mutateAsync(payload);
      toast.success(t('form.userCreatedSuccess'));
      navigate('/users');
    } catch { return; }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <>
      <title>{t('form.userCreateDocumentTitle', { appName: CONFIG.appName })}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.createUser')}
        description={t('form.createUserDesc')}
        maxWidth="2xl"
        submitLabel={t('form.userSubmitCreate')}
        submittingLabel={t('form.creatingUser')}
      >
        <Box className="space-y-4">
          <RHFTextField name="name" label={t('form.firstName')} placeholder={t('form.namePlaceholder')} fullWidth />
          <RHFTextField name="email" label={t('columns.email')} type="email" placeholder={t('form.emailPlaceholder')} fullWidth />
          <RHFTextField name="phone" label={t('columns.phone')} placeholder={t('form.phonePlaceholder')} fullWidth />
          <RHFTextField name="password" label={t('form.passwordLabel')} type="password" placeholder={t('form.passwordPlaceholder')} fullWidth />
          <RHFTextField
            name="password_confirmation"
            label={t('form.confirmPasswordLabel')}
            type="password"
            fullWidth
          />

          <Box>
            <label className="mb-2 block text-sm font-medium">{t('areaLabel')}</label>
            <RHFInfiniteSelect
              name="area_id"
              queryKey={['areas', 'infinite', 'user-form']}
              fetcher={areaFetcher}
              placeholder={t('form.selectArea')}
            />
          </Box>

          <Box className="rounded-lg border border-border p-4">
            <Controller
              name="make_affiliate"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <Typography variant="subtitle2">{t('form.makeAffiliateOnCreation')}</Typography>
                </label>
              )}
            />

            {makeAffiliate && (
              <Box className="mt-4 flex flex-col gap-4 sm:flex-row">
                <Box className="flex-1">
                  <Typography variant="caption" className="mb-1 block">
                    {t('form.affiliateId')}
                  </Typography>
                  <RHFTextField name="affiliate_id" type="number" placeholder={t('form.placeholderFiftySix')} fullWidth />
                </Box>
                <Box className="flex-1">
                  <Typography variant="caption" className="mb-1 block">
                    {t('form.affiliateRatePercent')}
                  </Typography>
                  <RHFTextField name="affiliate_rate" type="number" placeholder={t('form.placeholderFifteen')} fullWidth />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
