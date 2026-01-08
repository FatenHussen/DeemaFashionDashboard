import type { InputProps } from 'src/shared/ui';

import { Controller, useFormContext } from 'react-hook-form';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';

import { Input } from 'src/shared/ui';

// ----------------------------------------------------------------------

export type RHFTextFieldProps = Omit<InputProps, 'name'> & {
  name: string;
};

export function RHFTextField({
  name,
  helperText,
  type = 'text',
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  const isNumberType = type === 'number';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          fullWidth
          value={isNumberType ? transformValue(field.value) : field.value ?? ''}
          onChange={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnChange(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
          }}
          onBlur={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnBlur(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
          }}
          type={isNumberType ? 'text' : type}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputMode={isNumberType ? 'decimal' : undefined}
          pattern={isNumberType ? '[0-9]*\\.?[0-9]*' : undefined}
          autoComplete="new-password" // Disable autocomplete and autofill
          {...other}
        />
      )}
    />
  );
}
