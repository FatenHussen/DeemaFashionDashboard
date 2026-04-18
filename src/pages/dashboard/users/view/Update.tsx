import type { UserItem } from '@/pages/dashboard/users/types/user.types';

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useFetchAreas } from '@/pages/dashboard/locations/hooks/area';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { buildAffiliateCommissionPayload } from '@/pages/dashboard/users/lib/affiliate-commission';
import {
  useUpdateUser,
  useFetchUserById,
  useDemoteAffiliate,
  useReactivateAffiliate,
} from '@/pages/dashboard/users/hooks/user';
import {
  UserUpdateSchema,
  type UserUpdateFormValues,
  AffiliateReactivateSchema,
  type AffiliateReactivateFormValues,
} from '@/pages/dashboard/users/validation/user.validation';

import { CONFIG } from 'src/global-config';
import { Box, Button, Dialog, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';

// ----------------------------------------------------------------------

export default function UpdatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userFromState = location.state?.user as UserItem | undefined;

  const [showReactivatePanel, setShowReactivatePanel] = useState(false);
  const [affiliateDemoteModalOpen, setAffiliateDemoteModalOpen] = useState(false);

  const { data: userResponse, isLoading: isLoadingUser } = useFetchUserById(id || '');
  const { data: areasResponse } = useFetchAreas();
  const { data: productsResponse } = useFetchProducts({ page: 1, limit: 500 });
  const updateUserMutation = useUpdateUser();
  const reactivateAffiliateMutation = useReactivateAffiliate();
  const demoteAffiliateMutation = useDemoteAffiliate();

  const user = userResponse?.data;
  const areas = areasResponse?.data?.items || [];
  const productItems =
    (productsResponse?.data as { items?: { id: number; name: unknown }[] } | undefined)?.items ?? [];
  const productOptions = productItems.map((p) => ({
    value: p.id,
    label: `${p.id} — ${formatTranslated(p.name as Parameters<typeof formatTranslated>[0])}`,
  }));

  const sourceUser = user ?? userFromState;
  const aff = sourceUser?.affiliate;
  const isAffiliate = aff?.is_affiliate ?? false;
  const affiliateApproved = aff?.affiliate_approved ?? false;
  const showReactivateSection = isAffiliate && !affiliateApproved;
  const showApprovedAffiliateSection = isAffiliate && affiliateApproved;

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

  const defaultValues: UserUpdateFormValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    area_id: 0,
  };

  const methods = useForm<UserUpdateFormValues>({
    resolver: zodResolver(UserUpdateSchema) as any,
    defaultValues,
  });

  const reactivateMethods = useForm<AffiliateReactivateFormValues>({
    resolver: zodResolver(AffiliateReactivateSchema) as any,
    defaultValues: {
      affiliate_commission_type: 'percentage_order',
      affiliate_id: '',
      affiliate_rate: undefined,
      affiliate_fixed_commission: undefined,
      affiliate_product_ids: [],
      affiliate_visit_commission_enabled: false,
      affiliate_visit_commission_threshold: undefined,
      affiliate_visit_commission_amount: undefined,
    },
  });

  const { handleSubmit, reset, control, watch } = methods;
  const { handleSubmit: handleReactivateSubmit, reset: resetReactivate, control: reactivateControl } =
    reactivateMethods;
  const mainCommissionType = watch('affiliate_commission_type');
  const mainVisitEnabled = watch('affiliate_visit_commission_enabled');
  const reactivateCommissionType = reactivateMethods.watch('affiliate_commission_type');
  const reactivateVisitEnabled = reactivateMethods.watch('affiliate_visit_commission_enabled');

  useEffect(() => {
    if (!sourceUser) return;
    const a = sourceUser.affiliate;
    const base = {
      name: sourceUser.name || '',
      email: sourceUser.email || '',
      phone: sourceUser.phone || '',
      area_id: (sourceUser as { area_id?: number }).area_id ?? 0,
      password: '',
      password_confirmation: '',
    };
    if (showApprovedAffiliateSection && a) {
      reset({
        ...base,
        affiliate_commission_type:
          (a.affiliate_commission_type as UserUpdateFormValues['affiliate_commission_type']) ||
          'percentage_order',
        affiliate_id: a.affiliate_id != null ? String(a.affiliate_id) : '',
        affiliate_rate:
          a.affiliate_rate != null && String(a.affiliate_rate) !== ''
            ? Number(a.affiliate_rate)
            : undefined,
        affiliate_fixed_commission:
          a.affiliate_fixed_commission != null && String(a.affiliate_fixed_commission) !== ''
            ? Number(a.affiliate_fixed_commission)
            : undefined,
        affiliate_product_ids: Array.isArray(a.affiliate_product_ids) ? a.affiliate_product_ids : [],
        affiliate_visit_commission_enabled: Boolean(a.affiliate_visit_commission_enabled),
        affiliate_visit_commission_threshold:
          a.affiliate_visit_commission_threshold != null && String(a.affiliate_visit_commission_threshold) !== ''
            ? Number(a.affiliate_visit_commission_threshold)
            : undefined,
        affiliate_visit_commission_amount:
          a.affiliate_visit_commission_amount != null && String(a.affiliate_visit_commission_amount) !== ''
            ? Number(a.affiliate_visit_commission_amount)
            : undefined,
      });
    } else {
      reset(base);
    }
  }, [sourceUser, reset, showApprovedAffiliateSection]);

  useEffect(() => {
    if (!sourceUser?.affiliate || sourceUser.affiliate.affiliate_approved) return;
    const a = sourceUser.affiliate;
    resetReactivate({
      affiliate_commission_type:
        (a.affiliate_commission_type as AffiliateReactivateFormValues['affiliate_commission_type']) ||
        'percentage_order',
      affiliate_id: a.affiliate_id != null ? String(a.affiliate_id) : '',
      affiliate_rate:
        a.affiliate_rate != null && String(a.affiliate_rate) !== ''
          ? Number(a.affiliate_rate)
          : undefined,
      affiliate_fixed_commission:
        a.affiliate_fixed_commission != null && String(a.affiliate_fixed_commission) !== ''
          ? Number(a.affiliate_fixed_commission)
          : undefined,
      affiliate_product_ids: Array.isArray(a.affiliate_product_ids) ? a.affiliate_product_ids : [],
      affiliate_visit_commission_enabled: Boolean(a.affiliate_visit_commission_enabled),
      affiliate_visit_commission_threshold:
        a.affiliate_visit_commission_threshold != null && String(a.affiliate_visit_commission_threshold) !== ''
          ? Number(a.affiliate_visit_commission_threshold)
          : undefined,
      affiliate_visit_commission_amount:
        a.affiliate_visit_commission_amount != null && String(a.affiliate_visit_commission_amount) !== ''
          ? Number(a.affiliate_visit_commission_amount)
          : undefined,
    });
  }, [sourceUser, resetReactivate]);

  const isSubmitting =
    updateUserMutation.isPending ||
    reactivateAffiliateMutation.isPending ||
    demoteAffiliateMutation.isPending;
  const errorMessage =
    updateUserMutation.error?.message ||
    reactivateAffiliateMutation.error?.message ||
    demoteAffiliateMutation.error?.message ||
    null;

  const onSubmit = async (data: UserUpdateFormValues) => {
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        last_name: '',
        email: data.email,
        phone: data.phone || '',
        area_id: data.area_id,
      };
      if (data.password) {
        payload.password = data.password;
        payload.password_confirmation = data.password_confirmation;
      }
      if (showApprovedAffiliateSection && data.affiliate_commission_type) {
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
      await updateUserMutation.mutateAsync({ id: id!, data: payload as any });
      toast.success(t('form.userUpdatedSuccess'));
    } catch {
      return;
    }
  };

  const onReactivate = async (data: AffiliateReactivateFormValues) => {
    try {
      const commission = buildAffiliateCommissionPayload({
        affiliate_commission_type: data.affiliate_commission_type,
        affiliate_id: data.affiliate_id,
        affiliate_rate: data.affiliate_rate,
        affiliate_fixed_commission: data.affiliate_fixed_commission,
        affiliate_product_ids: data.affiliate_product_ids,
        affiliate_visit_commission_enabled: data.affiliate_visit_commission_enabled,
        affiliate_visit_commission_threshold: data.affiliate_visit_commission_threshold,
        affiliate_visit_commission_amount: data.affiliate_visit_commission_amount,
      });
      await reactivateAffiliateMutation.mutateAsync({
        id: id!,
        data: commission as any,
      });
      toast.success(t('form.userConvertedAffiliateSuccess'));
      setShowReactivatePanel(false);
    } catch {
      return;
    }
  };

  const handleDemoteConfirm = async () => {
    try {
      await demoteAffiliateMutation.mutateAsync(id!);
      setAffiliateDemoteModalOpen(false);
      toast.success(t('form.affiliateDemoteSuccess'));
    } catch {
      return;
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoadingUser && !userFromState) {
    return <LoadingScreen />;
  }
  if (!sourceUser) {
    if (!userFromState) {
      toast.error(t('form.userNotFound'));
      navigate('/users');
    }
    return null;
  }

  return (
    <>
      <title>{t('form.userEditDocumentTitle', { appName: CONFIG.appName })}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={t('form.editUser')}
        description={t('form.editUserDesc')}
        isEditMode
        submitLabel={t('form.userSubmitUpdate')}
        submittingLabel={t('form.updatingUser')}
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
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.firstName')}</Typography>
              <RHFTextField name="name" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.email')}</Typography>
              <RHFTextField name="email" type="email" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.phone')}</Typography>
              <RHFTextField name="phone" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('areaLabel')}</Typography>
              <Controller
                name="area_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <select {...field} value={field.value || ''} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value={0}>{t('form.selectArea')}</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>{typeof a.name === 'object' ? a.name.en || a.name.ar : a.name}</option>
                      ))}
                    </select>
                    {error?.message && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
                  </div>
                )}
              />
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
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.passwordLabel')}</Typography>
              <RHFTextField name="password" type="password" fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.confirmPasswordLabel')}</Typography>
              <RHFTextField name="password_confirmation" type="password" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Affiliate Settings ── */}
        {showApprovedAffiliateSection && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
              <Box className="flex items-center gap-3">
                <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Iconify icon="solar:star-bold" className="text-amber-500" width={15} />
                </Box>
                <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.affiliateSettingsTitle')}</Typography>
              </Box>
              {affiliateApproved && (
                <Button type="button" color="error" variant="outlined" size="small" disabled={demoteAffiliateMutation.isPending} onClick={() => setAffiliateDemoteModalOpen(true)}>
                  {t('form.affiliateDemote')}
                </Button>
              )}
            </Box>
            <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateId')}</Typography>
                <RHFTextField name="affiliate_id" fullWidth />
              </Box>
              <Box>
                <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateCommissionType')}</Typography>
                <RHFSelect name="affiliate_commission_type" options={commissionTypeOptions} placeholder={t('form.affiliateCommissionType')} />
              </Box>
              {(mainCommissionType === 'percentage_order' || mainCommissionType === 'percentage_selected_products') && (
                <Box>
                  <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateRatePercent')}</Typography>
                  <RHFTextField name="affiliate_rate" type="number" fullWidth />
                </Box>
              )}
              {mainCommissionType === 'fixed_per_order' && (
                <Box>
                  <Typography variant="caption" className="mb-1 block font-semibold text-foreground">{t('form.affiliateFixedCommission')}</Typography>
                  <RHFTextField name="affiliate_fixed_commission" type="number" fullWidth />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">{t('form.affiliateFixedAmountHint')}</Typography>
                </Box>
              )}
              {mainCommissionType === 'percentage_selected_products' && (
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
                {mainVisitEnabled && (
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
          </Box>
        )}

        {/* ── Section: Affiliate Reactivate ── */}
        {showReactivateSection && (
          <Box className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
              <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:user-add-bold" className="text-sky-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.convertToAffiliate')}</Typography>
            </Box>
            <Box className="p-6">
              {!showReactivatePanel ? (
                <Button type="button" variant="outlined" onClick={() => setShowReactivatePanel(true)} className="gap-2">
                  <Iconify icon="solar:user-add-bold" width={18} />
                  {t('form.convertToAffiliate')}
                </Button>
              ) : (
                <FormProvider {...reactivateMethods}>
                  <Box>
                    <Typography variant="subtitle2" className="mb-1">{t('form.affiliateReactivateTitle')}</Typography>
                    <Typography variant="body2" className="text-muted-foreground mb-4">{t('form.affiliateReactivateDesc')}</Typography>
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Box>
                        <Typography variant="caption" className="mb-1 block">{t('form.affiliateId')}</Typography>
                        <RHFTextField name="affiliate_id" fullWidth />
                      </Box>
                      <Box>
                        <Typography variant="caption" className="mb-1 block">{t('form.affiliateCommissionType')}</Typography>
                        <RHFSelect name="affiliate_commission_type" options={commissionTypeOptions} placeholder={t('form.affiliateCommissionType')} />
                      </Box>
                      {(reactivateCommissionType === 'percentage_order' || reactivateCommissionType === 'percentage_selected_products') && (
                        <Box>
                          <Typography variant="caption" className="mb-1 block">{t('form.affiliateRatePercent')}</Typography>
                          <RHFTextField name="affiliate_rate" type="number" fullWidth />
                        </Box>
                      )}
                      {reactivateCommissionType === 'fixed_per_order' && (
                        <Box>
                          <Typography variant="caption" className="mb-1 block">{t('form.affiliateFixedCommission')}</Typography>
                          <RHFTextField name="affiliate_fixed_commission" type="number" fullWidth />
                          <Typography variant="caption" className="mt-1 text-muted-foreground">{t('form.affiliateFixedAmountHint')}</Typography>
                        </Box>
                      )}
                      {reactivateCommissionType === 'percentage_selected_products' && (
                        <Box className="md:col-span-2">
                          <Typography variant="caption" className="mb-1 block">{t('form.affiliateProductIds')}</Typography>
                          <RHFMultiSelect name="affiliate_product_ids" options={productOptions} placeholder={t('form.affiliateProductIds')} isSearchable />
                        </Box>
                      )}
                      <Box className="md:col-span-2 rounded-xl border border-border/50 p-4">
                        <Typography variant="subtitle2" className="mb-1">{t('form.affiliateVisitCommissionTitle')}</Typography>
                        <Typography variant="caption" className="mb-3 block text-muted-foreground">{t('form.affiliateVisitCommissionHint')}</Typography>
                        <Controller
                          name="affiliate_visit_commission_enabled"
                          control={reactivateControl}
                          render={({ field }) => (
                            <label className="flex cursor-pointer items-center gap-2">
                              <input type="checkbox" checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} className="rounded accent-primary h-4 w-4" />
                              <Typography variant="body2">{t('form.affiliateVisitCommissionEnabled')}</Typography>
                            </label>
                          )}
                        />
                        {reactivateVisitEnabled && (
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
                      <Box className="md:col-span-2 flex items-center gap-2">
                        <Button type="button" variant="contained" disabled={reactivateAffiliateMutation.isPending} onClick={() => handleReactivateSubmit(onReactivate)()}>
                          {reactivateAffiliateMutation.isPending ? t('form.submittingEllipsis') : t('form.affiliateReactivateSubmit')}
                        </Button>
                        <Button type="button" variant="text" onClick={() => setShowReactivatePanel(false)}>{t('cancel')}</Button>
                      </Box>
                    </Box>
                  </Box>
                </FormProvider>
              )}
            </Box>
          </Box>
        )}
      </CreateFormLayout>

      <Dialog
        open={affiliateDemoteModalOpen}
        onClose={() =>
          !demoteAffiliateMutation.isPending && setAffiliateDemoteModalOpen(false)
        }
        maxWidth="sm"
        disableBackdropClick={demoteAffiliateMutation.isPending}
        title={t('form.affiliateDemote')}
        content={t('form.affiliateDemoteConfirm')}
        actions={
          <>
            <Button
              type="button"
              variant="outlined"
              disabled={demoteAffiliateMutation.isPending}
              onClick={() => setAffiliateDemoteModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              color="error"
              variant="contained"
              disabled={demoteAffiliateMutation.isPending}
              onClick={handleDemoteConfirm}
            >
              {demoteAffiliateMutation.isPending ? t('updating') : t('yes')}
            </Button>
          </>
        }
      />
    </>
  );
}
