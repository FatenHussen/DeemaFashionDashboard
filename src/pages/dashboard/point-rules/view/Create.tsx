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
        type: 'fixed',
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
        submitLabel={isEditMode ? t('form.updatePointRule') : t('form.createPointRuleSubmit')}
        submittingLabel={isEditMode ? t('form.updatingPointRuleSubmit') : t('form.creatingPointRuleSubmit')}
      >
        {/* ── Section: Title ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:star-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')} / {t('form.nameAr')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:star-bold" className="text-primary" width={16} />
                {t('form.nameEn')}
              </Typography>
              <RHFTextField name="title.en" placeholder={t('form.pointRuleNameEnPlaceholder')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:star-bold" className="text-primary" width={16} />
                {t('form.nameAr')}
              </Typography>
              <RHFTextField name="title.ar" placeholder={t('form.pointRuleNameArPlaceholder')} dir="rtl" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Rule Configuration ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.pointsLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:medal-ribbons-star-bold" className="text-amber-500" width={16} />
                {t('form.pointsLabel')}
              </Typography>
              <RHFTextField name="value" type="number" placeholder={t('form.pointRuleValueExample')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:cart-large-2-bold" className="text-amber-500" width={16} />
                {t('form.minOrderAmount')}
              </Typography>
              <RHFTextField name="min_order_amount" type="number" placeholder={t('form.minOrderAmountPlaceholder')} helperText={t('form.minOrderAmountHelper')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:clock-circle-bold" className="text-amber-500" width={16} />
                {t('form.expiresAfterDays')}
              </Typography>
              <RHFTextField name="expires_after_days" type="number" placeholder={t('form.pointRuleExpiryExample')} fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
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
                  <Switch checked={field.value} onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">{t('active')}</Typography>
                </div>
              )}
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
