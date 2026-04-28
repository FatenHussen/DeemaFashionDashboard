import type { SettingItem } from '@/pages/dashboard/settings/types/setting.types';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';
import { useMemo, useState, useEffect } from 'react';
import { compressImage } from '@/utils/compress-image';
import { useUpdateSetting } from '@/pages/dashboard/settings/hooks/setting';

import { Modal } from 'src/shared/ui/modal';
import { Button } from 'src/shared/ui/button';
import { Switch } from 'src/shared/ui/switch';
import { Box, Input, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

type EditMode = 'bilingual' | 'json' | 'boolean' | 'number' | 'color' | 'string' | 'file';

function isBilingualValue(v: unknown): v is { en?: string; ar?: string } {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return false;
  return keys.every((k) => (k === 'en' || k === 'ar') && (typeof o[k] === 'string' || o[k] === undefined));
}

function isLikelyColorSetting(item: SettingItem): boolean {
  const k = item.key.toLowerCase();
  if (k.includes('color') || k.includes('colour')) return true;
  if (item.type === 'string' && typeof item.value === 'string') {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(item.value.trim());
  }
  return false;
}

function resolveEditMode(item: SettingItem): EditMode {
  if (item.type === 'file') return 'file';
  if (item.type === 'boolean') return 'boolean';
  if (item.type === 'number') return 'number';
  if (item.type === 'json' || (item.value !== null && typeof item.value === 'object')) {
    if (isBilingualValue(item.value)) return 'bilingual';
    return 'json';
  }
  if (item.type === 'string' && isLikelyColorSetting(item)) return 'color';
  return 'string';
}

function settingValueToJsonString(item: SettingItem): string {
  const v = item.value;
  if (v !== null && typeof v === 'object') {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v ?? '');
}

function normalizeHexForColorInput(hex: string): string {
  const s = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1]!;
    const g = s[2]!;
    const b = s[3]!;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
}

// ----------------------------------------------------------------------

export type SettingEditModalProps = {
  open: boolean;
  onClose: () => void;
  item: SettingItem;
};

