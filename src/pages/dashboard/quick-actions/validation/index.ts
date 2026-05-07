import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const titleShape = zod.object({
  en: zod.string().min(1, { message: t('titleEnRequired') }).max(255),
  ar: zod.string().min(1, { message: t('titleArRequired') }).max(255),
});

const buttonTextShape = zod.object({
  en: zod.string().min(1, { message: t('buttonTextEnRequired') }).max(255),
  ar: zod.string().min(1, { message: t('buttonTextArRequired') }).max(255),
});

export const QuickActionCreateSchema = zod.object({
  title: titleShape,
  button_text: buttonTextShape,
  page_id: zod.string().min(1, { message: t('pageRequired') }),
  icon: zod
    .custom<File | null>((v) => v === null || v instanceof File)
    .refine((v) => v instanceof File, { message: t('imageRequired') }),
  order: zod.coerce.number().min(0).optional(),
  is_active: zod.boolean().default(true),
});

export const QuickActionUpdateSchema = zod.object({
  title: titleShape,
  button_text: buttonTextShape,
  page_id: zod.string().min(1, { message: t('pageRequired') }),
  icon: zod
    .custom<File | null>((v) => v === null || v instanceof File)
    .optional(),
  order: zod.coerce.number().min(0).optional(),
  is_active: zod.boolean().default(true),
});

export type QuickActionCreateFormValues = Omit<
  zod.infer<typeof QuickActionCreateSchema>,
  'icon'
> & { icon: File | null };

export type QuickActionUpdateFormValues = Omit<
  zod.infer<typeof QuickActionUpdateSchema>,
  'icon'
> & { icon: File | null };
