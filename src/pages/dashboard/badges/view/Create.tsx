import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import {
  BadgeSchema,
  type BadgeFormValues,
} from '@/pages/dashboard/badges/validation/badge.validation';
import {
  useCreateBadge,
  useUpdateBadge,
  useFetchBadgeById,
} from '@/pages/dashboard/badges/hooks/badge';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchBadgeById(id || '');
  const createMutation = useCreateBadge();
  const updateMutation = useUpdateBadge();

  const defaultValues: BadgeFormValues = {
    name: { en: '', ar: '' },
    color: '#000000',
  };

  const methods = useForm<BadgeFormValues>({
    resolver: zodResolver(BadgeSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      const name = item.name;
      reset({
        name: {
          en: typeof name === 'object' ? (name as any).en ?? '' : String(name),
          ar: typeof name === 'object' ? (name as any).ar ?? '' : String(name),
        },
        color: item.color ?? '#000000',
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  const onSubmit = async (data: BadgeFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(t('form.badgeUpdatedSuccess'));
        navigate('/badges');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('form.badgeCreatedSuccess'));
        navigate('/badges');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.badgeEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.badgeCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/badges')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editBadge') : t('form.createBadge')}
        description={isEditMode ? t('form.editBadgeDesc') : t('form.createBadgeDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingBadge')}
        submitLabel={isEditMode ? t('form.updateBadgeSubmit') : t('form.createBadgeSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBadgeSubmit') : t('form.creatingBadgeSubmit')}
      >
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameEn')}
            </Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.badgeNameEnPlaceholder')} helperText={t('form.badgeNameEnHelper')} />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.nameAr')}
            </Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.badgeNameArPlaceholder')} helperText={t('form.badgeNameArHelper')} dir="rtl" />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:palette-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">{t('form.colorLabel')}</Typography>
          </Box>
          <RHFColorPicker name="color" helperText={t('form.colorHelper')} />
        </Box>
      </CreateFormLayout>
    </>
  );
}
