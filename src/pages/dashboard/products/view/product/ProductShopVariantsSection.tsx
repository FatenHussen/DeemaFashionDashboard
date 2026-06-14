import type { CurrencyData } from '@/pages/dashboard/currencies/types/currency.types';
import type { ProductFormValues } from '@/pages/dashboard/products/validation/product.validation';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { Controller, type Control, type UseFormWatch, type UseFormSetValue } from 'react-hook-form';

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

function parseCurrencyRate(c: CurrencyData): number {
  const r = Number((c as { exchange_rate?: string | number }).exchange_rate);
  return r > 0 ? r : 1;
}

function localAmountToUsd(local: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return local / r;
}

function usdToLocalAmount(usd: number, exchangeRate: number): number {
  const r = exchangeRate > 0 ? exchangeRate : 1;
  return usd * r;
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
  productDualPriceReady: boolean;
  usdCurrency?: CurrencyData;
  sypCurrency?: CurrencyData;
  isEditMode: boolean;
  productId?: string;
  shopVariantCreateBusyIdx: number | null;
  setShopVariantCreateBusyIdx: (idx: number | null) => void;
  updateShopVariantMutation: { isPending: boolean; mutateAsync: (args: any) => Promise<any> };
  deleteShopVariantMutation: { isPending: boolean; mutateAsync: (id: number) => Promise<any> };
  createSingleShopVariantOnProduct: (args: {
    productId: number | string;
    parentVariantId: number;
    parentVariantIndex: number;
    shopId: number;
    price: number;
    costPrice: number | undefined;
    quantity: number;
  }) => Promise<number>;
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
  productDualPriceReady,
  usdCurrency,
  sypCurrency,
  isEditMode,
  productId,
  shopVariantCreateBusyIdx,
  setShopVariantCreateBusyIdx,
  updateShopVariantMutation,
  deleteShopVariantMutation,
  createSingleShopVariantOnProduct,
  embedded = false,
  requireParentVariantId = true,
  hideShopSelect = false,
  hideAddButton = false,
}: ProductShopVariantsSectionProps) {
  const { t } = useTranslation();

  const parentVariantId = Number(watch(`variants.${variantIndex}.id`) ?? 0);
  const addDisabled =
    requireParentVariantId && isEditMode && !parentVariantId;

  const hasBoundShopVariantRows = shopVariantsFields.some((_, svIdx) => {
    const boundVi = Number(watchedShopVariants?.[svIdx]?.variant_index);
    return boundVi === variantIndex;
  });

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
                className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-border rounded-lg items-end ${productDualPriceReady ? (hideShopSelect ? 'lg:grid-cols-5' : 'lg:grid-cols-6') : hideShopSelect ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}
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
                {productDualPriceReady ? (
                  <>
                    <Box>
                      <Typography
                        variant="caption"
                        className="text-muted-foreground mb-1 block"
                      >
                        {t('form.productPriceUsdLabel')}
                        {usdCurrency?.symbol ? (
                          <span className="ms-1 opacity-80">({usdCurrency.symbol})</span>
                        ) : null}
                      </Typography>
                      <Controller
                        name={`shop_variants.${svIdx}.price`}
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
                              onChange={(e) =>
                                f.onChange(toTwoDecimalNumber(e.target.value))
                              }
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
                      <Typography
                        variant="caption"
                        className="text-muted-foreground mb-1 block"
                      >
                        {t('form.productPriceSypLabel')}
                        {sypCurrency?.symbol ? (
                          <span className="ms-1 opacity-80">({sypCurrency.symbol})</span>
                        ) : null}
                      </Typography>
                      <Controller
                        name={`shop_variants.${svIdx}.price`}
                        control={control}
                        render={({ field: f, fieldState: { error } }) => {
                          const pw = f.value;
                          const usdNum =
                            pw == null || Number.isNaN(Number(pw)) ? 0 : Number(pw);
                          const sypVal = usdToLocalAmount(
                            usdNum,
                            parseCurrencyRate(sypCurrency!)
                          );
                          return (
                            <div>
                              <input
                                type="number"
                                placeholder=""
                                className={fieldInputClass(!!error)}
                                step="any"
                                min={0}
                                value={usdNum === 0 && sypVal === 0 ? '' : sypVal}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const rate = parseCurrencyRate(sypCurrency!);
                                  if (raw === '') {
                                    setValue(
                                      `shop_variants.${svIdx}.price`,
                                      undefined as unknown as number,
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      }
                                    );
                                    return;
                                  }
                                  const v = toTwoDecimalNumber(raw);
                                  if (v == null) {
                                    setValue(
                                      `shop_variants.${svIdx}.price`,
                                      undefined as unknown as number,
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      }
                                    );
                                    return;
                                  }
                                  setValue(
                                    `shop_variants.${svIdx}.price`,
                                    localAmountToUsd(v, rate),
                                    {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    }
                                  );
                                }}
                              />
                              <FieldErrorText message={error?.message} />
                            </div>
                          );
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-muted-foreground mb-1 block"
                    >
                      {t('form.priceLabel')}
                    </Typography>
                    <Controller
                      name={`shop_variants.${svIdx}.price`}
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
                  </Box>
                )}
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
                          type="number"
                          name={f.name}
                          ref={f.ref}
                          onBlur={f.onBlur}
                          value={optionalNumberInputDisplay(f.value)}
                          placeholder={t('form.shopVariantDiscountPlaceholder')}
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
                              const n = Number(raw);
                              f.onChange(Number.isNaN(n) ? (undefined as unknown as number) : n);
                            }}
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
                              await updateShopVariantMutation.mutateAsync({
                                id: svId,
                                data: {
                                  price: watch(`shop_variants.${svIdx}.price`),
                                  cost_price: watch(`shop_variants.${svIdx}.cost_price`),
                                  quantity: watch(`shop_variants.${svIdx}.quantity`),
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
                      <>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          disabled={shopVariantCreateBusyIdx === svIdx}
                          onClick={async () => {
                            if (!productId) {
                              toast.error(t('form.variantSaveProductFirst'));
                              return;
                            }
                            const parentIdx = Number(
                              watch(`shop_variants.${svIdx}.variant_index`)
                            );
                            const parentVarId = Number(
                              watch(`variants.${parentIdx}.id`) ?? 0
                            );
                            if (!parentVarId) {
                              toast.error(t('form.shopVariantSaveParentFirst'));
                              return;
                            }
                            const shopId = Number(
                              watch(`shop_variants.${svIdx}.shop_id`)
                            );
                            const priceVal = Number(
                              watch(`shop_variants.${svIdx}.price`) ?? 0
                            );
                            const costPriceRaw = watch(
                              `shop_variants.${svIdx}.cost_price`
                            );
                            const costPrice =
                              costPriceRaw == null || costPriceRaw === ('' as any)
                                ? undefined
                                : Number(costPriceRaw);
                            const quantityVal = Number(
                              watch(`shop_variants.${svIdx}.quantity`) ?? 0
                            );
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
                                price: priceVal,
                                costPrice,
                                quantity: quantityVal,
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
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={addDisabled}
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
          )}
          {addDisabled && (
            <Typography variant="caption" className="text-muted-foreground block">
              {t('form.shopVariantSaveParentFirst')}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
