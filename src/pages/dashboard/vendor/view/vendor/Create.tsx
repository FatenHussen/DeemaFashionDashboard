import type { VendorData, VendorCreateUpdatePayload } from '@/pages/dashboard/vendor/types/vendor.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller } from 'react-hook-form';
import {
  VendorSchema,
  type VendorFormValues,
} from '@/pages/dashboard/vendor/validation/vendor.validation';
import {
  useCreateVendor,
  useUpdateVendor,
  useFetchVendorById,
} from '@/pages/dashboard/vendor/hooks/vendor';

import { CONFIG } from 'src/global-config';
import { Box, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

/** API expects `commission_rate` when type is percentage; vendor form has no commission fields. */
function commissionPayloadForVendorApi(
  vendorData: VendorData | undefined,
  isEditMode: boolean
): Pick<
  VendorCreateUpdatePayload,
  'commission_type' | 'settlement_cycle' | 'commission_rate' | 'fixed_commission'
> {
  const settlement: 'weekly' | 'monthly' =
    isEditMode && vendorData?.settlement_cycle === 'weekly' ? 'weekly' : 'monthly';

  if (isEditMode && vendorData) {
    if (vendorData.commission_type === 'fixed') {
      return {
        commission_type: 'fixed',
        settlement_cycle: settlement,
        fixed_commission: Number(vendorData.fixed_commission ?? 0),
      };
    }
    return {
      commission_type: 'percentage',
      settlement_cycle: settlement,
      commission_rate: vendorData.commission_rate ?? 0,
    };
  }

  return {
    commission_type: 'percentage',
    settlement_cycle: 'monthly',
    commission_rate: 0,
  };
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: vendorData, isLoading: isLoadingVendor } = useFetchVendorById(id || '');
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();

  const defaultValues: VendorFormValues = {
    name: { ar: '', en: '' },
    owner_name: '',
    owner_phone: '',
    commercial_register: '',
    contract_date: '',
    contract_number: '',
    contract_duration_months: 12,
    is_active: true,
  };

  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(VendorSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && vendorData && !isLoadingVendor) {
      const nameValue =
        typeof vendorData.name === 'string'
          ? { ar: vendorData.name, en: vendorData.name }
          : vendorData.name;

      const commercialRegister =
        vendorData.commercial_register?.trim() ||
        vendorData.commercial_register_number?.trim() ||
        '';

      const toNumber = (v: unknown, fallback: number) => {
        if (v === null || v === undefined || v === '') return fallback;
        const n = typeof v === 'number' ? v : Number.parseFloat(String(v));
        return Number.isFinite(n) ? n : fallback;
      };

      reset({
        name: nameValue,
        owner_name: vendorData.owner_name,
        owner_phone: vendorData.owner_phone ?? '',
        commercial_register: commercialRegister,
        contract_date: vendorData.contract_date ?? '',
        contract_number: vendorData.contract_number ?? '',
        contract_duration_months: toNumber(vendorData.contract_duration_months, 12),
        is_active: vendorData.is_active,
      });
    }
  }, [vendorData, isEditMode, isLoadingVendor, reset]);

  const isSubmitting = createVendorMutation.isPending || updateVendorMutation.isPending;
  const errorMessage =
    createVendorMutation.error?.message || updateVendorMutation.error?.message || null;

  const onSubmit = async (data: VendorFormValues) => {
    try {
      const payload: VendorCreateUpdatePayload = {
          name: { ar: data.name.ar, en: data.name.en },
          owner_name: data.owner_name,
          owner_phone: data.owner_phone,
          commercial_register: data.commercial_register.trim(),
          contract_date: data.contract_date,
          contract_number: data.contract_number,
          contract_duration_months: data.contract_duration_months,
          ...commissionPayloadForVendorApi(vendorData, isEditMode),
          is_active: data.is_active,
        };

      if (isEditMode && id) {
        await updateVendorMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.vendorUpdatedSuccess'));
        navigate('/vendor');
      } else {
        await createVendorMutation.mutateAsync(payload);
        toast.success(t('form.vendorCreatedSuccess'));
        navigate('/vendor');
      }
    } catch (error: any) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleCancel = () => navigate('/vendor');

  const infoText = isEditMode ? t('form.vendorFormInfoEdit') : t('form.vendorFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.vendorEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.vendorCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editVendor') : t('form.createVendor')}
        description={isEditMode ? t('form.vendorEditPageDesc') : t('form.vendorCreatePageDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingVendor}
        loadingText={t('form.loadingVendor')}
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateVendorSubmit') : t('form.createVendorSubmit')}
        submittingLabel={isEditMode ? t('form.updatingVendor') : t('form.creatingVendor')}
      >
        {/* ── Section: Store Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorStoreNameArField')} / {t('form.vendorStoreNameEnField')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={16} />
                {t('form.vendorStoreNameEnField')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.storeNameEn')} helperText={t('form.storeNameEnHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={16} />
                {t('form.vendorStoreNameArField')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.storeNameAr')} helperText={t('form.storeNameArHelper')} dir="rtl" />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Owner Info ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:user-rounded-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorOwnerNameField')} & {t('form.vendorOwnerPhoneField')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:user-rounded-bold" className="text-violet-500" width={16} />
                {t('form.vendorOwnerNameField')}
              </Typography>
              <RHFTextField name="owner_name" placeholder={t('form.ownerNamePlaceholder')} helperText={t('form.ownerNameHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:phone-bold" className="text-violet-500" width={16} />
                {t('form.vendorOwnerPhoneField')}
              </Typography>
              <RHFTextField name="owner_phone" placeholder={t('form.ownerPhonePlaceholder')} helperText={t('form.ownerPhoneHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:file-text-bold" className="text-violet-500" width={16} />
                {t('form.vendorCommercialRegisterField')}
              </Typography>
              <RHFTextField name="commercial_register" placeholder={t('form.commercialRegisterPlaceholder')} helperText={t('form.commercialRegisterHelper')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Contract ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bill-list-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorContractNumberField')} & {t('form.vendorContractDateField')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:bill-list-bold" className="text-amber-500" width={16} />
                {t('form.vendorContractNumberField')}
              </Typography>
              <RHFTextField name="contract_number" placeholder={t('form.contractNumberPlaceholder')} helperText={t('form.contractNumberHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:calendar-date-bold" className="text-amber-500" width={16} />
                {t('form.vendorContractDateField')}
              </Typography>
              <RHFTextField name="contract_date" type="date" helperText={t('form.contractDateHelper')} />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:clock-circle-bold" className="text-amber-500" width={16} />
                {t('form.vendorContractDurationMonthsField')}
              </Typography>
              <RHFTextField name="contract_duration_months" type="number" placeholder={t('form.contractDurationPlaceholder')} helperText={t('form.contractDurationHelper')} />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:check-circle-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.vendorActiveStatusField')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Box className="group flex items-center p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 transition-colors max-w-md">
              <Controller
                name="is_active"
                control={methods.control}
                render={({ field }) => (
                  <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} label={t('form.markVendorActive')} />
                )}
              />
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
