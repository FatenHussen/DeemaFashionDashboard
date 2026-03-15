import { z } from 'zod';

export const UserGiftCreateSchema = z.object({
  user_id: z.coerce.number().min(1, 'User is required'),
  gift_id: z.coerce.number().min(1, 'Gift is required'),
  address_id: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  ),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  admin_notes: z.string().optional().nullable(),
});

export type UserGiftCreateFormValues = z.infer<typeof UserGiftCreateSchema>;

export const UserGiftUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  admin_notes: z.string().optional().nullable(),
});

export type UserGiftUpdateFormValues = z.infer<typeof UserGiftUpdateSchema>;
