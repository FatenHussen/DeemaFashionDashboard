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
import { Controller } from 'react-hook-form';
import { Iconify } from '@/shared/components/iconify';

import { Box, Button, Typography } from 'src/shared/ui';

import { ProductShopVariantsSection } from '../view/product/ProductShopVariantsSection';
import {
  regenerateVariantSku,
  type ColorsHexLookup,
  type CategoryAttributeValueRef,
} from '../utils/variant-combinations';
import {
  VariantFieldLabel,
  VariantStatusBadge,
  VariantAttributeChain,
  variantFieldInputClass,
} from './variant-field-ui';
import {
  toOptionalInt,
  localAmountToUsd,
  toOptionalNumber,
  usdToLocalAmount,
  parseCurrencyRate,
  toTwoDecimalNumber,
  optionalNumberInputDisplay,
  formatLiveAfterDiscountPreview,
} from './variant-field-helpers';

// ----------------------------------------------------------------------

const inputCls = variantFieldInputClass();

function fieldInputClass(error?: boolean) {
  return variantFieldInputClass(error);
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="text-destructive mt-0.5 block">
      {message}
    </Typography>
  );
}

export type ProductVariantInlineRowProps = {
  variantIndex: number;
  variantFieldId: string;
  control: Control<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  valueRefs: CategoryAttributeValueRef[];
  colorsHexLookup: ColorsHexLookup;
  productDualPriceReady: boolean;
  usdCurrency?: CurrencyData;
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
  onRemove: () => void;
  onSave: () => void | Promise<void>;
  isSaving: boolean;
  isDeleting: boolean;
  t: TFunction;
};

