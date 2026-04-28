import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const affiliateCommissionTypeSchema = z.enum([
  'percentage_order',
  'fixed_per_order',
  'percentage_selected_products',
]);

function refineAffiliateCommissionFields(
  data: {
    affiliate_commission_type: z.infer<typeof affiliateCommissionTypeSchema>;
    affiliate_rate?: number;
    affiliate_fixed_commission?: number;
    affiliate_product_ids?: number[];
  },
  ctx: z.RefinementCtx
) {
  const ty = data.affiliate_commission_type;
  if (ty === 'percentage_order' || ty === 'percentage_selected_products') {
    if (
      data.affiliate_rate === undefined ||
      data.affiliate_rate === null ||
      Number.isNaN(data.affiliate_rate) ||
      data.affiliate_rate < 0
    ) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateRateRequired'),
        path: ['affiliate_rate'],
      });
    } else if (data.affiliate_rate > 100) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateRateMax'),
        path: ['affiliate_rate'],
      });
    }
  }
  if (ty === 'fixed_per_order') {
    if (
      data.affiliate_fixed_commission === undefined ||
      data.affiliate_fixed_commission === null ||
      Number.isNaN(data.affiliate_fixed_commission) ||
      data.affiliate_fixed_commission < 0
    ) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateFixedRequired'),
        path: ['affiliate_fixed_commission'],
      });
    }
  }
  if (ty === 'percentage_selected_products') {
    if (!data.affiliate_product_ids?.length) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateProductsRequired'),
        path: ['affiliate_product_ids'],
      });
    }
  }
}

function refineVisitCommissionFields(
  data: {
    affiliate_visit_commission_enabled?: boolean;
    affiliate_visit_commission_threshold?: number;
    affiliate_visit_commission_amount?: number;
  },
  ctx: z.RefinementCtx
) {
  if (!data.affiliate_visit_commission_enabled) return;
  const th = data.affiliate_visit_commission_threshold;
  if (
    th === undefined ||
    th === null ||
    Number.isNaN(th) ||
    !Number.isFinite(th) ||
    th < 1
  ) {
    ctx.addIssue({
      code: 'custom',
      message: t('user.affiliateVisitThresholdRequired'),
      path: ['affiliate_visit_commission_threshold'],
    });
  }
  const amt = data.affiliate_visit_commission_amount;
  if (
    amt === undefined ||
    amt === null ||
    Number.isNaN(amt) ||
    !Number.isFinite(amt) ||
    amt < 0
  ) {
    ctx.addIssue({
      code: 'custom',
      message: t('user.affiliateVisitAmountRequired'),
      path: ['affiliate_visit_commission_amount'],
    });
  }
}

/** Shared commission fields for reactivate / affiliate-only saves (affiliate_id optional). */
export const AffiliateReactivateSchema = z
  .object({
    affiliate_id: z.union([z.string(), z.number()]).optional(),
    affiliate_commission_type: affiliateCommissionTypeSchema,
    affiliate_rate: z.coerce.number().optional(),
    affiliate_fixed_commission: z.coerce.number().optional(),
    affiliate_product_ids: z.array(z.coerce.number()).optional().default([]),
    affiliate_visit_commission_enabled: z.boolean().optional().default(false),
    affiliate_visit_commission_threshold: z.coerce.number().optional(),
    affiliate_visit_commission_amount: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    refineAffiliateCommissionFields(
      {
        affiliate_commission_type: data.affiliate_commission_type,
        affiliate_rate: data.affiliate_rate,
        affiliate_fixed_commission: data.affiliate_fixed_commission,
        affiliate_product_ids: data.affiliate_product_ids,
      },
      ctx
    );
    refineVisitCommissionFields(
      {
        affiliate_visit_commission_enabled: data.affiliate_visit_commission_enabled,
        affiliate_visit_commission_threshold: data.affiliate_visit_commission_threshold,
        affiliate_visit_commission_amount: data.affiliate_visit_commission_amount,
      },
      ctx
    );
  });

