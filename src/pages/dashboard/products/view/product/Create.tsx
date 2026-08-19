import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
import type { ProductExtraDetailRowApi } from '@/pages/dashboard/categories/types/product-extra-detail.types';
import type {
  ProductDetailData,
  ProductCreateUpdatePayload,
} from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { apiRoutes, axiosInstance } from '@/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useQuery, useQueries } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { useFetchUnits } from '@/pages/dashboard/units/hooks/unit';
import { useFetchShops } from '@/pages/dashboard/vendor/hooks/shop';
import { _ShopApi } from '@/pages/dashboard/vendor/api/shop.services';
import { compressImage, compressImages } from '@/utils/compress-image';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { _BrandApi } from '@/pages/dashboard/products/api/brand.services';
import { _ProductApi } from '@/pages/dashboard/products/api/product.services';
import { useForm, useWatch, Controller, useFieldArray } from 'react-hook-form';
import { _CountryApi } from '@/pages/dashboard/countries/api/country.services';
import { useId, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFetchCurrencies } from '@/pages/dashboard/currencies/hooks/currency';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { useFetchCategoryById } from '@/pages/dashboard/categories/hooks/category';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import { _SaleCountryApi } from '@/pages/dashboard/sale-countries/api/sale-country.services';
import { useVariantDeleteFlow } from '@/pages/dashboard/products/hooks/use-variant-delete-flow';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';
import { useFetchProductExtraDetails } from '@/pages/dashboard/categories/hooks/product-extra-detail';
import { VariantDeleteImpactDialog } from '@/pages/dashboard/products/components/VariantDeleteImpactDialog';
import { CategoryLeafCascadeFields } from '@/pages/dashboard/categories/components/category-leaf-cascade-fields';
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
  useUpdateShopProductVariant,
} from '@/pages/dashboard/products/hooks/product-variant';
import {
  responseIncludesVariants,
  savedProductHasShopLink,
  toShopVariantPayload,
  toVariantPayload,
} from '@/pages/dashboard/products/utils/variant-payload';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Label } from 'src/shared/components/label';
import { MultiSelect } from 'src/shared/ui/multi-select';
import { Box, Tab, Tabs, Button, Typography } from 'src/shared/ui';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';
import { RHFInfiniteSelect } from 'src/shared/components/hook-form/rhf-infinite-select';

import { ProductShopVariantsSection } from './ProductShopVariantsSection';

// ----------------------------------------------------------------------

