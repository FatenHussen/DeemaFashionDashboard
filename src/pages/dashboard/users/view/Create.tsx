import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useCreateUser } from '@/pages/dashboard/users/hooks/user';
import { _AreaApi } from '@/pages/dashboard/locations/api/area.services';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { buildAffiliateCommissionPayload } from '@/pages/dashboard/users/lib/affiliate-commission';
import {
  UserCreateSchema,
  type UserCreateFormValues,
} from '@/pages/dashboard/users/validation/user.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
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
  const { data: productsResponse } = useFetchProducts({ page: 1, limit: 500 });

  const productItems =
    (productsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ?? [];
  const productOptions = productItems.map((p) => ({
    value: p.id,
    label: `${p.id} — ${formatTranslated(p.name as Parameters<typeof formatTranslated>[0])}`,
  }));

  const defaultValues: UserCreateFormValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    area_id: 0,
    make_affiliate: false,
    affiliate_commission_type: 'percentage_order',
    affiliate_id: '',
    affiliate_rate: undefined,
    affiliate_fixed_commission: undefined,
    affiliate_product_ids: [],
    affiliate_visit_commission_enabled: false,
    affiliate_visit_commission_threshold: undefined,
    affiliate_visit_commission_amount: undefined,
  };

  const methods = useForm<UserCreateFormValues>({
    resolver: zodResolver(UserCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, control, watch } = methods;
  const makeAffiliate = watch('make_affiliate');
  const commissionType = watch('affiliate_commission_type');
  const visitCommissionEnabled = watch('affiliate_visit_commission_enabled');

  const isSubmitting = createUserMutation.isPending;
  const errorMessage = createUserMutation.error?.message || null;

  const commissionTypeOptions = [
    {
      value: 'percentage_order',
      label: t('form.affiliateCommissionType_percentage_order'),
    },
    {
      value: 'fixed_per_order',
      label: t('form.affiliateCommissionType_fixed_per_order'),
    },
    {
      value: 'percentage_selected_products',
      label: t('form.affiliateCommissionType_percentage_selected_products'),
    },
  ];

  const onSubmit = async (data: UserCreateFormValues) => {
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        last_name: '',
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        password_confirmation: data.password_confirmation,
        area_id: data.area_id,
      };
      if (data.make_affiliate && data.affiliate_commission_type) {
        payload.is_affiliate = true;
        Object.assign(
          payload,
          buildAffiliateCommissionPayload({
            affiliate_commission_type: data.affiliate_commission_type,
            affiliate_id: data.affiliate_id,
            affiliate_rate: data.affiliate_rate,
            affiliate_fixed_commission: data.affiliate_fixed_commission,
            affiliate_product_ids: data.affiliate_product_ids,
            affiliate_visit_commission_enabled: data.affiliate_visit_commission_enabled,
            affiliate_visit_commission_threshold: data.affiliate_visit_commission_threshold,
            affiliate_visit_commission_amount: data.affiliate_visit_commission_amount,
          })
        );
      }
      await createUserMutation.mutateAsync(payload as any);
      toast.success(t('form.userCreatedSuccess'));
      navigate('/users');
    } catch {
      return;
    }
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
        submitLabel={t('form.userSubmitCreate')}
        submittingLabel={t('form.creatingUser')}
      >
        {/* ── Section: Personal Info ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:user-rounded-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.userDetailsBasicInfo')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:user-rounded-bold" className="text-primary" width={16} />
                {t('form.firstName')}
              </Typography>
              <RHFTextField name="name" placeholder={t('form.namePlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:letter-bold" className="text-primary" width={16} />
                {t('columns.email')}
              </Typography>
              <RHFTextField name="email" type="email" placeholder={t('form.emailPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:phone-bold" className="text-primary" width={16} />
                {t('columns.phone')}
              </Typography>
              <RHFTextField name="phone" placeholder={t('form.phonePlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:map-point-bold" className="text-primary" width={16} />
                {t('areaLabel')}
              </Typography>
              <RHFInfiniteSelect name="area_id" queryKey={['areas', 'infinite', 'user-form']} fetcher={areaFetcher} placeholder={t('form.selectArea')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Password ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:lock-password-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.passwordLabel')} & {t('form.confirmPasswordLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:lock-password-bold" className="text-violet-500" width={16} />
                {t('form.passwordLabel')}
              </Typography>
              <RHFTextField name="password" type="password" placeholder={t('form.passwordPlaceholder')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:lock-password-bold" className="text-violet-500" width={16} />
                {t('form.confirmPasswordLabel')}
              </Typography>
              <RHFTextField name="password_confirmation" type="password" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Affiliate ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:star-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.makeAffiliateOnCreation')}
            </Typography>
          </Box>
          <Box className="p-6 flex flex-col gap-5">
            <Controller
              name="make_affiliate"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-amber-500/40 transition-colors">
                  <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="rounded accent-primary h-4 w-4" />
                  <Typography variant="subtitle2">{t('form.makeAffiliateOnCreation')}</Typography>
                </label>
              )}
            />

            {makeAffiliate && (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Box>
                  <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateId')}</Typography>
                  <RHFTextField name="affiliate_id" placeholder={t('form.placeholderFiftySix')} fullWidth />
                </Box>
                <Box>
                  <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateCommissionType')}</Typography>
                  <RHFSelect name="affiliate_commission_type" options={commissionTypeOptions} placeholder={t('form.affiliateCommissionType')} />
                </Box>
                {(commissionType === 'percentage_order' || commissionType === 'percentage_selected_products') && (
                  <Box>
                    <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateRatePercent')}</Typography>
                    <RHFTextField name="affiliate_rate" type="number" placeholder={t('form.placeholderFifteen')} fullWidth />
                  </Box>
                )}
                {commissionType === 'fixed_per_order' && (
                  <Box>
                    <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateFixedCommission')}</Typography>
                    <RHFTextField name="affiliate_fixed_commission" type="number" placeholder={t('form.placeholderFifteen')} fullWidth />
                    <Typography variant="caption" className="mt-1 text-muted-foreground">{t('form.affiliateFixedAmountHint')}</Typography>
                  </Box>
                )}
                {commissionType === 'percentage_selected_products' && (
                  <Box className="md:col-span-2">
                    <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateProductIds')}</Typography>
                    <RHFMultiSelect name="affiliate_product_ids" options={productOptions} placeholder={t('form.affiliateProductIds')} isSearchable />
                  </Box>
                )}
                <Box className="md:col-span-2 rounded-xl border border-border/50 p-4">
                  <Typography variant="subtitle2" className="mb-1">{t('form.affiliateVisitCommissionTitle')}</Typography>
                  <Typography variant="caption" className="mb-3 block text-muted-foreground">{t('form.affiliateVisitCommissionHint')}</Typography>
                  <Controller
                    name="affiliate_visit_commission_enabled"
                    control={control}
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} className="rounded accent-primary h-4 w-4" />
                        <Typography variant="body2">{t('form.affiliateVisitCommissionEnabled')}</Typography>
                      </label>
                    )}
                  />
                  {visitCommissionEnabled && (
                    <Box className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Box>
                        <Typography variant="caption" className="mb-1 block">{t('form.affiliateVisitCommissionThreshold')}</Typography>
                        <RHFTextField name="affiliate_visit_commission_threshold" type="number" fullWidth />
                      </Box>
                      <Box>
                        <Typography variant="caption" className="mb-1 block">{t('form.affiliateVisitCommissionAmount')}</Typography>
                        <RHFTextField name="affiliate_visit_commission_amount" type="number" fullWidth />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
