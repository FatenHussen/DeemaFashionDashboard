import { z as zod } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------
// Use coerce for numeric fields - inputs/API often return strings

export const ProductSchema = zod
  .object({
    category_id: zod.coerce.number().min(1, { message: t('product.categoryRequired') }),
    brand_id: zod.coerce.number().min(0).optional(),
    /** internal = platform (vendor_id 1); external = pick vendor from list */
    vendor_scope: zod.enum(['internal', 'external']),
    vendor_id: zod.coerce.number().min(0).optional(),
    name: zod.object({
      en: zod.string().min(1, { message: t('product.nameEnRequired') }),
      ar: zod.string().min(1, { message: t('product.nameArRequired') }),
    }),
    description: zod.object({
      en: zod.string().optional().default(''),
      ar: zod.string().optional().default(''),
    }),
    full_description: zod
      .object({
        en: zod.string(),
        ar: zod.string(),
      })
      .optional(),
    country_id: zod.coerce.number().min(0).optional(),
    sale_country_id: zod.coerce.number().min(0).optional(),
    /** UI: amount in selected currency; `price` is always USD for the API. */
    price_currency_id: zod.coerce.number().min(0).optional().default(0),
    price_local: zod.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      zod.coerce.number().min(0).optional()
    ),
    price: zod.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      zod.coerce.number().min(0, { message: t('product.pricePositive') }).optional()
    ),
    discount: zod.coerce.number().min(0).default(0),
    discount_type: zod.enum(['none', 'percentage', 'fixed']).default('none'),
    cost_price: zod.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      zod.coerce.number().min(0).optional()
    ),
    quantity: zod.coerce.number().min(0, { message: t('product.quantityPositive') }),
    /** From `/admin/units`; `0` = not selected. */
    unit_id: zod.coerce.number().min(0).optional().default(0),
    warranty_period: zod.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      zod.coerce.number().min(0).optional()
    ),
    sku: zod.string().optional(),
    model: zod.string().optional(),
    barcode: zod.string().optional(),
    time_prepare: zod.string().optional(),
    /** Product-level; used when vendor is external */
    delivery_time: zod.string().optional(),
    expiry_date: zod.preprocess(
      (v) => (v === '' || v === null || v === undefined ? '' : String(v).trim()),
      zod.string().optional()
    ),
    is_instant_delivery: zod.coerce.number().min(0).max(1),
    is_visible: zod.coerce.number().min(0).max(1).default(1),
    thumbnail: zod.preprocess(
      (v) => (v instanceof File ? v : undefined),
      zod.instanceof(File).optional()
    ),
    images: zod.preprocess(
      (val) =>
        Array.isArray(val) ? val.filter((x): x is File => x instanceof File) : undefined,
      zod.array(zod.instanceof(File)).optional()
    ),
    existing_media_ids: zod.array(zod.coerce.number()).optional(),

    seo_title: zod
      .object({
        en: zod.string().optional(),
        ar: zod.string().optional(),
      })
      .optional(),
    seo_description: zod
      .object({
        en: zod.string().optional(),
        ar: zod.string().optional(),
      })
      .optional(),
    seo_keywords: zod
      .object({
        en: zod.string().optional(),
        ar: zod.string().optional(),
      })
      .optional(),
    seo_image: zod.preprocess(
      (v) => (v instanceof File ? v : undefined),
      zod.instanceof(File).optional()
    ),

    variants: zod
      .array(
        zod.object({
          id: zod.coerce.number().optional(),
          attributes_values_ids: zod.array(zod.coerce.number()),
          images: zod.preprocess(
            (val) =>
              Array.isArray(val) ? val.filter((x): x is File => x instanceof File) : undefined,
            zod.array(zod.instanceof(File)).optional()
          ),
          existing_images_ids: zod.array(zod.coerce.number()).optional(),
          sku: zod.string().optional(),
          model: zod.string().optional(),
          barcode: zod.string().optional(),
          name: zod.object({ en: zod.string(), ar: zod.string() }).optional(),
          stock: zod.preprocess(
            (v) => (v === '' || v === null || v === undefined ? undefined : v),
            zod.coerce.number().min(0).optional()
          ),
          max_purchase_quantity: zod.preprocess(
            (v) => (v === '' || v === null || v === undefined ? undefined : v),
            zod.coerce.number().min(0).optional()
          ),
          delivery_time: zod.string().optional(),
        })
      )
      .optional(),

    category_details: zod
      .array(
        zod.object({
          id: zod.coerce.number().optional(),
          category_detail_id: zod.coerce.number(),
          detail_value: zod.object({
            en: zod.string(),
            ar: zod.string(),
          }),
        })
      )
      .optional(),

    extra_details: zod
      .array(
        zod.object({
          id: zod.coerce.number().optional(),
          product_extra_detail_id: zod.coerce.number(),
          quantity: zod.preprocess(
            (v) => (v === '' || v === null || v === undefined ? 1 : v),
            zod.coerce.number().min(1, { message: t('product.extraDetailQuantityMin') })
          ),
          price: zod.preprocess(
            (v) => {
              if (v === '' || v === null || v === undefined) return undefined;
              const n = typeof v === 'number' ? v : Number(v);
              return Number.isFinite(n) ? n : undefined;
            },
            zod
              .number({
                invalid_type_error: t('product.extraDetailPriceRequired'),
                required_error: t('product.extraDetailPriceRequired'),
              })
              .min(0, { message: t('product.pricePositive') })
          ),
        })
      )
      .optional()
      .superRefine((rows, ctx) => {
        const list = rows ?? [];
        list.forEach((row, i) => {
          if (!row.product_extra_detail_id || row.product_extra_detail_id <= 0) {
            ctx.addIssue({
              code: zod.ZodIssueCode.custom,
              message: t('product.extraDetailPresetRequired'),
              path: [i, 'product_extra_detail_id'],
            });
          }
        });
        const ids = list
          .map((r) => Number(r.product_extra_detail_id))
          .filter((n) => n > 0);
        if (ids.length !== new Set(ids).size) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: t('product.extraDetailDuplicate'),
            path: ['extra_details'],
          });
        }
      }),

    bought_with: zod.preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val
          .map((v) => (typeof v === 'object' && v != null && 'id' in v ? (v as any).id : v))
          .filter((v) => v !== '' && v != null && !Number.isNaN(Number(v)))
          .map((v) => Number(v));
      },
      zod.array(zod.number()).optional()
    ),

    shop_variants: zod
      .array(
        zod.object({
          id: zod.coerce.number().optional(),
          shop_id: zod.coerce.number(),
          variant_index: zod.coerce.number(),
          price: zod.coerce.number().min(0),
          cost_price: zod.preprocess(
            (v) => (v === '' || v === null || v === undefined ? undefined : v),
            zod.coerce.number().min(0).optional()
          ),
          discount: zod.preprocess(
            (v) => (v === '' || v === null || v === undefined ? undefined : v),
            zod.coerce.number().min(0).optional()
          ),
          quantity: zod.coerce.number().min(0),
        })
      )
      .optional(),

    badges: zod
      .array(zod.number())
      .default([]),

    icon_ids: zod.array(zod.coerce.number()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.vendor_scope === 'external' && (!data.vendor_id || data.vendor_id < 1)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: t('product.vendorRequiredExternal'),
        path: ['vendor_id'],
      });
    }
    const hasNew = Array.isArray(data.images) && data.images.length > 0;
    const hasKept = Array.isArray(data.existing_media_ids) && data.existing_media_ids.length > 0;
    if (!hasNew && !hasKept) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: t('product.mediaRequired'),
        path: ['images'],
      });
    }
    issueIfPercentageDiscountOver100(ctx, data.discount_type, data.discount, ['discount']);
  });

export type ProductFormValues = zod.infer<typeof ProductSchema>;
