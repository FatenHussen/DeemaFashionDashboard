import type {
  PopupCampaignType,
  PopupCampaignStatus,
  PopupCampaignMediaType,
  PopupCampaignTriggerType,
  PopupCampaignAudienceType,
} from '../types';

import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const localizedRequired = zod.object({
  en: zod.string().min(1, { message: t('titleEnRequired') }).max(500),
  ar: zod.string().min(1, { message: t('titleArRequired') }).max(500),
});

const localizedOptional = zod.object({
  en: zod.string().max(2000).optional().default(''),
  ar: zod.string().max(2000).optional().default(''),
});

const typeEnum = zod.enum(['modal', 'slide_in', 'fullscreen'] as [
  PopupCampaignType,
  ...PopupCampaignType[],
]);

const statusEnum = zod.enum(['draft', 'active', 'paused', 'archived'] as [
  PopupCampaignStatus,
  ...PopupCampaignStatus[],
]);

const mediaEnum = zod.enum(['image', 'video', 'gif'] as [
  PopupCampaignMediaType,
  ...PopupCampaignMediaType[],
]);

const audienceEnum = zod.enum([
  'all_visitors',
  'guests_only',
  'logged_in_only',
  'new_visitors',
  'returning_visitors',
] as [PopupCampaignAudienceType, ...PopupCampaignAudienceType[]]);

const triggerEnum = zod.enum(['on_load', 'delay', 'scroll', 'exit_intent'] as [
  PopupCampaignTriggerType,
  ...PopupCampaignTriggerType[],
]);

const optionalUrl = zod
  .string()
  .optional()
  .default('')
  .refine(
    (v) => {
      if (!v || !String(v).trim()) return true;
      const s = String(v).trim();
      if (zod.string().url().safeParse(s).success) return true;
      // Relative paths (e.g. /checkout?promotion_id=5) are valid for same-site CTA links
      if (s.startsWith('/')) return true;
      return false;
    },
    { message: t('popupCampaign.buttonUrlInvalid') }
  );

const baseFields = {
  title: localizedRequired,
  headline: localizedRequired,
  subheadline: localizedOptional,
  description: localizedOptional,
  slug: zod.string().min(1, { message: t('required') }).max(160),
  priority: zod.coerce.number().int().min(0).optional().default(0),
  type: typeEnum,
  status: statusEnum,
  button_text: zod.string().min(1, { message: t('required') }).max(255),
  button_url: optionalUrl,
  secondary_button_text: zod.string().max(255).optional().default(''),
  media_type: mediaEnum,
  form_enabled: zod.boolean().optional().default(false),
  form_fields: zod.array(zod.string()).optional().default([]),
  show_on_pages: zod.array(zod.string()).optional().default([]),
  audience_type: audienceEnum,
  trigger_type: triggerEnum,
  trigger_value: zod.coerce.number().int().min(0).optional().nullable().default(null),
  product_ids: zod.array(zod.coerce.number().int().positive()).optional().default([]),
  shop_ids: zod.array(zod.coerce.number().int().positive()).optional().default([]),
  recipe_ids: zod.array(zod.coerce.number().int().positive()).optional().default([]),
  promotion_ids: zod.array(zod.coerce.number().int().positive()).optional().default([]),
};

export const PopupCampaignCreateSchema = zod.object({
  ...baseFields,
  /** Unused on create (no existing asset); aligns form shape with edit mode for shared UI. */
  media_path: zod.string().max(2048).optional().default(''),
  media_file: zod.custom<File>((v) => v instanceof File, {
    message: t('required'),
  }),
});

export const PopupCampaignUpdateSchema = zod
  .object({
    ...baseFields,
    /** Existing media URL/path from API — used for preview when no new file is chosen. */
    media_path: zod.string().max(2048).optional().default(''),
    media_file: zod
      .custom<File | null | undefined>((v) => v === undefined || v === null || v instanceof File)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasExisting = Boolean(String(data.media_path ?? '').trim());
    const hasNew = data.media_file instanceof File;
    if (!hasExisting && !hasNew) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: t('required'),
        path: ['media_file'],
      });
    }
  });

export type PopupCampaignCreateFormValues = Omit<
  zod.infer<typeof PopupCampaignCreateSchema>,
  never
>;

export type PopupCampaignUpdateFormValues = Omit<
  zod.infer<typeof PopupCampaignUpdateSchema>,
  never
>;
