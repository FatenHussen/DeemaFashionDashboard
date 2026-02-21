import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const ProductSchema = zod.object({
  category_id: zod.number().min(1, { message: 'Category is required!' }),
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
  quantity: zod.number().min(0, { message: 'Quantity must be positive!' }),
  sku: zod.string().optional(),
  model: zod.string().optional(),
  barcode: zod.string().optional(),
  time_prepare: zod.string().optional(),
  is_instant_delivery: zod.number().min(0).max(1),
  images: zod.array(zod.instanceof(File)).optional(),

  // Variants
  variants: zod
    .array(
      zod.object({
        attributes_values_ids: zod.array(zod.number()),
        price: zod.number().min(0),
      })
    )
    .optional(),

  // Category Details
  category_details: zod
    .array(
      zod.object({
        category_detail_id: zod.number(),
        detail_value: zod.object({
          en: zod.string(),
          ar: zod.string(),
        }),
      })
    )
    .optional(),

  // Extra Details
  extra_details: zod
    .array(
      zod.object({
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
