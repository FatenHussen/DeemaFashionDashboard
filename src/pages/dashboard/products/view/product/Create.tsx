import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRoutes, axiosInstance } from '@/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { compressImages } from '@/utils/compress-image';
import { useId, useRef, useState, useEffect } from 'react';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RichTextEditor } from '@/shared/components/rich-text-editor/rich-text-editor';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import {
  ProductSchema,
  type ProductFormValues,
} from '@/pages/dashboard/products/validation/product.validation';
import {
  useCreateProduct,
  useUpdateProduct,
  useFetchProductById,
} from '@/pages/dashboard/products/hooks/product';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { Box, Button, Typography } from 'src/shared/ui';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const metadata = { title: `Product ${CONFIG.appName}` };

const categoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((cat) => ({ id: cat.id, label: cat.name })),
      pagination: r.data.pagination,
    },
  }));

const brandFetcher = (page: number, limit: number) =>
  _BrandApi.getListBrands({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((b) => ({ id: b.id, label: b.name })),
      pagination: r.data.pagination,
    },
  }));

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

/** API returns `attribute` in one locale (often AR); category `name` may be {en, ar} — match any. */
function categoryAttrLabelMatches(attr: any, apiAttributeLabel: string): boolean {
  const api = String(apiAttributeLabel ?? '').trim();
  if (!api) return false;
  if (typeof attr?.name === 'object' && attr.name) {
    const en = String(attr.name.en ?? '').trim();
    const ar = String(attr.name.ar ?? '').trim();
    if (api === en || api === ar) return true;
  }
  return api === String(attr?.name ?? '').trim();
}

function normalizeHexForCompare(s: string) {
  const t = String(s).trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(t) ? t.toLowerCase() : t;
}

