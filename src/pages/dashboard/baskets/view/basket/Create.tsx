import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import {
  BasketSchema,
  type BasketFormValues,
} from '@/pages/dashboard/baskets/validation/basket.validation';
import {
  useCreateBasket,
  useUpdateBasket,
  useFetchBasketById,
} from '@/pages/dashboard/baskets/hooks/basket';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

const metadata = { title: `Basket ${CONFIG.appName}` };

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: basketResponse, isLoading: isLoadingBasket } = useFetchBasketById(id || '');
  const createBasketMutation = useCreateBasket();
  const updateBasketMutation = useUpdateBasket();

  const defaultValues: BasketFormValues = {
    category_id: 0,
    name: { en: '', ar: '' },
    offer_ends_at: '',
    discount: 0,
    discount_type: 'percentage',
    delivery_price: 0,
    image: null,
    items: [{ shop_product_variant_id: 0, quantity: 1 }],
    badges: [],
  };

  const methods = useForm<BasketFormValues>({
    resolver: zodResolver(BasketSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    // In edit mode, always use API data (GET baskets/:id) - list/state has no items
    const source = isEditMode ? basketResponse?.data : null;
    if (source) {
      const name = typeof source.name === 'object' ? source.name : { en: String(source.name || ''), ar: String(source.name || '') };
      const discountNum = typeof source.discount === 'string' ? parseFloat(source.discount) : (source.discount ?? source.discount_value ?? 0);
      const offerDate = source.offer_ends_at ? (source.offer_ends_at.includes('-') ? source.offer_ends_at.split('T')[0] : source.offer_ends_at) : '';
      reset({
        category_id: source.category?.id || 0,
        name: { en: (name as any)?.en || '', ar: (name as any)?.ar || '' },
        offer_ends_at: offerDate,
        discount: Number.isNaN(discountNum) ? 0 : Number(discountNum),
        discount_type: source.discount_type || 'percentage',
        delivery_price: source.delivery_price ?? 0,
        image: null,
        items: source.items?.length
          ? source.items.map((it) => ({
              shop_product_variant_id: it.shop_product_variant_id,
              quantity: it.quantity,
            }))
          : [{ shop_product_variant_id: 0, quantity: 1 }],
        badges: source.badges?.length
          ? source.badges.map((b: any) => ({
              id: b.id,
              position: b.postion || b.position || 'top',
            }))
          : [],
      });
    }
  }, [basketResponse?.data, isEditMode, reset]);

  const isSubmitting = createBasketMutation.isPending || updateBasketMutation.isPending;
  const errorMessage = createBasketMutation.error?.message || updateBasketMutation.error?.message || null;

  const onSubmit = async (data: BasketFormValues) => {
    try {
      const payload = { ...data } as any;
      if (isEditMode && id) {
        await updateBasketMutation.mutateAsync({ id, data: payload });
        toast.success('Basket updated successfully');
      } else {
        await createBasketMutation.mutateAsync(payload);
        toast.success('Basket created successfully');
      }
      navigate('/baskets');
    } catch (error: any) {
      console.error('Error saving basket:', error);
    }
  };

  const handleCancel = () => navigate('/baskets');

  if (isEditMode && isLoadingBasket) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Basket | ${metadata.title}` : `Create Basket | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(
          onSubmit as any,
          (errors) => {
            console.log('[Basket form] Validation errors:', errors);
          }
        )}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Basket' : 'Create New Basket'}
        description={isEditMode ? 'Update basket details' : 'Add a new basket with products'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingBasket}
        loadingText={t('form.loadingBasket')}
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Basket' : 'Create Basket'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Category */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.categoryLabel')}</Typography>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <InfiniteScrollSelect
                value={field.value ?? 0}
                onChange={(val) => field.onChange(val)}
                queryKey={['category', 'basket']}
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
                placeholder={t('form.selectCategory')}
                initialLabel={(() => {
                  const src = basketResponse?.data;
                  const cat = src?.category;
                  return cat?.name ? (typeof cat.name === 'object' ? (cat.name as any)?.en || (cat.name as any)?.ar : cat.name) : undefined;
                })()}
              />
            )}
          />
        </Box>

        {/* Name EN */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameEn')}</Typography>
          <RHFTextField name="name.en" placeholder={t('form.basketNameEn')} fullWidth />
        </Box>

        {/* Name AR */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.nameAr')}</Typography>
          <RHFTextField name="name.ar" placeholder={t('form.basketNameAr')} dir="rtl" fullWidth />
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
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountValue')}</Typography>
            <RHFTextField name="discount" type="number" placeholder="0" fullWidth />
          </Box>
        </Box>

        {/* Offer ends at */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.offerEndsAt')}</Typography>
          <RHFTextField name="offer_ends_at" type="date" fullWidth />
        </Box>

        {/* Delivery Price */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.deliveryPrice')}</Typography>
          <RHFTextField name="delivery_price" type="number" placeholder="0" fullWidth />
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
            <Box key={field.id} className="mb-2 flex items-center gap-2">
              <Box className="flex-1">
                <Controller
                  name={`items.${index}.shop_product_variant_id`}
                  control={control}
                  render={({ field: f }) => (
                    <InfiniteScrollSelect
                      value={f.value || 0}
                      onChange={(variantId) => f.onChange(variantId)}
                      queryKey={['shopProductVariant', 'list']}
                      fetcher={(page) => _ShopProductVariantApi.getList({ page, per_page: 10 })}
                      placeholder={t('form.variantId')}
                    />
                  )}
                />
              </Box>
              <Box className="w-24">
                <RHFTextField name={`items.${index}.quantity`} placeholder={t('form.quantity')} type="number" fullWidth />
              </Box>
              {fields.length > 1 && (
                <Button type="button" variant="text" onClick={() => remove(index)} className="shrink-0 text-destructive">
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </Button>
              )}
            </Box>
          ))}
        </Box>

        {/* Badges */}
        <Box className="border-t border-border pt-6">
          <RHFBadgeSelector name="badges" />
        </Box>
      </CreateFormLayout>
    </>
  );
}
