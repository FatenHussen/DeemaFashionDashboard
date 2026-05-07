import type { TFunction } from 'i18next';

export function contactMethodTypeLabel(t: TFunction<'table'>, type: string): string {
  const key = `form.contactMethodType_${type}` as const;
  const translated = t(key);
  return translated === key ? type : translated;
}
