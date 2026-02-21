import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  BannerUpdateSchema,
  type BannerUpdateFormValues,
} from '@/pages/dashboard/banners/validation/banner.validation';
import type { BannerItem } from '@/pages/dashboard/banners/types/banner.types';
import {
  useCreateBanner,
  useUpdateBanner,
} from '@/pages/dashboard/banners/hooks/banner';

import { Box, Input, Typography } from 'src/shared/ui';
import { CONFIG } from 'src/global-config';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Banner ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bannerFromState = location.state?.banner as BannerItem | undefined;
  const isEditMode = !!id;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();

  const defaultValues: BannerUpdateFormValues = {
    title: { en: '', ar: '' },
    description: '',
    image: null,
    link: '',
  };

  const methods = useForm<BannerUpdateFormValues>({
    resolver: zodResolver(BannerUpdateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const imageFile = watch('image');

  // Load banner data from state when in edit mode
  useEffect(() => {
    if (isEditMode && bannerFromState) {
      setPreviewImage(bannerFromState.image_url || null);
      const desc = bannerFromState.description;
      const descriptionStr =
        typeof desc === 'object' && desc !== null && 'en' in desc ? desc.en ?? '' : (desc ?? '');
      reset({
        title: {
          en: bannerFromState.title || '',
          ar: bannerFromState.title || '',
        },
        description: descriptionStr,
        image: null,
        link: bannerFromState.link ?? '',
      });
    }
  }, [bannerFromState, isEditMode, reset]);

  // Redirect if edit mode without banner data (e.g. direct URL access)
  useEffect(() => {
    if (isEditMode && id && !bannerFromState) {
      toast.error('Please edit the banner from the list page');
      navigate('/sections/banners');
    }
  }, [isEditMode, id, bannerFromState, navigate]);

  // Update preview when image file changes
  useEffect(() => {
    if (imageFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else if (!imageFile && !isEditMode) {
      setPreviewImage(null);
    } else if (isEditMode && !imageFile && bannerFromState?.image_url) {
      setPreviewImage(bannerFromState.image_url);
    }
  }, [imageFile, isEditMode, bannerFromState?.image_url]);

  const isSubmitting = createBannerMutation.isPending || updateBannerMutation.isPending;
  const errorMessage =
    createBannerMutation.error?.message || updateBannerMutation.error?.message || null;

  const onSubmit = async (data: BannerUpdateFormValues) => {
    try {
      const payload = {
        title: { en: data.title.en, ar: data.title.ar },
        description: data.description,
        image: data.image instanceof File ? data.image : null,
        link: data.link,
      };

      if (isEditMode && id) {
        await updateBannerMutation.mutateAsync({ id, data: payload });
        toast.success('Banner updated successfully');
        navigate('/sections/banners');
      } else {
        if (!(payload.image instanceof File)) {
          toast.error('Image is required for new banners');
          return;
        }
        await createBannerMutation.mutateAsync(payload);
        toast.success('Banner created successfully');
        navigate('/sections/banners');
      }
    } catch (error: any) {
      console.error('Error saving banner:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections/banners');
  };

  const infoText = isEditMode
    ? 'You can update any field. Leave image unchanged or upload a new one.'
    : 'Fill in the banner title, description, upload an image and optionally add a link.';

  if (isEditMode && !bannerFromState) {
    return null;
  }

  return (
    <>
      <title>
        {isEditMode ? `Edit Banner | ${metadata.title}` : `Create Banner | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Banner' : 'Create New Banner'}
        description={
          isEditMode ? 'Update banner information and image' : 'Add a new banner to your system'
        }
        isEditMode={isEditMode}
        isLoading={false}
        loadingText="Loading banner data..."
        maxWidth="3xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Banner' : 'Create Banner'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* English Title */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              English Title
            </Typography>
          </Box>
          <RHFTextField
            name="title.en"
            placeholder="e.g., New Arrivals"
            helperText="Enter the banner title in English"
            className="transition-all duration-200"
          />
        </Box>

        {/* Arabic Title */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Arabic Title
            </Typography>
          </Box>
          <RHFTextField
            name="title.ar"
            placeholder="e.g., وصل حديثًا"
            helperText="Enter the banner title in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Description */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Description
            </Typography>
          </Box>
          <RHFTextField
            name="description"
            placeholder="Optional description"
            helperText="Enter a description for the banner"
            className="transition-all duration-200"
          />
        </Box>

        {/* Image Upload */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Banner Image {!isEditMode && '(Required)'}
            </Typography>
          </Box>
          <Controller
            name="image"
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
                  helperText={error?.message || (isEditMode ? 'Leave empty to keep current image' : 'Upload a banner image')}
                  fullWidth
                  className="transition-all duration-200"
                />
                {previewImage && (
                  <Box className="mt-4">
                    <img
                      src={previewImage}
                      alt="Banner preview"
                      className="w-full max-w-md h-32 object-cover rounded-lg border border-border/60"
                    />
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        {/* Link */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:link-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Link
            </Typography>
          </Box>
          <RHFTextField
            name="link"
            placeholder="https://example.com"
            helperText="Optional URL when the banner is clicked"
            className="transition-all duration-200"
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
