import type { TFunction } from 'i18next';
import type { Table } from '@tanstack/react-table';
import type { NotificationFormValues } from '@/columns/one/admin-notifications/one';
import type { NotificationType } from '@/pages/dashboard/admin-notifications/types/notification.types';

import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { mergeClasses } from 'minimal-shared/utils';
import { Iconify } from '@/shared/components/iconify';
import { NOTIFICATION_TYPES } from '@/pages/dashboard/admin-notifications/types/notification.types';

// ----------------------------------------------------------------------

const AUDIENCE_KEYS: Record<string, string> = {
  all: 'form.notificationAudienceAll',
  user: 'form.notificationAudienceUser',
  driver: 'form.notificationAudienceDriver',
  vendor: 'form.notificationAudienceVendor',
};

const CHIP_RING: Record<string, string> = {
  all: 'ring-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  user: 'ring-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
  driver: 'ring-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
  vendor: 'ring-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
};

const CHIP_IDLE =
  'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/35 hover:bg-primary/[0.06]';

type Props = {
  table: Table<NotificationFormValues>;
  typeFilter: NotificationType | 'all';
  onTypeChange: (value: NotificationType | 'all') => void;
  t: TFunction<'table'>;
};

export function AdminNotificationTableFilters({
  typeFilter,
  onTypeChange,
  t,
}: Props) {
  const hasActiveFilters = typeFilter !== 'all';

  const clearAll = () => {
    onTypeChange('all');
  };

  const audienceOptions: Array<NotificationType | 'all'> = ['all', ...NOTIFICATION_TYPES.filter((type) => type !== 'all')];

  return (
    <div className="relative w-full min-w-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/25 via-transparent to-emerald-500/20 opacity-80 blur-sm"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-md">
        <div className="absolute end-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/[0.07]" />
        <div className="absolute bottom-0 start-0 h-24 w-24 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/[0.06]" />

        <div className="relative flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-5 md:p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner shadow-primary/10">
                <Iconify icon="solar:bell-bing-bold" width={22} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {t('form.notificationFiltersTitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('form.notificationFiltersHint')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-[1.15] flex-col gap-2 md:max-w-xl">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('form.notificationAudienceLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map((key) => {
                const isOn = typeFilter === key;
                const labelKey = AUDIENCE_KEYS[key];
                const label = labelKey ? t(labelKey as any) : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTypeChange(key)}
                    className={mergeClasses([
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                      isOn ? `ring-2 ${CHIP_RING[key] ?? CHIP_RING.all}` : CHIP_IDLE,
                      isOn ? 'shadow-sm' : '',
                    ])}
                  >
                    {key !== 'all' ? (
                      <span
                        className={mergeClasses([
                          'h-1.5 w-1.5 rounded-full',
                          key === 'user' ? 'bg-green-500' : '',
                          key === 'driver' ? 'bg-orange-500' : '',
                          key === 'vendor' ? 'bg-purple-500' : '',
                        ])}
                      />
                    ) : (
                      <Iconify
                        icon="solar:users-group-rounded-bold"
                        width={14}
                        className="opacity-80"
                      />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="flex shrink-0 items-center md:self-end">
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={clearAll}
                className="h-10 rounded-xl border border-destructive/25 bg-destructive/[0.08] px-4 text-destructive hover:bg-destructive/15"
              >
                <X className="me-1.5 h-4 w-4" />
                {t('clearFilters')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
