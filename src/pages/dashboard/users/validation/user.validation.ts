import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const UserCreateSchema = z
  .object({
    name: z.string().min(1, t('user.nameRequired')),
    email: z.string().email(t('user.emailInvalid')),
    phone: z.string().optional().default(''),
    password: z.string().min(6, t('user.passwordMin')),
    password_confirmation: z.string().min(1, t('user.confirmPassword')),
    area_id: z.coerce.number().min(1, t('user.areaRequired')),
    make_affiliate: z.boolean().optional().default(false),
    affiliate_id: z.coerce.number().optional(),
    affiliate_rate: z.coerce.number().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: t('user.passwordsDoNotMatch'),
    path: ['password_confirmation'],
  })
  .superRefine((data, ctx) => {
    if (data.make_affiliate) {
      if (!data.affiliate_id || data.affiliate_id <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: t('user.affiliateIdRequired'),
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
          message: t('user.affiliateRateRequired'),
          path: ['affiliate_rate'],
        });
      }
    }
  });

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1, t('user.nameRequired')),
    email: z.string().email(t('user.emailInvalid')),
    phone: z.string().optional().default(''),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    area_id: z.coerce.number().min(1, t('user.areaRequired')),
  })
  .refine(
    (data) => {
      if (data.password) return data.password === data.password_confirmation;
      return true;
    },
    { message: t('user.passwordsDoNotMatch'), path: ['password_confirmation'] }
  );

export const UserConvertAffiliateSchema = z.object({
  affiliate_id: z.coerce.number().min(1, t('user.affiliateIdMin')),
  affiliate_rate: z.coerce.number().min(0, t('user.affiliateRateMin')),
});

export type UserCreateFormValues = z.infer<typeof UserCreateSchema>;
export type UserUpdateFormValues = z.infer<typeof UserUpdateSchema>;
export type UserConvertAffiliateFormValues = z.infer<
  typeof UserConvertAffiliateSchema
>;