/** Resolve category attribute value id from API string (value or hex color, any locale). */
function findAttributeValueId(attr: any, rawVal: string): number | undefined {
  const vals = attr?.values ?? [];
  const target = String(rawVal ?? '').trim();
  const targetNorm = normalizeHexForCompare(target);
  const targetIsHex = /^#[0-9a-fA-F]{3,8}$/.test(target);

  for (const x of vals) {
    const candidates: string[] = [];
    if (typeof x?.value === 'string') candidates.push(x.value);
    else if (x?.value && typeof x.value === 'object') {
      if (x.value.en != null) candidates.push(String(x.value.en));
      if (x.value.ar != null) candidates.push(String(x.value.ar));
    }
    if (typeof x?.name === 'string') candidates.push(x.name);
    else if (x?.name && typeof x.name === 'object') {
      if (x.name.en != null) candidates.push(String(x.name.en));
      if (x.name.ar != null) candidates.push(String(x.name.ar));
    }
    for (const c of candidates) {
      const cTrim = String(c).trim();
      if (targetIsHex && /^#[0-9a-fA-F]{3,8}$/.test(cTrim)) {
        if (normalizeHexForCompare(cTrim) === targetNorm && x.id != null) return Number(x.id);
      } else if (cTrim.toLowerCase() === target.toLowerCase() && x.id != null) {
        return Number(x.id);
      }
    }
  }
  return undefined;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const productImagesInputId = useId();

  // Fetch dependencies
  const { data: shopsResponse } = useFetchShops(1, 100);
  const { data: productResponse, isLoading: isLoadingProduct } = useFetchProductById(id || '');

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const shops = (shopsResponse as any)?.data?.items ?? [];

  const defaultValues: ProductFormValues = {
    category_id: 0,
    brand_id: 0,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    full_description: { en: '', ar: '' },
    country: { en: '', ar: '' },
    price: 0,
    price_after_discount: undefined,
    quantity: 0,
    sku: '',
    model: '',
    barcode: '',
    time_prepare: '',
    is_instant_delivery: 0,
    images: [],
    existing_media_ids: [],
    badges: [],
    variants: [],
    category_details: [],
    extra_details: [],
    bought_with: [],
    shop_variants: [],
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue, getValues } = methods;
  const categoryId = watch('category_id');
  const imagesFiles = watch('images');
  const existingMediaIds = watch('existing_media_ids') ?? [];
  const watchedVariants = watch('variants') || [];
  const watchedBoughtWith = watch('bought_with') || [];

  // Fetch category attributes when category changes
  const { data: categoryAttributesAll, isLoading: isLoadingAttributes } =
    useFetchCategoryAttributes(categoryId ? Number(categoryId) : undefined, 1, 100);
  const categoryAttributes =
    (categoryAttributesAll?.data as { items?: unknown[]; data?: unknown[] } | undefined)?.items ??
    (categoryAttributesAll?.data as { data?: unknown[] } | undefined)?.data ??
    [];

  // Fetch category details filtered by category_id
  const { data: categoryDetailsResponse } = useQuery({
    queryKey: ['categorydetail', 'by-category', categoryId],
    queryFn: () =>
      axiosInstance
        .get(apiRoutes.categoryDetail.list, { params: { category_id: categoryId, per_page: 100 } })
        .then((r) => r.data),
    enabled: !!categoryId && categoryId > 0,
  });
  const availableCategoryDetails: any[] =
    categoryDetailsResponse?.data?.data ??
    categoryDetailsResponse?.data?.items ??
    [];

  // Fetch all products for bought_with selector
  const { data: allProductsResponse } = useQuery({
    queryKey: ['product', 'list-for-select'],
    queryFn: () =>
      axiosInstance
        .get(apiRoutes.product.list, { params: { per_page: 200 } })
        .then((r) => r.data),
  });
  const allProducts: any[] =
    allProductsResponse?.data?.data ?? allProductsResponse?.data?.items ?? [];

  // Field Arrays
  const { fields: variantsFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });
  const { fields: extraDetailsFields, append: appendExtraDetail, remove: removeExtraDetail } =
    useFieldArray({ control, name: 'extra_details' });
  const { fields: categoryDetailsFields, append: appendCategoryDetail, remove: removeCategoryDetail } =
    useFieldArray({ control, name: 'category_details' });
  const { fields: shopVariantsFields, append: appendShopVariant, remove: removeShopVariant } =
    useFieldArray({ control, name: 'shop_variants' });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && productResponse && !isLoadingProduct) {
      const p = productResponse;
      reset({
        category_id: Number(p.category?.id) || 0,
        brand_id: Number(p.brand?.id) || 0,
        name: { en: p.name?.en ?? '', ar: p.name?.ar ?? '' },
        description: { en: p.description?.en ?? '', ar: p.description?.ar ?? '' },
        full_description: { en: p.full_description?.en ?? '', ar: p.full_description?.ar ?? '' },
        country: { en: p.country?.en ?? '', ar: p.country?.ar ?? '' },
        price: Number(p.price) || 0,
        price_after_discount: p.price_after_discount != null ? Number(p.price_after_discount) : undefined,
        quantity: Number(p.quantity) || 0,
        sku: p.sku ?? '',
        model: p.model ?? '',
        barcode: p.barcode ?? '',
        time_prepare: p.time_prepare ?? '',
        is_instant_delivery: p.is_instant_delivery ? 1 : 0,
        images: [],
        existing_media_ids:
          p.images?.map((img: any) => Number(img.id)).filter((mediaId) => !Number.isNaN(mediaId)) ?? [],
        variants:
          p.variants?.map((v) => ({
            id: v.id,
            attributes_values_ids: [],
            images: [],
            existing_images_ids:
              (v.images ?? []).map((img: any) => Number(img.id)).filter((mediaId) => !Number.isNaN(mediaId)) ?? [],
          })) ?? [],
        category_details:
          p.category_details?.map((cd) => ({
            id: cd.id,
            category_detail_id: 0,
            detail_value: { en: cd.value?.en ?? '', ar: cd.value?.ar ?? '' },
          })) ?? [],
        extra_details:
          p.extra_details?.map((ed) => ({
            id: ed.id,
            detail_key: { en: ed.key?.en ?? '', ar: ed.key?.ar ?? '' },
            detail_value: { en: ed.value?.en ?? '', ar: ed.value?.ar ?? '' },
          })) ?? [],
        bought_with: (p.bought_with ?? [])
          .map((v: any) => (typeof v === 'object' && v?.id != null ? v.id : v))
          .filter((v) => v != null && v !== '' && !Number.isNaN(Number(v)))
          .map((v) => Number(v)),
        shop_variants:
          p.variants?.flatMap((v, vIndex) =>
            (v.shops ?? []).map((s: any) => ({
              shop_id: Number(s.shop_id),
              variant_index: vIndex,
              price: Number(s.price) || 0,
              quantity: Number(s.quantity) || 0,
            }))
          ) ?? [],
        badges: p.badges?.length
          ? p.badges.map((b: any) => ({
              id: b.id,
              position: b.postion || b.position || 'top',
            }))
          : [],
      });
    }
  }, [productResponse, isEditMode, isLoadingProduct, reset]);

  const categoryDetailsFixedRef = useRef<string | null>(null);

  // Fix category_detail_id when availableCategoryDetails loads (match by name - API returns pivot id, we need definition id)
  useEffect(() => {
    if (
      !isEditMode ||
      !productResponse?.category_details?.length ||
      !availableCategoryDetails.length ||
      !id
    )
      return;
    if (categoryDetailsFixedRef.current === id) return;
    const p = productResponse;
    const fixed = p.category_details!.map((cd) => {
      const cdAny = cd as any;
      const defId = cdAny.category_detail_id ?? cdAny.category_detail?.id;
      let categoryDetailId = defId ? Number(defId) : 0;
      if (!categoryDetailId) {
        const nameToMatch = typeof cd.name === 'string' ? cd.name : cdAny.name?.en ?? cdAny.name?.ar;
        const matched = availableCategoryDetails.find((ad: any) => {
          const adName = typeof ad.name === 'object' ? ad.name?.en ?? ad.name?.ar : ad.name;
          return adName && nameToMatch && String(adName).trim() === String(nameToMatch).trim();
        });
        categoryDetailId = matched?.id ?? 0;
      }
      return {
        id: cd.id,
        category_detail_id: categoryDetailId,
        detail_value: { en: cd.value?.en ?? '', ar: cd.value?.ar ?? '' },
      };
    });
    const valid = fixed.filter((d) => d.category_detail_id > 0);
    if (valid.length > 0) {
      setValue('category_details', valid);
      categoryDetailsFixedRef.current = id;
    }
  }, [isEditMode, productResponse, availableCategoryDetails, setValue, id]);

  const variantsFixedRef = useRef<string | null>(null);

  // Map variant.attributes to attributes_values_ids when categoryAttributes loads (match by attr name + value)
  useEffect(() => {
    if (
      !isEditMode ||
      !productResponse?.variants?.length ||
      !categoryAttributes.length ||
      !id
    )
      return;
    if (variantsFixedRef.current === id) return;
    const p = productResponse;
    const mappedVariants = p.variants!.map((v) => {
      const ids: number[] = [];
      categoryAttributes.forEach((attr: any) => {
        const vAttr = (v.attributes ?? []).find((a: any) =>
          categoryAttrLabelMatches(attr, String((a as any).attribute ?? a))
        );
        if (vAttr) {
          const vVal = typeof vAttr === 'object' ? (vAttr as any).value : vAttr;
          const idFound = findAttributeValueId(attr, String(vVal ?? ''));
          if (idFound != null && !Number.isNaN(idFound)) ids.push(idFound);
        }
      });
      return {
        id: v.id,
        attributes_values_ids: ids,
        images: [] as File[],
        existing_images_ids:
          (v.images ?? []).map((img: any) => Number(img.id)).filter((mediaId) => !Number.isNaN(mediaId)) ?? [],
      };
    });
    setValue('variants', mappedVariants);
    variantsFixedRef.current = id;
  }, [isEditMode, productResponse, categoryAttributes, setValue, id]);

  // Image preview
  useEffect(() => {
    if (imagesFiles && imagesFiles.length > 0) {
      const previews: string[] = [];
      Array.from(imagesFiles).forEach((file) => {
        if (file instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result as string);
            if (previews.length === imagesFiles.length) setPreviewImages([...previews]);
          };
          reader.readAsDataURL(file);
        }
      });
    } else {
      setPreviewImages([]);
    }
  }, [imagesFiles]);

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const errorMessage =
    createProductMutation.error?.message || updateProductMutation.error?.message || null;

  // Map product variant attributes to attributes_values_ids using category attributes
  const mapVariantsToAttributeIds = (
    variants: Array<{ id?: number; attributes?: Array<{ attribute: string; value: string }>; images?: File[] }>,
    attrs: any[]
  ) =>
    variants.map((v) => {
      const ids: number[] = [];
      attrs.forEach((attr: any) => {
        const vAttr = (v.attributes ?? []).find((a: any) =>
          categoryAttrLabelMatches(attr, String((a as any).attribute ?? a))
        );
        if (vAttr) {
          const vVal = typeof vAttr === 'object' ? (vAttr as any).value : vAttr;
          const idFound = findAttributeValueId(attr, String(vVal ?? ''));
          if (idFound != null && !Number.isNaN(idFound)) ids.push(idFound);
        }
      });
      return { id: v.id, attributes_values_ids: ids, images: (v as any).images ?? [] };
    });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const live = getValues();
      // Nested File[] in field arrays is sometimes missing from `data` — use live state for uploads
      let payload: ProductFormValues = {
        ...data,
        images: live.images ?? data.images,
        existing_media_ids: live.existing_media_ids ?? data.existing_media_ids,
        variants: (data.variants ?? []).map((dv, i) => {
          const lv = live.variants?.[i];
          if (!lv) return dv;
          return {
            ...dv,
            ...lv,
            images: lv.images?.length ? lv.images : dv.images,
            existing_images_ids: lv.existing_images_ids ?? dv.existing_images_ids,
          };
        }),
      };

      console.log('[Product Form] Validation passed, submitting:', payload);

      // In edit mode: ensure variants have attributes_values_ids (full payload - changed + unchanged)
      if (isEditMode && productResponse && (payload.variants?.length ?? 0) > 0 && categoryAttributes.length > 0) {
        const enrichedFromApi = mapVariantsToAttributeIds(
          productResponse.variants?.map((v) => ({
            id: v.id,
            attributes: v.attributes,
          })) ?? [],
          categoryAttributes
        );
        payload = {
          ...payload,
          variants: payload.variants!.map((fv) => {
            if (fv.attributes_values_ids?.length) {
              return fv; // User already selected - use form values
            }
            const mapped =
              fv.id && productResponse.variants
                ? enrichedFromApi.find((e) => e.id === fv.id)
                : null;
            return {
              ...fv,
              attributes_values_ids:
                mapped?.attributes_values_ids ?? fv.attributes_values_ids ?? [],
            };
          }),
        };
      }

      // Ensure category_details have category_detail_id (merge with productResponse if needed)
      if (
        isEditMode &&
        productResponse?.category_details?.length &&
        availableCategoryDetails.length > 0 &&
        payload.category_details?.some((cd) => !cd.category_detail_id || cd.category_detail_id === 0)
      ) {
        payload = {
          ...payload,
          category_details: payload.category_details!.map((cd) => {
            if (cd.category_detail_id && cd.category_detail_id > 0) return cd;
            const orig = productResponse!.category_details!.find((o: any) => o.id === cd.id);
            if (!orig) return cd;
            const cdAny = orig as any;
            let defId = cdAny.category_detail_id ?? cdAny.category_detail?.id;
            if (!defId) {
              const nameToMatch =
                typeof orig.name === 'string' ? orig.name : cdAny.name?.en ?? cdAny.name?.ar;
              const matched = availableCategoryDetails.find((ad: any) => {
                const adName =
                  typeof ad.name === 'object' ? ad.name?.en ?? ad.name?.ar : ad.name;
                return adName && nameToMatch && String(adName).trim() === String(nameToMatch).trim();
              });
              defId = matched?.id;
            }
            return {
              ...cd,
              category_detail_id: defId ? Number(defId) : cd.category_detail_id,
            };
          }),
        };
      }

      // Variants without attributes_values_ids are dropped entirely — API keys like variants[0][images][] are never sent.
      const orphanVariantImages = payload.variants?.some(
        (v) =>
          ((v.images?.length ?? 0) > 0 || (v.existing_images_ids?.length ?? 0) > 0) &&
          (!Array.isArray(v.attributes_values_ids) || v.attributes_values_ids.length === 0)
      );
      if (orphanVariantImages) {
        toast.error(
          'Each variant with images must have at least one attribute selected (e.g. size or color). Otherwise variant images are not sent.'
        );
        return;
      }

      const validVariants =
        payload.variants?.filter(
          (v) => Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0
        ) ?? [];
      if (
        (payload.variants?.length ?? 0) > 0 &&
        validVariants.length < (payload.variants?.length ?? 0)
      ) {
        toast.warning(
          'Some variants were skipped (no attribute values). Each variant must have at least one attribute selected.'
        );
      }
      const finalPayload = {
        ...payload,
        variants: validVariants,
        category_details: payload.category_details?.filter(
          (cd) => cd.category_detail_id && cd.category_detail_id > 0
        ),
      };

      const productImagesCompressed = finalPayload.images?.length
        ? await compressImages(finalPayload.images)
        : finalPayload.images;
      const variantsCompressed = await Promise.all(
        (finalPayload.variants ?? []).map(async (v) => ({
          ...v,
          images: v.images?.length ? await compressImages(v.images) : v.images,
        }))
      );
      const uploadPayload: ProductFormValues = {
        ...finalPayload,
        images: productImagesCompressed,
        variants: variantsCompressed,
      };

      if (isEditMode && id) {
        console.log('[Product Form] Sending update payload:', { id, data: uploadPayload });
        await updateProductMutation.mutateAsync({ id, data: uploadPayload });
        toast.success('Product updated successfully');
      } else {
        console.log('[Product Form] Sending create payload:', uploadPayload);
        await createProductMutation.mutateAsync(uploadPayload);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      console.error('[Product Form] Submit error:', error);
      console.error('[Product Form] Error response:', error?.response?.data);
      console.error('[Product Form] Error message:', error?.message);
      toast.error(error?.message || 'Failed to save product');
    }
  };

  const toggleBoughtWith = (productId: number) => {
    const current = watchedBoughtWith;
    const next = current.includes(productId)
      ? current.filter((pid) => pid !== productId)
      : [...current, productId];
    setValue('bought_with', next, { shouldDirty: true });
  };

  return (
    <>
      <title>
        {isEditMode ? `Edit Product | ${metadata.title}` : `Create Product | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any, (errors) => {
          console.error('[Product Form] Validation errors:', errors);
          const getFirstMessage = (obj: any): string | null => {
            if (!obj) return null;
            if (typeof obj.message === 'string') return obj.message;
            if (typeof obj === 'object') {
              for (const v of Object.values(obj)) {
                const m = getFirstMessage(v);
                if (m) return m;
              }
            }
            return null;
          };
          const msg = getFirstMessage(errors);
          console.error('[Product Form] First error message:', msg);
          toast.error(msg || 'Please fix the form errors and try again.');
        })}
        onCancel={() => navigate('/products')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Product' : 'Create New Product'}
        description={
          isEditMode ? 'Update product information and details' : 'Add a new product to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingProduct}
        loadingText={t('form.loadingProduct')}
        maxWidth="6xl"
        infoText={
          isEditMode
            ? 'Update product information, variants, and details.'
            : 'Create a new product with all required information.'
        }
        submitLabel={isEditMode ? 'Update Product' : 'Create Product'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* ─── Category ─────────────────────────────────────────── */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:folder-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Category *
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="category_id"
            queryKey={['categories', 'infinite', 'product-form']}
            fetcher={categoryFetcher}
            placeholder={t('form.selectCategory')}
            initialLabel={productResponse?.category?.name}
            onValueChange={() => {
              setValue('variants', []);
              setValue('category_details', []);
            }}
          />
        </Box>

        {/* ─── Brand ────────────────────────────────────────────── */}
        <Box className="group">
          <Box className="flex items-center justify-between gap-2 mb-2">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Brand
              </Typography>
            </Box>
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() =>
                window.open(`${paths.dashboard.root}${paths.dashboard.brands}/create`, '_blank')
              }
              className="text-primary -mr-2"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Create New Brand
            </Button>
          </Box>
          <RHFInfiniteSelect
            name="brand_id"
            queryKey={['brands', 'infinite', 'product-form']}
            fetcher={brandFetcher}
            placeholder={t('form.selectBrandOptional')}
            initialLabel={productResponse?.brand ? formatTranslated(productResponse.brand.name as any) : undefined}
          />
        </Box>

        {/* ─── Name ─────────────────────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                English Name *
              </Typography>
            </Box>
            <Controller
              name="name.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input {...field} type="text" placeholder={t('form.productNamePlaceholder')} className={inputCls} />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Arabic Name *
              </Typography>
            </Box>
            <Controller
              name="name.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    dir="rtl"
                    placeholder="e.g., ايفون 15"
                    className={inputCls}
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ─── Description ──────────────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                English Description *
              </Typography>
            </Box>
            <Controller
              name="description.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={t('form.productDescPlaceholder')}
                    className={inputCls}
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Arabic Description *
              </Typography>
            </Box>
            <Controller
              name="description.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    dir="rtl"
                    placeholder="وصف المنتج بالعربية"
                    className={inputCls}
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ─── Full Description ─────────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:document-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Full Description (EN)
              </Typography>
            </Box>
            <Controller
              name="full_description.en"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('form.fullDescPlaceholder')}
                  dir="ltr"
                />
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:document-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Full Description (AR)
              </Typography>
            </Box>
            <Controller
              name="full_description.ar"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="الوصف الكامل بالعربية"
                  dir="rtl"
                />
              )}
            />
          </Box>
        </Box>

        {/* ─── Country ──────────────────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:globe-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Country of Origin (EN)
              </Typography>
            </Box>
            <Controller
              name="country.en"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.countryPlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:globe-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Country of Origin (AR)
              </Typography>
            </Box>
            <Controller
              name="country.ar"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  dir="rtl"
                  placeholder="e.g., أمريكا"
                  className={inputCls}
                />
              )}
            />
          </Box>
        </Box>

        {/* ─── Price & Price After Discount ─────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:dollar-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Price *
              </Typography>
            </Box>
            <Controller
              name="price"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={inputCls}
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-price-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Price After Discount
              </Typography>
            </Box>
            <Controller
              name="price_after_discount"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  placeholder="0.00"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  className={inputCls}
                />
              )}
            />
          </Box>
        </Box>

        {/* ─── Quantity & Time Prepare ──────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:box-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Quantity *
              </Typography>
            </Box>
            <Controller
              name="quantity"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={inputCls}
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:clock-circle-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Preparation Time (HH:MM)
              </Typography>
            </Box>
            <Controller
              name="time_prepare"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder="e.g., 00:30" className={inputCls} />
              )}
            />
          </Box>
        </Box>

        {/* ─── SKU / Model / Barcode ────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">SKU</Typography>
            </Box>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.skuPlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:widget-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">Model</Typography>
            </Box>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.modelPlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:qr-code-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">Barcode</Typography>
            </Box>
            <Controller
              name="barcode"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder="e.g., 123456789" className={inputCls} />
              )}
            />
          </Box>
        </Box>

        {/* ─── Product Images ───────────────────────────────────── */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Product Images
            </Typography>
          </Box>
          <Controller
            name="images"
            control={control}
            render={({ field: { onChange, value, ref, name, onBlur }, fieldState: { error } }) => (
              <div className="w-full">
                {/* Native file inputs are unreliable when styled as text fields; use label + sr-only input */}
                <input
                  id={productImagesInputId}
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => {
                    const picked = e.target.files ? Array.from(e.target.files) : [];
                    const prev = Array.isArray(value) ? value : [];
                    onChange([...prev, ...picked]);
                    e.currentTarget.value = '';
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor={productImagesInputId}
                    className="inline-flex cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Choose files
                  </label>
                  <Typography component="span" variant="body2" color="secondary">
                    {Array.isArray(value) && value.length > 0
                      ? `${value.length} file(s) selected`
                      : 'No file chosen'}
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  className={error ? 'text-destructive mt-1 block' : 'text-muted-foreground mt-1 block'}
                >
                  {error?.message ||
                    'Select multiple images (Ctrl/Cmd+click or Shift+click). You can choose again to add more files.'}
                </Typography>
                {(isEditMode && existingMediaIds.length > 0) || previewImages.length > 0 ? (
                  <Box className="mt-4 grid grid-cols-4 gap-4">
                    {isEditMode &&
                      productResponse?.images
                        ?.filter((img: any) => existingMediaIds.includes(Number(img.id)))
                        .map((img: any) => (
                          <Box key={`ex-${img.id}`} className="relative group">
                            <img
                              src={img.url ?? img}
                              alt=""
                              className="w-full h-32 object-cover rounded-lg border border-border/60"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  'existing_media_ids',
                                  existingMediaIds.filter((mid) => mid !== Number(img.id)),
                                  { shouldDirty: true }
                                )
                              }
                              className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 opacity-90 hover:opacity-100"
                              aria-label="Remove image"
                            >
                              <Iconify icon="solar:close-circle-bold" width={20} />
                            </button>
                          </Box>
                        ))}
                    {previewImages.map((src, i) => (
                      <img
                        key={`new-${i}`}
                        src={src}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-primary/40"
                      />
                    ))}
                  </Box>
                ) : null}
              </div>
            )}
          />
        </Box>

        {/* ─── Instant Delivery ─────────────────────────────────── */}
        <Box className="group">
          <Controller
            name="is_instant_delivery"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value === 1}
                  onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded border-border"
                />
                <Typography variant="body2" className="text-foreground">
                  Instant Delivery Available
                </Typography>
              </Label>
            )}
          />
        </Box>

        {/* ─── Variants ─────────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:settings-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Variants (Attributes)
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={!categoryId || categoryId === 0 || categoryAttributes.length === 0}
              onClick={() =>
                appendVariant({ attributes_values_ids: [], images: [], existing_images_ids: [] })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Add Variant
            </Button>
          </Box>

          {!categoryId || categoryId === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              Select a category first to load attributes.
            </Typography>
          ) : isLoadingAttributes ? (
            <Typography variant="body2" className="text-muted-foreground">
              Loading attributes...
            </Typography>
          ) : categoryAttributes.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No attributes found for this category.
            </Typography>
          ) : (
            <Box className="space-y-4">
              {variantsFields.map((variant, variantIndex) => (
                <Box key={variant.id} className="p-4 border border-border rounded-lg space-y-4">
                  <Box className="flex items-center justify-between">
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      Variant #{variantIndex + 1}
                    </Typography>
                    <Button
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                      Remove
                    </Button>
                  </Box>

                  {/* Attribute selects / color picker */}
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAttributes.map((attr: any) => {
                      const selectedIds =
                        watch(`variants.${variantIndex}.attributes_values_ids`) || [];
                      const attrValueIds = new Set<number>(
                        (attr.values || []).map((v: any) => Number(v.id))
                      );
                      const found = (attr.values || []).find((v: any) =>
                        selectedIds.includes(Number(v.id))
                      );

                      const getValColor = (v: any) => {
                        const raw = typeof v?.name === 'object' ? v?.name?.en ?? v?.name?.ar : v?.name;
                        const s = String(raw || '').trim();
                        if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
                        const colorMap: Record<string, string> = {
                          red: '#ff0000', blue: '#0000ff', green: '#008000',
                          white: '#ffffff', black: '#000000', yellow: '#ffff00',
                          orange: '#ffa500', gray: '#808080', grey: '#808080',
                          pink: '#ffc0cb', purple: '#800080', brown: '#a52a2a',
                        };
                        return colorMap[s.toLowerCase()] ?? '#cccccc';
                      };

                      const isColor = String(attr.type).toLowerCase() === 'color';

                      return (
                        <Box key={attr.id} className="group">
                          <Typography variant="caption" className="text-muted-foreground mb-1 block">
                            {typeof attr.name === 'object' ? attr.name?.en : attr.name} ({attr.type})
                          </Typography>
                          {isColor ? (
                            <Box className="flex flex-wrap items-center gap-2">
                              {(attr.values || []).map((val: any) => {
                                const hex = getValColor(val);
                                const isSelected = selectedIds.includes(Number(val.id));
                                const label = typeof val.name === 'object' ? val.name?.en ?? val.name?.ar : val.name;
                                return (
                                  <button
                                    key={val.id}
                                    type="button"
                                    onClick={() => {
                                      const current = (watch(
                                        `variants.${variantIndex}.attributes_values_ids`
                                      ) || []) as number[];
                                      const filtered = current.filter((i) => !attrValueIds.has(i));
                                      const next = isSelected
                                        ? filtered
                                        : [...filtered, Number(val.id)];
                                      setValue(
                                        `variants.${variantIndex}.attributes_values_ids`,
                                        next,
                                        { shouldDirty: true }
                                      );
                                    }}
                                    className={`flex items-center gap-2 rounded-lg border-2 p-2 transition-all hover:scale-105 ${
                                      isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                                    }`}
                                    title={String(label || hex)}
                                  >
                                    <span
                                      className="h-8 w-8 rounded-md border border-border/60 shrink-0"
                                      style={{ background: hex }}
                                    />
                                    <Typography variant="caption" className="text-foreground truncate max-w-[80px]">
                                      {label || hex}
                                    </Typography>
                                  </button>
                                );
                              })}
                            </Box>
                          ) : (
                            <select
                              value={found ? Number(found.id) : 0}
                              onChange={(e) => {
                                const pickedId = Number(e.target.value);
                                const current = (watch(
                                  `variants.${variantIndex}.attributes_values_ids`
                                ) || []) as number[];
                                const filtered = current.filter((i) => !attrValueIds.has(i));
                                setValue(
                                  `variants.${variantIndex}.attributes_values_ids`,
                                  pickedId ? [...filtered, pickedId] : filtered,
                                  { shouldDirty: true }
                                );
                              }}
                              className={inputCls}
                            >
                              <option value={0}>
                                Select {typeof attr.name === 'object' ? attr.name?.en : attr.name}
                              </option>
                              {(attr.values || []).map((val: any) => (
                                <option key={val.id} value={val.id}>
                                  {typeof val.name === 'object' ? val.name?.en : val.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Variant Images */}
                  <Box className="group">
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      Variant Images (optional)
                    </Typography>
                    <Controller
                      name={`variants.${variantIndex}.images`}
                      control={control}
                      render={({ field: { onChange, value, ref, name, onBlur } }) => {
                        const variantFileInputId = `variant-images-${variantIndex}-${variant.id}`;
                        return (
                          <>
                            <input
                              id={variantFileInputId}
                              ref={ref}
                              name={name}
                              onBlur={onBlur}
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              tabIndex={-1}
                              onChange={(e) => {
                                const picked = e.target.files ? Array.from(e.target.files) : [];
                                const prev = Array.isArray(value) ? value : [];
                                onChange([...prev, ...picked]);
                                e.currentTarget.value = '';
                              }}
                            />
                            <div className="flex flex-wrap items-center gap-3">
                              <label
                                htmlFor={variantFileInputId}
                                className="inline-flex cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                              >
                                Choose files
                              </label>
                              <Typography component="span" variant="body2" color="secondary">
                                {Array.isArray(value) && value.length > 0
                                  ? `${value.length} file(s) selected`
                                  : 'No file chosen'}
                              </Typography>
                            </div>
                          </>
                        );
                      }}
                    />
                    <Typography variant="caption" className="text-muted-foreground mt-1 block">
                      Multiple images: Ctrl/Cmd+click in the file dialog, or pick again to append more.
                    </Typography>
                    {(() => {
                      const vRowId = watch(`variants.${variantIndex}.id`);
                      const keepVIds = watch(`variants.${variantIndex}.existing_images_ids`) ?? [];
                      const fromApi =
                        isEditMode && vRowId && productResponse?.variants
                          ? productResponse.variants
                              .find((x: any) => Number(x.id) === Number(vRowId))
                              ?.images?.filter((im: any) =>
                                keepVIds.includes(Number(im.id))
                              ) ?? []
                          : [];
                      if (!fromApi.length) return null;
                      return (
                        <Box className="mt-2 flex flex-wrap gap-2">
                          {fromApi.map((im: any) => (
                            <Box key={im.id} className="relative group/vimg">
                              <img
                                src={im.url ?? im}
                                alt=""
                                className="h-20 w-20 object-cover rounded-lg border border-border/60"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setValue(
                                    `variants.${variantIndex}.existing_images_ids`,
                                    keepVIds.filter((x) => x !== Number(im.id)),
                                    { shouldDirty: true }
                                  )
                                }
                                className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 opacity-90 hover:opacity-100"
                                aria-label="Remove variant image"
                              >
                                <Iconify icon="solar:close-circle-bold" width={18} />
                              </button>
                            </Box>
                          ))}
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ─── Category Details ─────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:list-check-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Category Details
              </Typography>
            </Box>
            {availableCategoryDetails.length > 0 && (
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() =>
                  appendCategoryDetail({
                    category_detail_id: availableCategoryDetails[0]?.id ?? 0,
                    detail_value: { en: '', ar: '' },
                  })
                }
              >
                <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
                Add Detail
              </Button>
            )}
          </Box>

          {!categoryId || categoryId === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              Select a category first to load category details.
            </Typography>
          ) : availableCategoryDetails.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No category-specific details for this category.
            </Typography>
          ) : (
            <Box className="space-y-4">
              {categoryDetailsFields.map((field, index) => (
                <Box key={field.id} className="p-4 border border-border rounded-lg space-y-3">
                  <Box className="flex items-center gap-3">
                    <Controller
                      name={`category_details.${index}.category_detail_id`}
                      control={control}
                      render={({ field: f }) => (
                        <select
                          {...f}
                          value={f.value}
                          onChange={(e) => f.onChange(Number(e.target.value))}
                          className={`${inputCls} flex-1`}
                        >
                          {availableCategoryDetails.map((cd: any) => (
                            <option key={cd.id} value={cd.id}>
                              {typeof cd.name === 'object' ? cd.name?.en ?? cd.name?.ar : cd.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => removeCategoryDetail(index)}
                      className="text-destructive shrink-0"
                    >
                      <Iconify icon="solar:trash-bin-bold" width={16} />
                    </Button>
                  </Box>
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      name={`category_details.${index}.detail_value.en`}
                      control={control}
                      render={({ field: f }) => (
                        <input {...f} placeholder={t('form.productValueEn')} className={inputCls} />
                      )}
                    />
                    <Controller
                      name={`category_details.${index}.detail_value.ar`}
                      control={control}
                      render={({ field: f }) => (
                        <input {...f} dir="rtl" placeholder="القيمة (AR)" className={inputCls} />
                      )}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ─── Extra Details ────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:add-circle-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Extra Details
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() =>
                appendExtraDetail({
                  detail_key: { en: '', ar: '' },
                  detail_value: { en: '', ar: '' },
                })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Add Detail
            </Button>
          </Box>

          <Box className="space-y-4">
            {extraDetailsFields.map((field, index) => (
              <Box key={field.id} className="p-4 border border-border rounded-lg">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Controller
                    name={`extra_details.${index}.detail_key.en`}
                    control={control}
                    render={({ field: f }) => (
                      <input {...f} placeholder={t('form.productKeyEnPlaceholder')} className={inputCls} />
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_key.ar`}
                    control={control}
                    render={({ field: f }) => (
                      <input
                        {...f}
                        dir="rtl"
                        placeholder="المفتاح (AR) — e.g., الوزن"
                        className={inputCls}
                      />
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_value.en`}
                    control={control}
                    render={({ field: f }) => (
                      <input {...f} placeholder={t('form.productValueEnPlaceholder')} className={inputCls} />
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_value.ar`}
                    control={control}
                    render={({ field: f }) => (
                      <input
                        {...f}
                        dir="rtl"
                        placeholder="القيمة (AR) — e.g., 500 جرام"
                        className={inputCls}
                      />
                    )}
                  />
                </Box>
                <Box className="flex justify-end">
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={() => removeExtraDetail(index)}
                    className="text-destructive"
                  >
                    <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                    Remove
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ─── Bought With ──────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center gap-2 mb-4">
            <Iconify icon="solar:shop-bold" className="text-primary" width={20} />
            <Typography variant="h6" className="font-semibold text-foreground">
              Bought With (Related Products)
            </Typography>
          </Box>
          {allProducts.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No products available.
            </Typography>
          ) : (
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
              {allProducts
                .filter((p: any) => String(p.id) !== String(id))
                .map((p: any) => {
                  const pName =
                    typeof p.name === 'object' ? p.name?.en ?? p.name?.ar : p.name;
                  const selected = watchedBoughtWith.includes(Number(p.id));
                  return (
                    <Label
                      key={p.id}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleBoughtWith(Number(p.id))}
                        className="w-4 h-4 shrink-0"
                      />
                      <Typography variant="caption" className="text-foreground truncate">
                        #{p.id} {pName}
                      </Typography>
                    </Label>
                  );
                })}
            </Box>
          )}
        </Box>

        {/* ─── Badges ────────────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">

             <Typography variant="h6" className="font-semibold text-foreground">
              Badges
            </Typography>
          <RHFBadgeSelector name="badges" />
        </Box>

        {/* ─── Shop Variants ────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:shop-2-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Shop Variants
              </Typography>
            </Box>
            {watchedVariants.length > 0 && shops.length > 0 && (
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() =>
                  appendShopVariant({
                    shop_id: shops[0]?.id ?? 0,
                    variant_index: 0,
                    price: 0,
                    quantity: 0,
                  })
                }
              >
                <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
                Add Shop Variant
              </Button>
            )}
          </Box>

          {watchedVariants.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              Add variants above first, then assign them to shops.
            </Typography>
          ) : shops.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No shops available.
            </Typography>
          ) : (
            <Box className="space-y-3">
              {shopVariantsFields.map((field, index) => (
                <Box
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-border rounded-lg items-end"
                >
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      Shop
                    </Typography>
                    <Controller
                      name={`shop_variants.${index}.shop_id`}
                      control={control}
                      render={({ field: f }) => (
                        <select
                          {...f}
                          value={f.value}
                          onChange={(e) => f.onChange(Number(e.target.value))}
                          className={inputCls}
                        >
                          {shops.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {typeof s.name === 'object' ? s.name?.en ?? s.name?.ar : s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      Variant
                    </Typography>
                    <Controller
                      name={`shop_variants.${index}.variant_index`}
                      control={control}
                      render={({ field: f }) => (
                        <select
                          {...f}
                          value={f.value}
                          onChange={(e) => f.onChange(Number(e.target.value))}
                          className={inputCls}
                        >
                          {watchedVariants.map((_: any, vi: number) => (
                            <option key={vi} value={vi}>
                              Variant #{vi + 1}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      Price
                    </Typography>
                    <Controller
                      name={`shop_variants.${index}.price`}
                      control={control}
                      render={({ field: f }) => (
                        <input
                          {...f}
                          type="number"
                          placeholder="0.00"
                          onChange={(e) => f.onChange(Number(e.target.value))}
                          className={inputCls}
                        />
                      )}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      Quantity
                    </Typography>
                    <Box className="flex gap-2">
                      <Controller
                        name={`shop_variants.${index}.quantity`}
                        control={control}
                        render={({ field: f }) => (
                          <input
                            {...f}
                            type="number"
                            placeholder="0"
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            className={`${inputCls} flex-1`}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="text"
                        size="small"
                        onClick={() => removeShopVariant(index)}
                        className="text-destructive shrink-0"
                      >
                        <Iconify icon="solar:trash-bin-bold" width={16} />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CreateFormLayout>
    </>
  );
}
