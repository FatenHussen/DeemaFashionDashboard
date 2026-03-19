import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const UserGiftCreateSchema = z.object({
  user_id: z.coerce.number().min(1, t('userGift.userRequired')),
  gift_id: z.coerce.number().min(1, t('userGift.giftRequired')),
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
