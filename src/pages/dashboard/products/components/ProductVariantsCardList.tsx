import type { TFunction } from 'i18next';
import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
import type { ProductFormValues } from '@/pages/dashboard/products/validation/product.validation';
import type {
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';

import React from 'react';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { Iconify } from '@/shared/components/iconify';
import { _ColorApi } from '@/pages/dashboard/colors/api/color.services';

import { Box, Typography } from 'src/shared/ui';

import { ProductVariantInlineRow } from './ProductVariantInlineRow';
import { ProductVariantsSkuToolbar } from './ProductVariantsSkuToolbar';
import {
  generateVariantSku,
  buildColorsHexLookup,
  type ColorsHexLookup,
  type CategoryAttributeValueRef,
} from '../utils/variant-combinations';

// ----------------------------------------------------------------------

export type ProductVariantsCardListProps = {
  variants: Array<{ id: string }>;
  categoryAttributes: Array<{ id?: number; values?: CategoryAttributeValueRef[] }>;
  resolveValueRefs: (valueIds: number[]) => CategoryAttributeValueRef[];
  control: Control<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  productDualPriceReady: boolean;
  sypCurrency?: CurrencyData;
  sypRate: number | null;
  watchedProductSku: string;
  restaurantMode: boolean;
  isEditMode: boolean;
  isShopSaleChannel: boolean;
  productId?: string;
  productResponse?: { variants?: Array<{ id: number; images?: Array<{ id: number; url: string }> }> };
  shops: unknown[];
  shopVariantsFields: unknown[];
  watchedShopVariants: ProductFormValues['shop_variants'];
  appendShopVariant: (row: NonNullable<ProductFormValues['shop_variants']>[number]) => void;
  removeShopVariant: (index: number) => void;
  shopVariantCreateBusyIdx: number | null;
  setShopVariantCreateBusyIdx: (v: number | null) => void;
  updateShopVariantMutation: { isPending: boolean; mutateAsync: (args: any) => Promise<any> };
  createSingleShopVariantOnProduct: (args: {
    productId: number | string;
    parentVariantId: number;
    parentVariantIndex: number;
    shopId: number;
    costPrice: number | undefined;
  }) => Promise<number>;
  onRemove: (variantIndex: number) => void;
  onSave: (variantIndex: number) => void | Promise<void>;
  isSavingIndex?: number | null;
  updatePending?: boolean;
  isDeleting?: boolean;
  t: TFunction;
};

export function ProductVariantsCardList({
  variants,
  categoryAttributes: _categoryAttributes,
  resolveValueRefs,
  isSavingIndex = null,
  updatePending = false,
  isDeleting = false,
  onRemove,
  onSave,
  ...rowProps
}: ProductVariantsCardListProps) {
  const { data: colorsResp } = useQuery({
    queryKey: queryKeys.color.list({ per_page: 500, is_active: true, picker: 'variant-cards' }),
    queryFn: () => _ColorApi.getListColors({ page: 1, per_page: 500, is_active: true }),
    staleTime: 5 * 60 * 1000,
  });

  const colorsHexLookup: ColorsHexLookup = React.useMemo(
    () => buildColorsHexLookup(colorsResp?.data?.items ?? []),
    [colorsResp?.data?.items]
  );

  const watchedVariants = rowProps.watch('variants') ?? [];

  const skuStats = React.useMemo(() => {
    const total = watchedVariants.length;
    const withSku = watchedVariants.filter((v) => String(v?.sku ?? '').trim()).length;
    return { total, withSku, missing: total - withSku };
  }, [watchedVariants]);

  const handleGenerateAllMissingSku = () => {
    watchedVariants.forEach((_, i) => {
      const sku = String(rowProps.watch(`variants.${i}.sku`) ?? '').trim();
      if (sku) return;
      const valueIds = (rowProps.watch(`variants.${i}.attributes_values_ids`) ?? []) as number[];
      const valueRefs = resolveValueRefs(valueIds);
      rowProps.setValue(
        `variants.${i}.sku`,
        generateVariantSku(rowProps.watchedProductSku, valueRefs, colorsHexLookup),
        { shouldDirty: true }
      );
    });
  };

  if (variants.length === 0) {
    return (
      <Box className="rounded-2xl border border-dashed border-border/50 bg-muted/10 px-6 py-12 text-center">
        <Box className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          <Iconify icon="solar:box-minimalistic-bold" width={24} />
        </Box>
        <Typography variant="body2" className="font-medium text-foreground">
          {rowProps.t('form.noVariantsYetTitle')}
        </Typography>
        <Typography variant="caption" className="mt-1 block text-muted-foreground">
          {rowProps.t('form.noVariantsYet')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-5">
      <ProductVariantsSkuToolbar
        totalCount={skuStats.total}
        withSkuCount={skuStats.withSku}
        missingSkuCount={skuStats.missing}
        onGenerateAllMissing={handleGenerateAllMissingSku}
        t={rowProps.t}
      />
      {variants.map((variant, variantIndex) => {
        const rowSelectedIds = (rowProps.watch(`variants.${variantIndex}.attributes_values_ids`) ||
          []) as number[];
        const valueRefs = resolveValueRefs(rowSelectedIds);

        return (
          <ProductVariantInlineRow
            key={variant.id}
            variantIndex={variantIndex}
            variantFieldId={variant.id}
            valueRefs={valueRefs}
            colorsHexLookup={colorsHexLookup}
            onRemove={() => onRemove(variantIndex)}
            onSave={() => onSave(variantIndex)}
            isSaving={isSavingIndex === variantIndex || updatePending}
            isDeleting={isDeleting ?? false}
            {...rowProps}
          />
        );
      })}
    </Box>
  );
}
