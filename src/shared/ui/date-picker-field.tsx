import 'react-day-picker/style.css';

import dayjs from 'dayjs';
import * as React from 'react';
import { cn } from '@/utils/utils';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { ar, enUS } from 'react-day-picker/locale';
import { Iconify } from '@/shared/components/iconify';
import { type UiLang, fDateLocalized } from '@/utils/format-time';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

// ----------------------------------------------------------------------

export type DatePickerFieldProps = {
  value: string;
  onChange: (isoYyyyMmDd: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  placeholder,
  id,
  className,
  disabled,
}: DatePickerFieldProps) {
  const { i18n, t } = useTranslation('table');
  const [open, setOpen] = React.useState(false);

  const isAr = (i18n.language || 'en').startsWith('ar');
  const lang: UiLang = isAr ? 'ar' : 'en';
  const locale = isAr ? ar : enUS;

  const selected = React.useMemo(() => {
    const d = dayjs(value?.trim());
    return d.isValid() ? d.toDate() : undefined;
  }, [value]);

  const displayLabel =
    selected && dayjs(value).isValid()
      ? fDateLocalized(value, lang)
      : (placeholder ?? t('datePickerPlaceholder'));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 text-start text-sm text-foreground shadow-sm outline-none transition-colors',
            'hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate tabular-nums">{displayLabel}</span>
          <Iconify icon="solar:calendar-bold" width={18} className="shrink-0 text-primary/80" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[100vw] p-0" align="start" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="p-3">
          <DayPicker
            mode="single"
            locale={locale}
            dir={isAr ? 'rtl' : 'ltr'}
            numerals="latn"
            captionLayout="dropdown"
            startMonth={new Date(1950, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={(date) => {
              if (date) {
                onChange(dayjs(date).format('YYYY-MM-DD'));
                setOpen(false);
              }
            }}
          />
          <div
            className="flex items-center justify-between gap-3 border-t border-border/60 px-1 pb-1 pt-2"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {t('datePickerClear')}
            </button>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:text-primary/90"
              onClick={() => {
                onChange(dayjs().format('YYYY-MM-DD'));
                setOpen(false);
              }}
            >
              {t('datePickerToday')}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
