import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import {
  useCreateIcon,
  useUpdateIcon,
  useFetchIconById,
} from '@/pages/dashboard/icons/hooks/icon';
import {
  IconCreateSchema,
  type IconFormValues,
} from '@/pages/dashboard/icons/validation/icon.validation';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

const metadata = { title: `Icon | ${CONFIG.appName}` };

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchIconById(id || '');
  const createMutation = useCreateIcon();
  const updateMutation = useUpdateIcon();

  const defaultValues: IconFormValues = {
    name: { en: '', ar: '' },
    image: null,
    description: { en: '', ar: '' },
    is_active: true,
  };

  const methods = useForm<IconFormValues>({
    resolver: zodResolver(IconCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const imageFile = watch('image');

  useEffect(() => {
    if (isEditMode && detailsResponse?.data) {
      const item = detailsResponse.data;
      setPreviewImage(item.image || null);
      const name = item.name;
      const desc = item.description;
      reset({
        name: {
          en: typeof name === 'object' ? (name as any).en ?? '' : String(name ?? ''),
          ar: typeof name === 'object' ? (name as any).ar ?? '' : String(name ?? ''),
        },
        image: null,
        description: {
          en: typeof desc === 'object' ? (desc as any)?.en ?? '' : String(desc ?? ''),
          ar: typeof desc === 'object' ? (desc as any)?.ar ?? '' : String(desc ?? ''),
        },
        is_active: item.is_active ?? true,
      });
    }
  }, [detailsResponse?.data, isEditMode, reset]);

  useEffect(() => {
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onSubmit = async (data: IconFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: data as any });
        toast.success(t('form.iconUpdatedSuccess'));
        navigate('/icons');
      } else {
        if (!(data.image instanceof File)) {
          toast.error(t('form.imageRequired'));
          return;
        }
        await createMutation.mutateAsync(data as any);
        toast.success(t('form.iconCreatedSuccess'));
        navigate('/icons');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isEditMode && isLoadingDetails) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Icon | ${metadata.title}` : `Create Icon | ${metadata.title}`}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/icons')}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={isEditMode ? t('form.editIcon') : t('form.createIcon')}
        description={isEditMode ? t('form.editIconDesc') : t('form.createIconDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingIcon')}
        submitLabel={isEditMode ? t('updating') : t('form.createIcon')}
        submittingLabel={isEditMode ? t('updating') : t('create')}
      >
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.nameEn')}</Typography>
          </Box>
          <RHFTextField name="name.en" placeholder={t('form.iconNameEnPlaceholder')} helperText={t('form.iconNameEnHelper')} />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.nameAr')}</Typography>
          </Box>
          <RHFTextField name="name.ar" placeholder={t('form.iconNameArPlaceholder')} helperText={t('form.iconNameArHelper')} dir="rtl" />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">
              {isEditMode ? t('form.imageLabel') : t('form.imageLabelRequired')}
            </Typography>
          </Box>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  value={undefined}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    onChange(file || null);
                  }}
                  error={!!error}
                  helperText={error?.message || (isEditMode ? t('form.imageHelperEdit') : t('form.imageHelper'))}
                  fullWidth
                />
                {previewImage && (
                  <Box className="mt-3">
                    <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.descriptionEn')} (optional)</Typography>
          </Box>
          <RHFTextField name="description.en" placeholder="Description in English" />
        </Box>

        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} />
            <Typography variant="subtitle2" className="font-semibold">{t('form.descriptionAr')} (optional)</Typography>
          </Box>
          <RHFTextField name="description.ar" placeholder="الوصف بالعربية" dir="rtl" />
        </Box>
      </CreateFormLayout>
    </>
  );
}
