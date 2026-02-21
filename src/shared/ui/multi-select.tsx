import type { MultiValue, SingleValue } from 'react-select';
import ReactSelect, { type GroupBase, type Props } from 'react-select';
import { cn } from '@/utils/utils';

// ----------------------------------------------------------------------

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  placeholder?: string;
  noOptionsMessage?: string;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  isDisabled?: boolean;
  isSearchable?: boolean;
}

// Tailwind-friendly styles for react-select
const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: 36,
    borderRadius: 8,
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--primary) / 0.2)' : 'none',
    '&:hover': { borderColor: 'hsl(var(--primary) / 0.5)' },
  }),
  menu: (base: object) => ({
    ...base,
    zIndex: 50,
    borderRadius: 8,
  }),
  multiValue: (base: object) => ({
    ...base,
    borderRadius: 6,
    backgroundColor: 'hsl(var(--primary) / 0.1)',
  }),
  multiValueLabel: (base: object) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
};

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  noOptionsMessage = 'No results found.',
  error,
  helperText,
  label,
  fullWidth,
  className,
  isDisabled,
  isSearchable = true,
}: MultiSelectProps) {
  const selectOptions: MultiSelectOption[] = options;

  const selectValue = selectOptions.filter((opt) => value.includes(opt.value));

  const handleChange = (newValue: MultiValue<MultiSelectOption>) => {
    onChange?.(newValue.map((opt) => opt.value));
  };

  return (
    <div className={cn(fullWidth && 'w-full', className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      )}
      <ReactSelect<MultiSelectOption, true, GroupBase<MultiSelectOption>>
        isMulti
        options={selectOptions}
        value={selectValue}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => noOptionsMessage}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        className={cn(fullWidth && 'w-full')}
        classNamePrefix="react-select"
        styles={{
          ...selectStyles,
          control: (base, state) => ({
            ...selectStyles.control(base, state),
            ...(error ? { borderColor: 'hsl(var(--destructive))' } : {}),
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: 'hsl(var(--primary))',
            primary75: 'hsl(var(--primary) / 0.75)',
            primary50: 'hsl(var(--primary) / 0.5)',
            primary25: 'hsl(var(--primary) / 0.25)',
            neutral0: 'hsl(var(--background))',
            neutral5: 'hsl(var(--muted))',
            neutral10: 'hsl(var(--muted))',
            neutral20: 'hsl(var(--border))',
            neutral30: 'hsl(var(--border))',
            neutral40: 'hsl(var(--muted-foreground))',
            neutral50: 'hsl(var(--muted-foreground))',
            neutral60: 'hsl(var(--muted-foreground))',
            neutral70: 'hsl(var(--foreground))',
            neutral80: 'hsl(var(--foreground))',
            neutral90: 'hsl(var(--foreground))',
          },
        })}
      />
      {helperText && (
        <p
          className={cn(
            'mt-1 text-xs',
            error ? 'text-red-600' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
