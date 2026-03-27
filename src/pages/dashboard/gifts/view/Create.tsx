import type { Control } from 'react-hook-form';
import type { GiftData, GiftTranslation, GiftCreateUpdatePayload } from '@/pages/dashboard/gifts/types/gift.types';

import { toast } from 'react-toastify';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useLocation } from 'react-router';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { useCreateGift, useUpdateGift, useFetchGiftById } from '@/pages/dashboard/gifts/hooks/gift';
import {
  GiftSchema,
  type GiftFormMode,
  type GiftFormValues,
} from '@/pages/dashboard/gifts/validation/gift.validation';

import { CONFIG } from 'src/global-config';
import { Box, Tab, Tabs, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

/** Safely extract a translation value from a string or { ar, en } object */
const getTranslation = (val: GiftTranslation | string | undefined, lang: 'ar' | 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return lang === 'ar' ? val : '';
  return val[lang] || '';
};

function categoryInitialLabel(src: GiftData | undefined): string | undefined {
  if (!src) return undefined;
  const cat = (src as GiftData).category;
  if (!cat?.name) return undefined;
  return typeof cat.name === 'object'
    ? (cat.name as { en?: string; ar?: string })?.en || (cat.name as { en?: string; ar?: string })?.ar
    : String(cat.name);
}

type SharedFieldsProps = {
  t: (key: string, options?: Record<string, unknown>) => string;
  control: Control<GiftFormValues>;
  detailsResponse?: { data?: GiftData };
  fromState?: GiftData;
};

function GiftSharedFields({ t, control, detailsResponse, fromState }: SharedFieldsProps) {
  const src = detailsResponse?.data ?? fromState;

  return (
    <>
      <Box className="flex flex-wrap gap-4">
        <Box className="min-w-35 flex-1">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('columns.pointsRequired')}
          </Typography>
          <RHFTextField name="points_required" type="number" placeholder={t('form.placeholderThousand')} fullWidth />
        </Box>
        <Box className="min-w-35 flex-1">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('columns.stock')}
          </Typography>
          <RHFTextField name="stock_quantity" type="number" placeholder={t('form.placeholderFifty')} fullWidth />
        </Box>
      </Box>

      <Box className="group">
        <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
          {t('form.categoryLabel')} ({t('form.fieldOptional')})
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
                        ? [
                            { id: 0, label: t('form.noCategory') },
                            ...res.data.items.map((c: { id: number; name: unknown }) => ({
                              id: c.id,
                              label:
                                typeof c.name === 'object' && c.name !== null
                                  ? String((c.name as { en?: string; ar?: string }).en || (c.name as { ar?: string }).ar || '')
                                  : String(c.name || ''),
                            })),
                          ]
                        : res.data.items.map((c: { id: number; name: unknown }) => ({
                            id: c.id,
                            label:
                              typeof c.name === 'object' && c.name !== null
                                ? String((c.name as { en?: string; ar?: string }).en || (c.name as { ar?: string }).ar || '')
                                : String(c.name || ''),
                          })),
                    pagination: res.data.pagination,
                  },
                }))
              }
              placeholder={t('form.noCategory')}
              initialLabel={categoryInitialLabel(src)}
            />
          )}
        />
      </Box>

      <Box className="group">
        <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
          {t('form.giftTermsConditions')}
        </Typography>
        <div className="flex flex-col gap-2">
          <RHFTextField name="terms_conditions.ar" placeholder={t('form.giftTermsAr')} dir="rtl" fullWidth />
          <RHFTextField name="terms_conditions.en" placeholder={t('form.termsEnPlaceholder')} fullWidth />
        </div>
      </Box>
    </>
  );
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.gift as GiftData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchGiftById(id || '');
  const createMutation = useCreateGift();
  const updateMutation = useUpdateGift();

  const defaultValues: GiftFormValues = {
    giftMode: 'tikmool',
    name: { ar: '', en: '' },
    description: { ar: '', en: '' },
    image: null,
    points_required: 1,
    stock_quantity: 0,
    is_active: true,
    category_id: undefined,
    shop_product_variant_id: null,
    terms_conditions: { ar: '', en: '' },
  };

  const methods = useForm<GiftFormValues>({
    resolver: zodResolver(GiftSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const giftMode = watch('giftMode');

  const handleGiftModeChange = useCallback(
    (next: GiftFormMode) => {
      setValue('giftMode', next, { shouldValidate: true });
      if (next === 'external') {
        setValue('shop_product_variant_id', null);
      } else {
        setValue('name', { ar: '', en: '' });
        setValue('description', { ar: '', en: '' });
      }
    },
    [setValue]
  );

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      const variantId = (source as GiftData & { shop_product_variant_id?: number | null }).shop_product_variant_id;
      const mode: GiftFormMode =
        variantId != null && variantId > 0 ? 'tikmool' : 'external';
      reset({
        giftMode: mode,
        name: { ar: getTranslation(source.name, 'ar'), en: getTranslation(source.name, 'en') },
        description: {
          ar: getTranslation(source.description, 'ar'),
          en: getTranslation(source.description, 'en'),
        },
        image: null,
        points_required: source.points_required || 1,
        stock_quantity: source.stock_quantity || 0,
        is_active: source.is_active ?? true,
        category_id: source.category_id || (source as GiftData & { category?: { id: number } }).category?.id,
        shop_product_variant_id: variantId ?? null,
        terms_conditions: {
          ar: getTranslation(source.terms_conditions, 'ar'),
          en: getTranslation(source.terms_conditions, 'en'),
        },
      });
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const buildPayload = (data: GiftFormValues): GiftCreateUpdatePayload => {
    const { giftMode: mode, ...rest } = data;
    const base: GiftCreateUpdatePayload = {
      name: rest.name,
      description: rest.description,
      image: rest.image,
      points_required: rest.points_required,
      stock_quantity: rest.stock_quantity,
      is_active: rest.is_active,
      category_id: rest.category_id,
      terms_conditions: rest.terms_conditions,
      shop_product_variant_id: mode === 'tikmool' ? rest.shop_product_variant_id : null,
    };

    if (mode === 'tikmool') {
      base.name = {
        ar: rest.name.ar?.trim() || t('form.giftTikmoolDefaultNameAr'),
        en: rest.name.en?.trim() || t('form.giftTikmoolDefaultNameEn'),
      };
      const hasDesc = !!(rest.description?.ar?.trim() || rest.description?.en?.trim());
      base.description = hasDesc ? rest.description : undefined;
    }

    return base;
  };

  const onSubmit = async (data: GiftFormValues) => {
    try {
      const payload = buildPayload(data);
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.giftUpdatedToast'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.giftCreatedToast'));
      }
      navigate('/gifts');
    } catch (error: unknown) {
      console.error('Error saving gift:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  const variantFetcher = (page: number, limit: number) =>
    _ShopProductVariantApi.getList({ page, per_page: limit }).then((res) => ({
      data: {
        items: res.data.items ?? [],
        pagination: res.data.pagination,
      },
    }));

  const variantInitialLabel = (() => {
    const src = detailsResponse?.data ?? fromState;
    const vid = (src as GiftData & { shop_product_variant_id?: number })?.shop_product_variant_id;
    return vid ? t('form.giftVariantInitialLabel', { id: vid }) : undefined;
  })();

  return (
    <>
      <title>
        {isEditMode
          ? t('form.giftEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.giftCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>
      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/gifts')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.giftEditTitle') : t('form.giftCreateTitle')}
        description={isEditMode ? t('form.giftEditDesc') : t('form.giftCreateDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingGift')}
        maxWidth="2xl"
        submitLabel={isEditMode ? t('form.giftSubmitUpdate') : t('form.giftSubmitCreate')}
        submittingLabel={isEditMode ? t('form.giftSubmitUpdating') : t('form.giftSubmitCreating')}
      >
        <Box className="w-full">
          <Tabs value={giftMode} onChange={(v) => handleGiftModeChange(v as GiftFormMode)} className="w-full">
            <Tab value="tikmool" label={t('form.giftTabTikmool')} />
            <Tab value="external" label={t('form.giftTabExternal')} />
          </Tabs>
        </Box>

        {giftMode === 'tikmool' && (
          <Box className="flex flex-col gap-6">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.giftShopProductVariant')}
              </Typography>
              <RHFInfiniteSelect
                name="shop_product_variant_id"
                queryKey={['shopProductVariant', 'gift', 'tikmool']}
                fetcher={variantFetcher}
                placeholder={t('form.selectProductVariant')}
                initialLabel={variantInitialLabel}
                pageSize={15}
              />
            </Box>
            <GiftSharedFields
              t={t}
              control={control}
              detailsResponse={detailsResponse}
              fromState={fromState}
            />
          </Box>
        )}

        {giftMode === 'external' && (
          <Box className="flex flex-col gap-6">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('columns.name')}
              </Typography>
              <div className="flex flex-col gap-2">
                <RHFTextField name="name.ar" placeholder={t('form.descriptionArPlaceholder')} dir="rtl" fullWidth />
                <RHFTextField name="name.en" placeholder={t('form.namePlaceholder')} fullWidth />
              </div>
            </Box>

            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('columns.description')}
              </Typography>
              <div className="flex flex-col gap-2">
                <RHFTextField
                  name="description.ar"
                  placeholder={t('form.descriptionArPlaceholder')}
                  dir="rtl"
                  fullWidth
                />
                <RHFTextField name="description.en" placeholder={t('form.descriptionEnPlaceholder')} fullWidth />
              </div>
            </Box>

            <GiftSharedFields
              t={t}
              control={control}
              detailsResponse={detailsResponse}
              fromState={fromState}
            />
          </Box>
        )}

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
                <Typography variant="body2">{t('columns.active')}</Typography>
              </div>
            )}
          />
        </Box>
      </CreateFormLayout>
    </>
  );
}