export function SettingEditModal({ open, onClose, item }: SettingEditModalProps) {
  const { t } = useTranslation('table');
  const updateMutation = useUpdateSetting();

  const mode = useMemo(() => resolveEditMode(item), [item]);

  const [bilingualEn, setBilingualEn] = useState('');
  const [bilingualAr, setBilingualAr] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [stringVal, setStringVal] = useState('');
  const [colorVal, setColorVal] = useState('');
  const [numberVal, setNumberVal] = useState('');
  const [boolVal, setBoolVal] = useState(false);
  const [fileDraft, setFileDraft] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === 'file') {
      setFileDraft(null);
    }

    if (mode === 'bilingual' && isBilingualValue(item.value)) {
      setBilingualEn(typeof item.value.en === 'string' ? item.value.en : '');
      setBilingualAr(typeof item.value.ar === 'string' ? item.value.ar : '');
    } else {
      setBilingualEn('');
      setBilingualAr('');
    }

    if (mode === 'json') {
      setJsonText(settingValueToJsonString(item));
    } else {
      setJsonText('');
    }

    if (mode === 'string') {
      setStringVal(item.value === null || item.value === undefined ? '' : String(item.value));
    } else {
      setStringVal('');
    }

    if (mode === 'color') {
      const s = item.value === null || item.value === undefined ? '' : String(item.value);
      setColorVal(s);
    } else {
      setColorVal('');
    }

    if (mode === 'number') {
      setNumberVal(
        item.value === null || item.value === undefined ? '' : String(Number(item.value))
      );
    } else {
      setNumberVal('');
    }

    if (mode === 'boolean') {
      setBoolVal(item.value === true || item.value === 'true');
    } else {
      setBoolVal(false);
    }
  }, [open, item.id, item.updated_at, mode, item.key, item.type, item.value]);

  const handleSave = async () => {
    try {
      if (mode === 'file') {
        if (!(fileDraft instanceof File)) {
          toast.error(t('form.settingsFileSelectRequired'));
          return;
        }
        const value =
          fileDraft.type.startsWith('image/') ? await compressImage(fileDraft) : fileDraft;
        await updateMutation.mutateAsync({ key: item.key, value, isFile: true });
        toast.success(t('form.settingsUpdatedSuccess'));
        onClose();
        return;
      }

      let parsed: unknown;

      switch (mode) {
        case 'bilingual':
          parsed = { en: bilingualEn.trim(), ar: bilingualAr.trim() };
          break;
        case 'json': {
          try {
            parsed = JSON.parse(jsonText);
          } catch {
            toast.error(t('form.settingsJsonInvalid'));
            return;
          }
          break;
        }
        case 'boolean':
          parsed = boolVal;
          break;
        case 'number': {
          const n = Number(numberVal);
          if (Number.isNaN(n)) {
            toast.error(t('form.settingsNumberInvalid'));
            return;
          }
          parsed = n;
          break;
        }
        case 'color':
        case 'string':
          parsed = mode === 'color' ? colorVal.trim() : stringVal;
          break;
        default:
          parsed = stringVal;
      }

      await updateMutation.mutateAsync({ key: item.key, value: parsed });
      toast.success(t('form.settingsUpdatedSuccess'));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t('form.settingsUpdateFailed'));
    }
  };

  const typeLabel = typeof item.type === 'string' ? item.type : String(item.type);

  return (
    <Modal open={open} onClose={onClose} maxWidth="xl">
      <div className="flex max-h-[min(88vh,820px)] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border/80 bg-muted/20 px-5 py-4 sm:px-6">
          <Typography variant="h6" className="font-semibold text-foreground">
            {t('form.settingsEditModalTitle')}
          </Typography>
          <Typography variant="body2" className="mt-1 font-mono text-sm text-muted-foreground">
            {item.key}
          </Typography>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {typeLabel}
            </span>
            <Typography variant="caption" className="text-muted-foreground">
              {t('form.settingsEditModalHint')}
            </Typography>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {mode === 'bilingual' && (
            <Box className="grid gap-4 sm:grid-cols-2">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                  {t('form.nameEn')}
                </Typography>
                <textarea
                  value={bilingualEn}
                  onChange={(e) => setBilingualEn(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                  {t('form.nameAr')}
                </Typography>
                <textarea
                  value={bilingualAr}
                  onChange={(e) => setBilingualAr(e.target.value)}
                  rows={5}
                  dir="rtl"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Box>
            </Box>
          )}

          {mode === 'json' && (
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                {t('form.settingsJsonLabel')}
              </Typography>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck={false}
                className={mergeClasses([
                  'w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2',
                  'font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30',
                ])}
              />
            </Box>
          )}

          {mode === 'string' && (
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                {t('form.columnValue')}
              </Typography>
              <textarea
                value={stringVal}
                onChange={(e) => setStringVal(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Box>
          )}

          {mode === 'color' && (
            <Box className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" className="font-medium text-foreground">
                  {t('form.settingsColorPicker')}
                </Typography>
                <input
                  type="color"
                  value={normalizeHexForColorInput(colorVal)}
                  onChange={(e) => setColorVal(e.target.value)}
                  className="h-12 w-full max-w-[120px] cursor-pointer rounded-lg border border-input bg-background p-1"
                />
              </Box>
              <Box className="min-w-0 flex-1">
                <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                  {t('form.settingsColorHex')}
                </Typography>
                <Input
                  value={colorVal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColorVal(e.target.value)}
                  placeholder="#RRGGBB"
                  className="font-mono text-sm"
                />
              </Box>
            </Box>
          )}

          {mode === 'number' && (
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                {t('form.columnValue')}
              </Typography>
              <Input
                type="number"
                value={numberVal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumberVal(e.target.value)}
                className="max-w-xs font-mono text-sm"
              />
            </Box>
          )}

          {mode === 'boolean' && (
            <Box className="rounded-lg border border-border/60 bg-muted/20 px-4 py-4">
              <Switch
                checked={boolVal}
                onChange={(e) => setBoolVal(e.target.checked)}
                label={t('form.settingsBooleanLabel')}
                helperText={t('form.settingsBooleanHelper')}
              />
            </Box>
          )}

          {mode === 'file' && (
            <Box className="flex flex-col gap-4">
              {typeof item.value === 'string' && item.value ? (
                <Box>
                  <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                    {t('form.settingsFileCurrent')}
                  </Typography>
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    {t('form.viewFile')}
                  </a>
                </Box>
              ) : null}
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-medium text-foreground">
                  {t('form.settingsFileUploadLabel')}
                </Typography>
                <Typography variant="caption" className="mb-2 block text-muted-foreground">
                  {t('form.settingsFileHelper')}
                </Typography>
                <label className="flex cursor-pointer flex-col gap-2">
                  <input
                    type="file"
                    className="text-sm file:me-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setFileDraft(f ?? null);
                    }}
                  />
                  {fileDraft ? (
                    <Typography variant="caption" className="font-mono text-foreground">
                      {fileDraft.name}
                    </Typography>
                  ) : null}
                </label>
              </Box>
            </Box>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/80 bg-muted/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outlined" onClick={onClose} disabled={updateMutation.isPending}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('updating') : t('form.saveChanges')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
