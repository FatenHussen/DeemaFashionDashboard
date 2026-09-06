import type { MultiSelectOption } from 'src/shared/ui/multi-select';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { MultiSelect } from 'src/shared/ui/multi-select';

export type BoughtWithProduct = {
  id: number;
  name?: unknown;
  sku?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  images?: unknown;
};

type ProductFormBoughtWithSectionProps = {
  currentProductId?: string | number;
  products: BoughtWithProduct[];
  selectedIds: number[];
  onToggle: (productId: number) => void;
  onClear: () => void;
  isLoading?: boolean;
  hasCategory: boolean;
  categoryOptions: MultiSelectOption[];
  extraCategoryIds: number[];
  onExtraCategoriesChange: (ids: number[]) => void;
};

function resolveMediaUrl(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === 'object' && raw && 'url' in raw) {
    return resolveMediaUrl((raw as { url?: unknown }).url);
  }
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const s = raw.trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
  const base = CONFIG.serverUrl?.replace(/\/$/, '') ?? '';
  return base ? `${base}/${s.replace(/^\//, '')}` : s;
}

function productImageSrc(product: BoughtWithProduct): string | null {
  const firstGallery = Array.isArray(product.images) ? product.images[0] : null;
  return (
    resolveMediaUrl(product.thumbnail) ||
    resolveMediaUrl(product.image) ||
    resolveMediaUrl(firstGallery)
  );
}

function productLabel(product: BoughtWithProduct): string {
  return (
    formatTranslated(product.name as Parameters<typeof formatTranslated>[0], '') || `#${product.id}`
  );
}

