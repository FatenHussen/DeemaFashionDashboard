export type ShopVariantDiscountType = 'percentage' | 'fixed';

export function normalizeShopVariantDiscountType(raw: unknown): ShopVariantDiscountType {
  const v = String(raw ?? '').toLowerCase();
  if (v === 'fixed' || v === 'amount') return 'fixed';
  return 'percentage';
}

export function parseDiscountValue(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : NaN;
}

export function calculatePriceAfterDiscountSyp(params: {
  sypPrice: number;
  discountType: ShopVariantDiscountType;
  discountValue: number;
}): number {
  const { sypPrice, discountType, discountValue } = params;
  const base = Number.isFinite(sypPrice) && sypPrice >= 0 ? sypPrice : 0;
  const value = Number.isFinite(discountValue) && discountValue >= 0 ? discountValue : 0;

  if (discountType === 'percentage') {
    const pct = Math.min(100, value);
    return Math.max(0, base * (1 - pct / 100));
  }

  return Math.max(0, base - value);
}

export type ShopVariantDiscountValidationErrorKey =
  | 'productVariantsModalInvalidDiscount'
  | 'productVariantsModalInvalidDiscountPercent';

export function validateShopVariantDiscount(params: {
  discountType: ShopVariantDiscountType;
  discountValue: number;
  sypPrice: number;
}): { valid: true } | { valid: false; errorKey: ShopVariantDiscountValidationErrorKey } {
  const { discountType, discountValue, sypPrice } = params;

  if (Number.isNaN(discountValue) || discountValue < 0) {
    return { valid: false, errorKey: 'productVariantsModalInvalidDiscount' };
  }

  if (discountType === 'percentage') {
    if (discountValue > 100) {
      return { valid: false, errorKey: 'productVariantsModalInvalidDiscountPercent' };
    }
    return { valid: true };
  }

  if (discountValue > sypPrice) {
    return { valid: false, errorKey: 'productVariantsModalInvalidDiscount' };
  }

  return { valid: true };
}
