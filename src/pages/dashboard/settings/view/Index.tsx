import type { SettingItem } from '@/pages/dashboard/settings/types/setting.types';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';
import { useFetchSettings, useUpdateSetting } from '@/pages/dashboard/settings/hooks/setting';

import { CONFIG } from 'src/global-config';
import { Box, Input, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Settings | Dashboard - ${CONFIG.appName}` };

function SettingRow({ item }: { item: SettingItem }) {
  const { t } = useTranslation('table');
  const updateMutation = useUpdateSetting();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(
    item.type === 'json' || (item.type === 'boolean' && typeof item.value !== 'boolean')
      ? JSON.stringify(item.value ?? '')
      : String(item.value ?? '')
  );

  const handleSave = async () => {
    try {
      let parsed: any = value;
      if (item.type === 'boolean') parsed = value === 'true';
      else if (item.type === 'number') parsed = Number(value);
      else if (item.type === 'json') parsed = JSON.parse(value);
      await updateMutation.mutateAsync({ key: item.key, value: parsed });
      toast.success(t('form.settingsUpdatedSuccess'));
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || t('form.settingsUpdateFailed'));
    }
  };

  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{item.key}</td>
      <td className="py-3 px-4">
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.type}</span>
      </td>
      <td className="py-3 px-4 text-sm max-w-xs truncate">
        {editing ? (
          <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <span className="text-foreground">
            {item.type === 'file'
              ? item.value
                ? <a href={String(item.value)} target="_blank" rel="noreferrer" className="text-primary underline text-xs">{t('form.viewFile')}</a>
                : '—'
              : String(item.value ?? '—')}
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{item.updated_at}</td>
      <td className="py-3 px-4">
        {item.type !== 'file' && (
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {updateMutation.isPending ? t('updating') : t('form.saveChanges')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs border border-border px-3 py-1 rounded hover:bg-muted"
              >
                {t('cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Iconify icon="solar:pen-bold" width={14} />
              {t('editDetails')}
            </button>
          )
        )}
      </td>
    </tr>
  );
}

export default function Page() {
  const { t } = useTranslation('table');
  const { data, isLoading, error } = useFetchSettings();

  if (isLoading) return <LoadingScreen />;
  if (error) return (
    <Box className="flex items-center justify-center min-h-[400px]">
      <Typography variant="body1" className="text-destructive">{t('form.settingsFailedToLoad')}</Typography>
    </Box>
  );

  const items = data?.data?.items ?? [];

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="p-6">
        <Box className="flex items-center gap-3 mb-6">
          <Iconify icon="solar:settings-minimalistic-bold" width={28} className="text-primary" />
          <Box>
            <Typography variant="h5" className="font-bold">{t('form.settingsTitle')}</Typography>
            <Typography variant="body2" className="text-muted-foreground">{t('form.settingsDesc')}</Typography>
          </Box>
        </Box>
        <Box className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('form.columnKey')}</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('columns.type')}</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('form.columnValue')}</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('columns.updatedAt')}</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('form.columnActions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">{t('form.settingsNotFound')}</td>
                </tr>
              ) : (
                items.map((item) => <SettingRow key={item.key} item={item} />)
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    </>
  );
}
