import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { UnitSchema, type UnitFormValues } from '@/pages/dashboard/units/validation/unit.validation';
import {
  useCreateUnit,
  useUpdateUnit,
  useFetchUnitById,
} from '@/pages/dashboard/units/hooks/unit';

import { CONFIG } from 'src/global-config';
import { Box, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: unitResp, isLoading: isLoadingUnit } = useFetchUnitById(id || '');
  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();

  const defaultValues: UnitFormValues = {
    name: { en: '', ar: '' },
    is_active: true,
  };

  const methods = useForm<UnitFormValues>({
    resolver: zodResolver(UnitSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (!isEditMode || !unitResp?.data || isLoadingUnit) return;
    const u = unitResp.data;
    reset({
      name: { en: u.name?.en ?? '', ar: u.name?.ar ?? '' },
      is_active: Boolean(u.is_active),
    });
  }, [isEditMode, unitResp, isLoadingUnit, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: UnitFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: { name: data.name, is_active: data.is_active },
        });
        toast.success(t('form.unitUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync({ name: data.name, is_active: data.is_active });
        toast.success(t('form.unitCreatedSuccess'));
      }
      navigate('/products/units');
    } catch {
      /* toast via global handler */
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.unitEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.unitCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/products/units')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editUnit') : t('form.createUnit')}
        description={isEditMode ? t('form.editUnitDesc') : t('form.createUnitDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingUnit}
        loadingText={t('form.loadingUnit')}
        submitLabel={isEditMode ? t('form.updateUnit') : t('form.createUnitSubmit')}
        submittingLabel={isEditMode ? t('form.updatingUnitSubmit') : t('form.creatingUnitSubmit')}
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-2">
              <Iconify icon="solar:text-bold" className="text-primary" width={18} />
              {t('form.unitNameEnLabel')}
            </Typography>
            <RHFTextField name="name.en" placeholder={t('form.unitNameEnPlaceholder')} />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              className="mb-2 font-semibold text-foreground flex items-center gap-2"
              dir="rtl"
            >
              <Iconify icon="solar:text-bold" className="text-primary" width={18} />
              {t('form.unitNameArLabel')}
            </Typography>
            <RHFTextField name="name.ar" placeholder={t('form.unitNameArPlaceholder')} />
          </Box>
        </Box>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Box className="pt-2">
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label={t('form.unitIsActive')}
              />
            </Box>
          )}
        />
      </CreateFormLayout>
    </>
  );
}
