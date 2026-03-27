import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  PointRuleSchema,
  type PointRuleFormValues,
} from '@/pages/dashboard/point-rules/validation/point-rule.validation';
import {
  useCreatePointRule,
  useUpdatePointRule,
  useFetchPointRuleById,
} from '@/pages/dashboard/point-rules/hooks/point-rule';

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

  const { data: ruleResponse, isLoading: isLoadingRule } = useFetchPointRuleById(id || '');
  const createMutation = useCreatePointRule();
  const updateMutation = useUpdatePointRule();

  const defaultValues: PointRuleFormValues = {
    title: { en: '', ar: '' },
    type: 'fixed',
    value: 0,
    min_order_amount: null,
    expires_after_days: 365,
    is_active: true,
  };

  const methods = useForm<PointRuleFormValues>({
    resolver: zodResolver(PointRuleSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (isEditMode && ruleResponse?.data) {
      const d = ruleResponse.data;
      const title = typeof d.title === 'object' && d.title !== null
        ? d.title
        : { en: String(d.title || ''), ar: String(d.title || '') };
      reset({
        title,
        type: d.type || 'fixed',
        value: d.value || 0,
        min_order_amount: d.min_order_amount,
        expires_after_days: d.expires_after_days || 365,
        is_active: !!d.is_active,
      });
    }
  }, [ruleResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: PointRuleFormValues) => {
    try {
      const payload = {
        ...data,
        min_order_amount: data.min_order_amount || null,
      };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.pointRuleUpdatedSuccess'));
        navigate('/point-rules');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success(t('form.pointRuleCreatedSuccess'));
        navigate('/point-rules');
      }
    } catch (error: any) {
      console.error('Error saving point rule:', error);
    }
  };

  const handleCancel = () => navigate('/point-rules');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.pointRuleEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.pointRuleCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editPointRule') : t('form.createPointRule')}
        description={
          isEditMode ? t('form.editPointRuleDesc') : t('form.createPointRuleDesc')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingRule}
        loadingText={t('form.loadingPointRule')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updatePointRule') : t('form.createPointRuleSubmit')}
        submittingLabel={isEditMode ? t('form.updatingPointRuleSubmit') : t('form.creatingPointRuleSubmit')}
      >
        {/* Title EN */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:star-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField name="title.en" placeholder={t('form.pointRuleNameEnPlaceholder')} fullWidth />
        </Box>

        {/* Title AR */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:star-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField name="title.ar" placeholder={t('form.pointRuleNameArPlaceholder')} dir="rtl" fullWidth />
        </Box>

        {/* Type & Value */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('columns.type')}
              </Typography>
            </Box>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="fixed">{t('form.pointRuleTypeFixed')}</option>
                  <option value="percentage">{t('form.pointRuleTypePercentage')}</option>
                </select>
              )}
            />
          </Box>
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.pointsLabel')}
              </Typography>
            </Box>
            <RHFTextField name="value" type="number" placeholder={t('form.pointRuleValueExample')} fullWidth />
          </Box>
        </Box>

        {/* Min Order Amount & Expires */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:cart-large-2-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.minOrderAmount')}
              </Typography>
            </Box>
            <RHFTextField name="min_order_amount" type="number" placeholder={t('form.minOrderAmountPlaceholder')} helperText={t('form.minOrderAmountHelper')} fullWidth />
          </Box>
          <Box className="flex-1 min-w-[140px]">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:clock-circle-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.expiresAfterDays')}
              </Typography>
            </Box>
            <RHFTextField name="expires_after_days" type="number" placeholder={t('form.pointRuleExpiryExample')} fullWidth />
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
