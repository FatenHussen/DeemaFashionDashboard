import { z } from 'zod';

export const UserCreateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional().default(''),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string().min(1, 'Confirm password'),
    area_id: z.coerce.number().min(1, 'Area is required'),
    make_affiliate: z.boolean().optional().default(false),
    affiliate_id: z.coerce.number().optional(),
    affiliate_rate: z.coerce.number().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .superRefine((data, ctx) => {
    if (data.make_affiliate) {
      if (!data.affiliate_id || data.affiliate_id <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Affiliate ID is required when making affiliate',
          path: ['affiliate_id'],
        });
      }
      if (
        data.affiliate_rate === undefined ||
        data.affiliate_rate === null ||
        data.affiliate_rate < 0
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Affiliate rate is required when making affiliate',
          path: ['affiliate_rate'],
        });
      }
    }
  });

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional().default(''),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    area_id: z.coerce.number().min(1, 'Area is required'),
  })
  .refine(
    (data) => {
      if (data.password) return data.password === data.password_confirmation;
      return true;
    },
    { message: 'Passwords do not match', path: ['password_confirmation'] }
  );

export const UserConvertAffiliateSchema = z.object({
  affiliate_id: z.coerce.number().min(1, 'Affiliate ID is required'),
  affiliate_rate: z.coerce.number().min(0, 'Affiliate rate is required'),
});

export type UserCreateFormValues = z.infer<typeof UserCreateSchema>;
export type UserUpdateFormValues = z.infer<typeof UserUpdateSchema>;
export type UserConvertAffiliateFormValues = z.infer<
  typeof UserConvertAffiliateSchema
>;
