import { Controller, useFormContext } from 'react-hook-form';
import { MultiSelect, type MultiSelectProps } from '@/shared/ui/multi-select';

// ----------------------------------------------------------------------

export type RHFMultiSelectProps = Omit<MultiSelectProps, 'value' | 'onChange'> & {
  name: string;
};

export function RHFMultiSelect({ name, helperText, ...other }: RHFMultiSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={other.className}>
          <MultiSelect
            {...other}
            value={field.value ?? []}
            onChange={field.onChange}
            error={!!error}
            helperText={error?.message ?? helperText}
          />
        </div>
      )}
    />
  );
}
