import type { TFunction } from 'i18next';
import type { FaqType } from '@/pages/dashboard/content/types/faq.types';

const KEY_BY_TYPE: Record<FaqType, string> = {
  orders: 'form.faqType_orders',
  delivery: 'form.faqType_delivery',
  payments: 'form.faqType_payments',
  account: 'form.faqType_account',
  'stores&drivers': 'form.faqType_storesDrivers',
  other: 'form.faqType_other',
};

export function faqTypeLabel(t: TFunction<'table'>, type: string) {
  const key = KEY_BY_TYPE[type as FaqType];
  return key ? t(key as 'form.faqType_orders') : type;
}
