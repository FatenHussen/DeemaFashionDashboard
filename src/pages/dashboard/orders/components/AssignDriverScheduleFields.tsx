import { useTranslation } from 'react-i18next';

const fieldClassName =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-50';

type AssignDriverScheduleFieldsProps = {
  date: string;
  time: string;
  disabled?: boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

/** Optional appointment sent with driver assignment for “as soon as possible” orders. */
export function AssignDriverScheduleFields({
  date,
  time,
  disabled,
  onDateChange,
  onTimeChange,
}: AssignDriverScheduleFieldsProps) {
  const { t } = useTranslation('table');

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t('orders.assignDriverScheduleHint')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">{t('orders.scheduledDeliveryDate')}</span>
          <input
            type="date"
            value={date}
            disabled={disabled}
            onChange={(event) => onDateChange(event.target.value)}
            className={fieldClassName}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">{t('orders.scheduledDeliveryTime')}</span>
          <input
            type="time"
            step={60}
            value={time}
            disabled={disabled}
            onChange={(event) => onTimeChange(event.target.value.slice(0, 5))}
            className={fieldClassName}
          />
        </label>
      </div>
    </div>
  );
}
