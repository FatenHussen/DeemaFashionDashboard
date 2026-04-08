import type {
  ProductDetailData,
  ProductCreateUpdatePayload,
} from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRoutes, axiosInstance } from '@/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { compressImage, compressImages } from '@/utils/compress-image';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _CountryApi } from '@/pages/dashboard/countries/api/country.services';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RichTextEditor } from '@/shared/components/rich-text-editor/rich-text-editor';
import { _SaleCountryApi } from '@/pages/dashboard/sale-countries/api/sale-country.services';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import {
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';
import {
  ProductSchema,
  type ProductFormValues,
} from '@/pages/dashboard/products/validation/product.validation';
import {
  useCreateProduct,
  useUpdateProduct,
  useFetchProductById,
} from '@/pages/dashboard/products/hooks/product';
import {
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '@/pages/dashboard/products/hooks/product-variant';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { Box, Tab, Tabs, Button, Typography } from 'src/shared/ui';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

// ----------------------------------------------------------------------

const mainCategoryFetcher = (page: number, limit: number) =>
  _CategoryApi.getListCategoriesPaginated({ page, per_page: limit, parent_id: 0 }).then((r) => ({
    data: {
      items: r.data.items.map((cat) => ({
        id: cat.id,
        label: formatTranslated(cat.name as any),
      })),
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

const vendorFetcher = (page: number, limit: number) =>
  _VendorApi.getListVendor({ page, limit }).then((r) => ({
    data: {
      items: r.data.items.map((v) => ({ id: v.id, label: formatTranslated(v.name) })),
      pagination: r.data.pagination,
    },
  }));

const countryFetcher = (page: number, limit: number) =>
  _CountryApi.getListCountries({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((c) => ({
        id: c.id,
        label: typeof c.name === 'string' ? c.name : formatTranslated(c.name),
      })),
      pagination: r.data.pagination,
    },
  }));

const saleCountryFetcher = (page: number, limit: number) =>
  _SaleCountryApi.getListSaleCountries({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((c) => ({ id: c.id, label: c.name })),
      pagination: r.data.pagination,
    },
  }));

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

/** Platform vendor id sent when "For me" is selected. */
const INTERNAL_VENDOR_ID = 1;

/** Collapse double slashes in the URL path (e.g. `/storage//tmp/...`) so `<img src>` loads reliably. */
function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    u.pathname = u.pathname.replace(/\/+/g, '/');
    return u.toString();
  } catch {
    return url;
  }
}

/** Absolute URL for API media (handles relative paths and fixes `/storage//…`). */
function resolveProductMediaUrl(url: string): string {
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) {
    return normalizeMediaUrl(t);
  }
  const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
  return normalizeMediaUrl(`${base}/${t.replace(/^\//, '')}`);
}

/** RHF + zod sometimes drop `File` refs from parsed `data`; always prefer `getValues()` for uploads. */
function filterFileList(v: unknown): File[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is File => x instanceof File);
}

/**
 * Many backends sync gallery media: if `existing_media_ids[]` is missing, all images are removed.
 * Prefer live → parsed data → last-known API ids (edit only) when the form state was lost.
 */
function resolveExistingMediaIdsForPayload(
  live: { existing_media_ids?: number[] },
  data: { existing_media_ids?: number[] },
  isEditMode: boolean,
  product: ProductDetailData | null | undefined
): number[] {
  if (Array.isArray(live.existing_media_ids)) {
    return live.existing_media_ids.map(Number).filter((x) => !Number.isNaN(x));
  }
  if (Array.isArray(data.existing_media_ids)) {
    return data.existing_media_ids.map(Number).filter((x) => !Number.isNaN(x));
  }
  if (isEditMode && product?.images?.length) {
    return product.images.map((img) => Number(img.id)).filter((x) => !Number.isNaN(x));
  }
  return [];
}

function resolveVariantExistingImageIds(
  lv: { existing_images_ids?: number[] } | undefined,
  dv: { existing_images_ids?: number[] },
  variantId: number | undefined,
  isEditMode: boolean,
  product: ProductDetailData | null | undefined
): number[] {
  const fromLv = lv?.existing_images_ids;
  // Non-empty array from the form (getValues) is authoritative.
  if (Array.isArray(fromLv) && fromLv.length > 0) {
    return fromLv.map(Number).filter((x) => !Number.isNaN(x));
  }
  // Explicit empty [] = user removed all variant images for this row.
  if (Array.isArray(fromLv) && fromLv.length === 0) {
    return [];
  }
  if (Array.isArray(dv.existing_images_ids) && dv.existing_images_ids.length > 0) {
    return dv.existing_images_ids.map(Number).filter((x) => !Number.isNaN(x));
  }
  if (isEditMode && variantId != null && product?.variants?.length) {
    const apiV = product.variants.find((x) => Number(x.id) === Number(variantId));
    if (apiV?.images?.length) {
      return apiV.images.map((img) => Number(img.id)).filter((x) => !Number.isNaN(x));
    }
  }
  return [];
}

/**
 * Preview server image on edit: `<img src>` only (no XHR — cross-origin blob fetches need CORS on storage URLs).
 * Optional `fallbackUrl` (e.g. first gallery image) when primary URL fails to load.
 */
