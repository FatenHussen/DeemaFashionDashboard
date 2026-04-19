import type { ActivityLogItem } from '@/pages/dashboard/activity-logs/types/activity-log.types';

import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { Modal } from 'src/shared/ui/modal';
import { Button } from 'src/shared/ui/button';
import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

function isBilingualObject(v: unknown): v is { en?: unknown; ar?: unknown } {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return false;
  return keys.every((k) => k === 'en' || k === 'ar');
}

function FormatValue({ value }: { value: unknown }) {
  const { t } = useTranslation('table');

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === 'boolean') {
    return <span>{value ? t('yes') : t('no')}</span>;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return <span className="break-words">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  if (typeof value === 'object' && isBilingualObject(value)) {
    return (
      <div className="space-y-2 text-sm">
        {value.en !== undefined && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">{t('languageCodeEnShort')} </span>
            <span className="break-words">{value.en === null ? '—' : String(value.en)}</span>
          </div>
        )}
        {value.ar !== undefined && (
          <div dir="rtl" className="text-end">
            <span className="text-xs font-medium text-muted-foreground">{t('languageCodeArShort')} </span>
            <span className="break-words">{value.ar === null ? '—' : String(value.ar)}</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export type ActivityLogChangesModalProps = {
  open: boolean;
  onClose: () => void;
  log: ActivityLogItem | null;
};

export function ActivityLogChangesModal({ open, onClose, log }: ActivityLogChangesModalProps) {
  const { t } = useTranslation('table');

  const entries = log?.changes ? Object.entries(log.changes) : [];

  return (
    <Modal open={open} onClose={onClose} maxWidth="xl">
      <div
        className={mergeClasses([
          'flex max-h-[min(90vh,840px)] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl',
        ])}
      >
        <div className="border-b border-border/80 bg-muted/15 px-5 py-4 sm:px-6">
          <Typography variant="h6" className="font-semibold text-foreground">
            {t('form.activityLogChangesTitle')}
          </Typography>
          {log && (
            <>
              <Typography variant="body2" className="mt-1 text-muted-foreground">
                {log.message}
              </Typography>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono">
                  {log.model} #{log.model_id}
                </span>
                <span>{log.date}</span>
              </div>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {!log ? (
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.activityLogChangesEmpty')}
            </Typography>
          ) : entries.length === 0 ? (
            <div className="space-y-2">
              <Typography variant="body2" className="text-muted-foreground">
                {t('form.activityLogChangesEmpty')}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {t('form.activityLogChangesEmptyHint')}
              </Typography>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {entries.map(([field, pair]) => (
                <div
                  key={field}
                  className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                >
                  <Typography
                    variant="subtitle2"
                    className="mb-3 font-mono text-sm font-semibold text-primary"
                  >
                    {field}
                  </Typography>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Box>
                      <Typography
                        variant="caption"
                        className="mb-2 block font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {t('form.activityLogChangesOld')}
                      </Typography>
                      <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                        <FormatValue value={pair?.old} />
                      </div>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        className="mb-2 block font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {t('form.activityLogChangesNew')}
                      </Typography>
                      <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
                        <FormatValue value={pair?.new} />
                      </div>
                    </Box>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border/80 bg-muted/10 px-5 py-3 sm:px-6">
          <Button type="button" variant="contained" onClick={onClose}>
            {t('form.activityLogChangesClose')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
