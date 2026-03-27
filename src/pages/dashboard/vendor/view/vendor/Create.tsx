import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
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
    commission_rate: 5,
    is_active: true,
  };

  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(VendorSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

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
        commission_rate: toNumber(vendorData.commission_rate, 5),
        is_active: vendorData.is_active,
      });
    }
  }, [vendorData, isEditMode, isLoadingVendor, reset]);

  const isSubmitting = createVendorMutation.isPending || updateVendorMutation.isPending;
  const errorMessage =
    createVendorMutation.error?.message || updateVendorMutation.error?.message || null;

  const onSubmit = async (data: VendorFormValues) => {
    try {
      const payload = {
        name: { ar: data.name.ar, en: data.name.en },
        owner_name: data.owner_name,
        owner_phone: data.owner_phone,
        commercial_register: data.commercial_register,
        contract_date: data.contract_date,
        contract_number: data.contract_number,
        contract_duration_months: data.contract_duration_months,
        commission_rate: data.commission_rate,
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
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateVendorSubmit') : t('form.createVendorSubmit')}
        submittingLabel={isEditMode ? t('form.updatingVendor') : t('form.creatingVendor')}
      >
        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorStoreNameArField')}</Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.storeNameAr')} helperText={t('form.storeNameArHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:case-minimalistic-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorStoreNameEnField')}</Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.storeNameEn')} helperText={t('form.storeNameEnHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:user-rounded-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorOwnerNameField')}</Typography>
          </Box>
          <RHFTextField name="owner_name" placeholder={t('form.ownerNamePlaceholder')} helperText={t('form.ownerNameHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:phone-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorOwnerPhoneField')}</Typography>
          </Box>
          <RHFTextField name="owner_phone" placeholder={t('form.ownerPhonePlaceholder')} helperText={t('form.ownerPhoneHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:file-text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorCommercialRegisterField')}</Typography>
          </Box>
          <RHFTextField name="commercial_register" placeholder={t('form.commercialRegisterPlaceholder')} helperText={t('form.commercialRegisterHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:calendar-date-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorContractDateField')}</Typography>
          </Box>
          <RHFTextField name="contract_date" type="date" helperText={t('form.contractDateHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:bill-list-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorContractNumberField')}</Typography>
          </Box>
          <RHFTextField name="contract_number" placeholder={t('form.contractNumberPlaceholder')} helperText={t('form.contractNumberHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:clock-circle-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorContractDurationMonthsField')}</Typography>
          </Box>
          <RHFTextField name="contract_duration_months" type="number" placeholder={t('form.contractDurationPlaceholder')} helperText={t('form.contractDurationHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:wad-of-money-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorCommissionRateField')}</Typography>
          </Box>
          <RHFTextField name="commission_rate" type="number" placeholder={t('form.commissionRatePlaceholder')} helperText={t('form.commissionRateHelper')} className="transition-all duration-200" />
        </Box>

        <Box className="group">
          <Box className="mb-2 flex items-center gap-2">
            <Iconify icon="solar:check-circle-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.vendorActiveStatusField')}</Typography>
          </Box>
          <Controller
            name="is_active"
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label={t('form.markVendorActive')}
              />
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
