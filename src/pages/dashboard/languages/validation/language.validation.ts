import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

export const LanguageSchema = zod.object({
  code: zod.string().min(2, { message: t('language.codeRequired') }),
  native_name: zod.string().min(1, { message: t('language.nativeNameRequired') }),
  direction: zod.enum(['ltr', 'rtl'], { message: t('language.directionRequired') }),
  is_active: zod.boolean(),
  is_default: zod.boolean(),
  flag_icon: zod
    .custom<File | null>()
    .nullable()
    .refine((file) => {
      if (file === null) return true;
      return file.size <= MAX_FILE_SIZE;
    }, { message: t('language.fileMaxSize') })
    .refine((file) => {
      if (file === null) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, { message: t('language.fileFormat') }),
});

export type LanguageSchemaType = zod.infer<typeof LanguageSchema>;
