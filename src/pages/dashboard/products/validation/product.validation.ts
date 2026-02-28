import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const ProductSchema = zod.object({
  category_id: zod.number().min(1, { message: 'Category is required!' }),
  brand_id: zod.number().min(0).optional(),
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
  price: zod.number().min(0, { message: 'Price must be positive!' }),
  price_after_discount: zod.number().min(0).optional(),
  quantity: zod.number().min(0, { message: 'Quantity must be positive!' }),
  sku: zod.string().optional(),
  model: zod.string().optional(),
  barcode: zod.string().optional(),
  time_prepare: zod.string().optional(),
  is_instant_delivery: zod.number().min(0).max(1),
  images: zod.array(zod.instanceof(File)).optional(),

  // Variants - id optional (for update), images optional per variant
  variants: zod
    .array(
      zod.object({
        id: zod.number().optional(),
        attributes_values_ids: zod.array(zod.number()),
        images: zod.array(zod.instanceof(File)).optional(),
      })
    )
    .optional(),

  // Category Details - id optional (for update)
  category_details: zod
    .array(
      zod.object({
        id: zod.number().optional(),
        category_detail_id: zod.number(),
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
        id: zod.number().optional(),
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

  // Bought With
  bought_with: zod.array(zod.number()).optional(),

  // Shop Variants
  shop_variants: zod
    .array(
      zod.object({
        shop_id: zod.number(),
        variant_index: zod.number(),
        price: zod.number().min(0),
        quantity: zod.number().min(0),
      })
    )
    .optional(),
});

export type ProductFormValues = zod.infer<typeof ProductSchema>;
