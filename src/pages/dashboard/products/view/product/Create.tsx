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
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { compressImage, compressImages } from '@/utils/compress-image';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _CountryApi } from '@/pages/dashboard/countries/api/country.services';
import { useId, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import { _SaleCountryApi } from '@/pages/dashboard/sale-countries/api/sale-country.services';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import {
  useFetchCategories,
  useFetchCategoryById,
} from '@/pages/dashboard/categories/hooks/category';
import { useFetchCurrencies } from '@/pages/dashboard/currencies/hooks/currency';
import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
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
  useUpdateShopProductVariant,
  useDeleteShopProductVariant,
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

type CategoryDetailValueOption = { en: string; ar: string };

function normalizeCategoryDetailValueOptions(raw: unknown): CategoryDetailValueOption[] {
  if (!Array.isArray(raw)) return [];
  const out: CategoryDetailValueOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const en = o.en != null ? String(o.en) : '';
    const ar = o.ar != null ? String(o.ar) : '';
    if (en.trim() === '' && ar.trim() === '') continue;
    out.push({ en, ar });
  }
  return out;
}

function categoryDetailOptionKey(opt: CategoryDetailValueOption): string {
  return JSON.stringify({ en: opt.en, ar: opt.ar });
}

function findCategoryDetailOptionKey(
  detailValue: { en: string; ar: string } | undefined,
  opts: CategoryDetailValueOption[]
): string {
  if (!detailValue || opts.length === 0) return '';
  const found = opts.find((o) => o.en === detailValue.en && o.ar === detailValue.ar);
  return found ? categoryDetailOptionKey(found) : '';
}

/** Paginate static attribute value lists for InfiniteScrollSelect (e.g. many colors). */
function createAttributeValuesFetcher(values: any[] | undefined) {
  const vals = (values ?? []).filter((v) => v != null);
  return (page: number, limit: number) => {
    const items = vals.map((v: any) => ({
      id: Number(v.id),
      label:
        typeof v.name === 'object'
          ? (v.name?.en ?? v.name?.ar ?? String(v.id))
          : String(v.name ?? v.id),
    }));
    const total = items.length;
    const last_page = Math.max(1, Math.ceil(total / limit) || 1);
    const start = (page - 1) * limit;
    const slice = items.slice(start, start + limit);
    return Promise.resolve({
      data: {
        items: slice,
        pagination: {
          current_page: page,
          last_page,
          per_page: limit,
          total,
        },
      },
    });
  };
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

function fieldInputClass(error?: boolean) {
  return error
    ? `${inputCls} border-destructive focus:ring-destructive/40`
    : inputCls;
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="text-destructive mt-1 block">
      {message}
    </Typography>
  );
}

function parseCurrencyRate(c: CurrencyData): number {
  const r = Number((c as { exchange_rate?: string | number }).exchange_rate);
  return r > 0 ? r : 1;
}

/** `exchange_rate` is units of this currency per 1 USD → USD = local / rate. */
function localAmountToUsd(local: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return local / r;
}

function usdToLocalAmount(usd: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return usd * r;
}

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
  const { t } = useTranslation('table');
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
          {t('form.productImagePreviewUnavailable')}
        </Typography>
      ) : null}
      {usedGalleryFallback && fb ? (
        <Typography variant="caption" className="text-muted-foreground">
          {t('form.productImagePreviewGalleryFallback')}
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
          {t('form.productImageOpenSavedUrl')}
        </a>
      ) : null}
      {hrefFallback && hrefFallback !== hrefPrimary ? (
        <a
          href={hrefFallback}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground break-all hover:underline"
        >
          {t('form.productImageOpenFallbackUrl')}
        </a>
      ) : null}
    </Box>
  );
}

