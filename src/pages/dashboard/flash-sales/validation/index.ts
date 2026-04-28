import type { FlashSaleWritePayload } from '../api/services';

import { z } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, { ns: 'validation', ...options });

const tf = (key: string) => i18n.t(`flashSale.${key}`, { ns: 'validation' });

export { normalizeFlashSaleDiscountType } from '../normalize';

const baseFields = {
  name: z
    .string()
    .trim()
    .min(1, { message: t('required') })
    .max(255, { message: t('maxLength', { max: 255 }) }),
  /** `datetime-local` value `YYYY-MM-DDTHH:mm` */
  end_date_local: z.string().min(1, { message: t('required') }),
  is_active: z.boolean(),
  discount_type: z.enum(['percent', 'fixed']),
  discount: z.coerce.number().min(0, { message: tf('discountMin') }),
  product_ids: z.array(z.number().int().positive()),
  /** 0 = not set */
  category_id: z.number().int().min(0),
  vendor_id: z.number().int().min(0),
};

function endDateAfterNow(local: string): boolean {
  const d = new Date(local);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

export const FlashSaleCreateSchema = z.object(baseFields).superRefine((val, ctx) => {
  if (!endDateAfterNow(val.end_date_local)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: tf('endDateFuture'),
      path: ['end_date_local'],
    });
  }
  issueIfPercentageDiscountOver100(ctx, val.discount_type, val.discount, ['discount']);
});

export type FlashSaleFormValues = z.infer<typeof FlashSaleCreateSchema>;

/** `YYYY-MM-DDTHH:mm` → `YYYY-MM-DD HH:mm:ss` (server expects local-style string). */
export function datetimeLocalToApi(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** API ISO string → `datetime-local` */
export function apiDateToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildFlashSalePayload(values: FlashSaleFormValues): FlashSaleWritePayload {
  const payload: FlashSaleWritePayload = {
    name: values.name,
    end_date: datetimeLocalToApi(values.end_date_local),
    is_active: values.is_active,
    discount: values.discount,
    discount_type: values.discount_type,
  };
  if (values.product_ids.length > 0) {
    payload.product_ids = values.product_ids;
  }
  if (values.category_id > 0) {
    payload.category_id = values.category_id;
  }
  if (values.vendor_id > 0) {
    payload.vendor_id = values.vendor_id;
  }
  return payload;
}
