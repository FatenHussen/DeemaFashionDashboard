import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useFetchBrands } from '@/pages/dashboard/products/hooks/brand';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { axiosInstance, apiRoutes } from '@/api';
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
import { Box, Input, Button, Typography } from 'src/shared/ui';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Product ${CONFIG.appName}` };

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Fetch dependencies
  const { data: categoriesResponse } = useFetchCategories();
  const { data: brandsResponse } = useFetchBrands();
  const { data: shopsResponse } = useFetchShops(1, 100);
  const { data: productResponse, isLoading: isLoadingProduct } = useFetchProductById(id || '');

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const categories = categoriesResponse?.data.items || [];
  const brandsRaw = (brandsResponse as any)?.data;
  const brands = Array.isArray(brandsRaw) ? brandsRaw : (brandsRaw?.items ?? []);
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
    variants: [],
    category_details: [],
    extra_details: [],
    bought_with: [],
    shop_variants: [],
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const categoryId = watch('category_id');
  const imagesFiles = watch('images');
  const watchedVariants = watch('variants') || [];
  const watchedBoughtWith = watch('bought_with') || [];

  // Fetch category attributes when category changes
  const { data: categoryAttributesAll, isLoading: isLoadingAttributes } =
    useFetchCategoryAttributes(categoryId ? Number(categoryId) : undefined, 1, 100);
  const categoryAttributes =
    categoryAttributesAll?.data?.items ?? categoryAttributesAll?.data?.data ?? [];

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
  const allProducts: any[] = allProductsResponse?.data?.data ?? [];

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
        category_id: p.category?.id ?? 0,
        brand_id: p.brand?.id ?? 0,
        name: { en: p.name?.en ?? '', ar: p.name?.ar ?? '' },
        description: { en: p.description?.en ?? '', ar: p.description?.ar ?? '' },
        full_description: { en: p.full_description?.en ?? '', ar: p.full_description?.ar ?? '' },
        country: { en: p.country?.en ?? '', ar: p.country?.ar ?? '' },
        price: p.price,
        price_after_discount: p.price_after_discount ?? undefined,
        quantity: p.quantity ?? 0,
        sku: p.sku ?? '',
        model: p.model ?? '',
        barcode: p.barcode ?? '',
        time_prepare: p.time_prepare ?? '',
        is_instant_delivery: p.is_instant_delivery ? 1 : 0,
        images: [],
        variants:
          p.variants?.map((v) => ({
            id: v.id,
            attributes_values_ids: [],
            images: [],
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
        bought_with: p.bought_with ?? [],
        shop_variants:
          p.variants?.flatMap((v, vIndex) =>
            (v.shops ?? []).map((s: any) => ({
              shop_id: s.shop_id,
              variant_index: vIndex,
              price: s.price ?? 0,
              quantity: s.quantity ?? 0,
            }))
          ) ?? [],
      });
    }
  }, [productResponse, isEditMode, isLoadingProduct, reset]);

  // Show existing product images in edit mode
  useEffect(() => {
    if (isEditMode && productResponse?.images?.length) {
      setExistingImageUrls(
        productResponse.images.map((img: any) => img.url ?? img)
      );
    } else {
      setExistingImageUrls([]);
    }
  }, [isEditMode, productResponse?.images]);

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
        const attrName = String(typeof attr.name === 'object' ? attr.name?.en ?? attr.name?.ar : attr.name).trim();
        const vAttr = (v.attributes ?? []).find(
          (a: any) => String((a as any).attribute ?? a).trim() === attrName
        );
        if (vAttr) {
          const vVal = typeof vAttr === 'object' ? (vAttr as any).value : vAttr;
          const vals = attr?.values ?? [];
          const match =
            vals.find(
              (x: any) =>
                String(typeof x.value === 'string' ? x.value : x.value?.en ?? x.value?.ar ?? '').trim() ===
                String(vVal).trim()
            ) ??
            vals.find(
              (x: any) =>
                String(typeof x.name === 'object' ? x.name?.en ?? x.name?.ar : x.name).trim() ===
                String(vVal).trim()
            );
          if (match?.id) ids.push(match.id);
        }
      });
      return {
        id: v.id,
        attributes_values_ids: ids,
        images: [] as File[],
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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEditMode && id) {
        await updateProductMutation.mutateAsync({ id, data });
        toast.success('Product updated successfully');
      } else {
        await createProductMutation.mutateAsync(data);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
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
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate('/products')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Product' : 'Create New Product'}
        description={
          isEditMode ? 'Update product information and details' : 'Add a new product to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingProduct}
        loadingText="Loading product data..."
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
          <Controller
            name="category_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div>
                <select
                  value={value}
                  onChange={(e) => {
                    onChange(Number(e.target.value));
                    setValue('variants', []);
                    setValue('category_details', []);
                  }}
                  className={inputCls}
                >
                  <option value={0}>Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {typeof c.name === 'object' ? c.name?.en ?? c.name?.ar : c.name}
                    </option>
                  ))}
                </select>
                {error && (
                  <Typography variant="caption" className="text-destructive mt-1">
                    {error.message}
                  </Typography>
                )}
              </div>
            )}
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
          <Controller
            name="brand_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <select
                value={value ?? 0}
                onChange={(e) => onChange(Number(e.target.value))}
                className={inputCls}
              >
                <option value={0}>Select Brand (optional)</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {typeof b.name === 'object'
                      ? b.name?.en ?? b.name?.ar ?? `Brand #${b.id}`
                      : b.name}
                  </option>
                ))}
              </select>
            )}
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
                  <input {...field} type="text" placeholder="e.g., iPhone 15" className={inputCls} />
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
                    placeholder="Product description in English"
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
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Full detailed description in English"
                  className={inputCls}
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
                <textarea
                  {...field}
                  rows={4}
                  dir="rtl"
                  placeholder="الوصف الكامل بالعربية"
                  className={inputCls}
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
                <input {...field} type="text" placeholder="e.g., USA" className={inputCls} />
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
                <input {...field} type="text" placeholder="e.g., SKU-001" className={inputCls} />
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
                <input {...field} type="text" placeholder="e.g., iPhone15Pro" className={inputCls} />
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
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onChange(e.target.files ? Array.from(e.target.files) : [])}
                  error={!!error}
                  helperText={error?.message || 'Upload product images (multiple allowed)'}
                  fullWidth
                />
                {(existingImageUrls.length > 0 || previewImages.length > 0) && (
                  <Box className="mt-4 grid grid-cols-4 gap-4">
                    {existingImageUrls.map((src, i) => (
                      <img
                        key={`ex-${i}`}
                        src={src}
                        alt={`Current ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border/60"
                      />
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
                )}
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
              onClick={() => appendVariant({ attributes_values_ids: [], images: [] })}
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

                  {/* Attribute selects */}
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

                      return (
                        <Box key={attr.id} className="group">
                          <Typography variant="caption" className="text-muted-foreground mb-1 block">
                            {typeof attr.name === 'object' ? attr.name?.en : attr.name} ({attr.type})
                          </Typography>
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
                          {attr.type === 'color' && found && (
                            <Box className="mt-1 flex items-center gap-2">
                              <span
                                className="inline-block w-4 h-4 rounded border border-border"
                                style={{ background: String(found.name) }}
                              />
                              <Typography variant="caption" className="text-muted-foreground">
                                {found.name}
                              </Typography>
                            </Box>
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
                      render={({ field: { onChange, ...field } }) => (
                        <input
                          {...field}
                          type="file"
                          accept="image/*"
                          multiple
                          value=""
                          onChange={(e) =>
                            onChange(e.target.files ? Array.from(e.target.files) : [])
                          }
                          className={inputCls}
                        />
                      )}
                    />
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
                        <input {...f} placeholder="Value (EN)" className={inputCls} />
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
                      <input {...f} placeholder="Key (EN) — e.g., Weight" className={inputCls} />
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
                      <input {...f} placeholder="Value (EN) — e.g., 500g" className={inputCls} />
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