function ProductThumb({ src, size = 'lg' }: { src?: string | null; size?: 'sm' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  const box =
    size === 'sm'
      ? 'h-8 w-8 rounded-md'
      : 'h-[4.5rem] w-full rounded-t-lg';

  if (!src || broken) {
    return (
      <Box
        className={`flex shrink-0 items-center justify-center bg-muted/50 text-muted-foreground ${box}`}
      >
        <Iconify icon="solar:box-bold" width={size === 'sm' ? 14 : 18} />
      </Box>
    );
  }

  return (
    <Box className={`shrink-0 overflow-hidden bg-muted/30 ${box}`}>
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </Box>
  );
}

export function ProductFormBoughtWithSection({
  currentProductId,
  products,
  selectedIds,
  onToggle,
  onClear,
  isLoading = false,
  hasCategory,
  categoryOptions,
  extraCategoryIds,
  onExtraCategoriesChange,
}: ProductFormBoughtWithSectionProps) {
  const { t } = useTranslation('table');
  const [search, setSearch] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const selectedOnly = showSelectedOnly && selectedIds.length > 0;

  const selectedSet = useMemo(() => new Set(selectedIds.map(Number)), [selectedIds]);

  const catalog = useMemo(
    () => products.filter((p) => String(p.id) !== String(currentProductId ?? '')),
    [products, currentProductId]
  );

  const productById = useMemo(() => {
    const map = new Map<number, BoughtWithProduct>();
    for (const p of catalog) map.set(Number(p.id), p);
    return map;
  }, [catalog]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => productById.get(Number(id))).filter(Boolean) as BoughtWithProduct[],
    [selectedIds, productById]
  );

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((p) => {
      const pid = Number(p.id);
      if (selectedOnly && !selectedSet.has(pid)) return false;
      if (!q) return true;
      const name = productLabel(p).toLowerCase();
      const sku = String(p.sku ?? '').toLowerCase();
      return name.includes(q) || sku.includes(q) || String(p.id).includes(q);
    });
  }, [catalog, search, selectedOnly, selectedSet]);

  return (
    <Box className="overflow-hidden rounded-xl border border-border bg-card">
      <Box className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <Box className="flex min-w-0 items-center gap-3">
          <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Iconify icon="solar:shop-bold" width={18} />
          </Box>
          <Typography variant="subtitle2" className="font-semibold text-foreground">
            {t('form.boughtWithTitle')}
          </Typography>
        </Box>
        {selectedIds.length > 0 ? (
          <Box className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t('form.boughtWithSelectedCount', { count: selectedIds.length })}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {t('form.boughtWithClearSelection')}
            </button>
          </Box>
        ) : null}
      </Box>

      <Box className="space-y-4 p-4 sm:p-5">
        {!hasCategory ? (
          <Typography variant="body2" className="text-muted-foreground">
            {t('form.selectCategoryFirstBoughtWith')}
          </Typography>
        ) : (
          <>
            <Box className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Input
                size="sm"
                fullWidth
                floatingLabel={false}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('form.boughtWithSearchPlaceholder')}
                startAdornment={
                  <Iconify icon="solar:magnifer-linear" width={16} className="text-muted-foreground" />
                }
              />
              {categoryOptions.length > 0 ? (
                <MultiSelect
                  options={categoryOptions}
                  value={extraCategoryIds}
                  onChange={(vals) => onExtraCategoriesChange(vals.map((v) => Number(v)))}
                  placeholder={t('form.boughtWithExtraCategoriesPlaceholder')}
                  fullWidth
                />
              ) : null}
            </Box>

            {selectedProducts.length > 0 ? (
              <Box className="flex gap-2 overflow-x-auto pb-1">
                {selectedProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onToggle(Number(p.id))}
                    title={productLabel(p)}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] py-1 pe-2 ps-1 text-start"
                  >
                    <ProductThumb src={productImageSrc(p)} size="sm" />
                    <span className="max-w-[9rem] truncate text-xs font-medium text-foreground">
                      {productLabel(p)}
                    </span>
                    <Iconify
                      icon="solar:close-circle-bold"
                      width={14}
                      className="shrink-0 text-muted-foreground"
                    />
                  </button>
                ))}
              </Box>
            ) : null}

            {selectedIds.length > 0 ? (
              <Box className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSelectedOnly(false)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    !selectedOnly
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('form.boughtWithFilterAll')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSelectedOnly(true)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    selectedOnly
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('form.boughtWithFilterSelected')}
                </button>
              </Box>
            ) : null}

            {isLoading && catalog.length === 0 ? (
              <Box className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Box
                    key={i}
                    className="overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                  >
                    <Box className="h-[4.5rem] animate-pulse bg-muted" />
                    <Box className="h-8 animate-pulse bg-muted/60" />
                  </Box>
                ))}
              </Box>
            ) : catalog.length === 0 ? (
              <Box className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-muted-foreground">
                <Iconify icon="solar:box-minimalistic-bold" width={28} className="opacity-40" />
                <span className="text-sm">{t('form.noProductsInCategoryBoughtWith')}</span>
              </Box>
            ) : visibleProducts.length === 0 ? (
              <Box className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                {t('form.boughtWithNoSearchResults')}
              </Box>
            ) : (
              <Box className="grid max-h-[22rem] grid-cols-3 gap-2 overflow-y-auto pe-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {visibleProducts.map((p) => {
                  const pid = Number(p.id);
                  const selected = selectedSet.has(pid);
                  const sku = String(p.sku ?? '').trim();

                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => onToggle(pid)}
                      aria-pressed={selected}
                      className={`overflow-hidden rounded-lg border text-start transition-colors ${
                        selected
                          ? 'border-primary bg-primary/[0.06] shadow-sm'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/20'
                      }`}
                    >
                      <Box className="relative">
                        <ProductThumb src={productImageSrc(p)} />
                        <span
                          className={`absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border/80 bg-background/90 text-transparent'
                          }`}
                        >
                          {selected ? (
                            <Iconify icon="solar:check-read-linear" width={10} />
                          ) : null}
                        </span>
                      </Box>
                      <Box className="space-y-0 p-1.5">
                        <span className="line-clamp-1 text-[11px] font-medium leading-tight text-foreground">
                          {productLabel(p)}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground" dir="ltr">
                          #{pid}
                          {sku ? ` · ${sku}` : ''}
                        </span>
                      </Box>
                    </button>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
