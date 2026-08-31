import type { ProductFormValues } from '@/pages/dashboard/products/validation/product.validation';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { useVariantDeleteFlow } from '@/pages/dashboard/products/hooks/use-variant-delete-flow';
import { Controller, type Control, type UseFormWatch, type UseFormSetValue } from 'react-hook-form';
import { VariantDeleteImpactDialog } from '@/pages/dashboard/products/components/VariantDeleteImpactDialog';

import { Box, Button, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

type ShopVariantField = { id: string };

export type ProductShopVariantsSectionProps = {
  variantIndex: number;
  shops: any[];
  shopVariantsFields: ShopVariantField[];
  watchedShopVariants: ProductFormValues['shop_variants'];
  control: Control<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  appendShopVariant: (value: NonNullable<ProductFormValues['shop_variants']>[number]) => void;
  removeShopVariant: (index: number) => void;
  isEditMode: boolean;
  productId?: string;
  shopVariantCreateBusyIdx: number | null;
  setShopVariantCreateBusyIdx: (idx: number | null) => void;
  updateShopVariantMutation: { isPending: boolean; mutateAsync: (args: any) => Promise<any> };
  createSingleShopVariantOnProduct: (args: {
    productId: number | string;
    parentVariantId: number;
    parentVariantIndex: number;
    shopId: number;
    costPrice: number | undefined;
  }) => Promise<number>;
  /** Hide cost_price row when shown on the parent variant card (§17). */
  hideCostPrice?: boolean;
  /** When true, skip border-top styling (e.g. General tab placement). */
  embedded?: boolean;
  /** In restaurant mode, parent variant may not exist in form until backend creates it. */
  requireParentVariantId?: boolean;
  /** Hide shop dropdown when restaurant is pre-selected via category flow. */
  hideShopSelect?: boolean;
  /** Hide "Add shop variant" when only one restaurant shop is allowed. */
  hideAddButton?: boolean;
};

export function ProductShopVariantsSection({
  variantIndex,
  shops,
  shopVariantsFields,
  watchedShopVariants,
  control,
  watch,
  setValue,
  appendShopVariant,
  removeShopVariant,
  isEditMode,
  productId,
  shopVariantCreateBusyIdx,
  setShopVariantCreateBusyIdx,
  updateShopVariantMutation,
  createSingleShopVariantOnProduct,
  embedded = false,
  hideCostPrice = false,
  requireParentVariantId = true,
  hideShopSelect = false,
  hideAddButton = false,
}: ProductShopVariantsSectionProps) {
  const { t } = useTranslation();
  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([]);

  // Confirms against the API's impact preview, then drops the row once the delete lands.
  const shopVariantDeleteFlow = useVariantDeleteFlow<number>({
    target: 'shop_product_variant',
    onDeleted: (_id, svIdx) => {
      removeShopVariant(svIdx);
      toast.success(t('form.shopVariantDeleteSuccess'));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('form.shopVariantDeleteFailed'))),
  });

  const parentVariantId = Number(watch(`variants.${variantIndex}.id`) ?? 0);
  const addDisabled =
    requireParentVariantId && isEditMode && !parentVariantId;

  const hasBoundShopVariantRows = shopVariantsFields.some((_, svIdx) => {
    const boundVi = Number(watchedShopVariants?.[svIdx]?.variant_index);
    return boundVi === variantIndex;
  });

  const boundShopIds = shopVariantsFields
    .map((_, svIdx) => watchedShopVariants?.[svIdx])
    .filter((sv) => Number(sv?.variant_index) === variantIndex)
    .map((sv) => Number(sv?.shop_id));
  const availableShops = shops.filter((s) => !boundShopIds.includes(Number(s.id)));

  function toggleShopSelection(shopId: number) {
    setSelectedShopIds((prev) =>
      prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId]
    );
  }

  function addSelectedShops() {
    selectedShopIds.forEach((shopId) => {
      appendShopVariant({
        shop_id: shopId,
        variant_index: variantIndex,
        cost_price: undefined,
      });
    });
    setSelectedShopIds([]);
  }

  if (shops.length === 0 && !hideShopSelect && !hasBoundShopVariantRows) {
    return (
      <Box
        id={`variant-shop-section-${variantIndex}`}
        className={
          embedded
            ? 'space-y-3'
            : 'border-t border-border pt-4 space-y-3 scroll-mt-24'
        }
      >
        <Box className="flex items-center gap-2">
          <Iconify icon="solar:shop-2-bold" className="text-primary" width={20} />
          <Typography variant="subtitle2" className="font-semibold text-foreground">
            {t('form.shopVariantsTitle')}
          </Typography>
        </Box>
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.noShopsAvailable')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      id={`variant-shop-section-${variantIndex}`}
      className={
        embedded
          ? 'space-y-3'
          : 'border-t border-border pt-4 space-y-3 scroll-mt-24'
      }
    >
      <Box className="flex items-center gap-2">
        <Iconify icon="solar:shop-2-bold" className="text-primary" width={20} />
        <Typography variant="subtitle2" className="font-semibold text-foreground">
          {t('form.shopVariantsTitle')}
        </Typography>
      </Box>
      {shops.length === 0 && hideShopSelect && !hasBoundShopVariantRows ? (
        <Typography variant="body2" className="text-muted-foreground">
          {t('form.selectRestaurantFirst')}
        </Typography>
      ) : (
        <>
          {shopVariantsFields.map((svField, svIdx) => {
            const boundVi = Number(watchedShopVariants?.[svIdx]?.variant_index);
            if (boundVi !== variantIndex) return null;
            return (
              <Box
                key={svField.id}
                className={`grid grid-cols-1 gap-3 p-3 border border-border rounded-lg items-end ${hideShopSelect ? '' : 'md:grid-cols-2'}`}
              >
                {!hideShopSelect ? (
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
                ) : null}
                {!hideCostPrice ? (
                <Box>
                  <Typography variant="caption" className="text-muted-foreground mb-1 block">
                    {t('form.branchCostPriceLabel')}
                  </Typography>
                  <Box className="flex gap-2">
                    <Controller
                      name={`shop_variants.${svIdx}.cost_price`}
                      control={control}
                      render={({ field: f, fieldState: { error } }) => (
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            name={f.name}
                            ref={f.ref}
                            onBlur={f.onBlur}
                            value={optionalNumberInputDisplay(f.value)}
                            placeholder={t('form.shopVariantPricePlaceholder')}
                            onChange={(e) =>
                              f.onChange(toTwoDecimalNumber(e.target.value))
                            }
                            className={fieldInputClass(!!error)}
                            step="0.01"
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
                  <Typography variant="caption" className="text-muted-foreground/80 mt-1 block">
                    {t('form.branchCostPriceHint')}
                  </Typography>
                </Box>
                ) : null}
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
                              await updateShopVariantMutation.mutateAsync({
                                id: svId,
                                data: {
                                  cost_price: watch(`shop_variants.${svIdx}.cost_price`),
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
                          disabled={shopVariantDeleteFlow.isDeleting}
                          onClick={() => {
                            const svId = watch(`shop_variants.${svIdx}.id`);
                            if (!svId) return;
                            shopVariantDeleteFlow.requestDelete(svId, svIdx);
                          }}
                        >
                          <Iconify icon="solar:trash-bin-bold" width={16} className="mr-1" />
                          {t('form.deleteShopVariant')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          disabled={shopVariantCreateBusyIdx === svIdx}
                          onClick={async () => {
                            const parentIdx = Number(
                              watch(`shop_variants.${svIdx}.variant_index`)
                            );
                            const parentVarId = Number(
                              watch(`variants.${parentIdx}.id`) ?? 0
                            );
                            if (!productId || !parentVarId) {
                              toast.error(t('form.shopVariantSaveParentFirst'));
                              return;
                            }
                            const shopId = Number(
                              watch(`shop_variants.${svIdx}.shop_id`)
                            );
                            const costPriceRaw = watch(
                              `shop_variants.${svIdx}.cost_price`
                            );
                            const costPrice =
                              costPriceRaw == null || costPriceRaw === ('' as any)
                                ? undefined
                                : Number(costPriceRaw);
                            if (!shopId) {
                              toast.error(t('form.shopVariantSaveShopRequired'));
                              return;
                            }
                            try {
                              setShopVariantCreateBusyIdx(svIdx);
                              const newId = await createSingleShopVariantOnProduct({
                                productId,
                                parentVariantId: parentVarId,
                                parentVariantIndex: parentIdx,
                                shopId,
                                costPrice,
                              });
                              if (newId > 0) {
                                setValue(`shop_variants.${svIdx}.id`, newId, {
                                  shouldDirty: false,
                                });
                                toast.success(t('form.shopVariantCreateSuccess'));
                              } else {
                                toast.error(t('form.shopVariantCreateFailed'));
                              }
                            } catch {
                              toast.error(t('form.shopVariantCreateFailed'));
                            } finally {
                              setShopVariantCreateBusyIdx(null);
                            }
                          }}
                        >
                          <Iconify icon="solar:diskette-bold" width={16} className="mr-1" />
                          {shopVariantCreateBusyIdx === svIdx
                            ? t('form.savingVariant')
                            : t('form.createShopVariant')}
                        </Button>
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
                      </>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
          {!hideAddButton && (
            <Box className="space-y-2 p-3 border border-dashed border-border rounded-lg">
              {availableShops.length === 0 ? (
                <Typography variant="caption" className="text-muted-foreground block">
                  {t('form.allShopsAssigned')}
                </Typography>
              ) : (
                <>
                  <Typography variant="caption" className="text-muted-foreground block">
                    {t('form.selectMultipleShopsHint')}
                  </Typography>
                  <Box className="flex flex-wrap gap-3">
                    {availableShops.map((s: any) => {
                      const shopId = Number(s.id);
                      return (
                        <label
                          key={shopId}
                          className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedShopIds.includes(shopId)}
                            onChange={() => toggleShopSelection(shopId)}
                            className="rounded border-border"
                          />
                          {typeof s.name === 'object' ? s.name?.en ?? s.name?.ar : s.name}
                        </label>
                      );
                    })}
                  </Box>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    disabled={addDisabled || selectedShopIds.length === 0}
                    onClick={addSelectedShops}
                  >
                    <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
                    {t('form.addShopVariant')}
                    {selectedShopIds.length > 0 ? ` (${selectedShopIds.length})` : ''}
                  </Button>
                </>
              )}
            </Box>
          )}
          {addDisabled && (
            <Typography variant="caption" className="text-muted-foreground block">
              {t('form.shopVariantSaveParentFirst')}
            </Typography>
          )}
        </>
      )}

      <VariantDeleteImpactDialog {...shopVariantDeleteFlow.dialogProps} />
    </Box>
  );
}