const brandFetcher = (page: number, limit: number) =>
  _BrandApi.getListBrands({ page, per_page: limit }).then((r) => ({
    data: {
      items: r.data.items.map((b) => ({ id: b.id, label: b.name })),
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

function generateRandomSku(): string {
  return 'SKU-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

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
function attributeLabel(name: unknown, fallback = ''): string {
  if (name == null) return fallback;
  if (typeof name === 'object') {
    return formatTranslated(name as Parameters<typeof formatTranslated>[0]) || fallback;
  }
  return String(name);
}

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

function toTwoDecimalNumber(raw: string): number | undefined {
  if (raw === '') return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  return Math.round(value * 100) / 100;
}

function toOptionalInt(raw: unknown): number | undefined {
  if (raw === '' || raw === null || raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

function toOptionalNumber(raw: unknown): number | undefined {
  if (raw === '' || raw === null || raw === undefined) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Hide `0` in optional / numeric variant & shop fields (show empty like cleared input). */
function optionalNumberInputDisplay(v: unknown): string | number {
  if (v === undefined || v === null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return '';
  return n;
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

/**
 * `exchange_rate` is units of this currency per 1 USD → USD = local / rate.
 * USD keeps 6 decimal places (not 2) because rates like 13000 SYP/USD make a cent
 * worth ~130 SYP — rounding to cents here would collapse small local amounts to 0.
 */
function localAmountToUsd(local: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return Math.round((local / r) * 1e6) / 1e6;
}

function usdToLocalAmount(usd: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return Math.round((usd * r) * 100) / 100;
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

/** Sorted attribute-value ids for matching a created variant back to a form variant row. */
function extractVariantAttributeValueIds(variant: any): number[] {
  if (!variant || typeof variant !== 'object') return [];
  const directIds = (variant as { attributes_values_ids?: unknown }).attributes_values_ids;
  if (Array.isArray(directIds)) {
    return directIds
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
  }
  const attrs = (variant as { attributes?: unknown }).attributes;
  if (Array.isArray(attrs)) {
    return attrs
      .map((a: any) => Number(a?.id ?? a?.attribute_value_id ?? a?.value_id))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
  }
  return [];
}

/** Created shop variants live under `shop_variants` (new API) or `shops` (legacy detail shape). */
function extractCreatedShopVariants(variant: any): any[] {
  if (!variant || typeof variant !== 'object') return [];
  if (Array.isArray(variant.shop_variants)) return variant.shop_variants;
  if (Array.isArray(variant.shops)) return variant.shops;
  return [];
}

function getShopIdFromCreatedShopVariant(csv: any): number {
  if (!csv) return 0;
  const fromShop = Number(csv?.shop?.id);
  if (Number.isFinite(fromShop) && fromShop > 0) return fromShop;
  const direct = Number(csv?.shop_id);
  return Number.isFinite(direct) && direct > 0 ? direct : 0;
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

function LocalFilePreview({
  file,
  label,
}: {
  file: File | null;
  label: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!(file instanceof File)) {
      setPreviewUrl('');
      return () => {};
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!(file instanceof File)) return null;

  return (
    <Box className="mt-3 flex flex-col gap-2">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name || label}
          className="max-h-32 max-w-[280px] rounded-lg border border-border/60 object-contain bg-muted"
        />
      ) : null}
      <Typography variant="caption" className="text-muted-foreground">
        {label}
      </Typography>
      <Typography variant="caption" className="text-muted-foreground break-all">
        {file.name}
      </Typography>
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

function normalizeProductExtraLang(v: unknown): { en: string; ar: string } {
  if (typeof v === 'string') return { en: v.trim(), ar: v.trim() };
  if (v && typeof v === 'object') {
    const o = v as { en?: string; ar?: string };
    return { en: (o.en ?? '').trim(), ar: (o.ar ?? '').trim() };
  }
  return { en: '', ar: '' };
}

function findPresetIdForProductExtraPivot(
  pivot: { key?: { en?: string; ar?: string }; value?: { en?: string; ar?: string } },
  presets: ProductExtraDetailRowApi[]
): number {
  const ke = pivot.key?.en?.trim() ?? '';
  const ka = pivot.key?.ar?.trim() ?? '';
  const ve = pivot.value?.en?.trim() ?? '';
  const va = pivot.value?.ar?.trim() ?? '';
  for (const pr of presets) {
    const pk = normalizeProductExtraLang(pr.detail_key);
    const pv = normalizeProductExtraLang(pr.detail_value);
    if (pk.en === ke && pk.ar === ka && pv.en === ve && pv.ar === va) return pr.id;
  }
  return 0;
}

function labelProductExtraPreset(pr: ProductExtraDetailRowApi): string {
  const kt = formatTranslated(pr.detail_key as Parameters<typeof formatTranslated>[0]);
  const vt = formatTranslated(pr.detail_value as Parameters<typeof formatTranslated>[0]);
  return `${kt} — ${vt}`;
}

function toDateInputLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CreatePage() {
  const { t, i18n } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainCategoryId, setMainCategoryId] = useState(0);
  /** Create mode: gate form until user picks retail vs restaurant. Edit mode: true once product loads. */
  const [hasSelectedProductType, setHasSelectedProductType] = useState(isEditMode);
  const restaurantShopMetaRef = useRef<Map<number, { vendorId: number }>>(new Map());
  const prevIsRestaurantToggleRef = useRef<boolean | null>(null);
  /** Detect genuine (non-hydration) category changes to clear dependent state. */
  const prevMainCategoryIdRef = useRef<number | null>(null);
  const prevCategoryIdRef = useRef<number | null>(null);
  /** Extra categories to load "bought with" suggestions (merged with main product category). */
  const [boughtWithExtraCategoryIds, setBoughtWithExtraCategoryIds] = useState<number[]>([]);
  const productImagesInputId = useId();
  const thumbnailInputId = useId();
  const seoImageInputId = useId();

  // Fetch dependencies
  const { data: productResponse, isLoading: isLoadingProduct } = useFetchProductById(id || '');

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

  const { data: unitsListResponse } = useFetchUnits({ page: 1, per_page: 500, is_active: 1 });
  const unitSelectOptions = useMemo(() => {
    const items = unitsListResponse?.data?.items ?? [];
    return items.map((u) => ({
      id: u.id,
      label: formatTranslated(u.name as { en?: string; ar?: string }),
    }));
  }, [unitsListResponse?.data?.items]);

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
  const updateShopVariantMutation = useUpdateShopProductVariant();

  const todayDateInputMin = useMemo(() => toDateInputLocalYMD(new Date()), []);

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
    price_local: undefined,
    price: undefined,
    discount: 0,
    discount_type: 'none',
    cost_price: undefined,
    quantity: 0,
    unit_id: 0,
    warranty_period: undefined,
    sku: '',
    model: '',
    barcode: '',
    time_prepare: '',
    delivery_time: '',
    expiry_date: '',
    is_restaurant: false,
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
  const costPriceWatch = watch('cost_price');

  /** Keep UI-only `price_currency_id` / `price_local` aligned with canonical USD `price`. */
  useEffect(() => {
    if (!currenciesReady || !usdCurrency) return;
    setValue('price_currency_id', usdCurrency.id, { shouldDirty: false });
    const raw = priceWatch as number | string | null | undefined;
    if (
      raw == null ||
      (typeof raw === 'string' && raw.trim() === '') ||
      Number.isNaN(Number(raw))
    ) {
      setValue('price_local', undefined, { shouldDirty: false });
      return;
    }
    const usd = Number(raw);
    setValue('price_local', usdToLocalAmount(usd, parseCurrencyRate(usdCurrency)), {
      shouldDirty: false,
    });
  }, [currenciesReady, usdCurrency, priceWatch, setValue]);

  useEffect(() => {
    setMainCategoryId(0);
    prevMainCategoryIdRef.current = null;
    prevCategoryIdRef.current = null;
  }, [id]);

  const categoryId = watch('category_id');
  const isRestaurantToggle = watch('is_restaurant');

  // ─── Restaurant mode detection ────────────────────────────────────────
  const { data: selectedCategoryResp } = useFetchCategoryById(
    categoryId && categoryId > 0 ? categoryId : ''
  );
  const categoryIsRestaurant = Boolean(
    selectedCategoryResp?.data?.is_restaurant ??
    (isEditMode && (productResponse?.is_restaurant ?? productResponse?.category?.is_restaurant))
  );
  const restaurantMode = isRestaurantToggle || categoryIsRestaurant;
  const categoryRestaurantFilter = isRestaurantToggle ? 1 : 0;

  /** Full flat category list (current restaurant/retail mode) — used to hydrate the cascade in edit mode. */
  const {
    data: flatCategoryItems = [],
    dataUpdatedAt: flatCategoriesUpdatedAt,
    isFetched: flatCategoriesFetched,
  } = useQuery({
    queryKey: ['categories', 'flat-all', 'product-form', categoryRestaurantFilter],
    queryFn: () =>
      _CategoryApi.getListAllCategoriesFlat({ per_page: 500, is_restaurant: categoryRestaurantFilter }),
    enabled: hasSelectedProductType,
  });

  const hydrateLeafCategoryId = useMemo(() => {
    if (!isEditMode || !productResponse?.category?.id) return null;
    const savedIsRestaurant = Boolean(
      productResponse.is_restaurant ?? productResponse.category?.is_restaurant
    );
    if (Boolean(isRestaurantToggle) !== savedIsRestaurant) return null;
    return Number(productResponse.category.id) || null;
  }, [isEditMode, productResponse, isRestaurantToggle]);

  const categoryHydrationKey = `${id ?? 'new-product'}|${isRestaurantToggle ? 'restaurant' : 'retail'}`;

  const vendorFetcher = useCallback(
    (page: number, limit: number) =>
      _VendorApi.getListVendor({
        page,
        limit,
        ...(isRestaurantToggle ? { is_restaurant: 1 } : {}),
      }).then((r) => ({
        data: {
          items: r.data.items.map((v) => ({ id: v.id, label: formatTranslated(v.name) })),
          pagination: r.data.pagination,
        },
      })),
    [isRestaurantToggle]
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
    const vars = getValues('variants') ?? [];
    vars.forEach((_, i) => {
      setValue(`variants.${i}.model`, '');
      setValue(`variants.${i}.barcode`, '');
    });
  }, [restaurantMode, setValue, getValues]);

  const skipRestaurantToggleReset = useRef(false);
  useEffect(() => {
    if (skipRestaurantToggleReset.current) {
      skipRestaurantToggleReset.current = false;
      prevIsRestaurantToggleRef.current = isRestaurantToggle;
      return;
    }
    if (prevIsRestaurantToggleRef.current === null) {
      prevIsRestaurantToggleRef.current = isRestaurantToggle;
      return;
    }
    if (prevIsRestaurantToggleRef.current === isRestaurantToggle) return;
    prevIsRestaurantToggleRef.current = isRestaurantToggle;
    setMainCategoryId(0);
    setValue('category_id', 0);
    setValue('variants', []);
    setValue('shop_variants', []);
    restaurantShopMetaRef.current.clear();
    if (getValues('vendor_scope') === 'external') {
      setValue('vendor_id', 0);
    }
  }, [isRestaurantToggle, setValue, getValues]);

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

  const selectedRestaurantShopId = useMemo(() => {
    if (!isRestaurantToggle || !categoryId || categoryId <= 0) return 0;
    const row = watchedShopVariants.find((sv) => Number(sv.variant_index) === 0);
    return Number(row?.shop_id) > 0 ? Number(row!.shop_id) : 0;
  }, [isRestaurantToggle, categoryId, watchedShopVariants]);

  const selectedRestaurantShopInitialLabel = useMemo(() => {
    if (selectedRestaurantShopId <= 0) return undefined;
    for (const v of productResponse?.variants ?? []) {
      for (const s of v.shops ?? []) {
        if (Number(s.shop_id) === selectedRestaurantShopId) {
          return typeof s.shop_name === 'string' ? s.shop_name : formatTranslated(s.shop_name as any);
        }
      }
    }
    return undefined;
  }, [selectedRestaurantShopId, productResponse?.variants]);

  /**
   * A product whose variants carry no shop link is invisible to the cart on the web
   * (shop_id = null) — flag it so the admin links at least one branch (§7/§8 of the
   * variants contract). Covers products saved while the backend ignored shop_variants.
   */
  const productMissingShopLink = useMemo(() => {
    if (!isEditMode || !productResponse) return false;
    const vars = productResponse.variants ?? [];
    if (vars.length === 0) return true;
    return !vars.some((v) => {
      const links = v.shops ?? (v as { shop_variants?: unknown[] }).shop_variants ?? [];
      return Array.isArray(links) && links.length > 0;
    });
  }, [isEditMode, productResponse]);

  const restaurantShopFetcher = useCallback(
    (page: number, limit: number) => {
      if (!categoryId || categoryId <= 0) {
        return Promise.resolve({
          data: { items: [], pagination: { current_page: 1, last_page: 1, per_page: limit, total: 0 } },
        });
      }
      return _ShopApi.getListShop({
        page,
        per_page: limit,
        category_id: categoryId,
        shop_type: 'restaurant',
      }).then((r) => ({
        data: {
          items: r.data.items.map((shop) => {
            const vendorId = Number(shop.vendor_id ?? shop.vendor?.id ?? 0);
            restaurantShopMetaRef.current.set(shop.id, { vendorId });
            return {
              id: shop.id,
              label: formatTranslated(shop.name as any),
            };
          }),
          pagination: r.data.pagination,
        },
      }));
    },
    [categoryId]
  );

  const handleRestaurantShopSelect = useCallback(
    (shopId: number) => {
      if (shopId <= 0) {
        setValue('shop_variants', []);
        return;
      }
      const meta = restaurantShopMetaRef.current.get(shopId);
      const vendorId = meta?.vendorId ?? 0;
      setValue('vendor_scope', 'external');
      if (vendorId > 0) setValue('vendor_id', vendorId);

      const existing = getValues('shop_variants') ?? [];
      const idx = existing.findIndex((sv) => Number(sv.variant_index) === 0);
      if (idx >= 0) {
        const next = [...existing];
        next[idx] = { ...next[idx], shop_id: shopId };
        setValue('shop_variants', next);
      } else {
        setValue('shop_variants', [...existing, { shop_id: shopId, variant_index: 0 }]);
      }

      // Seed the sole variant so create/update always has a row to send with shop_variants.
      const existingVariants = getValues('variants') ?? [];
      if (!existingVariants[0]) {
        const price = getValues('price');
        const quantity = getValues('quantity');
        setValue('variants', [
          {
            attributes_values_ids: [],
            images: [],
            existing_images_ids: [],
            price: price != null && !Number.isNaN(Number(price)) ? Number(price) : undefined,
            quantity:
              quantity != null && !Number.isNaN(Number(quantity)) ? Number(quantity) : undefined,
            is_trend: 0,
            is_active: 1,
          },
        ]);
      } else {
        if (getValues('variants.0.price') == null) {
          const price = getValues('price');
          setValue(
            'variants.0.price',
            price != null && !Number.isNaN(Number(price)) ? Number(price) : undefined
          );
        }
        if (getValues('variants.0.quantity') == null) {
          const quantity = getValues('quantity');
          setValue(
            'variants.0.quantity',
            quantity != null && !Number.isNaN(Number(quantity)) ? Number(quantity) : undefined
          );
        }
      }
    },
    [getValues, setValue]
  );

  /** Root category changed (not the initial edit-mode hydration) — its attributes no longer match existing variants. */
  useEffect(() => {
    const prev = prevMainCategoryIdRef.current;
    if (prev !== null && prev !== 0 && prev !== mainCategoryId) {
      setValue('variants', []);
    }
    prevMainCategoryIdRef.current = mainCategoryId;
  }, [mainCategoryId, setValue]);

  /** Effective category (any level) changed (not the initial edit-mode hydration) — clear category-specific state. */
  useEffect(() => {
    const prev = prevCategoryIdRef.current;
    if (prev !== null && prev !== 0 && prev !== categoryId) {
      setValue('category_details', []);
      if (isRestaurantToggle) {
        setValue('shop_variants', []);
        setValue('vendor_id', 0);
        restaurantShopMetaRef.current.clear();
      }
    }
    prevCategoryIdRef.current = categoryId;
  }, [categoryId, isRestaurantToggle, setValue]);

  const syncSelectedCategory = useCallback(
    (selectedCategoryId: number) => {
      setValue('category_id', selectedCategoryId, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  // Attributes always come from the root (level 1), even if the product is saved on a parent or leaf.
  const { data: categoryAttributesAll, isLoading: isLoadingAttributes } =
    useFetchCategoryAttributes(
      {
        page: 1,
        per_page: 100,
        category_id: mainCategoryId ? Number(mainCategoryId) : undefined,
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

  const { data: productExtraDetailsResp, isFetching: isFetchingProductExtraPresets } =
    useFetchProductExtraDetails(
      { page: 1, per_page: 500, category_id: categoryIdNum, is_active: true },
      { enabled: categoryIdNum > 0 }
    );
  const productExtraPresets: ProductExtraDetailRowApi[] =
    productExtraDetailsResp?.data?.items ?? [];

  const prevCategoryForExtrasRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      prevCategoryForExtrasRef.current !== null &&
      prevCategoryForExtrasRef.current !== categoryIdNum
    ) {
      setValue('extra_details', []);
    }
    prevCategoryForExtrasRef.current = categoryIdNum;
  }, [categoryIdNum, setValue]);

  const { data: boughtWithCategoriesResp } = useQuery({
    queryKey: ['categories', 'product-form-bought-with'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
    enabled: categoryIdNum > 0,
  });
  const boughtWithCategoryOptions = useMemo(
    () =>
      (boughtWithCategoriesResp?.data?.items ?? []).map((c: { id: number; name: unknown }) => ({
        value: c.id,
        label: formatTranslated(c.name as Parameters<typeof formatTranslated>[0]),
      })),
    [boughtWithCategoriesResp?.data?.items]
  );

  const boughtWithCategoryIds = useMemo(() => {
    const ids: number[] = [];
    if (categoryIdNum > 0) ids.push(categoryIdNum);
    for (const x of boughtWithExtraCategoryIds) {
      const n = Number(x);
      if (n > 0 && !ids.includes(n)) ids.push(n);
    }
    return ids;
  }, [categoryIdNum, boughtWithExtraCategoryIds]);

  useEffect(() => {
    setBoughtWithExtraCategoryIds((prev) => prev.filter((x) => x !== categoryIdNum));
  }, [categoryIdNum]);

  const boughtWithProductQueries = useQueries({
    queries: boughtWithCategoryIds.map((cid) => ({
      queryKey: ['product', 'list-for-select', cid],
      queryFn: () =>
        axiosInstance
          .get(apiRoutes.product.list, {
            params: { per_page: 200, category_id: cid },
          })
          .then((r) => r.data),
      enabled: cid > 0,
    })),
  });

  const allProducts: any[] = useMemo(() => {
    const map = new Map<number, any>();
    for (const q of boughtWithProductQueries) {
      const raw = q.data as any;
      const items = raw?.data?.data ?? raw?.data?.items ?? [];
      for (const p of items) {
        const pid = Number(p.id);
        if (!map.has(pid)) map.set(pid, p);
      }
    }
    return [...map.values()];
  }, [boughtWithProductQueries]);

  const boughtWithListReady =
    boughtWithCategoryIds.length > 0 &&
    boughtWithProductQueries.every((q) => q.isFetched);
  const isFetchingBoughtWithList = boughtWithProductQueries.some((q) => q.isFetching);

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
  /** Only this variant row renders as an open/editable card; the rest render collapsed. */
  const [openVariantIndex, setOpenVariantIndex] = useState<number | null>(null);
  const { fields: extraDetailsFields, append: appendExtraDetail, remove: removeExtraDetail } =
    useFieldArray({ control, name: 'extra_details' });
  const { fields: categoryDetailsFields, append: appendCategoryDetail, remove: removeCategoryDetail } =
    useFieldArray({ control, name: 'category_details' });
  const watchedCategoryDetailRows = useWatch({ control, name: 'category_details' }) ?? [];
  const watchedExtraDetailsRows = useWatch({ control, name: 'extra_details' }) ?? [];
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
      setOpenVariantIndex((cur) => {
        if (cur == null) return cur;
        if (cur === variantIndex) return null;
        return cur > variantIndex ? cur - 1 : cur;
      });
    },
    [getValues, setValue, removeVariant]
  );

  /**
   * Server-side delete for variants that already exist. The form row is dropped only after
   * the API confirms, so a card can never silently disappear while still existing on the
   * backend. The dialog lists the delete's impact (baskets, recipes, order history) first.
   */
  const variantDeleteFlow = useVariantDeleteFlow<number>({
    target: 'product_variant',
    onDeleted: (_id, variantIndex) => {
      handleRemoveVariant(variantIndex);
      toast.success(t('form.variantDeleteSuccess'));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('form.variantDeleteFailed'))),
  });

  /**
   * Single entry point for every "remove variant" control (collapsed-row trash icon,
   * open-card remove button). Rows that were never saved are just dropped from the form.
   */
  const requestVariantDelete = variantDeleteFlow.requestDelete;
  const confirmAndRemoveVariant = useCallback(
    async (variantIndex: number) => {
      const variantId = getValues(`variants.${variantIndex}.id`);
      if (variantId && isEditMode) {
        await requestVariantDelete(variantId, variantIndex);
        return;
      }
      if (!window.confirm(t('form.variantRemoveConfirm'))) return;
      handleRemoveVariant(variantIndex);
    },
    [getValues, isEditMode, requestVariantDelete, handleRemoveVariant, t]
  );

  /**
   * Add ONE new variant to an existing product without disturbing the others.
   * Sends PUT /products/{id} with `variants[]` containing existing rows (id-only)
   * plus the new variant (full data). Matches the new variant back from the
   * response by sorted `attributes_values_ids` and returns its id.
   */
  const createSingleVariantOnProduct = useCallback(
    async (args: {
      productId: number | string;
      variantIndex: number;
      attrIds: number[];
      images: File[] | undefined;
      sku: string;
      model: string;
      barcode: string;
      nameEn: string;
      nameAr: string;
      price: number | undefined;
      quantity: number | undefined;
    }): Promise<number> => {
      const {
        productId,
        variantIndex,
        attrIds,
        images,
        sku,
        model,
        barcode,
        nameEn,
        nameAr,
        price,
        quantity,
      } = args;
      const allVariants = getValues('variants') ?? [];
      const apiVariantsPayload: NonNullable<ProductCreateUpdatePayload['variants']> = [];
      allVariants.forEach((row, idx) => {
        if (idx === variantIndex) {
          const cleaned = toVariantPayload({
            ...row,
            attributes_values_ids: attrIds,
            images,
            sku,
            model,
            barcode,
            name: { en: nameEn, ar: nameAr },
            price,
            quantity,
          });
          if (cleaned) apiVariantsPayload.push(cleaned);
        } else if (row?.id) {
          // Full whitelist for existing rows: a replace without price/quantity/images
          // would reset those fields to product defaults / delete media.
          const cleaned = toVariantPayload(row as Record<string, unknown>, { omitImages: true });
          if (cleaned) apiVariantsPayload.push(cleaned);
        }
      });
      const resp = await _ProductApi.updateProductVariantsOnly(productId, {
        variants: apiVariantsPayload,
      });
      const updatedVariants: any[] = Array.isArray(resp?.data?.variants)
        ? resp.data.variants
        : [];
      const sortedTarget = [...attrIds].sort((a, b) => a - b);
      const match = updatedVariants.find((cv) => {
        const cvIds = extractVariantAttributeValueIds(cv);
        if (cvIds.length !== sortedTarget.length) return false;
        return cvIds.every((vid, i) => vid === sortedTarget[i]);
      });
      return match?.id ? Number(match.id) : 0;
    },
    [getValues]
  );

  /**
   * Add ONE new shop variant to an existing product/variant pair without disturbing other rows.
   * Returns the newly-created shop_variant id (or 0 if not matched in response).
   */
  const createSingleShopVariantOnProduct = useCallback(
    async (args: {
      productId: number | string;
      parentVariantId: number;
      parentVariantIndex: number;
      shopId: number;
      costPrice: number | undefined;
    }): Promise<number> => {
      const { productId, parentVariantId, parentVariantIndex, shopId, costPrice } = args;
      const allVariants = getValues('variants') ?? [];
      const allShopVariants = getValues('shop_variants') ?? [];

      // Map original variant index -> remapped index in the payload (we send only variants with id).
      const variantsPayload: NonNullable<ProductCreateUpdatePayload['variants']> = [];
      const remap = new Map<number, number>();
      allVariants.forEach((row, idx) => {
        if (row?.id) {
          remap.set(idx, variantsPayload.length);
          const cleaned = toVariantPayload(row as Record<string, unknown>, { omitImages: true });
          if (cleaned) variantsPayload.push(cleaned);
        }
      });

      const shopVariantsPayload: NonNullable<ProductCreateUpdatePayload['shop_variants']> = [];
      // shop_variants is a full replace: send the complete kept list (not only the new row).
      allShopVariants.forEach((sv) => {
        if (!sv?.id) return;
        const remappedIdx = remap.get(Number(sv.variant_index));
        if (remappedIdx == null) return;
        const cleaned = toShopVariantPayload({ ...sv, variant_index: remappedIdx });
        if (cleaned) shopVariantsPayload.push(cleaned);
      });
      const parentRemapped = remap.get(parentVariantIndex);
      if (parentRemapped == null) {
        return 0;
      }
      const newShopRow = toShopVariantPayload({
        shop_id: shopId,
        variant_index: parentRemapped,
        cost_price: costPrice,
      });
      if (newShopRow) shopVariantsPayload.push(newShopRow);

      const resp = await _ProductApi.updateProductVariantsOnly(productId, {
        variants: variantsPayload,
        shop_variants: shopVariantsPayload,
      });
      const updatedVariants: any[] = Array.isArray(resp?.data?.variants)
        ? resp.data.variants
        : [];
      // The backend wipes and recreates EVERY shop-variant row of the variants it receives
      // (ProductService::syncVariantsAndShopLinks), so the `id`s the other rows still hold in
      // form state are dead the moment this call returns. Re-sync them all from the response,
      // keyed by (parent variant id, shop id) — otherwise the per-row save/delete buttons hit
      // shop-product-variants/{staleId}.
      const freshShopVariantIds = new Map<string, number>();
      updatedVariants.forEach((uv) => {
        const uvId = Number(uv?.id);
        if (!uvId) return;
        extractCreatedShopVariants(uv).forEach((csv) => {
          const csvShopId = getShopIdFromCreatedShopVariant(csv);
          const csvId = Number(csv?.id);
          if (csvShopId > 0 && csvId > 0) {
            freshShopVariantIds.set(`${uvId}:${csvShopId}`, csvId);
          }
        });
      });
      if (freshShopVariantIds.size > 0) {
        const variantRowsAfterSave = getValues('variants') ?? [];
        const currentShopVariants = getValues('shop_variants') ?? [];
        let anyIdChanged = false;
        const resyncedShopVariants = currentShopVariants.map((sv) => {
          const parentId = Number(variantRowsAfterSave[Number(sv?.variant_index)]?.id ?? 0);
          const svShopId = Number(sv?.shop_id);
          if (!parentId || !svShopId) return sv;
          const fresh = freshShopVariantIds.get(`${parentId}:${svShopId}`);
          if (!fresh || fresh === Number(sv?.id)) return sv;
          anyIdChanged = true;
          return { ...sv, id: fresh };
        });
        if (anyIdChanged) {
          setValue('shop_variants', resyncedShopVariants, { shouldDirty: false });
        }
      }
      const parentRow = updatedVariants.find((v) => Number(v?.id) === Number(parentVariantId));
      const created = extractCreatedShopVariants(parentRow).find(
        (csv) => getShopIdFromCreatedShopVariant(csv) === shopId
      );
      return created?.id ? Number(created.id) : 0;
    },
    [getValues, setValue]
  );

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && productResponse && !isLoadingProduct) {
      const p = productResponse;
      const sk = p.seo_keywords as { en?: string[]; ar?: string[] } | null | undefined;
      skipRestaurantToggleReset.current = true;
      setHasSelectedProductType(true);
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
        /** Synced from `price` in useEffect once USD/SYP rates are ready */
        price_local: undefined,
        price: p.price == null || Number.isNaN(Number(p.price)) ? undefined : Number(p.price),
        discount:
          p.discount != null && String(p.discount).trim() !== ''
            ? Number(p.discount)
            : undefined,
        discount_type: (p.discount_type as 'none' | 'percentage' | 'fixed') || 'none',
        cost_price: p.cost_price != null ? Number(p.cost_price) : undefined,
        quantity:
          p.quantity != null && String(p.quantity).trim() !== '' && !Number.isNaN(Number(p.quantity))
            ? Number(p.quantity)
            : undefined,
        unit_id: p.unit_id != null && Number(p.unit_id) > 0 ? Number(p.unit_id) : 0,
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
        is_restaurant: Boolean(p.is_restaurant ?? p.category?.is_restaurant),
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
            price: (v as any).price != null ? Number((v as any).price) : undefined,
            quantity: (v as any).quantity != null ? Number((v as any).quantity) : undefined,
            stock: (v as any).stock != null ? Number((v as any).stock) : undefined,
            max_purchase_quantity: (v as any).max_purchase_quantity != null ? Number((v as any).max_purchase_quantity) : undefined,
            delivery_time: (v as any).delivery_time ?? '',
            is_trend: Number((v as any).is_trend) === 1 ? 1 : 0,
            is_active: (v as any).is_active === false || Number((v as any).is_active) === 0 ? 0 : 1,
          })) ?? [],
        category_details:
          p.category_details?.map((cd) => ({
            id: cd.id,
            category_detail_id: 0,
            detail_value: { en: cd.value?.en ?? '', ar: cd.value?.ar ?? '' },
          })) ?? [],
        extra_details:
          p.extra_details?.map((ed: any) => ({
            id: ed.id,
            product_extra_detail_id: Number(ed.product_extra_detail_id) || 0,
            quantity: ed.quantity != null ? Number(ed.quantity) : 1,
            price:
              ed.price !== '' && ed.price != null && !Number.isNaN(Number(ed.price))
                ? Number(ed.price)
                : 0,
          })) ?? [],
        bought_with: (p.bought_with ?? [])
          .map((v: any) => (typeof v === 'object' && v?.id != null ? v.id : v))
          .filter((v) => v != null && v !== '' && !Number.isNaN(Number(v)))
          .map((v) => Number(v)),
        shop_variants:
          p.variants?.flatMap((v, vIndex) => {
            const shopLinks =
              Array.isArray(v.shops) && v.shops.length > 0
                ? v.shops
                : ((v as { shop_variants?: unknown[] }).shop_variants ?? []);
            return shopLinks.map((s: any) => ({
              id: s.id != null ? Number(s.id) : undefined,
              shop_id: Number(s.shop_id ?? s.shop?.id),
              variant_index: vIndex,
              cost_price: s.cost_price != null ? Number(s.cost_price) : undefined,
            }));
          }) ?? [],
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

  // Resolve product_extra_detail_id when editing (API may only return key/value on the pivot).
  useEffect(() => {
    if (!isEditMode || !productResponse?.extra_details?.length || !id || categoryIdNum <= 0) {
      return;
    }
    const presets = productExtraPresets;
    if (!presets.length) return;

    const rows = (getValues('extra_details') ?? []) as Array<{
      id?: number;
      product_extra_detail_id?: number;
      quantity?: number;
      price?: number;
    }>;
    if (!rows.length) return;

    const normalizeExtraLinePrice = (v: unknown) =>
      v !== '' && v != null && !Number.isNaN(Number(v)) ? Number(v) : 0;

    let changed = false;
    const next = rows.map((row) => {
      const qty =
        row.quantity != null && !Number.isNaN(Number(row.quantity)) ? Number(row.quantity) : 1;
      const linePrice = normalizeExtraLinePrice(row.price);
      const productExtraDetailId = Number(row.product_extra_detail_id) || 0;

      if (productExtraDetailId > 0) {
        return {
          id: row.id,
          product_extra_detail_id: productExtraDetailId,
          quantity: qty,
          price: linePrice,
        };
      }

      const pivot = productResponse.extra_details!.find((e: any) => Number(e.id) === Number(row.id));
      if (!pivot) {
        return {
          id: row.id,
          product_extra_detail_id: 0,
          quantity: qty,
          price: linePrice,
        };
      }

      const directId = Number((pivot as any).product_extra_detail_id);
      if (directId > 0) {
        changed = true;
        return {
          id: row.id,
          product_extra_detail_id: directId,
          quantity: qty,
          price: linePrice,
        };
      }

      const matched = findPresetIdForProductExtraPivot(
        { key: pivot.key, value: pivot.value },
        presets
      );
      if (!matched) {
        return {
          id: row.id,
          product_extra_detail_id: 0,
          quantity: qty,
          price: linePrice,
        };
      }

      changed = true;
      return {
        id: row.id,
        product_extra_detail_id: matched,
        quantity: qty,
        price: linePrice,
      };
    });

    if (changed) {
      setValue('extra_details', next, { shouldValidate: false });
    }
  }, [
    isEditMode,
    id,
    categoryIdNum,
    productExtraPresets,
    productResponse?.extra_details,
    getValues,
    setValue,
  ]);

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
      const matchedAttr = (categoryAttributes as any[]).find((a: any) =>
        (a.values || []).some((val: any) => ids.includes(Number(val.id)))
      );
      return {
        id: v.id,
        category_attribute_id: matchedAttr?.id ?? (prev as any)?.category_attribute_id,
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
        price:
          (prev as any)?.price ??
          ((v as any).price != null ? Number((v as any).price) : undefined),
        quantity:
          (prev as any)?.quantity ??
          ((v as any).quantity != null ? toOptionalInt((v as any).quantity) : undefined),
        stock: (prev as any)?.stock ?? ((v as any).stock != null ? Number((v as any).stock) : undefined),
        max_purchase_quantity: (prev as any)?.max_purchase_quantity ?? ((v as any).max_purchase_quantity != null ? Number((v as any).max_purchase_quantity) : undefined),
        delivery_time: (prev as any)?.delivery_time ?? (v as any).delivery_time ?? '',
        is_trend:
          (prev as any)?.is_trend ??
          (Number((v as any).is_trend) === 1 ? 1 : 0),
        is_active:
          (prev as any)?.is_active ??
          ((v as any).is_active === false || Number((v as any).is_active) === 0 ? 0 : 1),
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

      // Keep existing rows (by id) even without attributes — dropping them would
      // soft-delete the backend default variant and break shop links. New rows
      // still need at least one attribute value, except the restaurant SKU.
      const rawVariantRows = payload.variants ?? [];
      const keepVariantRow = (v: (typeof rawVariantRows)[number], origIdx: number) => {
        const hasId = v.id != null && Number(v.id) > 0;
        const hasAttrs =
          Array.isArray(v.attributes_values_ids) && v.attributes_values_ids.length > 0;
        if (restaurantMode) return origIdx === 0 || hasId;
        return hasId || hasAttrs;
      };
      const validVariantEntries = rawVariantRows
        .map((v, origIdx) => ({ row: v, origIdx }))
        .filter(({ row: v, origIdx }) => keepVariantRow(v, origIdx));
      const validVariants = validVariantEntries.map(({ row }) => row);
      const validVariantOrigIndices = validVariantEntries.map(({ origIdx }) => origIdx);

      const variantIndexMap = new Map<number, number>();
      validVariantEntries.forEach(({ origIdx }, nextIdx) => {
        variantIndexMap.set(origIdx, nextIdx);
      });
      const remappedShopVariants = (payload.shop_variants ?? [])
        .filter((sv) => Number(sv.shop_id) > 0 && variantIndexMap.has(Number(sv.variant_index)))
        .map((sv) => ({
          ...sv,
          variant_index: variantIndexMap.get(Number(sv.variant_index))!,
        }));

      let variantsForPayload = restaurantMode
        ? validVariants.map((v) => ({ ...v, model: '', barcode: '' }))
        : validVariants;
      let shopVariantsForPayload = remappedShopVariants;

      // Restaurant products have no attribute-based variants. If the seeded row
      // is missing, send one minimal SKU and rebind shop rows to index 0.
      if (restaurantMode && variantsForPayload.length === 0) {
        const row0 = rawVariantRows[0] as
          | { id?: number; price?: number | string; quantity?: number | string; existing_images_ids?: number[] }
          | undefined;
        const toNum = (v: unknown) =>
          v == null || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v);
        variantsForPayload = [
          {
            ...(row0?.id ? { id: row0.id } : {}),
            attributes_values_ids: [],
            price: toNum(row0?.price) ?? toNum(payload.price),
            quantity: toNum(row0?.quantity) ?? toNum(payload.quantity),
            existing_images_ids: Array.isArray(row0?.existing_images_ids)
              ? row0!.existing_images_ids
              : [],
            is_active: 1,
            is_trend: 0,
          },
        ];
        shopVariantsForPayload = (payload.shop_variants ?? [])
          .filter((sv) => Number(sv.shop_id) > 0)
          .map((sv) => ({ ...sv, variant_index: 0 }));
      }

      const finalPayload = {
        ...payload,
        brand_id:
          payload.brand_id && payload.brand_id > 0
            ? payload.brand_id
            : isEditMode && !restaurantMode
              ? null
              : undefined,
        country_id: payload.country_id && payload.country_id > 0 ? payload.country_id : undefined,
        sale_country_id: payload.sale_country_id && payload.sale_country_id > 0 ? payload.sale_country_id : undefined,
        variants: variantsForPayload,
        shop_variants: shopVariantsForPayload,
        category_details: payload.category_details?.filter(
          (cd) => cd.category_detail_id && cd.category_detail_id > 0
        ),
        unit_id: payload.unit_id && payload.unit_id > 0 ? payload.unit_id : undefined,
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
      const variantsCompressed = (
        await Promise.all(
          (finalPayload.variants ?? []).map(async (v, k) => {
            const imgs = v.images?.length ? await compressImages(v.images) : v.images;
            const origIdx = validVariantOrigIndices[k] ?? k;
            const liveRow = (getValues('variants') ?? [])[origIdx];
            return toVariantPayload({
              ...(liveRow as Record<string, unknown> | undefined),
              ...(v as Record<string, unknown>),
              images: imgs,
            });
          })
        )
      ).filter((row): row is NonNullable<typeof row> => row != null);
      const shopVariantsCleaned = (finalPayload.shop_variants ?? [])
        .map((sv) => toShopVariantPayload(sv as Record<string, unknown>))
        .filter((sv): sv is NonNullable<typeof sv> => sv != null);
      let thumb = finalPayload.thumbnail;
      if (thumb instanceof File) thumb = await compressImage(thumb);
      let seoImg = finalPayload.seo_image;
      if (seoImg instanceof File) seoImg = await compressImage(seoImg);
      const uploadPayload = {
        ...finalPayload,
        images: productImagesCompressed,
        variants: variantsCompressed,
        shop_variants: shopVariantsCleaned,
        thumbnail: thumb,
        seo_image: seoImg,
      };
      const {
        vendor_scope: _omitVendorScope,
        price_currency_id: _omitPriceCurrencyId,
        price_local: _omitPriceLocal,
        is_restaurant: _omitIsRestaurant,
        ...apiPayload
      } = uploadPayload;

      const stripSeoIfNoFile = (p: Record<string, unknown>) => {
        if (!(p.seo_image instanceof File)) {
          delete p.seo_image;
        }
      };
      // Never send empty arrays: `[]` wipes all variants / branch links on the backend.
      const stripEmptyNestedArrays = (p: Record<string, unknown>) => {
        if (!Array.isArray(p.variants) || p.variants.length === 0) delete p.variants;
        if (!Array.isArray(p.shop_variants) || p.shop_variants.length === 0) {
          delete p.shop_variants;
        }
      };
      const notifySaved = (resp: unknown, created: boolean) => {
        toast.success(created ? t('form.productCreatedSuccess') : t('form.productUpdatedSuccess'));
        const responseMissingLink =
          responseIncludesVariants(resp) && !savedProductHasShopLink(resp);
        const createdWithoutShops = created && shopVariantsCleaned.length === 0;
        if (responseMissingLink || createdWithoutShops) {
          toast.warning(t('form.productSavedWithoutShopLink'));
        }
      };

      if (isEditMode && id) {
        const editApiPayload = { ...(apiPayload as object) } as Record<string, unknown>;
        stripSeoIfNoFile(editApiPayload);
        stripEmptyNestedArrays(editApiPayload);
        console.log('[Product Form] Sending update payload:', { id, data: editApiPayload });
        const updateResponse = await updateProductMutation.mutateAsync({
          id,
          data: editApiPayload as unknown as ProductCreateUpdatePayload,
        });
        notifySaved(updateResponse, false);
      } else {
        const createPayload = { ...(apiPayload as object) } as Record<string, unknown>;
        stripSeoIfNoFile(createPayload);
        stripEmptyNestedArrays(createPayload);
        console.log('[Product Form] Sending create payload:', createPayload);
        const createResponse = await createProductMutation.mutateAsync(
          createPayload as unknown as ProductCreateUpdatePayload
        );
        const newProductId = Number(createResponse?.data?.id ?? createResponse?.id ?? 0);
        notifySaved(createResponse, true);
        if (newProductId > 0) {
          navigate(paths.dashboard.product.update(newProductId));
          return;
        }
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
    if (restaurantMode && productFormTab === 'variants') {
      setProductFormTab('basic');
    }
  }, [restaurantMode, productFormTab]);

  /** Index of the variant row currently being created via PUT /products/{id}. */
  const [variantCreateBusyIdx, setVariantCreateBusyIdx] = useState<number | null>(null);
  /** Field-array index of the shop-variant row currently being created via PUT /products/{id}. */
  const [shopVariantCreateBusyIdx, setShopVariantCreateBusyIdx] = useState<number | null>(null);

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
          {!restaurantMode && (
            <Tab value="variants" label={t('form.productFormTabVariants')} />
          )}
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

        {/* ─── Product type (first input) ───────────────────────── */}
        <Controller
          name="is_restaurant"
          control={control}
          render={({ field }) => (
            <Box className="p-4 rounded-xl border border-border/60 bg-background/60 space-y-3">
              <Box className="flex items-center gap-2">
                <Iconify icon="solar:shop-bold" className="text-primary" width={18} height={18} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.productTypeSection')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground block">
                {t('form.productTypeSectionHelper')}
              </Typography>
              <Box className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="w-4 h-4"
                    checked={hasSelectedProductType && field.value === false}
                    onChange={() => {
                      field.onChange(false);
                      setHasSelectedProductType(true);
                    }}
                  />
                  {t('form.productTypeRetail')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="w-4 h-4"
                    checked={hasSelectedProductType && field.value === true}
                    onChange={() => {
                      field.onChange(true);
                      setHasSelectedProductType(true);
                    }}
                  />
                  {t('form.productTypeRestaurant')}
                </label>
              </Box>
            </Box>
          )}
        />

        {!hasSelectedProductType && (
          <Box className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-6 text-center">
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.selectProductTypeFirst')}
            </Typography>
          </Box>
        )}

        {hasSelectedProductType && (
          <>

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

        {/* ─── Missing branch link warning ──────────────────────── */}
        {productMissingShopLink && (
          <Box className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
            <Iconify
              icon="solar:danger-triangle-bold"
              className="text-destructive shrink-0 mt-0.5"
              width={20}
            />
            <div>
              <Typography variant="subtitle2" className="font-semibold text-destructive">
                {t('form.productNoShopLinkTitle')}
              </Typography>
              <Typography variant="caption" className="text-destructive/80">
                {t('form.productNoShopLinkHelper')}
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

          <CategoryLeafCascadeFields
            t={t}
            legacyMode={false}
            flatItems={flatCategoryItems}
            flatParentFetched={flatCategoriesFetched}
            flatParentDataUpdatedAt={flatCategoriesUpdatedAt ?? 0}
            hydrateLeafCategoryId={hydrateLeafCategoryId}
            hydrationKey={categoryHydrationKey}
            onEffectiveLeafChange={syncSelectedCategory}
            isRestaurant={categoryRestaurantFilter}
            onMainCategoryChange={setMainCategoryId}
            allowAnyLevel
          />

          {isRestaurantToggle && categoryId > 0 ? (
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:shop-2-bold" className="text-orange-500" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.selectRestaurant')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground mb-2 block">
                {t('form.selectRestaurantHelper')}
              </Typography>
              <InfiniteScrollSelect
                value={selectedRestaurantShopId}
                onChange={(shopId) => handleRestaurantShopSelect(shopId)}
                queryKey={[
                  'shops',
                  'infinite',
                  'product-form',
                  'restaurant-by-category',
                  categoryId,
                ]}
                fetcher={restaurantShopFetcher}
                placeholder={t('form.selectRestaurantPlaceholder')}
                initialLabel={selectedRestaurantShopInitialLabel}
                clearable
              />
            </Box>
          ) : null}

          {isRestaurantToggle && selectedRestaurantShopId > 0 ? (
            <ProductShopVariantsSection
              variantIndex={0}
              shops={
                shops.length > 0
                  ? shops
                  : [{ id: selectedRestaurantShopId, name: selectedRestaurantShopInitialLabel ?? '' }]
              }
              shopVariantsFields={shopVariantsFields}
              watchedShopVariants={watchedShopVariants}
              control={control}
              watch={watch}
              setValue={setValue}
              appendShopVariant={appendShopVariant}
              removeShopVariant={removeShopVariant}
              isEditMode={isEditMode}
              productId={id}
              shopVariantCreateBusyIdx={shopVariantCreateBusyIdx}
              setShopVariantCreateBusyIdx={setShopVariantCreateBusyIdx}
              updateShopVariantMutation={updateShopVariantMutation}
              createSingleShopVariantOnProduct={createSingleShopVariantOnProduct}
              embedded
              hideShopSelect
              hideAddButton
              requireParentVariantId={false}
            />
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
                      <div className="flex gap-2">
                        <input
                          {...field}
                          type="text"
                          placeholder={t('form.skuPlaceholder')}
                          className={fieldInputClass(!!error)}
                        />
                        <button
                          type="button"
                          title={t('form.generateSku')}
                          onClick={() => field.onChange(generateRandomSku())}
                          className="flex items-center justify-center rounded-md border border-border bg-muted px-2 hover:bg-muted/80 transition-colors"
                        >
                          <Iconify icon="solar:shuffle-bold" width={18} />
                        </button>
                      </div>
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
                    window.open(paths.dashboard.brand.create, '_blank')
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
                clearable
              />
            </Box>
          )}

          {/* Vendor source (For me / Out) — retail products only */}
          {!isRestaurantToggle && (
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
                {vendorScope === 'external' && !isRestaurantToggle && (
              <Box className="mt-3 space-y-4">
                <RHFInfiniteSelect
                  name="vendor_id"
                  queryKey={[
                    'vendors',
                    'infinite',
                    'product-form',
                    isRestaurantToggle ? 'restaurant' : 'retail',
                  ]}
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
          )}
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

        {/* ─── Price, discount, cost — price optional (nullable in API) ─ */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Box className="group md:col-span-2 lg:col-span-3">
            <Box className="flex flex-col gap-1 mb-2">
              <Box className="flex items-center gap-2">
                <Iconify icon="solar:dollar-bold" className="text-primary" width={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.productPriceOptionalSection')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground max-w-3xl">
                {t('form.productPriceOptionalHint')}
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
                          placeholder=""
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            field.onChange(toTwoDecimalNumber(e.target.value));
                          }}
                          className={fieldInputClass(!!error)}
                          step="0.01"
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
                      placeholder=""
                      value={(() => {
                        const pw = priceWatch;
                        if (pw == null || Number.isNaN(Number(pw))) return '';
                        const usdNum = Number(pw);
                        const syp = usdToLocalAmount(usdNum, parseCurrencyRate(sypCurrency!));
                        return syp;
                      })()}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const rate = parseCurrencyRate(sypCurrency!);
                        if (raw === '') {
                          setValue('price', undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          return;
                        }
                        const v = toTwoDecimalNumber(raw);
                        if (v == null) {
                          setValue('price', undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          return;
                        }
                        setValue('price', localAmountToUsd(v, rate), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className={fieldInputClass(!!errors.price)}
                      step="0.01"
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
                          placeholder=""
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            field.onChange(toTwoDecimalNumber(e.target.value));
                          }}
                          className={fieldInputClass(!!error)}
                          step="0.01"
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
                      placeholder=""
                      value={field.value === undefined || field.value === null ? '' : field.value}
                      onChange={(e) => {
                        field.onChange(toTwoDecimalNumber(e.target.value));
                      }}
                      className={fieldInputClass(!!error)}
                      step="0.01"
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            )}
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
                    placeholder=""
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    min={0}
                    max={discountTypeWatch === 'percentage' ? 100 : undefined}
                    onChange={(e) => field.onChange(toTwoDecimalNumber(e.target.value))}
                    className={fieldInputClass(!!error)}
                    step="0.01"
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
          </Box>
          <Box className="group md:col-span-2 lg:col-span-3">
            <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
              {t('form.productCostPriceOptional')}
            </Typography>
            {currenciesReady && activeCurrencies.length > 0 ? (
              productDualPriceReady ? (
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <Controller
                    name="cost_price"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Typography variant="caption" className="text-muted-foreground mb-1 block">
                          {t('form.productCostPriceUsdLabel')}
                          {usdCurrency?.symbol ? (
                            <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                          ) : null}
                        </Typography>
                        <input
                          {...field}
                          type="number"
                          placeholder=""
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            field.onChange(toTwoDecimalNumber(e.target.value));
                          }}
                          className={fieldInputClass(!!error)}
                          step="0.01"
                          min={0}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                  <div>
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                      {t('form.productCostPriceSypLabel')}
                      {sypCurrency?.symbol ? (
                        <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                      ) : null}
                    </Typography>
                    <input
                      type="number"
                      placeholder=""
                      value={(() => {
                        const cw = costPriceWatch;
                        if (cw == null || Number.isNaN(Number(cw))) return '';
                        const usdNum = Number(cw);
                        const syp = usdToLocalAmount(usdNum, parseCurrencyRate(sypCurrency!));
                        return syp;
                      })()}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const rate = parseCurrencyRate(sypCurrency!);
                        if (raw === '') {
                          setValue('cost_price', undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          return;
                        }
                        const v = toTwoDecimalNumber(raw);
                        if (v == null) {
                          setValue('cost_price', undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          return;
                        }
                        setValue('cost_price', localAmountToUsd(v, rate), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className={fieldInputClass(!!errors.cost_price)}
                      step="0.01"
                      min={0}
                    />
                  </div>
                </Box>
              ) : (
                <Controller
                  name="cost_price"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <input
                        {...field}
                        type="number"
                        placeholder=""
                        value={field.value === undefined || field.value === null ? '' : field.value}
                        onChange={(e) => {
                          field.onChange(toTwoDecimalNumber(e.target.value));
                        }}
                        className={fieldInputClass(!!error)}
                        step="0.01"
                        min={0}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              )
            ) : (
              <Controller
                name="cost_price"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      placeholder=""
                      value={
                        field.value === undefined || field.value === null ? '' : field.value
                      }
                      onChange={(e) =>
                        field.onChange(toTwoDecimalNumber(e.target.value))
                      }
                      className={fieldInputClass(!!error)}
                      step="0.01"
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            )}
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
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        field.onChange(undefined as unknown as ProductFormValues['quantity']);
                        return;
                      }
                      const n = Number(raw);
                      field.onChange(
                        (Number.isNaN(n) ? undefined : n) as ProductFormValues['quantity']
                      );
                    }}
                    className={fieldInputClass(!!error)}
                  />
                  <FieldErrorText message={error?.message} />
                </div>
              )}
            />
          </Box>
          <Box className="group">
            <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
              {t('form.unitSelectLabel')}
            </Typography>
            <Controller
              name="unit_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <select
                    className={fieldInputClass(!!error)}
                    value={!field.value ? '' : String(field.value)}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v ? Number(v) : 0);
                    }}
                  >
                    <option value="">{t('form.unitSelectPlaceholder')}</option>
                    {unitSelectOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
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
                    placeholder=""
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
                  min={
                    field.value && field.value < todayDateInputMin
                      ? field.value
                      : todayDateInputMin
                  }
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
                <LocalFilePreview
                  file={value instanceof File ? value : null}
                  label={t('form.thumbnailOptional')}
                />
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
            <>
            {categoryIdNum > 0 && boughtWithCategoryOptions.length > 0 ? (
              <Box className="mb-4 rounded-lg border border-border/60 bg-muted/20 p-3">
                <Typography variant="subtitle2" className="mb-1 font-semibold text-foreground">
                  {t('form.boughtWithExtraCategoriesLabel')}
                </Typography>
                <Typography variant="caption" className="mb-2 block text-muted-foreground">
                  {t('form.boughtWithExtraCategoriesHelper')}
                </Typography>
                <MultiSelect
                  options={boughtWithCategoryOptions.filter((o) => Number(o.value) !== categoryIdNum)}
                  value={boughtWithExtraCategoryIds}
                  onChange={(vals) => setBoughtWithExtraCategoryIds(vals.map((v) => Number(v)))}
                  placeholder={t('form.boughtWithExtraCategoriesPlaceholder')}
                  helperText={t('form.boughtWithExtraCategoriesHint')}
                  fullWidth
                />
              </Box>
            ) : null}
            <Box className="grid grid-cols-1 gap-2 md:grid-cols-2 max-h-52 overflow-y-auto rounded-lg border border-border p-3 lg:grid-cols-3">
              {allProducts
                .filter((p: any) => String(p.id) !== String(id))
                .map((p: any) => {
                  const pName =
                    typeof p.name === 'object' ? p.name?.en ?? p.name?.ar : p.name;
                  const selected = watchedBoughtWith.includes(Number(p.id));
                  return (
                    <Label
                      key={p.id}
                      className={`flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleBoughtWith(Number(p.id))}
                        className="h-4 w-4 shrink-0"
                      />
                      <Typography variant="caption" className="min-w-0 flex-1 text-foreground">
                        <span className="tabular-nums font-medium" dir="ltr">
                          #{p.id}
                        </span>{' '}
                        <span className="break-words">{pName}</span>
                      </Typography>
                    </Label>
                  );
                })}
            </Box>
            </>
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

        {/* ─── Extra Details (presets from category add-ons) ───── */}
        <Box className="border-t border-border pt-6">
          <Box className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
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
              disabled={categoryIdNum <= 0 || productExtraPresets.length === 0}
              onClick={() =>
                appendExtraDetail({
                  product_extra_detail_id: 0,
                  quantity: 1,
                  price: 0,
                })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addDetail')}
            </Button>
          </Box>

          {categoryIdNum <= 0 ? (
            <Typography variant="caption" className="text-muted-foreground block mb-3">
              {t('form.selectCategoryFirstExtraDetails')}
            </Typography>
          ) : isFetchingProductExtraPresets && productExtraPresets.length === 0 ? (
            <Typography variant="caption" className="text-muted-foreground block mb-3">
              {t('form.loadingProductExtraPresets')}
            </Typography>
          ) : productExtraPresets.length === 0 ? (
            <Typography variant="caption" className="text-muted-foreground block mb-3">
              {t('form.noProductExtraDetailsForCategory')}
            </Typography>
          ) : null}

          {typeof errors.extra_details?.message === 'string' && errors.extra_details.message ? (
            <Typography variant="caption" className="text-destructive block mb-3">
              {errors.extra_details.message}
            </Typography>
          ) : null}

          <Box className="space-y-4">
            {extraDetailsFields.map((field, index) => {
              const rowValues = watchedExtraDetailsRows as Array<{
                product_extra_detail_id?: number;
              }>;
              const currentPid = Number(rowValues[index]?.product_extra_detail_id) || 0;
              const takenIds = new Set(
                rowValues
                  .map((r, j) => (j !== index ? Number(r?.product_extra_detail_id) || 0 : 0))
                  .filter((n) => n > 0)
              );
              const rowOptions = productExtraPresets.filter(
                (p) => p.id === currentPid || !takenIds.has(p.id)
              );
              return (
                <Box key={field.id} className="p-4 border border-border rounded-lg space-y-3">
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Controller
                        name={`extra_details.${index}.product_extra_detail_id`}
                        control={control}
                        render={({ field: f, fieldState: { error } }) => (
                          <div>
                            <select
                              value={f.value ? String(f.value) : ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                f.onChange(v ? Number(v) : 0);
                              }}
                              onBlur={f.onBlur}
                              ref={f.ref}
                              className={fieldInputClass(!!error)}
                              disabled={
                                categoryIdNum <= 0 || rowOptions.length === 0 || !productExtraPresets.length
                              }
                            >
                              <option value="">{t('form.productExtraDetailSelectPlaceholder')}</option>
                              {rowOptions.map((pr) => (
                                <option key={pr.id} value={String(pr.id)}>
                                  {labelProductExtraPreset(pr)}
                                </option>
                              ))}
                            </select>
                            <FieldErrorText message={error?.message} />
                          </div>
                        )}
                      />
                    </div>
                    <Controller
                      name={`extra_details.${index}.quantity`}
                      control={control}
                      render={({ field: f, fieldState: { error } }) => (
                        <div>
                          <Typography
                            variant="subtitle2"
                            component="div"
                            className="font-semibold text-foreground mb-2"
                          >
                            {t('form.extraDetailQuantityLabel')}
                          </Typography>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            placeholder={t('form.extraQuantityOptional')}
                            value={
                              f.value === undefined || f.value === null ? '' : String(f.value)
                            }
                            onChange={(e) => {
                              const raw = e.target.value.trim();
                              if (raw === '') {
                                f.onChange(undefined);
                                return;
                              }
                              const n = Number.parseInt(raw, 10);
                              f.onChange(Number.isNaN(n) ? undefined : n);
                            }}
                            onBlur={f.onBlur}
                            name={f.name}
                            ref={f.ref}
                            className={fieldInputClass(!!error)}
                          />
                          <FieldErrorText message={error?.message} />
                        </div>
                      )}
                    />
                    <div>
                      <Typography
                        variant="subtitle2"
                        component="div"
                        className="font-semibold text-foreground mb-2"
                      >
                        {t('form.extraDetailPriceLabel')}
                      </Typography>
                      {currenciesReady && activeCurrencies.length > 0 ? (
                        productDualPriceReady ? (
                          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            <Controller
                              name={`extra_details.${index}.price`}
                              control={control}
                              render={({ field: f, fieldState: { error } }) => (
                                <div>
                                  <Typography
                                    variant="caption"
                                    className="text-muted-foreground mb-1 block"
                                  >
                                    {t('form.productPriceUsdLabel')}
                                    {usdCurrency?.symbol ? (
                                      <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                                    ) : null}
                                  </Typography>
                                  <input
                                    type="number"
                                    placeholder=""
                                    value={
                                      f.value === undefined || f.value === null ? '' : String(f.value)
                                    }
                                    onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                                    onBlur={f.onBlur}
                                    name={f.name}
                                    ref={f.ref}
                                    className={fieldInputClass(!!error)}
                                    step="0.01"
                                    min={0}
                                  />
                                  <FieldErrorText message={error?.message} />
                                </div>
                              )}
                            />
                            <div>
                              <Typography
                                variant="caption"
                                className="text-muted-foreground mb-1 block"
                              >
                                {t('form.productPriceSypLabel')}
                                {sypCurrency?.symbol ? (
                                  <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                                ) : null}
                              </Typography>
                              <input
                                type="number"
                                placeholder=""
                                value={(() => {
                                  const pw = watchedExtraDetailsRows[index]?.price;
                                  if (pw == null || Number.isNaN(Number(pw))) return '';
                                  return usdToLocalAmount(Number(pw), parseCurrencyRate(sypCurrency!));
                                })()}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const rate = parseCurrencyRate(sypCurrency!);
                                  if (raw === '') {
                                    setValue(`extra_details.${index}.price`, undefined, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                    return;
                                  }
                                  const v = toTwoDecimalNumber(raw);
                                  if (v == null) {
                                    setValue(`extra_details.${index}.price`, undefined, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                    return;
                                  }
                                  setValue(
                                    `extra_details.${index}.price`,
                                    localAmountToUsd(v, rate),
                                    {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    }
                                  );
                                }}
                                className={fieldInputClass(
                                  !!(errors.extra_details as any)?.[index]?.price
                                )}
                                step="0.01"
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
                              name={`extra_details.${index}.price`}
                              control={control}
                              render={({ field: f, fieldState: { error } }) => (
                                <div>
                                  <Typography
                                    variant="caption"
                                    className="text-muted-foreground mb-1 block"
                                  >
                                    {t('form.productPriceUsdLabel')}
                                  </Typography>
                                  <input
                                    type="number"
                                    placeholder=""
                                    value={
                                      f.value === undefined || f.value === null ? '' : String(f.value)
                                    }
                                    onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                                    onBlur={f.onBlur}
                                    name={f.name}
                                    ref={f.ref}
                                    className={fieldInputClass(!!error)}
                                    step="0.01"
                                    min={0}
                                  />
                                  <FieldErrorText message={error?.message} />
                                </div>
                              )}
                            />
                          </Box>
                        )
                      ) : (
                        <Box className="space-y-2">
                          {!currenciesReady ? (
                            <Typography
                              variant="caption"
                              className="text-muted-foreground block"
                            >
                              {t('form.productPriceCurrenciesLoading')}
                            </Typography>
                          ) : null}
                          <Controller
                            name={`extra_details.${index}.price`}
                            control={control}
                            render={({ field: f, fieldState: { error } }) => (
                              <div>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={
                                    f.value === undefined || f.value === null ? '' : String(f.value)
                                  }
                                  onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                                  onBlur={f.onBlur}
                                  name={f.name}
                                  ref={f.ref}
                                  className={fieldInputClass(!!error)}
                                  step="0.01"
                                  min={0}
                                />
                                <FieldErrorText message={error?.message} />
                              </div>
                            )}
                          />
                        </Box>
                      )}
                    </div>
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
              );
            })}
          </Box>
        </Box>
          </>
        )}
          </Box>
        )}

        {!restaurantMode && productFormTab === 'variants' && (
          <Box className="space-y-6">
        {!isEditMode && (
          <Box className="flex items-start gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <Iconify icon="solar:info-circle-bold" className="text-primary shrink-0 mt-0.5" width={20} />
            <div>
              <Typography variant="subtitle2" className="font-semibold text-primary">
                {t('form.variantsTabCreateModeTitle')}
              </Typography>
              <Typography variant="caption" className="text-foreground/80">
                {t('form.variantsTabCreateModeHint')}
              </Typography>
            </div>
          </Box>
        )}
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
              disabled={!mainCategoryId || mainCategoryId === 0 || categoryAttributes.length === 0}
              onClick={() => {
                const newIndex = variantsFields.length;
                appendVariant({
                  category_attribute_id: undefined,
                  attributes_values_ids: [],
                  images: [],
                  existing_images_ids: [],
                  sku: '',
                  model: '',
                  barcode: '',
                  name: { en: '', ar: '' },
                  price: undefined,
                  quantity: undefined,
                  stock: undefined,
                  max_purchase_quantity: undefined,
                  delivery_time: '',
                  is_trend: 0,
                  is_active: 1,
                });
                setOpenVariantIndex(newIndex);
              }}
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.addVariant')}
            </Button>
          </Box>

          {!mainCategoryId || mainCategoryId === 0 ? (
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
              <Box className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
                <Typography variant="caption" className="text-muted-foreground block">
                  {t('form.rootAttributesInheritedHint')}
                </Typography>
                {categoryAttributes.map((a: any) => {
                  const values = Array.isArray(a?.values) ? a.values : [];
                  return (
                    <Box key={a.id} className="space-y-1.5">
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {attributeLabel(a?.name)}
                      </Typography>
                      {values.length === 0 ? (
                        <Typography variant="caption" className="text-muted-foreground">
                          —
                        </Typography>
                      ) : (
                        <Box className="flex flex-wrap gap-1.5">
                          {values.map((val: any) => (
                            <span
                              key={val.id ?? attributeLabel(val?.name)}
                              className="inline-flex rounded-md border border-border/70 bg-background px-2 py-0.5 text-xs text-foreground"
                            >
                              {attributeLabel(val?.name)}
                            </span>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
              {variantsFields.length === 0 ? (
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.noVariantsYet')}
                </Typography>
              ) : (
            <Box className="space-y-3">
              {variantsFields.map((variant, variantIndex) => {
                const rowSelectedIds = (watch(`variants.${variantIndex}.attributes_values_ids`) ||
                  []) as number[];
                const chosenAttrId = watch(`variants.${variantIndex}.category_attribute_id`);
                const matchedAttr =
                  categoryAttributes.find((a: any) => Number(a.id) === Number(chosenAttrId)) ??
                  categoryAttributes.find((a: any) =>
                    (a.values || []).some((v: any) => rowSelectedIds.includes(Number(v.id)))
                  );
                const attr: any = matchedAttr;
                const attrRowLabel =
                  typeof attr?.name === 'object' && attr?.name
                    ? formatTranslated(attr.name as any)
                    : String(attr?.name ?? t('form.variantIndex', { n: variantIndex + 1 }));

                const attrNameLabel =
                  typeof attr?.name === 'object' ? attr.name?.en ?? attr.name?.ar : attr?.name;
                const found = (attr?.values || []).find((v: any) =>
                  rowSelectedIds.includes(Number(v.id))
                );
                const isColor = String(attr?.type).toLowerCase() === 'color';
                const colorInitialLabel = found ? formatTranslated(found.name as any) : undefined;
                const attrTypeLower = String(attr?.type ?? '').toLowerCase();
                const attrTypeLabel =
                  attrTypeLower === 'color'
                    ? t('form.categoryAttrTypeColor')
                    : attrTypeLower === 'select'
                      ? t('form.categoryAttrTypeSelect')
                      : attrTypeLower === 'text'
                        ? t('form.categoryAttrTypeText')
                        : String(attr?.type ?? '');

                if (variantIndex !== openVariantIndex) {
                  const foundValueLabel = found
                    ? typeof found.name === 'object'
                      ? formatTranslated(found.name as any)
                      : String(found.name)
                    : null;
                  const skuVal = watch(`variants.${variantIndex}.sku`);
                  const priceVal = watch(`variants.${variantIndex}.price`);
                  return (
                    <Box
                      key={variant.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenVariantIndex(variantIndex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setOpenVariantIndex(variantIndex);
                      }}
                      className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <Box className="min-w-0">
                        <Typography variant="subtitle2" className="font-semibold text-foreground truncate">
                          {attrRowLabel}
                          {foundValueLabel ? `: ${foundValueLabel}` : ''}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground truncate block">
                          {[
                            skuVal ? `SKU: ${skuVal}` : null,
                            priceVal != null && priceVal !== ('' as any) ? `$${priceVal}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || t('form.variantSummaryIncomplete')}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="text"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenVariantIndex(variantIndex);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="text"
                          size="small"
                          className="text-destructive"
                          disabled={variantDeleteFlow.isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmAndRemoveVariant(variantIndex);
                          }}
                        >
                          <Iconify icon="solar:trash-bin-bold" width={16} />
                        </Button>
                      </Box>
                    </Box>
                  );
                }

                return (
                <Box key={variant.id} className="p-4 border border-border rounded-lg space-y-4">
                  <Box className="flex items-center justify-between flex-wrap gap-2">
                    <Box className="flex items-center gap-2 flex-wrap">
                      <Typography variant="subtitle2" className="font-semibold text-foreground">
                        {attrRowLabel}
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
                    <Box className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenVariantIndex(null)}
                      >
                        <Iconify icon="solar:check-circle-bold" width={16} className="mr-1" />
                        {t('form.collapseVariant')}
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        size="small"
                        onClick={() => confirmAndRemoveVariant(variantIndex)}
                        className="text-destructive"
                        disabled={variantDeleteFlow.isDeleting}
                      >
                        <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                        {t('form.remove')}
                      </Button>
                    </Box>
                  </Box>

                  {/* Which category attribute this card represents */}
                  <Box className="group">
                    <select
                      value={attr?.id ?? 0}
                      onChange={(e) => {
                        const pickedAttrId = Number(e.target.value);
                        setValue(`variants.${variantIndex}.category_attribute_id`, pickedAttrId || undefined, {
                          shouldDirty: true,
                        });
                        setValue(`variants.${variantIndex}.attributes_values_ids`, [], {
                          shouldDirty: true,
                        });
                      }}
                      className={inputCls}
                    >
                      <option value={0}>{t('form.variantAttributeChooserPlaceholder')}</option>
                      {categoryAttributes.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {typeof a.name === 'object' ? a.name?.en ?? a.name?.ar : a.name}
                        </option>
                      ))}
                    </select>
                  </Box>

                  {/* This variant's attribute value select */}
                  <Box className="group">
                    {!attr ? null : (
                      <>
                        <Typography variant="caption" className="text-muted-foreground mb-1 block">
                          {attrRowLabel}
                        </Typography>
                        {isColor ? (
                      <Box className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <InfiniteScrollSelect
                            value={found ? Number(found.id) : 0}
                            onChange={(pickedId) => {
                              setValue(
                                `variants.${variantIndex}.attributes_values_ids`,
                                pickedId ? [pickedId] : [],
                                { shouldDirty: true }
                              );
                            }}
                            queryKey={[
                              'product-form',
                              'variant-attr-color',
                              attr?.id,
                              variantIndex,
                              (attr?.values ?? []).length,
                            ]}
                            fetcher={createAttributeValuesFetcher(attr?.values)}
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
                              setValue(`variants.${variantIndex}.attributes_values_ids`, [], {
                                shouldDirty: true,
                              });
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
                          setValue(
                            `variants.${variantIndex}.attributes_values_ids`,
                            pickedId ? [pickedId] : [],
                            { shouldDirty: true }
                          );
                        }}
                        className={inputCls}
                      >
                        <option value={0}>
                          {t('form.selectAttribute', { name: String(attrNameLabel ?? '') })}
                        </option>
                        {(attr?.values || []).map((val: any) => (
                          <option key={val.id} value={val.id}>
                            {typeof val.name === 'object' ? val.name?.en : val.name}
                          </option>
                        ))}
                      </select>
                    )}
                      </>
                    )}
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

                  {/* ─── Variant details: name + barcode (SKU/Model live under Product Info) ─── */}
                  <Box className="border-t border-border pt-4">
                    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      {!restaurantMode && (
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
                      )}
                    </Box>
                  </Box>

                  {/* ─── Pricing & availability ─── */}
                  <Box className="border-t border-border pt-4">
                    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productDualPriceReady ? (
                      <>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground mb-1 block">
                            {t('form.variantPriceUsdLabel')}
                            {usdCurrency?.symbol ? (
                              <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                            ) : null}
                          </Typography>
                          <Controller
                            name={`variants.${variantIndex}.price`}
                            control={control}
                            render={({ field: f, fieldState: { error } }) => (
                              <div>
                                <input
                                  type="number"
                                  placeholder={t('form.shopVariantPricePlaceholder')}
                                  name={f.name}
                                  ref={f.ref}
                                  onBlur={f.onBlur}
                                  value={optionalNumberInputDisplay(f.value)}
                                  onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                                  className={fieldInputClass(!!error)}
                                  step="any"
                                  min={0}
                                />
                                <FieldErrorText message={error?.message} />
                              </div>
                            )}
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-muted-foreground mb-1 block">
                            {t('form.variantPriceSypLabel')}
                            {sypCurrency?.symbol ? (
                              <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                            ) : null}
                          </Typography>
                          <input
                            type="number"
                            placeholder=""
                            step="any"
                            min={0}
                            value={(() => {
                              const pw = watchedVariants[variantIndex]?.price;
                              const usdNum = pw == null || Number.isNaN(Number(pw)) ? 0 : Number(pw);
                              const sypVal = usdToLocalAmount(usdNum, parseCurrencyRate(sypCurrency!));
                              return usdNum === 0 && sypVal === 0 ? '' : sypVal;
                            })()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const rate = parseCurrencyRate(sypCurrency!);
                              if (raw === '') {
                                setValue(`variants.${variantIndex}.price`, undefined as unknown as number, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                return;
                              }
                              const v = toTwoDecimalNumber(raw);
                              if (v == null) {
                                setValue(`variants.${variantIndex}.price`, undefined as unknown as number, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                return;
                              }
                              setValue(`variants.${variantIndex}.price`, localAmountToUsd(v, rate), {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            className={fieldInputClass(!!(errors.variants as any)?.[variantIndex]?.price)}
                          />
                        </Box>
                      </>
                    ) : (
                      <Box>
                        <Typography variant="caption" className="text-muted-foreground mb-1 block">
                          {t('form.variantPriceLabel')}
                        </Typography>
                        <Controller
                          name={`variants.${variantIndex}.price`}
                          control={control}
                          render={({ field: f, fieldState: { error } }) => (
                            <div>
                              <input
                                type="number"
                                placeholder={t('form.shopVariantPricePlaceholder')}
                                name={f.name}
                                ref={f.ref}
                                onBlur={f.onBlur}
                                value={optionalNumberInputDisplay(f.value)}
                                onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                                className={fieldInputClass(!!error)}
                                step="0.01"
                              />
                              <FieldErrorText message={error?.message} />
                            </div>
                          )}
                        />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        {t('form.variantQuantityLabel')}
                      </Typography>
                      <Controller
                        name={`variants.${variantIndex}.quantity`}
                        control={control}
                        render={({ field: f, fieldState: { error } }) => (
                          <div>
                            <input
                              type="number"
                              placeholder={t('form.shopVariantQuantityPlaceholder')}
                              name={f.name}
                              ref={f.ref}
                              onBlur={f.onBlur}
                              value={optionalNumberInputDisplay(f.value)}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  f.onChange(undefined as unknown as number);
                                  return;
                                }
                                f.onChange(toOptionalInt(raw));
                              }}
                              className={fieldInputClass(!!error)}
                              step={1}
                              min={0}
                            />
                            <FieldErrorText message={error?.message} />
                            <Typography variant="caption" className="text-muted-foreground mt-1 block">
                              {t('form.variantQuantityHint')}
                            </Typography>
                          </div>
                        )}
                      />
                    </Box>
                    <Typography variant="caption" className="col-span-full text-muted-foreground/80 -mt-1">
                      {t('form.variantPriceQuantityHint')}
                    </Typography>
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
                              value={optionalNumberInputDisplay(field.value)}
                              onChange={(e) =>
                                field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                              }
                              className={fieldInputClass(!!error)}
                            />
                            <FieldErrorText message={error?.message} />
                            <Typography variant="caption" className="text-muted-foreground mt-1 block">
                              {t('form.variantStockHint')}
                            </Typography>
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
                              value={optionalNumberInputDisplay(field.value)}
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
                  </Box>

                  {/* ─── is_trend / is_active ─── */}
                  <Box className="flex flex-col gap-3 border-t border-border pt-4">
                    <Box className="flex items-center gap-3">
                      <Controller
                        name={`variants.${variantIndex}.is_trend`}
                        control={control}
                        render={({ field: f }) => (
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-primary"
                              checked={Number(f.value) === 1}
                              onChange={(e) => f.onChange(e.target.checked ? 1 : 0)}
                              onBlur={f.onBlur}
                              name={f.name}
                              ref={f.ref}
                            />
                            <Typography variant="body2" className="font-medium text-foreground">
                              {t('form.variantIsTrend')}
                            </Typography>
                          </label>
                        )}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.variantIsTrendHint')}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-3">
                      <Controller
                        name={`variants.${variantIndex}.is_active`}
                        control={control}
                        render={({ field: f }) => (
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-primary"
                              checked={Number(f.value ?? 1) === 1}
                              onChange={(e) => f.onChange(e.target.checked ? 1 : 0)}
                              onBlur={f.onBlur}
                              name={f.name}
                              ref={f.ref}
                            />
                            <Typography variant="body2" className="font-medium text-foreground">
                              {t('form.variantIsActive')}
                            </Typography>
                          </label>
                        )}
                      />
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('form.variantIsActiveHint')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ─── Variant Save / Delete (edit mode only) ─── */}
                  {isEditMode && (
                    <Box className="flex items-center gap-2 border-t border-border pt-3">
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        disabled={
                          updateVariantMutation.isPending ||
                          variantCreateBusyIdx === variantIndex
                        }
                        onClick={async () => {
                          const variantId = watch(`variants.${variantIndex}.id`);
                          const isTrendChecked = Number(watch(`variants.${variantIndex}.is_trend`)) === 1;
                          const isActiveChecked = Number(watch(`variants.${variantIndex}.is_active`) ?? 1) === 1;
                          const attrIds =
                            watch(`variants.${variantIndex}.attributes_values_ids`) || [];
                          if (
                            !variantId &&
                            (!Array.isArray(attrIds) || attrIds.length === 0)
                          ) {
                            toast.error(t('form.variantAttributesRequired'));
                            return;
                          }
                          const newImgs = watch(`variants.${variantIndex}.images`);
                          const rawImages =
                            Array.isArray(newImgs) && newImgs.length > 0 ? newImgs : undefined;
                          const images = rawImages?.length
                            ? await Promise.all(
                                rawImages.map((f) =>
                                  f instanceof File ? compressImage(f) : f
                                )
                              )
                            : undefined;
                          const skuVal = watch(`variants.${variantIndex}.sku`) ?? '';
                          const modelVal = restaurantMode
                            ? ''
                            : watch(`variants.${variantIndex}.model`) ?? '';
                          const barcodeVal = restaurantMode
                            ? ''
                            : watch(`variants.${variantIndex}.barcode`) ?? '';
                          const nameEn = watch(`variants.${variantIndex}.name.en`) ?? '';
                          const nameAr = watch(`variants.${variantIndex}.name.ar`) ?? '';
                          const priceRaw = watch(`variants.${variantIndex}.price`);
                          const priceVal =
                            priceRaw == null || priceRaw === ('' as any) ? undefined : Number(priceRaw);
                          const quantityRaw = watch(`variants.${variantIndex}.quantity`);
                          const quantityVal = toOptionalInt(quantityRaw);

                          if (variantId) {
                            try {
                              await updateVariantMutation.mutateAsync({
                                id: variantId,
                                data: {
                                  attributes_values_ids: attrIds,
                                  existing_images_ids:
                                    watch(`variants.${variantIndex}.existing_images_ids`) || [],
                                  images,
                                  sku: skuVal,
                                  model: modelVal,
                                  barcode: barcodeVal,
                                  name: { en: nameEn, ar: nameAr },
                                  is_trend: isTrendChecked ? 1 : 0,
                                  is_active: isActiveChecked ? 1 : 0,
                                  price: priceVal,
                                  quantity: quantityVal,
                                },
                              });
                              toast.success(t('form.variantSaveSuccess'));
                            } catch {
                              toast.error(t('form.variantSaveFailed'));
                            }
                          } else {
                            if (!id) {
                              toast.error(t('form.variantSaveProductFirst'));
                              return;
                            }
                            try {
                              setVariantCreateBusyIdx(variantIndex);
                              const newId = await createSingleVariantOnProduct({
                                productId: id,
                                variantIndex,
                                attrIds,
                                images,
                                sku: skuVal,
                                model: modelVal,
                                barcode: barcodeVal,
                                nameEn,
                                nameAr,
                                price: priceVal,
                                quantity: quantityVal,
                              });
                              if (newId > 0) {
                                setValue(`variants.${variantIndex}.id`, newId, {
                                  shouldDirty: false,
                                });
                                setValue(`variants.${variantIndex}.images`, [], {
                                  shouldDirty: false,
                                });
                                toast.success(t('form.variantCreateSuccess'));
                              } else {
                                toast.error(t('form.variantCreateFailed'));
                              }
                            } catch {
                              toast.error(t('form.variantCreateFailed'));
                            } finally {
                              setVariantCreateBusyIdx(null);
                            }
                          }
                        }}
                      >
                        <Iconify icon="solar:diskette-bold" width={16} className="mr-1" />
                        {watch(`variants.${variantIndex}.id`)
                          ? updateVariantMutation.isPending
                            ? t('form.savingVariant')
                            : t('form.saveVariant')
                          : variantCreateBusyIdx === variantIndex
                            ? t('form.savingVariant')
                            : t('form.createVariant')}
                      </Button>
                    </Box>
                  )}

                  <ProductShopVariantsSection
                    variantIndex={variantIndex}
                    shops={shops}
                    shopVariantsFields={shopVariantsFields}
                    watchedShopVariants={watchedShopVariants}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    appendShopVariant={appendShopVariant}
                    removeShopVariant={removeShopVariant}
                    isEditMode={isEditMode}
                    productId={id}
                    shopVariantCreateBusyIdx={shopVariantCreateBusyIdx}
                    setShopVariantCreateBusyIdx={setShopVariantCreateBusyIdx}
                    updateShopVariantMutation={updateShopVariantMutation}
                    createSingleShopVariantOnProduct={createSingleShopVariantOnProduct}
                  />
                </Box>
                );
              })}
            </Box>
              )}
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
                  <LocalFilePreview
                    file={value instanceof File ? value : null}
                    label={t('form.seoImageOptional')}
                  />
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
        <Box className="space-y-4 border-t border-border pt-6">
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

        {/* Shown before any saved variant is deleted — lists what the delete touches. */}
        <VariantDeleteImpactDialog {...variantDeleteFlow.dialogProps} />
      </CreateFormLayout>
  );
}