function ExistingImagePreview({
  url,
  label,
  active,
  fallbackUrl,
}: {
  url: string | null | undefined;
  label: string;
  active: boolean;
  /** e.g. first gallery `images[0].url` when `thumbnail` tmp URL fails */
  fallbackUrl?: string | null;
}) {
  const raw = typeof url === 'string' ? url.trim() : '';
  const fb = typeof fallbackUrl === 'string' ? fallbackUrl.trim() : '';

  const [usedGalleryFallback, setUsedGalleryFallback] = useState(false);
  const [directIdx, setDirectIdx] = useState(0);

  const directCandidates = (() => {
    const list: string[] = [];
    if (raw) {
      list.push(resolveProductMediaUrl(raw), raw);
    }
    if (fb) {
      list.push(resolveProductMediaUrl(fb), fb);
    }
    return Array.from(new Set(list.filter(Boolean)));
  })();

  const primaryUrlSet = new Set(
    raw ? [resolveProductMediaUrl(raw), raw].filter(Boolean) : []
  );

  useEffect(() => {
    setDirectIdx(0);
    setUsedGalleryFallback(false);
  }, [raw, fb, active]);

  if (!active || (!raw && !fb)) return null;

  const hrefPrimary =
    raw &&
    (raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `${(CONFIG.serverUrl || '').replace(/\/$/, '')}/${raw.replace(/^\//, '')}`);

  const hrefFallback =
    fb &&
    (fb.startsWith('http://') || fb.startsWith('https://')
      ? fb
      : `${(CONFIG.serverUrl || '').replace(/\/$/, '')}/${fb.replace(/^\//, '')}`);

  const exhaustedDirect =
    directCandidates.length > 0 && directIdx >= directCandidates.length;

  return (
    <Box className="mt-3 flex flex-col gap-2">
      {directIdx < directCandidates.length ? (
        <img
          key={`${directCandidates[directIdx]}-${directIdx}`}
          src={directCandidates[directIdx]}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-32 max-w-[280px] rounded-lg border border-border/60 object-contain bg-muted"
          onError={() => setDirectIdx((i) => i + 1)}
          onLoad={() => {
            const u = directCandidates[directIdx];
            setUsedGalleryFallback(!!(raw && fb && u && !primaryUrlSet.has(u)));
          }}
        />
      ) : exhaustedDirect ? (
        <Typography variant="caption" className="text-destructive">
          Preview unavailable (file may be missing or blocked).
        </Typography>
      ) : null}
      {usedGalleryFallback && fb ? (
        <Typography variant="caption" className="text-muted-foreground">
          Showing first gallery image — the saved URL (e.g. under /tmp/) could not be loaded as preview.
        </Typography>
      ) : null}
      <Typography variant="caption" className="text-muted-foreground">
        {label}
      </Typography>
      {hrefPrimary ? (
        <a
          href={hrefPrimary}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary break-all hover:underline"
        >
          Open saved image URL in new tab
        </a>
      ) : null}
      {hrefFallback && hrefFallback !== hrefPrimary ? (
        <a
          href={hrefFallback}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground break-all hover:underline"
        >
          Open fallback / gallery image URL
        </a>
      ) : null}
    </Box>
  );
}

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

/**
 * Build `attributes_values_ids` from the variant's own `attributes` rows (one value per attribute type).
 * Do **not** loop every `categoryAttributes` row — some APIs expose the same attribute once per value
 * or duplicate rows, which previously produced many IDs for a single "Size" and broke variant identity.
 */
function resolveVariantAttributeValueIds(
  v: { attributes?: Array<{ attribute: string; value: string }> },
  categoryAttrs: any[]
): number[] {
  // Last row wins per attribute label (API sometimes repeats the same attribute many times).
  const lastRowByLabel = new Map<string, { attribute: string; value: string }>();
  for (const row of v.attributes ?? []) {
    const label = String((row as { attribute?: string }).attribute ?? '').trim();
    if (!label) continue;
    lastRowByLabel.set(label.toLowerCase(), row as { attribute: string; value: string });
  }

  const ids: number[] = [];
  for (const row of lastRowByLabel.values()) {
    const label = String(row.attribute ?? '').trim();
    const attr = categoryAttrs.find((ca: any) => categoryAttrLabelMatches(ca, label));
    if (!attr) continue;

    const rawVal =
      typeof row === 'object' && row != null && 'value' in row
        ? String((row as { value?: string }).value ?? '')
        : '';
    const idFound = findAttributeValueId(attr, rawVal);
    if (idFound != null && !Number.isNaN(idFound)) {
      ids.push(idFound);
    }
  }

  return ids;
}

