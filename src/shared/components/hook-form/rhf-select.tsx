import { Controller, useFormContext } from 'react-hook-form';

import { Typography } from 'src/shared/ui';
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from 'src/shared/ui/select';

// ----------------------------------------------------------------------

export type RHFSelectProps = {
  name: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
};

export function RHFSelect({
  name,
  options,
  placeholder = 'Select an option',
  helperText,
  className,
  disabled,
}: RHFSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selectValue =
          field.value === '' || field.value == null ? undefined : String(field.value);
        return (
        <div className={className}>
          <Select
            // Radix Select can stay visually empty when the controlled value is set in the same
            // tick as `reset()`. Remounting when the value changes forces the trigger to show it.
            key={`rhf-sel-${name}-${selectValue ?? 'empty'}`}
            value={selectValue}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(error?.message || helperText) && (
            <Typography
              variant="caption"
              className={`mt-1 ${error ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {error?.message ?? helperText}
            </Typography>
          )}
        </div>
        );
      }}
    />
  );
}
