import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  DeliveryDistanceRangeFormSchema,
  type DeliveryDistanceRangeFormValues,
} from '@/pages/dashboard/delivery-distance-ranges/validation/delivery-distance-range.validation';
import {
  useCreateDeliveryDistanceRange,
  useUpdateDeliveryDistanceRange,
  useFetchDeliveryDistanceRangeById,
} from '@/pages/dashboard/delivery-distance-ranges/hooks/delivery-distance-range';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchDeliveryDistanceRangeById(
    id || ''
  );
  const createMutation = useCreateDeliveryDistanceRange();
  const updateMutation = useUpdateDeliveryDistanceRange();

  const defaultValues: DeliveryDistanceRangeFormValues = {
    min_distance: 0,
    max_distance: null,
    multiplier: 1,
  };

  const methods = useForm<DeliveryDistanceRangeFormValues>({
    resolver: zodResolver(DeliveryDistanceRangeFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const d = detailsResponse.data;
      reset({
        min_distance: d.min_distance,
        max_distance: d.max_distance,
        multiplier: d.multiplier,
      });
    }
  }, [detailsResponse, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: DeliveryDistanceRangeFormValues) => {
    const payload = {
      min_distance: data.min_distance,
      max_distance: data.max_distance,
      multiplier: data.multiplier,
    };
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.deliveryDistanceRangeUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.deliveryDistanceRangeCreatedSuccess'));
      }
      navigate('/delivery-distance-ranges');
    } catch (err) {
      console.error('Error saving delivery distance range:', err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.deliveryDistanceRangeEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.deliveryDistanceRangeCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/delivery-distance-ranges')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={
          isEditMode
            ? t('form.deliveryDistanceRangeFormTitleEdit')
            : t('form.deliveryDistanceRangeFormTitleCreate')
        }
        description={
          isEditMode
            ? t('form.deliveryDistanceRangeFormDescEdit')
            : t('form.deliveryDistanceRangeFormDescCreate')
        }
        isEditMode={isEditMode}
        isLoading={false}
        submitLabel={
          isEditMode
            ? t('form.deliveryDistanceRangeSubmitUpdate')
            : t('form.deliveryDistanceRangeSubmitCreate')
        }
        submittingLabel={
          isEditMode
            ? t('form.deliveryDistanceRangeSubmittingUpdate')
            : t('form.deliveryDistanceRangeSubmittingCreate')
        }
      >
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:routing-2-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.deliveryDistanceRangeSectionDistances')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.deliveryDistanceRangeMinLabel')}
              </Typography>
              <RHFTextField
                name="min_distance"
                type="number"
                placeholder={t('form.deliveryDistanceRangeMinPlaceholder')}
                helperText={t('form.deliveryDistanceRangeMinHelper')}
                fullWidth
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.deliveryDistanceRangeMaxLabel')}
              </Typography>
              <RHFTextField
                name="max_distance"
                type="number"
                placeholder={t('form.deliveryDistanceRangeMaxPlaceholder')}
                helperText={t('form.deliveryDistanceRangeMaxHelper')}
                fullWidth
              />
            </Box>
            <Box className="md:col-span-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.deliveryDistanceRangeMultiplierLabel')}
              </Typography>
              <RHFTextField
                name="multiplier"
                type="number"
                placeholder={t('form.deliveryDistanceRangeMultiplierPlaceholder')}
                fullWidth
              />
            </Box>
            <Box className="md:col-span-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <Typography variant="caption" className="text-muted-foreground block">
                {t('form.deliveryDistanceRangeRuleHint')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
