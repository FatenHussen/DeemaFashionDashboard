import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/shared/ui/select';
import { Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

export type RHFSelectProps = {
  name: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  helperText?: string;
  className?: string;
};

export function RHFSelect({
  name,
  options,
  placeholder = 'Select an option',
  helperText,
  className,
}: RHFSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <Select value={field.value} onValueChange={field.onChange}>
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
      )}
    />
  );
}
