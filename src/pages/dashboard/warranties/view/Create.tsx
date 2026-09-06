import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  WarrantySchema,
  type WarrantyFormValues,
} from '@/pages/dashboard/warranties/validation/warranty.validation';
import {
  useCreateWarranty,
  useUpdateWarranty,
  useFetchWarrantyById,
} from '@/pages/dashboard/warranties/hooks/warranty';

import { CONFIG } from 'src/global-config';
import { Box, Checkbox, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

const asPair = (value: unknown, translations?: { en?: string; ar?: string }) => {
  const objectValue = typeof value === 'object' && value !== null ? (value as { en?: string; ar?: string }) : null;
  const plain = typeof value === 'string' ? value : '';
  return {
    en: translations?.en ?? objectValue?.en ?? plain ?? '',
    ar: translations?.ar ?? objectValue?.ar ?? plain ?? '',
  };
};

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: warrantyResp, isLoading: isLoadingWarranty } = useFetchWarrantyById(id || '');
  const createMutation = useCreateWarranty();
  const updateMutation = useUpdateWarranty();

  const defaultValues: WarrantyFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    is_active: true,
  };

  const methods = useForm<WarrantyFormValues>({
    resolver: zodResolver(WarrantySchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (!isEditMode || !warrantyResp?.data || isLoadingWarranty) return;
    const item = warrantyResp.data;
    reset({
      name: asPair(item.name, item.name_translations),
      description: asPair(item.description, item.description_translations),
      is_active: Boolean(item.is_active),
    });
  }, [isEditMode, warrantyResp, isLoadingWarranty, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: WarrantyFormValues) => {
    try {
      const payload = {
        name: data.name,
        ...(data.description.en.trim() || data.description.ar.trim()
          ? { description: data.description }
          : {}),
        is_active: data.is_active,
      };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.warrantyUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.warrantyCreatedSuccess'));
      }
      navigate('/products/warranties');
    } catch {
      /* toast via global handler */
    }
  };

  return (
    <>
      <title>
        {isEditMode
          ? t('form.warrantyEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.warrantyCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/products/warranties')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editWarranty') : t('form.createWarranty')}
        description={isEditMode ? t('form.editWarrantyDesc') : t('form.createWarrantyDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingWarranty}
        loadingText={t('form.loadingWarranty')}
        submitLabel={isEditMode ? t('form.updateWarranty') : t('form.createWarrantySubmit')}
        submittingLabel={isEditMode ? t('form.updatingWarrantySubmit') : t('form.creatingWarrantySubmit')}
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-2">
              <Iconify icon="solar:text-bold" className="text-primary" width={18} />
              {t('form.warrantyNameEnLabel')}
            </Typography>
            <RHFTextField name="name.en" placeholder={t('form.warrantyNameEnPlaceholder')} />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              className="mb-2 font-semibold text-foreground flex items-center gap-2"
              dir="rtl"
            >
              <Iconify icon="solar:text-bold" className="text-primary" width={18} />
              {t('form.warrantyNameArLabel')}
            </Typography>
            <RHFTextField name="name.ar" placeholder={t('form.warrantyNameArPlaceholder')} />
          </Box>
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.warrantyDescriptionEnLabel')}
            </Typography>
            <RHFTextField name="description.en" placeholder={t('form.warrantyDescriptionEnPlaceholder')} />
          </Box>
          <Box>
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground" dir="rtl">
              {t('form.warrantyDescriptionArLabel')}
            </Typography>
            <RHFTextField name="description.ar" placeholder={t('form.warrantyDescriptionArPlaceholder')} />
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
                label={t('form.warrantyIsActive')}
              />
            </Box>
          )}
        />
      </CreateFormLayout>
    </>
  );
}
