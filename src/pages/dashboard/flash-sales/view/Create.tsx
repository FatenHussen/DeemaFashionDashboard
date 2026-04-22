import type { MultiSelectOption } from '@/shared/ui/multi-select';
import type { ProductData } from '@/pages/dashboard/products/types/product.types';

import { toast } from 'react-toastify';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate } from 'react-router';
import { formatTranslated } from '@/utils/format-translated';
import { _VendorApi } from '@/pages/dashboard/vendor/api/vendor.services';
import { useFetchProducts } from '@/pages/dashboard/products/hooks/product';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFMultiSelect } from 'src/shared/components/hook-form/rhf-multi-select';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

import { useCreateFlashSale, useUpdateFlashSale, useFetchFlashSaleById } from '../hooks';
import {
  FlashSaleCreateSchema,
  buildFlashSalePayload,
  apiDateToDatetimeLocal,
  type FlashSaleFormValues,
  normalizeFlashSaleDiscountType,
} from '../validation';

// ----------------------------------------------------------------------

function defaultEndDateLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolveProductListImageUrl(img: string | null | undefined): string | null {
  if (img == null || String(img).trim() === '') return null;
  const s = String(img).trim();
  return s.startsWith('http') ? s : `${CONFIG.serverUrl}/${s.replace(/^\//, '')}`;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    data: detailRes,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useFetchFlashSaleById(id, Boolean(isEditMode && id));
  const detail = detailRes?.data;

  const { data: productsResponse } = useFetchProducts({ page: 1, limit: 500 });
  const createMutation = useCreateFlashSale();
  const updateMutation = useUpdateFlashSale();

  const productOptions: MultiSelectOption[] = useMemo(() => {
    const raw = productsResponse?.data as
      | { items?: ProductData[]; data?: ProductData[] }
      | undefined;
    const products = raw?.items ?? raw?.data ?? [];
    const byId = new Map<number, MultiSelectOption>();

    for (const p of products) {
      const img = p.thumbnail ?? p.image ?? (p.images?.[0] ? String(p.images[0]) : null);
      byId.set(p.id, {
        value: p.id,
        label:
          formatTranslated(p.name as Parameters<typeof formatTranslated>[0]) ||
          t('form.productFallbackLabel', { id: p.id }),
        imageUrl: resolveProductListImageUrl(img),
      });
    }

    const selectedIds = isEditMode ? detail?.product_ids ?? [] : [];
    for (const productId of selectedIds) {
      if (!byId.has(productId)) {
        byId.set(productId, {
          value: productId,
          label: t('form.productFallbackLabel', { id: productId }),
          imageUrl: null,
        });
      }
    }

    return Array.from(byId.values());
  }, [productsResponse?.data, t, isEditMode, detail?.product_ids]);

  const categoryFetcher = (page: number, limit: number) =>
    _CategoryApi.getListCategoriesPaginated({ page, per_page: limit }).then((r) => {
      const mapped = r.data.items.map((c) => ({
        id: c.id,
        label: formatTranslated(c.name as Parameters<typeof formatTranslated>[0]),
      }));
      return {
        data: {
          items: page === 1 ? [{ id: 0, label: t('form.flashSaleScopeNone') }, ...mapped] : mapped,
          pagination: r.data.pagination,
        },
      };
    });

  const vendorFetcher = (page: number, limit: number) =>
    _VendorApi.getListVendor({ page, limit }).then((r) => {
      const items = r.data?.items ?? [];
      const mapped = items.map((v) => ({
        id: v.id,
        label: formatTranslated(v.name as Parameters<typeof formatTranslated>[0]),
      }));
      return {
        data: {
          items: page === 1 ? [{ id: 0, label: t('form.flashSaleScopeNone') }, ...mapped] : mapped,
          pagination: r.data.pagination,
        },
      };
    });

  const defaultValues: FlashSaleFormValues = {
    name: '',
    end_date_local: defaultEndDateLocal(),
    is_active: true,
    discount_type: 'percent',
    discount: 15,
    product_ids: [],
    category_id: 0,
    vendor_id: 0,
  };

  const methods = useForm<FlashSaleFormValues>({
    resolver: zodResolver(FlashSaleCreateSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch } = methods;
  const flashSaleDiscountType = watch('discount_type');

  useEffect(() => {
    if (!isEditMode || !detail) return;
    reset({
      name: detail.name ?? '',
      end_date_local: apiDateToDatetimeLocal(detail.end_date),
      is_active: Boolean(detail.is_active),
      discount_type: normalizeFlashSaleDiscountType(detail.discount_type),
      discount: detail.discount,
      product_ids: detail.product_ids ?? [],
      category_id: 0,
      vendor_id: 0,
    });
  }, [isEditMode, detail, reset]);

  if (isEditMode && id && isLoadingDetail) return <LoadingScreen />;

  if (isEditMode && id && !isLoadingDetail && (isDetailError || !detail?.id)) {
    return (
      <>
        <title>{t('form.flashSaleFormTitleEdit')} | {CONFIG.appName}</title>
        <Box className="p-6 max-w-lg">
          <Typography variant="h6" className="mb-2">
            {t('form.flashSaleEditNotFound')}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {t('form.flashSaleEditNotFoundHint')}
          </Typography>
          <button
            type="button"
            className="text-primary underline text-sm"
            onClick={() => navigate(paths.dashboard.flashSales.root)}
          >
            {t('form.flashSaleBackToList')}
          </button>
        </Box>
      </>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const onSubmit = async (data: FlashSaleFormValues) => {
    try {
      const payload = buildFlashSalePayload(data);
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success(t('form.flashSaleUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.flashSaleCreatedSuccess'));
      }
      navigate(paths.dashboard.flashSales.root);
    } catch {
      /* 422 handled by axios interceptor */
    }
  };

  const handleCancel = () => navigate(paths.dashboard.flashSales.root);

  return (
    <>
      <title>
        {isEditMode
          ? `${t('form.flashSaleFormTitleEdit')} | ${CONFIG.appName}`
          : `${t('form.flashSaleFormTitleCreate')} | ${CONFIG.appName}`}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.flashSaleFormTitleEdit') : t('form.flashSaleFormTitleCreate')}
        description={
          isEditMode ? t('form.flashSaleFormDescEdit') : t('form.flashSaleFormDescCreate')
        }
        isEditMode={isEditMode}
        submitLabel={isEditMode ? t('edit') : t('create')}
        submittingLabel={isEditMode ? t('updating') : t('form.creating')}
      >
        {isEditMode ? (
          <Box className="rounded-xl border border-amber-300/40 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 flex items-center gap-3">
            <Iconify icon="solar:info-circle-bold" className="text-amber-600 dark:text-amber-400 shrink-0" width={18} />
            <Typography variant="body2" className="text-amber-700 dark:text-amber-300">
              {t('form.flashSaleEditScopeHint')}
            </Typography>
          </Box>
        ) : null}

        {/* ── Section: Basic Info ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:tag-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.flashSaleNameLabel')} & {t('form.flashSaleEndDateLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.flashSaleNameLabel')}
                </Typography>
              </Box>
              <RHFTextField name="name" placeholder={t('form.flashSaleNamePlaceholder')} fullWidth />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:calendar-date-bold" className="text-primary" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.flashSaleEndDateLabel')}
                </Typography>
              </Box>
              <RHFTextField name="end_date_local" type="datetime-local" fullWidth />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Discount ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:percent-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.discountType')} & {t('form.discountValue')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:percent-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.discountType')}
                </Typography>
              </Box>
              <RHFSelect
                name="discount_type"
                placeholder={t('form.discountType')}
                options={[
                  { value: 'percent', label: t('form.discountTypePercentage') },
                  { value: 'fixed', label: t('form.discountTypeFixed') },
                ]}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:tag-price-bold" className="text-violet-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.discountValue')}
                </Typography>
              </Box>
              <RHFTextField
                name="discount"
                type="number"
                fullWidth
                min={0}
                max={flashSaleDiscountType === 'percent' ? 100 : undefined}
                placeholder={flashSaleDiscountType === 'percent' ? '15' : '50'}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Status ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:bolt-bold" className="text-emerald-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.flashSaleActiveLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-colors">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                  />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      {t('form.flashSaleActiveLabel')}
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                      {field.value ? t('form.flashSaleStatusActive') : t('form.flashSaleStatusInactive')}
                    </Typography>
                  </Box>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* ── Section: Scope ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:folder-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.flashSaleCategoryLabel')} & {t('form.flashSaleVendorLabel')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:folder-bold" className="text-amber-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.flashSaleCategoryLabel')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground block mb-2">
                {t('form.flashSaleCategoryHint')}
              </Typography>
              <RHFInfiniteSelect
                name="category_id"
                queryKey={['flash-sale', 'category']}
                fetcher={categoryFetcher}
                placeholder={t('form.flashSaleCategoryPlaceholder')}
                pageSize={20}
              />
            </Box>

            <Box className="group">
              <Box className="flex items-center gap-2 mb-2">
                <Iconify icon="solar:shop-bold" className="text-amber-500" width={20} height={20} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.flashSaleVendorLabel')}
                </Typography>
              </Box>
              <Typography variant="caption" className="text-muted-foreground block mb-2">
                {t('form.flashSaleVendorHint')}
              </Typography>
              <RHFInfiniteSelect
                name="vendor_id"
                queryKey={['flash-sale', 'vendor']}
                fetcher={vendorFetcher}
                placeholder={t('form.flashSaleVendorPlaceholder')}
                pageSize={20}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Products ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:cart-large-2-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.flashSaleProductsLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <Typography variant="caption" className="text-muted-foreground block mb-3">
              {t('form.flashSaleProductsHint')}
            </Typography>
            <RHFMultiSelect
              name="product_ids"
              options={productOptions}
              label={t('form.selectProducts')}
              placeholder={t('form.flashSaleProductsPlaceholder')}
              fullWidth
              showOptionImages
            />
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}
