import type { GiftData, GiftTranslation } from '@/pages/dashboard/gifts/types/gift.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { useCreateGift, useUpdateGift, useFetchGiftById } from '@/pages/dashboard/gifts/hooks/gift';
import { GiftSchema, type GiftFormValues } from '@/pages/dashboard/gifts/validation/gift.validation';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Gift ${CONFIG.appName}` };

/** Safely extract a translation value from a string or { ar, en } object */
const t = (val: GiftTranslation | string | undefined, lang: 'ar' | 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return lang === 'ar' ? val : '';
  return val[lang] || '';
};

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.gift as GiftData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchGiftById(id || '');
  const createMutation = useCreateGift();
  const updateMutation = useUpdateGift();

  const defaultValues: GiftFormValues = {
    name: { ar: '', en: '' },
    description: { ar: '', en: '' },
    image: null,
    points_required: 1,
    stock_quantity: 0,
    is_active: true,
    category_id: undefined,
    terms_conditions: { ar: '', en: '' },
  };

  const methods = useForm<GiftFormValues>({
    resolver: zodResolver(GiftSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      reset({
        name: { ar: t(source.name, 'ar'), en: t(source.name, 'en') },
        description: { ar: t(source.description, 'ar'), en: t(source.description, 'en') },
        image: null,
        points_required: source.points_required || 1,
        stock_quantity: source.stock_quantity || 0,
        is_active: source.is_active ?? true,
        category_id: source.category_id || (source as any).category?.id,
        terms_conditions: {
          ar: t(source.terms_conditions, 'ar'),
          en: t(source.terms_conditions, 'en'),
        },
      });
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: GiftFormValues) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success('Gift updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Gift created successfully');
      }
      navigate('/gifts');
    } catch (error: any) {
      console.error('Error saving gift:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Gift | ${metadata.title}` : `Create Gift | ${metadata.title}`}</title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/gifts')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Gift' : 'Create New Gift'}
        description={isEditMode ? 'Update gift details' : 'Add a new gift'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText="Loading gift..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Gift' : 'Create Gift'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Name
          </Typography>
          <div className="flex flex-col gap-2">
            <RHFTextField name="name.ar" placeholder="الاسم بالعربي" dir="rtl" fullWidth />
            <RHFTextField name="name.en" placeholder="Name in English" fullWidth />
          </div>
        </Box>

        {/* Description */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Description
          </Typography>
          <div className="flex flex-col gap-2">
            <RHFTextField name="description.ar" placeholder="الوصف بالعربي" dir="rtl" fullWidth />
            <RHFTextField name="description.en" placeholder="Description in English" fullWidth />
          </div>
        </Box>

        {/* Points & Stock */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-35">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Points Required
            </Typography>
            <RHFTextField name="points_required" type="number" placeholder="1000" fullWidth />
          </Box>
          <Box className="flex-1 min-w-35">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              Stock Quantity
            </Typography>
            <RHFTextField name="stock_quantity" type="number" placeholder="50" fullWidth />
          </Box>
        </Box>

        {/* Category */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Category (optional)
          </Typography>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <InfiniteScrollSelect
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val === 0 ? undefined : val)}
                queryKey={['category', 'gift']}
                fetcher={(page) =>
                  _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                    data: {
                      items:
                        page === 1
                          ? [{ id: 0, label: 'No category' }, ...res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' }))]
                          : res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' })),
                      pagination: res.data.pagination,
                    },
                  }))
                }
                placeholder="No category"
                initialLabel={(() => {
                  const src = detailsResponse?.data ?? fromState;
                  const cat = (src as any)?.category;
                  return cat?.name ? (typeof cat.name === 'object' ? (cat.name as any)?.en || (cat.name as any)?.ar : cat.name) : undefined;
                })()}
              />
            )}
          />
        </Box>

        {/* Terms & Conditions */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Terms & Conditions
          </Typography>
          <div className="flex flex-col gap-2">
            <RHFTextField
              name="terms_conditions.ar"
              placeholder="الشروط والأحكام بالعربي"
              dir="rtl"
              fullWidth
            />
            <RHFTextField
              name="terms_conditions.en"
              placeholder="Terms and conditions in English"
              fullWidth
            />
          </div>
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
                <Typography variant="body2">Active</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
