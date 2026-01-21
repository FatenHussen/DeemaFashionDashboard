import { z } from 'zod';

export const PageSectionSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  section_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: 'Section is required' }
  ),
  page_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: 'Page is required' }
  ),
  display_type_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: 'Display type is required' }
  ),
  position: z.enum(['before', 'after'], {
    required_error: 'Position is required',
  }),
  order: z.union([z.string(), z.number()]),
  background_color: z.string().optional(),
  background_card_color: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

export type PageSectionFormValues = z.infer<typeof PageSectionSchema>;
