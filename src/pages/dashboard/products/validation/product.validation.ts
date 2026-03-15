import { z as zod } from 'zod';

// ----------------------------------------------------------------------
// Use coerce for numeric fields - inputs/API often return strings

export const ProductSchema = zod.object({
  category_id: zod.coerce.number().min(1, { message: 'Category is required!' }),
  brand_id: zod.coerce.number().min(0).optional(),
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  description: zod.object({
    en: zod.string().min(1, { message: 'English description is required!' }),
    ar: zod.string().min(1, { message: 'Arabic description is required!' }),
  }),
  full_description: zod
    .object({
      en: zod.string(),
      ar: zod.string(),
    })
    .optional(),
  country: zod
    .object({
      en: zod.string(),
      ar: zod.string(),
    })
    .optional(),
  price: zod.coerce.number().min(0, { message: 'Price must be positive!' }),
  price_after_discount: zod.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    zod.coerce.number().min(0).optional()
  ),
  quantity: zod.coerce.number().min(0, { message: 'Quantity must be positive!' }),
  sku: zod.string().optional(),
  model: zod.string().optional(),
  barcode: zod.string().optional(),
  time_prepare: zod.string().optional(),
  is_instant_delivery: zod.coerce.number().min(0).max(1),
  images: zod.array(zod.instanceof(File)).optional(),

  // Variants - id optional (for update), images optional per variant
  variants: zod
    .array(
      zod.object({
        id: zod.coerce.number().optional(),
        attributes_values_ids: zod.array(zod.coerce.number()),
        images: zod.array(zod.instanceof(File)).optional(),
      })
    )
    .optional(),

  // Category Details - id optional (for update)
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

  // Extra Details - id optional (for update)
  extra_details: zod
    .array(
      zod.object({
        id: zod.coerce.number().optional(),
        detail_key: zod.object({
          en: zod.string(),
          ar: zod.string(),
        }),
        detail_value: zod.object({
          en: zod.string(),
          ar: zod.string(),
        }),
      })
    )
    .optional(),

  // Bought With - API may return strings or objects; filter to valid numbers only
  bought_with: zod
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val
          .map((v) => (typeof v === 'object' && v != null && 'id' in v ? (v as any).id : v))
          .filter((v) => v !== '' && v != null && !Number.isNaN(Number(v)))
          .map((v) => Number(v));
      },
      zod.array(zod.number()).optional()
    ),

  // Shop Variants
  shop_variants: zod
    .array(
      zod.object({
        shop_id: zod.coerce.number(),
        variant_index: zod.coerce.number(),
        price: zod.coerce.number().min(0),
        quantity: zod.coerce.number().min(0),
      })
    )
    .optional(),
});

export type ProductFormValues = zod.infer<typeof ProductSchema>;
