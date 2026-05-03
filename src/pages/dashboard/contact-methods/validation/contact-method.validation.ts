import { z } from 'zod';

import { CONTACT_METHOD_TYPES } from '../types/contact-method.types';

export const ContactMethodFormSchema = z.object({
  type: z.enum(CONTACT_METHOD_TYPES),
  value: z.string().trim().min(1).max(255),
  icon: z.custom<File | null>((v) => v === null || v === undefined || v instanceof File).optional(),
});

export type ContactMethodFormValues = z.infer<typeof ContactMethodFormSchema>;
