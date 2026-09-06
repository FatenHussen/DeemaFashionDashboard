import type { ScheduleItem } from '@/pages/dashboard/schedules/types/schedule.types';
import type { ScheduledBasketData } from '@/pages/dashboard/baskets/types/scheduled-basket.types';

import { formatTranslated } from '@/utils/format-translated';

export function resolveScheduledBasketScheduleId(
  source: ScheduledBasketData | undefined | null
): number {
  if (!source) return 0;
  const direct = Number(source.schedule_id ?? source.schedule?.id ?? 0);
  return Number.isFinite(direct) && direct > 0 ? direct : 0;
}

export function scheduleNameLabel(name: ScheduleItem['name'] | undefined | null): string {
  if (name == null) return '';
  if (typeof name === 'string') return name;
  return formatTranslated(name as { en?: string; ar?: string });
}

export function formatScheduleDiscount(
  schedule:
    | Pick<ScheduleItem, 'discount_type' | 'discount_value'>
    | null
    | undefined
): string {
  if (!schedule?.discount_type || schedule.discount_value == null) return '';
  if (schedule.discount_type === 'percentage') return `${schedule.discount_value}%`;
  return String(schedule.discount_value);
}

export function scheduleSelectLabel(schedule: ScheduleItem): string {
  const name = scheduleNameLabel(schedule.name);
  const days = schedule.interval_days != null ? String(schedule.interval_days) : '';
  const disc = formatScheduleDiscount(schedule);
  return [name, days, disc].filter(Boolean).join(' · ');
}
