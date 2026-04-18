import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

/** When discount is percentage-based (`percentage` or `percent`), reject values greater than 100. */
export function issueIfPercentageDiscountOver100(
  ctx: z.RefinementCtx,
  discountType: string | null | undefined,
  rawValue: unknown,
  path: (string | number)[]
) {
  if (discountType !== 'percentage' && discountType !== 'percent') return;
  if (rawValue === '' || rawValue === null || rawValue === undefined) return;
  const n =
    typeof rawValue === 'string'
      ? parseFloat(String(rawValue).replace(',', '.'))
      : Number(rawValue);
  if (Number.isNaN(n)) return;
  if (n > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('discountPercentageMax'),
      path,
    });
  }
}