export default function CreatePage() {
  const { t, i18n } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainCategoryId, setMainCategoryId] = useState(0);
  const productImagesInputId = useId();
  const thumbnailInputId = useId();
  const seoImageInputId = useId();

  // Fetch dependencies
  const { data: productResponse, isLoading: isLoadingProduct } = useFetchProductById(id || '');

  const editCategoryMetaId =
    isEditMode && productResponse?.category?.id
      ? Number(productResponse.category.id)
      : 0;
  const { data: editCategoryResp } = useFetchCategoryById(
    editCategoryMetaId > 0 ? editCategoryMetaId : ''
  );

  const { data: iconsListResponse } = useQuery({
    queryKey: ['icons', 'product-form'],
    queryFn: () =>
      axiosInstance.get(apiRoutes.icon.list, { params: { per_page: 200 } }).then((r) => r.data),
  });
  const iconOptions: any[] = (() => {
    const raw = iconsListResponse as any;
    if (!raw) return [];
    return raw.data?.data ?? raw.data?.items ?? (Array.isArray(raw.data) ? raw.data : []) ?? [];
  })();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateVariantMutation = useUpdateProductVariant();
  const deleteVariantMutation = useDeleteProductVariant();

  const defaultValues: ProductFormValues = {
    category_id: 0,
    brand_id: 0,
    vendor_scope: 'internal',
    vendor_id: INTERNAL_VENDOR_ID,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    full_description: { en: '', ar: '' },
    country_id: 0,
    sale_country_id: 0,
    price: 0,
    discount: 0,
    discount_type: 'none',
    cost_price: undefined,
    quantity: 0,
    unit: '',
    warranty_period: undefined,
    sku: '',
    model: '',
    barcode: '',
    time_prepare: '',
    is_instant_delivery: 0,
    is_visible: 1,
    thumbnail: undefined,
    images: [],
    existing_media_ids: [],
    seo_title: { en: '', ar: '' },
    seo_description: { en: '', ar: '' },
    seo_keywords: { en: '', ar: '' },
    seo_image: undefined,
    badges: [],
    icon_ids: [],
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

  useEffect(() => {
    setMainCategoryId(0);
  }, [id]);

  useEffect(() => {
    if (!isEditMode || editCategoryMetaId <= 0) return;
    const d = editCategoryResp?.data;
    if (!d || Number(d.id) !== editCategoryMetaId) return;
    const pid = d.parent_id != null && Number(d.parent_id) > 0 ? Number(d.parent_id) : null;
    setMainCategoryId(pid ?? Number(d.id));
  }, [isEditMode, editCategoryMetaId, editCategoryResp?.data]);

  const categoryId = watch('category_id');
  const imagesFiles = watch('images');
  const existingMediaIds = watch('existing_media_ids') ?? [];
  const watchedVariants = watch('variants') || [];
  const watchedBoughtWith = watch('bought_with') || [];
  const vendorScope = watch('vendor_scope');
  const watchedVendorId = watch('vendor_id');
  const effectiveShopVendorId =
    vendorScope === 'internal' ? INTERNAL_VENDOR_ID : Number(watchedVendorId) || 0;
  const { data: shopsResponse } = useFetchShops(1, 100, {
    vendorId: effectiveShopVendorId > 0 ? effectiveShopVendorId : undefined,
    enabled: effectiveShopVendorId > 0,
  });
  const shops = (shopsResponse as any)?.data?.items ?? [];

  /** When external vendor changes after load, clear shop rows (shop list is per-vendor). */
  const skipInitialExternalVendorIdEffect = useRef(true);
  useEffect(() => {
    if (vendorScope !== 'external') return;
    if (skipInitialExternalVendorIdEffect.current) {
      skipInitialExternalVendorIdEffect.current = false;
      return;
    }
    setValue('shop_variants', []);
  }, [watchedVendorId, vendorScope, setValue]);

  const { data: subcategoriesListResp, isLoading: isLoadingSubCats } = useFetchCategories(
    1,
    10,
    mainCategoryId > 0 ? { category_id: mainCategoryId } : undefined,
    { enabled: mainCategoryId > 0 }
  );

  const hasChildCategories = useMemo(() => {
    if (mainCategoryId <= 0) return false;
    const items = subcategoriesListResp?.data?.items ?? [];
    const total = subcategoriesListResp?.data?.pagination?.total;
    if (typeof total === 'number') return total > 0;
    return items.length > 0;
  }, [mainCategoryId, subcategoriesListResp]);

  const mainCategoryInitialLabel = useMemo(() => {
    if (!isEditMode || editCategoryMetaId <= 0 || !editCategoryResp?.data) return undefined;
    const d = editCategoryResp.data;
    if (Number(d.id) !== editCategoryMetaId) return undefined;
    const pid = d.parent_id != null && Number(d.parent_id) > 0 ? Number(d.parent_id) : null;
    if (pid && d.parent) {
      return typeof d.parent.name === 'string'
        ? d.parent.name
        : formatTranslated(d.parent.name as any);
    }
    return formatTranslated(d.name);
  }, [isEditMode, editCategoryMetaId, editCategoryResp?.data]);

  const childCategoryFetcher = useMemo(
    () => (page: number, limit: number) =>
      _CategoryApi.getListCategoriesPaginated({
        page,
        per_page: limit,
        category_id: mainCategoryId,
      }).then((r) => ({
        data: {
          items: r.data.items.map((cat) => ({
            id: cat.id,
            label: formatTranslated(cat.name as any),
          })),
          pagination: r.data.pagination,
        },
      })),
    [mainCategoryId]
  );

  useEffect(() => {
    if (mainCategoryId <= 0 || isLoadingSubCats) return;
    if (!hasChildCategories) {
      setValue('category_id', mainCategoryId);
    }
  }, [mainCategoryId, hasChildCategories, isLoadingSubCats, setValue]);

  // Fetch category attributes when category changes
  const { data: categoryAttributesAll, isLoading: isLoadingAttributes } =
    useFetchCategoryAttributes(categoryId ? Number(categoryId) : undefined, 1, 100, {
      requireCategoryId: true,
    });
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

  const categoryIdNum = categoryId ? Number(categoryId) : 0;

  // Related products: same category only (requires category_id on the product)
  const {
    data: allProductsResponse,
    isSuccess: boughtWithListReady,
    isFetching: isFetchingBoughtWithList,
  } = useQuery({
    queryKey: ['product', 'list-for-select', categoryIdNum],
    queryFn: () =>
      axiosInstance
        .get(apiRoutes.product.list, {
          params: { per_page: 200, category_id: categoryIdNum },
        })
        .then((r) => r.data),
    enabled: categoryIdNum > 0,
  });
  const allProducts: any[] = useMemo(
    () => allProductsResponse?.data?.data ?? allProductsResponse?.data?.items ?? [],
    [allProductsResponse]
  );

  useEffect(() => {
    if (categoryIdNum <= 0 || !boughtWithListReady || isFetchingBoughtWithList) return;
    const allowed = new Set(allProducts.map((p: any) => Number(p.id)));
    const current = getValues('bought_with') ?? [];
    const next = current.filter((pid: number) => allowed.has(Number(pid)));
    if (next.length !== current.length) {
      setValue('bought_with', next, { shouldDirty: true });
    }
  }, [
    categoryIdNum,
    boughtWithListReady,
    isFetchingBoughtWithList,
    allProducts,
    getValues,
    setValue,
  ]);

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
      const sk = p.seo_keywords as { en?: string[]; ar?: string[] } | null | undefined;
      reset({
        category_id: Number(p.category?.id) || 0,
        brand_id: Number(p.brand?.id) || 0,
        vendor_scope:
          Number(p.vendor?.id) === INTERNAL_VENDOR_ID ? 'internal' : 'external',
        vendor_id: Number(p.vendor?.id) || 0,
        name: { en: p.name?.en ?? '', ar: p.name?.ar ?? '' },
        description: { en: p.description?.en ?? '', ar: p.description?.ar ?? '' },
        full_description: { en: p.full_description?.en ?? '', ar: p.full_description?.ar ?? '' },
        country_id:
          p.country_id != null && String(p.country_id) !== ''
            ? Number(p.country_id)
            : p.origin_country?.id != null
              ? Number(p.origin_country.id)
              : p.country && typeof p.country === 'object' && 'id' in p.country && (p.country as { id?: number }).id != null
                ? Number((p.country as { id: number }).id)
                : 0,
        sale_country_id:
          p.sale_country_id != null && String(p.sale_country_id) !== ''
            ? Number(p.sale_country_id)
            : p.sale_country?.id != null
              ? Number(p.sale_country.id)
              : 0,
        price: Number(p.price) || 0,
        discount: p.discount != null ? Number(p.discount) : 0,
        discount_type: (p.discount_type as 'none' | 'percentage' | 'fixed') || 'none',
        cost_price: p.cost_price != null ? Number(p.cost_price) : undefined,
        quantity: Number(p.quantity) || 0,
        unit: p.unit ?? '',
        warranty_period: p.warranty_period != null ? Number(p.warranty_period) : undefined,
        sku: p.sku ?? '',
        model: p.model ?? '',
        barcode: p.barcode ?? '',
        time_prepare: p.time_prepare ?? '',
        is_instant_delivery: p.is_instant_delivery ? 1 : 0,
        is_visible: p.is_visible === false || p.is_visible === 0 ? 0 : 1,
        thumbnail: undefined,
        images: [],
        existing_media_ids:
          p.images?.map((img: any) => Number(img.id)).filter((mediaId) => !Number.isNaN(mediaId)) ?? [],
        seo_title: { en: p.seo_title?.en ?? '', ar: p.seo_title?.ar ?? '' },
        seo_description: { en: p.seo_description?.en ?? '', ar: p.seo_description?.ar ?? '' },
        seo_keywords: {
          en: Array.isArray(sk?.en) ? sk!.en!.join(', ') : '',
          ar: Array.isArray(sk?.ar) ? sk!.ar!.join(', ') : '',
        },
        seo_image: undefined,
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
            price: ed.price != null ? Number(ed.price) : undefined,
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
        icon_ids: (p.icons ?? []).map((ic) => ic.id),
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
    const currentVariants = getValues('variants') ?? [];
    const mappedVariants = p.variants!.map((v) => {
      const ids = resolveVariantAttributeValueIds(v, categoryAttributes);
      const prev = currentVariants.find((c: any) => Number(c?.id) === Number(v.id));
      const prevFiles = Array.isArray(prev?.images)
        ? (prev!.images as unknown[]).filter((f): f is File => f instanceof File)
        : [];
      return {
        id: v.id,
        attributes_values_ids: ids,
        images: prevFiles,
        existing_images_ids:
          prev && Array.isArray(prev.existing_images_ids)
            ? prev.existing_images_ids
            : (v.images ?? []).map((img: any) => Number(img.id)).filter((mediaId) => !Number.isNaN(mediaId)) ?? [],
      };
    });
    // Only lock the guard if ALL variants got at least one attribute id resolved.
    // If mapping partially failed, keep the door open to retry when categoryAttributes refreshes.
    const allMapped = mappedVariants.every((mv) => mv.attributes_values_ids.length > 0);
    setValue('variants', mappedVariants);
    if (allMapped) {
      variantsFixedRef.current = id;
    }
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

  // Map product variant.attributes → value IDs (one per attribute type; same rules as resolveVariantAttributeValueIds).
  const mapVariantsToAttributeIds = (
    variants: Array<{ id?: number; attributes?: Array<{ attribute: string; value: string }>; images?: File[] }>,
    attrs: any[]
  ) =>
    variants.map((v) => ({
      id: v.id,
      attributes_values_ids: resolveVariantAttributeValueIds(v, attrs),
      images: (v as any).images ?? [],
    }));

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const live = getValues();
      const imagesFromForm = filterFileList(getValues('images'));
      const imagesFromParsed = filterFileList(data.images);
      // Edit mode: validation can pass via existing_media_ids while zod omits new Files from `data`
      const mergedProductImages =
        imagesFromForm.length > 0 ? imagesFromForm : imagesFromParsed;

      const liveVariantsFull = getValues('variants') ?? [];
      // Nested File[] in field arrays is sometimes missing from `data` — use live state for uploads
      let payload: ProductFormValues = {
        ...data,
        images: mergedProductImages,
        existing_media_ids: resolveExistingMediaIdsForPayload(
          live,
          data,
          isEditMode,
          productResponse
        ),
        thumbnail: live.thumbnail ?? data.thumbnail,
        seo_image: live.seo_image ?? data.seo_image,
        icon_ids: live.icon_ids ?? data.icon_ids,
        variants: (data.variants ?? []).map((dv, i) => {
          const dvId = (dv as { id?: number }).id;
          const lv =
            dvId != null && liveVariantsFull.length
              ? liveVariantsFull.find((x) => Number((x as { id?: number }).id) === Number(dvId))
              : liveVariantsFull[i];
          if (!lv) {
            return {
              ...dv,
              images: filterFileList((dv as { images?: unknown }).images),
              existing_images_ids: resolveVariantExistingImageIds(
                undefined,
                dv as { existing_images_ids?: number[] },
                dvId,
                isEditMode,
                productResponse
              ),
            };
          }
          const lvFiles = filterFileList(lv.images);
          const dvFiles = filterFileList(dv.images);
          const mergedVariantImages = lvFiles.length > 0 ? lvFiles : dvFiles;
          return {
            ...dv,
            ...lv,
            images: mergedVariantImages,
            existing_images_ids: resolveVariantExistingImageIds(
              lv as { existing_images_ids?: number[] },
              dv as { existing_images_ids?: number[] },
              dvId,
              isEditMode,
              productResponse
            ),
          };
        }),
      };

      console.log('[Product Form] Validation passed, submitting:', payload);

      // In edit mode: ensure variants have attributes_values_ids (full payload - changed + unchanged)
      if (isEditMode && productResponse && (payload.variants?.length ?? 0) > 0) {
        const enrichedFromApi = categoryAttributes.length > 0
          ? mapVariantsToAttributeIds(
              productResponse.variants?.map((v) => ({
                id: v.id,
                attributes: v.attributes,
              })) ?? [],
              categoryAttributes
            )
          : [];
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
        const orphanIdx = (payload.variants ?? []).findIndex(
          (v) =>
            ((v.images?.length ?? 0) > 0 || (v.existing_images_ids?.length ?? 0) > 0) &&
            (!Array.isArray(v.attributes_values_ids) || v.attributes_values_ids.length === 0)
        );
        toast.error(
          `Variant #${orphanIdx + 1} has images but no attributes selected. Select at least one attribute (e.g. size or color) so variant images are included in the request.`
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
        const emptyIdx = (payload.variants ?? []).findIndex(
          (v) => !Array.isArray(v.attributes_values_ids) || v.attributes_values_ids.length === 0
        );
        const isExisting = (payload.variants ?? [])[emptyIdx]?.id != null;
        toast.error(
          isExisting
            ? `Variant #${emptyIdx + 1} (existing) could not load its attributes automatically — please re-select its attributes manually before saving.`
            : `Variant #${emptyIdx + 1} has no attributes selected. Select at least one attribute or remove the empty row.`
        );
        return;
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
      let thumb = finalPayload.thumbnail;
      if (thumb instanceof File) thumb = await compressImage(thumb);
      let seoImg = finalPayload.seo_image;
      if (seoImg instanceof File) seoImg = await compressImage(seoImg);
      const uploadPayload: ProductFormValues = {
        ...finalPayload,
        images: productImagesCompressed,
        variants: variantsCompressed,
        thumbnail: thumb,
        seo_image: seoImg,
      };
      const { vendor_scope: _omitVendorScope, ...apiPayload } = uploadPayload;

      if (isEditMode && id) {
        console.log('[Product Form] Sending update payload:', { id, data: apiPayload });
        await updateProductMutation.mutateAsync({
          id,
          data: apiPayload as ProductCreateUpdatePayload,
        });
        toast.success(t('form.productUpdatedSuccess'));
      } else {
        console.log('[Product Form] Sending create payload:', apiPayload);
        await createProductMutation.mutateAsync(apiPayload as ProductCreateUpdatePayload);
        toast.success(t('form.productCreatedSuccess'));
      }
      navigate(paths.dashboard.products);
    } catch (error: any) {
      console.error('[Product Form] Submit error:', error);
      console.error('[Product Form] Error response:', error?.response?.data);
      console.error('[Product Form] Error message:', error?.message);
      toast.error(error?.message || t('form.productSaveFailed'));
    }
  };

  const toggleBoughtWith = (productId: number) => {
    const current = watchedBoughtWith;
    const next = current.includes(productId)
      ? current.filter((pid) => pid !== productId)
      : [...current, productId];
    setValue('bought_with', next, { shouldDirty: true });
  };

  const watchedIconIds = watch('icon_ids') ?? [];
  const toggleIcon = (iconId: number) => {
    const current = watchedIconIds;
    const next = current.includes(iconId)
      ? current.filter((x) => x !== iconId)
      : [...current, iconId];
    setValue('icon_ids', next, { shouldDirty: true });
  };

  const [productFormTab, setProductFormTab] = useState<string>('basic');

  useEffect(() => {
    if (isEditMode && id) {
      document.title = `${t('form.productEditMetaTitle')} #${id} | ${CONFIG.appName}`;
    } else {
      document.title = `${t('form.productCreateMetaTitle')} | ${CONFIG.appName}`;
    }
  }, [isEditMode, id, t, i18n.language]);

  return (
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
          toast.error(msg || t('form.formValidationErrorGeneric'));
        })}
        onCancel={() => navigate(paths.dashboard.products)}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.productEditTitle') : t('form.productCreateTitle')}
        description={
          isEditMode ? t('form.productEditDescription') : t('form.productCreateDescription')
        }
        isEditMode={isEditMode}
        isLoading={isLoadingProduct}
        loadingText={t('form.loadingProduct')}
        maxWidth="6xl"
        infoText={
          isEditMode ? t('form.productEditInfo') : t('form.productCreateInfo')
        }
        submitLabel={isEditMode ? t('form.productSubmitUpdate') : t('form.productSubmitCreate')}
        submittingLabel={
          isEditMode ? t('form.productSubmittingUpdate') : t('form.productSubmittingCreate')
        }
      >
        <Tabs
          value={productFormTab}
          onChange={(v) => setProductFormTab(String(v))}
          variant="scrollable"
          className="mb-6"
        >
          <Tab value="basic" label={t('form.productFormTabBasic')} />
          <Tab value="variants" label={t('form.productFormTabVariants')} />
          <Tab value="seo" label={t('form.productFormTabSeo')} />
          <Tab value="extras" label={t('form.productFormTabExtras')} />
        </Tabs>

        {productFormTab === 'basic' && (
          <Box className="space-y-6">

        {/* ─── Brand ────────────────────────────────────────────── */}
        <Box className="group">
          <Box className="flex items-center justify-between gap-2 mb-2">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productBrand')}
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
              {t('form.productCreateBrand')}
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

        {/* ─── Vendor source (For me / Out) ─────────────────────── */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:shop-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.productVendorScope')}
            </Typography>
          </Box>
          <Controller
            name="vendor_scope"
            control={control}
            render={({ field }) => (
              <Box className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="w-4 h-4"
                    checked={field.value === 'internal'}
                    onChange={() => {
                      field.onChange('internal');
                      setValue('vendor_id', INTERNAL_VENDOR_ID);
                      setValue('shop_variants', []);
                    }}
                  />
                  {t('form.vendorScopeForMe')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="w-4 h-4"
                    checked={field.value === 'external'}
                    onChange={() => {
                      field.onChange('external');
                      setValue('vendor_id', 0);
                      setValue('shop_variants', []);
                    }}
                  />
                  {t('form.vendorScopeOut')}
                </label>
              </Box>
            )}
          />
          {vendorScope === 'external' && (
            <Box className="mt-3">
              <RHFInfiniteSelect
                name="vendor_id"
                queryKey={['vendors', 'infinite', 'product-form']}
                fetcher={vendorFetcher}
                placeholder={t('form.selectVendorRequired')}
                initialLabel={
                  productResponse?.vendor
                    ? formatTranslated(productResponse.vendor.name as any)
                    : undefined
                }
              />
            </Box>
          )}
        </Box>

        {/* ─── Name ─────────────────────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productNameEnRequired')}
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
                {t('form.productNameArRequired')}
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
                    placeholder={t('form.productNameArPlaceholder')}
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
                {t('form.productDescEnRequired')}
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
                {t('form.productDescArRequired')}
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
                    placeholder={t('form.productDescArPlaceholder')}
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

        {/* ─── Country of origin & country of sale ─────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center justify-between gap-2 mb-2">
              <Box className="flex items-center gap-2">
                <Iconify icon="solar:globe-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.countryOriginSelect')}
                </Typography>
              </Box>
              {/* <Button
                type="button"
                variant="text"
                size="small"
                onClick={() =>
                  window.open(`${paths.dashboard.root}${paths.dashboard.countries}/create`, '_blank')
                }
                className="text-primary -mr-2"
              >
                <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
                {t('form.countryCreateShort')}
              </Button> */}
            </Box>
            <RHFInfiniteSelect
              name="country_id"
              queryKey={['countries', 'infinite', 'product-form', 'origin']}
              fetcher={countryFetcher}
              placeholder={t('form.selectCountryOriginOptional')}
              pageSize={20}
              initialLabel={(() => {
                const oc = productResponse?.origin_country;
                if (oc?.name != null) {
                  return typeof oc.name === 'string' ? oc.name : formatTranslated(oc.name as any);
                }
                const c = productResponse?.country;
                if (
                  c &&
                  typeof c === 'object' &&
                  'name' in c &&
                  (c as { name?: string | { en: string; ar: string } }).name != null
                ) {
                  return formatTranslated(
                    (c as { name: string | { en: string; ar: string } }).name as any
                  );
                }
                return undefined;
              })()}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:map-point-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.countrySaleSelect')}
              </Typography>
            </Box>
            <RHFInfiniteSelect
              name="sale_country_id"
              queryKey={['sale-countries', 'infinite', 'product-form']}
              fetcher={saleCountryFetcher}
              placeholder={t('form.selectCountrySaleOptional')}
              pageSize={20}
              initialLabel={
                productResponse?.sale_country?.name
                  ? typeof productResponse.sale_country.name === 'string'
                    ? productResponse.sale_country.name
                    : formatTranslated(productResponse.sale_country.name as any)
                  : undefined
              }
            />
          </Box>
        </Box>

        {/* ─── Price, discount, cost ───────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:dollar-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productPriceRequired')}
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
                {t('form.productDiscountType')}
              </Typography>
            </Box>
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputCls}>
                  <option value="none">{t('form.discountTypeNone')}</option>
                  <option value="percentage">{t('form.discountTypePercentage')}</option>
                  <option value="fixed">{t('form.discountTypeFixed')}</option>
                </select>
              )}
            />
          </Box>
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-price-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productDiscountValue')}
              </Typography>
            </Box>
            <Controller
              name="discount"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    value={field.value ?? 0}
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
            <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
              {t('form.productCostPriceOptional')}
            </Typography>
            <Controller
              name="cost_price"
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
                {t('form.productQuantityRequired')}
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
                {t('form.productPrepTime')}
              </Typography>
            </Box>
            <Controller
              name="time_prepare"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.prepTimePlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
              {t('form.productUnitHint')}
            </Typography>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.unitPlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
              {t('form.productWarrantyMonths')}
            </Typography>
            <Controller
              name="warranty_period"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  placeholder="0"
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

        {/* ─── SKU / Model / Barcode ────────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productSku')}
              </Typography>
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
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productModel')}
              </Typography>
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
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productBarcode')}
              </Typography>
            </Box>
            <Controller
              name="barcode"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder={t('form.barcodePlaceholder')} className={inputCls} />
              )}
            />
          </Box>
        </Box>
        {/* ─── Product Images ───────────────────────────────────── */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-add-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.productImagesSection')}
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
                    {t('form.chooseFiles')}
                  </label>
                  <Typography component="span" variant="body2" color="secondary">
                    {Array.isArray(value) && value.length > 0
                      ? t('form.filesSelectedCount', { count: value.length })
                      : t('form.noFileChosen')}
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  className={error ? 'text-destructive mt-1 block' : 'text-muted-foreground mt-1 block'}
                >
                  {error?.message || t('form.productImagesHelper')}
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
                              aria-label={t('form.removeImageAria')}
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

        {/* ─── Thumbnail (optional) ─────────────────────────────── */}
        <Box className="group">
          <label className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.thumbnailOptional')}
            </Typography>
          </label>
          <Controller
            name="thumbnail"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <div>
                <input
                  id={thumbnailInputId}
                  ref={ref}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    onChange(f ?? undefined);
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor={thumbnailInputId}
                  className="inline-flex cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {t('form.chooseThumbnail')}
                </label>
                {value instanceof File ? (
                  <Typography variant="caption" className="ml-2">
                    {value.name}
                  </Typography>
                ) : null}
                <ExistingImagePreview
                  url={productResponse?.thumbnail}
                  label={t('form.currentThumbnailServer')}
                  active={isEditMode && !(value instanceof File)}
                  fallbackUrl={productResponse?.images?.[0]?.url}
                />
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
                  {t('form.productInstantDeliveryLabel')}
                </Typography>
              </Label>
            )}
          />
        </Box>

        <Box className="group">
          <Controller
            name="is_visible"
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
                  {t('form.visibleToCustomers')}
                </Typography>
              </Label>
            )}
          />
        </Box>

        {/* ─── Bought With ──────────────────────────────────────── */}
        <Box>
          <Box className="flex items-center gap-2 mb-4">
            <Iconify icon="solar:shop-bold" className="text-primary" width={20} />
            <Typography variant="h6" className="font-semibold text-foreground">
              {t('form.boughtWithTitle')}
            </Typography>
          </Box>
          {!categoryId || Number(categoryId) <= 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.selectCategoryFirstBoughtWith')}
            </Typography>
          ) : isFetchingBoughtWithList && allProducts.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('loading')}
            </Typography>
          ) : allProducts.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noProductsInCategoryBoughtWith')}
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
          </Box>
        )}

        {productFormTab === 'variants' && (
          <Box className="space-y-6">
        {/* ─── Category (main → sub / feature) ──────────────────── */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:folder-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.productCategorySection')}
            </Typography>
          </Box>
          <Box className="space-y-1">
            <Label className="text-sm font-medium">{t('form.productMainCategory')}</Label>
            <InfiniteScrollSelect
              value={mainCategoryId}
              onChange={(val) => {
                setMainCategoryId(val);
                setValue('category_id', 0);
                setValue('variants', []);
                setValue('category_details', []);
              }}
              queryKey={['categories', 'infinite', 'product-form', 'roots']}
              fetcher={mainCategoryFetcher}
              placeholder={t('form.selectMainCategory')}
              initialLabel={mainCategoryInitialLabel}
            />
          </Box>
          {hasChildCategories ? (
            <Box className="space-y-1 mt-4">
              <Label className="text-sm font-medium">{t('form.productSubcategory')}</Label>
              <RHFInfiniteSelect
                name="category_id"
                queryKey={['categories', 'infinite', 'product-form', 'children', mainCategoryId]}
                fetcher={childCategoryFetcher}
                placeholder={t('form.selectSubcategory')}
                initialLabel={
                  productResponse?.category?.name
                    ? formatTranslated(productResponse.category.name as any)
                    : undefined
                }
                disabled={!mainCategoryId}
                onValueChange={() => {
                  setValue('variants', []);
                  setValue('category_details', []);
                }}
              />
            </Box>
          ) : mainCategoryId > 0 && !isLoadingSubCats ? (
            <Typography variant="caption" className="text-muted-foreground block mt-2">
              {t('form.productCategoryUsesMainOnly')}
            </Typography>
          ) : null}
        </Box>

        {/* ─── Variants ─────────────────────────────────────────── */}
        <Box>
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:settings-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.variantsAttributesTitle')}
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
              {t('form.addVariant')}
            </Button>
          </Box>

          {!categoryId || categoryId === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.selectCategoryFirstAttributes')}
            </Typography>
          ) : isLoadingAttributes ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.loadingAttributes')}
            </Typography>
          ) : categoryAttributes.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noAttributesForCategory')}
            </Typography>
          ) : (
            <Box className="space-y-4">
              {variantsFields.map((variant, variantIndex) => (
                <Box key={variant.id} className="p-4 border border-border rounded-lg space-y-4">
                  <Box className="flex items-center justify-between">
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.variantIndex', { n: variantIndex + 1 })}
                    </Typography>
                    <Button
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                      {t('form.remove')}
                    </Button>
                  </Box>

                  {/* Attribute selects / color picker */}
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAttributes.map((attr: any) => {
                      const attrNameLabel =
                        typeof attr.name === 'object' ? attr.name?.en ?? attr.name?.ar : attr.name;
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
                                {t('form.selectAttribute', { name: String(attrNameLabel ?? '') })}
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
                      {t('form.variantImagesOptional')}
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
                                {t('form.chooseFiles')}
                              </label>
                              <Typography component="span" variant="body2" color="secondary">
                                {Array.isArray(value) && value.length > 0
                                  ? t('form.filesSelectedCount', { count: value.length })
                                  : t('form.noFileChosen')}
                              </Typography>
                            </div>
                          </>
                        );
                      }}
                    />
                    <Typography variant="caption" className="text-muted-foreground mt-1 block">
                      {t('form.variantImagesHelper')}
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
                                aria-label={t('form.removeVariantImageAria')}
                              >
                                <Iconify icon="solar:close-circle-bold" width={18} />
                              </button>
                            </Box>
                          ))}
                        </Box>
                      );
                    })()}
                  </Box>

                  {/* ─── Variant Extra Fields (SKU, Name, Stock, Purchase Qty, Delivery) ─── */}
                  <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-border pt-4">
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantSku')}
                      </Typography>
                      <input
                        type="text"
                        placeholder={t('form.variantSkuPlaceholder')}
                        className={inputCls}
                        defaultValue={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? (productResponse.variants[variantIndex] as any)?.sku ?? ''
                            : ''
                        }
                        data-variant-field={`sku-${variantIndex}`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantNameEn')}
                      </Typography>
                      <input
                        type="text"
                        placeholder={t('form.variantNameEnPlaceholder')}
                        className={inputCls}
                        defaultValue={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? (productResponse.variants[variantIndex] as any)?.name?.en ?? ''
                            : ''
                        }
                        data-variant-field={`name-en-${variantIndex}`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantNameAr')}
                      </Typography>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={t('form.variantNameArPlaceholder')}
                        className={inputCls}
                        defaultValue={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? (productResponse.variants[variantIndex] as any)?.name?.ar ?? ''
                            : ''
                        }
                        data-variant-field={`name-ar-${variantIndex}`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantStock')}
                      </Typography>
                      <input
                        type="number"
                        placeholder={t('form.variantStockPlaceholder')}
                        className={inputCls}
                        defaultValue={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? (productResponse.variants[variantIndex] as any)?.stock ?? ''
                            : ''
                        }
                        data-variant-field={`stock-${variantIndex}`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantMaxPurchaseQuantity')}
                      </Typography>
                      <input
                        type="number"
                        placeholder={t('form.variantMaxPurchaseQuantityPlaceholder')}
                        className={inputCls}
                        defaultValue={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? (productResponse.variants[variantIndex] as any)?.max_purchase_quantity ?? ''
                            : ''
                        }
                        data-variant-field={`max-purchase-qty-${variantIndex}`}
                      />
                      <Typography variant="caption" className="text-muted-foreground mt-1 block">
                        {t('form.variantMaxPurchaseQuantityHint')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantDeliveryTime')}
                      </Typography>
                      {vendorScope === 'internal' ? (
                        <Box>
                          <input
                            type="text"
                            className={`${inputCls} bg-muted`}
                            value={t('form.variantDeliveryTimeAuto')}
                            readOnly
                            data-variant-field={`delivery-time-${variantIndex}`}
                          />
                          <Typography variant="caption" className="text-muted-foreground mt-1 block">
                            {t('form.variantDeliveryTimeHint')}
                          </Typography>
                        </Box>
                      ) : (
                        <input
                          type="text"
                          placeholder={t('form.variantDeliveryTimePlaceholder')}
                          className={inputCls}
                          defaultValue={
                            isEditMode && productResponse?.variants?.[variantIndex]
                              ? (productResponse.variants[variantIndex] as any)?.delivery_time ?? ''
                              : ''
                          }
                          data-variant-field={`delivery-time-${variantIndex}`}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* ─── Variant Save / Delete (edit mode only) ─── */}
                  {isEditMode && watch(`variants.${variantIndex}.id`) && (
                    <Box className="flex items-center gap-2 border-t border-border pt-3">
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={updateVariantMutation.isPending}
                        onClick={async () => {
                          const variantId = watch(`variants.${variantIndex}.id`);
                          if (!variantId) return;
                          const card = document.querySelector(`[data-variant-field="sku-${variantIndex}"]`)?.closest('.space-y-4');
                          const getField = (name: string) =>
                            (card?.querySelector(`[data-variant-field="${name}-${variantIndex}"]`) as HTMLInputElement)?.value ?? '';
                          try {
                            await updateVariantMutation.mutateAsync({
                              id: variantId,
                              data: {
                                attributes_values_ids: watch(`variants.${variantIndex}.attributes_values_ids`) || [],
                                existing_images_ids: watch(`variants.${variantIndex}.existing_images_ids`) || [],
                                sku: getField('sku'),
                                name: { en: getField('name-en'), ar: getField('name-ar') },
                                stock: Number(getField('stock')) || 0,
                                max_purchase_quantity: Number(getField('max-purchase-qty')) || 0,
                                delivery_time: vendorScope === 'internal' ? '12 - 48 ساعة' : getField('delivery-time'),
                              },
                            });
                            toast.success(t('form.variantSaveSuccess'));
                          } catch {
                            toast.error(t('form.variantSaveFailed'));
                          }
                        }}
                      >
                        <Iconify icon="solar:diskette-bold" width={16} className="mr-1" />
                        {updateVariantMutation.isPending ? t('form.savingVariant') : t('form.saveVariant')}
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        size="small"
                        className="text-destructive"
                        disabled={deleteVariantMutation.isPending}
                        onClick={async () => {
                          const variantId = watch(`variants.${variantIndex}.id`);
                          if (!variantId) return;
                          if (!window.confirm(t('form.variantDeleteConfirm'))) return;
                          try {
                            await deleteVariantMutation.mutateAsync(variantId);
                            removeVariant(variantIndex);
                            toast.success(t('form.variantDeleteSuccess'));
                          } catch {
                            toast.error(t('form.variantDeleteFailed'));
                          }
                        }}
                      >
                        <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                        {t('form.deleteVariant')}
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {/* ─── Category Details ─────────────────────────────────── */}
        <Box>
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:list-check-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.categoryDetailsTitle')}
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
                {t('form.addDetail')}
              </Button>
            )}
          </Box>

          {!categoryId || categoryId === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.selectCategoryFirstDetails')}
            </Typography>
          ) : availableCategoryDetails.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noCategoryDetailsForCategory')}
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
                        <input
                          {...f}
                          dir="rtl"
                          placeholder={t('form.categoryDetailValueArPlaceholder')}
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

        {/* ─── Extra Details ────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:add-circle-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.extraDetailsTitle')}
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
                  price: undefined,
                })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addDetail')}
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
                        placeholder={t('form.extraDetailKeyArPlaceholder')}
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
                        placeholder={t('form.extraDetailValueArPlaceholder')}
                        className={inputCls}
                      />
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.price`}
                    control={control}
                    render={({ field: f }) => (
                      <input
                        {...f}
                        type="number"
                        placeholder={t('form.extraPriceOptional')}
                        value={f.value ?? ''}
                        onChange={(e) =>
                          f.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
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
                    {t('form.remove')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ─── Shop Variants ────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:shop-2-bold" className="text-primary" width={20} />
              <Typography variant="h6" className="font-semibold text-foreground">
                {t('form.shopVariantsTitle')}
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
                {t('form.addShopVariant')}
              </Button>
            )}
          </Box>

          {watchedVariants.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.addVariantsFirstShop')}
            </Typography>
          ) : shops.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noShopsAvailable')}
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
                      {t('form.shop')}
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
                      {t('form.variant')}
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
                              {t('form.variantOption', { n: vi + 1 })}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      {t('form.priceLabel')}
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
                      {t('form.quantity')}
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
          </Box>
        )}

        {productFormTab === 'seo' && (
          <Box className="space-y-6">
        {/* ─── SEO ──────────────────────────────────────────────── */}
        <Box>
          <Typography variant="h6" className="font-semibold text-foreground mb-4">
            {t('form.seoTitle')}
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="seo_title.en"
              control={control}
              render={({ field }) => (
                <input {...field} placeholder={t('form.seoTitleEnPlaceholder')} className={inputCls} />
              )}
            />
            <Controller
              name="seo_title.ar"
              control={control}
              render={({ field }) => (
                <input {...field} dir="rtl" placeholder={t('form.seoTitleArPlaceholder')} className={inputCls} />
              )}
            />
            <Controller
              name="seo_description.en"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder={t('form.seoDescEnPlaceholder')}
                  className={inputCls + ' min-h-[80px]'}
                />
              )}
            />
            <Controller
              name="seo_description.ar"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  dir="rtl"
                  placeholder={t('form.seoDescArPlaceholder')}
                  className={inputCls + ' min-h-[80px]'}
                />
              )}
            />
            <Controller
              name="seo_keywords.en"
              control={control}
              render={({ field }) => (
                <input {...field} placeholder={t('form.seoKeywordsEnPlaceholder')} className={inputCls} />
              )}
            />
            <Controller
              name="seo_keywords.ar"
              control={control}
              render={({ field }) => (
                <input {...field} dir="rtl" placeholder={t('form.seoKeywordsArPlaceholder')} className={inputCls} />
              )}
            />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="mb-2">
              {t('form.seoImageOptional')}
            </Typography>
            <Controller
              name="seo_image"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <div>
                  <input
                    id={seoImageInputId}
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      onChange(f ?? undefined);
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor={seoImageInputId} className="inline-flex cursor-pointer rounded-lg border border-border px-3 py-2 text-sm">
                    {t('form.chooseSeoImage')}
                  </label>
                  {value instanceof File ? (
                    <Typography variant="caption" className="ml-2">
                      {(value as File).name}
                    </Typography>
                  ) : null}
                  <ExistingImagePreview
                    url={productResponse?.seo_image}
                    label={t('form.currentSeoImage')}
                    active={isEditMode && !(value instanceof File)}
                    fallbackUrl={productResponse?.images?.[0]?.url}
                  />
                </div>
              )}
            />
          </Box>
        </Box>
          </Box>
        )}

        {productFormTab === 'extras' && (
          <Box className="space-y-6">
        {/* ─── Badges ────────────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">

             <Typography variant="h6" className="font-semibold text-foreground">
              {t('form.badgesTitle')}
            </Typography>
          <RHFBadgeSelector name="badges" />
        </Box>

        {/* ─── Icons ─────────────────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Typography variant="h6" className="font-semibold text-foreground mb-4">
            {t('form.iconsTitle')}
          </Typography>
          {iconOptions.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.noIconsLoaded')}
            </Typography>
          ) : (
            <Box className="flex flex-wrap gap-2">
              {iconOptions.map((ic: any) => {
                const iid = Number(ic.id);
                const label = typeof ic.name === 'object' ? ic.name?.en ?? ic.name?.ar : ic.name;
                const selected = watchedIconIds.includes(iid);
                return (
                  <Label
                    key={iid}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                      selected ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleIcon(iid)}
                      className="w-4 h-4"
                    />
                    {ic.icon || ic.image ? (
                      <img src={ic.icon || ic.image} alt="" className="w-6 h-6 object-contain" />
                    ) : null}
                    <span>{label ?? `#${iid}`}</span>
                  </Label>
                );
              })}
            </Box>
          )}
        </Box>

        {/* ─── Full Description ─────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:document-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productFullDescEn')}
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
                {t('form.productFullDescAr')}
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
                  placeholder={t('form.fullDescArPlaceholder')}
                  dir="rtl"
                />
              )}
            />
          </Box>
        </Box>
        </Box>
          </Box>
        )}
      </CreateFormLayout>
  );
}