export const UserCreateSchema = z
  .object({
    name: z.string().min(1, t('user.nameRequired')),
    email: z.string().email(t('user.emailInvalid')),
    phone: z.string().optional().default(''),
    password: z.string().min(6, t('user.passwordMin')),
    password_confirmation: z.string().min(1, t('user.confirmPassword')),
    area_id: z.coerce.number().min(1, t('user.areaRequired')),
    make_affiliate: z.boolean().optional().default(false),
    affiliate_commission_type: affiliateCommissionTypeSchema.optional(),
    affiliate_id: z.union([z.string(), z.number()]).optional(),
    affiliate_rate: z.coerce.number().optional(),
    affiliate_fixed_commission: z.coerce.number().optional(),
    affiliate_product_ids: z.array(z.coerce.number()).optional().default([]),
    affiliate_visit_commission_enabled: z.boolean().optional().default(false),
    affiliate_visit_commission_threshold: z.coerce.number().optional(),
    affiliate_visit_commission_amount: z.coerce.number().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: t('user.passwordsDoNotMatch'),
    path: ['password_confirmation'],
  })
  .superRefine((data, ctx) => {
    if (!data.make_affiliate) return;

    if (
      data.affiliate_id === undefined ||
      data.affiliate_id === null ||
      String(data.affiliate_id).trim() === ''
    ) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateIdRequired'),
        path: ['affiliate_id'],
      });
    }
    if (!data.affiliate_commission_type) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateCommissionTypeRequired'),
        path: ['affiliate_commission_type'],
      });
      return;
    }
    refineAffiliateCommissionFields(
      {
        affiliate_commission_type: data.affiliate_commission_type,
        affiliate_rate: data.affiliate_rate,
        affiliate_fixed_commission: data.affiliate_fixed_commission,
        affiliate_product_ids: data.affiliate_product_ids,
      },
      ctx
    );
    refineVisitCommissionFields(
      {
        affiliate_visit_commission_enabled: data.affiliate_visit_commission_enabled,
        affiliate_visit_commission_threshold: data.affiliate_visit_commission_threshold,
        affiliate_visit_commission_amount: data.affiliate_visit_commission_amount,
      },
      ctx
    );
  });

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1, t('user.nameRequired')),
    email: z.string().email(t('user.emailInvalid')),
    phone: z.string().optional().default(''),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    area_id: z.coerce.number().min(1, t('user.areaRequired')),
    affiliate_commission_type: affiliateCommissionTypeSchema.optional(),
    affiliate_id: z.union([z.string(), z.number()]).optional(),
    affiliate_rate: z.coerce.number().optional(),
    affiliate_fixed_commission: z.coerce.number().optional(),
    affiliate_product_ids: z.array(z.coerce.number()).optional(),
    affiliate_visit_commission_enabled: z.boolean().optional(),
    affiliate_visit_commission_threshold: z.coerce.number().optional(),
    affiliate_visit_commission_amount: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.password) return data.password === data.password_confirmation;
      return true;
    },
    { message: t('user.passwordsDoNotMatch'), path: ['password_confirmation'] }
  )
  .superRefine((data, ctx) => {
    const hasAnyAffiliateField =
      data.affiliate_commission_type !== undefined ||
      (data.affiliate_id !== undefined &&
        data.affiliate_id !== null &&
        String(data.affiliate_id).trim() !== '') ||
      data.affiliate_rate !== undefined ||
      data.affiliate_fixed_commission !== undefined ||
      (data.affiliate_product_ids?.length ?? 0) > 0 ||
      data.affiliate_visit_commission_enabled === true ||
      data.affiliate_visit_commission_threshold !== undefined ||
      data.affiliate_visit_commission_amount !== undefined;

    if (!hasAnyAffiliateField) return;

    if (!data.affiliate_commission_type) {
      ctx.addIssue({
        code: 'custom',
        message: t('user.affiliateCommissionTypeRequired'),
        path: ['affiliate_commission_type'],
      });
      return;
    }
    refineAffiliateCommissionFields(
      {
        affiliate_commission_type: data.affiliate_commission_type,
        affiliate_rate: data.affiliate_rate,
        affiliate_fixed_commission: data.affiliate_fixed_commission,
        affiliate_product_ids: data.affiliate_product_ids,
      },
      ctx
    );
    refineVisitCommissionFields(
      {
        affiliate_visit_commission_enabled: data.affiliate_visit_commission_enabled,
        affiliate_visit_commission_threshold: data.affiliate_visit_commission_threshold,
        affiliate_visit_commission_amount: data.affiliate_visit_commission_amount,
      },
      ctx
    );
  });

export type UserCreateFormValues = z.infer<typeof UserCreateSchema>;
export type UserUpdateFormValues = z.infer<typeof UserUpdateSchema>;
export type AffiliateReactivateFormValues = z.infer<typeof AffiliateReactivateSchema>;
