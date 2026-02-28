import type { ScheduledBasketData } from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import {
  ScheduledBasketSchema,
  type ScheduledBasketFormValues,
} from '@/pages/dashboard/baskets/validation/scheduled-basket.validation';
import {
  useCreateScheduledBasket,
  useUpdateScheduledBasket,
  useFetchScheduledBasketById,
} from '@/pages/dashboard/baskets/hooks/scheduled-basket';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Scheduled Basket ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const scheduledBasketFromState = location.state?.scheduledBasket as ScheduledBasketData | undefined;
  const isEditMode = !!id;

  const { data: scheduledBasketResponse, isLoading: isLoadingScheduledBasket } = useFetchScheduledBasketById(id || '');
  const createScheduledBasketMutation = useCreateScheduledBasket();
  const updateScheduledBasketMutation = useUpdateScheduledBasket();

  const defaultValues: ScheduledBasketFormValues = {
    category_id: 0,
    name: { en: '', ar: '' },
    offer_ends_at: '',
    discount: 0,
    discount_type: 'percentage',
    delivery_price: 0,
    image: null,
    items: [{ shop_product_variant_id: 0, quantity: 1 }],
    scheduled_at: '',
    scheduled_end_at: '',
    is_recurring: false,
    recurrence_type: undefined,
    is_active: true,
  };

  const methods = useForm<ScheduledBasketFormValues>({
    resolver: zodResolver(ScheduledBasketSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    const source = isEditMode ? (scheduledBasketResponse?.data ?? scheduledBasketFromState) : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      reset({
        category_id: source.category?.id || 0,
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        offer_ends_at: source.offer_ends_at || '',
        discount: source.discount || 0,
        discount_type: source.discount_type || 'percentage',
        delivery_price: source.delivery_price || 0,
        image: null,
        items: source.items?.length
          ? source.items.map((it) => ({
              shop_product_variant_id: it.shop_product_variant_id,
              quantity: it.quantity,
            }))
          : [{ shop_product_variant_id: 0, quantity: 1 }],
        scheduled_at: source.scheduled_at || '',
        scheduled_end_at: source.scheduled_end_at || '',
        is_recurring: source.is_recurring ?? false,
        recurrence_type: source.recurrence_type || undefined,
        is_active: source.is_active ?? true,
      });
    }
  }, [scheduledBasketResponse?.data, scheduledBasketFromState, isEditMode, reset]);

  const isSubmitting = createScheduledBasketMutation.isPending || updateScheduledBasketMutation.isPending;
  const errorMessage = createScheduledBasketMutation.error?.message || updateScheduledBasketMutation.error?.message || null;

  const onSubmit = async (data: ScheduledBasketFormValues) => {
    try {
      const payload = { ...data } as any;
      if (isEditMode && id) {
        await updateScheduledBasketMutation.mutateAsync({ id, data: payload });
        toast.success('Scheduled basket updated successfully');
      } else {
        await createScheduledBasketMutation.mutateAsync(payload);
        toast.success('Scheduled basket created successfully');
      }
      navigate('/scheduled-baskets');
    } catch (error: any) {
      console.error('Error saving scheduled basket:', error);
    }
  };

  const handleCancel = () => navigate('/scheduled-baskets');

  if (isEditMode && isLoadingScheduledBasket && !scheduledBasketFromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Scheduled Basket | ${metadata.title}` : `Create Scheduled Basket | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Scheduled Basket' : 'Create New Scheduled Basket'}
        description={isEditMode ? 'Update scheduled basket details' : 'Add a new scheduled basket with products'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingScheduledBasket}
        loadingText="Loading scheduled basket..."
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Scheduled Basket' : 'Create Scheduled Basket'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Category */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Category</Typography>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <InfiniteScrollSelect
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val)}
                queryKey={['category', 'scheduled-basket']}
                fetcher={(page) =>
                  _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                    data: {
                      items:
                        page === 1
                          ? [{ id: 0, label: 'Select category...' }, ...res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' }))]
                          : res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' })),
                      pagination: res.data.pagination,
                    },
                  }))
                }
                placeholder="Select category..."
                initialLabel={(() => {
                  const src = scheduledBasketResponse?.data ?? scheduledBasketFromState;
                  const cat = src?.category;
                  return cat?.name ? (typeof cat.name === 'object' ? (cat.name as any)?.en || (cat.name as any)?.ar : cat.name) : undefined;
                })()}
              />
            )}
          />
        </Box>

        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (English)</Typography>
          <RHFTextField name="name.en" placeholder="Basket name in English" fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Name (Arabic)</Typography>
          <RHFTextField name="name.ar" placeholder="اسم السلة بالعربي" dir="rtl" fullWidth />
        </Box>

        {/* Discount */}
        <Box className="flex flex-wrap gap-4">
          <Box className="min-w-[140px] flex-1">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Discount Type</Typography>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              )}
            />
          </Box>
          <Box className="min-w-[140px] flex-1">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Discount Value</Typography>
            <RHFTextField name="discount" type="number" placeholder="0" fullWidth />
          </Box>
        </Box>

        {/* Offer ends at */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Offer Ends At</Typography>
          <RHFTextField name="offer_ends_at" type="date" fullWidth />
        </Box>

        {/* Delivery Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Delivery Price</Typography>
          <RHFTextField name="delivery_price" type="number" placeholder="0" fullWidth />
        </Box>

        {/* Scheduled At */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Scheduled At</Typography>
          <RHFTextField name="scheduled_at" type="datetime-local" fullWidth />
        </Box>

        {/* Scheduled End At */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Scheduled End At</Typography>
          <RHFTextField name="scheduled_end_at" type="datetime-local" fullWidth />
        </Box>

        {/* Is Recurring */}
        <Box className="group">
          <Controller
            name="is_recurring"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                />
                <Typography variant="body2">Recurring</Typography>
              </div>
            )}
          />
        </Box>

        {/* Recurrence Type */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Recurrence Type</Typography>
          <Controller
            name="recurrence_type"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select recurrence type...</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          />
        </Box>

        {/* Is Active */}
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

        {/* Items */}
        <Box className="group">
          <Box className="mb-2 flex items-center justify-between">
            <Typography variant="subtitle2" className="font-semibold text-foreground">Basket Items</Typography>
            <Button
              type="button"
              variant="outlined"
              onClick={() => append({ shop_product_variant_id: 0, quantity: 1 })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Add Item
            </Button>
          </Box>
          {fields.map((field, index) => (
            <Box key={field.id} className="mb-2 flex items-end gap-2">
              <Box className="flex-1">
                <RHFTextField
                  name={`items.${index}.shop_product_variant_id`}
                  placeholder="Variant ID"
                  type="number"
                  fullWidth
                />
              </Box>
              <Box className="w-24">
                <RHFTextField name={`items.${index}.quantity`} placeholder="Qty" type="number" fullWidth />
              </Box>
              {fields.length > 1 && (
                <Button type="button" variant="text" onClick={() => remove(index)} className="text-destructive">
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </CreateFormLayout>
    </>
  );
}
