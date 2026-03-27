import type { TFunction } from 'i18next';
import type { SectionDetails } from '@/pages/dashboard/sections/types/section.types';

export function sectionTypeLabel(
  t: TFunction<'table'>,
  type: SectionDetails['type'] | string
): string {
  if (type === 'api') return t('form.sectionTypeApi');
  if (type === 'manual') return t('form.sectionTypeManual');
  return String(type);
}
