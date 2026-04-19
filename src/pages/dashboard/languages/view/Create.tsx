import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  LanguageSchema,
  type LanguageSchemaType,
} from '@/pages/dashboard/languages/validation/language.validation';
import {
  useCreateLanguage,
  useUpdateLanguage,
  useFetchLanguageById,
} from '@/pages/dashboard/languages/hooks/language';

import { Box, Input, Checkbox, Typography } from 'src/shared/ui';
import { CONFIG, CONFIG as GLOBAL_CONFIG } from 'src/global-config';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: languageData, isLoading: isLoadingLanguage } = useFetchLanguageById(id || '');
  const createLanguageMutation = useCreateLanguage();
  const updateLanguageMutation = useUpdateLanguage();

  const defaultValues: LanguageSchemaType = {
    code: '',
    native_name: '',
    direction: 'ltr',
    is_active: true,
    is_default: false,
    flag_icon: null,
  };

  const methods = useForm<LanguageSchemaType>({
    resolver: zodResolver(LanguageSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const flagIconFile = watch('flag_icon');

  useEffect(() => {
    if (isEditMode && languageData && !isLoadingLanguage) {
      const imageUrl = languageData.flag_icon ? `${GLOBAL_CONFIG.serverUrl}/${languageData.flag_icon}` : null;
      setPreviewImage(imageUrl);
      reset({
        code: languageData.code,
        native_name: languageData.native_name,
        direction: languageData.direction,
        is_active: languageData.is_active,
        is_default: languageData.is_default,
        flag_icon: null,
      });
    }
  }, [languageData, isEditMode, isLoadingLanguage, reset]);

  useEffect(() => {
    if (flagIconFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(flagIconFile);
    } else if (!flagIconFile && !isEditMode) {
      setPreviewImage(null);
    }
  }, [flagIconFile, isEditMode]);

  const isSubmitting = createLanguageMutation.isPending || updateLanguageMutation.isPending;
  const errorMessage =
    createLanguageMutation.error?.message || updateLanguageMutation.error?.message || null;

  const onSubmit = async (data: LanguageSchemaType) => {
    try {
      const payload = {
        code: data.code,
        native_name: data.native_name,
        direction: data.direction,
        is_active: data.is_active,
        is_default: data.is_default,
        flag_icon: data.flag_icon instanceof File ? data.flag_icon : undefined,
      };

      if (isEditMode && id) {
        await updateLanguageMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.languageUpdatedSuccess'));
        navigate('/languages');
      } else {
        await createLanguageMutation.mutateAsync(payload);
        toast.success(t('form.languageCreatedSuccess'));
        navigate('/languages');
      }
    } catch (error: any) {
      console.error('Error saving language:', error);
    }
  };

  const handleCancel = () => {
    navigate('/languages');
  };

  const infoText = isEditMode
    ? t('form.languageFormInfoEdit')
    : t('form.languageFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.languageEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.languageCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.languageFormTitleEdit') : t('form.languageFormTitleCreate')}
        description={
          isEditMode
            ? t('form.languageFormDescEdit')
            : t('form.languageFormDescCreate')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingLanguage}
        loadingText={t('form.loadingLanguage')}
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.languageSubmitUpdate') : t('form.languageSubmitCreate')}
        submittingLabel={isEditMode ? t('form.languageSubmittingUpdate') : t('form.languageSubmittingCreate')}
      >
        {/* Language Code */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:code-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.code')}
            </Typography>
          </Box>
          <RHFTextField
            name="code"
            placeholder={t('form.codePlaceholder')}
            helperText={t('form.languageCodeHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Native Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:text-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.nativeName')}
            </Typography>
          </Box>
          <RHFTextField
            name="native_name"
            placeholder={t('form.nativeNamePlaceholder')}
            helperText={t('form.languageNativeNameHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Direction */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:sort-horizontal-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.directionLabel')}
            </Typography>
          </Box>
          <RHFSelect
            name="direction"
            options={[
              { value: 'ltr', label: t('form.ltr') },
              { value: 'rtl', label: t('form.rtl') },
            ]}
            helperText={t('form.languageDirectionHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Flag Icon */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:flag-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.flag')}
            </Typography>
          </Box>
          <Controller
            name="flag_icon"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file || null);
                  }}
                  error={!!error}
                  helperText={error?.message || t('flagUploadHelper')}
                  fullWidth
                  className="transition-all duration-200"
                />
                {previewImage && (
                  <Box className="mt-4">
                    <img
                      src={previewImage}
                      alt={t('form.languageFlagPreviewAlt')}
                      className="w-24 h-24 object-cover rounded-lg border border-border/60"
                    />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        {/* Active Status */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:check-circle-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.languageSectionActiveStatus')}
            </Typography>
          </Box>
          <Controller
            name="is_active"
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label={t('form.markLanguageActive')}
              />
            )}
          />
        </Box>

        {/* Default Language */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:star-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.languageSectionDefaultLanguage')}
            </Typography>
          </Box>
          <Controller
            name="is_default"
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label={t('form.setAsDefaultLanguage')}
              />
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