/** API returns `attribute` in one locale (often AR); category `name` may be {en, ar} — match any. */
function categoryAttrLabelMatches(attr: any, apiAttributeLabel: string): boolean {
  const api = String(apiAttributeLabel ?? '').trim().toLowerCase();
  if (!api) return false;
  if (typeof attr?.name === 'object' && attr.name) {
    const en = String(attr.name.en ?? '').trim().toLowerCase();
    const ar = String(attr.name.ar ?? '').trim().toLowerCase();
    if (api === en || api === ar) return true;
  }
  return api === String(attr?.name ?? '').trim().toLowerCase();
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
 * Prefers `value_id` (or `id`) on each attribute row — the same field the API returns and Details.tsx uses.
 * Falls back to string-label matching against categoryAttributes only when those direct IDs are absent.
 */
function resolveVariantAttributeValueIds(
  v: { attributes?: Array<{ attribute: string; value: string }> },
  categoryAttrs: any[]
): number[] {
  const attrs = (v.attributes ?? []) as any[];

  // Fast path: every row already has a resolved value ID — use them directly.
  const directIds = attrs
    .map((a: any) => {
      const vid = a.value_id ?? a.id;
      return vid != null && !Number.isNaN(Number(vid)) ? Number(vid) : null;
    })
    .filter((id): id is number => id !== null);

  if (directIds.length > 0 && directIds.length === attrs.length) {
    return [...new Set(directIds)];
  }

  // Slow path: string-label matching (fallback for rows without value_id).
  // Last row wins per attribute label (API sometimes repeats the same attribute many times).
  const lastRowByLabel = new Map<string, any>();
  for (const row of attrs) {
    const rawLabel = (row as any).attribute;
    const label =
      typeof rawLabel === 'object' && rawLabel !== null
        ? String(rawLabel.en ?? rawLabel.ar ?? '').trim()
        : String(rawLabel ?? '').trim();
    if (!label) continue;
    lastRowByLabel.set(label.toLowerCase(), row);
  }

  const ids: number[] = [];
  for (const row of lastRowByLabel.values()) {
    // Direct ID available on this row — use it.
    const vid = (row as any).value_id ?? null;
    if (vid != null && !Number.isNaN(Number(vid))) {
      ids.push(Number(vid));
      continue;
    }

    const rawLabel = (row as any).attribute;
    const label =
      typeof rawLabel === 'object' && rawLabel !== null
        ? String(rawLabel.en ?? rawLabel.ar ?? '').trim()
        : String(rawLabel ?? '').trim();
    const attr = categoryAttrs.find((ca: any) => categoryAttrLabelMatches(ca, label));
    if (!attr) continue;

    const rawValSrc = (row as any).value;
    const rawVal =
      typeof rawValSrc === 'object' && rawValSrc !== null
        ? String(rawValSrc.en ?? rawValSrc.ar ?? '').trim()
        : String(rawValSrc ?? '').trim();
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

  const { data: currenciesResponse, isSuccess: currenciesReady } = useFetchCurrencies(1, 100);
  const activeCurrencies = useMemo(() => {
    const raw = currenciesResponse?.data?.items ?? [];
    return raw.filter((c) => {
      const active = c.is_active as boolean | number | undefined;
      return active === true || active === 1;
    });
  }, [currenciesResponse]);

  const usdCurrency = useMemo(
    () =>
      activeCurrencies.find((c) => String(c.code).toUpperCase() === 'USD') ??
      activeCurrencies.find((c) => c.is_default) ??
      activeCurrencies[0],
    [activeCurrencies]
  );

  const sypCurrency = useMemo(
    () => activeCurrencies.find((c) => String(c.code).toUpperCase() === 'SYP'),
    [activeCurrencies]
  );

  const productDualPriceReady = Boolean(usdCurrency && sypCurrency);

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
  const updateShopVariantMutation = useUpdateShopProductVariant();
  const deleteShopVariantMutation = useDeleteShopProductVariant();

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
    price_currency_id: 0,
    price_local: 0,
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
    delivery_time: '',
    expiry_date: '',
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

  const { handleSubmit, reset, control, watch, setValue, getValues, formState: { errors } } = methods;

  const priceWatch = watch('price');

  /** Keep UI-only `price_currency_id` / `price_local` aligned with canonical USD `price`. */
  useEffect(() => {
    if (!currenciesReady || !usdCurrency) return;
    setValue('price_currency_id', usdCurrency.id, { shouldDirty: false });
    const usd = Number(priceWatch) || 0;
    setValue('price_local', usdToLocalAmount(usd, parseCurrencyRate(usdCurrency)), {
      shouldDirty: false,
    });
  }, [currenciesReady, usdCurrency, priceWatch, setValue]);

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

  // ─── Restaurant mode detection ────────────────────────────────────────
  const { data: selectedCategoryResp } = useFetchCategoryById(
    categoryId && categoryId > 0 ? categoryId : ''
  );
  const restaurantMode = Boolean(
    selectedCategoryResp?.data?.is_restaurant ??
    (isEditMode && productResponse?.category?.is_restaurant)
  );

  // Null out restricted fields whenever restaurantMode becomes true
  useEffect(() => {
    if (!restaurantMode) return;
    setValue('brand_id', 0);
    setValue('sku', '');
    setValue('model', '');
    setValue('barcode', '');
    setValue('country_id', 0);
    setValue('sale_country_id', 0);
  }, [restaurantMode, setValue]);
  // ──────────────────────────────────────────────────────────────────────

  const imagesFiles = watch('images');
  const existingMediaIds = watch('existing_media_ids') ?? [];
  const watchedVariants = watch('variants') || [];
  const watchedShopVariants = watch('shop_variants') || [];
  const watchedBoughtWith = watch('bought_with') || [];
  const vendorScope = watch('vendor_scope');
  const watchedVendorId = watch('vendor_id');
  const discountTypeWatch = watch('discount_type');
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
    mainCategoryId > 0 ? { parent_id: mainCategoryId } : undefined,
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
        parent_id: mainCategoryId,
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
    useFetchCategoryAttributes(
      {
        page: 1,
        per_page: 100,
        category_id: categoryId ? Number(categoryId) : undefined,
      },
      { requireCategoryId: true }
    );
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
  const watchedCategoryDetailRows = useWatch({ control, name: 'category_details' }) ?? [];
  const { fields: shopVariantsFields, append: appendShopVariant, remove: removeShopVariant } =
    useFieldArray({ control, name: 'shop_variants' });

  const handleRemoveVariant = useCallback(
    (variantIndex: number) => {
      const sv = getValues('shop_variants') ?? [];
      const nextSv = sv
        .filter((row) => Number(row?.variant_index) !== variantIndex)
        .map((row) => ({
          ...row,
          variant_index:
            Number(row?.variant_index) > variantIndex
              ? Number(row.variant_index) - 1
              : Number(row?.variant_index),
        }));
      setValue('shop_variants', nextSv, { shouldDirty: true });
      removeVariant(variantIndex);
    },
    [getValues, setValue, removeVariant]
  );

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
        price_currency_id: 0,
        price_local: Number(p.price) || 0,
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
        delivery_time: p.delivery_time ?? '',
        expiry_date:
          p.expiry_date && typeof p.expiry_date === 'string'
            ? p.expiry_date.slice(0, 10)
            : '',
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
            sku: (v as any).sku ?? '',
            model: (v as any).model ?? '',
            barcode: (v as any).barcode ?? '',
            name: { en: (v as any).name?.en ?? '', ar: (v as any).name?.ar ?? '' },
            stock: (v as any).stock != null ? Number((v as any).stock) : undefined,
            max_purchase_quantity: (v as any).max_purchase_quantity != null ? Number((v as any).max_purchase_quantity) : undefined,
            delivery_time: (v as any).delivery_time ?? '',
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
              id: s.id != null ? Number(s.id) : undefined,
              shop_id: Number(s.shop_id),
              variant_index: vIndex,
              price: Number(s.price) || 0,
              cost_price: s.cost_price != null ? Number(s.cost_price) : undefined,
              discount: s.discount != null ? Number(s.discount) : undefined,
              quantity: Number(s.quantity) || 0,
            }))
          ) ?? [],
        badges: p.badges?.length
          ? p.badges.map((b: any) => (typeof b === 'number' ? b : b.id))
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
        sku: (prev as any)?.sku ?? (v as any).sku ?? '',
        model: (prev as any)?.model ?? (v as any).model ?? '',
        barcode: (prev as any)?.barcode ?? (v as any).barcode ?? '',
        name: (prev as any)?.name ?? { en: (v as any).name?.en ?? '', ar: (v as any).name?.ar ?? '' },
        stock: (prev as any)?.stock ?? ((v as any).stock != null ? Number((v as any).stock) : undefined),
        max_purchase_quantity: (prev as any)?.max_purchase_quantity ?? ((v as any).max_purchase_quantity != null ? Number((v as any).max_purchase_quantity) : undefined),
        delivery_time: (prev as any)?.delivery_time ?? (v as any).delivery_time ?? '',
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

      // Variants are optional: only rows with at least one attribute value are sent; incomplete rows are omitted.
      const rawVariantRows = payload.variants ?? [];
      const validVariants = rawVariantRows.filter(
        (v) => Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0
      );

      // After dropping variant rows, remap shop_variants.variant_index to the new indices.
      const variantIndexMap = new Map<number, number>();
      let nextVariantIdx = 0;
      rawVariantRows.forEach((v, origIdx) => {
        if (Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0) {
          variantIndexMap.set(origIdx, nextVariantIdx);
          nextVariantIdx += 1;
        }
      });
      const remappedShopVariants = (payload.shop_variants ?? [])
        .filter((sv) => variantIndexMap.has(Number(sv.variant_index)))
        .map((sv) => ({
          ...sv,
          variant_index: variantIndexMap.get(Number(sv.variant_index))!,
        }));

      const finalPayload = {
        ...payload,
        brand_id: payload.brand_id && payload.brand_id > 0 ? payload.brand_id : undefined,
        country_id: payload.country_id && payload.country_id > 0 ? payload.country_id : undefined,
        sale_country_id: payload.sale_country_id && payload.sale_country_id > 0 ? payload.sale_country_id : undefined,
        variants: validVariants,
        shop_variants: remappedShopVariants,
        category_details: payload.category_details?.filter(
          (cd) => cd.category_detail_id && cd.category_detail_id > 0
        ),
        ...(restaurantMode && {
          brand_id: undefined,
          sku: null,
          model: null,
          barcode: null,
          country_id: undefined,
          sale_country_id: undefined,
        }),
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
      const uploadPayload = {
        ...finalPayload,
        images: productImagesCompressed,
        variants: variantsCompressed,
        thumbnail: thumb,
        seo_image: seoImg,
      };
      const {
        vendor_scope: _omitVendorScope,
        price_currency_id: _omitPriceCurrencyId,
        price_local: _omitPriceLocal,
        ...apiPayload
      } = uploadPayload;

      if (isEditMode && id) {
        // In edit mode, variants and shop_variants are managed independently via their own save/delete buttons.
        const { variants: _omitVariants, shop_variants: _omitShopVariants, ...editApiPayload } = apiPayload as any;
        console.log('[Product Form] Sending update payload:', { id, data: editApiPayload });
        await updateProductMutation.mutateAsync({
          id,
          data: editApiPayload as ProductCreateUpdatePayload,
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
        onSubmit={handleSubmit(onSubmit as any, (formErrors) => {
          console.error('[Product Form] Validation errors:', formErrors);
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
          const msg = getFirstMessage(formErrors);
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

        {(errors.category_id || errors.vendor_id) && (
          <Box className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 space-y-1">
            {errors.category_id?.message ? (
              <Typography variant="caption" className="text-destructive block">
                {errors.category_id.message}
              </Typography>
            ) : null}
            {errors.vendor_id?.message ? (
              <Typography variant="caption" className="text-destructive block">
                {errors.vendor_id.message}
              </Typography>
            ) : null}
          </Box>
        )}

        {productFormTab === 'basic' && (
          <Box className="space-y-6">

        {/* ─── Restaurant mode banner ───────────────────────────── */}
        {restaurantMode && (
          <Box className="flex items-start gap-3 p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
            <Iconify icon="solar:shop-bold" className="text-orange-500 shrink-0 mt-0.5" width={20} />
            <div>
              <Typography variant="subtitle2" className="font-semibold text-orange-600">
                {t('form.restaurantModeTitle')}
              </Typography>
              <Typography variant="caption" className="text-orange-600/80">
                {t('form.restaurantModeHelper')}
              </Typography>
            </div>
          </Box>
        )}

        {/* ════════════════════════════════════════════════════════
            Card: Categories (الفئات)
           ════════════════════════════════════════════════════════ */}
        <Box className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Typography variant="subtitle1" className="font-bold text-foreground">
            {t('form.productCategorySection')}
          </Typography>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:folder-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productMainCategory')}
              </Typography>
            </Box>
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
            <Box className="group">
              <Label className="text-sm font-medium mb-1 block">{t('form.productSubcategory')}</Label>
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
            <Typography variant="caption" className="text-muted-foreground block">
              {t('form.productCategoryUsesMainOnly')}
            </Typography>
          ) : null}
        </Box>

        {/* ════════════════════════════════════════════════════════
            Card: General Info (المعلومات العامة)
           ════════════════════════════════════════════════════════ */}
        <Box className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* <Typography variant="subtitle1" className="font-bold text-foreground">
            {t('form.productGeneralInfoSection')}
          </Typography> */}

          {/* Name Arabic & English — two columns */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>

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
                    <input
                      {...field}
                      type="text"
                      placeholder={t('form.productNamePlaceholder')}
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
          </Box>

          {/* SKU, Model, Barcode — three columns */}
          {!restaurantMode && (
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
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder={t('form.skuPlaceholder')}
                        className={fieldInputClass(!!error)}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
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
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder={t('form.modelPlaceholder')}
                        className={fieldInputClass(!!error)}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
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
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder={t('form.barcodePlaceholder')}
                        className={fieldInputClass(!!error)}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              </Box>
            </Box>
          )}

          {/* Brand (hidden for restaurant categories) */}
          {!restaurantMode && (
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
          )}

          {/* Vendor source (For me / Out) */}
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
                        setValue('delivery_time', '');
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
              <Box className="mt-3 space-y-4">
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
                <Box>
                  <Box className="flex items-center gap-2 mb-2">
                    <Iconify icon="solar:clock-circle-bold" className="text-primary" width={20} />
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.productDeliveryTime')}
                    </Typography>
                  </Box>
                  <Controller
                    name="delivery_time"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <input
                          {...field}
                          type="text"
                          value={field.value ?? ''}
                          placeholder={t('form.variantDeliveryTimePlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                        <Typography variant="caption" className="text-muted-foreground mt-1 block">
                          {t('form.productDeliveryTimeExternalHint')}
                        </Typography>
                      </div>
                    )}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════════════
            Card: Description (الوصف)
           ════════════════════════════════════════════════════════ */}
        <Box className="rounded-xl border border-border bg-card p-6 space-y-5">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.productDescAr')}
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
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:document-text-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.productDescEn')}
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
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
          </Box>

          {/* Full Description */}
          <Box className="border-t border-border pt-5 mt-2 space-y-5">
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
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <TinyMCEEditorField
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={t('form.fullDescArPlaceholder')}
                      dir="rtl"
                      menubar
                      toolsMenuWordCount
                      height={320}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>

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
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <TinyMCEEditorField
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={t('form.fullDescPlaceholder')}
                      dir="ltr"
                      menubar
                      toolsMenuWordCount
                      height={320}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════════════
            Card: Countries (البلاد)
           ════════════════════════════════════════════════════════ */}
        {!restaurantMode && (
        <Box className="rounded-xl border border-border bg-card p-6">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:globe-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.countryOriginSelect')}
                </Typography>
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
        </Box>
        )}

        {/* ─── Price, discount, cost ───────────────────────────── */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Box className="group md:col-span-2 lg:col-span-3">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:dollar-bold" className="text-primary" width={20} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.productPriceRequired')}
              </Typography>
            </Box>
            {currenciesReady && activeCurrencies.length > 0 ? (
              productDualPriceReady ? (
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <Controller
                    name="price"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Typography variant="caption" className="text-muted-foreground mb-1 block">
                          {t('form.productPriceUsdLabel')}
                          {usdCurrency?.symbol ? (
                            <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                          ) : null}
                        </Typography>
                        <input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw === '' ? 0 : Number(raw);
                            field.onChange(Number.isFinite(v) ? v : 0);
                          }}
                          className={fieldInputClass(!!error)}
                          step="any"
                          min={0}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <div>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      {t('form.productPriceSypLabel')}
                      {sypCurrency?.symbol ? (
                        <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                      ) : null}
                    </Typography>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={(() => {
                        const usdNum = Number(priceWatch) || 0;
                        const syp = usdToLocalAmount(usdNum, parseCurrencyRate(sypCurrency!));
                        return usdNum === 0 && syp === 0 ? '' : syp;
                      })()}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const v = raw === '' ? 0 : Number(raw);
                        const rate = parseCurrencyRate(sypCurrency!);
                        setValue('price', localAmountToUsd(Number.isFinite(v) ? v : 0, rate), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className={fieldInputClass(!!errors.price)}
                      step="any"
                      min={0}
                    />
                  </div>
                </Box>
              ) : (
                <Box className="space-y-2">
                  <Typography variant="caption" className="text-destructive block">
                    {t('form.productPriceSypMissing')}
                  </Typography>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Typography variant="caption" className="text-muted-foreground mb-1 block">
                          {t('form.productPriceUsdLabel')}
                        </Typography>
                        <input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw === '' ? 0 : Number(raw);
                            field.onChange(Number.isFinite(v) ? v : 0);
                          }}
                          className={fieldInputClass(!!error)}
                          step="any"
                          min={0}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                </Box>
              )
            ) : (
              <Typography variant="caption" className="text-muted-foreground mb-2 block">
                {!currenciesReady ? t('form.productPriceCurrenciesLoading') : null}
              </Typography>
            )}
            {(!currenciesReady || activeCurrencies.length === 0) && (
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
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            )}
            <Typography variant="caption" className="text-muted-foreground mt-2 block">
              {t('form.productPriceUsdHint')}
            </Typography>
            {errors.price?.message ? (
              <FieldErrorText message={errors.price.message} />
            ) : null}
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <select {...field} className={fieldInputClass(!!error)}>
                    <option value="none">{t('form.discountTypeNone')}</option>
                    <option value="percentage">{t('form.discountTypePercentage')}</option>
                    <option value="fixed">{t('form.discountTypeFixed')}</option>
                  </select>
                  <FieldErrorText message={error?.message} />
                </div>
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
                    min={0}
                    max={discountTypeWatch === 'percentage' ? 100 : undefined}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0.00"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
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
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder={t('form.prepTimePlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder={t('form.unitPlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ─── Expiry date ──────────────────────────────────────── */}
        <Box className="group max-w-md">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:calendar-date-bold" className="text-primary" width={20} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.productExpiryDate')}
            </Typography>
          </Box>
          <Controller
            name="expiry_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  {...field}
                  type="date"
                  value={field.value ?? ''}
                  className={fieldInputClass(!!error)}
                />
                <FieldErrorText message={error?.message} />
                <Typography variant="caption" className="text-muted-foreground mt-1 block">
                  {t('form.productExpiryDateHint')}
                </Typography>
              </div>
            )}
          />
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
                <FieldErrorText message={error?.message} />
                {!error && (
                  <Typography variant="caption" className="text-muted-foreground mt-1 block">
                    {t('form.productImagesHelper')}
                  </Typography>
                )}
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
                        alt={t('form.productGalleryPreviewAlt', { n: i + 1 })}
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
            render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
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
                  className={`inline-flex cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm ${
                    error ? 'border-destructive' : 'border-border'
                  }`}
                >
                  {t('form.chooseThumbnail')}
                </label>
                <FieldErrorText message={error?.message} />
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

        {/* ─── Category Details ─────────────────────────────────── */}
        <Box className="border-t border-border pt-6">
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
              {categoryDetailsFields.map((field, index) => {
                const row = watchedCategoryDetailRows[index] as
                  | { category_detail_id?: number; detail_value?: { en: string; ar: string } }
                  | undefined;
                const detailId = row?.category_detail_id;
                const selectedDef = availableCategoryDetails.find(
                  (cd: any) => Number(cd.id) === Number(detailId)
                );
                const valueOpts = normalizeCategoryDetailValueOptions(selectedDef?.value_options);
                const dv = row?.detail_value ?? { en: '', ar: '' };
                const matchedKey = findCategoryDetailOptionKey(dv, valueOpts);
                const hasPresets = valueOpts.length > 0;
                const hasOrphanSaved =
                  hasPresets &&
                  !matchedKey &&
                  ((dv.en ?? '').trim() !== '' || (dv.ar ?? '').trim() !== '');

                return (
                  <Box key={field.id} className="p-4 border border-border rounded-lg space-y-3">
                    <Box className="flex items-center gap-3">
                      <Controller
                        name={`category_details.${index}.category_detail_id`}
                        control={control}
                        render={({ field: f, fieldState: { error } }) => (
                          <div className="flex-1 min-w-0">
                            <select
                              {...f}
                              value={f.value}
                              onChange={(e) => {
                                f.onChange(Number(e.target.value));
                                setValue(
                                  `category_details.${index}.detail_value`,
                                  { en: '', ar: '' },
                                  { shouldDirty: true, shouldValidate: true }
                                );
                              }}
                              className={fieldInputClass(!!error)}
                            >
                              {availableCategoryDetails.map((cd: any) => (
                                <option key={cd.id} value={cd.id}>
                                  {typeof cd.name === 'object'
                                    ? cd.name?.en ?? cd.name?.ar
                                    : cd.name}
                                </option>
                              ))}
                            </select>
                            <FieldErrorText message={error?.message} />
                          </div>
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

                    {hasPresets ? (
                      <Box className="space-y-2">
                        <Typography variant="caption" className="text-muted-foreground font-medium block">
                          {t('form.categoryDetailPredefinedValueLabel')}
                        </Typography>
                        <select
                          className={fieldInputClass(false)}
                          value={matchedKey}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) {
                              setValue(
                                `category_details.${index}.detail_value`,
                                { en: '', ar: '' },
                                { shouldDirty: true, shouldValidate: true }
                              );
                              return;
                            }
                            try {
                              const parsed = JSON.parse(v) as { en?: string; ar?: string };
                              setValue(
                                `category_details.${index}.detail_value`,
                                { en: parsed.en ?? '', ar: parsed.ar ?? '' },
                                { shouldDirty: true, shouldValidate: true }
                              );
                            } catch {
                              /* ignore malformed */
                            }
                          }}
                        >
                          <option value="">{t('form.selectCategoryDetailValue')}</option>
                          {valueOpts.map((opt, optIdx) => (
                            <option key={optIdx} value={categoryDetailOptionKey(opt)}>
                              {`${opt.en} / ${opt.ar}`}
                            </option>
                          ))}
                        </select>
                        {hasOrphanSaved ? (
                          <Typography variant="caption" className="text-amber-600 dark:text-amber-500 block">
                            {t('form.categoryDetailValueNotInList', {
                              en: dv.en ?? '',
                              ar: dv.ar ?? '',
                            })}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : (
                      <Typography variant="caption" className="text-muted-foreground block">
                        {t('form.noPredefinedDetailValues')}
                      </Typography>
                    )}
                  </Box>
                );
              })}
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
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          {...f}
                          placeholder={t('form.productKeyEnPlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_key.ar`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          {...f}
                          dir="rtl"
                          placeholder={t('form.extraDetailKeyArPlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_value.en`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          {...f}
                          placeholder={t('form.productValueEnPlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.detail_value.ar`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          {...f}
                          dir="rtl"
                          placeholder={t('form.extraDetailValueArPlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <Controller
                    name={`extra_details.${index}.price`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          {...f}
                          type="number"
                          placeholder={t('form.extraPriceOptional')}
                          value={f.value ?? ''}
                          onChange={(e) =>
                            f.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
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
            appendVariant({
              attributes_values_ids: [],
              images: [],
              existing_images_ids: [],
              sku: '',
              model: '',
              barcode: '',
              name: { en: '', ar: '' },
              stock: undefined,
              max_purchase_quantity: undefined,
              delivery_time: '',
            })
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
                  <Box className="flex items-center justify-between flex-wrap gap-2">
                    <Box className="flex items-center gap-2 flex-wrap">
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('form.variantIndex', { n: variantIndex + 1 })}
                      </Typography>
                      {shops.length > 0 ? (
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            document
                              .getElementById(`variant-shop-section-${variantIndex}`)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        >
                          <Iconify icon="solar:shop-2-bold" width={16} className="mr-1" />
                          {t('form.shopVariantsTitle')}
                        </Button>
                      ) : null}
                    </Box>
                    <Button
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => handleRemoveVariant(variantIndex)}
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

                      const isColor = String(attr.type).toLowerCase() === 'color';

                      const colorInitialLabel = found
                        ? formatTranslated(found.name as any)
                        : undefined;

                      const attrTypeLower = String(attr.type ?? '').toLowerCase();
                      const attrTypeLabel =
                        attrTypeLower === 'color'
                          ? t('form.categoryAttrTypeColor')
                          : attrTypeLower === 'select'
                            ? t('form.categoryAttrTypeSelect')
                            : attrTypeLower === 'text'
                              ? t('form.categoryAttrTypeText')
                              : String(attr.type ?? '');
                      const attrRowName =
                        typeof attr.name === 'object' && attr.name
                          ? formatTranslated(attr.name as any)
                          : String(attr.name ?? '');

                      return (
                        <Box key={attr.id} className="group">
                          <Typography variant="caption" className="text-muted-foreground mb-1 block">
                            {attrRowName} ({attrTypeLabel})
                          </Typography>
                          {isColor ? (
                            <Box className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <InfiniteScrollSelect
                                  value={found ? Number(found.id) : 0}
                                  onChange={(pickedId) => {
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
                                  queryKey={[
                                    'product-form',
                                    'variant-attr-color',
                                    attr.id,
                                    variantIndex,
                                    (attr.values ?? []).length,
                                  ]}
                                  fetcher={createAttributeValuesFetcher(attr.values)}
                                  placeholder={t('form.selectAttribute', {
                                    name: String(attrNameLabel ?? ''),
                                  })}
                                  pageSize={15}
                                  initialLabel={colorInitialLabel}
                                />
                              </div>
                              {found ? (
                                <Button
                                  type="button"
                                  variant="text"
                                  size="small"
                                  className="shrink-0 text-muted-foreground"
                                  onClick={() => {
                                    const current = (watch(
                                      `variants.${variantIndex}.attributes_values_ids`
                                    ) || []) as number[];
                                    const filtered = current.filter((i) => !attrValueIds.has(i));
                                    setValue(
                                      `variants.${variantIndex}.attributes_values_ids`,
                                      filtered,
                                      { shouldDirty: true }
                                    );
                                  }}
                                >
                                  {t('form.clearAttributeSelection')}
                                </Button>
                              ) : null}
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
                      render={({
                        field: { onChange, value, ref, name, onBlur },
                        fieldState: { error },
                      }) => {
                        const variantFileInputId = `variant-images-${variantIndex}-${variant.id}`;
                        return (
                          <div>
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
                                className={`inline-flex cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted ${
                                  error ? 'border-destructive' : 'border-border'
                                }`}
                              >
                                {t('form.chooseFiles')}
                              </label>
                              <Typography component="span" variant="body2" color="secondary">
                                {Array.isArray(value) && value.length > 0
                                  ? t('form.filesSelectedCount', { count: value.length })
                                  : t('form.noFileChosen')}
                              </Typography>
                            </div>
                            <FieldErrorText message={error?.message} />
                            {!error && (
                              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                                {t('form.variantImagesHelper')}
                              </Typography>
                            )}
                          </div>
                        );
                      }}
                    />
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

                  {/* ─── Variant Extra Fields (SKU, Model, Barcode, Name, Stock, Purchase Qty, Delivery) ─── */}
                  <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-border pt-4">
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantSku')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.sku`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              placeholder={t('form.variantSkuPlaceholder')}
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantModel')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.model`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              placeholder={t('form.variantModelPlaceholder')}
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantBarcode')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.barcode`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              placeholder={t('form.variantBarcodePlaceholder')}
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantNameEn')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.name.en`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              placeholder={t('form.variantNameEnPlaceholder')}
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantNameAr')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.name.ar`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              value={field.value ?? ''}
                              type="text"
                              dir="rtl"
                              placeholder={t('form.variantNameArPlaceholder')}
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantStock')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.stock`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              type="number"
                              placeholder={t('form.variantStockPlaceholder')}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                              }
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantMaxPurchaseQuantity')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.max_purchase_quantity`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              type="number"
                              placeholder={t('form.variantMaxPurchaseQuantityPlaceholder')}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                              }
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                            <Typography variant="caption" className="text-muted-foreground mt-1 block">
                              {t('form.variantMaxPurchaseQuantityHint')}
                            </Typography>
                          </div>
                        )}
                      />
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
                          />
                          <Typography variant="caption" className="text-muted-foreground mt-1 block">
                            {t('form.variantDeliveryTimeHint')}
                          </Typography>
                        </Box>
                      ) : (
                        <Controller
                          name={`variants.${variantIndex}.delivery_time`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <div>
                              <input
                                {...field}
                                value={field.value ?? ''}
                                type="text"
                                placeholder={t('form.variantDeliveryTimePlaceholder')}
                                className={fieldInputClass(!!error)}
                              />
                              <FieldErrorText message={error?.message} />
                            </div>
                          )}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* ─── is_trend toggle ─── */}
                  <Box className="flex items-center gap-3 border-t border-border pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary"
                        defaultChecked={
                          isEditMode && productResponse?.variants?.[variantIndex]
                            ? Boolean((productResponse.variants[variantIndex] as any)?.is_trend)
                            : false
                        }
                        data-variant-field={`is-trend-${variantIndex}`}
                      />
                      <Typography variant="body2" className="font-medium text-foreground">
                        {t('form.variantIsTrend')}
                      </Typography>
                    </label>
                    <Typography variant="caption" className="text-muted-foreground">
                      {t('form.variantIsTrendHint')}
                    </Typography>
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
                          const isTrendEl = document.querySelector(`[data-variant-field="is-trend-${variantIndex}"]`) as HTMLInputElement | null;
                          const isTrendChecked = isTrendEl?.checked ?? false;
                          try {
                            const newImgs = watch(`variants.${variantIndex}.images`);
                            await updateVariantMutation.mutateAsync({
                              id: variantId,
                              data: {
                                attributes_values_ids: watch(`variants.${variantIndex}.attributes_values_ids`) || [],
                                existing_images_ids: watch(`variants.${variantIndex}.existing_images_ids`) || [],
                                images: Array.isArray(newImgs) && newImgs.length > 0 ? newImgs : undefined,
                                sku: watch(`variants.${variantIndex}.sku`) ?? '',
                                model: watch(`variants.${variantIndex}.model`) ?? '',
                                barcode: watch(`variants.${variantIndex}.barcode`) ?? '',
                                name: {
                                  en: watch(`variants.${variantIndex}.name.en`) ?? '',
                                  ar: watch(`variants.${variantIndex}.name.ar`) ?? '',
                                },
                                stock: watch(`variants.${variantIndex}.stock`) ?? 0,
                                max_purchase_quantity: watch(`variants.${variantIndex}.max_purchase_quantity`) ?? 0,
                                delivery_time:
                                  vendorScope === 'internal'
                                    ? t('form.variantDeliveryTimeApiInternal')
                                    : watch(`variants.${variantIndex}.delivery_time`) ?? '',
                                is_trend: isTrendChecked ? 1 : 0,
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
                            handleRemoveVariant(variantIndex);
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

                  {/* ─── Shop product variants (per variant) ───────────────── */}
                  <Box
                    id={`variant-shop-section-${variantIndex}`}
                    className="border-t border-border pt-4 space-y-3 scroll-mt-24"
                  >
                    <Box className="flex items-center gap-2">
                      <Iconify icon="solar:shop-2-bold" className="text-primary" width={20} />
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {t('form.shopVariantsTitle')}
                      </Typography>
                    </Box>
                    {shops.length === 0 ? (
                      <Typography variant="body2" className="text-muted-foreground">
                        {t('form.noShopsAvailable')}
                      </Typography>
                    ) : (
                      <>
                        {shopVariantsFields.map((svField, svIdx) => {
                          const boundVi = Number(watchedShopVariants?.[svIdx]?.variant_index);
                          if (boundVi !== variantIndex) return null;
                          return (
                            <Box
                              key={svField.id}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-3 border border-border rounded-lg items-end"
                            >
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground mb-1 block">
                                  {t('form.shop')}
                                </Typography>
                                <Controller
                                  name={`shop_variants.${svIdx}.shop_id`}
                                  control={control}
                                  render={({ field: f, fieldState: { error } }) => (
                                    <div>
                                      <select
                                        {...f}
                                        value={f.value}
                                        onChange={(e) => f.onChange(Number(e.target.value))}
                                        className={fieldInputClass(!!error)}
                                      >
                                        {shops.map((s: any) => (
                                          <option key={s.id} value={s.id}>
                                            {typeof s.name === 'object' ? s.name?.en ?? s.name?.ar : s.name}
                                          </option>
                                        ))}
                                      </select>
                                      <FieldErrorText message={error?.message} />
                                    </div>
                                  )}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground mb-1 block">
                                  {t('form.priceLabel')}
                                </Typography>
                                <Controller
                                  name={`shop_variants.${svIdx}.price`}
                                  control={control}
                                  render={({ field: f, fieldState: { error } }) => (
                                    <div>
                                      <input
                                        {...f}
                                        type="number"
                                        placeholder={t('form.shopVariantPricePlaceholder')}
                                        onChange={(e) => f.onChange(Number(e.target.value))}
                                        className={fieldInputClass(!!error)}
                                      />
                                      <FieldErrorText message={error?.message} />
                                    </div>
                                  )}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground mb-1 block">
                                  {t('form.productCostPriceOptional')}
                                </Typography>
                                <Controller
                                  name={`shop_variants.${svIdx}.cost_price`}
                                  control={control}
                                  render={({ field: f, fieldState: { error } }) => (
                                    <div>
                                      <input
                                        {...f}
                                        type="number"
                                        value={f.value ?? ''}
                                        placeholder={t('form.shopVariantPricePlaceholder')}
                                        onChange={(e) =>
                                          f.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                                        }
                                        className={fieldInputClass(!!error)}
                                      />
                                      <FieldErrorText message={error?.message} />
                                    </div>
                                  )}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground mb-1 block">
                                  {t('columns.discount')}
                                </Typography>
                                <Controller
                                  name={`shop_variants.${svIdx}.discount`}
                                  control={control}
                                  render={({ field: f, fieldState: { error } }) => (
                                    <div>
                                      <input
                                        {...f}
                                        type="number"
                                        value={f.value ?? ''}
                                        placeholder={t('form.shopVariantDiscountPlaceholder')}
                                        onChange={(e) =>
                                          f.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                                        }
                                        className={fieldInputClass(!!error)}
                                      />
                                      <FieldErrorText message={error?.message} />
                                    </div>
                                  )}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" className="text-muted-foreground mb-1 block">
                                  {t('form.quantity')}
                                </Typography>
                                <Box className="flex gap-2">
                                  <Controller
                                    name={`shop_variants.${svIdx}.quantity`}
                                    control={control}
                                    render={({ field: f, fieldState: { error } }) => (
                                      <div className="flex-1 min-w-0">
                                        <input
                                          {...f}
                                          type="number"
                                          placeholder={t('form.shopVariantQuantityPlaceholder')}
                                          onChange={(e) => f.onChange(Number(e.target.value))}
                                          className={fieldInputClass(!!error)}
                                        />
                                        <FieldErrorText message={error?.message} />
                                      </div>
                                    )}
                                  />
                                  {!isEditMode && (
                                    <Button
                                      type="button"
                                      variant="text"
                                      size="small"
                                      onClick={() => removeShopVariant(svIdx)}
                                      className="text-destructive shrink-0"
                                    >
                                      <Iconify icon="solar:trash-bin-bold" width={16} />
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                              {isEditMode && (
                                <Box className="flex items-center gap-2 col-span-full border-t border-border pt-2 mt-1">
                                  {watch(`shop_variants.${svIdx}.id`) ? (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outlined"
                                        size="small"
                                        disabled={updateShopVariantMutation.isPending}
                                        onClick={async () => {
                                          const svId = watch(`shop_variants.${svIdx}.id`);
                                          if (!svId) return;
                                          try {
                                            const variantIdx = watch(`shop_variants.${svIdx}.variant_index`);
                                            const linkedVariantId =
                                              variantIdx != null
                                                ? watch(`variants.${variantIdx}.id`)
                                                : undefined;
                                            await updateShopVariantMutation.mutateAsync({
                                              id: svId,
                                              data: {
                                                price: watch(`shop_variants.${svIdx}.price`),
                                                cost_price: watch(`shop_variants.${svIdx}.cost_price`),
                                                discount: watch(`shop_variants.${svIdx}.discount`),
                                                quantity: watch(`shop_variants.${svIdx}.quantity`),
                                                shop_id: watch(`shop_variants.${svIdx}.shop_id`),
                                                product_variant_id: linkedVariantId ?? undefined,
                                              },
                                            });
                                            toast.success(t('form.shopVariantSaveSuccess'));
                                          } catch {
                                            toast.error(t('form.shopVariantSaveFailed'));
                                          }
                                        }}
                                      >
                                        <Iconify icon="solar:diskette-bold" width={16} className="mr-1" />
                                        {t('form.saveShopVariant')}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="text"
                                        size="small"
                                        className="text-destructive"
                                        disabled={deleteShopVariantMutation.isPending}
                                        onClick={async () => {
                                          const svId = watch(`shop_variants.${svIdx}.id`);
                                          if (!svId) return;
                                          if (!window.confirm(t('form.shopVariantDeleteConfirm'))) return;
                                          try {
                                            await deleteShopVariantMutation.mutateAsync(svId);
                                            removeShopVariant(svIdx);
                                            toast.success(t('form.shopVariantDeleteSuccess'));
                                          } catch {
                                            toast.error(t('form.shopVariantDeleteFailed'));
                                          }
                                        }}
                                      >
                                        <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                                        {t('form.deleteShopVariant')}
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="text"
                                      size="small"
                                      onClick={() => removeShopVariant(svIdx)}
                                      className="text-destructive shrink-0"
                                    >
                                      <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                                      {t('form.remove')}
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            appendShopVariant({
                              shop_id: shops[0]?.id ?? 0,
                              variant_index: variantIndex,
                              price: 0,
                              cost_price: undefined,
                              discount: undefined,
                              quantity: 0,
                            })
                          }
                        >
                          <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
                          {t('form.addShopVariant')}
                        </Button>
                      </>
                    )}
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
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    placeholder={t('form.seoTitleEnPlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
            <Controller
              name="seo_title.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    dir="rtl"
                    placeholder={t('form.seoTitleArPlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
            <Controller
              name="seo_description.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    placeholder={t('form.seoDescEnPlaceholder')}
                    className={`${fieldInputClass(!!error)} min-h-[80px]`}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
            <Controller
              name="seo_description.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    dir="rtl"
                    placeholder={t('form.seoDescArPlaceholder')}
                    className={`${fieldInputClass(!!error)} min-h-[80px]`}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
            <Controller
              name="seo_keywords.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    placeholder={t('form.seoKeywordsEnPlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
            <Controller
              name="seo_keywords.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    dir="rtl"
                    placeholder={t('form.seoKeywordsArPlaceholder')}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
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
              render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
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
                  <label
                    htmlFor={seoImageInputId}
                    className={`inline-flex cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                      error ? 'border-destructive' : 'border-border'
                    }`}
                  >
                    {t('form.chooseSeoImage')}
                  </label>
                  <FieldErrorText message={error?.message} />
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
          </Box>
        )}
      </CreateFormLayout>
  );
}
