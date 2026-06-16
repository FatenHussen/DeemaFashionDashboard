import type { FilterConfig } from '../types/page-section.types';

import { axiosInstance } from '@/api';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { Iconify } from '@/shared/components/iconify';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import {
  filterFieldLabel,
  filterOptionLabel,
} from '@/pages/dashboard/sections/utils/filter-field-label';

import { Box, Typography, SimpleSelect } from 'src/shared/ui';

// ----------------------------------------------------------------------

function DebouncedFilterInput({
  type,
  value,
  onChange,
  disabled,
  placeholder,
  label,
}: {
  type: 'text' | 'number';
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  disabled?: boolean;
  placeholder: string;
  label: string;
}) {
  const [localValue, setLocalValue] = useState(
    value != null && value !== '' ? String(value) : ''
  );
  const skipDebounceRef = useRef(true);

  useEffect(() => {
    setLocalValue(value != null && value !== '' ? String(value) : '');
  }, [value]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return () => {};
    }

    const timer = window.setTimeout(() => {
      if (type === 'number') {
        onChange(localValue ? Number(localValue) : undefined);
        return;
      }
      onChange(localValue === '' ? undefined : localValue);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [localValue, onChange, type]);

  return (
    <Box className="min-w-[180px] flex-1">
      <Typography variant="caption" className="mb-1.5 block font-medium text-muted-foreground">
        {label}
      </Typography>
      <input
        type={type}
        disabled={disabled}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        placeholder={placeholder}
      />
    </Box>
  );
}

function PagePreviewFilterField({
  filterKey,
  filterConfig,
  value,
  onChange,
  disabled,
}: {
  filterKey: string;
  filterConfig: FilterConfig;
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('table');
  const label = filterFieldLabel(t, filterKey);

  if (Array.isArray(filterConfig.items) && filterConfig.items.length > 0) {
    return (
      <Box className="min-w-[180px] flex-1">
        <Typography variant="caption" className="mb-1.5 block font-medium text-muted-foreground">
          {label}
        </Typography>
        <SimpleSelect
          fullWidth
          disabled={disabled}
          value={value != null && value !== '' ? String(value) : ''}
          onChange={(v) => {
            const nextValue = v === '' ? undefined : v;
            onChange(nextValue);
          }}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          options={filterConfig.items.map((item) => ({
            value: item,
            label: filterOptionLabel(t, String(item)),
          }))}
        />
      </Box>
    );
  }

  if (filterConfig.url) {
    const url = filterConfig.url;
    const fetcher = (page: number, limit: number) =>
      axiosInstance.get(url, { params: { page, limit } }).then((r) => {
        const responseData = r.data?.data;
        const items = responseData?.items ?? (Array.isArray(responseData) ? responseData : []);
        const pagination = responseData?.pagination ?? {
          current_page: 1,
          last_page: 1,
          per_page: items.length,
          total: items.length,
        };
        return {
          data: {
            items: items.map((item: { id: number; name?: string; title?: string }) => ({
              id: item.id,
              label:
                item.name ||
                item.title ||
                t('form.filterItemFallbackLabel', { id: item.id }),
            })),
            pagination,
          },
        };
      });

    return (
      <Box className="min-w-[200px] flex-1">
        <Typography variant="caption" className="mb-1.5 block font-medium text-muted-foreground">
          {label}
        </Typography>
        <InfiniteScrollSelect
          value={typeof value === 'number' ? value : value ? Number(value) : 0}
          onChange={(val) => {
            onChange(val > 0 ? val : undefined);
          }}
          queryKey={['page-preview-filter', url, filterKey]}
          fetcher={fetcher}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          disabled={disabled}
        />
      </Box>
    );
  }

  if (filterConfig.type === 'number') {
    return (
      <DebouncedFilterInput
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        label={label}
        placeholder={t('form.filterEnterPlaceholder', { name: label })}
      />
    );
  }

  if (filterConfig.type === 'text') {
    return (
      <DebouncedFilterInput
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        label={label}
        placeholder={t('form.filterEnterPlaceholder', { name: label })}
      />
    );
  }

  return null;
}

export function PagePreviewFilters({
  filters,
  values,
  onChange,
  onClear,
  isFetching,
}: {
  filters: Record<string, FilterConfig>;
  values: Record<string, string | number | undefined>;
  onChange: (key: string, value: string | number | undefined) => void;
  onClear: () => void;
  isFetching?: boolean;
}) {
  const { t } = useTranslation('table');
  const entries = Object.entries(filters);

  if (entries.length === 0) return null;

  const hasActiveFilters = Object.values(values).some(
    (value) => value != null && value !== ''
  );

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Iconify icon="solar:filter-bold" className="text-primary" width={20} />
          <Typography variant="subtitle2" className="font-semibold text-foreground">
            {t('form.pagePreviewFiltersHeading')}
          </Typography>
          {isFetching && (
            <Iconify icon="svg-spinners:ring-resize" className="text-muted-foreground" width={18} />
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            disabled={isFetching}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            {t('form.pagePreviewFiltersClear')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {entries.map(([filterKey, filterConfig]) => (
          <PagePreviewFilterField
            key={filterKey}
            filterKey={filterKey}
            filterConfig={filterConfig}
            value={values[filterKey]}
            onChange={(value) => onChange(filterKey, value)}
            disabled={isFetching}
          />
        ))}
      </div>
    </div>
  );
}
