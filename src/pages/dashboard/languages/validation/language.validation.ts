import { z as zod } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

export const LanguageSchema = zod.object({
  code: zod.string().min(2, { message: 'Language code is required (min 2 characters)' }),
  native_name: zod.string().min(1, { message: 'Native name is required' }),
  direction: zod.enum(['ltr', 'rtl'], { message: 'Direction must be ltr or rtl' }),
  is_active: zod.boolean(),
  is_default: zod.boolean(),
  flag_icon: zod
    .custom<File | null>()
    .nullable()
    .refine((file) => {
      // Allow null for edit mode, but if a file is provided, validate it
      if (file === null) return true;
      return file.size <= MAX_FILE_SIZE;
    }, { message: 'File size must be less than 5MB' })
    .refine((file) => {
      // Allow null for edit mode, but if a file is provided, validate it
      if (file === null) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, { message: 'Only .jpg, .jpeg, .png, .webp and .svg formats are supported' }),
});

export type LanguageSchemaType = zod.infer<typeof LanguageSchema>;
