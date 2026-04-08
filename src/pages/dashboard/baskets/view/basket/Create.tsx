import type { BasketItem } from '@/pages/dashboard/baskets/types/basket.types';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { formatTranslated } from '@/utils/format-translated';
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

/** Shown in variant dropdown before options load / when selected row is off the first page (edit basket). */
function basketLineVariantInitialLabel(row: BasketItem | undefined): string | undefined {
  if (!row) return undefined;
  const productName =
    row.product?.name != null
      ? typeof row.product.name === 'string'
        ? row.product.name
        : formatTranslated(row.product.name as Parameters<typeof formatTranslated>[0])
      : '';
  const variantStr = Array.isArray(row.variant)
    ? row.variant.map((v) => String(v)).filter(Boolean).join(' · ')
    : '';
  const shop = row.shop_variant?.shop_name?.trim();
  const parts = [productName, variantStr, shop].filter(Boolean);
  if (parts.length) return parts.join(' — ');
  const spvid = row.shop_product_variant_id;
  if (spvid != null && Number(spvid) > 0) return `#${spvid}`;
  return undefined;
}

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

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const categoryId = watch('category_id') ?? 0;
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
              shop_product_variant_id: Number(it.shop_product_variant_id) || 0,
              quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
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
        toast.success(t('form.basketUpdatedSuccess'));
      } else {
        await createBasketMutation.mutateAsync(payload);
        toast.success(t('form.basketCreatedSuccess'));
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
      <title>
        {isEditMode
          ? t('form.basketEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.basketCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

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
        title={isEditMode ? t('form.editBasketTitle') : t('form.createNewBasket')}
        description={isEditMode ? t('form.editBasketDesc') : t('form.createBasketDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingBasket}
        loadingText={t('form.loadingBasket')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.updateBasketSubmit') : t('form.createBasketSubmit')}
        submittingLabel={isEditMode ? t('form.updatingBasket') : t('form.creatingBasket')}
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
                onChange={(val) => {
                  field.onChange(val);
                  setValue('items', [{ shop_product_variant_id: 0, quantity: 1 }]);
                }}
                queryKey={['category', 'basket']}
                fetcher={(page) =>
                  _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                    data: {
                      items:
                        page === 1
                          ? [
                              { id: 0, label: t('form.selectCategoryPlaceholder') },
                              ...res.data.items.map((c: any) => ({
                                id: c.id,
                                label: formatTranslated(c.name as Parameters<typeof formatTranslated>[0]),
                              })),
                            ]
                          : res.data.items.map((c: any) => ({
                              id: c.id,
                              label: formatTranslated(c.name as Parameters<typeof formatTranslated>[0]),
                            })),
                      pagination: res.data.pagination,
                    },
                  }))
                }
                placeholder={t('form.selectCategory')}
                initialLabel={(() => {
                  const src = basketResponse?.data;
                  const cat = src?.category;
                  return cat?.name
                    ? formatTranslated(cat.name as Parameters<typeof formatTranslated>[0])
                    : undefined;
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
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
              {t('form.discountType')}
            </Typography>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="percentage">{t('form.discountTypePercentage')}</option>
                  <option value="fixed">{t('form.discountTypeFixed')}</option>
                </select>
              )}
            />
          </Box>
          <Box className="min-w-[140px] flex-1">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.discountValue')}</Typography>
            <RHFTextField name="discount" type="number" placeholder={t('form.placeholderZero')} fullWidth />
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
          <RHFTextField name="delivery_price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
        </Box>

        {/* Items */}
        <Box className="group">
          <Box className="mb-2 flex items-center justify-between">
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.basketItems')}
            </Typography>
            <Button
              type="button"
              variant="outlined"
              onClick={() => append({ shop_product_variant_id: 0, quantity: 1 })}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addBasketItem')}
            </Button>
          </Box>
          {fields.map((field, index) => (
            <Box key={field.id} className="mb-2 flex items-center gap-2">
              <Box className="flex-1">
                <Controller
                  name={`items.${index}.shop_product_variant_id`}
                  control={control}
                  render={({ field: f }) => {
                    const apiItems = basketResponse?.data?.items;
                    const lineFromApi = Array.isArray(apiItems) ? apiItems[index] : undefined;
                    const numericValue = Number(f.value) || 0;
                    return (
                      <InfiniteScrollSelect
                        value={numericValue}
                        onChange={(variantId) => f.onChange(Number(variantId) || 0)}
                        queryKey={['shopProductVariant', 'list', categoryId]}
                        fetcher={(page, limit) => {
                          const perPage = limit ?? 10;
                          if (!categoryId || categoryId <= 0) {
                            return Promise.resolve({
                              data: {
                                items:
                                  page === 1
                                    ? [{ id: 0, label: t('form.selectCategoryBeforeVariants') }]
                                    : [],
                                pagination: {
                                  current_page: page,
                                  last_page: page,
                                  per_page: perPage,
                                  total: 0,
                                },
                              },
                            });
                          }
                          return _ShopProductVariantApi.getList({
                            page,
                            per_page: perPage,
                            category_id: categoryId,
                          });
                        }}
                        placeholder={t('form.variantId')}
                        initialLabel={basketLineVariantInitialLabel(lineFromApi as BasketItem | undefined)}
                        disabled={categoryId <= 0}
                      />
                    );
                  }}
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
          <RHFBadgeSelector name="badges" label={t('form.badgesLabel')} />
        </Box>
      </CreateFormLayout>
    </>
  );
}
