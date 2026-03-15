import { Controller, useFormContext } from 'react-hook-form';

import { Typography } from 'src/shared/ui';

import { InfiniteScrollSelect } from '../infinite-scroll-select';

// ----------------------------------------------------------------------

export type RHFInfiniteSelectProps = {
  name: string;
  queryKey: (string | number | undefined | null)[];
  fetcher: (page: number, limit: number) => Promise<any>;
  placeholder?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  initialLabel?: string;
  /** Items per page — defaults to 10 */
  pageSize?: number;
  /** Called after the field value changes — useful for side-effects like resetting dependent fields */
  onValueChange?: (value: number) => void;
};

export function RHFInfiniteSelect({
  name,
  queryKey,
  fetcher,
  placeholder = 'Select an option',
  helperText,
  className,
  disabled,
  initialLabel,
  pageSize,
  onValueChange,
}: RHFInfiniteSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <InfiniteScrollSelect
            value={field.value || 0}
            onChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
            queryKey={queryKey}
            fetcher={fetcher}
            placeholder={placeholder}
            initialLabel={initialLabel}
            disabled={disabled}
            pageSize={pageSize}
          />
          {(error?.message || helperText) && (
            <Typography
              variant="caption"
              className={`mt-1 ${error ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {error?.message ?? helperText}
            </Typography>
          )}
        </div>
      )}
    />
  );
}