export function ProductVariantInlineRow({
  variantIndex,
  variantFieldId,
  control,
  watch,
  setValue,
  errors,
  valueRefs,
  colorsHexLookup,
  productDualPriceReady,
  usdCurrency,
  sypCurrency,
  sypRate,
  watchedProductSku,
  restaurantMode,
  isEditMode,
  isShopSaleChannel,
  productId,
  productResponse,
  shops,
  shopVariantsFields,
  watchedShopVariants,
  appendShopVariant,
  removeShopVariant,
  shopVariantCreateBusyIdx,
  setShopVariantCreateBusyIdx,
  updateShopVariantMutation,
  createSingleShopVariantOnProduct,
  onRemove,
  onSave,
  isSaving,
  isDeleting,
  t,
}: ProductVariantInlineRowProps) {
  const variantRowErrors = errors.variants?.[variantIndex];
  const variantId = watch(`variants.${variantIndex}.id`);
  const isActive = Number(watch(`variants.${variantIndex}.is_active`) ?? 1) === 1;
  const shopSvIndex = React.useMemo(() => {
    const rows = watchedShopVariants ?? [];
    return rows.findIndex((sv) => Number(sv?.variant_index) === variantIndex);
  }, [watchedShopVariants, variantIndex]);

  return (
    <Box className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Box className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/15 px-5 py-3">
        <Box className="min-w-0 flex-1">
          {valueRefs.length > 0 ? (
            <VariantAttributeChain valueRefs={valueRefs} />
          ) : (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.variantSummaryIncomplete')}
            </Typography>
          )}
        </Box>
        <Box className="flex items-center gap-2 shrink-0">
          <VariantStatusBadge
            active={isActive}
            activeLabel={t('form.variantStatusAvailable')}
            inactiveLabel={t('form.variantStatusInactive')}
          />
          <Button
            type="button"
            variant="text"
            size="small"
            className="h-8 w-8 min-w-0 p-0 text-destructive hover:bg-destructive/10"
            disabled={isDeleting}
            onClick={onRemove}
            title={t('form.remove')}
          >
            <Iconify icon="solar:trash-bin-bold" width={18} />
          </Button>
        </Box>
      </Box>

      <Box className="space-y-4 p-5">
        <Box className="space-y-3 border-t border-border/25 pt-1">
          <Typography variant="caption" className="block text-xs font-semibold text-foreground">
            {t('form.variantBasicInfoSectionTitle')}
          </Typography>

          {/* SKU — spec §4: first field in basic info */}
          <Box className="min-w-0">
            <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
              {t('form.variantSku')}
            </VariantFieldLabel>
            <Box className="flex gap-2">
              <Controller
                name={`variants.${variantIndex}.sku`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="min-w-0 flex-1">
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
              <Button
                type="button"
                variant="outlined"
                size="small"
                className="h-9 w-9 shrink-0 p-0"
                title={t('form.regenerateSku')}
                onClick={() =>
                  setValue(
                    `variants.${variantIndex}.sku`,
                    regenerateVariantSku(watchedProductSku, valueRefs, colorsHexLookup),
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
              >
                <Iconify icon="solar:refresh-bold" width={16} />
              </Button>
            </Box>
          </Box>

          {/* Pricing & discount */}
          <Box
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${
              productDualPriceReady ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
            }`}
          >
            {productDualPriceReady ? (
              <>
                <Box className="min-w-0">
                  <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                    {t('form.variantPriceUsdLabel')}
                  </VariantFieldLabel>
                  <Controller
                    name={`variants.${variantIndex}.price`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          type="number"
                          placeholder="—"
                          name={f.name}
                          ref={f.ref}
                          onBlur={f.onBlur}
                          value={optionalNumberInputDisplay(f.value)}
                          onChange={(e) => {
                            const next = toTwoDecimalNumber(e.target.value);
                            f.onChange(next);
                            if (sypCurrency) {
                              setValue(
                                `variants.${variantIndex}.price_syp`,
                                next == null
                                  ? (undefined as unknown as number)
                                  : usdToLocalAmount(next, parseCurrencyRate(sypCurrency)),
                                { shouldDirty: true }
                              );
                            }
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
                <Box className="min-w-0">
                  <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                    {t('form.variantPriceSypLabel')}
                  </VariantFieldLabel>
                  <Controller
                    name={`variants.${variantIndex}.price_syp`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <div>
                        <input
                          type="number"
                          placeholder="—"
                          step="any"
                          min={0}
                          name={f.name}
                          ref={f.ref}
                          onBlur={f.onBlur}
                          value={optionalNumberInputDisplay(f.value)}
                          onChange={(e) => {
                            const next = toTwoDecimalNumber(e.target.value);
                            f.onChange(next);
                            if (sypCurrency) {
                              setValue(
                                `variants.${variantIndex}.price`,
                                next == null
                                  ? (undefined as unknown as number)
                                  : localAmountToUsd(next, parseCurrencyRate(sypCurrency)),
                                { shouldValidate: true, shouldDirty: true }
                              );
                            }
                          }}
                          className={fieldInputClass(!!error)}
                        />
                        <FieldErrorText message={error?.message} />
                      </div>
                    )}
                  />
                </Box>
              </>
            ) : (
              <Box className="min-w-0">
                <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                  {t('form.variantPriceLabel')}
                </VariantFieldLabel>
                <Controller
                  name={`variants.${variantIndex}.price`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <div>
                      <input
                        type="number"
                        placeholder="—"
                        name={f.name}
                        ref={f.ref}
                        onBlur={f.onBlur}
                        value={optionalNumberInputDisplay(f.value)}
                        onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
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

            <Box className="min-w-0">
              <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                {t('form.productDiscountType')}
              </VariantFieldLabel>
              <Controller
                name={`variants.${variantIndex}.discount_type`}
                control={control}
                render={({ field: f }) => (
                  <select
                    className={inputCls}
                    value={f.value ?? 'none'}
                    onChange={(e) => f.onChange(e.target.value)}
                    onBlur={f.onBlur}
                    name={f.name}
                    ref={f.ref}
                  >
                    <option value="none">{t('form.discountTypeNone')}</option>
                    <option value="percentage">{t('form.discountTypePercentage')}</option>
                    <option value="fixed">{t('form.discountTypeFixed')}</option>
                  </select>
                )}
              />
            </Box>

            <Box className="min-w-0">
              <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                {t('form.productDiscountValue')}
              </VariantFieldLabel>
              <Controller
                name={`variants.${variantIndex}.discount`}
                control={control}
                render={({ field: f, fieldState: { error } }) => (
                  <div>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="—"
                      disabled={(watch(`variants.${variantIndex}.discount_type`) ?? 'none') === 'none'}
                      name={f.name}
                      ref={f.ref}
                      onBlur={f.onBlur}
                      value={optionalNumberInputDisplay(f.value)}
                      onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                      className={fieldInputClass(!!error)}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>

            <Box className="min-w-0">
              <VariantFieldLabel>{t('form.variantPriceAfterDiscount')}</VariantFieldLabel>
              <input
                type="text"
                readOnly
                placeholder="—"
                className={`${inputCls} bg-muted/25 text-muted-foreground cursor-default`}
                value={(() => {
                  const p = toOptionalNumber(watch(`variants.${variantIndex}.price`));
                  const dt = watch(`variants.${variantIndex}.discount_type`) ?? 'none';
                  const d = toOptionalNumber(watch(`variants.${variantIndex}.discount`));
                  if (p == null) return '';
                  return formatLiveAfterDiscountPreview(p, dt, d, sypRate);
                })()}
              />
            </Box>
          </Box>

          {/* Quantity · barcode · cost */}
          <Box
            className={`grid grid-cols-1 gap-3 ${
              restaurantMode ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
            }`}
          >
            <Box className="min-w-0">
              <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                {t('form.variantQuantityLabel')}
              </VariantFieldLabel>
              <Controller
                name={`variants.${variantIndex}.quantity`}
                control={control}
                render={({ field: f, fieldState: { error } }) => (
                  <div>
                    <input
                      type="number"
                      placeholder="—"
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
                  </div>
                )}
              />
            </Box>

            {!restaurantMode ? (
              <Box className="min-w-0">
                <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                  {t('form.variantBarcode')}
                </VariantFieldLabel>
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
            ) : null}
          </Box>

          {isShopSaleChannel && shopSvIndex >= 0 ? (
            <Box className="max-w-xs">
              <VariantFieldLabel optionalLabel={t('form.optionalTag')}>
                {t('form.productCostPriceOptional')}
              </VariantFieldLabel>
              <Controller
                name={`shop_variants.${shopSvIndex}.cost_price`}
                control={control}
                render={({ field: f, fieldState: { error } }) => (
                  <div>
                    <input
                      type="number"
                      name={f.name}
                      ref={f.ref}
                      onBlur={f.onBlur}
                      value={optionalNumberInputDisplay(f.value)}
                      placeholder="—"
                      onChange={(e) => f.onChange(toTwoDecimalNumber(e.target.value))}
                      className={fieldInputClass(!!error)}
                      step="0.01"
                      min={0}
                    />
                    <FieldErrorText message={error?.message} />
                  </div>
                )}
              />
            </Box>
          ) : null}
        </Box>

        <Box>
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            {t('form.variantImagesOptional')}
          </Typography>
        <Controller
          name={`variants.${variantIndex}.images`}
          control={control}
          render={({ field: { onChange, value, ref, name, onBlur }, fieldState: { error } }) => {
            const variantFileInputId = `variant-images-${variantIndex}-${variantFieldId}`;
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
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={variantFileInputId}
                    className={`inline-flex cursor-pointer rounded-lg border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted ${
                      error ? 'border-destructive' : 'border-border'
                    }`}
                  >
                    {t('form.chooseFiles')}
                  </label>
                  <Typography component="span" variant="caption" color="secondary">
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
                  .find((x) => Number(x.id) === Number(vRowId))
                  ?.images?.filter((im) => keepVIds.includes(Number(im.id))) ?? []
              : [];
          if (!fromApi.length) return null;
          return (
            <Box className="mt-2 flex flex-wrap gap-2">
              {fromApi.map((im) => (
                <Box key={im.id} className="relative">
                  <img
                    src={im.url}
                    alt=""
                    className="h-16 w-16 object-cover rounded-lg border border-border/60"
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
                    className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5"
                    aria-label={t('form.removeVariantImageAria')}
                  >
                    <Iconify icon="solar:close-circle-bold" width={16} />
                  </button>
                </Box>
              ))}
            </Box>
          );
        })()}
        </Box>

        <Box className="flex flex-wrap items-center gap-4 pt-1">
        <Controller
          name={`variants.${variantIndex}.is_trend`}
          control={control}
          render={({ field: f }) => (
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={Number(f.value) === 1}
                onChange={(e) => f.onChange(e.target.checked ? 1 : 0)}
                onBlur={f.onBlur}
                name={f.name}
                ref={f.ref}
              />
              <Typography variant="caption" className="text-foreground">
                {t('form.variantIsTrend')}
              </Typography>
            </label>
          )}
        />
        <Controller
          name={`variants.${variantIndex}.is_active`}
          control={control}
          render={({ field: f }) => (
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={Number(f.value ?? 1) === 1}
                onChange={(e) => f.onChange(e.target.checked ? 1 : 0)}
                onBlur={f.onBlur}
                name={f.name}
                ref={f.ref}
              />
              <Typography variant="caption" className="text-foreground">
                {t('form.variantIsActive')}
              </Typography>
            </label>
          )}
        />
        </Box>
      </Box>

      {isShopSaleChannel ? (
        <Box className="px-5 pb-5">
        <ProductShopVariantsSection
          variantIndex={variantIndex}
          hideCostPrice
          shops={shops as Parameters<typeof ProductShopVariantsSection>[0]['shops']}
          shopVariantsFields={shopVariantsFields as Parameters<typeof ProductShopVariantsSection>[0]['shopVariantsFields']}
          watchedShopVariants={watchedShopVariants ?? []}
          control={control}
          watch={watch}
          setValue={setValue}
          appendShopVariant={appendShopVariant}
          removeShopVariant={removeShopVariant}
          isEditMode={isEditMode}
          productId={productId}
          shopVariantCreateBusyIdx={shopVariantCreateBusyIdx}
          setShopVariantCreateBusyIdx={setShopVariantCreateBusyIdx}
          updateShopVariantMutation={updateShopVariantMutation}
          createSingleShopVariantOnProduct={createSingleShopVariantOnProduct}
        />
        </Box>
      ) : null}

      {variantRowErrors ? (
        <Typography variant="caption" className="text-destructive px-5 pb-3">
          {Object.values(variantRowErrors)
            .map((e) => (typeof e === 'object' && e && 'message' in e ? String(e.message) : ''))
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      ) : null}

      <Box className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 bg-muted/15 px-5 py-3.5">
        {isEditMode && !variantId ? (
          <Button type="button" variant="outlined" size="medium" disabled={isDeleting} onClick={onRemove}>
            {t('form.cancel')}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="contained"
          size="medium"
          disabled={isSaving}
          onClick={() => void onSave()}
        >
          <Iconify icon="solar:diskette-bold" width={16} className="me-1.5" />
          {variantId || !isEditMode
            ? t('form.saveChanges')
            : t('form.createVariant')}
        </Button>
      </Box>
    </Box>
  );
}
