import type { FilterConfig } from '../types/page-section.types';

import { axiosInstance } from '@/api';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatTranslated } from '@/utils/format-translated';
import { normalizeFilterConfig } from '@/pages/dashboard/sections/utils/filter-config-normalize';
import {
  filterFieldLabel,
  filterOptionLabel,
} from '@/pages/dashboard/sections/utils/filter-field-label';

import { Box, Typography, SimpleSelect } from 'src/shared/ui';
import { InfiniteScrollSelect } from 'src/shared/components/infinite-scroll-select';

// ----------------------------------------------------------------------

export const FILTER_NULL_SENTINEL = '__NULL__';

function useResolvedFilterLabel(
  url: string | undefined,
  value: unknown,
  initialLabel?: string
): string | undefined {
  const numericId = Number(value);
  const { data } = useQuery({
    queryKey: ['filter-field-label', url, numericId],
    queryFn: async () => {
      const res = await axiosInstance.get(`${url}/${numericId}`);
      const item = res.data?.data ?? res.data;
      return (
        formatTranslated(item?.name, '') ||
        formatTranslated(item?.title, '') ||
        `#${numericId}`
      );
    },
    enabled: !!url && Number.isFinite(numericId) && numericId > 0 && !initialLabel,
    staleTime: 5 * 60 * 1000,
  });

  return initialLabel || data;
}

/**
 * Renders one filter input from a backend `FilterConfig` (number / text /
 * static select / select fed by a paginated URL). Shared by the legacy
 * page-section form and the unified page-builder wizard.
 */
export function DynamicFilterField({
  filterKey,
  filterConfig: rawFilterConfig,
  value,
  onChange,
  allowNullOption = false,
  initialLabel,
  readOnly = false,
  helperText,
}: {
  filterKey: string;
  filterConfig: FilterConfig;
  value: any;
  onChange: (value: any) => void;
  allowNullOption?: boolean;
  /** Shown when the saved id hasn't been loaded from the list yet (edit mode). */
  initialLabel?: string;
  readOnly?: boolean;
  helperText?: string;
}) {
  const { t } = useTranslation('table');
  const filterConfig = normalizeFilterConfig(filterKey, rawFilterConfig);
  const label = filterFieldLabel(t, filterKey);
  const nullOptionLabel = t('form.pageSliderFilterAllNoFilter');
  const isNullValue = allowNullOption && (value === null || value === undefined);
  const fieldHelper =
    helperText ??
    (t(`form.pageSectionFilterHelpers.${filterKey}`, { defaultValue: '' }) || undefined);

  const resolvedLabel = useResolvedFilterLabel(
    filterConfig.type === 'select' ? filterConfig.url : undefined,
    value,
    initialLabel
  );

  if (readOnly) {
    const display =
      isNullValue && allowNullOption
        ? nullOptionLabel
        : resolvedLabel || (value != null && value !== '' ? String(value) : '—');

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <Box className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <Typography variant="body2" className="font-medium text-foreground">
            {display}
          </Typography>
        </Box>
        {fieldHelper && (
          <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
            {fieldHelper}
          </Typography>
        )}
      </Box>
    );
  }

  if (filterConfig.type === 'number') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <input
          type="number"
          value={isNullValue ? '' : (value ?? '')}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
        />
        {fieldHelper && (
          <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
            {fieldHelper}
          </Typography>
        )}
      </Box>
    );
  }

  if (
    filterConfig.type === 'select' &&
    Array.isArray(filterConfig.items) &&
    filterConfig.items.length > 0
  ) {
    const options = [
      ...(allowNullOption ? [{ value: FILTER_NULL_SENTINEL, label: nullOptionLabel }] : []),
      ...filterConfig.items.map((item) => ({
        value: item,
        label: filterOptionLabel(t, String(item), filterKey),
      })),
    ];

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <SimpleSelect
          fullWidth
          value={
            isNullValue ? FILTER_NULL_SENTINEL : value != null && value !== '' ? String(value) : ''
          }
          onChange={(v) => {
            if (allowNullOption && v === FILTER_NULL_SENTINEL) {
              onChange(null);
              return;
            }
            onChange(v === '' ? undefined : v);
          }}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          options={options}
        />
        {fieldHelper && (
          <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
            {fieldHelper}
          </Typography>
        )}
      </Box>
    );
  }

  if (filterConfig.type === 'select' && filterConfig.url) {
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
            items: items.map((item: any) => ({
              id: item.id,
              label:
                formatTranslated(item.name, '') ||
                formatTranslated(item.title, '') ||
                t('form.filterItemFallbackLabel', { id: item.id }),
            })),
            pagination,
          },
        };
      });

    const numericValue = !isNullValue && value != null && value !== '' ? Number(value) : 0;

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <InfiniteScrollSelect
          value={numericValue}
          onChange={(val) => onChange(val > 0 ? val : undefined)}
          queryKey={['filter-data', url, 'infinite']}
          fetcher={fetcher}
          placeholder={t('form.filterSelectPlaceholder', { name: label })}
          initialLabel={resolvedLabel}
          nullOptionLabel={allowNullOption ? nullOptionLabel : undefined}
          isNullValue={isNullValue}
          onSelectNull={allowNullOption ? () => onChange(null) : undefined}
        />
        {fieldHelper && (
          <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
            {fieldHelper}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box className="group">
      <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
        {label}
      </Typography>
      <input
        type="text"
        value={value != null && value !== undefined ? String(value) : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={t('form.filterEnterPlaceholder', { name: label })}
      />
      {fieldHelper && (
        <Typography variant="caption" className="mt-1.5 block text-muted-foreground">
          {fieldHelper}
        </Typography>
      )}
    </Box>
  );
}
