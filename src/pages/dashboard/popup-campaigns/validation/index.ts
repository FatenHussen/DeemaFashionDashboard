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
    (v) => !v || zod.string().url().safeParse(v).success,
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
  show_every: zod.coerce.number().int().min(0),
  max_impressions: zod.coerce.number().int().min(0),
};

export const PopupCampaignCreateSchema = zod.object({
  ...baseFields,
  media: zod
    .custom<File | null>((v) => v === null || v instanceof File)
    .refine((v) => v instanceof File, { message: t('imageRequired') }),
});

export const PopupCampaignUpdateSchema = zod.object({
  ...baseFields,
  media: zod.custom<File | null>((v) => v === null || v instanceof File).optional(),
});

export type PopupCampaignCreateFormValues = Omit<
  zod.infer<typeof PopupCampaignCreateSchema>,
  'media'
> & { media: File | null };

export type PopupCampaignUpdateFormValues = Omit<
  zod.infer<typeof PopupCampaignUpdateSchema>,
  'media'
> & { media: File | null };
